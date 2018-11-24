/** @ignore */
export function isShallowEqual<
  A,
  B extends Record<string, unknown>,
  C extends A | B
>(a: A, b: C): boolean {
  if (a instanceof Object && b instanceof Object) {
    if (Object.is(a, b)) return true;
    if (Object.keys(a).length !== Object.keys(b).length) return false;
    for (const k in a) if (!Object.is(a[k], b[k])) return false;
    return true;
  }

  return Object.is(a, b);
}

/** @ignore */
export function id<T>(x: T): T {
  return x;
}
