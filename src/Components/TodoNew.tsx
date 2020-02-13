import React, { useState } from "react";
import { Button, List, Input } from "semantic-ui-react";
import TodoItemClass from "../Stores/TodoItem";
import { useStore } from "../Helpers/UseStore";
import { onEnterPress } from "../Helpers/UseEnter";

interface Props {
  todo: TodoItemClass;
}

export const TodoNew = () => {
  const [newTodo, setTodo] = useState("");
  const todoList = useStore();

  const addTodo = () => {
    if (newTodo.trim() === "") return
    todoList.addTodo(newTodo);
    setTodo("");
  };

  return (
    <List.Item>
      <List.Content floated="right">
        <Button icon="plus" onClick={addTodo} style={{ marginRight: "3.2em" }} />
      </List.Content>
      <List.Content>
        <Input
          fluid
          placeholder="Enter todo item..."
          value={newTodo}
          onKeyDown={onEnterPress(addTodo)}
          onChange={e => setTodo(e.target.value)}
        />
      </List.Content>
    </List.Item>
  );
};
