'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from '../../admin.module.css';

export default function EditEventPage() {
  const router = useRouter();
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [msg, setMsg] = useState('');

  // Content state
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([]);
  const [substackUrls, setSubstackUrls] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/admin/events/all`)
      .then(res => res.json())
      .then(events => {
        const found = events.find((e: any) => e.id.toString() === id);
        if (found) {
          setEvent(found);
          try { setYoutubeUrls(JSON.parse(found.youtube_urls || '[]')); } catch {}
          try { setSubstackUrls(JSON.parse(found.substack_urls || '[]')); } catch {}
        }
      });
  }, [id]);

  if (!event) return <div className={styles.page}>Loading...</div>;

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/admin/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
    if (res.ok) setMsg('Event updated');
  };

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/admin/events/${id}/content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ youtube_urls: JSON.stringify(youtubeUrls), substack_urls: JSON.stringify(substackUrls) })
    });
    if (res.ok) setMsg('Content updated');
  };

  const handleArchiveAction = async (action: string) => {
    const res = await fetch(`/api/admin/events/${id}/${action}`, { method: 'POST' });
    if (res.ok) {
      router.push('/admin/events');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    const res = await fetch(`/api/admin/events/${id}/image`, {
      method: 'POST',
      body: formData
    });
    if (res.ok) setMsg('Image uploaded');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Edit Event #{id}</h1>
      </div>
      {msg && <div className={`${styles.alert} ${styles.alertSuccess}`}>{msg}</div>}

      <div className={styles.card}>
        <h2>Basic Details</h2>
        <form onSubmit={handleEditSubmit} className={styles.form}>
          <div><label>Title</label><input name="title" className={styles.input} value={event.title} onChange={handleChange} /></div>
          <div><label>Speaker</label><input name="speaker" className={styles.input} value={event.speaker} onChange={handleChange} /></div>
          <div><label>Venue</label><input name="venue" className={styles.input} value={event.venue} onChange={handleChange} /></div>
          <div><label>Category</label>
            <select name="category" className={styles.select} value={event.category} onChange={handleChange}>
              <option value="talk">Talk</option>
              <option value="workshop">Workshop</option>
              <option value="performance">Performance</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div><label>Date</label><input name="date" className={styles.input} value={event.date} onChange={handleChange} /></div>
          <div><label>Event Datetime</label><input type="datetime-local" name="event_datetime" className={styles.input} value={event.event_datetime} onChange={handleChange} /></div>
          <div><label>Time</label><input name="time" className={styles.input} value={event.time} onChange={handleChange} /></div>
          <div><label>Price</label><input name="price" className={styles.input} value={event.price || ''} onChange={handleChange} /></div>
          <div><label>Description</label><textarea name="description" className={styles.textarea} value={event.description} onChange={handleChange} /></div>
          <div><label>Image URL</label><input name="image" className={styles.input} value={event.image || ''} onChange={handleChange} /></div>
          <div><label>Urbanaut URL</label><input name="urbanaut_url" className={styles.input} value={event.urbanaut_url || ''} onChange={handleChange} /></div>
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Save Details</button>
        </form>
      </div>

      {event.archive_status === 'active' && (
        <div className={styles.card}>
          <h2>Archive Event</h2>
          <div className={styles.form}>
            <div><label>Badge</label><input name="archive_badge" className={styles.input} value={event.archive_badge || ''} onChange={handleChange} /></div>
            <div><label>Tags (comma-separated)</label><input name="archive_tags" className={styles.input} value={event.archive_tags || ''} onChange={handleChange} /></div>
            <div><label>Archive Cover Image</label><input type="file" className={styles.input} onChange={handleImageUpload} /></div>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => handleArchiveAction('archive')}>Archive This Event</button>
          </div>
        </div>
      )}

      {event.archive_status === 'archived' && (
        <div className={styles.card}>
          <h2>Content Links</h2>
          <form onSubmit={handleContentSubmit} className={styles.form}>
            <div>
              <label>YouTube URLs (one per line)</label>
              <textarea 
                className={styles.textarea} 
                value={youtubeUrls.join('\n')} 
                onChange={(e) => setYoutubeUrls(e.target.value.split('\n').filter(Boolean))} 
              />
            </div>
            <div>
              <label>Substack URLs (one per line)</label>
              <textarea 
                className={styles.textarea} 
                value={substackUrls.join('\n')} 
                onChange={(e) => setSubstackUrls(e.target.value.split('\n').filter(Boolean))} 
              />
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Save Content</button>
          </form>
          <div style={{ marginTop: '1rem' }}>
            <label>Upload Archive Cover Image</label>
            <input type="file" className={styles.input} onChange={handleImageUpload} />
          </div>
        </div>
      )}

      <div className={styles.card}>
        <h2>Status Actions</h2>
        <div className={styles.actions}>
          {event.archive_status === 'active' && <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleArchiveAction('discard')}>Discard</button>}
          {event.archive_status === 'archived' && <button className={styles.btn} onClick={() => handleArchiveAction('hide')}>Hide</button>}
          {event.archive_status === 'hidden' && (
            <>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => handleArchiveAction('restore')}>Restore</button>
              <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleArchiveAction('discard')}>Discard</button>
            </>
          )}
          {event.archive_status === 'discarded' && <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => handleArchiveAction('restore')}>Restore</button>}
        </div>
      </div>
    </div>
  );
}
