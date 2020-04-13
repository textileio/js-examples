import { Reducer, ReducerAction, Dispatch, ReducerState } from "react";
import { AsyncActionHandlers } from "use-reducer-async";
import { State, FileInfo } from "./State";

// Actions that aren't generally directly called from components
type InnerAction =
  | { type: "start_add" }
  | { type: "finish_add"; file: FileInfo }
  | { type: "start_remove" }
  | { type: "finish_remove"; name: string }
  | { type: "start_tags" }
  | { type: "finish_tags"; name: string; tags: string[] }
  | { type: "error"; message: string };

// Actions that are directly called from components
export type OuterAction = { type: "flag" };

export type Action = InnerAction | OuterAction;

// Core reducer, this will be wrapped in our middleWear
export const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case "start_add":
    case "start_remove":
    case "start_tags":
      return {
        ...state,
        isLoading: true,
      };
    case "finish_add":
      return {
        ...state,
        isLoading: false,
        files: [...state.files, action.file],
      };
    case "finish_remove":
      return {
        ...state,
        isLoading: false,
        files: state.files.filter((file) => file.name !== action.name),
      };
    case "finish_tags":
      const instance = state.files.find((file) => file.name === action.name);
      if (!instance) return state;
      const tags = new Set(action.tags);
      // Mutate the state here, should be picked up in below state
      instance.tags = [...tags];
      return {
        ...state,
        isLoading: false,
      };
    case "error":
      return {
        ...state,
        isLoading: false,
        error: action.message,
      };
    case "flag":
    default:
      return state;
  }
};

export type AsyncAction =
  | { type: "add_file"; file: FileInfo }
  | { type: "remove_file"; name: string }
  | { type: "set_tags"; name: string; tags: string[] };

interface AsyncActionHandler<R extends Reducer<any, any>> {
  dispatch: Dispatch<ReducerAction<R>>;
  getState: () => ReducerState<R>;
  signal: AbortSignal;
}

export const asyncActionHandlers: AsyncActionHandlers<
  Reducer<State, Action>,
  AsyncAction
> = {
  add_file: ({
    dispatch,
  }: AsyncActionHandler<Reducer<State, Action>>) => async (action) => {
    dispatch({ type: "start_add" });
    try {
      dispatch({ type: "finish_add", file: action.file });
    } catch (e) {
      dispatch({ type: "error", message: "error adding file" });
    }
  },
  remove_file: ({
    dispatch,
  }: AsyncActionHandler<Reducer<State, Action>>) => async (action) => {
    dispatch({ type: "start_remove" });
    try {
      dispatch({ type: "finish_remove", name: action.name });
    } catch (e) {
      dispatch({ type: "error", message: "error adding file" });
    }
  },
  set_tags: ({
    dispatch,
  }: AsyncActionHandler<Reducer<State, Action>>) => async (action) => {
    dispatch({ type: "start_tags" });
    try {
      dispatch({ type: "finish_tags", name: action.name, tags: action.tags });
    } catch (e) {
      dispatch({ type: "error", message: "error adding file" });
    }
  },
};
