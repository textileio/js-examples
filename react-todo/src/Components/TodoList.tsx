import React from 'react';
import { useStore } from "../Helpers/UseStore";
import { TodoItem } from "./TodoItem";
import { TodoNew } from "./TodoNew";
import { useObserver } from "mobx-react-lite";
import { List } from "semantic-ui-react";

export const TodoList = () => {
    const todoList = useStore();

    return useObserver(() => (
      <List divided verticalAlign="middle">
        <TodoNew />
        {todoList.list.map(todo => (
          <TodoItem key={todo.ID} todo={todo} />
        ))}
      </List>
    ));
};