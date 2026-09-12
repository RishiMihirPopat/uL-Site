import React from 'react';
import styles from '../../app/admin/admin.module.css';

interface EventMediaFieldsProps {
  formData: {
    image?: string;
    urbanaut_url?: string;
  };
  validationErrors: Record<string, string>;
  uploading: boolean;
  onPosterUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EventMediaFields({
  formData,
  validationErrors,
  uploading,
  onPosterUpload,
  onChange,
}: EventMediaFieldsProps) {
  return (
    <div className={styles.formSection}>
      <div className={styles.formSectionHeader}>
        <h2 className={styles.formSectionTitle}>3. Media & Ticketing</h2>
        <p className={styles.formSectionDesc}>Upload the poster graphic and link to the ticketing platform.</p>
      </div>

      <div className={`${styles.uploadBox} ${validationErrors.image ? styles.uploadBoxError : ''}`}>
        <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
          Event Poster Graphic (Upload file or provide path) *
        </label>
        <input type="file" accept="image/*" className={styles.input} onChange={onPosterUpload} />
        {uploading && <p style={{ fontSize: '0.85rem', color: '#C26540', margin: 0 }}>Uploading poster...</p>}

        <div>
          <label style={{ fontSize: '0.82rem', color: '#666' }}>Poster URL directly:</label>
          <input
            name="image"
            className={styles.input}
            value={formData.image || ''}
            onChange={onChange}
            placeholder="/uploads/... or https://..."
            required
          />
          {validationErrors.image && <p className={styles.errorText}>{validationErrors.image}</p>}
        </div>

        {formData.image && (
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={formData.image}
              alt="Poster preview"
              style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #D6C9B0' }}
            />
            <span style={{ fontSize: '0.85rem', color: '#2E7D32', fontWeight: 600 }}>Poster image loaded</span>
          </div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label>Urbanaut Booking URL (Optional)</label>
        <input
          name="urbanaut_url"
          className={styles.input}
          value={formData.urbanaut_url || ''}
          onChange={onChange}
          placeholder="https://app.urbanaut.in/..."
        />
        {validationErrors.urbanaut_url && <p className={styles.errorText}>{validationErrors.urbanaut_url}</p>}
      </div>
    </div>
  );
}
