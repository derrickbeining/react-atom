import { Atom, DeepImmutable } from "@libre/atom";
import * as React from "react";
import { useAtom } from "./react-atom-internal";

export function connect<S>(mapStateToProps: (state: DeepImmutable<S>) => object, atom: Atom<S>) {
  return function<T>(Component: React.ComponentType<T>) {
    return (props: T) => {
      const stateProps = mapStateToProps(useAtom(atom));
      return <Component {...stateProps} {...props as T} />;
    };
  };
}
