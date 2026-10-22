const publicApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const serverApiUrl = process.env.INTERNAL_SERVER_API_URL ?? publicApiUrl;
const frontendUrl =
  process.env.NEXT_PUBLIC_FRONTEND_URL ?? "https://goha-pink.vercel.app";

const isServer = typeof window === "undefined";

const resolvedApiUrl = isServer ? serverApiUrl : publicApiUrl;

const normalizeApiUrl = (url: string): string => {
  if (!url) return url;
  return url.replace(/\/+$/, "");
};

const normalizedApiUrl = normalizeApiUrl(resolvedApiUrl);

export const API_BASE_URL: string = normalizedApiUrl;
export const FRONTEND_URL: string = frontendUrl;
