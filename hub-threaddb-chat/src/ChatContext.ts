import React, { createContext, useContext } from 'react';
import { ThreadService } from './ThreadService';

export const ChatContext: React.Context<ThreadService> = createContext(new ThreadService());

// functional component context hook
export const useChat = () => useContext(ChatContext);
