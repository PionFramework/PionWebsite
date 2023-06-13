---
sidebar_position: 2
---

# Threads and Tasks

## Threads

A thread is treated as an independent subprocess which is detached from the context in which it was created. When a
`Thread` is created an entry-point function is provided and the thread begins concurrently executing it. The existing
thread which created the new one will continue with its execution.

:::info

The implication of the above is that `Thread` objects will not be automatically joined when destroyed as they are with
the C++ standard library `std::thread` or `std::jthread`. They are always constructed from the start in the equivalent
of the standard library's detached state.

:::

Threads can execute any invokable type, including capturing lambdas or instances of `Function`. It is also possible to
forward arguments passed to the thread constructor to the entry-point function to avoid capture and allow the use of
plain function pointers.

```cpp title="Creating a Thread"
Thread thr([](Boolean arg1, String arg2) {
    // ...
}, true, "Hello, World!");
```

:::danger

Do not pass references to a thread, or give it a lambda which captures by reference, unless you know what you are doing.
A thread can survive the local scope of its creation, invalidating references to any local variables. The Pion compiler
plugin will warn if its static analysis finds references passed or captured in thread creation.

:::

`Thread` objects are copyable, and each copy is a handle to the same underlying thread of execution. The state
information for the thread is freed only when the reference count reaches zero.

### Waiting on Threads

To join on a thread to complete, the `Await` function can be called on a `Thread` object. Joins can optionally have a
timeout or deadline. A join call will return immediately if the thread has already completed.

Pion threads are capable of **exception propagation** through a `Await` call. If the thread terminated via an exception,
the call will throw (or return via `Try`) an instance of `Nested<TaskException>`, with the nested exception being the
one which terminated the thread.

### Cancellation

A thread can be requested to cancel its execution by calling `RequestCancellation` on the `Thread` object. Cancellation
is only possible if the thread itself cooperates. A thread must check if it has a cancellation request and react to it.

```cpp
import Pion;
import Pion.Concurrent;

using namespace Pion;
using namespace Pion::Concurrent;

void ConcurrentTask() {
    while (true) {
        if (Thread::Self::IsCancellationRequested()) { // Check if cancellation requested.
            Thread::Self::StartCancellation(); // Indicates cancelation is happening for the current thread.
            return;
        }
    }
}

int main() {
    Thread t(&ConcurrentTask);
    t.RequestCancellation();
    t.Await();

    return 0;
}

```

When a thread agrees to cancel, it should call `Thread::Self::StartCancellation()` to flag itself as canceled. This
ensures any other `Thread` objects which are handles to that thread will get a `true` response to `thread.IsCanceled()`.

### Thread Scheduling

The static function `Thread::Self::Yield` allows a thread to suspend execution. Yielding gives up the current time slice
the scheduler has given to the thread. Calling `Yield` with no arguments will yield control but allow the thread to be
rescheduled immediately. Passing a duration tells the thread to sleep for at least that period of time before being
rescheduled, and passing an instant tells it to sleep until at least that time.

`Thread::Self::Terminate` can be used to immediately terminate execution of the current thread.

:::danger

Calling `Thread::Self::Terminate` does not unwind the stack, and can therefore result in leakage of memory and other
resources.

:::

## Fork-Join Tasks

A fork-join task is similar to a thread, and does in fact spawn a new thread of execution. Unlike a `Thread`, the
`ForkJoinTask` maintains all of its state on the stack, and so the creator of the thread must own that state until the
thread completes. A `ForkJoinTask` can be waited on early, but if not waited on will be joined automatically when the
`ForkJoinTask` is destroyed. Exceptions cannot be propagated through joins which are performed via the destructor, only
when `Await` is explicitly called.

The `ForkJoinTask` supports all of the features of `Thread`, with the necessity to await completion on destruction being
the only difference. This makes the `ForkJoinTask` lighter weight in its creation and destruction than `Thread`.
