// tslint:disable:no-console
import { Atom } from "@libre/atom";
import React, { useLayoutEffect, useMemo, useState } from "react";
import { render } from "react-testing-library";
import { initialize, useAtom } from "../src/react-atom-internal";

describe("initialize", function() {
  it("causes default useAtom instance to throw an error when used because it creates a separate instance of useAtom", function() {
    const x = initialize({ useLayoutEffect, useMemo, useState });
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

    // disabling console.error momentarily to avoid React and JSDOM errors that get logged
    // in development environments
    const e = console.error;
    console.error = () => null;
    expect(() => void render(<Sum />)).toThrow(Error);
    console.error = e;
  });
});
