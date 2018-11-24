import * as React from "react";
import {cleanup, getByTestId, render} from "react-testing-library";
import * as ErrorMsgs from "../src/error-messages";

import {
  Atom,
  getAtomVal,
  getHooks,
  listHooks,
  useAtom,
} from "./../src/react-atom-internal";

const TEST_ATOM = Atom.of({count: 1});
let timesRendered = 0;

function ShowCount() {
  const {count} = useAtom(TEST_ATOM);
  timesRendered += 1;

  return (
    <div>
      <p data-testid="target">{count}</p>
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
    expect(() => useAtom(TEST_ATOM)).toThrow(
      ErrorMsgs.calledUseAtomOutsideFunctionComponent,
    );
    expect(() => render(<ShowCount />)).not.toThrow();
  });

  it("fails when called with anything other than an Atom instance", () => {
    expect(() => useAtom({})).toThrow(ErrorMsgs.calledUseAtomWithNonAtom);
    expect(() => useAtom([])).toThrow(ErrorMsgs.calledUseAtomWithNonAtom);
    expect(() => useAtom(1)).toThrow(ErrorMsgs.calledUseAtomWithNonAtom);
    expect(() => useAtom("hello")).toThrow(ErrorMsgs.calledUseAtomWithNonAtom);
    expect(() => useAtom(true)).toThrow(ErrorMsgs.calledUseAtomWithNonAtom);
  });

  it("returns the state of the atom", () => {
    const {container} = render(<ShowCount />);
    const actual = getByTestId(container, "target").textContent;
    const expected = getAtomVal(TEST_ATOM).count.toString();
    expect(actual).toBe(expected);
  });

  it("returns the same value across multiple renders", () => {
    const {rerender, container} = render(<ShowCount />);
    rerender(<ShowCount />);
    rerender(<ShowCount />);
    expect(getByTestId(container, "target").textContent).toBe("1");
  });

  it("stores a React useState hook to trigger component rerenders later when Atom changes", () => {
    const hookCountBefore = listHooks(TEST_ATOM).length;
    expect(hookCountBefore).toBe(0);

    render(<ShowCount />); // render 1
    const hookCountAfter = listHooks(TEST_ATOM).length;
    expect(hookCountAfter).toBe(1);

    listHooks(TEST_ATOM).forEach((hook) => hook(true)); // render 2
    listHooks(TEST_ATOM).forEach((hook) => hook(true)); // render 3

    expect(timesRendered).toBe(3);

    expect(hookCountAfter).toBe(1);
  });

  it("stores the same hook to the same key regardless of times rendered", () => {
    const component = render(<ShowCount />); // render 1
    const hs1 = getHooks(TEST_ATOM);
    component.rerender(<ShowCount />);
    const hs2 = getHooks(TEST_ATOM);
    component.rerender(<ShowCount />);
    const hs3 = getHooks(TEST_ATOM);

    Object.keys(hs1).forEach((k) => {
      expect(hs1[k] === hs2[k] && hs1[k] === hs3[k]).toBe(true);
    });
  });

  it("stores a unique hook per component that uses an atom", () => {
    const component1 = render(<ShowCount />); // render 1
    const component2 = render(<ShowCount />); // render 2
    const component3 = render(<ShowCount />); // render 3

    const [h1, h2, h3] = listHooks(TEST_ATOM);
    expect(h1 !== h2 && h1 !== h2 && h2 !== h3).toBe(true);
  });

  it("discards its stored React useState hook when the component that used it unmounts (no memory leak)", () => {
    const component1 = render(<ShowCount />);
    const component2 = render(<ShowCount />);
    const component3 = render(<ShowCount />);
    const hooksBeforeUnmount = getHooks(TEST_ATOM);

    // test that the number of hooks decreases on unmount
    expect(listHooks(TEST_ATOM).length).toBe(3);
    component2.unmount();
    expect(listHooks(TEST_ATOM).length).toBe(2);

    const hooksAfterUnmount = getHooks(TEST_ATOM);

    // test that the remaining hooks are the same in-memory functions as before
    Object.keys(hooksAfterUnmount).forEach((k) => {
      expect(hooksAfterUnmount[k]).toEqual(hooksBeforeUnmount[k]);
    });
  });

  describe("options.select", () => {
    it("is applied to the Atom state to derive the value to use", () => {
      const TEST_ATOM = Atom.of({nums: [1, 2, 3, 4, 5]});
      let timesRendered = 0;

      function Sum() {
        const sum = useAtom(TEST_ATOM, {
          select: (s) => s.nums.reduce((a, b) => a + b),
        });
        timesRendered += 1;

        return (
          <div>
            <p data-testid="target">{sum}</p>
          </div>
        );
      }

      const {container} = render(<Sum />);
      const actual = getByTestId(container, "target").textContent;
      const expected = "15";
      expect(actual).toBe(expected);
    });

    it("updates the function whenever passed a new function instance", () => {
      const TEST_ATOM = Atom.of({nums: [1, 2, 3, 4, 5]});
      const state = getAtomVal(TEST_ATOM);
      const getter1 = (s: typeof state) => s.nums.reduce((a, b) => a + b);
      const getter2 = (s: typeof state) => s.nums.reduce((a, b) => a - b);

      function Sum({getter}: {getter: (s: typeof state) => number}) {
        const sum = useAtom(TEST_ATOM, {select: getter});
        timesRendered += 1;

        return (
          <div>
            <p data-testid="target">{sum}</p>
          </div>
        );
      }

      const {container: c1} = render(<Sum getter={getter1} />);
      expect(getByTestId(c1, "target").textContent).toBe("15");

      const {container: c2} = render(<Sum getter={getter2} />);
      expect(getByTestId(c2, "target").textContent).toBe("-13");
    });

    it("defaults to the identity function when falsey", () => {
      const TEST_ATOM = Atom.of({nums: [1, 2, 3, 4, 5]});
      const state = getAtomVal(TEST_ATOM);
      const getter1 = (s: typeof state) => s.nums.reduce((a, b) => a + b);
      const getter2 = (s: typeof state) => s.nums.reduce((a, b) => a - b);

      function Sum({getter}: {getter: (s: typeof state) => number}) {
        const sum = useAtom(TEST_ATOM, {select: getter});
        timesRendered += 1;

        return (
          <div>
            <p data-testid="target">{sum}</p>
          </div>
        );
      }

      const {container: c1} = render(<Sum getter={getter1} />);
      expect(getByTestId(c1, "target").textContent).toBe("15");

      const {container: c2} = render(<Sum getter={getter2} />);
      expect(getByTestId(c2, "target").textContent).toBe("-13");
    });
  });
});