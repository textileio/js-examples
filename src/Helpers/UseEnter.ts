import { KeyboardEvent } from "react";

export const onEnterPress = (cb: any) => {
  return (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      cb();
    }
  };
};
