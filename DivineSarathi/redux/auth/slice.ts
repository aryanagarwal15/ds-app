import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { buildApiUrl, API_ENDPOINTS, API_CONFIG } from "../../constants/config";
import { RESET_STORE } from "../types";

interface UserProfile {
  username?: string;
  email?: string;
  language?: string | null;
  age?: number | null;
  gender?: string | null;
  completionStatus?: {
    hasLanguage: boolean;
    hasUserDetails: boolean;
    hasDisclaimer: boolean;
    isComplete: boolean;
  };
}

interface AuthState {
  authenticated: boolean;
  loading: boolean;
  token: string | null;
  user: {
    id?: string;
    email?: string;
    name?: string;
  } | null;
  userProfile: UserProfile | null;
  otpEmail?: string | null;
  otpRequestInProgress?: boolean;
  otpVerifyInProgress?: boolean;
  otpVerified?: boolean;
}

const initialState: AuthState = {
  authenticated: false,
  loading: true,
  token: null,
  user: null,
  userProfile: null,
  otpEmail: null,
  otpRequestInProgress: false,
  otpVerifyInProgress: false,
  otpVerified: false,
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
    setUserProfile(state, action: PayloadAction<UserProfile>) {
      state.userProfile = action.payload;
    },
    setOtpEmail(state, action: PayloadAction<string | null>) {
      state.otpEmail = action.payload;
    },
    setOtpRequestInProgress(state, action: PayloadAction<boolean>) {
      state.otpRequestInProgress = action.payload;
    },
    setOtpVerifyInProgress(state, action: PayloadAction<boolean>) {
      state.otpVerifyInProgress = action.payload;
    },
    setOtpVerified(state, action: PayloadAction<boolean>) {
      state.otpVerified = action.payload;
    },
    logout(state) {
      // Reset to initial state to ensure complete cleanup
      Object.assign(state, initialState);
    },
    resetToInitialState(state) {
      // Alternative action for resetting to initial state
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    // Listen for global store reset
    builder.addCase(RESET_STORE, (state) => {
      Object.assign(state, initialState);
    });
  },
});

export const {
  setAuthenticated,
  setLoading,
  setToken,
  setUser,
  setUserProfile,
  setOtpEmail,
  setOtpRequestInProgress,
  setOtpVerifyInProgress,
  setOtpVerified,
  logout,
  resetToInitialState,
} = authSlice.actions;

// Thunk for Google authentication with token
export const authenticateWithGoogle =
  (token: string) => async (dispatch: any) => {
    try {
      // Store token in AsyncStorage
      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("authenticated", "true");

      // Verify token with your server
      const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.CHECK), {
        method: "POST",
        headers: {
          ...API_CONFIG.HEADERS,
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        dispatch(setToken(token));
        dispatch(setAuthenticated(true));

        // Fetch user profile after successful authentication
        try {
          await dispatch(fetchUserProfile());
        } catch (profileError) {
          console.warn("Failed to fetch user profile:", profileError);
          // Don't fail authentication if profile fetch fails
        }
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

// Request OTP via email
export const requestEmailOtp = (email: string) => async (dispatch: any) => {
  try {
    dispatch(setOtpEmail(email));
    dispatch(setOtpRequestInProgress(true));

    const response = await fetch(
      buildApiUrl(API_ENDPOINTS.AUTH.REQUEST_OTP),
      {
        method: "POST",
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({ email }),
      }
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(text || "Failed to request OTP");
    }
  } catch (error) {
    throw error;
  } finally {
    dispatch(setOtpRequestInProgress(false));
  }
};

// Verify OTP and establish session
export const verifyEmailOtp = (email: string, otp: string) => async (dispatch: any) => {
  try {
    dispatch(setOtpVerifyInProgress(true));

    const response = await fetch(
      buildApiUrl(API_ENDPOINTS.AUTH.VERIFY_OTP),
      {
        method: "POST",
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({ email, otp }),
      }
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(text || "Failed to verify OTP");
    }

    const payload = await response.json().catch(() => ({} as any));
    const token: string | undefined = payload?.token;
    if (!token) {
      throw new Error("No token returned from server");
    }

    // Persist token like Google auth
    await AsyncStorage.setItem("authToken", token);
    await AsyncStorage.setItem("authenticated", "true");

    dispatch(setToken(token));
    dispatch(setAuthenticated(true));
    dispatch(setOtpVerified(true));

    // Attempt to load user profile
    try {
      await dispatch(fetchUserProfile());
    } catch (_) {
      // Ignore profile fetch failure
    }
  } catch (error) {
    dispatch(setOtpVerified(false));
    // Ensure we clear any partial state
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("authenticated");
    dispatch(setToken(null));
    dispatch(setAuthenticated(false));
    throw error;
  } finally {
    dispatch(setOtpVerifyInProgress(false));
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

    if (token && authenticated === "true") {
      // Verify token is still valid
      const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.CHECK), {
        method: "POST",
        headers: {
          ...API_CONFIG.HEADERS,
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        dispatch(setToken(token));
        dispatch(setAuthenticated(true));

        // Fetch user profile after successful token verification
        try {
          const userProfile = await dispatch(fetchUserProfile());
        } catch (profileError) {
          console.warn(
            "Failed to fetch user profile during auth check:",
            profileError
          );
          // Don't fail authentication if profile fetch fails
        }
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

// Thunk to fetch user profile
export const fetchUserProfile = () => async (dispatch: any, getState: any) => {
  try {
    const { auth } = getState();
    const token = auth.token;
    console.log(auth);

    if (!token) {
      throw new Error("No auth token available");
    }

    const response = await fetch(buildApiUrl(API_ENDPOINTS.USER.PROFILE), {
      method: "GET",
      headers: {
        ...API_CONFIG.HEADERS,
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log(result.data);
      dispatch(setUserProfile(result.data));

      return result.data;
    } else {
      console.log("FETCH PROFILE - Response not OK:", response.status);
      throw new Error("Failed to fetch user profile");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Thunk for setting language preference
export const setLanguagePreferenceThunk =
  (language: string) => async (dispatch: any, getState: any) => {
    try {
      console.log("Setting language preference:", language);

      const { auth } = getState();
      const token = auth.token;

      // Save to server if authenticated
      if (token) {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.USER.INFO), {
          method: "POST",
          headers: {
            ...API_CONFIG.HEADERS,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            key: "LANGUAGE",
            value: language,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save language preference to server");
        }

        // Update local profile state
        if (auth.userProfile) {
          dispatch(
            setUserProfile({
              ...auth.userProfile,
              completionStatus: {
                ...auth.userProfile.completionStatus,
                hasLanguage: true,
              },
              language: language,
            })
          );
        }
      }
    } catch (error) {
      console.error("Error saving language preference:", error);
      throw error;
    }
  };

// Thunk for saving disclaimer acceptance
export const saveDisclaimerAcceptance =
  () => async (dispatch: any, getState: any) => {
    try {
      console.log("Saving disclaimer acceptance");
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        throw new Error("No auth token available");
      }
      const response = await fetch(buildApiUrl(API_ENDPOINTS.CONSENT.CREATE), {
        method: "POST",
        headers: {
          ...API_CONFIG.HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          terms_accepted: true,
          consent_type: "Disclaimer",
        }),
      });

      if (!response.ok) {
        console.log(response);
        throw new Error("Failed to save disclaimer acceptance to server");
      }

      console.log("Disclaimer acceptance saved successfully");

      // Update local profile state
      if (auth.userProfile) {
        dispatch(
          setUserProfile({
            ...auth.userProfile,
            completionStatus: {
              ...auth.userProfile.completionStatus,
              hasDisclaimer: true,
              isComplete:
                auth.userProfile.completionStatus.hasLanguage &&
                auth.userProfile.completionStatus.hasUserDetails,
            },
          })
        );
      }
    } catch (error) {
      console.error("Error saving disclaimer acceptance:", error);
      throw error;
    }
  };

// Thunk for saving age only
export const saveUserAge =
  (age: string) => async (dispatch: any, getState: any) => {
    try {
      console.log("Saving user age:", age);

      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        throw new Error("No auth token available");
      }

      // Save age to server
      const ageResponse = await fetch(buildApiUrl(API_ENDPOINTS.USER.INFO), {
        method: "POST",
        headers: {
          ...API_CONFIG.HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: "AGE",
          value: age,
        }),
      });

      if (!ageResponse.ok) {
        throw new Error("Failed to save age to server");
      }

      // Update local profile state
      if (auth.userProfile) {
        dispatch(
          setUserProfile({
            ...auth.userProfile,
            age: parseInt(age) || null,
          })
        );
      }

      console.log("Age saved successfully");
    } catch (error) {
      console.error("Error saving age:", error);
      throw error;
    }
  };

// Thunk for saving gender only
export const saveUserGender =
  (gender: string) => async (dispatch: any, getState: any) => {
    try {
      console.log("Saving user gender:", gender);

      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        throw new Error("No auth token available");
      }

      // Save gender to server
      const genderResponse = await fetch(buildApiUrl(API_ENDPOINTS.USER.INFO), {
        method: "POST",
        headers: {
          ...API_CONFIG.HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: "GENDER",
          value: gender,
        }),
      });

      if (!genderResponse.ok) {
        throw new Error("Failed to save gender to server");
      }

      // Update local profile state and fetch updated profile to refresh completion status
      if (auth.userProfile) {
        dispatch(
          setUserProfile({
            ...auth.userProfile,
            gender: gender,
          })
        );
      }

      // Fetch updated profile to get completion status
      await dispatch(fetchUserProfile());

      console.log("Gender saved successfully");
    } catch (error) {
      console.error("Error saving gender:", error);
      throw error;
    }
  };

// Thunk for saving user details (age and gender) - legacy function
export const saveUserDetails =
  (age: string, gender: string) => async (dispatch: any, getState: any) => {
    try {
      console.log("Saving user details:", { age, gender });

      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        throw new Error("No auth token available");
      }

      // Save age to server
      const ageResponse = await fetch(buildApiUrl(API_ENDPOINTS.USER.INFO), {
        method: "POST",
        headers: {
          ...API_CONFIG.HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: "AGE",
          value: age,
        }),
      });

      if (!ageResponse.ok) {
        throw new Error("Failed to save age to server");
      }

      // Save gender to server
      const genderResponse = await fetch(buildApiUrl(API_ENDPOINTS.USER.INFO), {
        method: "POST",
        headers: {
          ...API_CONFIG.HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: "GENDER",
          value: gender,
        }),
      });

      if (!genderResponse.ok) {
        throw new Error("Failed to save gender to server");
      }

      // Fetch updated user profile to refresh completion status
      await dispatch(fetchUserProfile());
    } catch (error) {
      console.error("Error saving user details:", error);
      throw error;
    }
  };

// Thunk for sending Location
export const sendLocation = (location: string, key: string) => async (dispatch: any, getState: any) => {
  try {
    const { auth } = getState();
    const token = auth.token;
    if (!token) {
      throw new Error("No auth token available");
    }
    //prepare body
    const body = {
      callId: location,
      key,
    };
    const response = await fetch(buildApiUrl(API_ENDPOINTS.SESSION.LOCATION), {
      method: "POST",
      headers: {
        ...API_CONFIG.HEADERS,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error("Failed to send location to server");
    }
    console.log("Location sent successfully");
  } catch (error) {
    console.error("Error sending location:", error);
    throw error;
  }
};

// Thunk for logout - clears ALL stored data and resets Redux store
export const logoutUser = () => async (dispatch: any) => {
  try {
    console.log("LOGOUT - Starting complete logout process");

    // Clear all AsyncStorage keys related to the app
    const keysToRemove = ["authToken", "authenticated"];

    // Remove all keys in parallel for better performance
    await Promise.all(keysToRemove.map((key) => AsyncStorage.removeItem(key)));

    console.log("LOGOUT - AsyncStorage cleared");

    // Reset Redux store to initial state
    dispatch(logout());

    console.log("LOGOUT - Redux store reset to initial state");
  } catch (error) {
    console.error("Error during logout:", error);
    // Even if there's an error, still try to reset the store
    dispatch(logout());
  }
};

export default authSlice.reducer;
