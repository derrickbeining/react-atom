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

/** @ignore */
export type DeepPartial<T> = T extends Record<string, any>
  ? { [K in keyof T]?: T[K] extends Record<string, any> ? DeepPartial<T[K]> : T[K] }
  : T;
