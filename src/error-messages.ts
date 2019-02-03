/** @ignore */
export const calledUseAtomOutsideFunctionComponent =
  "useAtom can only be called inside the body of a function component";

/** @ignore */
export const calledUseAtomWithNonAtom = "useAtom only accepts `react-atom` Atoms, but got:";

/** @ignore */
export const calledDerefWithNonAtom = "deref only accepts `react-atom` Atoms, but got:";

/** @ignore */
export const multipleInstantiations = `Multiple instances of react-atom have been detected, which will lead to unexpected bugs in the useAtom custom hook. This usually means react-atom has been initialized with \`create(hooks)\` in addition to importing the default Atom, useAtom, etc. directly. To avoid this error, only use the implementation returned from \`create\`.`;
