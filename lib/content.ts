/**
 * Site Content — single source of truth for all static text/copy on the PUBLIC site.
 *
 * Rule: if it's words/labels/descriptions a human wrote (not event/article data,
 * which lives in SQLite), it belongs here. Edit this file to change what the
 * site says — no need to touch component files for copy changes.
 *
 * NOT covered here (on purpose, see Context Docs/SITE-OVERVIEW.md "content.ts scope"):
 *  - Event & article data — that's in the database, managed via /admin
 *  - Admin panel copy (internal tool, not visitor-facing)
 *  - Small modals not yet migrated: BookingModal, AllUpcomingEventsModal
 */

export const brand = {
  name: 'unLecture',
  tagline: 'Lectures (+more) in unconventional spaces',
};

// Nav (Figma node 113:1353 — two link groups flanking a centered wordmark).
// No anchor links — all four are real routes.
export const navV2 = {
  leftLinks: [
    { label: 'HOME', href: '/' },
    { label: 'EVENTS', href: '/events' },
  ],
  rightLinks: [
    { label: 'ARTICLES', href: '/articles' },
    { label: 'CONTACT', href: '/contact' },
  ],
};

export const footer = {
  email: 'teamunlecture@gmail.com',
  city: 'Delhi NCR',
  socials: [
    { label: 'Instagram', href: 'https://www.instagram.com/theunlecture/' },
    { label: 'WhatsApp', href: 'https://chat.whatsapp.com/Gn1sAZqtCRKHcmBvLFxiYs' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/unlecture/' },
  ],
};

export const hero = {
  heading: 'Lectures (+more) in unconventional spaces',
};

// "How We Gather" — the 4 event format cards on the homepage.
// `shortLabel` is the exact uppercase wording used on the V2 ticket cards
// (Figma node 126:2301), as an array of lines — GFT/Community/Series wrap
// to two lines there, unLecture stays on one. `imgV2` is the real photo
// supplied for that section (public/main images/).
export const formats = [
  {
    name: 'Grounds for Thought',
    shortLabel: ['GROUNDS FOR', 'THOUGHTS'],
    href: '/events/grounds-for-thought',
    desc: "Held across Blue Tokai cafés. A more intimate format to sit with topics that are actually relevant to us. Sometimes it's someone's PhD thesis, other times it's a question that doesn't have a paper written on it yet.",
    imgV2: '/main%20images/Ground%20For%20Thoughts.jpg',
    alt: 'Intimate gathering at a Grounds for Thought event with Blue Tokai',
  },
  {
    name: 'unLecture',
    shortLabel: ['UNLECTURE'],
    href: '/events/unlecture',
    desc: 'Our flagship event. It breaks the binary that certain conversations only happen inside certain institutions. We make room for that discourse in the casual spaces we already frequent, and treat learning as something you do out in the city.',
    imgV2: '/main%20images/Unlecture.jpg',
    alt: 'Speaker and audience at a flagship unLecture event',
  },
  {
    name: 'Community Events',
    shortLabel: ['COMMUNITY', 'EVENTS'],
    href: '/events/community',
    desc: 'Unique events that build the space along with us. The formats keep evolving. This is our way of keeping the community, and the interactions that matter, accessible to most.',
    imgV2: '/main%20images/Community%20Events.png',
    alt: 'Community gathering at an unLecture community event',
  },
  {
    name: 'unLecture Series',
    shortLabel: ['UNLECTURE', 'SERIES'],
    href: '/events/unlecture-series',
    desc: "A chance to go deep into one topic of interest, programmed over a few weeks. By the end of it, you're sure to have grown and taken something away with you.",
    imgV2: '/main%20images/Unlecture%20Series.jpg',
    alt: 'unLecture Series — themed multi-evening programming',
  },
];

export const formatsHeadingV2 = 'How We Gather';
export const knowEventsLabelV2 = 'Hover For More!';

// About section — Figma node 133:2302 (heading for the whole section).
export const about = {
  manifestoHeadingV2: 'The Manifesto (About Us)',
  lead: 'unLecture was created with the intention of having somewhere in the city centred around curiosity, conversation and meaningful (sometimes very niche) ideas.',
  paragraphs: [
    "Delhi has a real appetite for this. You could always chance upon people who felt the same way, but there was nothing stable or recurring to return to, no place to take an interest further and expand on what you already knew. Discourse around certain subjects felt locked up behind institutions, jargon and qualifications.",
    "With unLecture we try to break the binary of those rigid ideals and make interesting ideas speakable again. As the name suggests, it's an unconventional take on a lecture. By moving important discussions out of ivory towers and into the casual settings we already frequent, we're exploring what can actually be achieved when very different people sit in the same room, a different kind of community building.",
    "What started as a passion project by three friends from college has grown much bigger than that, because it came to mean a lot more to a lot of people. unLecture now runs not just lectures but several kinds of events every week. We raise real questions, get people out of the house, and put a few like-minded strangers around you along the way.",
    "The idea is to keep this space warm and intimate. Somewhere you're encouraged to (un)learn and one you'll want to come back to. The door's open :]",
  ],
};

// "As Seen In" press marquee. NOTE: every href below is a placeholder "#" —
// nobody ever added the real article links. See Context Docs/SITE-OVERVIEW.md.
export const pressLogos = [
  { id: 1, src: '/newsfeatureslogo/Delhi-Times.png',        alt: 'Delhi Times',        href: '#' },
  { id: 2, src: '/newsfeatureslogo/economic-times.png',     alt: 'Economic Times',     href: '#' },
  { id: 3, src: '/newsfeatureslogo/indian-express.png',     alt: 'Indian Express',     href: '#' },
  { id: 4, src: '/newsfeatureslogo/local-samosa.png',       alt: 'Local Samosa',       href: '#' },
  { id: 5, src: '/newsfeatureslogo/new-indian-express.png', alt: 'New Indian Express', href: '#' },
  { id: 6, src: '/newsfeatureslogo/the-telegraph.png',      alt: 'The Telegraph',      href: '#' },
  { id: 7, src: '/newsfeatureslogo/times-of-india.png',     alt: 'Times of India',     href: '#' },
  { id: 8, src: '/newsfeatureslogo/vogue.png',              alt: 'Vogue',              href: '#' },
];
export const pressSectionLabelV2 = 'As Seen In';
export const allUpcomingEventsLabel = 'All Upcoming Events';
export const checkThemOutLabel = 'Check Them Out!';

export const newsletterHeadingV2 = 'Sign Up For Our Newsletter';

export const contactPage = {
  metaTitle: 'Contact — unLecture',
  metaDescription: 'Get in touch with unLecture for collaborations, speaking, hosting, and enquiries.',
};

// Figma node 152:756.
export const contactPageV2 = {
  heading: 'Contact Us',
  sub: 'Have a thought? A question? A place we should know about? Throw it our way.',
  namePlaceholder: "Your full name*",
  emailPlaceholder: 'Enter the email*',
  phonePlaceholder: 'Share mobile number*',
  rolePlaceholder: 'Reaching out as*',
  messagePlaceholder: "What's on your mind?*",
  submitLabel: 'Send the message',
};

// V2 Events page (Figma node 156:1012) — events only, no articles.
export const eventsPageV2 = {
  heading: 'Events Archive',
  searchPlaceholder: 'Search for events',
  perPage: 9,
};

// V2 Articles page (Figma node 163:1980) — same layout as Events, but with
// wave/card colors swapped and no TYPE filter (articles are one type).
export const articlesPageV2 = {
  heading: 'Our Articles',
  searchPlaceholder: 'Search for articles',
  perPage: 9,
};
