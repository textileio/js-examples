// https://levelup.gitconnected.com/react-hooks-mobx-todolist-c138eb4f3d04
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { StoreProvider } from "./Helpers/StoreProvider";
import { TodoList } from "./Stores/TodoList";
import "semantic-ui-css/semantic.min.css";

const todoList = new TodoList([]);

//@ts-ignore - for debugging
window.todoList = todoList

ReactDOM.render(
    <StoreProvider value={todoList}>
        <App />
    </StoreProvider>
    , document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
