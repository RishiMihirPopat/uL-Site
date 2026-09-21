/**
 * Client-side file upload utility for admin forms (SRP & DRY).
 */

export interface UploadResponse {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

/**
 * Uploads an image file to the unLecture admin upload API route.
 */
export async function uploadImageFile(
  file: File,
  type: 'posters' | 'archive' = 'posters'
): Promise<UploadResponse> {
  const data = new FormData();
  data.append('file', file);
  data.append('type', type);

  try {
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: data,
    });
    const result = await res.json();
    if (res.ok && result.url) {
      return { success: true, url: result.url, filename: result.filename };
    }
    return { success: false, error: result.error || 'Upload failed' };
  } catch {
    return { success: false, error: 'Network error while uploading file' };
  }
}
