/** @ignore */
declare interface ReactStateHook
  extends React.Dispatch<React.SetStateAction<boolean>> {
  "@@react-atom/hook_id"?: number;
  [K: string]: unknown;
}

/** @ignore */
declare interface HookStore {
  [K: string]: ReactStateHook;
}
