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

  describe("re-rendering components that call useAtom with options.select", () => {
    it("makes components re-render with the next selected state", () => {
      const a = { a: "a" };
      const b = { a: "a" };
      const c = { a: "a" };
      const d = { a: "a" };
      const vals = [a, b, c, d];
      const TEST_ATOM = Atom.of(vals);

      function ShowCount<T>({ selector }: { selector: (s: Array<typeof b>) => T }) {
        const val = useAtom(TEST_ATOM, { select: selector });
        return (
          <div>
            <p data-testid={"target"}>{val}</p>
          </div>
        );
      }

      const { container: c1 } = render(<ShowCount selector={s => s[2].a} />);
      const { container: c2 } = render(<ShowCount selector={s => s.length} />);

      expect(getByTestId(c1, "target").textContent).toBe("a");
      expect(getByTestId(c2, "target").textContent).toBe("4");

      swap(TEST_ATOM, s => s.map(v => ({ a: v.a.toUpperCase() })));
      expect(getByTestId(c1, "target").textContent).toBe("A");
      expect(getByTestId(c2, "target").textContent).toBe("4");

      swap(TEST_ATOM, s => s.map(v => ({ a: "hello" })).slice(0, 3));
      expect(getByTestId(c1, "target").textContent).toBe("hello");
      expect(getByTestId(c2, "target").textContent).toBe("3");
    });

    it("prevents components from re-rendering when the value selected has not changed", () => {
      const a = { a: "a" };
      const b = { a: "a" };
      const c = { a: "a" };
      const d = { a: "a" };
      const vals = [a, b, c, d];
      const TEST_ATOM = Atom.of(vals);
      let timesRendered = 0;

      function ShowCount() {
        const vals = useAtom(TEST_ATOM, { select: s => ({ length: s.length, val: s[2] }) });
        timesRendered += 1;
        return (
          <div>
            <p>this doesn't matter</p>
          </div>
        );
      }

      render(<ShowCount />); // render 1
      expect(timesRendered).toBe(1);

      swap(TEST_ATOM, v => v); // didn't change; shouldn't rerender
      expect(timesRendered).toBe(1);

      swap(TEST_ATOM, () => [a, b, c, d]); // changed but shallowly equal; shouldn't rerender
      expect(timesRendered).toBe(1);

      swap(TEST_ATOM, () => [a, c, b, d]); // changed; not shallow eq; rerender!
      expect(timesRendered).toBe(2);

      swap(TEST_ATOM, () => [a, c, b, d]); // no change; shouldn't rerender
      expect(timesRendered).toBe(2);

      swap(TEST_ATOM, () => [a, c, b]); // change; rerender!
      expect(timesRendered).toBe(3);
    });

    it("works with multiple atoms; not mixing up their states or selectors", () => {
      const TEST_ATOM_A = Atom.of({ nums: [1, 2, 3, 4, 5] });
      const TEST_ATOM_B = Atom.of(9);
      const TEST_ATOM_C = Atom.of({ hi: "hello" });

      function MultiAtom() {
        const sum = useAtom(TEST_ATOM_A, {
          select: s => {
            return s.nums.reduce((a, b) => a + b);
          }
        });
        const num = useAtom(TEST_ATOM_B);
        const greeting = useAtom(TEST_ATOM_C, { select: s => s.hi });

        return (
          <div>
            <p data-testid="a">{sum}</p>
            <p data-testid="b">{num}</p>
            <p data-testid="c">{greeting}</p>
          </div>
        );
      }

      const { container, rerender } = render(<MultiAtom />);

      expect(getByTestId(container, "a").textContent).toBe("15");
      expect(getByTestId(container, "b").textContent).toBe("9");
      expect(getByTestId(container, "c").textContent).toBe("hello");

      swap(TEST_ATOM_A, s => ({ nums: s.nums.map(n => n + 1) }));
      expect(getByTestId(container, "a").textContent).toBe("20");
      expect(getByTestId(container, "b").textContent).toBe("9");
      expect(getByTestId(container, "c").textContent).toBe("hello");

      swap(TEST_ATOM_B, x => x + 1);
      expect(getByTestId(container, "a").textContent).toBe("20");
      expect(getByTestId(container, "b").textContent).toBe("10");
      expect(getByTestId(container, "c").textContent).toBe("hello");

      swap(TEST_ATOM_C, s => ({ hi: s.hi.toUpperCase() }));
      expect(getByTestId(container, "a").textContent).toBe("20");
      expect(getByTestId(container, "b").textContent).toBe("10");
      expect(getByTestId(container, "c").textContent).toBe("HELLO");
    });
  });
});
