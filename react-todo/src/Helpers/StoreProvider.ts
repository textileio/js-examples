import { createContext } from "react";
import { TodoList } from "../Stores/TodoList";

export const StoreContext = createContext<TodoList>({} as TodoList);
export const StoreProvider = StoreContext.Provider;
