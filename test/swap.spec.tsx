import React from "react";
import { cleanup, getByTestId, render } from "react-testing-library";
import { Atom, swap, useAtom } from "./../src/react-atom-internal";

const TEST_ATOM = Atom.of({ count: 0 });
let timesRendered = 0;

function ShowCount() {
  const { count } = useAtom(TEST_ATOM);
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
    swap(TEST_ATOM, () => ({ count: 0 }));
    timesRendered = 0;
    cleanup();
    // END WARNING
  });

  it("is a function", () => {
    expect(swap).toBeInstanceOf(Function);
  });

  it("applies the passed-in fn to the Atom's value and sets the Atom's value to the return value", () => {
    const { container } = render(<ShowCount />);
    swap(TEST_ATOM, s => ({ ...s, count: s.count + 1 }));
    expect(getByTestId(container, "count").textContent).toBe("1");
  });

  it("triggers a rerender on a Component that uses the swapped Atom", () => {
    render(<ShowCount />);
    swap(TEST_ATOM, s => ({ count: s.count + 1 }));
    swap(TEST_ATOM, s => ({ count: s.count + 1 }));
    expect(timesRendered).toBe(3);
  });

  it("triggers a rerender on all Components that useAtom the swapped Atom", () => {
    render(<ShowCount />); // 1
    render(<ShowCount />); // 2
    swap(TEST_ATOM, s => ({ count: s.count + 1 })); // 3 & 4
    swap(TEST_ATOM, s => ({ count: s.count + 1 })); // 5 & 6
    expect(timesRendered).toBe(6);
  });

  it("does not attempt to rerender unmounted components that had previously called `useAtom` on the Atom being swapped", () => {
    const component1 = render(<ShowCount />); // 1
    const component2 = render(<ShowCount />); // 2

    swap(TEST_ATOM, s => ({ count: s.count + 1 })); // 3 & 4 (2 components)
    component2.unmount();
    swap(TEST_ATOM, s => ({ count: s.count + 1 })); // 5 (1 component)

    expect(timesRendered).toBe(5);
  });

  it(`does not re-render components when they call useAtom with options.select and the current and next
  state returned by options.select are shallowly equal`, () => {
    const nums = [1, 2, 3, 4, 5];
    const TEST_ATOM = Atom.of({ nums });
    let timesRendered = 0;

    function ShowCount() {
      const { nums: n } = useAtom(TEST_ATOM, { select: s => s });
      timesRendered += 1;
      return (
        <div>
          <p>this doesn't matter</p>
        </div>
      );
    }

    render(<ShowCount />); // render 1
    swap(TEST_ATOM, s => s); // shouldn't trigger a render
    swap(TEST_ATOM, s => s); // shouldn't trigger a render
    swap(TEST_ATOM, s => s); // shouldn't trigger a render
    swap(TEST_ATOM, s => ({ ...s, nums: [1, 2, 3, 4, 5] })); // render 2
    expect(timesRendered).toBe(2);
  });
});
