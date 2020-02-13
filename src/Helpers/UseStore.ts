import { useContext } from "react";
import { StoreContext } from "./StoreProvider";
import { TodoList } from "../Stores/TodoList";

export const useStore = (): TodoList => useContext(StoreContext);
