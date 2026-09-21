import HeroLectureCarousel from './HeroLectureCarousel';
import NewsletterFormV2 from './NewsletterFormV2';
import FadeIn, { FadeInItem } from './FadeIn';
import HowWeGatherSection from './HowWeGatherSection';
import AsSeenInSection from './AsSeenInSection';
import { getActiveEvents, getCarouselEventIds, mapRowToDisplayEvent } from '../lib/db';
import {
  hero as heroContent,
  formats,
  formatsHeadingV2,
  knowEventsLabelV2,
  knowEventsLabelMobileV2,
  about,
  pressLogos,
  pressSectionLabelV2,
  newsletterHeadingV2,
} from '../lib/content';
import styles from '../app/page.module.css';

export default async function HomeView() {
  const activeRows = await getActiveEvents();
  const carouselIds = await getCarouselEventIds();

  const allActiveEvents = activeRows.map(mapRowToDisplayEvent);

  // Selected carousel events or default to unlecture events
  const carouselEvents = carouselIds.length > 0
    ? allActiveEvents.filter(e => carouselIds.includes(e.id))
    : allActiveEvents.filter(e => e.category === 'unlecture');

  const finalCarouselEvents = carouselEvents.length > 0 ? carouselEvents : allActiveEvents;

  return (
    <main className={styles.main}>

      {/* ── 1. Hero — full-width carousel on a gridded backdrop, no headline
             copy shown (kept for SEO/a11y only, visually hidden) ── */}
      <section className={styles.heroV2}>
        <h1 className={styles.heroV2SrOnly}>{heroContent.heading}</h1>
        <div className={styles.heroV2CarouselWrap}>
          <HeroLectureCarousel
            events={finalCarouselEvents}
            allEvents={allActiveEvents}
          />
        </div>
      </section>

      {/* ── 2. How We Gather — Figma node 126:2301 ─────────────────── */}
      <HowWeGatherSection
        heading={formatsHeadingV2}
        hoverLabel={knowEventsLabelV2}
        mobileLabel={knowEventsLabelMobileV2}
        formats={formats}
      />

      {/* ── 3. The Manifesto (About Us) — Figma node 133:2309 ── */}
      <FadeIn id="about" className={styles.manifestoV2}>
        <FadeInItem>
          <h2 className={styles.manifestoHeadingV2}>
            {about.manifestoHeadingV2}{' '}
            <span className={styles.manifestoHeadingSubV2}>{about.manifestoHeadingSubV2}</span>
          </h2>
        </FadeInItem>
        <FadeInItem>
          <div className={styles.manifestoBoxV2}>
            <picture className={styles.pictureContentsV2}>
              <source media="(max-width: 900px)" srcSet="/custom-assets/manifesto-bg-mobile.png" />
              <img
                src="/custom-assets/manifesto-bg-web.png"
                alt=""
                className={styles.manifestoBgImgV2}
                aria-hidden="true"
              />
            </picture>
            <div className={styles.manifestoTextV2}>
              <p>{about.lead}</p>
              {about.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </FadeInItem>
      </FadeIn>

      {/* ── 4. As Seen In — Figma node 133:2325 ── */}
      <AsSeenInSection heading={pressSectionLabelV2} logos={pressLogos} />

      {/* ── 5. Newsletter — Figma node 138:17 ── */}
      <FadeIn className={styles.newsletterV2}>
        <picture className={styles.pictureContentsV2}>
          <source media="(max-width: 900px)" srcSet="/wavy-shapes/mobile/newsletter-wavy-shape.png" />
          <img
            src="/wavy-shapes/website/newsletter-wavy-shape.png"
            alt=""
            className={styles.newsletterWaveImgV2}
            aria-hidden="true"
          />
        </picture>
        <div className={styles.newsletterInnerV2}>
          <FadeInItem>
            <h2 className={styles.newsletterHeadingV2}>{newsletterHeadingV2}</h2>
          </FadeInItem>
          <FadeInItem>
            <NewsletterFormV2 />
          </FadeInItem>
        </div>
      </FadeIn>

    </main>
  );
}
