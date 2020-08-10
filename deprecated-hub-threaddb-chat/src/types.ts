export interface ChatInstance {
  _id: string
  author: string
  text: string
}

export interface ChatState {
  input: string
  messages: ChatInstance[]
  username: string
  threadID?: string
  invite?: string
}
