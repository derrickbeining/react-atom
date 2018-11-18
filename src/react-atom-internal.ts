import React, {useMutationEffect, useState} from "react";

const LIB_NAMESPACE = "@@react-hook";

export const atoms: Array<Atom<unknown>> = [];
export const valuesByAtomId: Record<string, unknown> = {};
export const hooksByAtomId: Record<string, HookStore> = {};
export const hookIdKeeperByAtomId: Record<string, number> = {};

export function getAtomVal<A>(a: Atom<A>): unknown {
  return valuesByAtomId[atoms.indexOf(a)];
}

export function getAtomHooks(a: Atom<unknown>): Array<ReactStateHook> {
  const atomId = atoms.indexOf(a);
  return Object.keys(hooksByAtomId[atomId]).map(
    (hookId) => hooksByAtomId[atomId][hookId],
  );
}

export class Atom<A> {
  public static of<A>(state: A) {
    return new Atom(state);
  }

  private constructor(state: A) {
    const hookId = atoms.length;
    valuesByAtomId[hookId] = state;
    hooksByAtomId[hookId] = {};
    hookIdKeeperByAtomId[hookId] = 0;
    atoms.push(this);
    return Object.freeze(this);
  }
}

export function deref<A>(a: Atom<A>): A {
  if (!(a instanceof Atom)) {
    throw TypeError(
      `Not an instance of Atom\n${JSON.stringify(a, null, "  ")}`,
    );
  }
  const atomId = String(atoms.indexOf(a));
  const atomValue = valuesByAtomId[atomId] as A;
  const ownHooks = hooksByAtomId[atomId];
  const [_, hook] = useState(true) as [boolean, ReactStateHook];

  useMutationEffect(() => {
    const hookId = hookIdKeeperByAtomId[atomId];
    if (hook[`${LIB_NAMESPACE}/id`] === undefined) {
      hook[`${LIB_NAMESPACE}/id`] = hookId;
      ownHooks[hookId] = hook;
      hookIdKeeperByAtomId[atomId] += 1;
    }

    return function unsubscribeHook() {
      delete ownHooks[hookId];
    };
  }, []);

  return atomValue;
}

export function swap<S>(a: Atom<S>, updateFn: (s: S) => S): void;
// TODO: overload with option to pass updater, lens, and transform separately
// and implement it to perform an optimization where rerender is skipped if the focused
// part of the state data structure is not changed after applying the transform
// export function swap<S, T>(
//   a: Atom<S>,
//   updateFn: (lens: (s: S) => T, transform: (t: T) => T) => S,
//   transformFn: (t: T) => T,
// ): void;
export function swap<S>(a: Atom<S>, updateFn: (s: S) => S): void {
  const atomId = String(atoms.indexOf(a));
  const atomValue = valuesByAtomId[atomId] as S;
  valuesByAtomId[atomId] = updateFn(atomValue);
  Object.keys(hooksByAtomId[atomId]).forEach((hookId) => {
    hooksByAtomId[atomId][hookId](true);
  });
}

export function set(a: Atom<unknown>, val: unknown): void {
  swap(a, () => val);
}
