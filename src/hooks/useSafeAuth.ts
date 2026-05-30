/**
 * Safe auth stub. Always returns "not authenticated".
 * No dependency on ConvexAuthProvider or ConvexProviderWithAuth.
 */
export function useSafeAuth() {
  return { isAuthenticated: false, isLoading: false };
}
