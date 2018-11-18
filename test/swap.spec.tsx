import React from "react";
import {cleanup, getByTestId, render} from "react-testing-library";
import {Atom, deref, swap} from "./../src/react-atom-internal";

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

describe("swap function", () => {
  afterEach(() => {
    // WARNING! DON'T CHANGE THE ORDER OF THESE:
    swap(TEST_ATOM, () => ({count: 0}));
    timesRendered = 0;
    cleanup();
    // END WARNING
  });

  it("is a function", () => {
    expect(swap).toBeInstanceOf(Function);
  });

  it("applies the passed-in fn to the Atom's value and sets the Atom's value to the return value", () => {
    const {container} = render(<ShowCount />);
    swap(TEST_ATOM, (s) => ({...s, count: s.count + 1}));
    expect(getByTestId(container, "count").textContent).toBe("1");
  });

  it("triggers a rerender on a Component that derefs the swapped Atom", () => {
    render(<ShowCount />);
    swap(TEST_ATOM, (s) => s);
    swap(TEST_ATOM, (s) => s);
    expect(timesRendered).toBe(3);
  });

  it("triggers a rerender on all Components that deref the swapped Atom", () => {
    render(<ShowCount />); // 1
    render(<ShowCount />); // 2
    swap(TEST_ATOM, (s) => s); // 3 & 4
    swap(TEST_ATOM, (s) => s); // 5 & 6
    expect(timesRendered).toBe(6);
  });

  it("does not attempt to rerender unmounted components that deref'ed the Atom being swapped", () => {
    const component1 = render(<ShowCount />); // 1
    const component2 = render(<ShowCount />); // 2

    swap(TEST_ATOM, (s) => s); // 3 & 4 (2 components)
    component2.unmount();
    swap(TEST_ATOM, (s) => s); // 5 (1 component)

    expect(timesRendered).toBe(5);
  });
});
