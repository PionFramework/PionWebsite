---
sidebar_position: 4
---

# In-place Construction

In-place construction is the construction of a value at the location it lives, without creating intermediate instances.
Constructing in-place can perform a single constructor call rather than constructing a temporary object, then calling
the copy constructor to copy it to its final destination. In-place construction is referred to as an "emplace" operation
in the C++ standard library, but the usage is different in Pion (see below).

```cpp title="In-Place Construction"
template <typename Type>
class Container {
public:
    void Set(Type value) {
        // Requires temporary construction before copy construction.
        this->value = value;
    }

    template <typename... Args>
    void SetInPlace(Args&&... args) {
        // Invokes constructor in-place, with just one constructor call.
        value.Construct(Forward<Args>(args)...);
    }

private:
    Maybe<Type> value;
};
```

Unlike the C++ standard library, Pion largely uses in-place construction as its standard operation where applicable. For
example, unlike `std::vector`'s distinction between `push_back` and `emplace_back`, the `ArrayList` type has only one
equivalent operation `Push` which is always in-place.

## Explicit In-Place Construction

In-place construction is typically implicit -- the arguments to the function are variadic templates, and they are
forwarded to the type's constructor. However, it is sometimes helpful to be explicit about in-place construction.
Pion uses the `InPlace` function to encapsulate the in-place construction of a type with potentially multiple arguments
into a single argument.

```cpp title="Implicit vs. Explicit In-Place Construction"
void DoInPlace(arg1, arg2, arg3);          // Implicit
void DoInPlace(InPlace(arg1, arg2, arg3)); // Explicit
```

Explicit in-place construction is useful where in-place construction may be ambiguous, since it can be type-checked for
overload via concepts.

```cpp title=""
template <IsInPlaceConstructorFor<MyClass> Constructor>
void Example(Constructor&& constructor) noexcept(IsNoexceptInPlaceConstructorFor<MyClass>) {
    MyClass obj = constructor;
}
```

The `InPlaceConstructor` created by calling `InPlace` can be implicitly converted to any type that is constructible with
its arguments, and satisfies the `IsInPlaceConstructorFor` concept with respect to all such classes.

Another case where explicit in-place construction is useful is to indicate multiple in-place constructions in a single
call, which would be ambiguous with a single construction of multiple arguments if relying solely on variadic arguments.
This is used by the `Tuple` constructors, for example, enabling in-place construction of multiple elements of the
`Tuple`.

```cpp title="Multiple In-Place Constructions"
Tuple<ClassA, ClassB, ClassC> t(InPlace(classAArg1, classAArg2), InPlace(classBArg1), InPlace(classCArg1, classCArg2));
```

### Explicit Choice Construction

`InPlace` creates a constructor for any compatible type, which can result in ambiguous object creation in some
instances. The `OneOf` constructor is one such example, as it is a variant type which holds one of its candidate types.
To support in-place construction where two candidates may both match the in-place arguments, the `InPlaceFor` function
is used. Where `InPlace` matches any compatible type, `InPlaceFor` matches a single specific one.

```cpp title="Using InPlaceFor"
OneOf<ClassA, ClassB, ClassC> var(InPlaceFor<ClassB>(classBArg));
```

To consume the `InPlaceForConstructor`, match the type to the `IsInPlaceConstructorForOnly` concept.

The `InPlaceAt` function similarly will limit the in-place constructor to being useful for a single index. It can be
likewise used in the case of `OneOf`. This can be helpful for types which may have multiple instances of the same type,
leaving `InPlaceFor` ambiguous. It can be matched to the concept `IsInPlaceConstructorForIndex`.

```cpp title="Using InPlaceAt"
OneOf<ClassA, ClassB, ClassC> var(InPlaceAt<1>(classBArg));
```

## Emplacement

Emplacement, in Pion, is a different concept from in-place construction. An emplace operation is an operation of a
container type which *operates on the container's ownership of an object rather than the objects it contains*. This
distinction is important because, unlike the C++ standard library, Pion allows containers to hold references. Containers
which hold references get reference semantics when performing member access.

```cpp title="Maybe with a Reference"
Integer<> x = 10;
Integer<> y = 20;
Maybe<Integer<>&> m = x;
m = y;
SystemOut.Write("{}", x); // Prints 20.
y = 30;
SystemOut.Write("{}", m.Value()); // Prints 20.
```

Without a distinct emplacement concept, the reference semantics of such containers would render it impossible to
reassign the container's member, i.e., in the reference case, change what the container refers to. Pion provides the
`Emplace` and related emplacement operations as functions which can provide value semantics even for reference
containers.

```cpp title="Maybe with a Reference Using Emplace"
Integer<> x = 10;
Integer<> y = 20;
Maybe<Integer<>&> m = x;
m.Emplace(y);
SystemOut.Write("{}", x); // Prints 10.
y = 30;
SystemOut.Write("{}", m.Value()); // Prints 30.
```
