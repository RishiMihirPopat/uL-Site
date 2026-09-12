'use client';

import React, { useState, useEffect } from 'react';
import styles from '../../app/admin/admin.module.css';

interface ArticleOption {
  id: string;
  slug: string;
  title: string;
  author: string;
}

interface EventArchiveRecapFieldsProps {
  formData: {
    archive_badge?: string;
    archive_tags?: string;
    archive_image?: string;
  };
  youtubeUrls: string[];
  substackUrls: string[];
  validationErrors: Record<string, string>;
  uploading: boolean;
  onArchiveUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onYoutubeChange: (urls: string[]) => void;
  onSubstackChange: (urls: string[]) => void;
}

export function EventArchiveRecapFields({
  formData,
  youtubeUrls,
  substackUrls,
  validationErrors,
  uploading,
  onArchiveUpload,
  onChange,
  onYoutubeChange,
  onSubstackChange,
}: EventArchiveRecapFieldsProps) {
  const [availableArticles, setAvailableArticles] = useState<ArticleOption[]>([]);
  const [externalLinkInput, setExternalLinkInput] = useState('');

  // Fetch published articles for the dropdown
  useEffect(() => {
    fetch('/api/articles')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableArticles(data);
        }
      })
      .catch((err) => console.error('Failed to load articles for dropdown', err));
  }, []);

  const handleSelectArticle = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUrl = e.target.value;
    if (!selectedUrl) return;

    if (!substackUrls.includes(selectedUrl)) {
      onSubstackChange([...substackUrls, selectedUrl]);
    }
    // Reset dropdown
    e.target.value = '';
  };

  const handleRemoveArticle = (urlToRemove: string) => {
    onSubstackChange(substackUrls.filter((url) => url !== urlToRemove));
  };

  const handleAddExternalLink = () => {
    const trimmed = externalLinkInput.trim();
    if (!trimmed) return;
    if (!substackUrls.includes(trimmed)) {
      onSubstackChange([...substackUrls, trimmed]);
    }
    setExternalLinkInput('');
  };

  return (
    <div className={styles.formSection}>
      <div className={styles.formSectionHeader}>
        <h2 className={styles.formSectionTitle}>4. Postcard Archive & Recap Media</h2>
        <p className={styles.formSectionDesc}>
          High-res event recap photos, tags, YouTube recordings, and website-hosted or Substack articles for the public archive.
        </p>
      </div>

      <div className={styles.formGrid2}>
        <div className={styles.formGroup}>
          <label>Special Badge (Optional)</label>
          <input
            name="archive_badge"
            className={styles.input}
            value={formData.archive_badge || ''}
            onChange={onChange}
            placeholder="e.g. Special Edition / Flagship"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Archive Tags (comma-separated)</label>
          <input
            name="archive_tags"
            className={styles.input}
            value={formData.archive_tags || ''}
            onChange={onChange}
            placeholder="e.g. philosophy, coffee, cinema"
          />
        </div>
      </div>

      <div className={`${styles.uploadBox} ${validationErrors.archive_image ? styles.uploadBoxError : ''}`}>
        <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
          Archive Cover Photo (Recap photo of the gathering)
        </label>
        <input type="file" accept="image/*" className={styles.input} onChange={onArchiveUpload} />
        {uploading && <p style={{ fontSize: '0.85rem', color: '#C26540', margin: 0 }}>Uploading archive photo...</p>}

        <div>
          <label style={{ fontSize: '0.82rem', color: '#666' }}>Archive Photo URL directly:</label>
          <input
            name="archive_image"
            className={styles.input}
            value={formData.archive_image || ''}
            onChange={onChange}
            placeholder="/archive/... or https://..."
          />
          {validationErrors.archive_image && <p className={styles.errorText}>{validationErrors.archive_image}</p>}
        </div>

        {formData.archive_image && (
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={formData.archive_image}
              alt="Archive photo preview"
              style={{ width: '100px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #D6C9B0' }}
            />
            <span style={{ fontSize: '0.85rem', color: '#2E7D32', fontWeight: 600 }}>High-res recap photo loaded</span>
          </div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label>YouTube Video URLs (one per line)</label>
        <textarea
          className={styles.textarea}
          style={{ minHeight: '80px', borderColor: validationErrors.youtube_urls ? '#D93025' : undefined }}
          value={youtubeUrls.join('\n')}
          onChange={(e) => onYoutubeChange(e.target.value.split('\n').filter(Boolean))}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        {validationErrors.youtube_urls && <p className={styles.errorText}>{validationErrors.youtube_urls}</p>}
        <span className={styles.formGroupHelper}>Attach recordings or recap video links (e.g. YouTube watch / shorts / youtu.be links).</span>
      </div>

      <div className={styles.formGroup}>
        <label style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>Attached Articles & Notes</span>
          <span style={{ fontSize: '0.8rem', color: '#888' }}>
            Shows in the Postcard Archive recap
          </span>
        </label>

        <div style={{ marginBottom: '1rem', background: '#FAF6EE', border: '1px solid #D6C9B0', padding: '1rem', borderRadius: '4px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1A1714', marginBottom: '0.4rem' }}>
            Attach Website Hosted Article:
          </label>
          <select
            className={styles.select}
            onChange={handleSelectArticle}
            defaultValue=""
          >
            <option value="" disabled>
              -- Select an article from the unLecture website --
            </option>
            {availableArticles.map((art) => {
              const url = `/articles/${art.slug}`;
              const isAlreadyAttached = substackUrls.includes(url);
              return (
                <option key={art.id} value={url} disabled={isAlreadyAttached}>
                  {art.title} (by {art.author}) {isAlreadyAttached ? '[Attached]' : ''}
                </option>
              );
            })}
          </select>
          <span className={styles.formGroupHelper} style={{ display: 'block', marginTop: '0.4rem' }}>
            Selecting an article links it directly to this archived event.
          </span>
        </div>

        {substackUrls.length > 0 ? (
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888', margin: '0 0 0.5rem' }}>
              Attached to this event ({substackUrls.length}):
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {substackUrls.map((url) => {
                const isInternal = url.startsWith('/articles/');
                const matchedArticle = isInternal
                  ? availableArticles.find((a) => `/articles/${a.slug}` === url)
                  : null;

                return (
                  <div
                    key={url}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: '#FFFFFF',
                      border: '1px solid #E4DCD3',
                      borderRadius: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '3px',
                          background: isInternal ? '#FAF0E6' : '#F0EFEA',
                          color: isInternal ? '#C26540' : '#666',
                        }}
                      >
                        {isInternal ? 'Article' : 'External'}
                      </span>
                      <div>
                        <strong style={{ fontSize: '0.88rem', color: '#1A1714', display: 'block' }}>
                          {matchedArticle ? matchedArticle.title : url}
                        </strong>
                        <span style={{ fontSize: '0.76rem', color: '#888' }}>
                          {isInternal ? (
                            <span>
                              Website Article {matchedArticle ? `• by ${matchedArticle.author}` : ''} (
                              <code>{url}</code>)
                            </span>
                          ) : (
                            <span>External Link: {url}</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveArticle(url)}
                      className={`${styles.btn} ${styles.btnSmall} ${styles.btnDanger}`}
                      style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                      title="Remove from event"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '0.82rem', fontStyle: 'italic', color: '#888', margin: '0 0 1rem' }}>
            No articles attached to this event yet. Use the dropdown above to attach one.
          </p>
        )}

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            className={styles.input}
            value={externalLinkInput}
            onChange={(e) => setExternalLinkInput(e.target.value)}
            placeholder="Or enter an external Substack link (https://...)"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddExternalLink();
              }
            }}
          />
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSmall}`}
            onClick={handleAddExternalLink}
          >
            + Add Link
          </button>
        </div>
        {validationErrors.substack_urls && (
          <p className={styles.errorText} style={{ marginTop: '0.4rem' }}>
            {validationErrors.substack_urls}
          </p>
        )}
      </div>
    </div>
  );
}
