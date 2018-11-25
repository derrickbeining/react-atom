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
