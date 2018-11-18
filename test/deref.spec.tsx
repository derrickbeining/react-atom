import * as React from "react";
import {cleanup, getByTestId, render} from "react-testing-library";

import {Atom, deref, getAtomHooks} from "./../src/react-atom-internal";

const TEST_ATOM = Atom.of({count: 1});
let timesRendered = 0;

function ShowCount() {
  const {count} = deref(TEST_ATOM);
  timesRendered += 1;

  return (
    <div>
      <p data-testid="target">{count}</p>
    </div>
  );
}

describe("deref function", () => {
  afterEach(() => {
    // WARNING! DON'T CHANGE THE ORDER OF THESE:
    timesRendered = 0;
    cleanup();
    // END WARNING
  });

  it("is a function", () => {
    expect(deref).toBeInstanceOf(Function);
  });

  it("fails when called outside of a React function component", () => {
    expect(() => deref(TEST_ATOM)).toThrow();
    expect(() => render(<ShowCount />)).not.toThrow();
  });

  it("fails when called with anything other than an Atom instance", () => {
    expect(() => deref({})).toThrow(TypeError);
    expect(() => deref([])).toThrow(TypeError);
    expect(() => deref(1)).toThrow(TypeError);
    expect(() => deref("hello")).toThrow(TypeError);
    expect(() => deref(true)).toThrow(TypeError);
  });

  it("returns the state of the atom", () => {
    const {container} = render(<ShowCount />);
    expect(getByTestId(container, "target").textContent).toBe("1");
  });

  it("returns the same value across multiple renders", () => {
    const {rerender, container} = render(<ShowCount />);
    rerender(<ShowCount />);
    rerender(<ShowCount />);
    expect(getByTestId(container, "target").textContent).toBe("1");
  });

  it("stores a React useState hook to trigger component rerenders later when Atom changes", () => {
    const hookCountBefore = getAtomHooks(TEST_ATOM).length;
    expect(hookCountBefore).toBe(0);

    render(<ShowCount />); // render 1
    const hookCountAfter = getAtomHooks(TEST_ATOM).length;
    expect(hookCountAfter).toBe(1);

    getAtomHooks(TEST_ATOM).forEach((hook) => hook(true)); // render 2
    getAtomHooks(TEST_ATOM).forEach((hook) => hook(true)); // render 3

    expect(timesRendered).toBe(3);
  });

  it("discards its stored React useState hook when the component that deref'ed it unmounts (no memory leak)", () => {
    const component1 = render(<ShowCount />); // render 1
    const component2 = render(<ShowCount />); // render 2

    getAtomHooks(TEST_ATOM).forEach((hook) => hook(true)); // render 3 & 4 (2 components)

    const hookCountBeforeUnmount = getAtomHooks(TEST_ATOM).length;
    expect(hookCountBeforeUnmount).toBe(2);

    component2.unmount();

    const hookCountAfterUnmount = getAtomHooks(TEST_ATOM).length;
    expect(hookCountAfterUnmount).toBe(1);

    getAtomHooks(TEST_ATOM).forEach((hook) => hook(true)); // render 5 (1 component)
    expect(timesRendered).toBe(5);
  });
});
