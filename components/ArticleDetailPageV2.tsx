'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import MarkdownRenderer from './MarkdownRenderer';
import styles from './ArticleDetailPageV2.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;
const ARROW = '/custom-assets/contact-select-arrow.svg';

interface AdjacentArticle {
  slug: string;
  title: string;
}

interface ArticleDetailPageV2Props {
  title: string;
  subtitle?: string;
  coverImage: string;
  content: string;
  prev: AdjacentArticle | null;
  next: AdjacentArticle | null;
}

function Switcher({ prev, next }: { prev: AdjacentArticle | null; next: AdjacentArticle | null }) {
  return (
    <div className={styles.switcher}>
      {prev ? (
        <Link href={`/articles/${prev.slug}`} className={styles.circleBtn} aria-label={`Previous article: ${prev.title}`}>
          <img src={ARROW} alt="" className={styles.arrowPrev} />
        </Link>
      ) : (
        <span className={`${styles.circleBtn} ${styles.circleBtnDisabled}`} aria-hidden="true">
          <img src={ARROW} alt="" className={styles.arrowPrev} />
        </span>
      )}
      <span className={styles.switchLabel}>SWITCH ARTICLES</span>
      {next ? (
        <Link href={`/articles/${next.slug}`} className={styles.circleBtn} aria-label={`Next article: ${next.title}`}>
          <img src={ARROW} alt="" className={styles.arrowNext} />
        </Link>
      ) : (
        <span className={`${styles.circleBtn} ${styles.circleBtnDisabled}`} aria-hidden="true">
          <img src={ARROW} alt="" className={styles.arrowNext} />
        </span>
      )}
    </div>
  );
}

/** V2 Article/blog detail page — node 166:3306. Two maroon wave bands (top:
 *  Go Back + article switcher; bottom: switcher again) bookend the plain-bg
 *  article body, which uses the self-hosted Ancizar Serif font (see
 *  app/globals.css's --font-article and MarkdownRenderer's --prose-*
 *  custom-property hooks, which this restyles without forking that shared
 *  renderer). */
export default function ArticleDetailPageV2({ title, subtitle, coverImage, content, prev, next }: ArticleDetailPageV2Props) {
  return (
    <div className={styles.pageV2}>
      <section className={styles.waveBandV2}>
        <motion.img
          src="/wavy-shapes/website/blog-wavy-shape.png"
          alt=""
          className={styles.waveImgV2}
          aria-hidden="true"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
        />
        <motion.div
          className={styles.waveInnerV2}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65, ease: EASE }}
        >
          <Link href="/articles" className={styles.goBackBtn}>
            <img src={ARROW} alt="" className={styles.goBackArrow} />
            GO BACK
          </Link>
          <Switcher prev={prev} next={next} />
        </motion.div>
      </section>

      <motion.article
        className={styles.contentV2}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8, ease: EASE }}
      >
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

        {coverImage && (
          <div className={styles.coverWrap}>
            <Image src={coverImage} alt={title} fill priority className={styles.coverImg} />
          </div>
        )}

        <div className={styles.bodyWrap}>
          <MarkdownRenderer content={content} />
        </div>
      </motion.article>

      <section className={styles.waveBandV2}>
        <img
          src="/wavy-shapes/website/blog-wavy-shape.png"
          alt=""
          className={styles.waveImgV2}
          aria-hidden="true"
        />
        <div className={styles.waveInnerV2Bottom}>
          <Switcher prev={prev} next={next} />
        </div>
      </section>
    </div>
  );
}
