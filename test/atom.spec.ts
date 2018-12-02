import { Atom, atom } from "../src/react-atom";

describe("Atom instance", () => {
  const TEST_ATOM = Atom.of(1);

  it("can be instantiated by the static Atom.of method", () => {
    expect(TEST_ATOM).toBeInstanceOf(Atom);
  });

  it("can be instantiated by the convenience function `atom`", () => {
    expect(atom("hi")).toBeInstanceOf(Atom);
  });

  it("cannot be modified directly", () => {
    const illegalWrite = () => {
      (TEST_ATOM as any).someProp = "someVal";
    };

    expect(illegalWrite).toThrow(new TypeError("Cannot add property someProp, object is not extensible"));
  });
});
