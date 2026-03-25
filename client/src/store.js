import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));

export const useInstanceStore = create((set) => ({
  instances: [],
  currentInstance: null,
  setInstances: (instances) => set({ instances }),
  setCurrentInstance: (instance) => set({ currentInstance: instance }),
}));

export const useChatStore = create((set) => ({
  chats: [],
  currentChat: null,
  messages: [],
  setChats: (chats) => set({ chats }),
  setCurrentChat: (chat) => set({ currentChat: chat }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),
}));
