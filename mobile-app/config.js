// Production default for Vercel/hosted builds.
// Override locally by setting EXPO_PUBLIC_API_BASE_URL in mobile-app/.env
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'https://bike-rental-hiraizumi.onrender.com';
