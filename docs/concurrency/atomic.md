---
sidebar_position: 1
---

# Atomic Values

The `Atomic` class provides support for atomic operations on values. An atomic value has no overhead if the type meets
the following criteria:

* The type is of a size and nature which supports hardware atomic operations.
* The type is trivially comparable (i.e. equality is by bitwise comparison).
* The type is trivially copy constructible and copy assignable.

An `Atomic` of any type which meets this criteria will be handled in a lock-free manner. Atomics take a second template
parameter which must satisfy the concept `IsMutex`, which is the type of mutex the atomic will use to synchronize access
to its value if lock-free operation is not possible. For types which are always lock-free the mutex parameter is
ignored and no mutex is stored in the atomic. If a type is trivially comparable but not trivially constructible and
assignable, then it can implemented in a lock-free but non-wait-free manner using a compare-and-swap loop.

```cpp title="Example of Atomic Use"
Atomic<Integer<>> i = 0;
Integer<> x = i;                  // A sequentially consistent load is performed here.
x = i.Load();                     // Synonymous with the above.
x = i.Load(MemoryOrder::Relaxed); // A relaxed load.
i.CompareAndSwap(10, 0);          // Atomically set to 10 if i is currently 0.
i = 20;                           // Atomic store with sequential consistency.
i.Swap(5);                        // Atomically set to 5 and return the previous value of 20.
i.FetchAdd(10);                   // Atomically add 10 to make 15, and return the old value of 5.
```

## Memory Ordering

Pion uses the C++ memory ordering model. The memory order options are defined by the `Pion::Concurrent::MemoryOrder`
enum, and these function the same as their equivalent `std::memory_order` values in the standard library. The default
memory order for any atomic operation is `MemoryOrder::Consistent`, which indicates sequential consistency, the
strongest memory order guarantee.

## Numeric Atomics

`Atomic` values of certain hardware numeric types, such as machine integers and floating point values, will have
mathematical operations. Machine integers will have fetch-add and add-fetch, fetch-sub and sub-fetch, etc. Integer types
will also have atomic logic operations such as fetch-and and and-fetch.

Floating point values do not have atomic logic operations, but do not have math operations. However, it should be noted
that their operation is typically done via a compare-and-swap loop. This makes the operations lock-free, but not
wait-free.

## Reference Counting

A specific case in which atomic operations are useful is reference counting. Pion provides a simple reference counter in
the core module, which makes it usable even without importing `Pion.Concurrent`. The reference counter is part of the
`Pion::BuildingBlocks` namespace.

```cpp title="Example of ReferenceCount"
import Pion;

using namespace Pion;
using namespace Pion::BuildingBlocks;

class RefCountedType {
public:
    RefCountedType() : refCount(new ReferenceCount<32>()) { // The default initial value of refCount is 1.
    }

    RefCountedType(const RefCountedType& other) : refCount(other.refCount) {
        refCount.Acquire();
    }

    ~RefCountedType() {
        if (!refCount.Release()) {
            delete refCount;
        }
    }

private:
    ReferenceCount<32>* refCount;
};
```

The reference count is incremented by calling `Aquire`, and released via `Release`. The return value of `Release` is
`true` if the object is still held by something (i.e. the reference count is still greater than 1), and `false` if
it is no longer held (i.e. the reference count fell to 0).

### Reference Count Range

The `ReferenceCount` template takes a non-type template parameter, which is the number of bits in the reference count
representation. This value must be either 8, 16, 32, or 64. The default value of this parameter is the word size. The
reference count is always signed, and a negative count is indicative either of overflow or of an incorrect use of
`Release`.

If the reference count has a small range, such as `ReferenceCount<8>`, the reference count may overflow. This is handled
by `Acquire` returning a `Try<>`. A failed result indicates that the reference count overflowed. When this happens
the `Acquire` call will undo its increment, bringing the value back into the acceptable range before returning. The
failed result can then be handled by the caller.

It is also possible to acquire or release by more than one at a time. When acquiring by an arbitrary count, the call
returns the actual count that it was able to acquire. If the value overflowed, then the `Acquire` call will decrement
the count by the amount of the excess that led to overflow before returning. An overflow can be detected by the call
returning a value which is less than the count that passed into it, and handled by the caller. When releasing by an
arbitrary count, the call returns `false` if the release results in a value less-than-or-equal-to 0.
