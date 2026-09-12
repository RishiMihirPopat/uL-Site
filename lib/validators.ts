/**
 * URL and link validation helpers for unLecture event management.
 */

export function isValidHttpUrl(string: string): boolean {
  if (!string || typeof string !== 'string') return false;
  try {
    const url = new URL(string.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true; // Local static/uploaded path: /uploads/..., /archive/..., /category-covers/...
  }
  return isValidHttpUrl(trimmed);
}

export function isValidUrbanautUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return true; // Optional field
  const trimmed = url.trim();
  if (trimmed === '') return true;
  if (!isValidHttpUrl(trimmed)) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.hostname.length > 0;
  } catch {
    return false;
  }
}

export function isValidYouTubeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!isValidHttpUrl(trimmed)) return false;
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    const isYoutubeHost = host === 'youtube.com' || host === 'www.youtube.com' || host === 'm.youtube.com' || host === 'youtu.be';
    if (!isYoutubeHost) return false;

    if (host === 'youtu.be') {
      return parsed.pathname.length > 1;
    }
    if (parsed.pathname.includes('/watch') && parsed.searchParams.get('v')) {
      return true;
    }
    if (parsed.pathname.includes('/shorts/') || parsed.pathname.includes('/embed/') || parsed.pathname.includes('/live/')) {
      return true;
    }
    return true;
  } catch {
    return false;
  }
}

export function isValidSubstackUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('/articles/')) return true; // Internal website-hosted article
  if (!isValidHttpUrl(trimmed)) return false;
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    return host.includes('substack.com') || (parsed.pathname.length > 1 && host.length > 3);
  } catch {
    return false;
  }
}

/**
 * Robust tag normalizer that converts any string, JSON array, nested string array,
 * or comma/semicolon-separated string into a clean string array without brackets or quotes.
 */
export function normalizeTags(raw: any): string[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .flatMap(item => (typeof item === 'string' ? normalizeTags(item) : []))
      .map(t => t.trim())
      .filter(Boolean);
  }

  if (typeof raw === 'string') {
    let str = raw.trim();

    // Check if valid JSON array
    if (str.startsWith('[') && str.endsWith(']')) {
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) {
          return normalizeTags(parsed);
        }
      } catch {}
    }

    // Strip leading/trailing brackets, quotes, braces
    str = str.replace(/^[\[{\s"']+|[\]}\s"']+$/g, '');
    if (!str) return [];

    return str
      .split(/[,;\n]/)
      .map(t => {
        return t
          .replace(/^[\[{\s"']+|[\]}\s"']+$/g, '')
          .replace(/^#+/, '')
          .trim();
      })
      .filter(t => t.length > 0 && t !== '[' && t !== ']');
  }

  return [];
}

/**
 * Formats tags for human input text field (e.g. "special, butt, edition")
 */
export function formatTagsForDisplay(tags: any): string {
  return normalizeTags(tags).join(', ');
}

export function validateEventLinks(data: {
  image?: string | null;
  urbanaut_url?: string | null;
  archive_image?: string | null;
  youtube_urls?: string[] | string | null;
  substack_urls?: string[] | string | null;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (data.image && data.image.trim() !== '' && !isValidImageUrl(data.image)) {
    errors.image = 'Poster image must be a valid upload path (/uploads/...) or HTTPS URL.';
  }

  if (data.urbanaut_url && data.urbanaut_url.trim() !== '' && !isValidUrbanautUrl(data.urbanaut_url)) {
    errors.urbanaut_url = 'Booking URL must be a valid web link starting with https:// or http://';
  }

  if (data.archive_image && data.archive_image.trim() !== '' && !isValidImageUrl(data.archive_image)) {
    errors.archive_image = 'Archive photo must be a valid upload path (/archive/...) or HTTPS URL.';
  }

  const parseUrlList = (val?: string[] | string | null): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return val.split('\n').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  const ytList = parseUrlList(data.youtube_urls);
  for (let i = 0; i < ytList.length; i++) {
    const url = ytList[i];
    if (!isValidYouTubeUrl(url)) {
      errors.youtube_urls = `Invalid YouTube link at item ${i + 1} ("${url}"). Must be a valid youtube.com or youtu.be link.`;
      break;
    }
  }

  const substackList = parseUrlList(data.substack_urls);
  for (let i = 0; i < substackList.length; i++) {
    const url = substackList[i];
    if (!isValidSubstackUrl(url)) {
      errors.substack_urls = `Invalid article link at item ${i + 1} ("${url}"). Must be a website article (/articles/...) or valid web link starting with https://`;
      break;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
