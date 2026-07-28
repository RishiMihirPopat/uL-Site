'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../admin.module.css';

export default function NewEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '', speaker: '', venue: '', category: '',
    date: '', event_datetime: '', time: '', price: '',
    description: '', image: '', urbanaut_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      router.push('/admin/events');
    } else {
      alert('Error creating event');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>New Event</h1>
      </div>
      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div><label>Title</label><input name="title" className={styles.input} value={formData.title} onChange={handleChange} required /></div>
          <div><label>Speaker</label><input name="speaker" className={styles.input} value={formData.speaker} onChange={handleChange} required /></div>
          <div><label>Venue</label><input name="venue" className={styles.input} value={formData.venue} onChange={handleChange} required /></div>
          <div><label>Category</label>
            <select name="category" className={styles.select} value={formData.category} onChange={handleChange} required>
              <option value="">Select...</option>
              <option value="talk">Talk</option>
              <option value="workshop">Workshop</option>
              <option value="performance">Performance</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div><label>Date (e.g., Sat, 4 Jul)</label><input name="date" className={styles.input} value={formData.date} onChange={handleChange} required /></div>
          <div><label>Event Datetime (ISO or local)</label><input type="datetime-local" name="event_datetime" className={styles.input} value={formData.event_datetime} onChange={handleChange} required /></div>
          <div><label>Time</label><input name="time" className={styles.input} value={formData.time} onChange={handleChange} required /></div>
          <div><label>Price</label><input name="price" className={styles.input} value={formData.price} onChange={handleChange} /></div>
          <div><label>Description</label><textarea name="description" className={styles.textarea} value={formData.description} onChange={handleChange} /></div>
          <div><label>Image URL</label><input name="image" className={styles.input} value={formData.image} onChange={handleChange} /></div>
          <div><label>Urbanaut URL</label><input name="urbanaut_url" className={styles.input} value={formData.urbanaut_url} onChange={handleChange} /></div>
          
          <div className={styles.actions} style={{ marginTop: '1rem' }}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Create Event</button>
            <button type="button" className={styles.btn} onClick={() => router.push('/admin/events')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
