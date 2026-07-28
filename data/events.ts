export type EventCategory =
  | 'unlecture'
  | 'grounds-for-thought'
  | 'community'
  | 'unlecture-series';

export interface Event {
  id: string;
  category: EventCategory;
  title: string;
  speaker: string;
  venue: string;
  date: string;
  time: string;
  price: string;
  description: string;
  image: string;
  urbanautUrl: string;
}

export const EVENTS: Event[] = [

  /* ── unLecture ──────────────────────────────────── */

  {
    id: 'ul-01',
    category: 'unlecture',
    title: 'Does Virtue Survive Darwinian Competition?',
    speaker: 'Brishti Guha',
    venue: 'IFC Social',
    date: 'Sat, 4 Jul',
    time: '—',
    price: '₹550',
    description: '',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/7D45C6BEF38044E4A26BD773DF63A0E8_converted_webp.webp',
    urbanautUrl: 'https://urbanaut.app/spot/ul-does-virtue-survive-darwinian-competition',
  },
  {
    id: 'ul-02',
    category: 'unlecture',
    title: 'When the News Stopped Asking Questions',
    speaker: 'Manisha Pande',
    venue: 'The Piano Man, Eldeco Centre',
    date: 'Sat, 11 Jul',
    time: '—',
    price: '₹499',
    description: '',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/90346EF5F5B3477DAAB9EB2FFEABF7E3_converted_webp.webp',
    urbanautUrl: 'https://urbanaut.app/spot/ul-when-the-news-stopped-asking-questions',
  },
  {
    id: 'ul-03',
    category: 'unlecture',
    title: 'Beyond the Tiger',
    speaker: 'Mahesh Rangarajan',
    venue: 'Depot 48',
    date: 'Sat, 18 Jul',
    time: '—',
    price: '₹499',
    description: '',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/1F278BA4C6414DD481BED08D2057D44E_converted_webp.webp',
    urbanautUrl: 'https://urbanaut.app/spot/ul-beyond-the-tiger',
  },
  {
    id: 'ul-04',
    category: 'unlecture',
    title: 'One Ring to Rule Them All',
    speaker: 'Suprit Singh',
    venue: 'The Piano Man Jazz Club',
    date: 'Sat, 18 Jul',
    time: '—',
    price: '₹699',
    description: '',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/A76A13D3F9904D868C6B9A4157BF0D4A_converted_webp.webp',
    urbanautUrl: 'https://urbanaut.app/spot/ul-one-ring-to-rule-them-all',
  },
  {
    id: 'ul-05',
    category: 'unlecture',
    title: 'Physics Across Frontiers',
    speaker: 'Abhishek Iyer',
    venue: 'Siyah Arthouse',
    date: 'Sun, 19 Jul',
    time: '—',
    price: '₹499',
    description: '',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/390273972A5C4BDBB57754C71F40628F_converted_webp.webp',
    urbanautUrl: 'https://urbanaut.app/spot/ul-physics-across-frontiers',
  },
  {
    id: 'ul-06',
    category: 'unlecture',
    title: 'The Secret History of Indian Sci-Fi',
    speaker: 'Gautam Bhatia',
    venue: 'The Piano Man, Eldeco Centre',
    date: 'Sun, 26 Jul',
    time: '—',
    price: '₹499',
    description: '',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/95AF6B8634C64F37A015D13BD1334485_converted_webp.webp',
    urbanautUrl: 'https://urbanaut.app/spot/ul-the-secret-history-of-indian-sci-fi',
  },
  {
    id: 'ul-07',
    category: 'unlecture',
    title: 'Badass Begums: The Women of the Mughal Era',
    speaker: 'Anoushka Jain',
    venue: 'Chor Bizarre',
    date: 'Thu, 30 Jul',
    time: '—',
    price: '₹499',
    description: '',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/6F4DD141F6A249E3A1E4C0B0B965C4B4_converted_webp.webp',
    urbanautUrl: 'https://urbanaut.app/spot/ul-badass-begums-the-women-of-the-mughal-era',
  },

  /* ── Grounds for Thought ────────────────────────── */

  {
    id: 'gft-01',
    category: 'grounds-for-thought',
    title: 'How Ads Invented What Feels Natural',
    speaker: 'Anish Dasgupta',
    venue: 'Blue Tokai, Vasant Vihar',
    date: 'Sat, 4 Jul',
    time: '5:00 pm – 7:00 pm',
    price: '₹400',
    description: '',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/8B8B2A1AF42943B58452AD0315268087_converted_webp.webp',
    urbanautUrl: 'https://urbanaut.app/spot/gft-how-ads-invented-what-feels-natural',
  },
  {
    id: 'gft-02',
    category: 'grounds-for-thought',
    title: 'Is Business Education Already Outdated?',
    speaker: 'Dr. Yogesh Kumar Jain',
    venue: 'Blue Tokai, Panchsheel Park',
    date: 'Sun, 5 Jul',
    time: '5:00 pm – 7:00 pm',
    price: '₹400',
    description: '',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/B25DBB288C6B42299633A7ACB5E4FD85_converted_webp.webp',
    urbanautUrl: 'https://urbanaut.app/spot/gft-is-business-education-already-outdated',
  },

  /* ── Community & Series: no events yet ─────────── */
  /* Add entries here as events are created. */
];
