export interface ArchiveCard {
  id: string;
  date: string;
  title: string;
  venue: string;
  speaker: string;
  description: string;
  image: string;
  tags: string[];
  specialBadge?: string;
  category: 'unlecture' | 'grounds-for-thought';
  urbanautUrl: string;
}

export const ARCHIVE_CARDS: ArchiveCard[] = [
  {
    id: 'sex-death-life',
    date: 'June 2026',
    title: 'Sex, Death, And The Long War Of Life',
    venue: 'The Piano Man (Eldeco Centre), Malviya Nagar',
    speaker: 'Ambarish Satwik',
    description:
      "unLecture's biggest crowd yet — 170 strong — settled in for surgeon-turned-writer Ambarish Satwik's provocation that you were never meant to exist, and that this might be the most liberating fact about you. A dark, funny, unsparingly scientific tour through evolution, sex, and mortality, complimentary drink included.",
    image: '/archive/ambarish.JPG',
    tags: ['evolution', 'science', 'mortality', 'biology'],
    specialBadge: 'RECORD ATTENDANCE — 170 GUESTS',
    category: 'unlecture',
    urbanautUrl: 'https://urbanaut.app/spot/sex-death-and-the-long-war-of-life-13825',
  },
  {
    id: 'slenderman',
    date: 'October 2025',
    title: 'unLecture: The Curious Case of Slenderman',
    venue: 'Siyah Arthouse, Saket',
    speaker: 'Vaibhav Dwivedi',
    description:
      "A Halloween-season descent into the internet's most infamous urban legend, led by St. Stephen's professor Vaibhav Dwivedi, tracing how a 2009 forum hoax metastasized into a myth millions still believe. Equal parts folklore lecture and ghost story, with a live performance and custom merch to match the mood.",
    image: '/archive/hero.JPG',
    tags: ['internet', 'folklore', 'myth', 'culture'],
    specialBadge: 'HALLOWEEN SPECIAL',
    category: 'unlecture',
    urbanautUrl: 'https://urbanaut.app/spot/unlecture-the-curious-case-of-slenderman',
  },
  {
    id: 'sarkari-official',
    date: 'September 2025',
    title: 'unLecture: The Powerful, Powerless Sarkari Official',
    venue: 'Siyah Arthouse, Saket',
    speaker: 'Yamini Aiyar',
    description:
      "unLecture's second-ever outing sold out fast, as public policy scholar Yamini Aiyar unpacked the paradox of India's frontline bureaucrats — officials who hold enormous power on paper and almost none of it in practice. Signed copies of her book and a live music set sweetened an already unmissable afternoon.",
    image: '/archive/yamini2.jpg',
    tags: ['policy', 'bureaucracy', 'governance', 'india'],
    specialBadge: 'SOLD OUT',
    category: 'unlecture',
    urbanautUrl: 'https://urbanaut.app/spot/unlecture-the-powerful-powerless-sarkari-official',
  },
  {
    id: 'drinks-changed-world',
    date: 'December 2025',
    title: 'Drinks That Changed the World',
    venue: 'Fort City Brewing, Hauz Khas',
    speaker: 'Gagan Sharma',
    description:
      "unLecture's first plunge into pure sensory storytelling: award-winning sommelier Gagan Sharma traced how alcohol has quietly toppled empires and sparked rebellions, one curated pour at a time. Part history lecture, part tasting, entirely unlike anything in a classroom.",
    image: '/archive/drinksgagan.JPG',
    tags: ['history', 'alcohol', 'empires', 'tasting'],
    category: 'unlecture',
    urbanautUrl: 'https://urbanaut.app/spot/drinks-that-changed-the-world',
  },
  {
    id: 'digital-rights',
    date: 'November 2025',
    title: 'Grounds for Thought: A Guide to Digital Rights',
    venue: 'Blue Tokai Coffee Roasters, Mehrauli',
    speaker: 'Apar Gupta',
    description:
      "The debut edition of Grounds for Thought, unLecture's new lecture series with Blue Tokai, brought Internet Freedom Foundation director Apar Gupta to break down what your rights look like when your data, your feed, and your favorite app can all vanish on a single order. Coffee in hand, the crowd left with a plain-English map of the fight for a free internet.",
    image: '/archive/apar.JPG',
    tags: ['internet', 'rights', 'policy', 'technology'],
    specialBadge: 'FIRST EDITION',
    category: 'grounds-for-thought',
    urbanautUrl: 'https://urbanaut.app/spot/grounds-for-thought-a-guide-to-digital-rights-9463',
  },
];
