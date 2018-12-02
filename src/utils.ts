import { DeepPartial } from "./internal-types";

/** @ignore */
export function isShallowEqual<A, B extends Record<string, unknown>, C extends A | B>(a: A, b: C): boolean {
  if (a instanceof Object && b instanceof Object) {
    if (Object.is(a, b)) return true;
    if (Object.keys(a).length !== Object.keys(b).length) return false;
    for (const k in a) if (!Object.is(a[k], b[k])) return false;
    return true;
  }

  return Object.is(a, b);
}

/** @ignore */
export function memoLast<A, B>(fn: (arg: A) => B) {
  let cachedArg: A;
  let cachedVal: B;
  return function memoized(arg: A): B {
    if (!Object.is(cachedArg, arg)) {
      cachedArg = arg;
      cachedVal = fn(arg);
    }
    return cachedVal;
  };
}

/** @ignore */
export function isPOJO(obj: unknown): obj is Record<string, any> {
  if (typeof obj === "object" && obj !== null) {
    if (typeof Object.getPrototypeOf === "function") {
      const proto = Object.getPrototypeOf(obj);
      return proto === Object.prototype || proto === null;
    }
    return Object.prototype.toString.call(obj) === "[object Object]";
  }
  return false;
}

/** @ignore */
export function mergeRTL<A extends Record<string, any>, B extends DeepPartial<A>>(o1: A, o2: B): A & B {
  return Object.keys(o2).reduce((merged, k) => {
    const v1 = o1[k];
    const v2 = o2[k];
    merged[k] = [v1, v2].every(o => isPOJO(o)) && !Object.is(v1, v2) && v2 !== undefined ? mergeRTL(v1, v2) : v2;
    return merged;
  }, Object.assign({} as B, o1));
}
