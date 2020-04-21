// https://levelup.gitconnected.com/react-hooks-mobx-todolist-c138eb4f3d04
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import registerServiceWorker from "./serviceWorker";
import { StoreProvider } from "./Helpers/StoreProvider";
import { TodoList } from "./Stores/TodoList";
import "semantic-ui-css/semantic.min.css";
import API from "@textile/textile";
import uuid from "uuid";
import queryString from "query-string";

registerServiceWorker();

let deviceId = uuid.v4()
const parsed = queryString.parse(window.location.search);
if (!parsed.user) {
  const query = { user: deviceId };
  window.location.search = queryString.stringify(query);
} else {
    deviceId = parsed.user.toString();
}

new API({
  // Hard-coded for demo purposes
  token: "54e24fc3-fda5-478a-b1f7-040ea5aaab33",
  deviceId
})
  .start()
  .then(api => {
    const todoList = new TodoList([], api.threadsConfig);

    //@ts-ignore - for debugging
    window.todoList = todoList;

    ReactDOM.render(
      <StoreProvider value={todoList}>
        <App />
      </StoreProvider>,
      document.getElementById("root")
    );
  });
