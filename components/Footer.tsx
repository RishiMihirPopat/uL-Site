import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <span className={styles.footerWordmark}>unLecture</span>
        <p className={styles.footerTagline}>de-pedestalising ideas since 2025</p>
      </div>

      <div className={styles.inner}>
        <div className={styles.top}>
          <a href="mailto:teamunlecture@gmail.com" className={styles.email}>
            teamunlecture@gmail.com
          </a>
          <nav className={styles.socials} aria-label="Social links">
            <a href="https://www.instagram.com/theunlecture/" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://chat.whatsapp.com/Gn1sAZqtCRKHcmBvLFxiYs" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href="https://www.linkedin.com/company/unlecture/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </nav>
        </div>

        <div className={styles.footerBottom}>
          <span className={styles.footerCity}>Delhi NCR</span>
          <p className={styles.copy}>© {new Date().getFullYear()} unLecture</p>
        </div>
      </div>
    </footer>
  );
}
