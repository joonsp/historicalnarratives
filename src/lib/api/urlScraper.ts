/**
 * Frontend API client for scraping URL content.
 */

export interface ScrapedContent {
  title: string;
  content: string;
  contentLength: number;
  sourceType: 'youtube' | 'article' | 'podcast';
  sourceUrl: string;
  metadata: {
    author?: string;
    siteName?: string;
    description?: string;
  };
}

/**
 * Scrape content from a URL via the backend API.
 */
export async function scrapeUrl(url: string): Promise<ScrapedContent> {
  const backendUrl = import.meta.env.VITE_BACKEND_URL ||
    (import.meta.env.MODE === 'production' ? '' : 'http://localhost:3001');

  const response = await fetch(`${backendUrl}/api/scrape-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Scrape failed: ${response.status}`);
  }

  return response.json();
}
