import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/slice';
import { RESET_STORE, resetStore } from './types';

// Define the root reducers
const rootReducer = {
  auth: authReducer,
};

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export types and helpers for convenience
export { RESET_STORE, resetStore };