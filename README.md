<h1 align="center" style="border-bottom: none;">🔄 react-atom ⚛</h1>

<h3 align="center">State-management made <em style="border-bottom: solid 1px;">simple</em> for <a href="https://reactjs.org/">React</a></h3>

<h4 align="center">Built on the <a href="https://github.com/reactjs/reactjs.org/blob/f203cd5d86c4c611a31a4f72c5a91e2db0858ce3/content/docs/hooks-intro.md">React Hooks API</a></h4>

<h4 align="center">Inspired by <a href="https://purelyfunctional.tv/guide/reagent/#atoms">atom</a>s in <a href="https://reagent-project.github.io/">reagent.cljs</a></h4>

> #### Disclaimer: the React Hooks API is currently only a proposal, therefore this library should be considered experimental and unfit for production apps at this time

---

[![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![npm (scoped)](https://img.shields.io/npm/v/@dbeining/react-atom.svg)](https://www.npmjs.com/package/@dbeining/react-atom)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/@dbeining/react-atom.svg)](https://bundlephobia.com/result?p=@dbeining/react-atom)
[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/@dbeining/react-atom.svg)](https://bundlephobia.com/result?p=@dbeining/react-atom)

[![Build Status](https://travis-ci.com/derrickbeining/react-atom.svg?branch=master)](https://travis-ci.com/derrickbeining/react-atom)
[![codecov](https://codecov.io/gh/derrickbeining/react-atom/branch/master/graph/badge.svg)](https://codecov.io/gh/derrickbeining/react-atom)
[![npm](https://img.shields.io/npm/dt/@dbeining/react-atom.svg)](https://www.npmjs.com/package/@dbeining/react-atom)

[![NpmLicense](https://img.shields.io/npm/l/@dbeining/react-atom.svg)](https://www.npmjs.com/package/@dbeining/react-atom)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Description

`react-atom` is a _lightweight_ abstraction over [React Hooks][hooksurl] that enables a truly _simple_, ergonomic, and intuitive approach to app state-management in React apps. It's meant to replace `redux`/`mobx`/etc for apps that embrace a pro-hooks, functions-only approach to React.

### Advantages

😌 Tiny API / learning curve  
🚫 No verbose boilerplate conventions  
🎵 Tuned for performant component rendering  
<span style="background:#00a1f1;color:white;font-weight:500;padding:1px;">TS</span> First-class TypeScript support  
🔬 Well-tested  
⚛️ Embraces React's future with Hooks

## Let's see some code

<details>
  <summary>
   Click for code sample 
  </summary>

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import {Atom, useAtom, swap} from '@dbeining/react-atom';

/////////////////////// APP STATE /////////////////////////
/**
 * An atom can be constructed with `Atom.of`.
 * The only way to get the value of an atom is with the `useAtom`
 * hook or `deref`
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
 * `swap` applies a pure function to the current state of the Atom
 * to compute and set its next state.
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
   * `useAtom` is a custom React Hook and should follow the "Rules of Hooks".
   * It reads the value of the atom at the time of rendering and
   * subscribes the component to the Atom so that it will rerender any
   * time the Atom's state changes. It will automatically unsubscribe
   * when the component unmounts.
   */
  const {count, data, text} = useAtom(stateAtom);

  return (
    <div>
      <p>Count: {count}</p>
      <p>Text: {text}</p>

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


## Try `react-atom` in CodeSandbox

You can play with `react-atom` live right away with no setup at the following links:


| JavaScript Sandbox              | TypeScript Sandbox              |
| ------------------------------- | ------------------------------- |
| [![try react-atom][imgurl]][js] | [![try react-atom][imgurl]][ts] |


[imgurl]:https://codesandbox.io/static/img/play-codesandbox.svg
[js]:https://codesandbox.io/s/m3x9wn6kmy
[ts]:https://codesandbox.io/s/km72yynqov



## Installation

`react-atom` has zero bundled `dependencies` and only two `peerDependency`,
namely, `react@^16.7.0-alpha.0` and `react-dom@^16.7.0-alpha.0`, which contain
the new Hooks API.

```
npm i -S @dbeining/react-atom react@^16.7.0-alpha.0 react-dom@^16.7.0-alpha.0
```

## Documentation

[You can find the API for `react-atom` here](https://derrickbeining.github.io/react-atom/)

## Contributing / Feedback

Please open an issue if you have any questions, suggestions for
improvements/features, or want to submit a PR for a bug-fix (please include
tests if applicable).


[hooksurl]:https://github.com/reactjs/reactjs.org/blob/f203cd5d86c4c611a31a4f72c5a91e2db0858ce3/content/docs/hooks-intro.md