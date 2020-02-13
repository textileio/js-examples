import { action, observable } from "mobx";
import { Client } from "@textile/threads-client";
import queryString from "query-string";
import TodoItem, { TodoType } from "./TodoItem";

export class TodoList {
  private client: Client;
  private listID: string = "";

  @observable.shallow list: TodoItem[] = [];

  constructor(todos: string[], host: string = "http://localhost:6007") {
    todos.forEach(this.addTodo);
    this.client = new Client({ host });
    const parsed = queryString.parse(window.location.search);
    if (parsed.id) {
      this.listID = parsed.id.toString();
      this.loadList();
      return
    }
    this.client.newStore().then(store => {
      this.client.registerSchema(store.id, "Todo", schema).then(() => {
        this.client.start(store.id).then(() => {
          this.listID = store.id;
          const query = { id: store.id };
          window.location.search = queryString.stringify(query);
        });
      });
    });
  };

  @action
  loadList = async () => {
    const found = await this.client.modelFind(this.listID, 'Todo', {});
    this.list = found.entitiesList.map((entity: any) => entity).map((obj: any) => {
      return new TodoItem(obj);
    });
  };

  @action
  updateTodo = async (todo: TodoItem) => {
    await this.client.modelSave(this.listID, "Todo", [todo])
    const index = this.list.findIndex(item => item.ID === todo.ID);
    this.list.splice(index, 1, todo);
  }

  @action
  addTodo = async (text: string) => {
    const todo: TodoType = { ID: "", text, isDone: false };
    const created = await this.client.modelCreate(this.listID, 'Todo', [todo])
    const todos = created.entitiesList
    this.list.unshift(new TodoItem(todos.pop()));
  };

  @action
  removeTodo = async (todo: TodoItem) => {
    await this.client.modelDelete(this.listID, "Todo", [todo.ID]);
    const index = this.list.findIndex(item => item.ID === todo.ID);
    this.list.splice(index, 1);
  };
}

const schema = {
  $id: "https://example.com/person.schema.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Todo",
  type: "object",
  properties: {
    ID: {
      type: "string",
      description: "The item id."
    },
    text: {
      type: "string",
      description: "The todo text."
    },
    idDone: {
      description: "Whether the item is done.",
      type: "boolean"
    }
  }
};
