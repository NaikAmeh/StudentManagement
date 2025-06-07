// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
// Import slice reducers here
import authReducer from './slices/authSlice';
import schoolReducer from './slices/schoolSlice';
import studentReducer from './slices/studentSlice';
import userReducer from './slices/userSlice'; // Import
import standardDivisionSlice from "./slices/standardDivisionSlice"; // Import the new slice
const API_IMAGE_URL = import.meta.env.VITE_API_BASEIMAGE_URL;

// Import other slice reducers as you create them (e.g., studentReducer)

export const store = configureStore({
  reducer: {
    // Define state properties and assign slice reducers
    auth: authReducer,
    school: schoolReducer,
    students: studentReducer,
    users: userReducer,
    standardDivision: standardDivisionSlice
    // students: studentReducer, // Example for later
  },
  // Optional: Add middleware (e.g., for async actions, logging)
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    thunk: {
      extraArgument: {
        apiBaseUrl: API_IMAGE_URL || 'http://localhost:5000',
      },
    },
  }),
  // Enable Redux DevTools extension support (enabled by default in development)
  devTools: import.meta.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
// export type RootState = ReturnType<typeof store.getState>; // For TypeScript
// export type AppDispatch = typeof store.dispatch; // For TypeScript