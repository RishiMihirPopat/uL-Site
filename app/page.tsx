import Image from 'next/image';
import PostcardArchive from '../components/PostcardArchive';
import HeroLectureCarousel from '../components/HeroLectureCarousel';
import TestimonialsCarousel from '../components/TestimonialsCarousel';
import TickerBanner from '../components/TickerBanner';
import { FormatCardLink } from '../components/FormatCardLink';
import NewsletterForm from '../components/NewsletterForm';
import MobileAboutModal from '../components/MobileAboutModal';
import { getActiveEvents, getFormattedArchivedEvents, getAllTestimonials, getCarouselEventIds, getTickerText } from '../lib/db';
import { EventCategory } from '../lib/types/event';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

const formats = [
  {
    name: 'Grounds for Thought',
    href: '/events/grounds-for-thought',
    desc: "Held across Blue Tokai cafés. A more intimate format to sit with topics that are actually relevant to us. Sometimes it's someone's PhD thesis, other times it's a question that doesn't have a paper written on it yet.",
    img: '/category-covers/gft-cover.png',
    alt: 'Intimate gathering at a Grounds for Thought event with Blue Tokai',
  },
  {
    name: 'unLecture',
    href: '/events/unlecture',
    desc: 'Our flagship event. It breaks the binary that certain conversations only happen inside certain institutions. We make room for that discourse in the casual spaces we already frequent, and treat learning as something you do out in the city.',
    img: '/category-covers/unLecture-cover.jpg',
    alt: 'Speaker and audience at a flagship unLecture event',
  },
  {
    name: 'Community Events',
    href: '/events/community',
    desc: 'Unique events that build the space along with us. The formats keep evolving. This is our way of keeping the community, and the interactions that matter, accessible to most.',
    img: '/category-covers/community-cover.JPG',
    alt: 'Community gathering at an unLecture community event',
  },
  {
    name: 'unLecture Series',
    href: '/events/unlecture-series',
    desc: "A chance to go deep into one topic of interest, programmed over a few weeks. By the end of it, you're sure to have grown and taken something away with you.",
    img: '/category-covers/series-cover.JPG',
    alt: 'unLecture Series — themed multi-evening programming',
  },
];

const pressLogos = [
  { id: 1, src: '/newsfeatureslogo/Delhi-Times.png',        alt: 'Delhi Times',        href: '#' },
  { id: 2, src: '/newsfeatureslogo/economic-times.png',     alt: 'Economic Times',     href: '#' },
  { id: 3, src: '/newsfeatureslogo/indian-express.png',     alt: 'Indian Express',     href: '#' },
  { id: 4, src: '/newsfeatureslogo/local-samosa.png',       alt: 'Local Samosa',       href: '#' },
  { id: 5, src: '/newsfeatureslogo/new-indian-express.png', alt: 'New Indian Express', href: '#' },
  { id: 6, src: '/newsfeatureslogo/the-telegraph.png',      alt: 'The Telegraph',      href: '#' },
  { id: 7, src: '/newsfeatureslogo/times-of-india.png',     alt: 'Times of India',     href: '#' },
  { id: 8, src: '/newsfeatureslogo/vogue.png',              alt: 'Vogue',              href: '#' },
];

export default function Home() {
  const activeRows = getActiveEvents();
  const initialCards = getFormattedArchivedEvents();
  const testimonials = getAllTestimonials();
  const carouselIds = getCarouselEventIds();

  const allActiveEvents = activeRows.map((e) => ({
    id: e.id,
    category: e.category as EventCategory,
    title: e.title,
    speaker: e.speaker,
    venue: e.venue,
    date: e.date,
    time: e.time,
    price: e.price,
    description: e.description,
    image: e.image,
    urbanautUrl: e.urbanaut_url,
    badge: e.archive_badge || undefined,
  }));

  // Selected carousel events or default to unlecture events
  const carouselEvents = carouselIds.length > 0
    ? allActiveEvents.filter(e => carouselIds.includes(e.id))
    : allActiveEvents.filter(e => e.category === 'unlecture');

  const finalCarouselEvents = carouselEvents.length > 0 ? carouselEvents : allActiveEvents;
  const tickerText = getTickerText();

  return (
    <main className={styles.main}>

      {/* ── 1. Hero — Split Layout: Chalkboard Statement + Poster Carousel ─────── */}
      <section className={styles.hero}>
        {/* Left column — Chalkboard statement */}
        <div className={styles.heroLeft}>
          <div className={styles.chalkboardWrap}>
            <h1 className={styles.chalkboardHeading}>
              Lectures (+more) in unconventional spaces
            </h1>
          </div>
        </div>

        {/* Right column — Upcoming Lectures Carousel */}
        <div className={styles.heroRight}>
          <HeroLectureCarousel
            events={finalCarouselEvents}
            allEvents={allActiveEvents}
          />
        </div>
      </section>

      {/* ── 1.5. Moving Orange Ticker Marquee Banner ──────────────── */}
      <TickerBanner text={tickerText} />

      {/* ── 2. Formats — "How We Gather" ─────────────────── */}
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
                  <h3 className={styles.formatCardName}>{f.name}</h3>
                  <p className={styles.formatCardDesc}>{f.desc}</p>
                </div>
              </div>
            </FormatCardLink>
          ))}
        </div>
      </section>

      {/* ── 3. About Us — Repositioned after Event Cards ─── */}
      <section id="about" className={styles.about}>
        <div className={styles.aboutGrid}>
          {/* Left: Quote */}
          <div className={styles.aboutLeft}>
            <p className={styles.aboutLabel}>The Manifesto</p>
            <div className={styles.quoteBlock}>
              <span className={styles.quoteMark} aria-hidden="true">&ldquo;</span>
              <blockquote className={styles.aboutQuoteText}>
                Curiosity should not be confined to institutions.
              </blockquote>
              <p className={styles.aboutQuoteAttr}>— unLecture</p>
            </div>
          </div>

          {/* Right: Body Copy */}
          <div className={styles.aboutRight}>
            <p className={styles.aboutSectionHeading}>ABOUT UNLECTURE</p>

            <p className={styles.aboutLead}>
              unLecture was created with the intention of having somewhere in the city centred around curiosity, conversation and meaningful (sometimes very niche) ideas.
            </p>

            <p>
              Delhi has a real appetite for this. You could always chance upon people who felt the same way, but there was nothing stable or recurring to return to, no place to take an interest further and expand on what you already knew. Discourse around certain subjects felt locked up behind institutions, jargon and qualifications.
            </p>

            <p>
              With unLecture we try to break the binary of those rigid ideals and make interesting ideas speakable again. As the name suggests, it&apos;s an unconventional take on a lecture. By moving important discussions out of ivory towers and into the casual settings we already frequent, we&apos;re exploring what can actually be achieved when very different people sit in the same room, a different kind of community building.
            </p>

            <p>
              What started as a passion project by three friends from college has grown much bigger than that, because it came to mean a lot more to a lot of people. unLecture now runs not just lectures but several kinds of events every week. We raise real questions, get people out of the house, and put a few like-minded strangers around you along the way.
            </p>

            <p>
              The idea is to keep this space warm and intimate. Somewhere you&apos;re encouraged to (un)learn and one you&apos;ll want to come back to. The door&apos;s open :]
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. Community Recommendations / Testimonials Carousel ──── */}
      <div className={styles.testimonialsWrap}>
        <TestimonialsCarousel initialTestimonials={testimonials} />
      </div>

      {/* ── 5. Featured In — Press Carousel ───────────────── */}
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
                target="_blank"
                rel="noopener noreferrer"
                aria-label={l.alt}
              >
                <div className={styles.logoFrame}>
                  <Image
                    src={l.src}
                    alt={l.alt}
                    fill
                    className={styles.logoImg}
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Newsletter — Subscription Block ────────────── */}
      <section className={styles.newsletterSection}>
        <div className={styles.newsletterInner}>
          <NewsletterForm />
        </div>
      </section>

      {/* ── 7. Global Archive Dossier Receiver Modal ──────── */}
      <PostcardArchive initialCards={initialCards} isModalOnly={true} />

      {/* ── 8. Mobile About Overlay Modal ─────────────────── */}
      <MobileAboutModal testimonials={testimonials} pressLogos={pressLogos} />

    </main>
  );
}
