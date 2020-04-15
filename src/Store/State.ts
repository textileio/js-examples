import { JSONSchema } from "@textile/threads-database";

export interface FileInfo {
  ID: string;
  name: string;
  size: number;
  added: number;
  tags?: string[];
  type: string;
}

export const schema: JSONSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  definitions: {
    FileInfo: {
      title: "FileInfo",
      type: "object",
      properties: {
        name: {
          type: "string",
          title: "name",
        },
        size: {
          type: "number",
          title: "size",
        },
        added: {
          type: "number",
          title: "added",
        },
        tags: {
          type: "array",
          items: {
            type: "string",
          },
          title: "tags",
        },
        type: {
          type: "string",
          title: "type",
        },
      },
      required: ["added", "name", "size", "type"],
    },
  },
};

export interface State {
  files: Record<string, FileInfo>;
  isLoading: boolean;
  error?: string;
  threadID?: string;
}

export const initialState: State = { files: {}, isLoading: false };
