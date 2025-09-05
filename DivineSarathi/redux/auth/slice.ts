import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { buildApiUrl, API_ENDPOINTS, API_CONFIG } from "../../constants/config";

interface AuthState {
  authenticated: boolean;
  loading: boolean;
  token: string | null;
  user: {
    id?: string;
    email?: string;
    name?: string;
  } | null;
  languagePreference: string | null;
  hasCompletedLanguageSelection: boolean;
}

const initialState: AuthState = {
  authenticated: false,
  loading: true,
  token: null,
  user: null,
  languagePreference: null,
  hasCompletedLanguageSelection: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated(state, action: PayloadAction<boolean>) {
      state.authenticated = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
    setUser(state, action: PayloadAction<AuthState["user"]>) {
      state.user = action.payload;
    },
    setLanguagePreference(state, action: PayloadAction<string>) {
      state.languagePreference = action.payload;
    },
    setHasCompletedLanguageSelection(state, action: PayloadAction<boolean>) {
      state.hasCompletedLanguageSelection = action.payload;
    },
    logout(state) {
      state.authenticated = false;
      state.token = null;
      state.user = null;
      state.languagePreference = null;
      state.hasCompletedLanguageSelection = false;
    },
  },
});

export const { 
  setAuthenticated, 
  setLoading, 
  setToken, 
  setUser, 
  setLanguagePreference,
  setHasCompletedLanguageSelection,
  logout 
} = authSlice.actions;

// Thunk for Google authentication with token
export const authenticateWithGoogle = (token: string) => async (dispatch: any) => {
  try {
    console.log("Authenticating with Google token:", token);
    
    // Store token in AsyncStorage
    await AsyncStorage.setItem("authToken", token);
    await AsyncStorage.setItem("authenticated", "true");
    
    // Verify token with your server
    const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.CHECK), {
      method: "POST",
      headers: {
        ...API_CONFIG.HEADERS,
        "Authorization": `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      dispatch(setToken(token));
      dispatch(setAuthenticated(true));
      
      // You could also decode the JWT token to get user info
      // For now, we'll just set authenticated state
    } else {
      throw new Error("Token verification failed");
    }
  } catch (error) {
    console.error("Authentication error:", error);
    // Clear invalid token
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("authenticated");
    throw error;
  }
};

// Thunk for setting auth and persisting to AsyncStorage (legacy)
export const authenticate = (auth: boolean) => async (dispatch: any) => {
  console.log("Legacy authenticate called");
  await AsyncStorage.setItem("authenticated", auth ? "true" : "false");
  dispatch(setAuthenticated(auth));
};

// Thunk for checking auth state from AsyncStorage
export const checkAuth = () => async (dispatch: any) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    const authenticated = await AsyncStorage.getItem("authenticated");
    const languagePreference = await AsyncStorage.getItem("languagePreference");
    const hasCompletedLanguageSelection = await AsyncStorage.getItem("hasCompletedLanguageSelection");
    
    console.log("Checking auth - token exists:", !!token, "authenticated:", authenticated, "language:", languagePreference);
    
    // Load language preferences regardless of auth status
    if (languagePreference) {
      dispatch(setLanguagePreference(languagePreference));
    }
    if (hasCompletedLanguageSelection === "true") {
      dispatch(setHasCompletedLanguageSelection(true));
    }
    
    if (token && authenticated === "true") {
      // Verify token is still valid
      const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.CHECK), {
        method: "POST",
        headers: {
          ...API_CONFIG.HEADERS,
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        dispatch(setToken(token));
        dispatch(setAuthenticated(true));
      } else {
        // Token is invalid, clear it
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("authenticated");
        dispatch(setAuthenticated(false));
        dispatch(setToken(null));
      }
    } else {
      dispatch(setAuthenticated(false));
      dispatch(setToken(null));
    }
  } catch (error) {
    console.error("Error checking auth:", error);
    dispatch(setAuthenticated(false));
    dispatch(setToken(null));
  } finally {
    dispatch(setLoading(false));
  }
};

// Thunk for setting language preference
export const setLanguagePreferenceThunk = (language: string) => async (dispatch: any) => {
  try {
    console.log("Setting language preference:", language);
    
    // Store language preference in AsyncStorage
    await AsyncStorage.setItem("languagePreference", language);
    await AsyncStorage.setItem("hasCompletedLanguageSelection", "true");
    
    // Update Redux state
    dispatch(setLanguagePreference(language));
    dispatch(setHasCompletedLanguageSelection(true));
    
  } catch (error) {
    console.error("Error saving language preference:", error);
    throw error;
  }
};

// Thunk for logout
export const logoutUser = () => async (dispatch: any) => {
  await AsyncStorage.removeItem("authToken");
  await AsyncStorage.removeItem("authenticated");
  await AsyncStorage.removeItem("languagePreference");
  await AsyncStorage.removeItem("hasCompletedLanguageSelection");
  dispatch(logout());
};

export default authSlice.reducer;
