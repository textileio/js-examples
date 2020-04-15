import { Reducer, ReducerAction, Dispatch, ReducerState } from "react";
import { AsyncActionHandlers } from "use-reducer-async";
import { State, FileInfo, schema } from "./State";
import { ThreadID } from "@textile/threads-core";
import { Database } from "@textile/threads-database";
import LevelDatastore from "datastore-level";
const storage = new LevelDatastore("threads-test");
export const db = new Database(storage);

// Actions that aren't generally directly called from components
type InnerAction =
  | { type: "start_add" }
  | { type: "finish_add"; file: FileInfo }
  | { type: "start_remove" }
  | { type: "finish_remove"; id: string }
  | { type: "start_update" }
  | { type: "finish_update"; file: FileInfo }
  | { type: "start_open" }
  | { type: "finish_open"; id: string }
  | { type: "start_download" }
  | { type: "finish_download" }
  | { type: "error"; message: string };

// Actions that are directly called from components
export type OuterAction = { type: "flag" };

export type Action = InnerAction | OuterAction;

// Core reducer, this will be wrapped in our actions middleware
export const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case "start_add":
    case "start_remove":
    case "start_update":
    case "start_download":
    case "start_open": {
      return {
        ...state,
        isLoading: true,
      };
    }
    case "finish_add":
    case "finish_update": {
      const files = { ...state.files, [action.file.ID]: action.file };
      return {
        ...state,
        isLoading: false,
        files,
      };
    }
    case "finish_download": {
      return {
        ...state,
        isLoading: false,
      };
    }
    case "finish_remove": {
      const { [action.id]: value, ...files } = state.files;
      return {
        ...state,
        isLoading: false,
        files,
      };
    }
    case "finish_open": {
      return {
        ...state,
        isLoading: false,
        threadID: action.id,
      };
    }
    case "error": {
      return {
        ...state,
        isLoading: false,
        error: action.message,
      };
    }
    case "flag":
    default:
      return state;
  }
};

export type AsyncAction =
  | { type: "add_file"; file: FileInfo }
  | { type: "remove_file"; id: string }
  | { type: "update_file"; file: FileInfo }
  | { type: "download_file"; file: FileInfo }
  | { type: "open_store"; id: string };

interface AsyncActionHandler<R extends Reducer<any, any>> {
  dispatch: Dispatch<ReducerAction<R>>;
  getState: () => ReducerState<R>;
  signal: AbortSignal;
}

// noinspection JSUnusedGlobalSymbols
export const asyncActionHandlers: AsyncActionHandlers<
  Reducer<State, Action>,
  AsyncAction
> = {
  add_file: ({
    dispatch,
  }: AsyncActionHandler<Reducer<State, Action>>) => async (action) => {
    dispatch({ type: "start_add" });
    try {
      const File = db.collections.get("Files");
      if (File) {
        await File.insert(action.file);
        dispatch({ type: "finish_add", file: action.file });
      } else {
        dispatch({
          type: "error",
          message: "Unable to access 'Files' collection",
        });
      }
    } catch (e) {
      dispatch({ type: "error", message: e.toString() });
    }
  },
  remove_file: ({
    dispatch,
  }: AsyncActionHandler<Reducer<State, Action>>) => async (action) => {
    dispatch({ type: "start_remove" });
    try {
      const File = db.collections.get("Files");
      if (File) {
        await File.delete(action.id);
        dispatch({ type: "finish_remove", id: action.id });
      } else {
        dispatch({
          type: "error",
          message: "Unable to access 'Files' collection",
        });
      }
    } catch (e) {
      dispatch({ type: "error", message: "error adding file" });
    }
  },
  update_file: ({
    dispatch,
  }: AsyncActionHandler<Reducer<State, Action>>) => async (action) => {
    dispatch({ type: "start_update" });
    try {
      const File = db.collections.get("Files");
      if (File) {
        await File.save(action.file);
        dispatch({ type: "finish_update", file: action.file });
      } else {
        dispatch({
          type: "error",
          message: "Unable to access 'Files' collection",
        });
      }
    } catch (e) {
      dispatch({ type: "error", message: "error adding file" });
    }
  },
  open_store: ({
    dispatch,
  }: AsyncActionHandler<Reducer<State, Action>>) => async (action) => {
    dispatch({ type: "start_open" });
    try {
      const threadID = ThreadID.fromString(action.id);
      await db.open({ threadID });
      if (!db.collections.has("Files")) await db.newCollection("Files", schema);
      dispatch({ type: "finish_open", id: action.id });
    } catch (e) {
      dispatch({ type: "error", message: e.toString() });
    }
  },
  download_file: ({
    dispatch,
  }: AsyncActionHandler<Reducer<State, Action>>) => async (action) => {
    dispatch({ type: "start_download" });
    try {
      const text = "some test text";
      const blob = new Blob([text], {
        type: action.file.type,
      });

      // create hidden link
      const element = document.createElement("a");
      document.body.appendChild(element);
      element.setAttribute("href", window.URL.createObjectURL(blob));
      element.setAttribute("download", action.file.name);
      element.style.display = "";

      element.click();

      document.body.removeChild(element);
      dispatch({ type: "finish_download" });
    } catch (e) {
      dispatch({ type: "error", message: e.toString() });
    }
  },
};
