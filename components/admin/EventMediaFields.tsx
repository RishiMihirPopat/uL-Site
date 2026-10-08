import React from 'react';
import styles from '../../app/admin/admin.module.css';

interface EventMediaFieldsProps {
  formData: {
    image?: string;
    urbanaut_url?: string;
    booking_link_type?: string;
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
  const isExternal = formData.booking_link_type === 'external';

  return (
    <div className={styles.formSection}>
      <div className={styles.formSectionHeader}>
        <h2 className={styles.formSectionTitle}>3. Media & Ticketing</h2>
        <p className={styles.formSectionDesc}>Upload the poster graphic and configure ticketing actions.</p>
      </div>

      <div className={`${styles.uploadBox} ${validationErrors.image ? styles.uploadBoxError : ''}`}>
        <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
          Event Poster Graphic (Upload file or provide path) *
        </label>
        <input type="file" accept="image/*" className={styles.input} onChange={onPosterUpload} />
        {uploading && <p style={{ fontSize: '0.85rem', color: 'var(--color-primary, #6B2D2D)', fontFamily: 'var(--font-mono, monospace)', margin: 0 }}>Uploading poster...</p>}

        <div>
          <label style={{ fontSize: '0.82rem', color: 'var(--color-text-muted, #3D332A)', fontFamily: 'var(--font-mono, monospace)' }}>Poster URL directly:</label>
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
              style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border, #D6C9B0)' }}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--color-olive, #5A5A3C)', fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>Poster image loaded</span>
          </div>
        )}
      </div>

      {/* 2 Options for Event Cards: Urbanaut widget vs Redirect to another tab */}
      <div className={styles.formGroup}>
        <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
          Event Card Action / Booking Destination *
        </label>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted, #3D332A)', margin: '0 0 10px 0' }}>
          Choose what happens when visitors click on this event card across the website:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '8px' }}>
          {/* Option 1: Urbanaut Widget */}
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '14px 16px',
              borderRadius: '8px',
              border: !isExternal
                ? '2px solid var(--color-primary, #6B2D2D)'
                : '1px solid var(--color-border-strong, #BFB09A)',
              background: !isExternal
                ? 'var(--color-bg-surface, #EDE4D3)'
                : '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
          >
            <input
              type="radio"
              name="booking_link_type"
              value="urbanaut"
              checked={!isExternal}
              onChange={onChange}
              style={{ marginTop: '3px', accentColor: 'var(--color-primary, #6B2D2D)', width: '16px', height: '16px' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <strong style={{ fontSize: '0.92rem', color: 'var(--color-text, #1A1714)' }}>
                  Open Urbanaut Widget
                </strong>
                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(107, 45, 45, 0.1)', color: 'var(--color-primary, #6B2D2D)', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)' }}>
                  POPUP MODAL
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted, #3D332A)', margin: 0, lineHeight: 1.4 }}>
                Opens the built-in Urbanaut ticketing widget popup directly on the site (as is).
              </p>
            </div>
          </label>

          {/* Option 2: Redirect to Another Tab */}
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '14px 16px',
              borderRadius: '8px',
              border: isExternal
                ? '2px solid var(--color-primary, #6B2D2D)'
                : '1px solid var(--color-border-strong, #BFB09A)',
              background: isExternal
                ? 'var(--color-bg-surface, #EDE4D3)'
                : '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
          >
            <input
              type="radio"
              name="booking_link_type"
              value="external"
              checked={isExternal}
              onChange={onChange}
              style={{ marginTop: '3px', accentColor: 'var(--color-primary, #6B2D2D)', width: '16px', height: '16px' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <strong style={{ fontSize: '0.92rem', color: 'var(--color-text, #1A1714)' }}>
                  Redirect to Another Tab
                </strong>
                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(90, 90, 60, 0.15)', color: 'var(--color-olive, #5A5A3C)', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)' }}>
                  NEW TAB ↗
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted, #3D332A)', margin: 0, lineHeight: 1.4 }}>
                Opens directly in a new browser tab (for events not listed on Urbanaut, e.g. Paytm Insider, BookMyShow, Luma, Google Form).
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>
          {isExternal
            ? 'External Ticketing / Registration Link (Optional)'
            : 'Urbanaut Booking URL (Optional)'}
        </label>
        <input
          name="urbanaut_url"
          className={styles.input}
          value={formData.urbanaut_url || ''}
          onChange={onChange}
          placeholder={
            isExternal
              ? 'https://insider.in/... or https://luma.com/...'
              : 'https://app.urbanaut.in/...'
          }
        />
        {validationErrors.urbanaut_url && <p className={styles.errorText}>{validationErrors.urbanaut_url}</p>}
      </div>
    </div>
  );
}
