/**
 * React Query DevTools
 * Conditionally loads DevTools only in development mode
 */

import React from 'react';

/**
 * DevTools component that lazy loads only in development
 * Returns null in production builds to avoid including DevTools in bundle
 */
export const ReactQueryDevtools = __DEV__
  ? React.lazy(() =>
      import('@tanstack/react-query-devtools').then((module) => ({
        default: module.ReactQueryDevtools,
      })),
    )
  : () => null;
