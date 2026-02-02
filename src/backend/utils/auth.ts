/**
 * Auth Utilities
 * Backward compatibility wrapper for authentication helpers
 * Delegates to SkaftinClient
 */

import { skaftinClient } from '../client/SkaftinClient';
import useAuthStore from '../../stores/data/AuthStore';

/**
 * Check if platform authentication is configured
 */
export function isAuthenticated(): boolean {
  return skaftinClient.isAuthenticated();
}

/**
 * Get the API URL
 */
export function getApiUrl(): string {
  return skaftinClient.getApiUrl();
}

/**
 * Get the project ID (if set)
 */
export function getProjectId(): string | null {
  return skaftinClient.getProjectId();
}

/**
 * Get the current JWT token from AuthStore
 */
export function getToken(): string | null {
  const authState = useAuthStore.getState();
  return authState.sessionUser?.accessToken || authState.sessionUser?.access || null;
}

/**
 * Check if user is logged in (has JWT token)
 */
export function isUserLoggedIn(): boolean {
  return !!getToken();
}

export default {
  isAuthenticated,
  getApiUrl,
  getProjectId,
  getToken,
  isUserLoggedIn,
};

