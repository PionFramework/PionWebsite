---
sidebar_position: 5
---

# Shared Memory

Shared memory allows multiple processes to have access to the same memory space simultaneously. The `SharedMemory`
class provides a handle to such memory and a means to access it as a memory buffer. Shared memory is accessed by name;
all `SharedMemory` instances across processes will be a handle to the same memory space.

```cpp
SharedMemory shm("MySharedMemory"); // Open/create a shared memory object.
void* memory = shm.Memory;          // Access the memory.
```

The handle to the shared memory is closed when the `SharedMemory` object is destroyed.

## SharedMemoryAllocator

Any type which accepts an allocator template argument can be made to use shared memory via the `SharedMemoryAllocator`.
A shared memory allocator is constructed with the name of a shared memory object.

:::caution

The `SharedMemoryAllocator` expects to have full ownership of the shared memory space, and uses one of the other
allocators to allocate memory in this region. The shared memory object should only ever be used for a Pion
`SharedMemoryAllocator` using the same child allocator type, with ABI-compatible Pion versions in all processes.

:::
