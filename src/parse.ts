/** Parser state */
interface ParseState {
  result: HurmlValue | HurmlValue[];
  currentObject?: HurmlObject;
  currentList?: HurmlValue[];
  prop?: string;
}

/** Parsed result structure or value */
export type HurmlValue = undefined | string | number | boolean | HurmlToken | HurmlObject | HurmlValue[];

/** Bare token used as value */
export class HurmlToken {
  constructor(public token: string) {}
  toString() {
    return this.token;
  }
  valueOf() {
    return this.token;
  }
}

/** Result object wrapper */
export class HurmlObject {
  [propertyName: string]: HurmlValue | HurmlValue[];
}

/** Parse given lines, until the next closing bracket (on own line) */
export function parseSection(lines: string[], nestingLevel = 0) {
  let state: ParseState = { result: undefined };
  while (lines.length) {
    let line = lines.shift()!.trim();
    if (line === "") continue;
    if (line === ")" && nestingLevel) {
      break;
    }

    // check for property structure
    let matchStruct = line.match(/^\[(.*)\]$/);
    if (matchStruct) {
      let prop = (state.prop = matchStruct[1].trim());
      state.currentObject = undefined;
      state.currentList = undefined;
      if (state.result === undefined) {
        state.result = new HurmlObject();
      }
      if (state.result instanceof HurmlObject) {
        // create property as undefined first if possible
        state.result[prop] = undefined;
      }
      continue;
    }

    // check for list item
    if (/^-[ \(]/.test(line)) {
      let a = getList(state);
      let item = line.replace(/^-\s*/, "");
      let value = item === "(" ? parseSection(lines, nestingLevel + 1) : parseValue(item);
      a.push(value);
      continue;
    }

    // check for simple property
    let matchProperty = line.match(/^([^'"“”‘’]+)=(.*)/);
    if (matchProperty) {
      let o = getObject(state);
      let propertyName = matchProperty[1].trim();
      let item = matchProperty[2].trim();
      let value = item === "(" ? parseSection(lines, nestingLevel + 1) : parseValue(item);
      o[propertyName] = value;
      state.prop = propertyName;
      continue;
    }

    // otherwise, use value directly, or as name property
    let value = line === "(" ? parseSection(lines, nestingLevel + 1) : parseValue(line);
    if (state.result === undefined) {
      state.result = value;
    } else {
      if (value instanceof HurmlToken) getObject(state)[String(value)] = value;
      else getObject(state).name = value;
    }
  }
  return state.result;
}

/** Ensure there is an object to which a property can be added, then return the object */
function getObject(state: ParseState) {
  if (state.currentObject) return state.currentObject;
  let o = (state.currentObject = new HurmlObject());
  if (Array.isArray(state.result)) {
    o.list = state.result;
  } else if (state.result instanceof HurmlObject) {
    state.result[state.prop || "object"] = o;
  } else {
    if (state.result !== undefined) {
      o.name = String(state.result);
      state.result = o;
    }
    state.result = o;
  }
  return o;
}

/** Ensure there is an array to which a value can be added, then return the array */
function getList(state: ParseState) {
  if (state.currentList) return state.currentList;
  let a = (state.currentList = []);
  let o = state.currentObject || state.result;
  if (o instanceof HurmlObject) {
    o[state.prop || "list"] = a;
  } else if (state.result !== undefined) {
    o = new HurmlObject();
    o.name = String(state.result);
    o[state.prop || "list"] = a;
    state.result = o;
  }
  return a;
}

/** Parse given value (string, number, or boolean), stripping quotes if needed */
function parseValue(s: string) {
  if (s === "") return undefined;
  if (s === "true") return true;
  if (s === "false") return false;
  if (/^[\d_]+\.\d+|\.[\d_]+/.test(s)) return parseFloat(s.replace(/_/g, ""));
  let matchString = s.match(/^["'“”‘’](.*)["'“”‘’]$/);
  if (matchString) return matchString[1];
  let tokens = s
    .split(/[,;]/)
    .map(s => s.trim())
    .filter(s => !!s)
    .map(s => new HurmlToken(s));
  return tokens.length > 1 ? tokens : tokens[0];
}

