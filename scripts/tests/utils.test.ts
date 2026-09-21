import { runner } from './harness';
import { slugify } from '../../lib/utils/slug';
import { formatArticleDate, parseEventDateTime, toTitleCase } from '../../lib/utils/dateTime';

export function runUtilsTests() {
  runner.startSuite('Utilities (lib/utils/slug.ts & lib/utils/dateTime.ts)');

  // 1. slugify
  runner.assertEqual(slugify('Hello World'), 'hello-world', 'slugify: converts space to hyphen');
  runner.assertEqual(
    slugify('Red Alert: Tearing Down Universal Human Rights!'),
    'red-alert-tearing-down-universal-human-rights',
    'slugify: strips punctuation and colons'
  );
  runner.assertEqual(slugify('  Spaced   Out  '), 'spaced-out', 'slugify: collapses multi-spaces and trims');
  runner.assertEqual(slugify('---leading-trailing---'), 'leading-trailing', 'slugify: strips leading and trailing hyphens');
  runner.assertEqual(slugify('Mix_Of__Under_Scores-And-Dashes'), 'mix-of-under-scores-and-dashes', 'slugify: normalizes underscores and dashes');
  runner.assertEqual(slugify('Special @ Symbols #$! 2026'), 'special-symbols-2026', 'slugify: strips symbols and preserves numbers');
  runner.assertEqual(slugify(''), '', 'slugify: handles empty string');
  runner.assertEqual(slugify('   '), '', 'slugify: handles whitespace string');
  runner.assertEqual(slugify(null as any), '', 'slugify: handles null safely');
  runner.assertEqual(slugify(undefined as any), '', 'slugify: handles undefined safely');

  // 2. formatArticleDate
  runner.assert(
    formatArticleDate('2024-10-24T00:00:00Z').includes('2024') && formatArticleDate('2024-10-24T00:00:00Z').includes('OCT'),
    'formatArticleDate: formats ISO date to uppercase month and year'
  );
  runner.assertEqual(formatArticleDate('not-a-valid-date'), 'not-a-valid-date', 'formatArticleDate: returns unparseable string fallback');
  runner.assertEqual(formatArticleDate(''), '', 'formatArticleDate: empty input produces empty string');
  runner.assertEqual(formatArticleDate(null as any), '', 'formatArticleDate: null input produces empty string');

  // 3. parseEventDateTime
  const parsed = parseEventDateTime('2026-09-20T17:00:00Z');
  runner.assert(parsed !== null && typeof parsed.date === 'string' && typeof parsed.time === 'string', 'parseEventDateTime: returns date and time object');
  runner.assertEqual(parseEventDateTime('invalid-datetime'), null, 'parseEventDateTime: returns null on invalid string');
  runner.assertEqual(parseEventDateTime(''), null, 'parseEventDateTime: returns null on empty string');
  runner.assertEqual(parseEventDateTime(null as any), null, 'parseEventDateTime: returns null on null input');

  // 4. toTitleCase
  runner.assertEqual(toTitleCase('kezia dsouza'), 'Kezia Dsouza', 'toTitleCase: capitalizes words from lowercase');
  runner.assertEqual(toTitleCase('AMBARISH SATWIK'), 'Ambarish Satwik', 'toTitleCase: normalizes all-caps to title case');
  runner.assertEqual(toTitleCase('apar gupta'), 'Apar Gupta', 'toTitleCase: handles two words');
  runner.assertEqual(toTitleCase('single'), 'Single', 'toTitleCase: handles single word');
  runner.assertEqual(toTitleCase(''), '', 'toTitleCase: handles empty string');
  runner.assertEqual(toTitleCase(null as any), '', 'toTitleCase: handles null safely');

  runner.endSuite();
}
