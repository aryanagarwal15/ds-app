import { Redirect } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { useEffect, useState } from "react";
import { checkAuth } from "../redux/auth/slice";
import NetInfo from "@react-native-community/netinfo";
import NoInternet from "./NoInternet";

export default function Index() {
  const [storeInitialized, setStoreInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);

  const {
    authenticated = false,
    loading = true,
    userProfile = null,
  } = useSelector((state: RootState) => {
    // Check if state is properly initialized
    if (state && state.auth && !storeInitialized) {
      setStoreInitialized(true);
    }

    return (
      state?.auth || { authenticated: false, loading: true, userProfile: null }
    );
  });
  const dispatch = useDispatch();

  useEffect(() => {
    // Check internet connectivity
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
      setIsCheckingConnection(false);
    });

    // Initial check
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected);
      setIsCheckingConnection(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (storeInitialized && isConnected) {
      // @ts-ignore
      dispatch(checkAuth());
    }
  }, [dispatch, storeInitialized, isConnected]);

  // Handle retry when user taps "Try Again"
  const handleRetry = () => {
    setIsCheckingConnection(true);
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected);
      setIsCheckingConnection(false);
    });
  };

  // Show loading if checking connection or store is not initialized yet
  if (isCheckingConnection) return null; // checking connection

  // Show No Internet page if not connected
  if (isConnected === false) {
    return <NoInternet onRetry={handleRetry} />;
  }

  // Show loading if store is not initialized yet
  if (!storeInitialized || loading) return null; // or a loading spinner

  // Route based on authentication and user profile completion status
  if (!authenticated) {
    return <Redirect href="/Onboarding" />;
  }

  // If authenticated but no user profile data yet, show loading
  if (!userProfile) {
    return null; // Loading user profile data
  }

  const { completionStatus } = userProfile;

  // If no language selected, go to language selection
  if (!completionStatus?.hasLanguage) {
    return <Redirect href="/Onboarding/LanguageSelection" />;
  }

  // If language selected but no user details (age/gender), go to user details
  if (
    completionStatus?.hasLanguage &&
    (!completionStatus?.hasUserDetails || !completionStatus?.hasDisclaimer)
  ) {
    return <Redirect href="/Onboarding/UserDetailsPage" />;
  }
  console.log("is complete ", completionStatus?.isComplete);
  // If both language and user details are complete, go to home
  if (completionStatus?.isComplete) {
    return <Redirect href="/HomeV3" />;
  }

  // Fallback to language selection
  return <Redirect href="/Onboarding/LanguageSelection" />;
}
