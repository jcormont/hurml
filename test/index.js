const hurml = require("../dist");
const assert = require("./assert");

const inputs = [
  `
    # This is the first test
    [test]
    - (
    array element
    property = hello, world, tokens
    )
    - (
      # Indentation should not matter
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
    - “Word’

    # surrounding whitespace also doesn’t matter
    [ details ]
    Price = 123.45
    half = .5
    open = true
  `
];

let a, b;
let results = ([a, b] = inputs.map(s => hurml.parse(s)));
assert("Find operation should be case insensitive", () => {
  return hurml.find(a, "Test") === hurml.find(a, "test");
});
assert("Array should contain correct number of elements", () => {
  return Array.isArray(hurml.find(b, "people")) && hurml.find(b, "people").length === 3;
});
assert("Number should be parsed as number type", () => {
  return typeof hurml.find(b, "details", "price") === "number";
});
assert("Numbers should be parsed correctly", () => {
  return hurml.find(b, "details", "price") === 123.45;
});
assert("Numbers without leading digit should be parsed correctly", () => {
  return hurml.find(b, "details", "half") === 0.5;
});
assert("Strings with curly quotes should be parsed correctly", () => {
  return hurml.find(b, "people")[2] === "Word";
});
assert("Boolean should be parsed as boolean type", () => {
  return typeof hurml.find(b, "details", "open") === "boolean";
});
assert("Tokens should be parsed as token type", () => {
  return hurml.find(a, "more", "bazinga").token;
});
assert("Matching string value should compare exact value", () => {
  return hurml.match("Filename", results, "name");
});
assert("Matching string value should match case-sensitively", () => {
  return !hurml.match("filename", results, "name");
});
assert("Matching regexp should test all values of an array", () => {
  return hurml.match(/^word/i, results, "People");
});
assert("Matching token should compare case-insensitive string", () => {
  return hurml.match("HellO", results, "test", "property");
});
assert("Testing tokens should return true", () => {
  return hurml.test(results, "more", "bazinga");
});
assert("Testing other values should return boolean result", () => {
  return hurml.test(results, "details", "price");
});
