'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { slugify } from '@/lib/utils/slug';
import { uploadImageFile } from '@/lib/utils/upload';
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
  const [isUploadingBodyImage, setIsUploadingBodyImage] = useState(false);
  const [bodyUploadError, setBodyUploadError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showUrlPrompt, setShowUrlPrompt] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlCaptionInput, setUrlCaptionInput] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bodyFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError(null);

    const result = await uploadImageFile(file, 'archive');
    if (result.success && result.url) {
      setFormData((prev) => ({ ...prev, cover_image: result.url! }));
    } else {
      setUploadError(result.error || 'Failed to upload cover image');
    }
    setUploadingImage(false);
  };

  /**
   * Uploads and embeds a photo directly at the editor's cursor / drop position in the article body.
   */
  const insertImageAtCursor = async (file: File) => {
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setBodyUploadError('File size exceeds 5MB limit.');
      return;
    }

    // Validate MIME format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setBodyUploadError('Invalid file type. Allowed formats: JPEG, PNG, WebP.');
      return;
    }

    setIsUploadingBodyImage(true);
    setBodyUploadError(null);

    const textarea = textareaRef.current;
    let insertPos = formData.content.length;
    if (textarea && typeof textarea.selectionStart === 'number') {
      insertPos = textarea.selectionStart;
    }

    // Generate human-friendly initial caption from the filename
    const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').trim();
    const captionName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : 'Article photo';
    const placeholder = `\n\n![Uploading ${captionName}...]()\n\n`;

    // Insert temporary placeholder into content
    const currentText = formData.content;
    const before = currentText.substring(0, insertPos);
    const after = currentText.substring(insertPos);
    setFormData((prev) => ({ ...prev, content: before + placeholder + after }));

    try {
      const result = await uploadImageFile(file, 'archive');
      if (result.success && result.url) {
        const finalMarkdown = `\n\n![${captionName}](${result.url})\n\n`;
        setFormData((prev) => ({
          ...prev,
          content: prev.content.replace(placeholder, finalMarkdown),
        }));

        // Reposition cursor right inside caption brackets so writer can refine caption immediately
        setTimeout(() => {
          if (textarea) {
            textarea.focus();
            const newPos = before.length + 4; // Start right after '\n\n!['
            textarea.setSelectionRange(newPos, newPos + captionName.length);
          }
        }, 60);
      } else {
        // Rollback placeholder on failure
        setFormData((prev) => ({
          ...prev,
          content: prev.content.replace(placeholder, ''),
        }));
        setBodyUploadError(result.error || 'Failed to upload photo into article.');
      }
    } catch {
      setFormData((prev) => ({
        ...prev,
        content: prev.content.replace(placeholder, ''),
      }));
      setBodyUploadError('Network error while uploading photo.');
    } finally {
      setIsUploadingBodyImage(false);
      if (bodyFileInputRef.current) {
        bodyFileInputRef.current.value = '';
      }
    }
  };

  const handleBodyImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      insertImageAtCursor(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingOver) setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      insertImageAtCursor(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          insertImageAtCursor(file);
          return;
        }
      }
    }
  };

  const handleInsertImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const caption = urlCaptionInput.trim() || 'Article photo';
    const markdown = `\n\n![${caption}](${urlInput.trim()})\n\n`;

    const textarea = textareaRef.current;
    let insertPos = formData.content.length;
    if (textarea && typeof textarea.selectionStart === 'number') {
      insertPos = textarea.selectionStart;
    }

    const currentText = formData.content;
    const before = currentText.substring(0, insertPos);
    const after = currentText.substring(insertPos);

    setFormData((prev) => ({ ...prev, content: before + markdown + after }));
    setUrlInput('');
    setUrlCaptionInput('');
    setShowUrlPrompt(false);

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const cursorAfter = before.length + markdown.length;
        textarea.setSelectionRange(cursorAfter, cursorAfter);
      }
    }, 50);
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
                <span style={{ fontSize: '0.8rem', color: 'var(--color-olive, #5A5A3C)', fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>
                  Cover image loaded
                </span>
              )}
            </label>

            <div
              style={{
                border: uploadError ? '2px dashed var(--color-error, #A63224)' : '2px dashed var(--color-border-strong, #BFB09A)',
                borderRadius: '8px',
                padding: '1.25rem',
                backgroundColor: 'var(--color-bg-surface, #EDE4D3)',
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
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-primary, #6B2D2D)', fontFamily: 'var(--font-mono, monospace)' }}>
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
                      border: '1px solid var(--color-border, #D6C9B0)',
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
                  <p style={{ margin: '0 0 0.25rem', fontWeight: 600, color: 'var(--color-text, #1A1714)', fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                    Click to upload article cover image
                  </p>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted, #3D332A)', fontFamily: 'var(--font-mono, monospace)' }}>
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
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(42, 36, 32, 0.08)', padding: '4px', borderRadius: 'var(--radius-full, 9999px)' }}>
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`${styles.btn} ${styles.btnSmall}`}
              style={{
                background: activeTab === 'write' ? 'var(--color-primary, #6B2D2D)' : 'transparent',
                color: activeTab === 'write' ? '#FFFFFF' : 'var(--color-text, #1A1714)',
                fontWeight: 600,
                border: 'none',
                boxShadow: activeTab === 'write' ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`${styles.btn} ${styles.btnSmall}`}
              style={{
                background: activeTab === 'preview' ? 'var(--color-primary, #6B2D2D)' : 'transparent',
                color: activeTab === 'preview' ? '#FFFFFF' : 'var(--color-text, #1A1714)',
                fontWeight: 600,
                border: 'none',
                boxShadow: activeTab === 'preview' ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
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
                  background: 'var(--color-bg-surface, #EDE4D3)',
                  border: '1px solid var(--color-border-strong, #BFB09A)',
                  borderBottom: 'none',
                  borderRadius: '6px 6px 0 0',
                }}
              >
                <button
                  type="button"
                  onClick={() => insertFormatting('**', '**', 'bold text')}
                  title="Bold (**text**)"
                  style={{ padding: '3px 8px', fontWeight: 'bold', cursor: 'pointer', background: '#FFFFFF', border: '1px solid var(--color-border, #D6C9B0)', borderRadius: '4px', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem' }}
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('*', '*', 'italic text')}
                  title="Italic (*text*)"
                  style={{ padding: '3px 8px', fontStyle: 'italic', cursor: 'pointer', background: '#FFFFFF', border: '1px solid var(--color-border, #D6C9B0)', borderRadius: '4px', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem' }}
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('### ', '\n', 'Heading 3')}
                  title="Heading 3 (###)"
                  style={{ padding: '3px 8px', cursor: 'pointer', background: '#FFFFFF', border: '1px solid var(--color-border, #D6C9B0)', borderRadius: '4px', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem' }}
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('## ', '\n', 'Heading 2')}
                  title="Heading 2 (##)"
                  style={{ padding: '3px 8px', cursor: 'pointer', background: '#FFFFFF', border: '1px solid var(--color-border, #D6C9B0)', borderRadius: '4px', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem' }}
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('> "', '"\n', 'Pull quote goes here')}
                  title="Blockquote (> Quote)"
                  style={{ padding: '3px 8px', cursor: 'pointer', background: '#FFFFFF', border: '1px solid var(--color-border, #D6C9B0)', borderRadius: '4px', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem' }}
                >
                  &ldquo; Quote
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('- ', '\n', 'List item')}
                  title="Bullet List (- )"
                  style={{ padding: '3px 8px', cursor: 'pointer', background: '#FFFFFF', border: '1px solid var(--color-border, #D6C9B0)', borderRadius: '4px', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem' }}
                >
                  &bull; List
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('1. ', '\n', 'Numbered item')}
                  title="Numbered List (1. )"
                  style={{ padding: '3px 8px', cursor: 'pointer', background: '#FFFFFF', border: '1px solid var(--color-border, #D6C9B0)', borderRadius: '4px', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem' }}
                >
                  1. List
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('[', '](https://example.com)', 'link text')}
                  title="Link ([text](url))"
                  style={{ padding: '3px 8px', cursor: 'pointer', background: '#FFFFFF', border: '1px solid var(--color-border, #D6C9B0)', borderRadius: '4px', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem' }}
                >
                  Link
                </button>
                <button
                  type="button"
                  onClick={() => bodyFileInputRef.current?.click()}
                  title="Upload a photo from your device and embed it at cursor"
                  disabled={isUploadingBodyImage}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 9px',
                    fontWeight: 600,
                    cursor: isUploadingBodyImage ? 'wait' : 'pointer',
                    background: 'var(--color-primary, #6B2D2D)',
                    color: '#FFFFFF',
                    border: '1px solid var(--color-primary, #6B2D2D)',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.8rem',
                  }}
                >
                  Upload Photo
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlPrompt((prev) => !prev)}
                  title="Insert image by URL"
                  style={{
                    padding: '3px 8px',
                    cursor: 'pointer',
                    background: showUrlPrompt ? 'var(--color-bg-surface, #EDE4D3)' : '#FFFFFF',
                    border: '1px solid var(--color-border, #D6C9B0)',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.8rem',
                  }}
                >
                  Image URL
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('`', '`', 'code')}
                  title="Inline Code (`code`)"
                  style={{ padding: '3px 8px', cursor: 'pointer', background: '#FFFFFF', border: '1px solid var(--color-border, #D6C9B0)', borderRadius: '4px', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem' }}
                >
                  `Code`
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('\n---\n\n', '', '')}
                  title="Divider (---)"
                  style={{ padding: '3px 8px', cursor: 'pointer', background: '#FFFFFF', border: '1px solid var(--color-border, #D6C9B0)', borderRadius: '4px', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem' }}
                >
                  &mdash; Line
                </button>
              </div>

              {/* Hidden file input for body photo uploads */}
              <input
                ref={bodyFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleBodyImageChange}
                style={{ display: 'none' }}
              />

              {/* Optional Insert Image by URL sub-bar */}
              {showUrlPrompt && (
                <div
                  style={{
                    padding: '10px 12px',
                    background: 'var(--color-bg-surface, #EDE4D3)',
                    borderLeft: '1px solid var(--color-border-strong, #BFB09A)',
                    borderRight: '1px solid var(--color-border-strong, #BFB09A)',
                    borderBottom: '1px solid var(--color-border, #D6C9B0)',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <input
                    type="text"
                    placeholder="Image URL (https://... or /archive/...)"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    style={{
                      flex: '2 1 200px',
                      padding: '5px 8px',
                      fontSize: '0.82rem',
                      fontFamily: 'var(--font-mono, monospace)',
                      border: '1px solid var(--color-border, #D6C9B0)',
                      borderRadius: '4px',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Caption / Alt text (optional)"
                    value={urlCaptionInput}
                    onChange={(e) => setUrlCaptionInput(e.target.value)}
                    style={{
                      flex: '1 1 140px',
                      padding: '5px 8px',
                      fontSize: '0.82rem',
                      fontFamily: 'var(--font-mono, monospace)',
                      border: '1px solid var(--color-border, #D6C9B0)',
                      borderRadius: '4px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleInsertImageUrl}
                    className={`${styles.btn} ${styles.btnSmall} ${styles.btnPrimary}`}
                    style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                  >
                    Insert
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUrlPrompt(false)}
                    className={`${styles.btn} ${styles.btnSmall}`}
                    style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Photo Upload Guidance & Active Upload Indicator */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 4px 4px',
                  fontSize: '0.78rem',
                  color: 'var(--color-text-muted, #3D332A)',
                  flexWrap: 'wrap',
                  gap: '6px',
                }}
              >
                <span>
                  <strong>Tip:</strong> Click <em>&ldquo;Upload Photo&rdquo;</em>, drag &amp; drop photos directly into the editor, or paste (Ctrl+V) screenshots anywhere.
                </span>
                {isUploadingBodyImage && (
                  <span style={{ color: 'var(--color-primary, #6B2D2D)', fontWeight: 600 }}>
                    Uploading photo into article...
                  </span>
                )}
              </div>

              {bodyUploadError && (
                <div
                  style={{
                    padding: '6px 10px',
                    marginBottom: '6px',
                    backgroundColor: 'rgba(166, 50, 36, 0.08)',
                    border: '1px solid var(--color-error, #A63224)',
                    borderRadius: '4px',
                    color: 'var(--color-error, #A63224)',
                    fontSize: '0.82rem',
                  }}
                >
                  {bodyUploadError}
                </div>
              )}

              <textarea
                ref={textareaRef}
                name="content"
                rows={16}
                className={styles.textarea}
                style={{
                  borderRadius: '0 0 6px 6px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  border: isDraggingOver
                    ? '2px dashed var(--color-primary, #6B2D2D)'
                    : '1px solid var(--color-border-strong, #BFB09A)',
                  backgroundColor: isDraggingOver ? 'rgba(107, 45, 45, 0.04)' : '#FFFFFF',
                  transition: 'border-color 0.15s ease, background-color 0.15s ease',
                }}
                value={formData.content}
                onChange={handleChange}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onPaste={handlePaste}
                placeholder="Write your article in Markdown here... Use # for headings, **bold**, *italic*, > for pull quotes, or upload photos anywhere in your text."
                required
              />
            </div>
          ) : (
            <div
              style={{
                minHeight: '320px',
                padding: '1.5rem',
                background: 'var(--color-bg-surface, #EDE4D3)',
                border: '1px solid var(--color-border, #D6C9B0)',
                borderRadius: '6px',
              }}
            >
              {formData.content ? (
                <MarkdownRenderer content={formData.content} />
              ) : (
                <p style={{ fontStyle: 'italic', color: 'var(--color-text-muted, #3D332A)', fontFamily: 'var(--font-mono, monospace)' }}>
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
