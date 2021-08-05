import { Atom, deref } from "@libre/atom";
import * as React from "react";
import { cleanup, getByTestId, render } from "react-testing-library";

import { useAtom } from "./../src/react-atom-internal";
import { connect } from "./../src/connect";

const TEST_ATOM = Atom.of({ count: 1 });
let timesRendered = 0;

const ShowCount: React.FC<{ count: number }> = ({ count }) => {
  timesRendered += 1;

  return (
    <div>
      <p data-testid="target">{count}</p>
    </div>
  );
};

const ShowCountConnected: React.FC = connect(
  (state: { count: number }) => ({ count: state.count }),
  TEST_ATOM
)(ShowCount);

describe("connect function", () => {
  afterEach(() => {
    // WARNING! DON'T CHANGE THE ORDER OF THESE:
    timesRendered = 0;
    cleanup();
    // END WARNING
  });

  it("is a function", () => {
    expect(connect).toBeInstanceOf(Function);
  });

  it("returns a component that renders fine", () => {
    expect(() => render(<ShowCountConnected />)).not.toThrow();
  });

  it("passes the state of the atom", () => {
    const { container } = render(<ShowCountConnected />);
    const actual = getByTestId(container, "target").textContent;
    const expected = deref(TEST_ATOM).count.toString();
    expect(actual).toBe(expected);
  });
});
