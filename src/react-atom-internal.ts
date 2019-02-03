import { useLayoutEffect, useMemo, useState } from "react";
import * as ErrorMsgs from "./error-messages";
import { HookDependencies, HookMap, PublicExports, ReactUseStateHook, SelectorMap } from "./internal-types";
import { isShallowEqual, memoLast } from "./utils";

// ------------------------------------------------------------------------------------------ //
// ---------------------------------- INTERNAL STATE ---------------------------------------- //
// ------------------------------------------------------------------------------------------ //

let initializationCount = 0;

let nextAtomUid = 0;

const stateByAtomId: Record<string, unknown> = Object.create(null);

const atomIdToHooksById: Record<number, HookMap> = Object.create(null);

const atomIdToSelectorsByHookId: Record<number, SelectorMap> = Object.create(null);

const hookIdTickerByAtomId: Record<number, number> = Object.create(null);

/** @ignore */
export function getAtomVal<S>(atom: Atom<S>): S {
  return stateByAtomId[atom.id] as S;
}

/** @ignore */
export function getAtomValById<S>(id: number): S {
  return stateByAtomId[id] as S;
}

/** @ignore */
export function listHooks<S>(atom: Atom<S>): Array<ReactUseStateHook<S>> {
  return Object.keys(atomIdToHooksById[atom.id]).map(hookId => atomIdToHooksById[atom.id][hookId]);
}

/** @ignore */
export function getHooks(atom: Atom<unknown>): HookMap {
  return atomIdToHooksById[atom.id];
}

// ------------------------------------------------------------------------------------------ //
// -------------------------------------- PUBLIC API ---------------------------------------- //
// ------------------------------------------------------------------------------------------ //

/**
 * `react-atom` is a _lightweight_ abstraction around React's proposed Hooks API
 * that provides the ability to ___share and update state across function
 * components___. It offers a truly _simple_, ergonomic, and intuitive approach to global
 * app state-management, and intends to be an alternative to libraries like `redux` or `mobx`.
 */

/**
 * Initializes the library with the provided [[HookDependencies]].
 *
 * This allows you to use react-atom with other implementations of hooks.
 *
 * @example
 * ```jsx
 *
 * import {useLayoutEffect, useMemo, useState} from 'alt-hooks'
 * import { initialize } from '@dbeining/react-atom';
 *
 * export const {Atom, deref, set, swap, useAtom} = initialize({
 *  useLayoutEffect,
 *  useMemo,
 *  useState,
 * });
 * ```
 */
export function initialize(hooks: HookDependencies): PublicExports {
  const { useLayoutEffect, useMemo, useState } = hooks;
  initializationCount = initializationCount + 1;
  /* instanbul ignore next */
  function useAtom<S, R>(atom: Atom<S>, options: { select?(s: S): R } = {}) {
    if (!(atom instanceof Atom)) {
      const arg = JSON.stringify(atom, null, "  ");
      throw TypeError(`${ErrorMsgs.calledUseAtomWithNonAtom}\n${arg}`);
    }

    const { select } = options;
    const atomValue = getAtomValById<S>(atom.id);
    let selector: NonNullable<typeof select> = select ? select : <A extends S & R>(a: A) => a;
    let hook: ReactUseStateHook<S | R>;
    try {
      selector = useMemo(() => memoLast(selector), [select]);
      [, hook] = useState({}) as [{}, ReactUseStateHook<S | R>];
    } catch (err) {
      throw new TypeError(ErrorMsgs.calledUseAtomOutsideFunctionComponent);
    }

    useLayoutEffect(
      () => {
        const idKey = "@react-atom/hook_id";
        const ownHooksById = atomIdToHooksById[atom.id];
        const ownSelectorsByHookId = atomIdToSelectorsByHookId[atom.id];
        const hookId = Number(hook[idKey] !== undefined ? hook[idKey] : hookIdTickerByAtomId[atom.id]++);

        hook[idKey] = hookId;
        ownHooksById[hookId] = hook;
        ownSelectorsByHookId[hookId] = selector;

        return function unhook() {
          delete ownHooksById[hookId];
          delete ownSelectorsByHookId[hookId];
        };
      },
      [hook, select]
    );

    return selector(atomValue);
  }

  return {
    Atom,
    atom,
    deref,
    set,
    swap,
    useAtom
  };
}

//
// ======================================= ATOM ==============================================
//
/**
 * A simple reactive data type designed to make state management in [React](https://github.com/facebook/react)
 * as intuitive, ergonomic, and performant as possible.
 *
 * The following operations are available for working with [[Atom]]s:
 * * **create**: [[Atom.of]], [[atom]]
 * * **read**: [[deref]], [[useAtom]]
 * * **update**: [[swap]], [[set]]
 *
 * When an [[Atom]]'s value is updated, all function components that called
 * [[useAtom]] on that [[Atom]] will be notified to re-render and read the
 * next state
 *
 * @param S the type of the value being set as an Atom's internal state
 *
 * @example
 * ```jsx
 *
 * import React from 'react';
 * import ReactDOM from 'react-dom';
 * import { Atom, useAtom, swap } from '@dbeining/react-atom';
 *
 * const stateAtom = Atom.of({ count: 0 });
 *
 * const increment = () =>
 *   swap(stateAtom, (state) => ({...state, count: state.count + 1}));
 *
 * const decrement = () =>
 *   swap(stateAtom, (state) => ({...state, count: state.count - 1}));
 *
 * export const App = () => {
 *   const { count } = useAtom(stateAtom);
 *
 *   return (
 *     <div>
 *       <h1>Count: {count}</h1>
 *       <button onClick={increment}>Moar</button>
 *       <button onClick={decrement}>Less</button>
 *     </div>
 *   );
 * };
 *
 * ReactDOM.render(<App />, document.getElementById('root'));
 * ```
 */
export class Atom<S> {
  /**
   * Constructs a new instance of [[Atom]] with its internal state
   * set to `state`.
   *
   * @param S the type of the value being set as an [[Atom]]'s internal state
   * @example
```js

import { Atom } from '@dbeining/react-atom'

const a1 = Atom.of(0)
const a2 = Atom.of("zero")
const a3 = Atom.of({ count: 0 })
```
   */
  public static of<S>(state: S) {
    return new Atom(state);
  }

  /** @ignore */
  public readonly id: number;

  /** @ignore */
  private constructor(state: S) {
    this.id = nextAtomUid++;
    stateByAtomId[this.id] = state;
    atomIdToHooksById[this.id] = {};
    atomIdToSelectorsByHookId[this.id] = {};
    hookIdTickerByAtomId[this.id] = 0;
    Object.freeze(this);
  }
}

/**
 * An alias for [[Atom.of]]
 *
 * @param S the type of the value being set as an [[Atom]]'s internal state
 *
 * @example
```js

import {atom} from '@dbeining/react-atom'

const a1 = atom(0)
const a2 = atom("zero")
const a3 = atom({ count: 0 })
```
 */
export function atom<S>(state: S): Atom<S> {
  return Atom.of(state);
}

//
// ======================================= DEREF ==============================================
//

/**
 * Reads the current state of an [[Atom]]
 *
 * Differs from [[useAtom]] in that it is ___not___ a React Hook. It can therefore
 * be used freely outside of function components.
 *
 * @param S the internal state of the [[Atom]] passed to [[deref]]
 *
 * @example
```js

import {Atom, deref} from '@dbeining/react-atom'

const stateAtom = Atom.of({ count: 0 })
const {count} = deref(stateAtom)
```
 */
export function deref<S>(atom: Atom<S>): S;

/**
 * Reads the current state of an [[Atom]]. Behavior can be customized with
 * the `options` argument.
 *
 * Differs from [[useAtom]] in that it is ___not___ a React Hook. It can therefore
 * be used freely outside of function components.
 *
 * @tip memoize `options.select` if it is an expensive computation and you expect it to run
 * frequently
 *
 * @param S the type of the [[Atom]]'s internal state
 * @param R the type of [[deref]]'s return value, inferred from `options.select`'s return value
 * @param atom a react-atom [[Atom]] from which to read state
 * @param options.select a pure function to apply to the [[Atom]]'s state to compute [[deref]]'s return value.
 *
 * @example
 * ```jsx
 *
 * import { Atom, deref}  from '@dbeining/react-atom'
 * import { Orders } from 'elsewhere'

 * const stateAtom = Atom.of({ orders: [...Orders] })
 *
 * const orderCount = deref(stateAtom, {
 *    select: (s) => s.orders.length
 *  })
 * ```
 *
 */
export function deref<S, R>(atom: Atom<S>, options: { select: (state: S) => R }): R;

export function deref<S, R>(atom: Atom<S>, options: { select?: (state: S) => R } = {}) {
  if (!(atom instanceof Atom)) {
    const arg = JSON.stringify(atom, null, "  ");
    throw TypeError(`${ErrorMsgs.calledDerefWithNonAtom}\n${arg}`);
  }
  const { select } = options;
  const atomValue = stateByAtomId[atom.id] as S;
  return select ? select(atomValue) : atomValue;
}

//
// ======================================= USEATOM ==============================================
//
// tslint:disable:max-line-length

/**
 * #### **Important:** _`useAtom` is a React Hook and must follow the [Rules of Hooks](https://github.com/reactjs/reactjs\`fromAltHooks()\` AND .org/blob/f203cd5d86c4c611a31a4f72c5a91e2db0858ce3/content/docs/hooks-rules.md)_
 *
 * Reads the current state of an [[Atom]] and subscribes the currently
 * rendering function component to the [[Atom]]'s state such that, when the
 * [[Atom]]'s state changes, the component will automatically re-render to
 * read the new state. The subscription is removed when the component unmounts.
 *
 * @param S the type of the internal state of the [[Atom]]
 * @returns the internal state of the [[Atom]]
 *
 * @example
 * ```jsx
 *
 *import {Atom, useAtom} from '@dbeining/react-atom'
 *
 *const stateAtom = Atom.of({ count: 0 })
 *
 *function MyComponent() {
 *  const {count} = useAtom(stateAtom)
 *  return <p>The count is {count}</p>
 *}
 * ```
 */

export function useAtom<S>(atom: Atom<S>): S;

/**
 * #### **Important:** _`useAtom` is a React Hook and must follow the [Rules of Hooks](https://github.com/reactjs/reactjs.org/blob/f203cd5d86c4c611a31a4f72c5a91e2db0858ce3/content/docs/hooks-rules.md)_
 *
 * [[useAtom]] enhanced with `options`.
 *
 * Reads the current state of an [[Atom]] and subscribes the currently
 * rendering function component to the [[Atom]]'s state such that, when the
 * [[Atom]]'s state changes, the component will automatically re-render to
 * read the new state. The subscription is removed when the component unmounts.
 *
 * @tip if `options.select` is an expensive computation, it should be memoized
 *
 * @param S the type of the internal state of the [[Atom]]
 * @param R the type of the return value of [[useAtom]] computed via `options.select`
 * @param options.select a pure function applied to the Atom's state to compute the value you want [[useAtom]] to return. If provided, **the component will only re-render when the value returned from `options.select` has changed**, as determined by a strict equality check for primitive/scalar values, or, for objects, a shallow strict equality comparison of own properties.
 * @returns the value returned from applying `options.select` to `S`
 * @example
 * ```jsx
 *
 *import { Atom, useAtom } from '@dbeining/react-atom'
 *import { Orders } from 'elsewhere'

 *const stateAtom = Atom.of({ orders: [...Orders] })
 *
 *function MyComponent() {
 *  const orderCount = useAtom(stateAtom, {
 *    select: (s) => s.orders.length
 *  })
 *
 *  return <p>There are {orderCount} orders</p>
 *}
 * ```
 */
export function useAtom<S, R>(atom: Atom<S>, options: { select(s: S): R }): R;
export function useAtom<S, R>(atom: Atom<S>, options: { select?(s: S): R } = {}) {
  if (initializationCount > 1) throw Error(ErrorMsgs.multipleInstantiations);
  const { select } = options;
  return select ? internalUseAtom(atom, { select }) : internalUseAtom(atom);
}

/**
 * default instance of useAtom
 */
const internalUseAtom = initialize({ useLayoutEffect, useMemo, useState }).useAtom;

//
// ======================================= SWAP ==============================================
//
/**
 * Takes an [[Atom]] with state of some type, `S`, and a pure function
 * of type `S -> S`, and swaps the state of the [[Atom]] with the
 * value returned by applying the function to the [[Atom]]'s current
 * state.
 *
 * Once the [[Atom]]'s state is swapped, all the function components that
 * have called [[useAtom]] on the [[Atom]] will automatically re-render so
 * they read its new state.
 *
 * @param atom a react-atom [[Atom]] instance
 * @param updateFn a pure function that takes an [[Atom]]'s current state and returns its next state
 *
 * @example
 * ```jsx
 *
 *import {Atom, swap, useAtom} from '@dbeining/react-atom'
 *
 *const stateAtom = Atom.of({ count: 0 })
 *const increment = () => swap(stateAtom, (state) => ({count: state.count + 1}))
 *
 *function MyComponent() {
 *  const {count} = useAtom(stateAtom)
 *  return (
 *   <div>
 *     <p>The count is {count}</p>
 *     <button onClick={increment}></button>
 *   </div>
 *  )
 *}
 * ```
 */
// TODO: overload with option to pass updater, getter, and transform separately
// and implement it to perform an optimization where rerender is skipped if the focused
// part of the state data structure is not changed after applying the transform
// export function swap<S, T>(
//   a: Atom<S>,
//   updateFn: (lens: (s: S) => T, transform: (t: T) => T) => S,
//   transformFn: (t: T) => T,
// ): void;

export function swap<S>(atom: Atom<S>, updateFn: (state: S) => S): void {
  const currentState = stateByAtomId[atom.id] as S;
  const nextState = updateFn(currentState);
  stateByAtomId[atom.id] = nextState;

  Object.keys(atomIdToHooksById[atom.id])
    .map(hookId => {
      const select = atomIdToSelectorsByHookId[atom.id][Number(hookId)];
      return {
        hookId,
        shouldRender: !isShallowEqual(select(currentState), select(nextState))
      };
    })
    .forEach(({ hookId, shouldRender }) => (shouldRender ? atomIdToHooksById[atom.id][hookId]({}) : null));
}

//
// ======================================= SET ==============================================
//

/**
 * Sets `atom`s state to `nextState`.
 *
 * It is equivalent to `swap(atom, () => newState)` and actually calls `swap` internally.
 *
 * Once the `atom`'s state is set, all components that have called [[useAtom]] on the
 * `atom` will automatically re-render so they read its new state.
 *
 * @param atom a react-atom [[Atom]] instance
 * @param nextState the value to which to set the [[Atom]]'s state. It should be of the same type/interface as the current state
 *
  * @example
```js

import {Atom, useAtom, set} from '@dbeining/react-atom'

const atom = Atom.of({ count: 0 })
set(atom, { count: 100 })

// in a React function component:
useAtom(atom) // => { count: 100 }
```
 */

export function set<S>(atom: Atom<S>, nextState: S): void {
  swap(atom, () => nextState);
}
