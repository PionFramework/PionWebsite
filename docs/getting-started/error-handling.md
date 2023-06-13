# Error Handling

Pion has its own hierarchy of efficiently-implemented exceptions, using a base type of `Exception`. Similar to the C++
standard library, two subclasses, `RuntimeException` and `LogicException` are provided as more specific base classes.
`RuntimeException` is intended to be a base class for exceptional cases which are out of the control of the program,
such as timeouts, network issues, etc. `LogicException` is the base class for exceptions which occur as a result of
programmer error; any `LogicException` should be avoidable if the program is obeying the contracts of a function.

## Exceptions with Debug Information

Pion exceptions are barebones by default, with `Exception` and many common subtypes having no members. This keeps the
exception lightweight, which is helpful for throwing exceptions in cases of low memory, as well as ensuring minimal
overhead when an exception is returned by value rather than thrown (such as in a `Try` result type). On the other hand,
this requires the exception type alone to be able to explain the cause of the error, which is not always the case.

Several mix-in types can be used to add extended information to an existing exception type:

* The `Explained` template takes a type parameter which is the type that it will extend,
  e.g. `Explained<IllegalStateException>` extends `IllegalStateException`. `Explained` as an `Explanation` function
  which returns a string with an explanation for the error. All the parent class' constructors are available, but with
  an additional first string parameter with the cause string.
* The `Nested` template likewise extends an existing type, but accepts an `ExceptionHandle` which represents an existing
  exception which is a cause of another one. All of the parent class constructors are available, but with the additional
  `ExceptionHandle` as a first parameter. The `Cause` function allows the nested exception to be retrieved.
* The `Traced` template captures a stack trace at the point of its creation, which can be retrieved with the
  `StackTrace` member function. All the parent type's constructors are available.
* The `Debuggable` template is a convenience function which combines all of the above. The parent's constructors are
  available, with an optional additional first parameter which is the explanation, and an optional second parameter (or
  first parameter if the explanation is omitted) with the nested exception.

## Platform Exceptions

Because Pion encourages the use of exceptions as consistent error handling mechanism, it can also make a best effort to
support exposing platform-level exceptions as its own types. This feature is opt-in. To enable it, in your `main`
function, create an instance of `PlatformExceptionHandler`.

```cpp
int main() {
    PlatformExceptionHandler handler;
    // Run program.

    return 0;
}
```

The `PlatformExceptionHandler` performs the work of registering handlers for platform errors in the form of signals or
SEH exceptions, and converting them to a Pion C++ exception which is then thrown normally.

```cpp
try {
    int* i = nullptr;
    *i;
} catch (const IllegalAccessException& e) {
    // ...
}
```

:::caution

Pion makes a best effort at handling signals and converting them to exceptions. The capability of throwing from signal
handlers is not available in all compilers or on all platforms.

:::

:::danger

Although Pion can make these errors into exceptions, and therefore make them catchable, such exceptions should never be
caught to allow the program to resume. Once such an exception is thrown the program is effectively in the state of
signal handling until it terminates. Only operations you would normally do in a signal handler should be done if
catching such an exception.

:::

## Exception-free Programming

Pion can be used in a context which requires exceptions never be thrown. Every potentially-throwing function has a
non-throwing equivalent. These functions return a `Try` object which holds the result in the successful case, or one of
a variety of potential exceptions on failure. The exception-free overloads of a function typically accept a `Attempt`
tag instance as the first argument.

```cpp title="Example of an Attempt Call"
Mutex m;

// Potentially throws InterruptedException, DeadlockException, TimeoutException or SystemException.
m.LockExclusive(10s);

// Never throws.
Try<void, InterruptedException, DeadlockException, TimeoutException, SystemException> result = m.LockExclusive(Attempt, 10s);
if (result) {
    // Success
} else {
    // Has an error.
}
```

Pion's attempt call implementations never throw an exception, even internally (i.e. they are not simply wrapping
try-catch blocks).

The `Try` type can have a number of forms. `Try<>`, also known as `Try<void>`, represents a `void` return type. It
indicates success or failure but holds no value. It can be used as a more clear alternative to `Boolean` to indicate
success. Instances can be created with the `Success` or `Failure` tag instances.

```cpp
Try<> DoSomething(AttemptTag, NaturalCount count) {
    if (count == 0) {
        return Failure;
    }
    return Success;
}
```

A `Try<T>`, where `T` is a non-`void` type, either holds a value of that type on success, or holds nothing on failure.
It functions similar to a `Maybe`, but with semantics indicating that lack of a value is a failure condition. Prefer the
`Maybe` return type when empty is a valid state. A `Try<T>` can be constructed from a `Failure` for empty, but a success
requires it be constructed with arguments for constructing its value.

A `Try<T, ...>` adds one or more exception types to indicate specific errors. This type must always hold either its
successful return value or one of the indicated exception types.

### Exception-free Constructors

Constructors represent a special challenge for exception-free programming. They cannot return a value separate from the
object they construct, and there is no systematic way to indicate failure other than exceptions. To handle this, Pion
introduces a framework for implementing exception-free object construction. All of Pion's classes support this kind of
construction using the `TryMake` function. `TryMake` is a static member function of a class which can internally handle
exception-free construction and error handling, and return a `Try` result. These functions are typically `private`, and
then exposed via the non-member generic `TryMake` function template, which is designated a friend of the class.

```cpp title="Using TryMake"
template <IsAllocator Allocator = DefaultAllocator>
class MyClass {
public:
    MyClass(Data<> size) : memory(Allocate(Allocator{}, size)) {
    }

private:
    MyClass(Data<> size, [[Out]] Boolean& success) : memory(Allocate(Attempt, Allocator{}, size)) {
        success = memory != nullptr;
    }

    [[NoDiscard]] Try<MyClass, AllocationException> TryMake(Data<> size) {
        Try<MyClass, AllocationException> result;
        Boolean success;
        result.Construct(size, success);
        if (!success) {
            result.Clear();
        }
        return result;
    }

    void* memory;

    template <typename, typename... Args>
    friend auto ::Pion::TryMake(Args&&...);
};

void ExampleUse() {
    Try<MyClass, AllocationException> myClass = TryMake<MyClass>(8);
}
```

### Exception-free and Realtime Pion Profiles

Pion provides potentially-throwing and non-throwing variations of the same programs in its standard form. Where the
desire to avoid exceptions is particularly strong, e.g. in a strict realtime programming context, Pion can be built in
its exception-free profile. The exception-free profile makes the following changes:

* Any unconditionally potentially-throwing function is removed.
* Any conditionally potentially-throwing function has its `noexcept` condition changed to a `requires` contract, and it
  is made unconditionally `noexcept`.

Pion's realtime profile makes further restrictions, but remains a subset of the exception-free profile.

## Exception Best Practices

As with any C++ program, Pion-based programs should never throw from move constructors or destructors (in fact, Pion
recommends all move constructors implement shallow copy semantics, to work identical to move elision).

Library developers who wish to make Pion-compatible and Pion-style libraries should meticulously specify the `noexcept`
conditions for all functions. Any potentially-throwing function should have a non-throwing alternative as discussed in
this document.
