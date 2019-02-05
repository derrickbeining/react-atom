import { Atom, AtomState, deref } from "@libre/atom";
import * as React from "react";
import { cleanup, getByTestId, render } from "react-testing-library";
import * as ErrorMsgs from "../src/error-messages";

import { useAtom } from "./../src/react-atom-internal";

const TEST_ATOM = Atom.of({ count: 1 });
let timesRendered = 0;

function ShowCount(fns?: Record<string, (v: AtomState<typeof TEST_ATOM>) => void>) {
  const state = useAtom(TEST_ATOM);
  timesRendered += 1;
  if (fns) {
    Object.keys(fns).forEach(k => void fns[k](state));
  }

  return (
    <div>
      <p data-testid="target">{state.count}</p>
    </div>
  );
}

describe("useAtom function", () => {
  afterEach(() => {
    // WARNING! DON'T CHANGE THE ORDER OF THESE:
    timesRendered = 0;
    cleanup();
    // END WARNING
  });

  it("is a function", () => {
    expect(useAtom).toBeInstanceOf(Function);
  });

  it("fails when called outside of a React function component", () => {
    expect(() => useAtom(TEST_ATOM)).toThrow(ErrorMsgs.calledUseAtomOutsideFunctionComponent);
    expect(() => render(<ShowCount />)).not.toThrow();
  });

  it("fails when called with anything other than an Atom instance", () => {
    const pojo: unknown = {};
    const arr: unknown = [];
    const num: unknown = 1;
    const str: unknown = "hello";
    const bool: unknown = true;
    expect(() => useAtom(pojo as Atom<any>)).toThrow(ErrorMsgs.calledUseAtomWithNonAtom);
    expect(() => useAtom(arr as Atom<any>)).toThrow(ErrorMsgs.calledUseAtomWithNonAtom);
    expect(() => useAtom(num as Atom<any>)).toThrow(ErrorMsgs.calledUseAtomWithNonAtom);
    expect(() => useAtom(str as Atom<any>)).toThrow(ErrorMsgs.calledUseAtomWithNonAtom);
    expect(() => useAtom(bool as Atom<any>)).toThrow(ErrorMsgs.calledUseAtomWithNonAtom);
  });

  it("returns the state of the atom", () => {
    const { container } = render(<ShowCount />);
    const actual = getByTestId(container, "target").textContent;
    const expected = deref(TEST_ATOM).count.toString();
    expect(actual).toBe(expected);
  });

  it("returns the same value across multiple renders", () => {
    let ref: any = null;
    const { rerender, container } = render(
      <ShowCount
        getRef={(v: AtomState<typeof TEST_ATOM>) => {
          ref = v;
        }}
      />
    );
    rerender(
      <ShowCount
        test={(v: AtomState<typeof TEST_ATOM>) => {
          expect(v).toBe(ref);
          expect(v.count).toBe(1);
        }}
      />
    );
    rerender(
      <ShowCount
        test={(v: AtomState<typeof TEST_ATOM>) => {
          expect(v).toBe(ref);
          expect(v.count).toBe(1);
        }}
      />
    );
  });

  describe("options.select", () => {
    it("is applied to the Atom state to derive the value to use", () => {
      const TEST_ATOM = Atom.of({ nums: [1, 2, 3, 4, 5] });

      function Sum() {
        const sum = useAtom(TEST_ATOM, {
          select: s => s.nums.reduce((a, b) => a + b)
        });

        return (
          <div>
            <p data-testid="target">{sum}</p>
          </div>
        );
      }

      const { container } = render(<Sum />);
      const actual = getByTestId(container, "target").textContent;
      const expected = "15";
      expect(actual).toBe(expected);
    });

    it("defaults to identity fn if set to falsey value", () => {
      const TEST_ATOM = Atom.of("hello");
      const nilSelect: unknown = undefined;

      function Sum() {
        const sum = useAtom(TEST_ATOM, {
          select: nilSelect as (s: string) => any
        });

        return (
          <div>
            <p data-testid="target">{sum}</p>
          </div>
        );
      }

      const { container } = render(<Sum />);
      const actual = getByTestId(container, "target").textContent;
      const expected = "hello";
      expect(actual).toBe(expected);
    });

    it("works with multiple atoms; not mixing up / losing their states", () => {
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

      rerender(<MultiAtom />);
      expect(getByTestId(container, "a").textContent).toBe("15");
      expect(getByTestId(container, "b").textContent).toBe("9");
      expect(getByTestId(container, "c").textContent).toBe("hello");

      rerender(<MultiAtom />);
      expect(getByTestId(container, "a").textContent).toBe("15");
      expect(getByTestId(container, "b").textContent).toBe("9");
      expect(getByTestId(container, "c").textContent).toBe("hello");
    });

    it("updates the function whenever passed a new function instance", () => {
      const TEST_ATOM = Atom.of({ nums: [1, 2, 3, 4, 5] });
      const state = deref(TEST_ATOM);
      const getter1 = (s: typeof state) => s.nums.reduce((a, b) => a + b);
      const getter2 = (s: typeof state) => s.nums.reduce((a, b) => a - b);

      function Sum({ getter }: { getter: (s: typeof state) => number }) {
        const sum = useAtom(TEST_ATOM, { select: getter });

        return (
          <div>
            <p data-testid="target">{JSON.stringify(sum)}</p>
          </div>
        );
      }

      const { container: c1, rerender } = render(<Sum getter={getter1} />);
      expect(getByTestId(c1, "target").textContent).toBe("15");
      rerender(<Sum getter={getter2} />);
      expect(getByTestId(c1, "target").textContent).toBe("-13");
      rerender(<Sum getter={getter2} />);
      expect(getByTestId(c1, "target").textContent).toBe("-13");
      rerender(<Sum getter={getter1} />);
      expect(getByTestId(c1, "target").textContent).toBe("15");
    });

    it("defaults to identity fn even if previously set with an actual function", () => {
      const innerState = { nums: [1, 2, 3, 4, 5] };
      const TEST_ATOM = Atom.of(innerState);
      const state = deref(TEST_ATOM);
      const getter1 = (s: typeof state) => s.nums.reduce((a, b) => a + b);
      const nilGetter: unknown = undefined;

      function Sum({ getter }: { getter: (s: typeof state) => number }) {
        const sum = useAtom(TEST_ATOM, { select: getter });

        return (
          <div>
            <p data-testid="target">{JSON.stringify(sum)}</p>
          </div>
        );
      }

      const { container: c1, rerender } = render(<Sum getter={getter1} />);
      expect(getByTestId(c1, "target").textContent).toBe("15");
      rerender(<Sum getter={nilGetter as typeof getter1} />);
      expect(getByTestId(c1, "target").textContent).toBe(JSON.stringify(innerState));
    });
  });
});
