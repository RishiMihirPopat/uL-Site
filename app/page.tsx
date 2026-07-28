import Image from 'next/image';
import PostcardArchive from '../components/PostcardArchive';
import { FormatCardLink } from '../components/FormatCardLink';
import { CardTitle } from '../components/AnimatedTitle';
import NewsletterForm from '../components/NewsletterForm';
import styles from './page.module.css';

const TICKER = 'Lectures · Conversations · Unconventional Spaces · Delhi NCR · Est. 2025 · Ideas That Stay ·';

const formats = [
  {
    name: 'Grounds for Thought',
    href: '/events/grounds-for-thought',
    desc: 'In Partnership with Blue Tokai. A smaller format, more intimate setting — conversations on the things we actually live with.',
    img: '/category-covers/gft-cover.png',
    alt: 'Intimate gathering at a Grounds for Thought event with Blue Tokai',
  },
  {
    name: 'unLecture',
    href: '/events/unlecture',
    desc: 'In-person lectures in unconventional spaces. A speaker, an idea, and an evening that unfolds with the conversation.',
    img: '/category-covers/unLecture-cover.jpg',
    alt: 'Speaker and audience at a flagship unLecture event',
  },
  {
    name: 'Community Events',
    href: '/events/community',
    desc: 'Recurring evenings shaped by the people who show up. Familiar faces, evolving formats, ideas that stay with you.',
    img: '/category-covers/community-cover.JPG',
    alt: 'Community gathering at an unLecture community event',
  },
  {
    name: 'unLecture Series',
    href: '/events/unlecture-series',
    desc: 'A series of connected conversations and hands-on sessions exploring one idea deeply — multiple perspectives, one thread, building recurring communities around shared interests.',
    img: '/category-covers/series-cover.JPG',
    alt: 'unLecture Series — themed multi-evening programming',
  },
];

const pressLogos = [
  { id: 1, src: '/newsfeatureslogo/Delhi-Times.png',       alt: 'Delhi Times',        href: '#' },
  { id: 2, src: '/newsfeatureslogo/economic-times.png',    alt: 'Economic Times',     href: '#' },
  { id: 3, src: '/newsfeatureslogo/indian-express.png',    alt: 'Indian Express',     href: '#' },
  { id: 4, src: '/newsfeatureslogo/local-samosa.png',      alt: 'Local Samosa',       href: '#' },
  { id: 5, src: '/newsfeatureslogo/new-indian-express.png',alt: 'New Indian Express', href: '#' },
  { id: 6, src: '/newsfeatureslogo/the-telegraph.png',     alt: 'The Telegraph',      href: '#' },
  { id: 7, src: '/newsfeatureslogo/times-of-india.png',    alt: 'Times of India',     href: '#' },
  { id: 8, src: '/newsfeatureslogo/vogue.png',             alt: 'Vogue',              href: '#' },
];

export default function Home() {
  return (
    <main className={styles.main}>

      {/* ── Hero — dark forest, two-column, polaroid ─────── */}
      <section className={styles.hero}>

{/* Left column — text */}
        <div className={styles.heroLeft}>
          <div className={styles.heroBadge} aria-hidden="true">
            <span>Delhi</span>
            <span>NCR</span>
          </div>

          <div className={styles.heroTextBlock}>
            <p className={styles.heroEyebrow}>Est. 2025</p>
            <h1 className={styles.heroWordmark}>unLecture</h1>
            <p className={styles.heroTagline}>
              Lectures (+more) in unconventional spaces
            </p>
          </div>

          <div className={styles.heroStamp} aria-hidden="true">
            <span>✦</span>
            <span>unLecture</span>
            <span>✦</span>
          </div>
        </div>

        {/* Right column — interactive postcard archive */}
        <div className={styles.heroRight}>
          <PostcardArchive />
        </div>

      </section>

      {/* ── Ticker strip — terracotta marquee ────────────── */}
      <div className={styles.ticker} aria-hidden="true">
        <div className={styles.tickerTrack}>
          <span className={styles.tickerText}>{TICKER}&nbsp;&nbsp;&nbsp;</span>
          <span className={styles.tickerText}>{TICKER}&nbsp;&nbsp;&nbsp;</span>
          <span className={styles.tickerText}>{TICKER}&nbsp;&nbsp;&nbsp;</span>
          <span className={styles.tickerText}>{TICKER}&nbsp;&nbsp;&nbsp;</span>
        </div>
      </div>

      {/* ── About — parchment, watermark, asymmetric ─────── */}
      <section className={styles.about}>
        <div className={styles.aboutGrid}>
          <div className={styles.aboutLeft}>
            <p className={styles.aboutLabel}>About the series</p>
            <h2 className={styles.aboutHeading}>
              A space in the city where your curiosity is nourished
            </h2>
          </div>
          <div className={styles.aboutRight}>
            <p>
              unLecture is a recurring series of lectures, conversations and
              gatherings held in unconventional spaces across the city: cafés,
              bookstores, studios, courtyards — places we already frequent that
              aren&apos;t as sterile as a lecture hall.
            </p>
            <p>
              We turn ideas that have become hyper-specialised, jargon-heavy, or
              intimidating — and bring them back into everyday life. Not by
              diluting them. By making them speakable again.
            </p>
            <p>
              The events are open to anyone. No prior reading, no institutional
              affiliation, no field of study required. Just the willingness to sit
              in a room with strangers and think out loud for a couple of hours.
            </p>
            <p>
              We started in Delhi in 2025. We&apos;re slowly expanding to other
              cities. Below, the three formats we currently work with.
            </p>
          </div>
        </div>
      </section>

      {/* ── Formats — tall portrait cards, color-blocked ─── */}
      <section id="formats" className={styles.formats}>
        <p className={styles.formatsLabel}>
          <span className={styles.formatsLabelRule} aria-hidden="true" />
          How we gather
        </p>
        <div className={styles.formatGrid}>
          {formats.map((f) => (
            <FormatCardLink key={f.name} href={f.href} className={styles.formatCard}>
              <div className={styles.formatCardImgReveal}>
                <Image
                  src={f.img}
                  alt={f.alt}
                  fill
                  sizes="(max-width: 480px) 100vw, (max-width: 900px) 50vw, 25vw"
                  className={styles.formatCardImg}
                />
              </div>
              <div className={styles.formatCardGradient} aria-hidden="true" />
              <div className={styles.formatCardContent}>
                <div className={styles.formatCardInfo}>
                  <CardTitle href={f.href} className={styles.formatCardName}>{f.name}</CardTitle>
                  <p className={styles.formatCardDesc}>{f.desc}</p>
                </div>
              </div>
            </FormatCardLink>
          ))}
        </div>
      </section>

      {/* ── Quote — mustard, huge editorial type ─────────── */}
      <section className={styles.quote}>
        <span className={styles.quoteOpenMark} aria-hidden="true">&ldquo;</span>
        <blockquote className={styles.quoteText}>
          Curiosity should never be confined to institutions.
        </blockquote>
        <p className={styles.quoteAttr}>— unLecture</p>
      </section>

      {/* ── Featured In — dark bg carousel ───────────────── */}
      <section className={styles.press}>
        <p className={styles.pressLabel}>
          <span className={styles.pressRule} aria-hidden="true" />
          <span>As seen in</span>
          <span className={styles.pressRule} aria-hidden="true" />
        </p>
        <div className={styles.carouselWrap}>
          <div className={styles.carouselInner}>
            {pressLogos.map((l) => (
              <a
                key={l.id}
                href={l.href}
                className={styles.logoItem}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={l.alt}
              >
                <div className={styles.logoFrame}>
                  <Image
                    src={l.src}
                    alt={l.alt}
                    fill
                    sizes="148px"
                    className={styles.logoImg}
                  />
                </div>
              </a>
            ))}
            {pressLogos.map((l) => (
              <a
                key={`d-${l.id}`}
                href={l.href}
                className={styles.logoItem}
                aria-hidden="true"
                tabIndex={-1}
              >
                <div className={styles.logoFrame}>
                  <Image
                    src={l.src}
                    alt=""
                    fill
                    sizes="148px"
                    className={styles.logoImg}
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter signup — maroon, magazine card aesthetic ── */}
      <NewsletterForm />

    </main>
  );
}
