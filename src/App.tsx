import React from 'react';
import { Header, Icon } from "semantic-ui-react";
import './App.css';
import { TodoList } from "./Components/TodoList";

const App = () => {
  return (
    <div className="App">
      <Header as="h2">
        <Icon name="check" />
        <Header.Content>Todo App</Header.Content>
      </Header>
      <TodoList />
    </div>
  );
}

export default App;