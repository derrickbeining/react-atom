declare interface ReactStateHook
  extends React.Dispatch<React.SetStateAction<boolean>> {
  "@@react-hook/id"?: number;
  [K: string]: unknown;
}

declare interface HookStore {
  [K: string]: ReactStateHook;
}
