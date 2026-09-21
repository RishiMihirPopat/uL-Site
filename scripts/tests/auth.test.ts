import { runner } from './harness';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import {
  validateRole,
  validatePassword,
  createSession,
  unauthorizedResponse,
  forbiddenResponse,
} from '../../lib/auth';

export async function runAuthTests() {
  runner.startSuite('Authentication & Security (lib/auth.ts)');

  const adminPass = process.env.ADMIN_PASSWORD;
  const managerPass = process.env.MANAGER_PASSWORD;

  // 1. Password validation & role detection
  if (adminPass) {
    runner.assertEqual(validateRole(adminPass), 'super_admin', 'validateRole: detects super_admin role with correct password');
    runner.assert(validatePassword(adminPass), 'validatePassword: returns true for valid admin password');
  }

  if (managerPass) {
    runner.assertEqual(validateRole(managerPass), 'event_manager', 'validateRole: detects event_manager role with correct password');
    runner.assert(validatePassword(managerPass), 'validatePassword: returns true for valid manager password');
  }

  runner.assertEqual(validateRole('wrong-password-12345'), null, 'validateRole: returns null for invalid password');
  runner.assert(!validatePassword('wrong-password-12345'), 'validatePassword: returns false for invalid password');
  runner.assertEqual(validateRole(''), null, 'validateRole: returns null for empty string');
  runner.assertEqual(validateRole(null as any), null, 'validateRole: returns null for null password');

  // 2. Session token creation & format
  const sessionToken = createSession('super_admin');
  runner.assert(typeof sessionToken === 'string' && sessionToken.includes('.'), 'createSession: generates token with base64 and hmac parts');
  const [b64Payload, signature] = sessionToken.split('.');
  runner.assert(b64Payload.length > 0 && signature.length === 64, 'createSession: generates 64-char hex SHA256 signature');

  const decoded = Buffer.from(b64Payload, 'base64url').toString('utf-8');
  runner.assert(decoded.startsWith('super_admin:'), 'createSession: encodes role and timestamp in payload');

  // 3. Responses
  const unauth = unauthorizedResponse();
  runner.assertEqual(unauth.status, 401, 'unauthorizedResponse: returns status 401');
  const unauthBody = await unauth.json();
  runner.assertEqual(unauthBody, { error: 'Unauthorized' }, 'unauthorizedResponse: returns { error: "Unauthorized" }');

  const forb = forbiddenResponse('Custom message');
  runner.assertEqual(forb.status, 403, 'forbiddenResponse: returns status 403');
  const forbBody = await forb.json();
  runner.assertEqual(forbBody, { error: 'Custom message' }, 'forbiddenResponse: returns custom error message');

  runner.endSuite();
}
