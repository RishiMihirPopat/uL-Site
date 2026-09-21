import { runner } from './harness';
import {
  isValidHttpUrl,
  isValidImageUrl,
  isValidUrbanautUrl,
  isValidGoogleMapsUrl,
  isValidYouTubeUrl,
  isValidSubstackUrl,
  normalizeTags,
  formatTagsForDisplay,
  validateEventLinks,
} from '../../lib/validators';

export function runValidatorsTests() {
  runner.startSuite('Validators & Sanitization (lib/validators.ts)');

  // 1. isValidHttpUrl
  runner.assert(isValidHttpUrl('http://example.com'), 'isValidHttpUrl: accepts standard http:// URL');
  runner.assert(isValidHttpUrl('https://unlecture.in/events?id=123#hash'), 'isValidHttpUrl: accepts complex https URL');
  runner.assert(isValidHttpUrl('  https://example.com/trimmed  '), 'isValidHttpUrl: trims whitespace');
  runner.assert(!isValidHttpUrl('ftp://example.com'), 'isValidHttpUrl: rejects ftp protocol');
  runner.assert(!isValidHttpUrl('javascript:alert(1)'), 'isValidHttpUrl: rejects javascript: protocol');
  runner.assert(!isValidHttpUrl('data:text/html,test'), 'isValidHttpUrl: rejects data: protocol');
  runner.assert(!isValidHttpUrl('file:///etc/passwd'), 'isValidHttpUrl: rejects file:/// protocol');
  runner.assert(!isValidHttpUrl('//protocol-relative.com'), 'isValidHttpUrl: rejects protocol-relative URL');
  runner.assert(!isValidHttpUrl('not a url'), 'isValidHttpUrl: rejects plain string');
  runner.assert(!isValidHttpUrl(''), 'isValidHttpUrl: rejects empty string');
  runner.assert(!isValidHttpUrl(null as any), 'isValidHttpUrl: handles null safely');
  runner.assert(!isValidHttpUrl(undefined as any), 'isValidHttpUrl: handles undefined safely');

  // 2. isValidImageUrl
  runner.assert(isValidImageUrl('/uploads/123-pic.png'), 'isValidImageUrl: accepts /uploads/... path');
  runner.assert(isValidImageUrl('/archive/event.jpg'), 'isValidImageUrl: accepts /archive/... path');
  runner.assert(isValidImageUrl('/category-covers/unlecture.jpg'), 'isValidImageUrl: accepts /category-covers/... path');
  runner.assert(isValidImageUrl('https://d10y46cwh6y6x1.cloudfront.net/img.webp'), 'isValidImageUrl: accepts remote https CDN');
  runner.assert(!isValidImageUrl('//evil.com/fake.png'), 'isValidImageUrl: rejects protocol-relative URL bypass');
  runner.assert(!isValidImageUrl('uploads/123-pic.png'), 'isValidImageUrl: rejects local path without leading slash');
  runner.assert(!isValidImageUrl('javascript:alert(1)'), 'isValidImageUrl: rejects script injection in image URL');
  runner.assert(!isValidImageUrl(''), 'isValidImageUrl: rejects empty image URL');
  runner.assert(!isValidImageUrl(null as any), 'isValidImageUrl: handles null safely');

  // 3. isValidUrbanautUrl
  runner.assert(isValidUrbanautUrl('https://urbanaut.app/event/123'), 'isValidUrbanautUrl: accepts urbanaut app URL');
  runner.assert(isValidUrbanautUrl('https://example.com/tickets'), 'isValidUrbanautUrl: accepts general https ticket URL');
  runner.assert(isValidUrbanautUrl(''), 'isValidUrbanautUrl: accepts empty string (optional field)');
  runner.assert(isValidUrbanautUrl('   '), 'isValidUrbanautUrl: accepts whitespace (optional field)');
  runner.assert(isValidUrbanautUrl(null as any), 'isValidUrbanautUrl: accepts null (optional field)');
  runner.assert(!isValidUrbanautUrl('not-a-url'), 'isValidUrbanautUrl: rejects invalid string when provided');
  runner.assert(!isValidUrbanautUrl('ftp://example.com'), 'isValidUrbanautUrl: rejects non-http protocol');

  // 3b. isValidGoogleMapsUrl
  runner.assert(isValidGoogleMapsUrl('https://maps.app.goo.gl/abcdef123'), 'isValidGoogleMapsUrl: accepts maps.app.goo.gl short links');
  runner.assert(isValidGoogleMapsUrl('https://goo.gl/maps/xyz987'), 'isValidGoogleMapsUrl: accepts goo.gl/maps short links');
  runner.assert(isValidGoogleMapsUrl('https://www.google.com/maps/place/India+Habitat+Centre'), 'isValidGoogleMapsUrl: accepts standard google.com/maps/place link');
  runner.assert(isValidGoogleMapsUrl('https://maps.google.com/?q=The+Piano+Man'), 'isValidGoogleMapsUrl: accepts maps.google.com/?q= link');
  runner.assert(isValidGoogleMapsUrl('https://www.google.co.in/maps/search/Malviya+Nagar'), 'isValidGoogleMapsUrl: accepts regional google.co.in/maps link');
  runner.assert(isValidGoogleMapsUrl('https://google.com/maps/@28.5355,77.2090,15z'), 'isValidGoogleMapsUrl: accepts google.com/maps coordinate link');
  runner.assert(isValidGoogleMapsUrl(''), 'isValidGoogleMapsUrl: accepts empty string (optional field)');
  runner.assert(isValidGoogleMapsUrl('   '), 'isValidGoogleMapsUrl: accepts whitespace string (optional field)');
  runner.assert(isValidGoogleMapsUrl(null as any), 'isValidGoogleMapsUrl: accepts null (optional field)');
  runner.assert(isValidGoogleMapsUrl(undefined as any), 'isValidGoogleMapsUrl: accepts undefined (optional field)');
  runner.assert(!isValidGoogleMapsUrl('not-a-url'), 'isValidGoogleMapsUrl: rejects non-URL string');
  runner.assert(!isValidGoogleMapsUrl('https://example.com/location'), 'isValidGoogleMapsUrl: rejects non-Google domains');
  runner.assert(!isValidGoogleMapsUrl('ftp://maps.google.com'), 'isValidGoogleMapsUrl: rejects ftp protocol');

  // 4. isValidYouTubeUrl
  runner.assert(isValidYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'isValidYouTubeUrl: standard youtube.com watch URL');
  runner.assert(isValidYouTubeUrl('https://youtu.be/dQw4w9WgXcQ'), 'isValidYouTubeUrl: youtu.be short URL');
  runner.assert(isValidYouTubeUrl('https://m.youtube.com/watch?v=dQw4w9WgXcQ'), 'isValidYouTubeUrl: mobile m.youtube.com URL');
  runner.assert(isValidYouTubeUrl('https://youtube.com/shorts/abc12345'), 'isValidYouTubeUrl: youtube shorts URL');
  runner.assert(isValidYouTubeUrl('https://youtube.com/embed/abc12345'), 'isValidYouTubeUrl: youtube embed URL');
  runner.assert(isValidYouTubeUrl('https://youtube.com/live/abc12345'), 'isValidYouTubeUrl: youtube live URL');
  runner.assert(!isValidYouTubeUrl('https://notyoutube.com/watch?v=123'), 'isValidYouTubeUrl: rejects domain spoofing notyoutube.com');
  runner.assert(!isValidYouTubeUrl('https://youtu.be/'), 'isValidYouTubeUrl: rejects host without video ID');
  runner.assert(!isValidYouTubeUrl('https://vimeo.com/123456'), 'isValidYouTubeUrl: rejects Vimeo URLs');
  runner.assert(!isValidYouTubeUrl(''), 'isValidYouTubeUrl: rejects empty string');
  runner.assert(!isValidYouTubeUrl(null as any), 'isValidYouTubeUrl: handles null safely');

  // 5. isValidSubstackUrl
  runner.assert(isValidSubstackUrl('https://theunlecture.substack.com/p/defense-of-lecture'), 'isValidSubstackUrl: accepts standard substack.com');
  runner.assert(isValidSubstackUrl('/articles/why-we-gather-in-third-spaces'), 'isValidSubstackUrl: accepts internal /articles/... slug');
  runner.assert(isValidSubstackUrl('https://custom-publication.org/p/article-name'), 'isValidSubstackUrl: accepts custom publication domain');
  runner.assert(!isValidSubstackUrl('https://'), 'isValidSubstackUrl: rejects incomplete protocol');
  runner.assert(!isValidSubstackUrl('not-a-link'), 'isValidSubstackUrl: rejects non-URL string');
  runner.assert(!isValidSubstackUrl(''), 'isValidSubstackUrl: rejects empty string');
  runner.assert(!isValidSubstackUrl(null as any), 'isValidSubstackUrl: handles null safely');

  // 6. normalizeTags
  runner.assertEqual(normalizeTags('["art", "history"]'), ['art', 'history'], 'normalizeTags: parses JSON string array');
  runner.assertEqual(normalizeTags('art, philosophy, science'), ['art', 'philosophy', 'science'], 'normalizeTags: splits comma string');
  runner.assertEqual(normalizeTags('tag1; tag2; tag3'), ['tag1', 'tag2', 'tag3'], 'normalizeTags: splits semicolon string');
  runner.assertEqual(normalizeTags('#art, #culture, ##heritage'), ['art', 'culture', 'heritage'], 'normalizeTags: strips leading # symbols');
  runner.assertEqual(normalizeTags('"[art]", "[science]"'), ['art', 'science'], 'normalizeTags: cleans residual bracket artifacts');
  runner.assertEqual(normalizeTags(['philosophy', 'history']), ['philosophy', 'history'], 'normalizeTags: passes clean string array');
  runner.assertEqual(normalizeTags([['tag1', 'tag2'], ['tag3']]), ['tag1', 'tag2', 'tag3'], 'normalizeTags: handles nested arrays');
  runner.assertEqual(normalizeTags(''), [], 'normalizeTags: empty string returns empty array');
  runner.assertEqual(normalizeTags('   '), [], 'normalizeTags: whitespace string returns empty array');
  runner.assertEqual(normalizeTags('[]'), [], 'normalizeTags: empty JSON array returns empty array');
  runner.assertEqual(normalizeTags(null), [], 'normalizeTags: null returns empty array');
  runner.assertEqual(normalizeTags(undefined), [], 'normalizeTags: undefined returns empty array');

  // 7. formatTagsForDisplay
  runner.assertEqual(formatTagsForDisplay(['art', 'design']), 'art, design', 'formatTagsForDisplay: formats array as comma string');
  runner.assertEqual(formatTagsForDisplay('["art", "design"]'), 'art, design', 'formatTagsForDisplay: handles JSON string input');
  runner.assertEqual(formatTagsForDisplay(''), '', 'formatTagsForDisplay: empty string produces empty string');
  runner.assertEqual(formatTagsForDisplay(null), '', 'formatTagsForDisplay: null produces empty string');

  // 8. validateEventLinks
  const validPayload = {
    image: '/uploads/poster.png',
    urbanaut_url: 'https://urbanaut.app/event/123',
    archive_image: '/archive/recap.jpg',
    youtube_urls: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    substack_urls: ['/articles/why-we-gather'],
  };
  runner.assertEqual(validateEventLinks(validPayload), { valid: true, errors: {} }, 'validateEventLinks: valid payload passes with no errors');

  const invalidImagePayload = { image: 'invalid-image-path' };
  const imgRes = validateEventLinks(invalidImagePayload);
  runner.assert(!imgRes.valid && Boolean(imgRes.errors.image), 'validateEventLinks: flags invalid poster image');

  const invalidYtPayload = { youtube_urls: ['https://notyoutube.com/123'] };
  const ytRes = validateEventLinks(invalidYtPayload);
  runner.assert(!ytRes.valid && Boolean(ytRes.errors.youtube_urls), 'validateEventLinks: flags invalid YouTube link in list');

  const invalidSsPayload = { substack_urls: ['not-a-valid-url'] };
  const ssRes = validateEventLinks(invalidSsPayload);
  runner.assert(!ssRes.valid && Boolean(ssRes.errors.substack_urls), 'validateEventLinks: flags invalid Substack link in list');

  const validMapPayload = { venue_map_url: 'https://maps.app.goo.gl/abcdef123' };
  const validMapRes = validateEventLinks(validMapPayload);
  runner.assert(validMapRes.valid, 'validateEventLinks: accepts valid Google Maps link');

  const invalidMapPayload = { venue_map_url: 'https://not-google-maps.com/pin' };
  const invalidMapRes = validateEventLinks(invalidMapPayload);
  runner.assert(!invalidMapRes.valid && Boolean(invalidMapRes.errors.venue_map_url), 'validateEventLinks: flags non-Google map URL');

  runner.endSuite();
}
