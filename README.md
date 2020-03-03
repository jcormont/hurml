HURML Parser
============

This module parses files that are formatted using the 'hurml' format, and provides simple tools for working with the resulting data structures. The 'hurml' format is a simple plain-text file format, which is somewhat resilient to human (user) error and is especially useful for configuration files that are meant to be changed by non-developer personnel.


## File format

'Hurml' is a line-based file format, with optional blocks that start and end with brackets.

Lines are formatted as follows (whitespace is not important in front of and at the end of lines):

- Comments start with a `#` character as the first non-whitespace symbol, and span to the end of the line.
- Properties are formatted as `Name = value`, where value can be one of the following:
  - Nothing (or whitespace), resulting in an `undefined` value;
  - A number (e.g. 1, 100, 100.1, or .1);
  - Boolean literal values `true` or `false`;
  - String values using single, double, straight *or* curly quotes, e.g. `"Hello"`, or `“world”`;
  - One or more 'tokens' (without any quotes, split on commas and semicolons). These might be assigned special meaning, but can also be converted to a string.
  - A multiline block, starting with an opening bracket (i.e. `(`), spanning all the way until the line that contains a matching closing bracket. Each block is parsed on its own, and the resulting value, object, or array is used as the property value.
- Properties can also be written in multiline format, as `[Name]`. The lines following this line determine what is assigned to this property: an object with further properties, or a list (array).
- List items start with a dash (`-`). The value after the dash symbol is parsed in the same way as for property values, and the result is appended to the 'current' array, i.e. either the global result object, an implicit 'list' property, or a list that is assigned to the previous multiline or block property.
- Single values that are not property assignments or list items are used as the value of a `name` property, *with the exception of* tokens, which are assigned to properties that have the same name as the token string.


### Examples

A simple object with property values:

```
# This results in a single object:
foo = "Bar"
number = 123
undef =
cool = true
flags = FOO_ENABLE
```

An object with a single array property:

```
# Indentation is not important
list = (
  - one
  - two
  - three
)
```

The same, using another notation:

```
[list]
- one
- two
- three
```

An object with two nested objects:

```
obj = (
nestedProperty = 123
more = stuff
)
another = (
  # again, indentation doesn't matter
  foo = "BAR"
)
```

The same, using another notation:

```
[obj]
nestedProperty = 123
more = stuff

[another]
foo = "BAR"
```

A nested list:

```
[ topLevel ]
list = (
  - (
    "First item"
    [config]
    value = 1
  )
  - (
    "Second item"
    [config]
    value = 2
  )
)
```

The JSON representation of this data structure is:

```json
{"topLevel":{"list":[{"name":"First item","value":1},{"name":"Second item","value":2}]}}
```


## Working with data

The `hurml.parse(...)` function parses a 'hurml' formatted text, and returns the corresponding data structure. This consists of an object, array, or value (string, number, or boolean), with nested properties or array elements similar to a plain JavaScript data structure. Only tokens have a separate `HurmlToken` type, which can be converted to a string using the `.toString()` method.

With this result, the following functions can be used to check and get data:

`hurml.find(data, ...path)` finds one or more values using (nested, case-insensitive) property names. Any nested arrays are flattened, and do not need to be specified in the property path.

`hurml.test(data, ...path)` tests whether the given (nested, case-insensitive) propery exists and its value is truethy.

`hurml.match(stringOrRegExp, data, ...path)` tests whether the given (nested, case-insensitive) property's value matches given string, number, boolean, or regular expression.

