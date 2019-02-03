import { useLayoutEffect, useMemo, useState } from "react";

import { Atom, atom, deref, set, swap, useAtom } from "./react-atom-internal";

/** @ignore */
export interface ReactUseStateHook<T> extends React.Dispatch<React.SetStateAction<T>> {
  "@@react-atom/hook_id"?: number;
  [K: string]: unknown;
}

/** @ignore */
export interface HookMap {
  [K: string]: ReactUseStateHook<any>;
}

/** @ignore */
export interface SelectorMap {
  [K: number]: (state: any) => any;
}

/**
 * Extracts the type info of an [[Atom]]'s inner state
 *
 * @param <A> an [[Atom]]'s type
 *
 * @example
 * ```ts
 *
 * const state = Atom.of({count: 0});
 * const increment = (s: AtomState<typeof state>) => ({ count: s.count + 1 })
 * swap(state, increment);
 * ```
 */
export type AtomState<A extends Atom<any>> = A extends Atom<infer S> ? S : never;

/**
 * Hooks this library depends on internally.
 */
export interface HookDependencies {
  useLayoutEffect: typeof useLayoutEffect;
  useMemo: typeof useMemo;
  useState: typeof useState;
}

export interface PublicExports {
  Atom: typeof Atom;
  atom: typeof atom;
  deref: typeof deref;
  set: typeof set;
  swap: typeof swap;
  useAtom: typeof useAtom;
}
