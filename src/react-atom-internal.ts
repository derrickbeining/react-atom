import {useMutationEffect, useState} from "react";

/**
 * **`react-atom` is a _lightweight_ abstraction around React's proposed Hooks API
 * that provides the ability to share and update state across function
 * components**. It is a simpler, more intuitive means of global app state-
 * management than libraries like `redux` or `mobx`.
 */

/** @ignore */
const LIB_NAMESPACE = "@@react-atom";

/** @ignore */
export const atoms: Array<Atom<unknown>> = [];
/** @ignore */
export const valuesByAtomId: Record<string, unknown> = {};
/** @ignore */
export const hooksByAtomId: Record<string, HookStore> = {};
/** @ignore */
export const nextHookIdByAtomId: Record<string, number> = {};

/** @ignore */
export function getAtomVal<S>(a: Atom<S>): S {
  return valuesByAtomId[atoms.indexOf(a)] as S;
}

/** @ignore */
export function getAtomHooks(a: Atom<unknown>): Array<ReactStateHook> {
  const atomId = atoms.indexOf(a);
  return Object.keys(hooksByAtomId[atomId]).map(
    (hookId) => hooksByAtomId[atomId][hookId],
  );
}

/**
 * A reactive data type for sharing state across React
 * *function components* (does not work with React.Component
 * class instances).
 *
 * You create an Atom with `Atom.of` and can read its state
 * with `deref`. To change the value of an Atom, you can use `swap`.
 *
 * When an Atom's value is changed, all components that `deref`
 * the Atom will automatically rerender to read the new state.
 *
 * @example
```jsx

import React from 'react';
import ReactDOM from 'react-dom';
import {Atom, deref, swap} from '@dbeining/react-atom';

const stateAtom = Atom.of({ count: 0 });

const increment = () =>
  swap(stateAtom, (state) => ({...state, count: state.count + 1}));

const decrement = () =>
  swap(stateAtom, (state) => ({...state, count: state.count - 1}));

export const App = () => {
  const {count, data, text} = deref(stateAtom);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>Moar</button>
      <button onClick={decrement}>Less</button>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

```
 */
export class Atom<S> {
  /**
   * Constructs a new instance of `Atom` with its internal state
   * set to `state`.
   *
   * @example
```js

import {Atom} from '@dbeining/react-atom'

const a1 = Atom.of(0)
const a2 = Atom.of("zero")
const a3 = Atom.of({ count: 0 })
```
   */
  public static of<S>(state: S) {
    return new Atom(state);
  }

  /** @ignore */
  private constructor(state: S) {
    const atomId = atoms.length;
    valuesByAtomId[atomId] = state;
    hooksByAtomId[atomId] = {};
    nextHookIdByAtomId[atomId] = 0;
    atoms.push(this);
    return Object.freeze(this);
  }
}
/**
 * A convenient alias for `Atom.of`
 *
 * A factory function that takes `state` of any type and returns
 * an Atom with its internal state set to `state`
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
// tslint:disable:max-line-length
/**
 *
 * Reads the current state of `atom` and subscribes the currently
 * rendering function component to `atom`'s state such that it
 * will rerender any time `atom`'s value changes.
 *
 * The subscription is removed when the component unmounts.
 *
 * > **IMPORTANT:**
 * >
 * > `deref` uses React Hooks API internally, therefore the
 * [Rules of Hooks](https://github.com/reactjs/reactjs.org/blob/f203cd5d86c4c611a31a4f72c5a91e2db0858ce3/content/docs/hooks-rules.md)
 * apply to `deref`
 *
 * @example

 ```jsx

import {Atom, deref} from '@dbeining/react-atom'

const stateAtom = Atom.of({ count: 0 })

export function CountDisplay(props) {
  const {count} = deref(stateAtom)

  return <p>Current count is {count}</p>
}
```
 */

export function deref<S>(atom: Atom<S>): S {
  if (!(atom instanceof Atom)) {
    throw TypeError(
      `Not an instance of Atom\n${JSON.stringify(atom, null, "  ")}`,
    );
  }
  const atomId = atoms.indexOf(atom);
  const atomValue = valuesByAtomId[atomId] as S;
  const ownHooks = hooksByAtomId[atomId];
  const [_, hook] = useState(true) as [boolean, ReactStateHook];

  useMutationEffect(() => {
    const hookId = nextHookIdByAtomId[atomId];
    if (hook[`${LIB_NAMESPACE}/id`] === undefined) {
      hook[`${LIB_NAMESPACE}/id`] = hookId;
      ownHooks[hookId] = hook;
      nextHookIdByAtomId[atomId] += 1;
    }

    return function unsubscribeHook() {
      delete ownHooks[hookId];
    };
  }, []);

  return atomValue;
}

/**
 * Sets `atom`'s internal value to the value returned from
 * applying `updateFn` to `atom`'s current value, then rerenders
 * all React components that `deref` `atom` so they read the
 * new state
 *
 * `updateFn` must be a pure function and must not mutate `atom`'s
 * current value
 *
 * @param atom an instance of a react-atom `Atom`
 * @param updateFn a pure function that takes an Atom's current state and returns its next state
 *
 * @example
```js

import {Atom, swap, deref} from 'dbeining/react-atom'

const atom = Atom.of({ count: 0 })
swap(atom, (state) => ({ count: state.count + 1 }))

// ...in a React function component:
deref(atom) // => { count: 1 }
```
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
  const atomId = atoms.indexOf(atom);
  const atomValue = valuesByAtomId[atomId] as S;
  valuesByAtomId[atomId] = updateFn(atomValue);
  Object.keys(hooksByAtomId[atomId]).forEach((hookId) => {
    hooksByAtomId[atomId][hookId](true);
  });
}

/**
 * Takes an `Atom` with state of some type, `S`, and sets its
 * state to `val` of the same type,`S`, then rerenders
 * all React components that `deref` `atom` so they read the
 * new state
 *
 * @param atom a react-atom Atom instance
 * @param nextState the value being set as `atom`'s state; It should be of the same type/interface as the current state
 *
  * @example
```js

import {Atom, deref, set} from '@dbeining/react-atom'

const atom = Atom.of({ count: 0 })
set(atom, { count: 100 })

// in a React function component:
deref(atom) // => { count: 100 }
```
 */

export function set<S>(atom: Atom<S>, nextState: S): void {
  swap(atom, () => nextState);
}
