export interface FileInfo {
  name: string;
  size: number;
  added: number;
  tags?: string[];
  type: string;
}

export interface State {
  files: FileInfo[];
  isLoading: boolean;
  error?: string;
}

export const initialState: State = { files: [], isLoading: false };
