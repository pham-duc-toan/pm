import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import coursesReducer from "./coursesSlice";
import notificationsReducer from "./notificationsSlice";
import enrollmentReducer from "./enrollmentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer,
    notifications: notificationsReducer,
    enrollment: enrollmentReducer,
  },
});

export default store;
