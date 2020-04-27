import React from "react";
import { useReducerAsync } from "use-reducer-async";
import {
  reducer,
  asyncActionHandlers,
  AsyncAction,
  OuterAction,
} from "./Actions";
import { State, initialState } from "./State";

export interface Store {
  state: State;
  dispatch: React.Dispatch<AsyncAction | OuterAction>;
}

export const store = React.createContext<Store>({
  dispatch: (): void => {},
  state: initialState,
});
const { Provider } = store;

export const StateProvider: React.FC = ({ children }) => {
  // Create toplevel reducer and initial state
  const [state, dispatch] = useReducerAsync(
    reducer,
    initialState,
    asyncActionHandlers
  );
  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export const useStore = () => {
  return React.useContext(store);
};
