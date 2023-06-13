---
sidebar_position: 7
---

# Executors

Executors are types which accept tasks and can execute them asynchronously. The simplest executor is the
`SerialExecutor`, which immediately performs a blocking execution of the provided task on the calling thread. More
advanced executors can schedule tasks in more complex ways.

When a task is provided, a `Task` object is returned as a handle to the task. Via the `Task` a job can be requested to
be canceled, waited on, the result retrieved, and its status queried.

## ThreadedExecutor

A `ThreadedExecutor` is an executor which accepts tasks and spawns a new thread for each one, executing the task on that
thread. A `ThreadedExecutor` will never have backpressure, but the cost of thread creation potentially limits its
scalability.

## ThreadPoolExecutor

The `ThreadPoolExecutor` maintains a pool of threads which sleep until tasks are submitted. When a task is received the
executor assigns it to an executor thread. The template is parameterized by a type which satsifies `IsThreadPoolPolicy`,
which defines how the pool is managed. Depending on the policy, the pool may be a fixed size. An elastic policy may
allow the pool to start with a minimum size and grow to a maximum size, and to then shrink again if too many threads are
dormant for too long.

When the submission of tasks exceeds the ability of the executor thread pool to keep up, excess tasks are submitted to
a queue. Executor threads will dequeue the next task when their current one is complete.

## ForkingExecutor

A `ForkingExecutor` runs each task in a separate process which is forked from the current one. The separate process can
be useful when full isolation of the task is desired, e.g. to make the parent process crash-safe.

## MaxConcurrencyForkingExecutor

This executor executes tasks in a forked process like `ForkingExecutor`, but only allows a finite number of processes to
run simultaneously. Excess tasks are enqueued until the next process completes.
