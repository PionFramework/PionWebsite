---
sidebar_position: 3
---

# Synchronizing Threads

## Monitors

Monitors are extensions of atomics which add the ability to use the atomic value as a queue of waiting threads, and
to notify those threads to wake. To wait on a monitor, you can call `Await`. This operation takes a value to which the
current atomic value is atomically compared. The atomic is expected to be equal to that value, and if so, the thread
is suspended and added to the monitor's queue. If the atomic is no longer equal to the expected value, the call returns
immediately. A timeout or deadline time can also be provided.

```cpp title="Waiting on a Monitor"
Monitor<Natural<>> a = 10;

void Wait() {
    a.Await(10); // Thread suspends if a is still equal to 10.
}

void Wake() {
    a.NotifyOne(); // Awaken one thread waiting on a.
}
```

Threads waiting on a monitor can be awoken by using `NotifyOne`, `NotifyAll`, or `NotifyAtLeast`. `NotifyOne` will
wake a single thread, and `NotifyAll` will wake all threads. `NotifyAtLeast` is guaranteed to wake the number of
threads provided as its argument, but may wake more, depending on the platform (if the platform does not support
waking an arbitrary number of waiters). It is recommended to prefer the one/all notification functions over making an
equivalent call to `NotifyAtLeast` as there may be some overhead from argument checking in the later.

The best performance with a monitor comes from using a **platform-waitable** atomic type. These are types that can be
used to integrate with waiting functionality provided by the operating system. When a monitor is platform-waitable there
is no overhead for the type compared to an `Atomic` value. If the monitor is not platform-waitable, then the monitor
will store not only the atomic value but also will contain its own queue and other synchronization primitives necessary
to implement the waiting functionality.

:::info

As described above, a non-platform-waitable monitor stores its own queue. Note that this is different from how wait and
notify are implemented for `std::atomic` in the standard library, where there is a separate waiter queue pool allocated
for these types at the time they are first used for waiting. The Pion implementation is more efficient as there is no
dynamic allocation or hash table lookups, but keep in mind this means non-platform-waitable monitors hold additional
component structures and are of a different size than their `Atomic` equivalent.

To get a platform-waitable integer monitor, you can use the following type aliases:

* `SmallestPlatformMonitor`
* `SmallPlatformMonitor`
* `WordPlatformMonitor`
* `LargestPlatformMonitor`

:::

### Customizing Monitors Queuing

Monitors take an additional template parameter, a type which should satisfy `IsQueue`. This is the type used to enqueue
waiting threads if the monitor is not platform-waitable. If the type is platform-waitable, this template parameter is
ignored and no queue is constructed as part of the monitor.

## Mutexes

A mutex allows exclusive access to a resource by a single thread. The simplest mutex type available is the `Mutex`.
A `Mutex` allows exclusive locking, with an optional timeout or deadline. `Mutex` is not guaranteed to detect deadlocks
or incorrect unlocking.

```cpp title="Example of a Mutex"
Mutex<> m;

void Example() {
    m.LockExclusive();
    // Do something
    m.UnlockExclusive();
}
```

A `RecursiveMutex` is similar to `Mutex`, but allows the thread which holds the lock to lock the mutex again without
causing a deadlock. The mutex must be released the same number of times that the lock was acquired by its current owner
before the lock is released. The `RecursiveMutex` can check for deadlocks and improper unlocking, and will throw or
return a failed `Try` in those cases.

The `ReadWriteMutex` allows multiple threads to acquire a shared lock, while only one thread can acquire an exclusive
lock (exclusive to other exclusive locks as well as shared locks). It adds the `LockShared()` and `UnlockShared()`
counterparts to the standard `LockExclusive()` and `UnlockExclusive()` functions. The `ReadWriteMutex` detects deadlocks
and improper unlocking of the exclusive lock, but not shared locks. Read-write mutexes can optionally, via a template
parameter, specify whether to prioritize exclusive locks. If so, if a thread is waiting on shared locks to acquire an
exclusive lock, subsequent threads attempting to acquire shared locks will block until the exclusive lock has been
acquired and released.

### Priority Inheritance

**Priority inheritance** is the property of a synchronization primitive in which the thread or threads which hold the
resource have their priority raised to the highest priority of any thread which is waiting on the resource. This
prevents **priority inversion**, in which a high priority thread is waiting on a low priority thread to release a
resource, thus effectively treating the higher priority thread as having the lower priority.

The `PriorityInheritingMutex` is a variant of `Mutex` which guarantees a best effort at being priority inheriting. When
the platform can support priority inheritance, it will use that mechanism to implement the mutex. If the platform does
not support priority inheritance then this mutex will function identically to `Mutex`.

:::tip

If Pion is compiled in the realtime profile, `Mutex` will be implemented by `PriorityInheritingMutex`, making it
priority-inheriting as well. Whether any synchronization primitive is priority-inheriting or not can be checked with
the static boolean member `IsPriorityInheriting`.

:::

The `PriorityInheritingRecursiveMutex` class is also available. All priority-inheriting mutexes detect deadlock and
incorrect unlocking.

### Blocking Policies

Most mutex types are templates which take a type parameter which satisfies `IsBlockingPolicy`. The blocking policy
determines how the mutex blocks when the lock cannot be acquired. The default policy is the `AlwaysAwaitBlockingPolicy`,
which immediately waits using the most efficient platform-supported method. The `AlwaysSpinBlockingPolicy` can be used
to make a spin mutex, in which threads that are waiting to acquire the lock do not yield and continue to spin in an
attempt to acquire the lock. The `SpinWithBackoffBlockingPolicy` performs a spin, but after a certain number of spins
(determined by its non-type template parameters) will yield (but not wait to be notified). After each yield the number
of spins before the next yield will be reduced by the backoff factor, down to some minimum. The `AdaptiveBlockingPolicy`
is a similar policy, but waits for notification rather than yielding after each cycle of spinning.

```cpp title="Example of a Recursive Spin Lock"
RecursiveMutex<AlwaysSpinBlockingPolicy> m;

void Example() {
    m.LockExclusive();
    // Do something.
    m.UnlockExclusive();
}
```

:::caution

Use of spin locks is discouraged, as there is no way for the operating system's scheduler to know there are waiting
threads, which tends to worsen performance. If some degree of spinning is desirable, the `AdaptiveBlockingPolicy` with
a relatively low amount of spin is recommended.

:::

Priority-inheriting mutexes do not support customization of blocking policies.

### Scoped Locks

Several scoped locks can be used to safely hold a lock of a mutex and guarantee its release. The `ExclusiveLock` is a
lock which takes the exclusive lock on a mutex. Similarly, the `SharedLock` acquires a shared lock on a
`ReadWriteMutex`.

```cpp title="Example of Using ExclusiveLock"
Mutex<> m;
ArrayList<String> strings;

void AddString(const String& str) {
    ExclusiveLock lock(m);
    strings.Push(str);
}
```

`ExclusiveLock` and `SharedLock` can be explicitly unlocked by calling `Unlock` before they leave scope. It is also
possible to create them without locking. To create a lock without acquiring it, pass the `Adopt` tag instance to the
constructor. You can also pass `Attempt` to try-lock, which acquires the lock if possible but continues without
acquiring it otherwise. Whether the lock type holds the mutex's lock can be queried with `HoldsLock()`.

When more basic functionality is needed, the `SimpleExclusiveLock` and `SimpleSharedLock` do not have the ability to
be created without acquiring the lock, or to be unlocked before destruction. Their lack of features come with the
benefit of potentially lower overhead.

:::tip

It is recommended to always use scoped locks to acquire a lock on a mutex. This ensures the proper release of the lock
even in the case of exceptions.

:::

### Synchronization Mixins

The `Synchronized` template allows a mutex (or other synchronization primitive) to be mixed into another type.

```cpp title="Example of Synchronized"
Synchronized<ArrayList<Boolean>> list;
list.LockExclusive();
list.UnlockExclusive();
```

The first template parameter is the type into which the synchronization is mixed. The second parameter is the
synchronization primitive to mix in (which defaults to `Mutex`). The synchronization primitive must be
default-constructible.

## Semaphores

A `Semaphore` is a generalization of a mutex, which allows a number of threads to concurrently access a resource. The
`Semaphore` template takes as its non-type template parameter the number of bits used to store its current value.

A `Semaphore` uses the verbs `Acquire`/`Release`, unlike a mutex. This ensures that a semaphore is not considered a
mutex for the purposes of the `IsMutex` concept (rather it satisfies the `IsSemaphore` concept).

```cpp title="Example of a Semaphore"
Synchronized<RingBufferQueue<String>> messageQueue;
Semaphore<64> sem = 0;

void Produce(const String& message) {
    ExclusiveLock lock(messageQueue);
    messageQueue.Push(message);

    // Add an available resource to the queue.
    sem.Release();
}

String Consume() {
    // Block until queue has content for this thread.
    sem.Acquire();

    ExclusiveLock lock(messageQueue);
    return messageQueue.Poll();
}
```

Semaphores do not work with the standard scoped locks, which work on an `IsMutex`-satisfying type. Instead they can use
the `ResourceHold`, which acquires the semaphore and releases it when it leaves scope. This pattern is less common with
semaphores than with mutexes.

Semaphores accept a template argument for their blocking policy, similar to a mutex.

## Conditions

A `Condition` is a synchronization primitive that allows a number of threads to wait until a condition is met.
Conditions are created with an associated mutex used to synchronize the use of the condition. When the condition
represented is first checked, a scoped `ConditionLock` is used with the `Condition`, which acquires an exclusive lock on
its associated mutex. The lock can be waited on with the `Await` function.

```cpp title="Using a Condition"
template <NaturalCount Capacity>
class BlockingBoundedQueue {
public:
    BlockingBoundedQueue() : notFull(mutex), notEmpty(mutex) {
    }

    void Put(String str) {
        ConditionLock lock(notFull);
        while (count == items.length) {
            notFull.Await();
        }
        buffer[putIndex] = x;
        if (++putIndex == Capacity) {
            putIndex = 0;
        }
        ++size;
        notEmpty.NotifyOne();
    }

    [[NoDiscard]] String Get() {
        ConditionLock lock(notEmpty);
        while (!count) {
            notEmpty.Await();
        }
        String result = buffer[getIndex];
        if (++getIndex == Capacity) {
            getIndex = 0;
        }
        --size;
        notFull.NotifyOne();
        return result;
    }

private:
    String buffer[Capacity];
    Mutex<> mutex;
    Condition<Mutex<>> notFull;
    Condition<Mutex<>> notEmpty;
    NaturalCount size;
    NaturalIndex putIndex;
    NaturalIndex getIndex;
};
```

## Latches and Barriers

A `Latch` is a type which allows threads through when its value is 0, but otherwise causes threads to wait on it until
its value reaches 0. Once the latch reaches 0 it remains at that state and threads continue to pass. Latches can be
waited on by calling `Await()`, or counted down by calling `CountDown()`. The function `Arrive()` is a function which
will count down and then wait (assuming it has not reached 0). Latches can be customized with a blocking policy.

```cpp
Atomic<Boolean> isInitialized;
static inline Latch<> initLatch = 1;

void EnsureInitialized() {
    if (isInitialized.TestAndSet()) {
        // Only one thread can enter here to do the initialization.
        DoInit();

        // Release all waiting threads.
        initLatch.CountDown();
    } else {
        // All other threads wait to return until initialization is done.
        initLatch.Await();
    }
}
```

A `Barrier` is similar to a `Latch`, except that when it reaches 0 it wakes all the threads waiting on it, then resets
to its default value, causing subsequent threads which await it to suspend until it again reaches 0. Barriers can be
customized with a blocking policy.
