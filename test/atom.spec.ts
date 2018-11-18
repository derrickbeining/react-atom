import {Atom} from "../src/react-atom";

describe("Atom instance", () => {
  const TEST_ATOM = Atom.of(1);

  it("can only be instantiated by the static Atom.of method", () => {
    expect(Object.getPrototypeOf(TEST_ATOM).constructor.name).toBe("Atom");
  });

  it("doesn't have any instance members", () => {
    expect(Object.getOwnPropertyNames(TEST_ATOM)).toHaveLength(0);
  });

  it("cannot be modified", () => {
    const illegalWrite = () => {
      (TEST_ATOM as any).someProp = "someVal";
    };

    expect(illegalWrite).toThrow(
      new TypeError("Cannot add property someProp, object is not extensible"),
    );
  });
});
