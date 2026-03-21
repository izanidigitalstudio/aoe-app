const DEFAULT_CONVEX_URL = 'https://woozy-mockingbird-215.convex.cloud';

export const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL ?? DEFAULT_CONVEX_URL;
export const USE_LIVE_BACKEND =
  typeof CONVEX_URL === 'string' && CONVEX_URL.trim().length > 0;
