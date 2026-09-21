import { runner } from './harness';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { proxy } from '../../proxy';
import { createSession } from '../../lib/auth';
import { NextRequest } from 'next/server';

export async function runProxySecurityTests() {
  runner.startSuite('Edge Route Guard (proxy.ts)');

  // 1. Unauthenticated request to /admin (login page itself) should pass through
  const loginReq = new NextRequest('http://localhost:3000/admin');
  const loginRes = await proxy(loginReq);
  runner.assert(!loginRes.headers.get('Location'), 'proxy: unauthenticated request to /admin passes through without redirect');

  // 2. Unauthenticated request to /api/admin/auth should pass through
  const authApiReq = new NextRequest('http://localhost:3000/api/admin/auth');
  const authApiRes = await proxy(authApiReq);
  runner.assert(!authApiRes.headers.get('Location'), 'proxy: /api/admin/auth passes through');

  // 3. Unauthenticated request to protected API endpoint should return 401 JSON
  const apiReq = new NextRequest('http://localhost:3000/api/admin/events');
  const apiRes = await proxy(apiReq);
  runner.assertEqual(apiRes.status, 401, 'proxy: unauthenticated /api/admin/* returns 401 status');
  const apiJson = await apiRes.json();
  runner.assertEqual(apiJson, { error: 'Unauthorized' }, 'proxy: returns { error: "Unauthorized" }');

  // 4. Unauthenticated request to protected admin page should redirect to /admin
  const pageReq = new NextRequest('http://localhost:3000/admin/dashboard');
  const pageRes = await proxy(pageReq);
  const location = pageRes.headers.get('Location');
  runner.assert(Boolean(location) && location!.endsWith('/admin'), 'proxy: unauthenticated /admin/dashboard redirects to /admin');

  // 5. Authenticated request with valid session token to protected admin page passes through
  const validToken = createSession('super_admin');
  const authPageReq = new NextRequest('http://localhost:3000/admin/dashboard', {
    headers: {
      cookie: `ul_admin_session=${validToken}`,
    },
  });
  const authPageRes = await proxy(authPageReq);
  runner.assert(!authPageRes.headers.get('Location'), 'proxy: authenticated /admin/dashboard passes through to page');

  // 6. Authenticated request with valid token visiting /admin redirects to /admin/dashboard
  const visitLoginReq = new NextRequest('http://localhost:3000/admin', {
    headers: {
      cookie: `ul_admin_session=${validToken}`,
    },
  });
  const visitLoginRes = await proxy(visitLoginReq);
  const redirLoc = visitLoginRes.headers.get('Location');
  runner.assert(Boolean(redirLoc) && redirLoc!.endsWith('/admin/dashboard'), 'proxy: logged-in user at /admin redirects to /admin/dashboard');

  // 7. Tampered token rejected as unauthenticated
  const tamperedReq = new NextRequest('http://localhost:3000/api/admin/events', {
    headers: {
      cookie: `ul_admin_session=${validToken}tampered`,
    },
  });
  const tamperedRes = await proxy(tamperedReq);
  runner.assertEqual(tamperedRes.status, 401, 'proxy: tampered session token rejected with 401');

  runner.endSuite();
}
