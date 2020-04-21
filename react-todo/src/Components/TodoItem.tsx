import React, { useState, createRef } from "react";
import { Button, List, Input, Icon } from "semantic-ui-react";
import { useObserver } from "mobx-react-lite";
import TodoItemClass from "../Stores/TodoItem";
import { useStore } from "../Helpers/UseStore";
import { onEnterPress } from "../Helpers/UseEnter";

interface Props {
    todo: TodoItemClass;
}

export const TodoItem = ({ todo }: Props) => {
    const todoList = useStore();
    const [newText, setText] = useState('');
    const [isEditing, setEdit] = useState(false);
    const inputRef = createRef<Input>();

    const saveText = () => {
        todoList.updateTodo({ ...todo, text: newText });
        setEdit(false);
        setText('');
    };

    return useObserver(() => (
      <List.Item>
        <List.Content floated="right">
          <Button
            icon="check"
            toggle
            onClick={() => todoList.updateTodo({ ...todo, isDone: !todo.isDone}) }
            active={todo.isDone}
          />
          <Button icon="close" onClick={() => todoList.removeTodo(todo)} />
        </List.Content>
        <List.Content>
          <Input
            fluid
            ref={inputRef}
            icon={
              isEditing ? (
                <Icon name="save" link onClick={saveText} />
              ) : (
                <Icon
                  name="pencil"
                  link
                  onClick={() => {
                      setEdit(true)
                      inputRef.current?.focus()
                  }}
                />
              )
            }
            iconPosition="left"
            readOnly={!isEditing}
            onKeyDown={onEnterPress(saveText)}
            onChange={e => setText(e.target.value)}
            value={isEditing ? newText || todo.text : todo.text}
          />
        </List.Content>
      </List.Item>
    ));
};