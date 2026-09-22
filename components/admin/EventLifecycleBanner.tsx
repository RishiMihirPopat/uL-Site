import React from 'react';
import styles from '../../app/admin/admin.module.css';
import { StatusBadge } from './StatusBadge';
import { EventArchiveStatus } from '@/lib/types/event';

interface EventLifecycleBannerProps {
  status: EventArchiveStatus | string;
  role: string | null;
  onStatusChange: (action: string) => void;
  onDirectStatusSelect?: (newStatus: EventArchiveStatus) => void;
  onPublishArchive: () => void;
}

export function EventLifecycleBanner({
  status,
  role,
  onStatusChange,
  onDirectStatusSelect,
  onPublishArchive,
}: EventLifecycleBannerProps) {
  return (
    <div
      className={styles.card}
      style={{
        borderLeft: status === 'pending_archive' ? '5px solid var(--color-primary, #6B2D2D)' : '5px solid var(--color-bg-dark, #2A2420)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#1A1714' }}>
              Status Lifecycle:
            </h3>
            <StatusBadge status={status} />
            
            {/* Direct Status Selector Dropdown */}
            {onDirectStatusSelect && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted, #3D332A)', fontFamily: 'var(--font-mono, monospace)' }}>Change to:</span>
                <select
                  className={styles.select}
                  style={{ padding: '3px 8px', fontSize: '0.82rem', width: 'auto', minWidth: '160px' }}
                  value={status}
                  onChange={(e) => onDirectStatusSelect(e.target.value as EventArchiveStatus)}
                >
                  <option value="active">Active & Booking</option>
                  <option value="pending_archive">Pending Archive Review</option>
                  <option value="archived">Published to Archive</option>
                  <option value="hidden">Hidden Draft</option>
                  {status === 'discarded' && <option value="discarded">Discarded (Legacy Trash)</option>}
                </select>
              </div>
            )}
          </div>

          <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted, #3D332A)', fontSize: '0.88rem' }}>
            {status === 'active' && 'This event is currently active, scheduled, and visible to visitors on the live website.'}
            {status === 'pending_archive' && 'This event has concluded. Add recap photos and media below, then click "Publish to Postcard Archive".'}
            {status === 'archived' && 'This event is featured in the public Postcard Archive interactive dossier on the website.'}
            {status === 'hidden' && 'This event has concluded or is saved as a hidden draft. You can send it to the public archive, discard it, or restore it to active.'}
            {status === 'discarded' && 'This legacy event is in trash. You can restore it to active or permanently delete it along with its uploaded media.'}
          </p>
        </div>

        <div className={styles.actions}>
          {status === 'active' && (
            <>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSmall}`}
                onClick={() => onStatusChange('archive')}
                title="Move to archive flow"
              >
                Send to Archive Flow
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSmall}`}
                onClick={() => onStatusChange('hide')}
              >
                Hide from Site
              </button>
            </>
          )}

          {status === 'pending_archive' && (
            <>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={onPublishArchive}
              >
                Publish to Postcard Archive
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSmall}`}
                onClick={() => onStatusChange('hide')}
              >
                Hide
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSmall} ${styles.btnDanger}`}
                onClick={() => onStatusChange('discard')}
              >
                Discard
              </button>
            </>
          )}

          {status === 'archived' && (
            <>
              <a href="/#archive" target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnSmall}`}>
                View in Archive ↗
              </a>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSmall}`}
                onClick={() => onStatusChange('hide')}
              >
                Hide from Archive
              </button>
            </>
          )}

          {status === 'hidden' && (
            <>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSmall} ${styles.btnPrimary}`}
                onClick={onPublishArchive}
              >
                Send to Archive
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSmall}`}
                onClick={() => onStatusChange('restore')}
              >
                Restore to Active
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSmall} ${styles.btnDanger}`}
                onClick={() => onStatusChange('discard')}
              >
                Discard
              </button>
            </>
          )}

          {status === 'discarded' && (
            <>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSmall} ${styles.btnPrimary}`}
                onClick={() => onStatusChange('restore')}
              >
                Restore to Active
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSmall} ${styles.btnDanger}`}
                onClick={() => onStatusChange('discard')}
              >
                Delete Permanently
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
