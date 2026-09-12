import styles from './page.module.css';

export default function Loading() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <p className={styles.headerLabel}>Format</p>
          <div style={{ height: '3.5rem', width: '280px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px' }} />
          <div style={{ height: '1.2rem', width: '420px', maxWidth: '80%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '8px' }} />
        </div>
        <div className={styles.headerRule} aria-hidden="true" />
      </header>

      <section className={styles.section}>
        <div className={styles.grid}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                height: '420px',
                backgroundColor: 'rgba(0,0,0,0.03)',
                borderRadius: '8px',
                border: '1px dashed var(--color-border, #E0D6C8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted, #7A7265)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-body)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              Loading event card...
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
