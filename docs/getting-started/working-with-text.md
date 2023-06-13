---
sidebar_position: 5
---

# Working with Text

Pion strings are able to represent text in various character sets and encoding schemes, including various Unicode
schemes and variable-length encodings. Two templates are used, `OpaqueString` and `SimpleString`, but in most cases the
`String` type alias is used, which is an alias for the default `OpaqueString` template instantiation.

```cpp title="Example Use of String"
import Pion;
import Pion.IO;

using namespace Pion;
using namespace Pion::IO;

int main() {
    String str = "Hello, World!";

    StandardOut.Write(str);

    return 0;
}
```

## Text Encoding

Pion supports a variety of text encodings and character sets, and allows custom implementations of new ones that are not
built-in. `OpaqueString` is opaque in regards to text encoding, and so it can have any encoding, subject to some
limitations.

```cpp title="Opaque Text Encoding"
String str; // aka OpaqueString<FixedRatioGrowthPolicy<>, DefaultAllocator>

str = String("Hello, World!", Utf8);      // Assign a UTF-8 string.
str = String("Hello, World!", IsoLatin1); // Assign an ISO 8859-1 string.
str = String("Hello, World!", USAscii);   // Assign a US ASCII string.
str = String(u"Hello, World!");           // Assign a UTF-16 string.
```

The ABI of `OpaqueString` is limited to supporting 128 encodings, including the special encoding `InvalidTextEncoding`.
Currently, Pion's built-in encodings support is well within that limit. Pion sets aside space for 32 custom text
encodings that can be registered at runtime, allowing `OpaqueString` to use custom-implemented text encodings.

```cpp title="Registering Custom Encodings"
import Pion;

using namespace Pion;

int main() {
    TextEncoding::Register(MyCustomTextEncoding{});
    // or...
    TextEncoding::Register(InPlace<MyCustomTextEncoding>());

    return 0;
}
```

Unlike `OpaqueString`, `SimpleString` exposes a statically determined text encoding as part of its type, e.g.
`SimpleString<Utf8TextEncoding>`. `SimpleString` does not require custom encodings to be registered, and can support
an unlimited number of them. It does, however, require the encoding class to be default constructible. `SimpleString`
is limited to only ever holding strings in the specified encoding. If attempting to assign a string of a different
encoding, the text must be transcoded. A number of aliases are provided for certain encodings of `SimpleString`:

* `Utf8String`
* `Utf16String`
* `Utf32String`
* `USAsciiString`
* `IsoLatin1String`

```cpp title="Using a SimpleString"
Utf8String str; // aka SimpleString<Utf8TextEncoding, FixedRatioGrowthPolicy<>, DefaultAllocator>

str = "Hello, World!";   // Assigns string as UTF-8.
str = u8"Hello, World!"; // Assigns string as UTF-8.

str = Utf16String(u"Hello, World!"); // ERROR!
str = Utf16String(u"Hello, World!").Transcode(Utf8); // Converts to UTF-8 before assigning.
str = Convert<Utf8String>(Utf16String(u"Hello, World!")); // Convers to UTF-8, explicit construction by another encoding is allowed.
```

`SimpleString` and `OpaqueString` have identical capabilities other than their opaqueness in regards to text encoding.

It is generally recommended to use `OpaqueString`, particularly its `String` alias, as the standard string type.
`OpaqueString`'s overhead is typically that of a single virtual function dispatch per encoding-dependent operation,
where the compiler is not able to statically determine the encoding for optimization. However this overhead is typically
far less than the cost of transcoding strings in environments where a single encoding cannot be assumed.

Pion strings do not strictly enforce the correctness of their encoding, i.e. a string will accept invalid data for its
encoding without throwing an exception or otherwise indicating an error. A string's validity in its encoding can be
checked by calling `IsValid()` or getting an iterator to the invalid point in the string with `FindInvalid()`. Note that
these calls are always $O(n)$ time.

```cpp title="Checking String Correctness"
String str = u8"Hello, World!"s;
auto valid = str.IsValid();    // true, the string is valid.
auto iter = str.FindInvalid(); // iter is equal to str.EndIterator() since no invalid data was found.

str.SetCharacterAt(5, Character(0xFFFFFF, UniversalCharacters)); // Assign invalid character.

valid = str.IsValid();    // false due to character outside the legal Unicode code point range.
iter = str.FindInvalid(); // iter is at the point in the buffer where code point 0xFFFFFFFF is found.
```

### Unicode Support

Pion supports Unicode out-of-the-box, including the following text encoding schemes:

* UTF-8 (`Utf8TextEncoding`)
* UTF-16 LE (`Utf16LETextEncoding`)
* UTF-16 BE (`Utf16BETextEncoding`)
* UTF-32 LE (`Utf32LETextEncoding`)
* UTF-32 BE (`Utf32BETextEncoding`)

In addition, the encodings UTF-16 (`Utf16TextEncoding`) and UTF-32 (`Utf32TextEncoding`) are provided as aliases for
either the little endian or big endian variant, depending on whatever is the default for the target platform.

When creating strings from string buffers, Pion strings only allow `char8_t` to be UTF-8 encoded, `char16_t` to be
UTF-16 encoded, and `char32_t` to be UTF-32 encoded. Pointers to `char` can have their encoding specified in the
constructor for `OpaqueString`, but by default are assumed to be UTF-8. `wchar_t` can also have the encoding specified,
but defaults to either UTF-16 or UTF-32, depending on the size of `wchar_t` (UTF-16 if it is 2 bytes, UTF-32 if it is 4
bytes).

:::caution

Behavior of a Pion program which does not use UTF-8 for its execution narrow string encoding is undefined. Behavior of
a Pion program which does not use UTF-16 for its execution wide string encoding when `wchar_t` is 2 bytes, or UTF-32
when `wchar_t` is 4 bytes, is undefined. Behavior of a Pion program in which the `wchar_t` encoding does not match the
architecture's default endianness is undefined.

Clang/LLVM always demonstrates the expected behavior. GCC can be made to use the expected behavior by passing
`-fexec-charset=UTF-8 -fwide-exec-charset=UTF-32`. MSVC can be made to use the expected behavior by passing
`/execution-charset:utf-8`. Pion's CMake and xmake integrations will automatically apply these arguments.

:::

### Variable-Length Encodings

To ensure the safe and correct use of text encodings, Pion does not expose direct referential access to the code units
or bytes of a string, only by value. This ensures that, for example, you cannot overwrite a single code unit of a
surrogate pair in a UTF-16 string, resulting in an invalid character.

Access can be done by byte, code unit or code point (the size of which is determined by the encoding), or character.
The `Character` type describes single characters much like `OpaqueString` describes sequences of characters, and is
likewise character set-opaque. `Character` describes a character in its specific character set, and so can accurately
compare two characters (e.g. for equality) between two different character sets.

```cpp title="Accessing Elements of a String"
// Note this is a UTF-16 string.
String str = u"Hello, World";

Byte byte = str.ByteAt(0);                // Get the first byte of the string.
CodePoint unit = str.CodeUnitAt(0);       // Get the first code unit, which is the first 16 bits.
CodePoint codePoint = str.CodePointAt(0); // Get the first code point, which may be 16 or 32 bits since UTF-16 has surrogate pairs.
Character chr = str.CharacterAt(0);       // Get the first character of the string.

str.SetByte(Unsafe, 0, byte);             // Setting a byte requires you pass Unsafe.
str.SetCodeUnitAt(Unsafe, 0, unit);       // Setting a code unit also requires you pass Unsafe.
str.SetCodePointAt(0, codePoint);         // Setting by code point does not require Unsafe, but is not recommended.
str.SetCharacterAt(0, chr);               // Recommended way to overwrite a single character.
```

For variable-length text encodings, random access by index into the string is an $O(n)$ operation. Pion optimizes for
this when possible. If a text encoding declares itself to be fixed-width, then Pion can do a random-access lookup in
the string buffer in $O(1)$ time. Pion also inspects strings that have variable-width encodings to determine if they
are, in fact, composed entirely of characters in an encoding-defined width (typically the code unit size). If they are,
Pion flags the string as supporting random-access lookup. An example of strings which get this optimization are UTF-8
strings composed entirely of single-byte characters, or UTF-16 strings which contain no surrogate pairs.

Pion can maintain this flag even when the string is operated on, so long as all operations using another existing
string (e.g. appending one string to another) involves strings for which the fixed-width state is known. Pion makes this
determination either at compile-time (for string literals) or when the string data is first copied into the string's
buffer. However, strings which adopt a buffer at runtime (not in a string literal context) do not have this information,
until an operation is done on the string which touches the entire string from start to finish. A simple way to force
this is to get the string's length, e.g. `str.Length()`. Since getting the length of a potentially-variable-width string
must read the entire string, this will also flag the string as fixed-width if possible. Whether a given string meets the
fixed-width criteria can be determined by the `IsFixedWidth()` member function (which returns `true` if it is known to
be fixed-width, or `false` if it known to not be or if it is unknown whether it is or not).

## Copy-on-Write Sharing

Pion strings are **copy-on-write**, which means more than one string instance can share the same buffer. This feature
avoids the pessimisations that occurs when a string type must have exclusive ownership of its buffer. For example, a
`String` can wrap a string literal `const char*` that exists in the executables string table without needing to make a
copy of that string. Pion strings can also share different parts of a single string buffer; when getting a substring
Pion will return a string that points to the same buffer, but starts at a different offset within the buffer, avoiding
an unnecessary copy operation.

:::caution

It is important to note that copy-on-write does not imply thread-safe. While the internal reference counting of Pion
strings is thread-safe, actual modification of a string cannot be guaranteed thread-safe because a string could be
shared by reference, thus allowing a multithreaded access to a string which is considered to have only one owner.

:::

Copy-on-write buffers can be shared between strings with different growth policies and between `OpaqueString`s and
`SimpleString`s. They cannot be shared across strings with different allocators.

### Optimizing Writes with String Editors

When a Pion string is modified, a check is done to determine if the string is held by only a single owner. If it is,
the write is done in place, and otherwise a copy is made of the buffer to make the string exclusively owned. In certain
cases, where a string is built with a number of write calls (e.g. appending a number of times), it is redundant to
perform this check in each call since the string is guaranteed to be exclusively owned after a single write. This can
be avoided by using a **string editor**, which performs the copy-on-write functionality up front and then allows
multiple edits without any exclusivity check.

```cpp title="Using a String Editor"
void AddToString(String& str) {
    auto editor = str.Edit(); // String is checked for exclusivity.
    editor.Append("a");       // No check required on these.
    editor.Append("b");
    editor.Append("c");
}
```

String editors also allow chaining multiple calls.

```cpp title="String Editor with Call Chaining"
void AddToString(String& str) {
    str.Edit()
       .Append("a")
       .Append("b")
       .Append("c");
}
```

### String Buffer Adoption

Thanks to its copy-on-write design, Pion strings can "adopt" an existing string buffer, allowing it to operate on the
string without needing to make a copy. An adopted string buffer is treated as being never exclusively owned, and so a
copy is always made on the first write. String adoption is a useful feature for avoiding pessimisation of strings where
the string may originate as a compile-time string literal. The `Adopt` tag instance is used to trigger an adoption
overload of the string constructor.

```cpp title="String Buffer Adoption"
// str1's buffer is freshly allocated, and the string literal is copied into it.
String str1("Hello, World! This is not adopted.");

// str2's points to the actual string literal as its buffer, so no copy is made.
String str2(Adopt, "Hello, World! This one is adopted.");
```

Pion string literals, which use the `s` suffix, will always use string buffer adoption. When assigning or constructing
with a C string literal (a pure const character pointer), if the Pion compiler plugin is in use, it will detect and
optimize the String to use adoption when possible.

```cpp title="String Literal Adoption"
String str1 = "Hello, World! This string is adopted!"s;

String str2 = "Hello, World! This string is adopted only if using the compiler plugin.";
```

Adopted string buffers are not owned by the Pion string and so they are not deallocated when the String is destroyed or
when it is replaced with a copy before a write. It is the responsibility of the user to manage the original buffer.

## Short String Optimization

Pion strings support **short string optimization**, where shorter strings are stored inline within the string's stack
space, avoiding an unnecessary heap allocation. Pion supports short string allocation for strings up to 30 bytes in
size on 64-bit architectures, and 22 bytes on 32-bit architectures. Note that Pion strings do not store a null
terminator, and so no null character detracts from the space available for short string storage.

String's can be queried for whether they use short string optimization by calling `IsShort()`.

## Growth Policies

`OpaqueString` and `SimpleString` both accept a **growth policy** type as a template parameter. A growth policy, which
should implement the concept `IsGrowthPolicy`, determines how a container grows when it needs to expand a buffer. The
default growth policy for Pion strings is the `FixedRatioGrowthPolicy<2>`, which double the size of the string buffer
each time it needs to grow.

Growth policies can be stateful, in which case an instance can be in-place constructed via the string constructors. A
stateful growth policy increases the stack size of the string. A stateless growth policy takes no space in the string.

The copy-on-write feature allows strings with different growth policies to share the same string buffer, and strings
can be implicitly converted to use other growth policy types. In a copy-on-write scenario, when a copy needs to be made
for a write, the growth policy of the string instance through which the write is performed is used to determine the size
of the new buffer that string will get.

## Allocators

`OpaqueString` and `SimpleString` both accept an **allocator** type as a template parameter. The default value is
`DefaultAllocator`. A custom allocator can change how the string buffer is allocated or freed. Allocators can be
stateful, in which case the stack size of the string will increase.

Two instances of a string with different allocators cannot share the same copy-on-write buffer. Conversion between
strings with different allocator types can be done explicitly, but this will eagerly copy of the string buffer.

## `constexpr` Support

Pion strings support all major operations in a constant-evaluated context, allowing them to be used at compile time.
Compile-time strings never receive short string optimization, and thus `IsShort()` will always be `false` for them.
Strings also do not use copy-on-write optimizations at compile-time, and so `IsExclusivelyOwned()` is always `true`.

`OpaqueString` is only `constexpr`-capable when its encoding can be statically known and the encoding used is one of the
built-in encodings. Custom text encodings that need to be registered at runtime cannot be used in a constant-evaluated
context. `SimpleString`, however, is able to be `constexpr` with any text encoding, including custom ones.

## Interoperability

### Compatibility with the C++ Standard Library

Pion supports interoperability with `std::basic_string` and `std::basic_string_view`. Conversion between these types
must be explicit. For STL strings of `char8_t`, `char16_t`, and `char32_t`, the same encoding rules as for the other
constructors are enforced. For strings of `char` and `wchar_t`, the same default encodings are used, but the specific
encoding can be overwritten.

:::danger

Care should be taken when converting to or from these types, as Pion's ABI versioning guarantee does not apply to the
standard library.

:::

:::danger `std::string_view` Considered Harmful

`std::string_view` is dangerous when used with both `std::string` and Pion strings, because the string pointer can be
invalidated in unexpected ways, particularly due to short string optimization making move operations on short strings
behavior differently than long ones.

:::

### Compatibility with C

The `CString` template defines a simple pointer to a byte or character buffer, paired with a length, to represent a
string in the C sense. `CString` has no notion of text encoding; the character type is specified as its template
parameter.

When getting string data from a Pion `String` or other string type, it is returned as a `CString` to ensure the length
information is not lost.

```cpp
String str = "Hello, World!";

// Note the requirement to pass Unsafe, since further operations on the String may invalidate the pointer.
CString<Byte> cStr = str.AsCString(Unsafe);

// Once again Unsafe is required, since getting the raw pointer for the data divorces it of the needed length.
CallCApi(cStr.Data(Unsafe), cStr.Length());
```

:::danger

Pion strings do not store a null terminating character in their string buffer, and so C APIs that accept a length
argument must always be used with Pion string data. Pion avoids the null terminator because C APIs that rely on the null
character are inherently unsafe regardless, since it is legal to have a null character in the middle of a Pion string.

:::

### Native Interop

When Pion interacts with the OS through system calls or in other ways, it must work with the expected encoding. Pion
makes an effort to always use the most optimal calls which minimize transcoding. As Pion considers UTF-8 to be its
default encoding, on POSIX platforms Pion will set its text encoding to UTF-8 automatically on start. Pion will also do
this on versions of Windows which support UTF-8 (Windows 10 1903 and later; ReactOS does not support UTF-8). If this
not desired it can be undone during application start.

```cpp title="Setting the Narrow Encoding"
import Pion;

using namespace Pion;

int main() {
    // At start the default encoding is UTF-8 automatically.

    // If you don't want this, change it back to the original defaults.
    TextEncoding::UseSystemDefaultEncoding();

    // If you change your mind, go back to UTF-8.
    TextEncoding::UseDefaultUtf8();

    return 0;
}
```

:::caution

The default narrow encoding should not be changed once the program has initialized.

:::

When Pion receives a string back from a native API, it will keep it in the encoding in which it was provided. When a
string must be sent to the native API, it will be converted to the expected encoding, unless it is already in that
encoding or in a compatible one (e.g. it is possible to pass an ISO 8859-1 string when UTF-8 is expected without
transcoding, since UTF-8 is a superset of ISO 8859-1).

On Windows, Pion will prefer the ANSI version of APIs when the current ANSI code page is UTF-8 and when the strings
being passed are not encoded in UTF-16 LE. If the string is encoded in UTF-16 LE the wide version of the API is used to
avoid transcoding. If the ANSI code page is not UTF-8 and the string being passed would require transcoding, then the
string is transcoded to UTF-16 LE and the wide version of the API is used.
