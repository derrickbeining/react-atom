<div>
  <p align="center">
    <img 
      src="https://document-export.canva.com/DADKGVfSlSY/19/preview/0001-541240887.png"
      height="350"
      width="350"
      alt="react-atom logo" />
  </p>
</div>

<h3 align="center">A simple way to manage shared state in <a href="https://reactjs.org/">React</a></h3>

<h3 align="center">Built on the React <a href="https://github.com/reactjs/reactjs.org/blob/f203cd5d86c4c611a31a4f72c5a91e2db0858ce3/content/docs/hooks-intro.md">Hooks API</a></h3>

<h3 align="center">Inspired by <a href="https://purelyfunctional.tv/guide/reagent/#atoms">atom</a>s in <a href="https://reagent-project.github.io/">reagent.cljs</a></h3>

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

- [Description](#description)
- [Why use `react-atom`?](#why-use-react-atom)
- [Installation](#installation)
- [Documentation](#documentation)
- [Code Example: `react-atom` in action](#code-example-react-atom-in-action)
- [🕹️ Play with `react-atom` in CodeSandbox 🎮️](#%F0%9F%95%B9%EF%B8%8F-play-with-react-atom-in-codesandbox-%F0%9F%8E%AE%EF%B8%8F)
- [Contributing / Feedback](#contributing--feedback)


## Description

`react-atom` provides a very simple way to manage state in React, for both global app state and for local component state: ✨`Atom`s✨.

### Put your state in an `Atom`:

```ts
import { Atom } from "@dbeining/react-atom";

const appState = Atom.of({
  color: "blue",
  userId: 1
});
```

### Read state with `deref`

You can't inspect `Atom` state directly, you have to `deref`erence it, like this:

```js
import { deref } from "@dbeining/react-atom";

const { color } = deref(appState);
```

### Update state with `swap`

You can't modify an `Atom` directly. The main way to update state is with `swap`. Here's its call signature:

```ts
function swap<S>(atom: Atom<S>, updateFn: (state: S) => S): void;
```

`updateFn` is applied to `atom`'s state and the return value is set as `atom`'s new state. There are just two simple rules for `updateFn`:

1. it must return a value of the same type/interface as the previous state
2. it must not mutate the previous state

To illustrate, here is how we might update `appState`'s color:

```js
import { swap } from "@dbeining/react-atom";

const setColor = color =>
  swap(appState, state => ({
    ...state,
    color: color
  }));
```

Take notice that our `updateFn` is [spread](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)ing the old state onto a new object before overriding `color`. This is an easy way to obey the rules of `updateFn`.

### Side-Effects? Just use `swap`

You don't need to do anything special for managing side-effects. Just write your IO-related logic as per usual, and call `swap` when you've got what you need. For example:

```js
const saveColor = async color => {
  const { userId } = deref(appState);
  const theme = await post(`/api/user/${userId}/theme`, { color });
  swap(appState, state => ({ ...state, color: theme.color }));
};
```

### Re-render components on state change with the ✨`useAtom`✨ custom React hook

`useAtom` is a [custom React Hook][customhooksurl]. It does two things:

1. returns the current state of an atom (like `deref`), and
2. subscribes your component to the atom so that it re-renders every time its state changes

It looks like this:

```js
export function ColorReporter(props) {
  const { color, userId } = useAtom(appState);

  return (
    <div>
      <p>
        User {userId} has selected {color}
      </p>
      {/* `useAtom` hook will trigger a re-render on `swap` */}
      <button onClick={() => swap(appState, setRandomColor)}>Change Color</button>
    </div>
  );
}
```

> Nota Bene: You can also use a selector to subscribe to computed state by using the `options.select` argument. [Read the docs](https://derrickbeining.github.io/react-atom/globals.html#useatom) for details.

## Why use `react-atom`?

<details>
  <summary>
    😌 <strong>Tiny API / learning curve</strong>
  </summary>
  <blockquote>
    `Atom.of`, `useAtom`, and `swap` will cover the vast majority of use cases.
  </blockquote>
</details>
<details>
  <summary>
    🚫 <strong>No boilerplate, just predictable state management</strong>   
  </summary>
  <blockquote>
   Reducers? Actions? Thunks? Sagas? Nope, just `swap(atom, state => newState)`. 
  </blockquote>
</details>
<details>
  <summary>
    🎵 <strong>Tuned for performant component rendering</strong>   
  </summary>
  <blockquote>
  The <code>useAtom</code> hook accepts an optional <code>select</code> function that lets components subscribe to computed state. That means the component will only re-render when the value returned from <code>select</code> changes.
  </blockquote>
</details>
<details>
  <summary>
    😬 <strong><code>React.useState</code> doesn't play nice with <code>React.memo</code></strong>
  </summary>
  <blockquote>
<code>useState</code> is cool until you realize that in most cases it forces you to pass new function instances through props on every render because you usually need to wrap the <code>setState</code> function in another function. That makes it hard to take advantage of <code>React.memo</code>. For example:
<div>---</div>

```jsx
function Awkwardddd(props) {
  const [name, setName] = useState("");
  const [bigState, setBigState] = useState({ ...useYourImagination });

  const updateName = evt => setName(evt.target.value);
  const handleDidComplete = val => setBigState({ ...bigState, inner: val });

  return (
    <>
      <input type="text" value={name} onChange={updateName} />
      <ExpensiveButMemoized data={bigState} onComplete={handleDidComplete} />
    </>
  );
}
```

Every time `input` fires `onChange`, `ExpensiveButMemoized` has to re-render because `handleDidComplete` is not strictly equal (===) to the last instance passed down.

The React docs admit this is awkward and [suggest using Context to work around it](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down), because [the alternative is super convoluted](https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback).

With `react-atom`, this problem doesn't even exist. You can define your update functions outside the component so they are referentially stable across renders.

```jsx
const state = Atom.of({ name, bigState: { ...useYourImagination } });

const updateName = ({ target }) => swap(state, prev => ({ ...prev, name: target.value }));

const handleDidComplete = val =>
  swap(state, prev => ({
    ...prev,
    bigState: { ...prev.bigState, inner: val }
  }));

function SoSmoooooth(props) {
  const { name, bigState } = useAtom(state);

  return (
    <>
      <input type="text" value={name} onChange={updateName} />
      <ExpensiveButMemoized data={bigState} onComplete={handleDidComplete} />
    </>
  );
}
```

</blockquote>
</details>
<details>
  <summary>
    <span style="background:#00a1f1;color:white;font-weight:500;padding:1px 0px;">TS</span> <strong>First-class TypeScript support</strong>   
  </summary>
  <blockquote>
  <code>react-atom</code> is written in TypeScript so that every release is published with correct, high quality typings.
  </blockquote>
</details>
<details>
  <summary>
  👣 <strong>Tiny footprint</strong> 
  </summary>
<blockquote>
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
  </blockquote>
</details>
<details>
  <summary>
    ⚛️ <strong>Embraces React's future with Hooks</strong>   
  </summary>
  <blockquote>
  Hooks will make <code>class</code> components and their kind (higher-order components, render-prop components, and function-as-child components) obsolete. <code>react-atom</code> makes it easy to manage shared state with just function components and hooks.
  </blockquote>
</details>


## Installation

```
npm i -S @dbeining/react-atom
```

## Dependencies
`react-atom` has one bundled dependency, [@libre/atom](https://github.com/libre-org/atom), which provides the Atom data type. It is re-exported in its entirety from `@dbeining/atom`. You may want to reference the docs [here](https://libre-org.github.io/atom/).

`react-atom` also has two `peerDependencies`, namely, `react@^16.8.0` and `react-dom@^16.8.0`, which contain the Hooks API.

## Documentation

[`react-atom` API](https://derrickbeining.github.io/react-atom/)

[`@libre/atom` API](https://libre-org.github.io/atom/)

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

const increment = () =>
  swap(stateAtom, state => ({
    ...state,
    count: state.count + 1
  }));

const decrement = () =>
  swap(stateAtom, state => ({
    ...state,
    count: state.count - 1
  }));

const updateText = evt =>
  swap(stateAtom, state => ({
    ...state,
    text: evt.target.value
  }));

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

## 🕹️ Play with `react-atom` in CodeSandbox 🎮️

You can play with `react-atom` live right away with no setup at the following links:

| JavaScript Sandbox              | TypeScript Sandbox              |
| ------------------------------- | ------------------------------- |
| [![try react-atom][imgurl]][js] | [![try react-atom][imgurl]][ts] |

## Contributing / Feedback

Please open an issue if you have any questions, suggestions for
improvements/features, or want to submit a PR for a bug-fix (please include
tests if applicable).

[customhooksurl]: https://github.com/reactjs/reactjs.org/blob/98c1d22fbef2638cafb03b07e0eabe2a6186fca8/content/docs/hooks-custom.md
[hooksurl]: https://github.com/reactjs/reactjs.org/blob/98c1d22fbef2638cafb03b07e0eabe2a6186fca8/content/docs/hooks-intro.md
[imgurl]: https://codesandbox.io/static/img/play-codesandbox.svg
[js]: https://codesandbox.io/s/m3x9wn6kmy
[ts]: https://codesandbox.io/s/km72yynqov
