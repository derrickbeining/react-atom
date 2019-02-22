import { addChangeHandler, Atom, deref, getValidator, removeChangeHandler, set, setValidator, swap } from "@libre/atom";
import { useLayoutEffect, useMemo, useState } from "react";

import { useAtom } from "./react-atom-internal";

/** @ignore */
export interface ReactUseStateHook<T> extends React.Dispatch<React.SetStateAction<T>> {
  "@@react-atom/hook_id"?: string;
  [K: string]: unknown;
}

/**
 * Optional configuration accepted by [[useAtom]]
 */
export interface UseAtomOptions<S, R> {
  /**
   * A selector function to be applied to the internal state of the Atom
   * to compute the return value of [[useAtom]].
   *
   * If the selector is known to be an expensive computation, you should
   * consider passing a referentially stable, memoized version of the
   * function.
   *
   * @example
   *```jsx
   *
   *import { Atom, useAtom } from '@dbeining/react-atom'
   *import { Orders } from 'elsewhere'
   *
   *const stateAtom = Atom.of({ orders: [...Orders] })
   *
   *function MyComponent() {
   *  const orderCount = useAtom(stateAtom, {
   *    select: (s) => s.orders.length
   *  })
   *
   *  return <p>There are {orderCount} orders</p>
   *}
   *```
   */
  select: (s: S) => R;
}

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
  addChangeHandler: typeof addChangeHandler;
  deref: typeof deref;
  getValidator: typeof getValidator;
  removeChangeHandler: typeof removeChangeHandler;
  set: typeof set;
  setValidator: typeof setValidator;
  swap: typeof swap;
  useAtom: typeof useAtom;
}
