import { connectAtom } from "../src/react-atom-internal";
import * as React from "react";
import { Atom, deref, swap } from "@libre/atom";
import { cleanup, render, getByTestId } from "react-testing-library";
import { act } from "react-dom/test-utils";

interface ITestAtom {
  count: number;
  notACount: string;
}

interface ITestProps {
  testProp: string;
}

interface ITestStateProps {
  countFromState: number;
}

const TEST_ATOM = Atom.of<ITestAtom>({ count: 3, notACount: "kek" });
let timesRendered = 0;

class TestComponent extends React.Component<ITestProps & ITestStateProps> {
  render() {
    timesRendered += 1;
    const props = this.props;
    return (
      <div>
        <p data-testid="testProp">{props.testProp}</p>
        <p data-testid="countFromState">{props.countFromState}</p>
      </div>
    );
  }
}

describe("connectAtom function", () => {
  afterEach(() => {
    // WARNING! DON'T CHANGE THE ORDER OF THESE:
    timesRendered = 0;
    cleanup();
    // END WARNING
  });

  it("connectAtom is a function", () => {
    expect(connectAtom).toBeInstanceOf(Function);
  });

  it("should connect atom to class component without errors", () => {
    connectAtom(TEST_ATOM, state => ({ countFromState: state.count }))(TestComponent);
  });

  it("returns the state of the connected atom", () => {
    const ConnectedComponent = connectAtom(TEST_ATOM, state => ({ countFromState: state.count }))(TestComponent);
    const { container } = render(<ConnectedComponent testProp="test prop" />);
    const actualCountFromState = getByTestId(container, "countFromState").textContent;
    const expectedCountFromState = deref(TEST_ATOM).count.toString();

    expect(actualCountFromState).toBe(expectedCountFromState);
  });

  it("returns component props", () => {
    const ConnectedComponent = connectAtom(TEST_ATOM, state => ({ countFromState: state.count }))(TestComponent);
    const expectedTestProp = "test prop";
    const { container } = render(<ConnectedComponent testProp="test prop" />);
    const actualTestProp = getByTestId(container, "testProp").textContent;

    expect(actualTestProp).toBe(expectedTestProp);
  });

  it("returns the same values across multiple renders", () => {
    const ConnectedComponent = connectAtom(TEST_ATOM, state => ({ countFromState: state.count }))(TestComponent);
    const { container, rerender } = render(<ConnectedComponent testProp="test prop" />);
    const statePropValue = getByTestId(container, "countFromState").textContent;
    const propValue = getByTestId(container, "testProp").textContent;

    for (let i = 0; i < 10; i++) {
      rerender(<ConnectedComponent testProp="test prop" />);
      let statePropValueAfterRerender = getByTestId(container, "countFromState").textContent;
      let propValueAfterRerender = getByTestId(container, "testProp").textContent;
      expect(statePropValueAfterRerender).toBe(statePropValue);
      expect(propValueAfterRerender).toBe(propValue);
    }
  });

  it("returns changed state of the atom after swap", () => {
    const ConnectedComponent = connectAtom(TEST_ATOM, state => ({ countFromState: state.count }))(TestComponent);
    const { container } = render(<ConnectedComponent testProp="string" />);
    let actualCountFromState = getByTestId(container, "countFromState").textContent;
    let expectedCountFromState = deref(TEST_ATOM).count.toString();
    expect(actualCountFromState).toBe(expectedCountFromState);
    act(() => {
      swap(TEST_ATOM, state => ({ ...state, count: 8 }));
    });
    actualCountFromState = getByTestId(container, "countFromState").textContent;
    expectedCountFromState = deref(TEST_ATOM).count.toString();
    expect(actualCountFromState).toBe(expectedCountFromState);
  });
});
