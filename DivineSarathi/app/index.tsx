import { Redirect } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { useEffect, useState } from "react";
import { checkAuth } from "../redux/auth/slice";
import NetInfo from "@react-native-community/netinfo";
import NoInternet from "./NoInternet";
import UpdateRequired from "./UpdateRequired";
import { buildApiUrl } from "../constants/config";
import { API_ENDPOINTS } from "@/constants/config";
import { expo } from "../app.json";

export default function Index() {
  const [storeInitialized, setStoreInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const [isVersionAllowed, setIsVersionAllowed] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    console.log("calling /generic/status api");
    fetch(buildApiUrl(API_ENDPOINTS.GENERIC.STATUS), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        response.json().then((data) => {
          const allowedVersionsArray = JSON.parse(data.allowed_versions);
          // Check if current app version is allowed
          console.log("allowedVersionsArray", allowedVersionsArray);
          //get android version
          const currentVersion = expo.version || "1.0.0";
          console.log("currentVersion", currentVersion);

          const versionAllowed = allowedVersionsArray.includes(currentVersion);
          console.log(
            "Current version:",
            currentVersion,
            "Allowed:",
            versionAllowed
          );
          setIsVersionAllowed(versionAllowed);
        });
      })
      .catch((error) => {
        console.error("Error fetching status:", error);
        // If API fails, allow the user to proceed (graceful fallback)
        setIsVersionAllowed(true);
      });
  }, []);

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

  // Show loading while checking version
  if (isVersionAllowed === null) return null; // checking version

  // Show update required screen if version is not allowed
  if (isVersionAllowed === false) {
    return <UpdateRequired />;
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
