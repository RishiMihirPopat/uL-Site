import { runner } from './harness';
import { GET as uploadsGet } from '../../app/uploads/[...path]/route';
import { GET as archiveGet } from '../../app/archive/[...path]/route';

export async function runUploadHandlersTests() {
  runner.startSuite('Runtime Image Handlers (app/uploads & app/archive)');

  // 1. Existing upload file
  const existingReq = new Request('http://localhost:3000/uploads/1789822056183-Screenshot_2026-09-19_at_6.17.29_PM.png');
  const existingRes = await uploadsGet(existingReq, {
    params: Promise.resolve({ path: ['1789822056183-Screenshot_2026-09-19_at_6.17.29_PM.png'] }),
  });
  runner.assertEqual(existingRes.status, 200, 'uploads GET: returns 200 for existing file');
  runner.assertEqual(existingRes.headers.get('Content-Type'), 'image/png', 'uploads GET: returns correct MIME image/png');
  runner.assert(
    existingRes.headers.get('Cache-Control')?.includes('immutable') ?? false,
    'uploads GET: sets immutable cache headers on valid file'
  );

  // 2. Missing upload file fallback
  const missingReq = new Request('http://localhost:3000/uploads/nonexistent-file.png');
  const missingRes = await uploadsGet(missingReq, {
    params: Promise.resolve({ path: ['nonexistent-file.png'] }),
  });
  runner.assertEqual(missingRes.status, 200, 'uploads GET: returns 200 with transparent fallback for missing file');
  runner.assertEqual(missingRes.headers.get('Content-Type'), 'image/png', 'uploads GET: fallback content-type is image/png');
  runner.assert(
    missingRes.headers.get('Cache-Control')?.includes('no-store') ?? false,
    'uploads GET: sets no-store cache control on missing file fallback'
  );

  // 3. Directory traversal defense
  const traversalReq = new Request('http://localhost:3000/uploads/../../etc/passwd');
  const traversalRes = await uploadsGet(traversalReq, {
    params: Promise.resolve({ path: ['..', '..', 'etc', 'passwd'] }),
  });
  runner.assertEqual(traversalRes.status, 200, 'uploads GET: safely neutralizes directory traversal');

  // 4. Archive existing file
  const archiveReq = new Request('http://localhost:3000/archive/ambarish.JPG');
  const archiveRes = await archiveGet(archiveReq, {
    params: Promise.resolve({ path: ['ambarish.JPG'] }),
  });
  runner.assertEqual(archiveRes.status, 200, 'archive GET: returns 200 for existing archive file');
  runner.assertEqual(archiveRes.headers.get('Content-Type'), 'image/jpeg', 'archive GET: correctly resolves uppercase .JPG to image/jpeg');

  // 5. Archive missing file fallback
  const archiveMissingReq = new Request('http://localhost:3000/archive/missing-recap.jpg');
  const archiveMissingRes = await archiveGet(archiveMissingReq, {
    params: Promise.resolve({ path: ['missing-recap.jpg'] }),
  });
  runner.assertEqual(archiveMissingRes.status, 200, 'archive GET: returns 200 with transparent fallback for missing file');
  runner.assertEqual(archiveMissingRes.headers.get('Content-Type'), 'image/png', 'archive GET: fallback is valid image/png');

  runner.endSuite();
}
