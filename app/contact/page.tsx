import ContactForm from '../../components/ContactForm';
import styles from './page.module.css';

export const metadata = {
  title: 'Contact — unLecture',
};

export default function ContactPage() {
  return (
    <main className={styles.main}>
      <div className={styles.inner}>

        <div className={styles.header}>
          <p className={styles.eyebrow}>Get in touch</p>
          <h1 className={styles.heading}>Contact us</h1>
          <p className={styles.sub}>
            Questions, collaborations, venue suggestions, or just want to say hello —
            we&apos;re glad you reached out.
          </p>
        </div>

        <div className={styles.formWrap}>
          <ContactForm />
        </div>

      </div>
    </main>
  );
}
