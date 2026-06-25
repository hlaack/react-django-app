import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api';

// A single shared QueryClient for the app.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Lore/geography data changes rarely, so keep it fresh for a minute
      // before refetching in the background.
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      // Don't retry auth failures (401/403) or missing resources (404) —
      // retrying those just delays showing the real state to the user.
      retry: (failureCount, error) => {
        if (error instanceof ApiError && [401, 403, 404].includes(error.status)) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});
