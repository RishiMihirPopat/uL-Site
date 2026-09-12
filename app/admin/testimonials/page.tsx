'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Testimonial } from '@/lib/types/testimonial';

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    recommender: '',
    quote: '',
    order_index: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchItems = () => {
    fetch('/api/admin/testimonials')
      .then((res) => res.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const handleEdit = (item: Testimonial) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      recommender: item.recommender,
      quote: item.quote,
      order_index: item.order_index ?? 0,
    });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ title: '', recommender: '', quote: '', order_index: 0 });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.quote) {
      alert('Title and Quote are required');
      return;
    }
    setIsSaving(true);

    try {
      if (editingId) {
        const res = await fetch('/api/admin/testimonials', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...formData }),
        });
        if (res.ok) {
          showToast('success', 'Recommendation updated successfully');
          handleCancel();
          fetchItems();
        } else {
          showToast('error', 'Failed to update recommendation');
        }
      } else {
        const res = await fetch('/api/admin/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          showToast('success', 'Recommendation added successfully');
          handleCancel();
          fetchItems();
        } else {
          showToast('error', 'Failed to create recommendation');
        }
      }
    } catch {
      showToast('error', 'Network error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recommendation?')) return;
    try {
      const res = await fetch(`/api/admin/testimonials?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'Deleted successfully');
        fetchItems();
      } else {
        showToast('error', 'Failed to delete');
      }
    } catch {
      showToast('error', 'Network error');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>Community Recommendations</h1>
          <p className={styles.headerSubtitle}>
            Manage community book, film, and music recommendations displayed on the homepage carousel.
          </p>
        </div>
      </div>

      {msg && (
        <div className={`${styles.alert} ${msg.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          {msg.text}
        </div>
      )}

      {/* Add / Edit Form Card */}
      <div className={styles.card} style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: '#1A1714' }}>
          {editingId ? 'Edit Recommendation' : '+ Add New Community Recommendation'}
        </h2>
        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Title & Medium</label>
              <input
                type="text"
                placeholder="e.g. Network, 1976 [Film] or All About Love, Bell Hooks [Book]"
                className={styles.input}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Recommender Attribution</label>
              <input
                type="text"
                placeholder="e.g. Rec by Kezia"
                className={styles.input}
                value={formData.recommender}
                onChange={(e) => setFormData({ ...formData, recommender: e.target.value })}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Recommendation Quote / Review</label>
            <textarea
              rows={4}
              placeholder="What makes this book, film, or album special..."
              className={styles.textarea}
              value={formData.quote}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              required
            />
          </div>

          <div className={styles.formRow} style={{ alignItems: 'center' }}>
            <div className={styles.formGroup} style={{ maxWidth: '160px' }}>
              <label className={styles.label}>Display Order</label>
              <input
                type="number"
                className={styles.input}
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value, 10) || 0 })}
              />
            </div>

            <div className={styles.actions} style={{ marginTop: 'auto', marginBottom: '6px' }}>
              {editingId && (
                <button type="button" className={styles.btn} onClick={handleCancel}>
                  Cancel
                </button>
              )}
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isSaving}>
                {isSaving ? 'Saving...' : editingId ? 'Update Recommendation' : 'Add Recommendation'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Recommendations Table */}
      <div className={styles.card} style={{ padding: 0 }}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Order</th>
                <th>Title & Medium</th>
                <th>Recommender</th>
                <th>Quote Excerpt</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    Loading recommendations...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    No recommendations found. Add your first one above!
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: '#888' }}>#{item.order_index ?? 0}</span>
                    </td>
                    <td>
                      <strong>{item.title}</strong>
                    </td>
                    <td>
                      <span style={{ color: '#C26540', fontStyle: 'italic' }}>{item.recommender}</span>
                    </td>
                    <td>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#555', maxHeight: '48px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.quote}
                      </p>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={styles.actions} style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.btnSmall}`}
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.btnSmall} ${styles.btnDanger}`}
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
