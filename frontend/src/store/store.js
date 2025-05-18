// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
// Import slice reducers here
import authReducer from './slices/authSlice';
import schoolReducer from './slices/schoolSlice';
import studentReducer from './slices/studentSlice';
import userReducer from './slices/userSlice'; // Import
import standardDivisionSlice from "./slices/standardDivisionSlice"; // Import the new slice

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
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  // Enable Redux DevTools extension support (enabled by default in development)
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
// export type RootState = ReturnType<typeof store.getState>; // For TypeScript
// export type AppDispatch = typeof store.dispatch; // For TypeScript