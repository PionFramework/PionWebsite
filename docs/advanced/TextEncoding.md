# Customizing Character Sets and Text Encodings

## Coded Character Sets

A **coded character set** is a mapping of code point values to the character which they represent. Pion defines a coded
character set by creating subclasses of the `CharacterSet` class. Several character sets are provided by default:

* `EmptyCharacterSet`: A character set that has no characters.
* `UniversalCharacterSet`: The character set of Unicode.

`CharacterSet` classes are responsible for validating code points, querying for character properties, and transcoding
characters between character sets. All character sets must implement, at a minimum, transcoding to and from the
`UniversalCharacterSet`, which acts as the least common denominator between all other character sets. A character set
may implement transcoding to and/or from other character sets, which can be used to optimize transcoding by avoiding the
intermediate conversion to Unicode.

Character sets can also declare that they *contain* and/or *are contained by* another character set. This allows
character sets to be treated as subsets or supersets of other sets, which allows for short circuiting some transcoding
and comparison operations between sets.

## Text Encoding Schemes

The `TextEncoding` class serves as the base class for text encoding.

## Using Custom Encodings

Custom text encodings can be used with `SimpleString` without any additional steps being required. `OpaqueString` can
only use a custom encoding if the encoding has been registered. Registration of an encoding is done by in-place
constructing it via the `TextEncoding::Register` call.

```cpp
int main() {
    TextEncoding::template Register<MyCustomEncoding>();

    // Continue program.

    return 0;
}
```

A maximum of 32 custom encodings can be registered. If a 33rd registration is attempted a
`MaximumTextEncodingSchemesReachedException` is thrown. An `Attempt` tag instance can be passed to the registration
function to get a `Try` result with the success state rather than potentially throwing an exception. It is not possible
to unregister a text encoding once it has been registered. Registration is thread-safe and reentrant, however it is
strongly recommended that all registrations be done during program initialization.

Custom text encodings cannot be used with `OpaqueString` in a constant-evaluated context, however they can with
`SimpleString`.
