'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../admin.module.css';
import { validateEventLinks, normalizeTags } from '@/lib/validators';
import { parseEventDateTime } from '@/lib/utils/dateTime';
import { uploadImageFile } from '@/lib/utils/upload';
import { EventSessionFields } from '@/components/admin/EventSessionFields';
import { EventScheduleFields } from '@/components/admin/EventScheduleFields';
import { EventMediaFields } from '@/components/admin/EventMediaFields';

export default function NewEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '', speaker: '', venue: '', venue_map_url: '', category: '',
    date: '', event_datetime: '', time: '', price: '',
    description: '', image: '', urbanaut_url: '',
    archive_badge: '', archive_tags: ''
  });
  const [uploading, setUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent, targetStatus: 'active' | 'hidden' = 'active') => {
    e.preventDefault();

    const validation = validateEventLinks(formData);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      alert('Please fix the link errors before submitting:\n' + Object.values(validation.errors).join('\n'));
      return;
    }
    setValidationErrors({});
    setIsSubmitting(true);

    const payload = {
      ...formData,
      archive_status: targetStatus,
      archive_tags: normalizeTags(formData.archive_tags),
    };

    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        router.push(targetStatus === 'hidden' ? '/admin/events?filter=Hidden' : '/admin/events');
      } else {
        const data = await res.json();
        if (data.errors) {
          setValidationErrors(data.errors);
        }
        alert(data.error || 'Error creating event');
      }
    } catch {
      alert('Network error creating event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const result = await uploadImageFile(file, 'posters');
    if (result.success && result.url) {
      setFormData(prev => ({ ...prev, image: result.url! }));
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next.image;
        return next;
      });
    } else {
      alert(result.error || 'Failed to upload poster image');
    }
    setUploading(false);
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
        setFormData(prev => ({
          ...prev,
          event_datetime: value,
          date: parsed.date,
          time: parsed.time,
        }));
        return;
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>Create New Event</h1>
          <p className={styles.headerSubtitle}>Publish a new gathering to the active unLecture schedule.</p>
        </div>
        <Link href="/admin/events" className={styles.btn}>
          &larr; Back to Events
        </Link>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <EventSessionFields formData={formData} validationErrors={validationErrors} onChange={handleChange} />
        
        <EventScheduleFields formData={formData} onChange={handleChange} />

        <EventMediaFields
          formData={formData}
          validationErrors={validationErrors}
          uploading={uploading}
          onPosterUpload={handlePosterUpload}
          onChange={handleChange}
        />

        <div className={styles.actions} style={{ marginTop: '2rem' }}>
          <Link href="/admin/events" className={styles.btn}>
            Cancel
          </Link>
          <button
            type="button"
            className={styles.btn}
            onClick={(e) => handleSubmit(e, 'hidden')}
            disabled={isSubmitting || uploading}
          >
            Save as Draft
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={(e) => handleSubmit(e, 'active')}
            disabled={isSubmitting || uploading}
          >
            {isSubmitting ? 'Creating Event...' : 'Publish Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
