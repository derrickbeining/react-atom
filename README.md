# React Atom

> Dead simple state management for React apps.
>
> ~~Plagiarized from~~ Inspired by
> [ratom](https://purelyfunctional.tv/guide/reagent/#atoms)s from
> [reagent.cljs](https://reagent-project.github.io/)
>
> Built on top of [React Hooks](https://reactjs.org/docs/hooks-intro.html)

## Elevator Pitch:

Below you will find a complete Redux replacement with **zero** boilerplate

```jsx
import * as React from 'react';
import {Atom, deref, swap} from 'react-atom';

/////////////////////// APP STATE /////////////////////////
const stateAtom = Atom.of({
  count: 0,
  text: '',
});

///////////////// STATE UPDATE ACTIONS /////////////////////
const increment = () =>
  swap(stateAtom, (state) => ({...state, count: state.count + 1}));

const decrement = () =>
  swap(stateAtom, (state) => ({...state, count: state.count + 1}));

const updateText = (evt) =>
  swap(stateAtom, (state) => ({...state, text: evt.target.value}));

///////////////// COMPONENT  /////////////////////
export const App = () => {
  const {count, text} = deref(state);

  return (
    <div style={styles}>
      <h1>Count: {count}!</h1>
      <button onClick={increment}>Moar</button>
      <button onClick={decrement}>Less</button>
      <input type="text" onChange={updateText} value={text} />
    </div>
  );
};
```

## Installation (...publishing in-progress)

`react-atom` has zero bundled `dependencies` and only one `peerDependency`,
namely, `react@>=v16.7.0-alpha`, which contains the new Hooks API that
`react-atom` abstract upon.

```
npm i -S react-hooks react@react-atom@>=16.7.0-alpha react-dom@>=16.7.0-alpha
```

## Usage (...under construction)

...
