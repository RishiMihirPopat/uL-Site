import ContactForm from '../../components/ContactForm';
import styles from './page.module.css';

export const metadata = {
  title: 'Contact — unLecture',
  description: 'Get in touch with unLecture for collaborations, speaking, hosting, and enquiries.',
};

export default function ContactPage() {
  return (
    <main className={styles.main}>
      <div className={styles.inner}>
        {/* Left column: Header copy */}
        <div className={styles.header}>
          <p className={styles.eyebrow}>Get in touch</p>
          <h1 className={styles.heading}>Contact Us</h1>
          <p className={styles.sub}>
            Questions, collaborations, venue suggestions, or just want to say hello &mdash; we&apos;re glad you reached out.
          </p>
        </div>

        {/* Right column: Form */}
        <div className={styles.formWrap}>
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
