import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  showInappropriateWords: true,
  chatType: "regular",
  unreadCount: 0, // new state for unread messages count

  setShowInappropriateWords: (show) => set({ showInappropriateWords: show }),

  setChatType: (type) => set({ chatType: type }),

  setUnreadCount: (count) => set({ unreadCount: count }),

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const chatType = get().chatType;
      const res = await axiosInstance.get(`/messages/${userId}?chatType=${chatType}`);
      set({ messages: res.data, unreadCount: 0 }); // reset unread count on loading messages
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages, chatType } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, {
        ...messageData,
        chatType,
      });
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { authUser, socket } = useAuthStore.getState();
    if (!authUser) {
      console.log("subscribeToMessages: No authUser");
      return;
    }
    if (!socket) {
      console.log("subscribeToMessages: No socket connection");
      return;
    }
    console.log("subscribeToMessages: Subscribing to newMessage event");

    socket.on("newMessage", (newMessage) => {
      console.log("Received newMessage event:", newMessage);
      if (newMessage.senderId !== authUser._id) {
        // Increment unread count for messages from other users
        set((state) => ({ unreadCount: state.unreadCount + 1 }));
        return;
      }

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      console.log("unsubscribeFromMessages: Unsubscribing from newMessage event");
      socket.off("newMessage");
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
