# `react-atom` ⚛️ 🔄 ⚛️

### Simple state-management _made easy_ for [React](), built on [React Hooks](https://reactjs.org/docs/hooks-intro.html)

**~~Plagiarized from~~ Inspired by
[ratom](https://purelyfunctional.tv/guide/reagent/#atoms)s from
[reagent.cljs](https://reagent-project.github.io/)**

## Elevator Pitch:

React's new Hook API may very well render `class` components (heh 😏 ) obsolete;
an anti-pattern of the past. Hooks like `useState` and `useEffect` enable you to
share **_share logic_** that is stateful and/or effectful across your function
components, eliminating the need for abstractions/patterns like
[higher-order-components]() or [render props](). However, **hooks currently do
not provide a simple means to share and update _state_** across functions
components (`useContext` will only get you so far), therefore many will still
feel the need to pull in heavy-duty state-management libraries like [redux]() or
[mobx](), which unfortunately become unacceptably cumbersome at scale,
_especially_ when using a statically typed language like [TypeScript]().

**`react-atom` is a _lightweight_ abstraction around React's proposed Hooks API
that provides the ability to share and update state across function
components**. It provides all the power of `redux` without bogging you down with
a ton of new concepts and conventions like action-types, action-messages,
dispatchers, reducers, thunks, sagas, etc.

`react-atom` has a tiny API (4 functions). You can use an `Atom` as a global
state store much like you would with `redux`. You can also you `Atom`s as local
state for function components, but the `useState` hook may be a better fit for
most of those cases.

Here's the gist:

```jsx
import * as React from 'react';
import {Atom, deref, swap} from 'react-atom';

/////////////////////// APP STATE /////////////////////////
// `Atom.of` is the only way to get an Atom. Atoms have no methods
// and cannot be written to. The only way to get the value of an
// atom is to `deref` it
const stateAtom = Atom.of({
  count: 0,
  text: '',
  data: {
    // ...just imagine
  },
});

/////////////////////// EFFECTS /////////////////////
// `swap` applies an update function to the current value of the Atom
// then tells all components referencing the Atom to rerender and read
// the new state
const increment = () =>
  swap(stateAtom, (state) => ({...state, count: state.count + 1}));

const decrement = () =>
  swap(stateAtom, (state) => ({...state, count: state.count + 1}));

const updateText = (evt) =>
  swap(stateAtom, (state) => ({...state, text: evt.target.value}));

const loadSomething = () =>
  fetch('https://some-api.com')
    .then((res) => res.json())
    .then((data) => swap(stateAtom, (state) => ({...state, data})))
    .catch(console.error);

///////////////// COMPONENT  /////////////////////
export const App = () => {
  // `deref` reads the value of the atom at the time of rendering and
  // subscribes the component to the Atom so that it will rerender any
  // time the Atom's value changes. It will automatically unsubscribe
  // from Atom updates when the component unmounts.
  const {count, data, text} = deref(stateAtom);

  return (
    <div style={styles}>
      <h1>Count: {count}</h1>
      <button onClick={increment}>Moar</button>
      <button onClick={decrement}>Less</button>
      <button onClick={loadSomething}>Load Data</button>
      <input type="text" onChange={updateText} value={text} />
      <p>{JSON.stringify(data, null, '  ')}</p>
    </div>
  );
};
```

## Installation (...publishing in-progress)

`react-atom` has zero bundled `dependencies` and only one `peerDependency`,
namely, `react@>=v16.7.0-alpha`, which contains the new Hooks API that
`react-atom` abstracts upon.

```
npm i -S react-hooks react@react-atom@>=16.7.0-alpha react-dom@>=16.7.0-alpha
```

## API (...under construction)

...
