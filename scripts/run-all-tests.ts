/**
 * Master Test Suite Runner.
 * Executes all modular test suites covering every layer of the application.
 */

import { runner } from './tests/harness';
import { runValidatorsTests } from './tests/validators.test';
import { runUtilsTests } from './tests/utils.test';
import { runSqlUtilsTests } from './tests/sql-utils.test';
import { runLifecycleTests } from './tests/lifecycle.test';
import { runAuthTests } from './tests/auth.test';
import { runArticleServiceTests } from './tests/article-service.test';
import { runEventServiceTests } from './tests/event-service.test';
import { runUploadHandlersTests } from './tests/upload-handlers.test';
import { runProxySecurityTests } from './tests/proxy-security.test';
import { runDbIntegrationTests } from './tests/db-integration.test';

async function main() {
  console.log('\x1b[1m\x1b[35m=======================================================');
  console.log('   unLecture Comprehensive Test Suite (V2 & Neon)');
  console.log('=======================================================\x1b[0m');

  const startTotal = Date.now();

  // Run all synchronous and asynchronous test suites
  runValidatorsTests();
  runUtilsTests();
  runSqlUtilsTests();
  runLifecycleTests();
  await runAuthTests();
  await runArticleServiceTests();
  await runEventServiceTests();
  await runUploadHandlersTests();
  await runProxySecurityTests();
  await runDbIntegrationTests();

  const totalDuration = Date.now() - startTotal;
  const results = runner.getResults();

  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const allFailures = results.flatMap((r) => r.failures);

  console.log('\n\x1b[1m\x1b[35m=======================================================');
  console.log('   FINAL TEST EXECUTION REPORT');
  console.log('=======================================================\x1b[0m');
  console.log(`  Suites Executed: \x1b[1m${results.length}\x1b[0m`);
  console.log(`  Total Assertions: \x1b[1m${totalPassed + totalFailed}\x1b[0m`);
  console.log(`  Passed:           \x1b[1m\x1b[32m${totalPassed}\x1b[0m`);
  console.log(`  Failed:           \x1b[1m${totalFailed > 0 ? '\x1b[31m' : '\x1b[32m'}${totalFailed}\x1b[0m`);
  console.log(`  Total Duration:   \x1b[1m${totalDuration}ms\x1b[0m`);

  if (totalFailed > 0) {
    console.log('\n\x1b[1m\x1b[31mFAILURES:\x1b[0m');
    allFailures.forEach((f, i) => {
      console.log(`  ${i + 1}. \x1b[31m${f}\x1b[0m`);
    });
    console.log('');
    process.exit(1);
  } else {
    console.log('\n\x1b[1m\x1b[32m✔ ALL TESTS PASSED SUCCESSFULLY!\x1b[0m\n');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('\x1b[31mUnhandled exception in test runner:\x1b[0m', err);
  process.exit(1);
});
