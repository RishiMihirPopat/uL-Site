import Link from 'next/link';
import styles from './Nav.module.css';

export default function Nav() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.wordmark}>
        unLecture
      </Link>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link href="/contact" className={styles.link}>
          Contact
        </Link>
      </nav>
    </header>
  );
}
