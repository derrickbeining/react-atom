[![TypeScript](https://badges.frapsoft.com/typescript/love/typescript-150x33.png?v=101)](https://github.com/ellerbrock/typescript-badges/)

[![npm (scoped)](https://img.shields.io/npm/v/@dbeining/react-atom.svg)](<[![NpmLicense](https://img.shields.io/npm/l/@dbeining/react-atom.svg)](https://www.npmjs.com/package/@dbeining/react-atom)>)
[![Build Status](https://travis-ci.com/derrickbeining/react-atom.svg?branch=master)](https://travis-ci.com/derrickbeining/react-atom)
[![codecov](https://codecov.io/gh/derrickbeining/react-atom/branch/master/graph/badge.svg)](https://codecov.io/gh/derrickbeining/react-atom)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![NpmLicense](https://img.shields.io/npm/l/@dbeining/react-atom.svg)](https://www.npmjs.com/package/@dbeining/react-atom)

# @dbeining/react-atom ⚛️ 🔄 ⚛️

**Simple state-management _made easy_ for [React](https://reactjs.org/)**

**Built on
[React Hooks](https://github.com/reactjs/reactjs.org/blob/f203cd5d86c4c611a31a4f72c5a91e2db0858ce3/content/docs/hooks-intro.md)**

**~~Plagiarized from~~ Inspired by
[ratom](https://purelyfunctional.tv/guide/reagent/#atoms)s from
[reagent.cljs](https://reagent-project.github.io/)**

> ### Disclaimer: the React Hooks API is currently in the proposal stage, therefore this library should be considered experimental and unfit for production apps at this time

## Elevator Pitch:

React's new Hooks API may very well render `class` components (heh 😏) obsolete.
Hooks like `useState` and `useEffect` enable you to share **_share logic_** that
is stateful and/or effectful across your function components, eliminating the
need for patterns like
[higher-order-components](https://github.com/reactjs/reactjs.org/blob/f203cd5d86c4c611a31a4f72c5a91e2db0858ce3/content/docs/higher-order-components.md)
or
[render props](https://github.com/reactjs/reactjs.org/blob/f203cd5d86c4c611a31a4f72c5a91e2db0858ce3/content/docs/render-props.md).

However, **hooks currently do not provide a simple means to share and update
_state_ across functions components** (`useContext` will only get you so far).
That means heavy-duty state-management libraries like
[redux](https://redux.js.org/) or [mobx](https://mobx.js.org/) still reign as
the most popular solutions for managing stated shared across your application.
Unfortunately, many find these libraries to be unacceptably cumbersome at scale,
_especially_ when using a statically typed language like
[TypeScript](https://www.typescriptlang.org/index.html). `react-atom` is meant
to provide an alternative, simpler solution by building on the new capabilities
exposed by React's proposed Hooks API.

**`react-atom` is a _lightweight_ abstraction around React's proposed Hooks API
that provides the ability to share and update state across function
components**. It provides all the power of heavy-duty state management libraries
and patterns, like `redux` or `mobx`, without bogging you down with a ton of new
concepts, conventions, and hard-to-remember proprietary APIs.

`react-atom` has a tiny API (4 functions currently). You can use an `Atom` as a
global state store and when you update its value with `swap` or `set`, any
function components that `deref` it will automatically rerender. You can also
use `Atom`s as local state for function components, **but** the `useState` hook
may be a better fit for most of those cases.

## Let's see some code

<details>
  <summary>
   Click for code sample 
  </summary>

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import {Atom, deref, swap} from '@dbeining/react-atom';

/////////////////////// APP STATE /////////////////////////
/**
 * An atom can be constructed with `Atom.of` or its alias, `atom`.
 * Atoms have no methods and cannot be written to. The only way to
 * get the value of an atom is to `deref` it
 */
const stateAtom = Atom.of({
  count: 0,
  text: '',
  data: {
    // ...just imagine
  },
});

/////////////////////// EFFECTS /////////////////////
/**
 * `swap` applies an update function to the current value of the Atom
 * then tells all components referencing the Atom to rerender and read
 * the new state
 */
const increment = () =>
  swap(stateAtom, (state) => ({...state, count: state.count + 1}));

const decrement = () =>
  swap(stateAtom, (state) => ({...state, count: state.count - 1}));

const updateText = (evt) =>
  swap(stateAtom, (state) => ({...state, text: evt.target.value}));

const loadSomething = () =>
  fetch('https://jsonplaceholder.typicode.com/todos/1')
    .then((res) => res.json())
    .then((data) => swap(stateAtom, (state) => ({...state, data})))
    .catch(console.error);

///////////////// COMPONENT  /////////////////////
export const App = () => {
  /**
   * `deref` reads the value of the atom at the time of rendering and
   * subscribes the component to the Atom so that it will rerender any
   * time the Atom's value changes. It will automatically unsubscribe
   * from Atom updates when the component unmounts.
   */
  const {count, data, text} = deref(stateAtom);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>Moar</button>
      <button onClick={decrement}>Less</button>
      <button onClick={loadSomething}>Load Data</button>
      <input type="text" onChange={updateText} value={text} />
      <p>{JSON.stringify(data, null, '  ')}</p>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
```

</details>

---

You can play with `react-atom` live right away at the following places:

- [JS React CodeSandbox](https://codesandbox.io/s/5v6wlwy2yn)
- [TypeScript React CodeSandbox](https://codesandbox.io/s/vmnzyl7jm7)

## Installation

`react-atom` has zero bundled `dependencies` and only two `peerDependency`,
namely, `react@^16.7.0-alpha.0` and `react-dom@^16.7.0-alpha.0`, which contain
the new Hooks API that `react-atom` abstracts upon.

```
npm i -S @dbeining/react-atom react@^16.7.0-alpha.0 react-dom@^16.7.0-alpha.0
```

## Documentation

[You can find the API for `react-atom` here](https://derrickbeining.github.io/react-atom/)

## Contributing / Feedback

Please open an issue if you have any questions, suggestions for
improvements/features, or want to submit a PR for a bug-fix (please include
tests if applicable).
