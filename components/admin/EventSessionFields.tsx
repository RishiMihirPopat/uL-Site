import React from 'react';
import styles from '../../app/admin/admin.module.css';
import { ALL_FORMATS } from '@/lib/constants/formats';

interface EventSessionFieldsProps {
  formData: {
    title?: string;
    speaker?: string;
    venue?: string;
    venue_map_url?: string;
    category?: string;
    description?: string;
  };
  validationErrors?: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export function EventSessionFields({ formData, validationErrors, onChange }: EventSessionFieldsProps) {
  const activeMapUrl =
    formData.venue_map_url && formData.venue_map_url.trim() !== ''
      ? formData.venue_map_url.trim()
      : formData.venue && formData.venue.trim() !== ''
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.venue.trim())}`
      : null;

  return (
    <div className={styles.formSection}>
      <div className={styles.formSectionHeader}>
        <h2 className={styles.formSectionTitle}>1. Session & Venue Information</h2>
        <p className={styles.formSectionDesc}>Title, speaker, venue, and teaser copy shown on event cards.</p>
      </div>

      <div className={styles.formGroup}>
        <label>Event Title *</label>
        <input
          name="title"
          className={styles.input}
          value={formData.title || ''}
          onChange={onChange}
          placeholder="e.g. In Conversation with ..."
          required
        />
      </div>

      <div className={styles.formGrid2}>
        <div className={styles.formGroup}>
          <label>Speaker / Host *</label>
          <input
            name="speaker"
            className={styles.input}
            value={formData.speaker || ''}
            onChange={onChange}
            placeholder="e.g. Jane Doe"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Format Category *</label>
          <select
            name="category"
            className={styles.select}
            value={formData.category || ''}
            onChange={onChange}
            required
          >
            <option value="">Select a format...</option>
            {ALL_FORMATS.map(f => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.formGroup}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <label style={{ margin: 0 }}>Venue & Location *</label>
          <span style={{ fontSize: '0.76rem', color: '#888' }}>Select preset or type custom address</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            name="venue"
            list="venue-suggestions"
            className={styles.input}
            style={{ flex: 1, minWidth: '240px' }}
            value={formData.venue || ''}
            onChange={onChange}
            placeholder="Type or select a venue name..."
            required
          />
          <datalist id="venue-suggestions">
            <option value="The Piano Man, Eldeco Centre, Malviya Nagar, Delhi" />
            <option value="The Piano Man, Safdarjung Enclave, Delhi" />
            <option value="Blue Tokai Coffee Roasters, Vasant Vihar, Delhi" />
            <option value="Blue Tokai Coffee Roasters, Mehar Chand Market, Delhi" />
            <option value="Depot 48, Greater Kailash 2, Delhi" />
            <option value="Kunzum Books, Greater Kailash 2, Delhi" />
            <option value="Kunzum Books, Hauz Khas Village, Delhi" />
            <option value="India Habitat Centre, Lodhi Road, Delhi" />
            <option value="Subko Coffee Roasters, Bandra West, Mumbai" />
            <option value="Dr. Marwah Clinic, Defence Colony, Delhi" />
            <option value="Studio 8, Vasant Kunj, Delhi" />
          </datalist>
          {activeMapUrl && (
            <a
              href={activeMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.btn} ${styles.btnSmall}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              title="Test Google Maps location link"
            >
              📍 Test Map ↗
            </a>
          )}
        </div>
      </div>

      <div className={styles.formGroup}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <label style={{ margin: 0 }}>Google Maps Link (Optional)</label>
          <span style={{ fontSize: '0.76rem', color: '#888' }}>Direct pin or share link</span>
        </div>
        <input
          name="venue_map_url"
          type="url"
          className={`${styles.input} ${validationErrors?.venue_map_url ? styles.inputError : ''}`}
          value={formData.venue_map_url || ''}
          onChange={onChange}
          placeholder="e.g. https://maps.app.goo.gl/... or https://google.com/maps/place/..."
        />
        {validationErrors?.venue_map_url ? (
          <span className={styles.errorText}>{validationErrors.venue_map_url}</span>
        ) : (
          <span className={styles.formGroupHelper}>
            Attach an exact Google Maps pin link. If left blank, visitors clicking the venue will search Google Maps for the venue name automatically.
          </span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label>Event Description / Teaser</label>
        <textarea
          name="description"
          className={styles.textarea}
          value={formData.description || ''}
          onChange={onChange}
          placeholder="A short, evocative description of what this session is about..."
        />
      </div>
    </div>
  );
}
