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
  unreadCounts: {}, // unread messages count per userId
  hiddenUserIds: [],

  setShowInappropriateWords: (show) => set({ showInappropriateWords: show }),

  setChatType: (type) => set({ chatType: type }),

  setUnreadCountForUser: (userId, count) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [userId]: count },
    })),

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
      set((state) => ({
        messages: res.data,
        unreadCounts: { ...state.unreadCounts, [userId]: 0 }, // reset unread count for this user
      }));
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
    if (!authUser) return;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, unreadCounts } = get();
      if (newMessage.senderId !== authUser._id) {
        if (selectedUser && newMessage.senderId === selectedUser._id) {
          // Message from currently selected user, add to messages
          set({
            messages: [...get().messages, newMessage],
          });
        } else {
          // Increment unread count for the sender user
          const currentCount = unreadCounts[newMessage.senderId] || 0;
          set({
            unreadCounts: { ...unreadCounts, [newMessage.senderId]: currentCount + 1 },
          });
        }
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

  hideUserFromSidebar: (userId) =>
    set((state) => ({
      hiddenUserIds: [...state.hiddenUserIds, userId],
    })),
}));
