/**
 * File Upload Service (SRP & LSP).
 * Encapsulates multipart file parsing, path resolution, and storage.
 */

import path from 'path';
import fs from 'fs';

export interface IUploadService {
  saveFile(file: File, folderType: 'posters' | 'archive'): Promise<{ url: string; filename: string }>;
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
}

export const uploadService = new LocalUploadService();
