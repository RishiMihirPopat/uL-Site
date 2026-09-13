'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import styles from '../../app/admin/admin.module.css';

interface ArticleFormData {
  id?: string;
  title: string;
  slug: string;
  subtitle: string;
  author: string;
  author_role: string;
  category: string;
  cover_image: string;
  content: string;
  status: 'published' | 'draft';
  published_at: string;
}

interface ArticleFormProps {
  initialData?: Partial<ArticleFormData>;
  onSubmit: (data: ArticleFormData) => Promise<void>;
  isSubmitting?: boolean;
  isEdit?: boolean;
}

export function ArticleForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  isEdit = false,
}: ArticleFormProps) {
  const [formData, setFormData] = useState<ArticleFormData>({
    id: initialData?.id || '',
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    subtitle: initialData?.subtitle || '',
    author: initialData?.author || '',
    author_role: initialData?.author_role || '',
    category: initialData?.category || 'Article',
    cover_image: initialData?.cover_image || '',
    content: initialData?.content || '',
    status: initialData?.status || 'published',
    published_at: initialData?.published_at || new Date().toISOString().split('T')[0],
  });

  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError(null);

    const data = new FormData();
    data.append('file', file);
    data.append('type', 'archive');

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      if (res.ok && result.url) {
        setFormData((prev) => ({ ...prev, cover_image: result.url }));
      } else {
        setUploadError(result.error || 'Failed to upload cover image');
      }
    } catch {
      setUploadError('Network error while uploading cover image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-generate slug from title if slug was empty or matching previous title slug
      if (name === 'title' && !isEdit && (!prev.slug || prev.slug === slugify(prev.title))) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Markdown Toolbar helper to insert markdown snippets around selection
  const insertFormatting = (prefix: string, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = formData.content;

    const selected = currentText.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;

    const newContent =
      currentText.substring(0, start) + replacement + currentText.substring(end);

    setFormData((prev) => ({ ...prev, content: newContent }));

    // Refocus and place cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length
      );
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cover_image) {
      setUploadError('Please upload a cover image for the article before saving.');
      return;
    }
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* ── Section 1: Article Metadata ── */}
      <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>1. Article Information</h2>
            <p className={styles.cardDesc}>Headline, author details, and category tag.</p>
          </div>
        </div>

        <div style={{ padding: '0 1.25rem 1.25rem' }}>
          <div className={styles.formGroup}>
            <label>Article Title *</label>
            <input
              name="title"
              className={styles.input}
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Why We Gather in Third Spaces"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>URL Slug *</label>
            <input
              name="slug"
              className={styles.input}
              value={formData.slug}
              onChange={handleChange}
              placeholder="why-we-gather-in-third-spaces"
              required
            />
            <span className={styles.formGroupHelper}>
              Viewable at: <code>/articles/{formData.slug || 'your-slug'}</code>
            </span>
          </div>

          <div className={styles.formGrid2}>
            <div className={styles.formGroup}>
              <label>Author Name *</label>
              <input
                name="author"
                className={styles.input}
                value={formData.author}
                onChange={handleChange}
                placeholder="e.g. Yamini Aiyar"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Author Role / Affiliation</label>
              <input
                name="author_role"
                className={styles.input}
                value={formData.author_role}
                onChange={handleChange}
                placeholder="e.g. Public Policy Scholar"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Subtitle / Excerpt</label>
            <textarea
              name="subtitle"
              rows={2}
              className={styles.textarea}
              value={formData.subtitle}
              onChange={handleChange}
              placeholder="A brief summary or compelling lead shown on article cards and under the headline..."
            />
          </div>

          {/* Cover Image Upload */}
          <div className={styles.formGroup} style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Article Cover Image *</span>
              {formData.cover_image && (
                <span style={{ fontSize: '0.8rem', color: '#2E7D32', fontWeight: 600 }}>
                  Cover image loaded
                </span>
              )}
            </label>

            <div
              style={{
                border: uploadError ? '2px dashed #C62828' : '2px dashed #D6C9B0',
                borderRadius: '6px',
                padding: '1.25rem',
                backgroundColor: '#FAF6EE',
                textAlign: 'center',
                cursor: uploadingImage ? 'wait' : 'pointer',
                transition: 'border-color 0.2s ease',
              }}
              onClick={() => {
                if (!uploadingImage && fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />

              {uploadingImage ? (
                <div style={{ padding: '1rem 0' }}>
                  <p style={{ margin: 0, fontWeight: 600, color: '#C26540' }}>
                    Uploading cover image...
                  </p>
                </div>
              ) : formData.cover_image ? (
                <div>
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      maxHeight: '220px',
                      overflow: 'hidden',
                      borderRadius: '4px',
                      marginBottom: '0.75rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    <img
                      src={formData.cover_image}
                      alt="Cover preview"
                      style={{
                        width: '100%',
                        height: '180px',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnSmall}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Replace Cover Image
                  </button>
                </div>
              ) : (
                <div style={{ padding: '1.5rem 0' }}>
                  <p style={{ margin: '0 0 0.25rem', fontWeight: 600, color: '#1A1714' }}>
                    Click to upload article cover image
                  </p>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#666' }}>
                    Select an image file (PNG, JPG, WebP)
                  </p>
                </div>
              )}
            </div>

            {uploadError && (
              <p className={styles.errorText} style={{ marginTop: '0.5rem' }}>
                {uploadError}
              </p>
            )}
          </div>

          <div className={styles.formGrid2}>
            <div className={styles.formGroup}>
              <label>Publish Date *</label>
              <input
                type="date"
                name="published_at"
                className={styles.input}
                value={formData.published_at}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Status *</label>
              <select
                name="status"
                className={styles.select}
                value={formData.status}
                onChange={handleChange}
              >
                <option value="published">Published</option>
                <option value="draft">Save as Draft</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Markdown Editor & Preview ── */}
      <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
        <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className={styles.cardTitle}>2. Article Markdown Content</h2>
            <p className={styles.cardDesc}>
              Write using Markdown formatting. Switch to Preview to view live styling.
            </p>
          </div>

          {/* Write / Preview Tab Switcher */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(42, 36, 32, 0.08)', padding: '3px', borderRadius: '4px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`${styles.btn} ${styles.btnSmall}`}
              style={{
                background: activeTab === 'write' ? 'var(--color-parchment)' : 'transparent',
                fontWeight: activeTab === 'write' ? 600 : 400,
                border: 'none',
                boxShadow: activeTab === 'write' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`${styles.btn} ${styles.btnSmall}`}
              style={{
                background: activeTab === 'preview' ? 'var(--color-parchment)' : 'transparent',
                fontWeight: activeTab === 'preview' ? 600 : 400,
                border: 'none',
                boxShadow: activeTab === 'preview' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Preview
            </button>
          </div>
        </div>

        <div style={{ padding: '0 1.25rem 1.25rem' }}>
          {activeTab === 'write' ? (
            <div>
              {/* Formatting Toolbar */}
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  flexWrap: 'wrap',
                  padding: '8px 10px',
                  background: '#FAF6EE',
                  border: '1px solid #D6C9B0',
                  borderBottom: 'none',
                  borderRadius: '4px 4px 0 0',
                }}
              >
                <button
                  type="button"
                  onClick={() => insertFormatting('**', '**', 'bold text')}
                  title="Bold (**text**)"
                  style={{ padding: '3px 8px', fontWeight: 'bold', cursor: 'pointer', background: 'none', border: '1px solid #D6C9B0', borderRadius: '3px' }}
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('*', '*', 'italic text')}
                  title="Italic (*text*)"
                  style={{ padding: '3px 8px', fontStyle: 'italic', cursor: 'pointer', background: 'none', border: '1px solid #D6C9B0', borderRadius: '3px' }}
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('### ', '\n', 'Heading 3')}
                  title="Heading 3 (###)"
                  style={{ padding: '3px 8px', cursor: 'pointer', background: 'none', border: '1px solid #D6C9B0', borderRadius: '3px' }}
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('## ', '\n', 'Heading 2')}
                  title="Heading 2 (##)"
                  style={{ padding: '3px 8px', cursor: 'pointer', background: 'none', border: '1px solid #D6C9B0', borderRadius: '3px' }}
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('> "', '"\n', 'Pull quote goes here')}
                  title="Blockquote (> Quote)"
                  style={{ padding: '3px 8px', cursor: 'pointer', background: 'none', border: '1px solid #D6C9B0', borderRadius: '3px' }}
                >
                  &ldquo; Quote
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('- ', '\n', 'List item')}
                  title="Bullet List (- )"
                  style={{ padding: '3px 8px', cursor: 'pointer', background: 'none', border: '1px solid #D6C9B0', borderRadius: '3px' }}
                >
                  &bull; List
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('1. ', '\n', 'Numbered item')}
                  title="Numbered List (1. )"
                  style={{ padding: '3px 8px', cursor: 'pointer', background: 'none', border: '1px solid #D6C9B0', borderRadius: '3px' }}
                >
                  1. List
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('[', '](https://example.com)', 'link text')}
                  title="Link ([text](url))"
                  style={{ padding: '3px 8px', cursor: 'pointer', background: 'none', border: '1px solid #D6C9B0', borderRadius: '3px' }}
                >
                  Link
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('![', '](/category-covers/unlecture.jpg)', 'Image description')}
                  title="Image (![alt](url))"
                  style={{ padding: '3px 8px', cursor: 'pointer', background: 'none', border: '1px solid #D6C9B0', borderRadius: '3px' }}
                >
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('`', '`', 'code')}
                  title="Inline Code (`code`)"
                  style={{ padding: '3px 8px', cursor: 'pointer', background: 'none', border: '1px solid #D6C9B0', borderRadius: '3px' }}
                >
                  `Code`
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('\n---\n\n', '', '')}
                  title="Divider (---)"
                  style={{ padding: '3px 8px', cursor: 'pointer', background: 'none', border: '1px solid #D6C9B0', borderRadius: '3px' }}
                >
                  &mdash; Line
                </button>
              </div>

              <textarea
                ref={textareaRef}
                name="content"
                rows={16}
                className={styles.textarea}
                style={{
                  borderRadius: '0 0 4px 4px',
                  fontFamily: 'monospace',
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                }}
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your article in Markdown here... Use # for headings, **bold**, *italic*, > for pull quotes."
                required
              />
            </div>
          ) : (
            <div
              style={{
                minHeight: '320px',
                padding: '1.5rem',
                background: '#FAF6EE',
                border: '1px solid #D6C9B0',
                borderRadius: '4px',
              }}
            >
              {formData.content ? (
                <MarkdownRenderer content={formData.content} />
              ) : (
                <p style={{ fontStyle: 'italic', color: '#888' }}>
                  Nothing to preview yet. Switch back to Write mode to type markdown content.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Form Actions ── */}
      <div className={styles.actions} style={{ display: 'flex', gap: '12px' }}>
        <button
          type="submit"
          className={`${styles.btn} ${styles.btnPrimary}`}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Saving...'
            : isEdit
            ? 'Update Article'
            : formData.status === 'published'
            ? 'Publish Article'
            : 'Save Draft'}
        </button>

        <Link href="/admin/articles" className={styles.btn}>
          Cancel
        </Link>

        {formData.slug && isEdit && (
          <a
            href={`/articles/${formData.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btn}
            style={{ marginLeft: 'auto' }}
          >
            Preview Article on Site ↗
          </a>
        )}
      </div>
    </form>
  );
}
