import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosResponse } from 'axios';
import { buildApiUrl, API_ENDPOINTS, API_CONFIG } from '../constants/config';

export interface Story {
  id: string;
  category: string;
  sub_category: string;
  title: string;
  sub_title: string;
  description: string;
  duration: number;
  image: string;
  full_story: string;
  verse_number: string;
  full_verse: string;
}

export interface CategoryData {
  category: string;
  sub_category: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ProcessedCategoriesData {
  categories: string[];
  subCategories: string[];
}

export interface ProcessedStoriesData {
  stories: Story[];
  dailyStories: Story[];
}

/**
 * Custom error class for API-related errors
 */
export class StoriesApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isAuthError: boolean = false
  ) {
    super(message);
    this.name = 'StoriesApiError';
  }
}

/**
 * Get authenticated headers with JWT token
 */
async function getAuthenticatedHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem("authToken");
  
  if (!token) {
    throw new StoriesApiError("Authentication token not found", 401, true);
  }
  
  return {
    ...API_CONFIG.HEADERS,
    "Authorization": `Bearer ${token}`,
  };
}

/**
 * Handle API errors consistently
 */
function handleApiError(error: any): never {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;
    const message = error.response?.data?.message || error.message;
    
    if (statusCode === 401 || statusCode === 403) {
      // Clear stored auth data on authentication failure
      AsyncStorage.multiRemove(["authToken", "authenticated"]).catch(console.error);
      throw new StoriesApiError("Authentication expired. Please login again.", statusCode, true);
    }
    
    if (statusCode === 404) {
      throw new StoriesApiError("Resource not found", statusCode);
    }
    
    if (statusCode === 500) {
      throw new StoriesApiError("Server error. Please try again later.", statusCode);
    }
    
    if (!error.response) {
      throw new StoriesApiError("Network error. Please check your connection.", undefined);
    }
    
    throw new StoriesApiError(message || "An unexpected error occurred", statusCode);
  }
  
  throw new StoriesApiError("An unexpected error occurred");
}

/**
 * Fetch all categories from the server
 */
export async function fetchCategories(): Promise<ProcessedCategoriesData> {
  try {
    const headers = await getAuthenticatedHeaders();
    
    const response: AxiosResponse<ApiResponse<CategoryData[]>> = await axios.get(
      buildApiUrl(API_ENDPOINTS.STORIES.GET_ALL_CATEGORIES),
      {
        headers,
        timeout: API_CONFIG.TIMEOUT,
      }
    );

    if (!response.data.success) {
      throw new StoriesApiError(response.data.message || "Failed to fetch categories");
    }

    const categoriesData = response.data.data;
    
    if (!Array.isArray(categoriesData)) {
      throw new StoriesApiError("Invalid categories data format");
    }

    // Process categories and remove duplicates
    const categories: string[] = [];
    const subCategories: string[] = [];
    
    for (const data of categoriesData) {
      // Validate data structure
      if (!data || typeof data !== 'object' || !data.category) {
        console.warn('Invalid category data:', data);
        continue;
      }
      
      // Skip "Daily Stories" category as per original logic
      if (data.category !== "Daily Stories") {
        if (!categories.includes(data.category)) {
          categories.push(data.category);
        }
        
        if (data.sub_category && 
            data.sub_category !== "null" && 
            !subCategories.includes(data.sub_category)) {
          subCategories.push(data.sub_category);
        }
      }
    }

    return { categories, subCategories };
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    handleApiError(error);
  }
}

/**
 * Fetch initial stories from the server
 */
export async function fetchInitialStories(): Promise<ProcessedStoriesData> {
  try {
    const headers = await getAuthenticatedHeaders();
    
    const response: AxiosResponse<ApiResponse<Story[]>> = await axios.get(
      buildApiUrl(API_ENDPOINTS.STORIES.GET_INITIAL_STORIES),
      {
        headers,
        timeout: API_CONFIG.TIMEOUT,
      }
    );

    if (!response.data.success) {
      throw new StoriesApiError(response.data.message || "Failed to fetch initial stories");
    }

    const storiesData = response.data.data;
    
    if (!Array.isArray(storiesData)) {
      throw new StoriesApiError("Invalid stories data format");
    }

    // Process and separate stories
    const stories: Story[] = [];
    const dailyStories: Story[] = [];
    
    for (const data of storiesData) {
      // Validate story structure
      if (!data || typeof data !== 'object' || !data.id || !data.title) {
        console.warn('Invalid story data:', data);
        continue;
      }
      
      if (data.category === "Daily Stories") {
        dailyStories.push(data);
      } else {
        stories.push(data);
      }
    }

    return { stories, dailyStories };
    
  } catch (error) {
    console.error('Error fetching initial stories:', error);
    handleApiError(error);
  }
}

/**
 * Retry mechanism for API calls
 */
export async function withRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 2,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry authentication errors
      if (error instanceof StoriesApiError && error.isAuthError) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
    }
  }
  
  throw lastError!;
}
