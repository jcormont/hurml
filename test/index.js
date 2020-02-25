const hurml = require("../dist");

const inputs = [
  `
[test]
- (
array element
property = hello
)
- (
another
property = what
)

[more]
bazinga
`,
  `
  "Filename"
  People =
  - "John"
  - "Jane"

  [ details ]
  Price = 123.45
  open = true
  `
];

let results = inputs.map(s => hurml.parse(s));
console.log(JSON.stringify(results, undefined, "  "));
console.log("test.property:hello", hurml.match(results, "test.property", "hello"));
console.log("test.property:nope", hurml.match(results, "test.property", "nope"));
console.log("more:bazinga", hurml.test(results, "more.bazinga"));
console.log("people", hurml.find(results, "people"));
console.log("details.price", hurml.find(results, "details.price"));
