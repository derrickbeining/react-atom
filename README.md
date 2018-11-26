<h1 align="center">react-atom</h1>
<div>
  <p align="center">
    <img 
      src="https://document-export.canva.com/DADKCHDUJzk/169/preview/0001-533895153.png"
      height="350"
      width="350"
      alt="react-atom logo" />
  </p>
</div>

<h3 align="center">A simple, principled way to manage shared state in <a href="https://reactjs.org/">React</a></h3>

<h3 align="center">Built on React's new <a href="https://github.com/reactjs/reactjs.org/blob/f203cd5d86c4c611a31a4f72c5a91e2db0858ce3/content/docs/hooks-intro.md">Hooks API</a></h3>

<h3 align="center">Inspired by <a href="https://purelyfunctional.tv/guide/reagent/#atoms">atom</a>s in <a href="https://reagent-project.github.io/">reagent.cljs</a></h3>

> #### Disclaimer: the React Hooks API is currently only a proposal, therefore this library should be considered experimental and unfit for production apps at this time

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

`react-atom` provides a simple, principled way to manage shared state in React:

- `Atom`s hold your state
- the `useAtom` [custom React Hook][customhooksurl] lets your components read and subscribe to `Atom` state so they re-render when it changes
- `swap` allows you to change an `Atom`'s state by applying a pure function to the `Atom`'s current state to compute its next state.

Create an `Atom` with some state, like this:

```js
const appState = Atom.of({ count: 0 });
```

Use the `Atom` in your function components with the `useAtom` [custom React Hook][customhooksurl], like this:

```js
const { count } = useAtom(appState);
```

Use `swap` to change the state of an `Atom`, like this:

```js
swap(appState, ({ count }) => ({ count: count + 1 }));
```

### Advantages

<details>
  <summary>
    😌 <strong>Tiny API / learning curve</strong>
  </summary>
  A total of five functions, and most of the time you'll only need three of them.
</details>
<details>
  <summary>
    🚫 <strong>No verbose boilerplate conventions required</strong>   
  </summary>
  You could use <code>redux</code>-style actions and reducers to update state with <code>react-atom</code>, but you certainly don't have to.
</details>
<details>
  <summary>
    🎵 <strong>Tuned for performant component rendering</strong>   
  </summary>
  The <code>useAtom</code> hook accepts an optional <code>select</code> function that lets components subscribe to computed state. That means the component will only re-render when the value returned from <code>select</code> changes. 
</details>
<details>
  <summary>
    <span style="background:#00a1f1;color:white;font-weight:500;padding:1px 0px;">TS</span> <strong>First-class TypeScript support</strong>   
  </summary>
  <code>react-atom</code> is written in TypeScript so that every release is published with correct, high quality typings.
</details>
<details>
  <summary>
  👣 <strong>Tiny footprint</strong> 
  </summary>

  <a href="https://bundlephobia.com/result?p=@dbeining/react-atom">
    <image 
      src="https://img.shields.io/bundlephobia/min/@dbeining/react-atom.svg" 
      alt="react-atom minified file size"/>
  </a>

  <a href="https://bundlephobia.com/result?p=@dbeining/react-atom">
    <image 
      src="https://img.shields.io/bundlephobia/minzip/@dbeining/react-atom.svg" 
      alt="react-atom minified+gzipped file size"/>
  </a>
  
</details>
<details>
  <summary>
    ⚛️ <strong>Embraces React's future with Hooks</strong>   
  </summary>
  Hooks will make <code>class</code> components and their kind (higher-order components, render-prop components, and function-as-child components) obsolete. <code>react-atom</code> makes it easy to manage shared state with just function components and hooks.
</details>

---

## Code Example: `react-atom` in action

<details>
  <summary>
   Click for code sample 
  </summary>

```jsx
import React from "react";
import ReactDOM from "react-dom";
import { Atom, useAtom, swap } from "@dbeining/react-atom";

//------------------------ APP STATE ------------------------------//
const stateAtom = Atom.of({
  count: 0,
  text: "",
  data: {
    // ...just imagine
  }
});

//------------------------ EFFECTS ------------------------------//
const increment = () => swap(stateAtom, state => ({ ...state, count: state.count + 1 }));

const decrement = () => swap(stateAtom, state => ({ ...state, count: state.count - 1 }));

const updateText = evt => swap(stateAtom, state => ({ ...state, text: evt.target.value }));

const loadSomething = () =>
  fetch("https://jsonplaceholder.typicode.com/todos/1")
    .then(res => res.json())
    .then(data => swap(stateAtom, state => ({ ...state, data })))
    .catch(console.error);

//------------------------ COMPONENT ------------------------------//
export const App = () => {
  const { count, data, text } = useAtom(stateAtom);

  return (
    <div>
      <p>Count: {count}</p>
      <p>Text: {text}</p>

      <button onClick={increment}>Moar</button>
      <button onClick={decrement}>Less</button>
      <button onClick={loadSomething}>Load Data</button>
      <input type="text" onChange={updateText} value={text} />

      <p>{JSON.stringify(data, null, "  ")}</p>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
```

</details>

## Try `react-atom` in CodeSandbox

You can play with `react-atom` live right away with no setup at the following links:

| JavaScript Sandbox              | TypeScript Sandbox              |
| ------------------------------- | ------------------------------- |
| [![try react-atom][imgurl]][js] | [![try react-atom][imgurl]][ts] |

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

[customhooksurl]: https://github.com/reactjs/reactjs.org/blob/b7262e78b6efe1d7901afd851fb9cbef5414b361/content/docs/hooks-custom.md
[hooksurl]: https://github.com/reactjs/reactjs.org/blob/f203cd5d86c4c611a31a4f72c5a91e2db0858ce3/content/docs/hooks-intro.md
[imgurl]: https://codesandbox.io/static/img/play-codesandbox.svg
[js]: https://codesandbox.io/s/m3x9wn6kmy
[ts]: https://codesandbox.io/s/km72yynqov
