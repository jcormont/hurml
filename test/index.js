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
`
];

let results = inputs.map(s => hurml.parse(s));
console.log(JSON.stringify(results, undefined, "  "));
console.log("test.property:hello", hurml.match(results, "test.property", "hello"));
console.log("test.property:nope", hurml.match(results, "test.property", "nope"));
console.log("more:bazinga", hurml.match(results, "more", "bazinga"));
