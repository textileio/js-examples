import { action, observable } from "mobx";

export interface TodoType {
  text: string;
  ID: string;
  isDone: boolean;
}

export default class TodoItem {
  ID: string

  @observable text: string = "";
  @observable isDone: boolean = false;

  constructor(todo: TodoType) {
    this.text = todo.text;
    this.ID = todo.ID
    this.isDone = todo.isDone
  }

  @action
  update = (todo: TodoType) => {
    this.text = todo.text
    this.isDone = todo.isDone
  }
}
