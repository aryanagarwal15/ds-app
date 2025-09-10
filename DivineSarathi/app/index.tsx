import { Redirect } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { useEffect, useState } from "react";
import { checkAuth } from "../redux/auth/slice";

export default function Index() {
  const [storeInitialized, setStoreInitialized] = useState(false);

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
    if (storeInitialized) {
      // @ts-ignore
      dispatch(checkAuth());
    }
  }, [dispatch, storeInitialized]);

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
    return <Redirect href="/LanguageSelection" />;
  }

  // If language selected but no user details (age/gender), go to user details
  if (
    completionStatus?.hasLanguage &&
    (!completionStatus?.hasUserDetails || !completionStatus?.hasDisclaimer)
  ) {
    return <Redirect href="/UserDetailsPage" />;
  }
  console.log("is complete ", completionStatus?.isComplete);
  // If both language and user details are complete, go to home
  if (completionStatus?.isComplete) {
    return <Redirect href="/HomeV2" />;
  }

  // Fallback to language selection
  return <Redirect href="/LanguageSelection" />;
}
