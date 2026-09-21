/**
 * Modular Test Harness with rich assertions, timing, and failure reporting.
 */

export interface TestResult {
  suiteName: string;
  passed: number;
  failed: number;
  failures: string[];
  durationMs: number;
}

export class TestRunner {
  private currentSuite = '';
  private suitePassed = 0;
  private suiteFailed = 0;
  private suiteFailures: string[] = [];
  private startTime = 0;
  private results: TestResult[] = [];

  public startSuite(name: string) {
    this.currentSuite = name;
    this.suitePassed = 0;
    this.suiteFailed = 0;
    this.suiteFailures = [];
    this.startTime = Date.now();
    console.log(`\n\x1b[1m\x1b[36m▶ Suite: ${name}\x1b[0m`);
  }

  public endSuite(): TestResult {
    const durationMs = Date.now() - this.startTime;
    const result: TestResult = {
      suiteName: this.currentSuite,
      passed: this.suitePassed,
      failed: this.suiteFailed,
      failures: [...this.suiteFailures],
      durationMs,
    };
    this.results.push(result);

    const statusColor = this.suiteFailed === 0 ? '\x1b[32m' : '\x1b[31m';
    console.log(
      `  ${statusColor}Summary: ${this.suitePassed} passed, ${this.suiteFailed} failed (${durationMs}ms)\x1b[0m`
    );
    return result;
  }

  public assert(condition: boolean, label: string) {
    if (condition) {
      this.suitePassed++;
      console.log(`    \x1b[32m✓\x1b[0m ${label}`);
    } else {
      this.suiteFailed++;
      const msg = `[${this.currentSuite}] ${label}`;
      this.suiteFailures.push(msg);
      console.log(`    \x1b[31m✗\x1b[0m ${label}`);
    }
  }

  public assertEqual(actual: any, expected: any, label: string) {
    const pass = JSON.stringify(actual) === JSON.stringify(expected);
    if (pass) {
      this.suitePassed++;
      console.log(`    \x1b[32m✓\x1b[0m ${label}`);
    } else {
      this.suiteFailed++;
      const msg = `[${this.currentSuite}] ${label} -- expected: ${JSON.stringify(expected)}, got: ${JSON.stringify(actual)}`;
      this.suiteFailures.push(msg);
      console.log(`    \x1b[31m✗\x1b[0m ${label}`);
      console.log(`      \x1b[33mExpected:\x1b[0m ${JSON.stringify(expected)}`);
      console.log(`      \x1b[31mActual:\x1b[0m   ${JSON.stringify(actual)}`);
    }
  }

  public assertNotEqual(actual: any, unexpected: any, label: string) {
    const pass = JSON.stringify(actual) !== JSON.stringify(unexpected);
    if (pass) {
      this.suitePassed++;
      console.log(`    \x1b[32m✓\x1b[0m ${label}`);
    } else {
      this.suiteFailed++;
      const msg = `[${this.currentSuite}] ${label} -- expected value NOT to equal: ${JSON.stringify(unexpected)}`;
      this.suiteFailures.push(msg);
      console.log(`    \x1b[31m✗\x1b[0m ${label}`);
    }
  }

  public assertThrows(fn: () => any, label: string, expectedErrorSubstr?: string) {
    try {
      fn();
      this.suiteFailed++;
      const msg = `[${this.currentSuite}] ${label} -- expected function to throw, but it did not`;
      this.suiteFailures.push(msg);
      console.log(`    \x1b[31m✗\x1b[0m ${label} (did not throw)`);
    } catch (err: any) {
      if (expectedErrorSubstr && !String(err?.message || err).includes(expectedErrorSubstr)) {
        this.suiteFailed++;
        const msg = `[${this.currentSuite}] ${label} -- error "${err?.message}" did not contain "${expectedErrorSubstr}"`;
        this.suiteFailures.push(msg);
        console.log(`    \x1b[31m✗\x1b[0m ${label} (unexpected error message)`);
      } else {
        this.suitePassed++;
        console.log(`    \x1b[32m✓\x1b[0m ${label}`);
      }
    }
  }

  public async assertRejects(fn: () => Promise<any>, label: string, expectedErrorSubstr?: string) {
    try {
      await fn();
      this.suiteFailed++;
      const msg = `[${this.currentSuite}] ${label} -- expected async function to reject, but it resolved`;
      this.suiteFailures.push(msg);
      console.log(`    \x1b[31m✗\x1b[0m ${label} (did not reject)`);
    } catch (err: any) {
      if (expectedErrorSubstr && !String(err?.message || err).includes(expectedErrorSubstr)) {
        this.suiteFailed++;
        const msg = `[${this.currentSuite}] ${label} -- error "${err?.message}" did not contain "${expectedErrorSubstr}"`;
        this.suiteFailures.push(msg);
        console.log(`    \x1b[31m✗\x1b[0m ${label} (unexpected error message)`);
      } else {
        this.suitePassed++;
        console.log(`    \x1b[32m✓\x1b[0m ${label}`);
      }
    }
  }

  public getResults(): TestResult[] {
    return this.results;
  }
}

export const runner = new TestRunner();
