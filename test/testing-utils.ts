import { act } from "react-dom/test-utils";

export const enact = <R>(fn: () => R) => {
  let x = null;
  act(() => {
    x = fn();
  });

  return (x as unknown) as R;
};
