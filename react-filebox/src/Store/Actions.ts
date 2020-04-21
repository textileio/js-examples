import { Reducer, ReducerAction, Dispatch, ReducerState } from "react";
import { AsyncActionHandlers } from "use-reducer-async";
import { ThreadID } from "@textile/threads-core";
import { Database } from "@textile/threads-database";
import LevelDatastore from "datastore-level";
import { State, FileInfo, schema } from "./State";

const storage = new LevelDatastore("threads-test");
export const db = new Database(storage);
const spaceName = "test-thread";
const Box = require("3box");

// Actions that aren't generally directly called from components
type InnerAction =
  | { type: "start_add" }
  | { type: "finish_add"; file: FileInfo }
  | { type: "start_remove" }
  | { type: "finish_remove"; id: string }
  | { type: "start_update" }
  | { type: "finish_update"; file: FileInfo }
  | { type: "start_open" }
  | { type: "finish_open"; id: string; files: Record<string, FileInfo> }
  | { type: "start_download" }
  | { type: "finish_download" }
  | { type: "start_auth" }
  | { type: "finish_auth"; box: any }
  | { type: "error"; message: string };

// Actions that are directly called from components
export type OuterAction = { type: "flag" };

export type Action = InnerAction | OuterAction;

// Core reducer, this will be wrapped in our actions middleware
export const reducer: Reducer<State, Action> = (state, action): State => {
  switch (action.type) {
    case "start_add":
    case "start_remove":
    case "start_update":
    case "start_download":
      return {
        ...state,
        loading: "Working...",
      };
    case "start_open":
      return {
        ...state,
        loading: "Accessing...",
      };
    case "start_auth":
      return {
        ...state,
        loading: "Authenticating...",
      };
    case "finish_add":
    case "finish_update": {
      const files = { ...state.files, [action.file.ID]: action.file };
      return {
        ...state,
        loading: undefined,
        files,
      };
    }
    case "finish_download": {
      return {
        ...state,
        loading: undefined,
      };
    }
    case "finish_auth": {
      return {
        ...state,
        loading: undefined,
        box: action.box,
      };
    }
    case "finish_remove": {
      const { [action.id]: value, ...files } = state.files;
      return {
        ...state,
        loading: undefined,
        files,
      };
    }
    case "finish_open": {
      return {
        ...state,
        threadID: action.id,
        loading: undefined,
        files: action.files,
      };
    }
    case "error": {
      return {
        ...state,
        loading: undefined,
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
  | { type: "open_store"; id: string }
  | { type: "authenticate" };

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
    getState,
  }: AsyncActionHandler<Reducer<State, Action>>) => async (action) => {
    dispatch({ type: "start_open" });
    try {
      const { box } = getState();

      const space = await box.openSpace(spaceName);
      await box.syncDone;
      const id = await space.private.get("threadID");
      console.log(id);

      // const threadID =
      //   id != null ? ThreadID.fromString(id) : ThreadID.fromRandom();
      // If we haven't opened the db yet, do so now.
      // if (!db.collections.size) {
      //   await db.open({ threadID });
      // }
      // // Create empty object for files
      // let files: Record<string, FileInfo> = {};
      // // Make sure we already have the collection created
      // const exists = db.collections.has("Files");
      // if (!exists) {
      //   await db.newCollection("Files", schema);
      // } else {
      //   const Files = db.collections.get("Files")!;
      //   for await (const file of Files.find({})) {
      //     files[file.key.toString().slice(1)] = file.value;
      //   }
      // }
      // // Now that we've loaded the db, let's pull out the relevant information
      // if (db.threadID) {
      //   const info = await db.network.getThread(db.threadID);
      // await space.private.set("threadID", threadID.toString());
      //   await space.private.set("threadKey", info.key?.toString());
      await dispatch({ type: "finish_open", id: action.id, files: {} });
      // } else {
      //   dispatch({ type: "error", message: "Invalid thread ID" });
      // }
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
  authenticate: ({
    dispatch,
    getState,
  }: AsyncActionHandler<Reducer<State, Action>>) => async (action) => {
    dispatch({ type: "start_auth" });
    try {
      let { box } = getState();
      if (box === undefined) {
        box = await Box.create((window as any).ethereum);
        const [address] = await (window as any).ethereum.enable();
        await box.auth([], { address });
        // Sometimes, openSpace returns early... so we'll open it again when opening store
        await box.openSpace(spaceName);
        await box.syncDone;
      } else {
        await box.logout();
        box = undefined;
      }
      dispatch({ type: "finish_auth", box });
    } catch (e) {
      dispatch({ type: "error", message: e.message });
    }
  },
};
