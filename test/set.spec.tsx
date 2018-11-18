import React from "react";
import {cleanup, getByTestId, render} from "react-testing-library";
import {Atom, deref, getAtomHooks, set} from "./../src/react-atom-internal";

const TEST_ATOM = Atom.of({count: 0});
let timesRendered = 0;

function ShowCount() {
  const {count} = deref(TEST_ATOM);
  timesRendered += 1;
  return (
    <div>
      <p data-testid="count">{count}</p>
    </div>
  );
}

describe("set function", () => {
  afterEach(() => {
    // WARNING! DON'T CHANGE THE ORDER OF THESE:
    set(TEST_ATOM, () => ({count: 0}));
    timesRendered = 0;
    cleanup();
    // END WARNING
  });

  it("is a function", () => {
    expect(set).toBeInstanceOf(Function);
  });

  it("sets the Atom's value to the passed-in value", () => {
    const {container} = render(<ShowCount />);
    set(TEST_ATOM, {count: 1});
    expect(getByTestId(container, "count").textContent).toBe("1");
  });

  it("triggers a rerender on a Component that derefs the Atom being set", () => {
    render(<ShowCount />);
    set(TEST_ATOM, {count: 1});
    set(TEST_ATOM, {count: 1});
    expect(timesRendered).toBe(3);
  });

  it("triggers a rerender on all Components that deref the Atom being set", () => {
    render(<ShowCount />); // 1
    render(<ShowCount />); // 2
    set(TEST_ATOM, {count: 1}); // 3 & 4
    set(TEST_ATOM, {count: 1}); // 5 & 6
    expect(timesRendered).toBe(6);
  });

  it("does not attempt to rerender unmounted components that deref'ed the Atom being set (no memory leak)", () => {
    render(<ShowCount />);
    const {unmount: unmountShowCount2} = render(<ShowCount />);
    const hookCountBefore = getAtomHooks(TEST_ATOM).length;
    unmountShowCount2();
    const hookCountAfter = getAtomHooks(TEST_ATOM).length;
    expect(hookCountBefore).toBe(2);
    expect(hookCountAfter).toBe(1);
  });
});
