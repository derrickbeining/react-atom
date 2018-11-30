/** @ignore */
export interface ReactUseStateHook<T> extends React.Dispatch<React.SetStateAction<T>> {
  "@@react-atom/hook_id"?: number;
  [K: string]: unknown;
}

/** @ignore */
export interface HookMap {
  [K: string]: ReactUseStateHook<any>;
}

/** @ignore */
export interface SelectorMap {
  [K: number]: (state: any) => any;
}
