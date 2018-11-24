import React from "react";
import {cleanup, getByTestId, render} from "react-testing-library";
import {Atom, listHooks, set, useAtom} from "./../src/react-atom-internal";

const TEST_ATOM = Atom.of({count: 0});
let timesRendered = 0;

function ShowCount() {
  const {count} = useAtom(TEST_ATOM);
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
    set(TEST_ATOM, {count: 0});
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

  it("triggers a rerender on a Component that uses the Atom being set", () => {
    render(<ShowCount />);
    set(TEST_ATOM, {count: 1});
    set(TEST_ATOM, {count: 2});
    expect(timesRendered).toBe(3);
  });

  it("triggers a rerender on all Components that useAtom the Atom being set", () => {
    render(<ShowCount />); // 1
    render(<ShowCount />); // 2
    set(TEST_ATOM, {count: 1}); // 3 & 4
    set(TEST_ATOM, {count: 2}); // 5 & 6
    expect(timesRendered).toBe(6);
  });

  it("does not attempt to rerender unmounted components that useAtom'ed the Atom being set (no memory leak)", () => {
    render(<ShowCount />);
    const {unmount: unmountShowCount2} = render(<ShowCount />);
    const hookCountBefore = listHooks(TEST_ATOM).length;
    unmountShowCount2();
    const hookCountAfter = listHooks(TEST_ATOM).length;
    expect(hookCountBefore).toBe(2);
    expect(hookCountAfter).toBe(1);
  });

  it(`does not re-render components that use an optional selector function to useAtom an atom when the current and next
  state returned by the selector are shallowly equal`, () => {
    const nums = [1, 2, 3, 4, 5];
    const TEST_ATOM = Atom.of({nums});
    let timesRendered = 0;

    function ShowCount() {
      const {nums: n} = useAtom(TEST_ATOM, {select: (s) => s});
      timesRendered += 1;
      return (
        <div>
          <p>this doesn't matter</p>
        </div>
      );
    }

    render(<ShowCount />); // render 1
    set(TEST_ATOM, {nums}); // shouldn't trigger a render
    set(TEST_ATOM, {nums}); // shouldn't trigger a render
    set(TEST_ATOM, {nums}); // shouldn't trigger a render
    set(TEST_ATOM, {nums: [, 2, 3, 4, 5]}); // render 2
    expect(timesRendered).toBe(2);
  });
});
