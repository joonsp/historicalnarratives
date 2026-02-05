/**
 * Content extraction module for URLs.
 * Supports YouTube transcripts, articles (via Readability), and RSS feeds.
 * Shared between Express server and Vercel serverless functions.
 */

import { Readability } from '@mozilla/readability';
import { parseHTML } from 'linkedom';
import { YoutubeTranscript } from 'youtube-transcript-plus';

/**
 * Validate URL for SSRF protection.
 * Blocks private IPs, non-HTTP schemes, and localhost.
 */
export function validateUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Invalid URL format');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are supported');
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost and loopback
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.local')
  ) {
    throw new Error('Local URLs are not allowed');
  }

  // Block private IP ranges
  const ipMatch = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipMatch) {
    const [, a, b] = ipMatch.map(Number);
    if (
      a === 10 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254)
    ) {
      throw new Error('Private IP addresses are not allowed');
    }
  }

  return parsed;
}

/**
 * Truncate content at paragraph boundaries.
 */
export function truncateContent(text, maxChars = 48000) {
  if (text.length <= maxChars) return text;

  const truncated = text.slice(0, maxChars);
  const lastParagraph = truncated.lastIndexOf('\n\n');
  if (lastParagraph > maxChars * 0.8) {
    return truncated.slice(0, lastParagraph) + '\n\n[Content truncated...]';
  }
  return truncated + '\n\n[Content truncated...]';
}

/**
 * Detect URL type.
 */
function detectUrlType(url) {
  const hostname = new URL(url).hostname.toLowerCase();
  const pathname = new URL(url).pathname.toLowerCase();

  if (
    hostname.includes('youtube.com') ||
    hostname.includes('youtu.be')
  ) {
    return 'youtube';
  }

  if (
    pathname.includes('/rss') ||
    pathname.includes('/feed') ||
    pathname.endsWith('.xml') ||
    pathname.endsWith('.rss')
  ) {
    return 'rss';
  }

  return 'article';
}

/**
 * Extract YouTube video ID from URL.
 */
function extractYouTubeId(url) {
  const parsed = new URL(url);
  if (parsed.hostname.includes('youtu.be')) {
    return parsed.pathname.slice(1);
  }
  return parsed.searchParams.get('v');
}

/**
 * Fetch YouTube video metadata via oEmbed.
 */
async function fetchYouTubeMetadata(url) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const data = await res.json();
      return { title: data.title, author: data.author_name };
    }
  } catch {
    // Fall through
  }
  return { title: null, author: null };
}

/**
 * Extract transcript from YouTube video.
 */
async function extractYouTube(url) {
  const videoId = extractYouTubeId(url);
  if (!videoId) {
    throw new Error('Could not extract YouTube video ID from URL');
  }

  const [transcript, metadata] = await Promise.all([
    YoutubeTranscript.fetchTranscript(videoId),
    fetchYouTubeMetadata(url),
  ]);

  if (!transcript || transcript.length === 0) {
    throw new Error('No captions available for this YouTube video');
  }

  const content = transcript.map(t => t.text).join(' ');

  return {
    title: metadata.title || `YouTube Video ${videoId}`,
    content: truncateContent(content),
    contentLength: content.length,
    sourceType: 'youtube',
    sourceUrl: url,
    metadata: {
      author: metadata.author || undefined,
    },
  };
}

/**
 * Extract article content using Readability.
 */
async function extractArticle(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  let response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HistoryMapBot/1.0)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: HTTP ${response.status}`);
  }

  // Check content length (5MB limit for articles)
  const contentLength = response.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
    throw new Error('Content too large (max 5MB)');
  }

  const html = await response.text();

  if (html.length > 5 * 1024 * 1024) {
    throw new Error('Content too large (max 5MB)');
  }

  const { document } = parseHTML(html);
  const reader = new Readability(document);
  const article = reader.parse();

  if (!article || !article.textContent || article.textContent.trim().length < 200) {
    throw new Error('Could not extract readable content from this URL');
  }

  return {
    title: article.title || new URL(url).hostname,
    content: truncateContent(article.textContent.trim()),
    contentLength: article.textContent.trim().length,
    sourceType: 'article',
    sourceUrl: url,
    metadata: {
      author: article.byline || undefined,
      siteName: article.siteName || undefined,
      description: article.excerpt || undefined,
    },
  };
}

/**
 * Extract content from RSS/podcast feed.
 */
async function extractRSS(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  let response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HistoryMapBot/1.0)',
        Accept: 'application/rss+xml,application/xml,text/xml,*/*;q=0.8',
      },
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch feed: HTTP ${response.status}`);
  }

  const xml = await response.text();
  const { document } = parseHTML(xml);

  // Extract channel/feed info
  const channelTitle =
    document.querySelector('channel > title')?.textContent ||
    document.querySelector('feed > title')?.textContent ||
    'RSS Feed';

  // Extract items
  const items = document.querySelectorAll('item, entry');
  if (items.length === 0) {
    throw new Error('No items found in feed');
  }

  const entries = Array.from(items).slice(0, 20).map(item => {
    const title =
      item.querySelector('title')?.textContent || 'Untitled';
    const description =
      item.querySelector('description')?.textContent ||
      item.querySelector('content')?.textContent ||
      item.querySelector('summary')?.textContent ||
      '';

    // Strip HTML from description
    const { document: descDoc } = parseHTML(description);
    const plainText = descDoc.documentElement.textContent || '';

    return `## ${title}\n${plainText}`;
  });

  const content = entries.join('\n\n');

  if (content.trim().length < 200) {
    throw new Error('Feed content too short to extract meaningful data');
  }

  return {
    title: channelTitle,
    content: truncateContent(content),
    contentLength: content.length,
    sourceType: 'podcast',
    sourceUrl: url,
    metadata: {
      description: `RSS feed with ${items.length} items`,
    },
  };
}

/**
 * Main extraction dispatcher.
 */
export async function extractContent(url) {
  const type = detectUrlType(url);

  switch (type) {
    case 'youtube':
      return extractYouTube(url);
    case 'rss':
      return extractRSS(url);
    default:
      return extractArticle(url);
  }
}
