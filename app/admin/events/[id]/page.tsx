'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../admin.module.css';
import { validateEventLinks, normalizeTags, formatTagsForDisplay } from '@/lib/validators';
import { parseEventDateTime } from '@/lib/utils/dateTime';
import { uploadImageFile } from '@/lib/utils/upload';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EventLifecycleBanner } from '@/components/admin/EventLifecycleBanner';
import { EventSessionFields } from '@/components/admin/EventSessionFields';
import { EventScheduleFields } from '@/components/admin/EventScheduleFields';
import { EventMediaFields } from '@/components/admin/EventMediaFields';
import { EventArchiveRecapFields } from '@/components/admin/EventArchiveRecapFields';

export default function EditEventPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [event, setEvent] = useState<any>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([]);
  const [substackUrls, setSubstackUrls] = useState<string[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingArchive, setUploadingArchive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const loadEvent = () => {
    fetch(`/api/admin/events/${id}`)
      .then(res => {
        if (res.ok) return res.json();
        return fetch('/api/admin/events/all').then(r => r.json()).then(events => {
          return Array.isArray(events) ? events.find((e: any) => e.id.toString() === id) : null;
        });
      })
      .then(found => {
        if (!found) return;
        setEvent({
          ...found,
          archive_tags: formatTagsForDisplay(found.archive_tags),
        });
        try {
          setYoutubeUrls(typeof found.youtube_urls === 'string' ? JSON.parse(found.youtube_urls || '[]') : (found.youtube_urls || []));
        } catch {
          setYoutubeUrls([]);
        }
        try {
          setSubstackUrls(typeof found.substack_urls === 'string' ? JSON.parse(found.substack_urls || '[]') : (found.substack_urls || []));
        } catch {
          setSubstackUrls([]);
        }
      });
  };

  useEffect(() => {
    fetch('/api/admin/auth')
      .then(res => res.json())
      .then(data => { if (data.role) setRole(data.role); });

    loadEvent();
  }, [id]);

  if (!event) {
    return (
      <div className={styles.page}>
        <div className={styles.card} style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#666' }}>Loading event details...</p>
        </div>
      </div>
    );
  }

  const showToast = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const validation = validateEventLinks({
      ...event,
      youtube_urls: youtubeUrls,
      substack_urls: substackUrls,
    });

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      alert('Please fix the link errors:\n' + Object.values(validation.errors).join('\n'));
      return;
    }
    setValidationErrors({});
    setIsSaving(true);

    const tagsArray = normalizeTags(event.archive_tags);

    const payload = {
      ...event,
      archive_tags: JSON.stringify(tagsArray),
      youtube_urls: JSON.stringify(youtubeUrls),
      substack_urls: JSON.stringify(substackUrls),
    };

    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast('success', 'All event details and media links saved successfully.');
        loadEvent();
      } else {
        const data = await res.json();
        if (data.errors) setValidationErrors(data.errors);
        showToast('error', data.error || 'Failed to save event changes');
      }
    } catch {
      showToast('error', 'Network error while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (action: string) => {
    try {
      const res = await fetch(`/api/admin/events/${id}/${action}`, { method: 'POST' });
      if (res.ok) {
        showToast('success', `Status updated (${action})`);
        loadEvent();
      } else {
        const data = await res.json();
        showToast('error', data.error || 'Action failed');
      }
    } catch {
      showToast('error', 'Network error changing status');
    }
  };

  const handleDirectStatusSelect = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive_status: newStatus })
      });
      if (res.ok) {
        showToast('success', `Status updated to ${newStatus}`);
        loadEvent();
      } else {
        const data = await res.json();
        showToast('error', data.error || 'Failed to update status');
      }
    } catch {
      showToast('error', 'Network error changing status');
    }
  };

  const handlePublishToArchive = async () => {
    const tagsArray = normalizeTags(event.archive_tags);

    try {
      const res = await fetch(`/api/admin/events/${id}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archive_badge: event.archive_badge || null,
          archive_tags: tagsArray,
          archive_image: event.archive_image || null,
        })
      });

      if (res.ok) {
        await fetch(`/api/admin/events/${id}/content`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            youtube_urls: youtubeUrls,
            substack_urls: substackUrls,
            archive_badge: event.archive_badge || null,
            archive_tags: tagsArray,
          })
        });
        showToast('success', 'Event successfully published to the Postcard Archive!');
        loadEvent();
      } else {
        const data = await res.json();
        showToast('error', data.error || 'Failed to publish to archive');
      }
    } catch {
      showToast('error', 'Network error publishing to archive');
    }
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPoster(true);

    const result = await uploadImageFile(file, 'posters');
    if (result.success && result.url) {
      setEvent((prev: any) => ({ ...prev, image: result.url! }));
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next.image;
        return next;
      });
      showToast('success', 'Poster image uploaded');
    } else {
      showToast('error', result.error || 'Failed to upload poster');
    }
    setUploadingPoster(false);
  };

  const handleArchiveImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingArchive(true);

    const result = await uploadImageFile(file, 'archive');
    if (result.success && result.url) {
      setEvent((prev: any) => ({ ...prev, archive_image: result.url! }));
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next.archive_image;
        return next;
      });
      showToast('success', 'Archive recap photo uploaded');
    } else {
      showToast('error', result.error || 'Failed to upload archive photo');
    }
    setUploadingArchive(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    if (name === 'event_datetime' && value) {
      const parsed = parseEventDateTime(value);
      if (parsed) {
        setEvent((prev: any) => ({
          ...prev,
          event_datetime: value,
          date: parsed.date,
          time: parsed.time,
        }));
        return;
      }
    }
    setEvent((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className={styles.headerTitle}>{event.title}</h1>
            <StatusBadge status={event.archive_status} />
          </div>
          <p className={styles.headerSubtitle}>
            ID: <code>{event.id}</code> &bull; Format: <span style={{ textTransform: 'capitalize' }}>{event.category?.replace(/-/g, ' ')}</span>
          </p>
        </div>
        <div className={styles.actions}>
          <Link href="/admin/events" className={styles.btn}>
            &larr; All Events
          </Link>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => handleSaveAll()}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {msg && (
        <div className={`${styles.alert} ${msg.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          {msg.text}
        </div>
      )}

      {/* Lifecycle Status Banner */}
      <EventLifecycleBanner
        status={event.archive_status}
        role={role}
        onStatusChange={handleStatusChange}
        onDirectStatusSelect={handleDirectStatusSelect}
        onPublishArchive={handlePublishToArchive}
      />

      {/* Main Unified Form */}
      <form onSubmit={handleSaveAll} className={styles.form}>
        <EventSessionFields formData={event} validationErrors={validationErrors} onChange={handleChange} />
        
        <EventScheduleFields formData={event} onChange={handleChange} />

        <EventMediaFields
          formData={event}
          validationErrors={validationErrors}
          uploading={uploadingPoster}
          onPosterUpload={handlePosterUpload}
          onChange={handleChange}
        />

        <EventArchiveRecapFields
          formData={event}
          youtubeUrls={youtubeUrls}
          substackUrls={substackUrls}
          validationErrors={validationErrors}
          uploading={uploadingArchive}
          onArchiveUpload={handleArchiveImageUpload}
          onChange={handleChange}
          onYoutubeChange={setYoutubeUrls}
          onSubstackChange={setSubstackUrls}
        />

        {/* Sticky Bottom Save Bar */}
        <div className={styles.stickyBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>Editing: <strong>{event.title}</strong></span>
            <StatusBadge status={event.archive_status} />
          </div>

          <div className={styles.actions}>
            <Link href="/admin/events" className={`${styles.btn} ${styles.btnSmall}`}>
              Cancel
            </Link>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={isSaving || uploadingPoster || uploadingArchive}
            >
              {isSaving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
