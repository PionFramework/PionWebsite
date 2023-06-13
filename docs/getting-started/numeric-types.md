---
sidebar_position: 3
---

# Numeric Types

Like raw C++, Pion has a number of primitives that are used to build up aggregate structures.

## Integral Numerics

C++ has a variety of integral types, such as `int`, `short`, `unsigned long long`, etc. Many developers will use
width-specific aliases defined in the `cstdint` header, such as `int32_t`.

All these types are valid in Pion, but their use is discouraged and considered non-"Pionic". Instead, Pion defines two
type templates, `Integer<N>` and `Natural<N>`. These two templates take a number *N* as a non-type template parameter,
which indicates the width of the integer type. For example, `Integer<32>` is a 32-bit integer. The value of *N* can be
arbitrary. `Integer<1024>` defines a 1024-bit integer, just as `Integer<19>` defines a 19-bit integer. The `Integer`
template is used for signed integral numbers, while `Natural` is used for unsigned ones. An import distinction between
these types and the core C++ integer types is that there is no arbitrary integer promotion. When two Pion integers are
operated on together, the result will be the maximum of the two bit-widths (and unsigned if either integer was
unsigned).

:::info

In implementation, `Integer` and `Natural` rely on the compiler's support for the C type `_BitInt`, and has all of the
same limitations thereof. The maximum width of a Pion integer is therefore limited to the value
of `__BITINT_MAXWIDTH__`, but this is guaranteed to always be at least 128 in any supported compiler.

:::

A number of convenience type aliases are provided:

* `Integer2`
* `Integer8`
* `Integer16`
* `Integer24`
* `Integer32`
* `Integer48`
* `Integer64`
* `Integer128`
* `Natural1`
* `Natural8`
* `Natural16`
* `Natural24`
* `Natural32`
* `Natural48`
* `Natural64`
* `Natural128`

When the compiler supports widths above 128-bit, aliases are also provided for widths of 256, 512, 1024, and 2048 if
such sizes are available.

### Integral Literals

Undecorated integer literals are still `int` by default as in raw C++, but can be assigned transparently, without
warning, to Pion integers provided the value fits within the range of the type to which it is assigned.

Explicit arbitrary-precision Pion integer literals can be specified using the `i` and `n` suffixes, indicating
`Integer` or `Natural`. These have three variations:

* For every specifically-sized type alias listed above (e.g. `Integer8` or `Natural32`) there is a corresponding
  literal of `i` or `n` followed by the size. For example, `i8` creates an `Integer8`, as in `16i8`, and `n32` creates
  a `Natural32`, as in `1000n32`. This includes literals that correspond to aliases above 128-bit size, if the target
  platform supports those sizees.
* An arbitrary precision can be specified, using a format similar to a floating point literal. The suffix is only `i` or
  `n`, but the fractional part of the literal defines the precision. For example, `100.12i` is an `Integer<12>`, and
  `1024.90n` is a `Natural<90>`.
* If the literal is in the format of a C++ integer literal and the suffix is only `i` or `n`, with no precision
  indicated by further digits in the suffix or by a fractional part of the literal, then the literal will be an
  `Integer` or `Natural` with the minimum precision needed to represent the value. For example, a `7n` will be the
  value 7 represented as a `Natural<3>`, while `8n` will be a `Natural<4>`. Note that for signed integers, this may
  result in an additional bit of precision more than necessary due to limitations with the handling of negative literal
  values, e.g. `-128i` will be an `Integer<9>`, since C++ only allows parsing the value as `128i` then applying the
  unary minus operator afterward.

In addition to these literals, the literal suffixes `ic`, `is`, and `ii`, and `ip` represent the types `IntegerCount`,
`IntegerSize`, `IntegerIndex`, and `IntegerPointer` respectively. The literal suffixes `nc`, `ns`, `ni`, and `np`
represent the types `NaturalCount`, `NaturalSize`, `NaturalIndex`, and `NaturalPointer` respectively.

:::tip

`Integer` and `Natural` function as fundamental types, including being usable as integral types as the underlying type
of an enum and as the type of a bit field. Pion implements STL support for these types as well, including `std::hash`,
`std::to_string`, and `std::numeric_limits`.

:::

## Booleans

Pion defines the type `Boolean` as indicating the binary values of `true` or `false`. This type is an alias
for `bool`. Note that `Boolean` is considered non-numeric in Pion, e.g. when queried via
`NumericTraits<Boolean>::IsNumeric` or the `IsNumeric<Boolean>` concept. A numeric boolean type can be achieved by using
`Natural1`. However, `Boolean` is implicitly convertible to primitive numeric types.

## Bytes
The type `Byte` represents a single octet. Because the C++ specification defines a number of behaviors in terms of
`std::byte`, `Byte` is in fact an alias for `std::byte`. However, Pion also allows for the `b` suffix on an integer
literal to define a byte of a specific value, e.g. `0xF0b`. It is a compile-time error for a byte literal to have a
value above `0xFF`.

## Binary Floating Point

Pion defines the `Float` template for IEEE binary floating point values. The template takes 3 non-type template
parameters: the width of the value, in bits; the number of bits used for the exponent; and the exponent bias value. The
later two template parameters can be defaulted based on the IEEE formula for standard floating point types. The most
common types used are `Float<32>` a.k.a. `Float32` and `Float<64>` a.k.a. `Float64`.

Floating point values are implemented by hardware when possible, but any arbitrary floating point type can be defined
and will be implemented in software when the architecture lacks hardware support. Some other common floating point types
are `Float<16>` a.k.a. `Float16`, `Float<128>` a.k.a. `Float128`, and `BFloat16`.

## Decimal Floating Point
Pion likewise supports IEEE decimal floating point values. These are implemented in hardware when possible but otherwise
use software implementations. Common types/aliases are `Decimal<32>`/`Decimal32`, `Decimal<64>`/`Decimal64`, and
`Decimal<128>`/`Decimal128`.

## Posit Unums and Quires

:::danger TBD

This section is TBD.

:::

## BigInteger

:::danger TBD

This section is TBD.

:::

## BigDecimal

:::danger TBD

This section is TBD.

:::

## Rational Numbers

:::danger TBD

This section is TBD.

:::

## Complex Numbers

:::danger TBD

This section is TBD.

:::
