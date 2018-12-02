import * as React from "react";
import { cleanup, getByTestId, render } from "react-testing-library";
import * as ErrorMsgs from "../src/error-messages";

import { Atom, deref, getAtomVal } from "./../src/react-atom-internal";

const TEST_ATOM = Atom.of({ count: 1 });

describe("deref", () => {
  afterEach(() => {
    cleanup();
  });

  it("is a function", () => {
    expect(deref).toBeInstanceOf(Function);
  });

  it("fails when called with anything other than an Atom instance", () => {
    const pojo: unknown = {};
    const arr: unknown = [];
    const num: unknown = 1;
    const str: unknown = "hello";
    const bool: unknown = true;
    expect(() => deref(pojo as Atom<any>)).toThrow(ErrorMsgs.calledDerefWithNonAtom);
    expect(() => deref(arr as Atom<any>)).toThrow(ErrorMsgs.calledDerefWithNonAtom);
    expect(() => deref(num as Atom<any>)).toThrow(ErrorMsgs.calledDerefWithNonAtom);
    expect(() => deref(str as Atom<any>)).toThrow(ErrorMsgs.calledDerefWithNonAtom);
    expect(() => deref(bool as Atom<any>)).toThrow(ErrorMsgs.calledDerefWithNonAtom);
  });

  it("returns the state of the atom", () => {
    const actual = deref(TEST_ATOM).count;
    const expected = 1;
    expect(actual).toBe(expected);
  });

  describe("options.select", () => {
    it("is applied to the Atom state to derive the value to use", () => {
      const TEST_ATOM = Atom.of({ nums: [1, 2, 3, 4, 5] });

      const actual = deref(TEST_ATOM, {
        select: s => s.nums.reduce((a, b) => a + b)
      });
      const expected = 15;
      expect(actual).toBe(expected);
    });

    it("updates the function whenever passed a new function instance", () => {
      const TEST_ATOM = Atom.of({ nums: [1, 2, 3, 4, 5] });
      const state = getAtomVal(TEST_ATOM);
      const getter1 = (s: typeof state) => s.nums.reduce((a, b) => a + b);
      const getter2 = (s: typeof state) => s.nums.reduce((a, b) => a - b);

      function Sum({ getter }: { getter: (s: typeof state) => number }) {
        const sum = deref(TEST_ATOM, { select: getter });

        return (
          <div>
            <p data-testid="target">{sum}</p>
          </div>
        );
      }

      const { container: c1 } = render(<Sum getter={getter1} />);
      expect(getByTestId(c1, "target").textContent).toBe("15");

      const { container: c2 } = render(<Sum getter={getter2} />);
      expect(getByTestId(c2, "target").textContent).toBe("-13");
    });
  });
});
