import { addChangeHandler, Atom, DeepImmutable, deref, removeChangeHandler, set, swap } from "@libre/atom";
import { SetStateAction, useLayoutEffect, useMemo, useState } from "react";

import * as ErrorMsgs from "./error-messages";
import { HookDependencies, PublicExports, ReactUseStateHook, UseAtomOptions } from "./internal-types";
import { isShallowEqual, memoLast } from "./utils";

// ------------------------------------------------------------------------------------------ //
// ---------------------------------- INTERNAL STATE ---------------------------------------- //
// ------------------------------------------------------------------------------------------ //

let initializationCount = 0;
let hookIdTicker = 0;

// ------------------------------------------------------------------------------------------ //
// -------------------------------------- PUBLIC API ---------------------------------------- //
// ------------------------------------------------------------------------------------------ //

/**
 * `react-atom` is a _lightweight_ abstraction around React's proposed Hooks API
 * that provides the ability to ___share and update state across function
 * components___. It offers a very simple and straightforward approach to managing
 * state, whether local component state, or shared application state.
 */

/**
 * **NOTE: This is an escape hatch for users of `react` prior to hooks**
 *
 * Initializes `react-atom` with the provided [[HookDependencies]] and
 * returns the full public API of `react-atom`.
 *
 * By default, react-atom imports the [[HookDependencies]] from the
 * version of `react` you've installed, but `initialize` provides you
 * the option to use a different implementation of hooks. For example,
 * if you're using a version of `react` prior to the release of hooks,
 * you might like to use a poly/ponyfill like [react-with-hooks](https://github.com/yesmeck/react-with-hooks).
 *
 * If you use `initialize`, you need to be careful to avoid importing
 * `useAtom` and co. from `react-atom` and make sure to only use the
 * instances returned by `initialize` throughout your application.
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
  function useAtom<S, R>(atom: Atom<S>, options?: UseAtomOptions<S, R>): DeepImmutable<R> {
    if (!(atom instanceof Atom)) {
      const arg = JSON.stringify(atom, null, "  ");
      throw TypeError(`${ErrorMsgs.calledUseAtomWithNonAtom}\n${arg}`);
    }

    const { select } = options || { select: null };
    const atomValue = deref(atom) as S;
    let selector: NonNullable<typeof select> = select ? select : (a: S) => (a as unknown) as R;
    let hook: ReactUseStateHook<S | R>;
    try {
      selector = useMemo(() => memoLast(selector), [select]);
      [, hook] = useState({}) as [{}, ReactUseStateHook<S | R>];
    } catch (err) {
      throw new TypeError(ErrorMsgs.calledUseAtomOutsideFunctionComponent);
    }

    useLayoutEffect(
      () => {
        const idKey = hook["@@react-atom/hook_id"] ? hook["@@react-atom/hook_id"] : `hook#${++hookIdTicker}`;
        let isMounted = true;
        hook["@@react-atom/hook_id"] = idKey;
        addChangeHandler(atom, hook["@@react-atom/hook_id"], ({ previous, current }) => {
          if (isMounted && !isShallowEqual(selector(previous), selector(current))) {
            hook({} as SetStateAction<S | R>);
          }
        });

        return function unhook() {
          isMounted = false;
          removeChangeHandler(atom, hook["@@react-atom/hook_id"] as string);
        };
      },
      [hook, select]
    );

    return selector(atomValue) as DeepImmutable<R>;
  }

  return {
    Atom,
    addChangeHandler,
    deref,
    removeChangeHandler,
    set,
    swap,
    useAtom
  };
}

// ======================================= USEATOM ==============================================
//
// tslint:disable:max-line-length

/**
 * #### **Important:** _`useAtom` is a React Hook and must follow the [Rules of Hooks](https://github.com/reactjs/reactjs.org/blob/f203cd5d86c4c611a31a4f72c5a91e2db0858ce3/content/docs/hooks-rules.md)_
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

export function useAtom<S>(atom: Atom<S>): DeepImmutable<S>;

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
export function useAtom<S, R>(atom: Atom<S>, options: UseAtomOptions<S, R>): DeepImmutable<R>;
export function useAtom<S, R>(atom: Atom<S>, options?: UseAtomOptions<S, R>) {
  if (initializationCount > 1) throw Error(ErrorMsgs.multipleInstantiations);
  const { select } = options || { select: null };
  return select ? internalUseAtom(atom, { select }) : internalUseAtom(atom);
}

/**
 * default instance of useAtom
 */
const internalUseAtom = initialize({ useLayoutEffect, useMemo, useState }).useAtom;
