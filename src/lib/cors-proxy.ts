import { CORS_PROXY_URL } from "@/config/constants";

export async function fetchWithCorsProxy(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (response.ok) {
      return await response.text();
    }
  } catch {
    // Direct fetch failed, try CORS proxy
  }

  const proxiedUrl = `${CORS_PROXY_URL}${encodeURIComponent(url)}`;
  const response = await fetch(proxiedUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch feed: ${response.status} ${response.statusText}`,
    );
  }

  return response.text();
}
