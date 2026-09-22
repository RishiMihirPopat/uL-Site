/**
 * File Upload Service (SRP & LSP).
 * Encapsulates multipart file parsing, path resolution, and storage.
 */

import path from 'path';
import fs from 'fs';
import { put, del } from '@vercel/blob';

const VERCEL_BLOB_HOST = '.public.blob.vercel-storage.com';

function isVercelBlobUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(VERCEL_BLOB_HOST);
  } catch {
    return false;
  }
}

export interface IUploadService {
  saveFile(file: File, folderType: 'posters' | 'archive'): Promise<{ url: string; filename: string }>;
  deleteUrls(urls: string[]): Promise<void>;
}

export class LocalUploadService implements IUploadService {
  async saveFile(file: File, folderType: 'posters' | 'archive' = 'posters'): Promise<{ url: string; filename: string }> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const subDir = folderType === 'archive' ? 'archive' : 'uploads';
    const uploadDir = path.join(process.cwd(), 'public', subDir);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const sanitizedOriginal = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filename = `${Date.now()}-${sanitizedOriginal}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    const url = `/${subDir}/${filename}`;
    return { url, filename };
  }

  async deleteUrls(urls: string[]): Promise<void> {
    for (const url of urls) {
      // Local uploads are relative paths like /uploads/xxx or /archive/xxx
      if (!url || url.startsWith('http')) continue;
      const filePath = path.join(process.cwd(), 'public', url);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch {
        // Best-effort cleanup — don't fail the discard if a file is already gone
      }
    }
  }
}

export class VercelBlobUploadService implements IUploadService {
  async saveFile(file: File, folderType: 'posters' | 'archive' = 'posters'): Promise<{ url: string; filename: string }> {
    const subDir = folderType === 'archive' ? 'archive' : 'uploads';
    const sanitizedOriginal = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const pathname = `${subDir}/${Date.now()}-${sanitizedOriginal}`;

    const blob = await put(pathname, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return { url: blob.url, filename: pathname };
  }

  async deleteUrls(urls: string[]): Promise<void> {
    const blobUrls = urls.filter((u) => u && isVercelBlobUrl(u));
    if (blobUrls.length === 0) return;

    try {
      await del(blobUrls, { token: process.env.BLOB_READ_WRITE_TOKEN });
    } catch {
      // Best-effort cleanup — don't fail the discard if blob deletion fails
    }
  }
}

export class HybridUploadService implements IUploadService {
  private localService = new LocalUploadService();
  private blobService = new VercelBlobUploadService();

  async saveFile(file: File, folderType: 'posters' | 'archive' = 'posters'): Promise<{ url: string; filename: string }> {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      return this.blobService.saveFile(file, folderType);
    }

    // On Vercel / serverless runtime, filesystem is read-only.
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      throw new Error(
        'BLOB_READ_WRITE_TOKEN is missing. Vercel serverless functions have a read-only filesystem. Please create and connect a Vercel Blob store in your Vercel Dashboard (Storage -> Blob) and redeploy your project.'
      );
    }

    return this.localService.saveFile(file, folderType);
  }

  async deleteUrls(urls: string[]): Promise<void> {
    const blobUrls = urls.filter((u) => u && isVercelBlobUrl(u));
    const localUrls = urls.filter((u) => u && !isVercelBlobUrl(u) && !u.startsWith('http'));

    if (blobUrls.length > 0) {
      await this.blobService.deleteUrls(blobUrls);
    }
    if (localUrls.length > 0) {
      await this.localService.deleteUrls(localUrls);
    }
  }
}

export const uploadService = new HybridUploadService();
