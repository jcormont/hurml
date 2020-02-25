import { parseSection, HurmlValue, HurmlObject } from "./parse";

/** Get the value from given (nested) property; any arrays (lists) are flattened while traversing the data structure */
export function find(data: HurmlValue, path: string): HurmlValue {
  let result = data;
  while (path && path.length) {
    if (Array.isArray(result)) {
      // flatten array results
      let map: HurmlValue[] = [];
      for (let v of result.map(v => find(v, path))) {
        if (Array.isArray(v)) map.push(...v);
        else map.push(v);
      }
      return map;
    } else if (result instanceof HurmlObject) {
      // take closest property value
      let idx = path.indexOf(".");
      let p = idx >= 0 ? path.slice(0, idx) : path;
      path = path.slice(p.length + 1);
      result = result[p];
      continue;
    }
    return undefined;
  }
  return result;
}

/** Match given string value with the value of given (nested) property; any arrays (lists) are flattened while traversing the data structure */
export function match(data: HurmlValue, path: string, s: string): boolean {
  let value = find(data, path);
  if (Array.isArray(value)) {
    // check if any element matches
    return value.some(v => match(v, "", s));
  }
  if (value instanceof HurmlObject) {
    // check for property with this name
    return !!value[s];
  }

  // check value itself
  return value !== undefined && String(value) === s;
}

/** Test if the value of given (nested) property is *not* false, undefined, 0, or empty string; any arrays (lists) are flattened while traversing the data structure */
export function test(data: HurmlValue, path = ""): boolean {
  let value = find(data, path);
  if (Array.isArray(value)) {
    // check if any element matches
    return value.some(v => test(v));
  }

  // check value itself
  return !!value;
}

/** Parse given input string, returning either a single value, array, or object. The resulting data can be used with the `find`, `match`, and `test` functions */
export function parse(input: string): HurmlValue {
  return parseSection(input.split(/[\r\n]+/));
}
