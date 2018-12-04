/** @ignore */
export function isPOJO(obj: unknown): obj is Record<string, unknown> {
  if (typeof obj !== "object" || obj === null) return false;
  const proto = Object.getPrototypeOf(obj);
  return proto === Object.prototype || proto === null;
}

/** @ignore */
export function isShallowEqual<A, B extends Record<string, unknown>, C extends A | B>(a: A, b: C): boolean {
  if ([a, b].every(isPOJO) || [a, b].every(Array.isArray)) {
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
