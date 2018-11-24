import {isShallowEqual} from "../src/utils";

describe("utils", () => {
  test("isShallowEqual works", () => {
    const obj = {b: "b"};
    expect(isShallowEqual(1, 1)).toBe(true);
    expect(isShallowEqual([], [])).toBe(true);
    expect(isShallowEqual([1], ["1"])).toBe(false);
    expect(isShallowEqual([{a: "a"}], [{a: "a"}])).toBe(false);
    expect(isShallowEqual([obj], [obj])).toBe(true);
    expect(isShallowEqual({a: "a"}, {a: "a"})).toBe(true);
  });
});
