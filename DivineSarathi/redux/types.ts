// Redux action types and constants

// Global reset action type - can be used to reset entire store
export const RESET_STORE = 'RESET_STORE';

// Helper function to create a reset action
export const resetStore = () => ({ type: RESET_STORE });
