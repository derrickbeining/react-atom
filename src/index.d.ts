/** @ignore */
declare interface ReactStateHook<T>
  extends React.Dispatch<React.SetStateAction<T>> {
  "@@react-atom/hook_id"?: number;
  [K: string]: unknown;
}

/** @ignore */
declare interface HookStore {
  [K: string]: ReactStateHook<any>;
}
