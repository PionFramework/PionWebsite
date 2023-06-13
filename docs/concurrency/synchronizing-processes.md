---
sidebar_position: 6
---

# Synchronizing Processes

Several interprocess synchronization primitives are available, including mutexes and semaphores. All types follow
similar patterns for sharing themselves across processes, either by being allocated in a shared memory space or being
shared via name.

The named variants of these classes take a `String` name for the object. If no object of that name exists, it is
created. If any process has already created that type of object with the same name, then it will open the existing
object. Two processes which use an object of the same name will synchronize with each other. If the `Adopt` tag instance
is passed to the constructor then the construction will fail if an object of that name does not exist, i.e. it will not
be created if not already present.

The unnamed variants of these primitives are not managed by name by the operating system. Instead they are constructed
in place normally. To be shared with another process, the memory where they are constructed should be shared, e.g. via
the `SharedMemory` class.

:::caution

Interprocess synchronization primitives can be significantly more expensive than purely intraprocess ones, so these
types should not be used when only synchronizing threads in a single process.

:::

## Shared Monitors

The `SharedMonitor` and `SharedNamedMonitor` types provide a monitor that is useful across processes. This type is
similar to the `Monitor` type used within a process.

## Shared Mutexes

There are four interprocess mutex types available:

* `SharedMutex`
* `SharedPriorityInheritingMutex`
* `SharedNamedMutex`
* `SharedNamedPriorityInheritingMutex`

Each of these mutexes acts similar to the intraprocess mutexes. All interprocess mutexes have deadlock detection as
long as the underlying platform supports it.

## Shared Semaphores

Two interprocess semaphores are available, the `SharedSemaphore` and `SharedNamedSemaphore`. These behave identically to
the intraprocess semaphore, except for being usable across processes.

## Shared Latches

Two interprocess latches are available, the `SharedLatch` and `SharedNamedLatch`. These behave identically to an
intraprocess latch.
