import React from 'react';
import styles from '../../app/admin/admin.module.css';

interface EventScheduleFieldsProps {
  formData: {
    event_datetime?: string | null;
    date?: string;
    time?: string;
    price?: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EventScheduleFields({ formData, onChange }: EventScheduleFieldsProps) {
  return (
    <div className={styles.formSection}>
      <div className={styles.formSectionHeader}>
        <h2 className={styles.formSectionTitle}>2. Schedule & Pricing</h2>
        <p className={styles.formSectionDesc}>Set timestamps, editorial display dates, and admission pricing.</p>
      </div>

      <div className={styles.formGroup}>
        <label>Event Date & Time (ISO timestamp picker)</label>
        <input
          type="datetime-local"
          name="event_datetime"
          className={styles.input}
          value={formData.event_datetime || ''}
          onChange={onChange}
        />
        <span className={styles.formGroupHelper}>Selecting a timestamp automatically sets display date/time below.</span>
      </div>

      <div className={styles.formGrid2}>
        <div className={styles.formGroup}>
          <label>Display Date (e.g. Sat, 4 Jul) *</label>
          <input
            name="date"
            className={styles.input}
            value={formData.date || ''}
            onChange={onChange}
            placeholder="Sat, 4 Jul"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Display Time (e.g. 6:30 PM)</label>
          <input
            name="time"
            className={styles.input}
            value={formData.time || ''}
            onChange={onChange}
            placeholder="6:30 PM"
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Price / Entry Fee</label>
        <input
          name="price"
          className={styles.input}
          value={formData.price || ''}
          onChange={onChange}
          placeholder="e.g. ₹500 or Free"
        />
      </div>
    </div>
  );
}
