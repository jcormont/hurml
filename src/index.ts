import { parseSection, HurmlValue, HurmlToken, HurmlObject } from "./parse";

/** Get the value from given (nested) property; any arrays (lists) are flattened while traversing the data structure */
export function find(data: HurmlValue, ...path: string[]): HurmlValue {
  let result = data;
  while (path && path.length) {
    if (Array.isArray(result)) {
      // flatten array results
      let map: HurmlValue[] = [];
      for (let v of result.map(v => find(v, ...path))) {
        if (v === undefined) continue;
        if (Array.isArray(v)) map.push(...v);
        else map.push(v);
      }
      return map;
    } else if (result instanceof HurmlObject) {
      // take closest property value
      let p = path.shift()!;
      if (p in result) {
        result = result[p];
        continue;
      }
      let o = result;
      result = undefined;
      for (let q in o) {
        if (q.toLowerCase() === p.toLowerCase()) {
          result = o[q];
          break;
        }
      }
      continue;
    }
    return undefined;
  }
  return result;
}

/** Match given string value or regular expression with the value of given (nested) property; any arrays (lists) are flattened while traversing the data structure */
export function match(s: string | RegExp, data: HurmlValue, ...path: string[]): boolean {
  let value = find(data, ...path);
  if (Array.isArray(value)) {
    // check if any element matches
    return value.some(v => match(s, v));
  }
  if (s instanceof RegExp) {
    return value !== undefined && s.test(String(value));
  }
  s = String(s ?? "");
  if (s && value instanceof HurmlToken) {
    // check case-insensitive token string
    return String(value).toLowerCase() === s.toLowerCase();
  }
  // check value itself
  return value !== undefined && String(value) === s;
}

/** Test if the value of given (nested) property is *not* false, undefined, 0, or empty string; any arrays (lists) are flattened while traversing the data structure */
export function test(data: HurmlValue, ...path: string[]): boolean {
  let value = find(data, ...path);
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
