import { createSlice } from "@reduxjs/toolkit";
import fakeDatabase from "../data/fakeDatabase.json";

const initialState = {
  notifications: fakeDatabase.notifications || [],
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification) {
        notification.isRead = true;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.isRead = true;
      });
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    deleteNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  deleteNotification,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
