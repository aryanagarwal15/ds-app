import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildApiUrl, API_ENDPOINTS, API_CONFIG } from '../constants/config';

/**
 * Get authenticated headers with JWT token
 */
export async function getAuthenticatedHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem("authToken");
  
  if (!token) {
    throw new Error("AUTHENTICATION_REQUIRED");
  }
  
  return {
    ...API_CONFIG.HEADERS,
    "Authorization": `Bearer ${token}`,
  };
}

export async function fetchEphemeralKey(storyId: string, storyCategory: string): Promise<string> {
  const headers = await getAuthenticatedHeaders();
  
  const response = await fetch(
    buildApiUrl(API_ENDPOINTS.SESSION.CREATE),
    {
      method: "POST",
      headers,
      body: JSON.stringify({ story_id: storyId, story_type: storyCategory }),
    }
  );

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Token is invalid or expired
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("authenticated");
      throw new Error("AUTHENTICATION_EXPIRED");
    }
    throw new Error(`Failed to fetch ephemeral key: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.key;
}
