/**
 * Event Lifecycle State Machine & Transition Rules (OCP & SRP).
 */

import { EventArchiveStatus } from '../types/event';
import { AdminRole } from '../auth';

export interface StatusTransitionConfig {
  from: EventArchiveStatus;
  to: EventArchiveStatus;
  actionName: string;
  label: string;
  requiredRole?: AdminRole;
  description: string;
}

export const LIFECYCLE_TRANSITIONS: Record<string, StatusTransitionConfig> = {
  archive: {
    from: 'hidden',
    to: 'archived',
    actionName: 'archive',
    label: 'Archive Event',
    description: 'Moves event into the public archive.',
  },
  hide: {
    from: 'active',
    to: 'hidden',
    actionName: 'hide',
    label: 'Hide Event',
    description: 'Hides event from public view.',
  },
  restore: {
    from: 'hidden',
    to: 'active',
    actionName: 'restore',
    label: 'Restore to Active',
    description: 'Restores a hidden or discarded event back to active status.',
  },
  discard: {
    from: 'hidden',
    to: 'discarded',
    actionName: 'discard',
    label: 'Discard Event',
    description: 'Moves event to trash.',
  },
};

export function canPerformTransition(
  action: string,
  userRole: AdminRole | null
): { allowed: boolean; reason?: string } {
  const transition = LIFECYCLE_TRANSITIONS[action];
  if (!transition) {
    return { allowed: false, reason: `Unknown lifecycle action: ${action}` };
  }

  if (transition.requiredRole && userRole !== transition.requiredRole) {
    return {
      allowed: false,
      reason: `Permission denied: ${transition.label} requires ${transition.requiredRole} role.`,
    };
  }

  return { allowed: true };
}
