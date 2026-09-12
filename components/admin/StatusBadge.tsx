import React from 'react';
import styles from '../../app/admin/admin.module.css';
import { EventArchiveStatus } from '@/lib/types/event';

export function StatusBadge({ status }: { status: EventArchiveStatus | string }) {
  switch (status) {
    case 'active':
      return <span className={`${styles.badge} ${styles.badgeActive}`}>Active & Booking</span>;
    case 'pending_archive':
      return <span className={`${styles.badge} ${styles.badgePending}`}>Pending Archive</span>;
    case 'archived':
      return <span className={`${styles.badge} ${styles.badgeArchived}`}>Archived</span>;
    case 'hidden':
      return <span className={`${styles.badge} ${styles.badgeHidden}`}>Hidden Draft</span>;
    case 'discarded':
      return <span className={`${styles.badge} ${styles.badgeDiscarded}`}>Discarded</span>;
    default:
      return <span className={styles.badge}>{status}</span>;
  }
}
