import { runner } from './harness';
import { canPerformTransition, LIFECYCLE_TRANSITIONS } from '../../lib/domain/lifecycle';

export function runLifecycleTests() {
  runner.startSuite('Event Lifecycle & State Machine (lib/domain/lifecycle.ts)');

  // 1. Transition definitions
  runner.assert(Boolean(LIFECYCLE_TRANSITIONS.archive), 'LIFECYCLE_TRANSITIONS: archive action defined');
  runner.assertEqual(LIFECYCLE_TRANSITIONS.archive.to, 'archived', 'LIFECYCLE_TRANSITIONS.archive targets "archived"');
  runner.assertEqual(LIFECYCLE_TRANSITIONS.hide.to, 'hidden', 'LIFECYCLE_TRANSITIONS.hide targets "hidden"');
  runner.assertEqual(LIFECYCLE_TRANSITIONS.restore.to, 'active', 'LIFECYCLE_TRANSITIONS.restore targets "active"');
  runner.assertEqual(LIFECYCLE_TRANSITIONS.discard.to, 'discarded', 'LIFECYCLE_TRANSITIONS.discard targets "discarded"');

  // 2. Allowed transitions
  const archiveCheck = canPerformTransition('archive', 'super_admin');
  runner.assertEqual(archiveCheck, { allowed: true }, 'canPerformTransition: allows super_admin to archive');

  const hideCheck = canPerformTransition('hide', 'event_manager');
  runner.assertEqual(hideCheck, { allowed: true }, 'canPerformTransition: allows event_manager to hide');

  const restoreCheck = canPerformTransition('restore', 'event_manager');
  runner.assertEqual(restoreCheck, { allowed: true }, 'canPerformTransition: allows restore');

  const discardCheck = canPerformTransition('discard', 'super_admin');
  runner.assertEqual(discardCheck, { allowed: true }, 'canPerformTransition: allows discard');

  // 3. Unknown actions & edge cases
  const unknownAction = canPerformTransition('permanently_nuke', 'super_admin');
  runner.assert(!unknownAction.allowed && Boolean(unknownAction.reason), 'canPerformTransition: rejects unknown action');

  const emptyAction = canPerformTransition('', 'super_admin');
  runner.assert(!emptyAction.allowed, 'canPerformTransition: rejects empty string action');

  const nullAction = canPerformTransition(null as any, null);
  runner.assert(!nullAction.allowed, 'canPerformTransition: safely rejects null action');

  runner.endSuite();
}
