import type { RigDocument } from '../kernel/types.js';

export interface RigCommand {
  label: string;
  apply(document: RigDocument): RigDocument;
}

export interface PreviewState {
  label: string;
  baseline: RigDocument;
  document: RigDocument;
}

export interface EditorSession {
  committed: RigDocument;
  preview: PreviewState | null;
  past: RigDocument[];
  future: RigDocument[];
}

export function createEditorSession(document: RigDocument): EditorSession {
  return { committed: document, preview: null, past: [], future: [] };
}

export function beginPreview(session: EditorSession, label: string): EditorSession {
  if (session.preview) return session;
  return { ...session, preview: { label, baseline: session.committed, document: session.committed } };
}

export function updatePreview(session: EditorSession, command: RigCommand): EditorSession {
  if (!session.preview) throw new Error('Preview must be started before it can be updated.');
  return { ...session, preview: { ...session.preview, document: command.apply(session.preview.baseline) } };
}

export function cancelPreview(session: EditorSession): EditorSession {
  return session.preview ? { ...session, preview: null } : session;
}

export function commitPreview(session: EditorSession): EditorSession {
  if (!session.preview) return session;
  const next = { ...session.preview.document, revision: session.committed.revision + 1 };
  return { committed: next, preview: null, past: [...session.past, session.committed], future: [] };
}

export function applyCommand(session: EditorSession, command: RigCommand): EditorSession {
  if (session.preview) throw new Error('Cannot apply a committed command while a preview is active.');
  const next = { ...command.apply(session.committed), revision: session.committed.revision + 1 };
  return { committed: next, preview: null, past: [...session.past, session.committed], future: [] };
}

export function undo(session: EditorSession): EditorSession {
  if (session.preview || session.past.length === 0) return session;
  const previous = session.past[session.past.length - 1];
  return { committed: previous, preview: null, past: session.past.slice(0, -1), future: [session.committed, ...session.future] };
}

export function redo(session: EditorSession): EditorSession {
  if (session.preview || session.future.length === 0) return session;
  const next = session.future[0];
  return { committed: next, preview: null, past: [...session.past, session.committed], future: session.future.slice(1) };
}

export function visibleDocument(session: EditorSession): RigDocument {
  return session.preview?.document ?? session.committed;
}
