---
sidebar_position: 4
---

# Processes

While threads allow for multiple concurrent sequences of execution to occur with the same shared memory space, a
process creates a separate memory space and isolates the execution from other processes. Interprocess concurrency is
provided by the `Pion.Concurrent.Interprocess` module.

## Creating a Process

A process can be created via several methods:

* Execution of another executable
* Invocation of a task entry-point
* Forking

Forking is the simplest way to spawn a new process. When forking, a new process is created which is a clone of the
current one. Both processes continue execution, and diverge based on whether they are the original or not.

```cpp title="Forking a Process"
Process p; // Creating a process causes a fork.
if (p == Process::Current) {
    // This process is the new fork.
    DoMyTask();
    Process::Terminate(0);
} else {
    // This process is the original.
    p.Await();
}
```

A process can also be created in a manner similar to a `Thread`, with a given entry-point. On Windows a forked process
inherits handles.

```cpp title="Creating a Process Task"
Process p([]() {
    // Execute this:
});
p.Await(); // Wait for process to end.
```

This is, in fact, a variation of forking. The process will fork, but the new process and only the new process will
run the given task, and then terminate. On Windows, such processes inherit handles.

Invoking another executable is done by providing the path to an executable and the arguments.

```cpp title="Running an Executable"
Process p("/path/to/executable", "arg1", "arg2");
p.Await();
```

In addition to these methods of spawning a process, it also possible to obtain a handle to an existing process via its
process ID.

```cpp title="Getting a Process by PID"
Process p(12345);
p.Await();
```

## Waiting on Processes

A process can be waited on by calling `Await` on the `Process` object. If the process has already terminated the call
returns immediately. An optional timeout or deadline can be provided.

Unlike a `Thread`, there is no exception propagation for processes. The `Await` call returns a `Maybe<ExitCode>` type,
where `ExitCode` is an alias for the platform-specific integer type used for exit codes. This is typically an alias of
`int`, however only values from 0 to 255 are portable, as per POSIX limitations. If the exit code could not be obtained,
the return value is empty.
