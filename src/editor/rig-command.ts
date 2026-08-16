import type { RigDocument } from '../kernel/types.js';

/**
 * A pure authored-rig mutation used inside a project-level durable command.
 *
 * This is deliberately not a history/session abstraction. ProjectSession is
 * the single durable Undo/Redo owner for active JURE workflows.
 */
export interface RigCommand {
  label: string;
  apply(document: RigDocument): RigDocument;
}
