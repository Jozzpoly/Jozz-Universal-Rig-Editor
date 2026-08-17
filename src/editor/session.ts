import type { RigDocument } from '../kernel/types.js';

export interface RevisionedDocument {
  revision: number;
}

export interface EditorCommand<Document extends RevisionedDocument> {
  label: string;
  apply(document: Document): Document;
}

export interface RigCommand extends EditorCommand<RigDocument> {}

export interface PreviewState<Document extends RevisionedDocument = RigDocument> {
  label: string;
  baseline: Document;
  document: Document;
}

export interface EditorSession<Document extends RevisionedDocument = RigDocument> {
  committed: Document;
  preview: PreviewState<Document> | null;
  past: Document[];
  future: Document[];
}

export function createEditorSession<Document extends RevisionedDocument>(document: Document): EditorSession<Document> {
  return { committed: document, preview: null, past: [], future: [] };
}

export function beginPreview<Document extends RevisionedDocument>(session: EditorSession<Document>, label: string): EditorSession<Document> {
  if (session.preview) return session;
  return { ...session, preview: { label, baseline: session.committed, document: session.committed } };
}

export function updatePreview<Document extends RevisionedDocument>(session: EditorSession<Document>, command: EditorCommand<Document>): EditorSession<Document> {
  if (!session.preview) throw new Error('Preview must be started before it can be updated.');
  return { ...session, preview: { ...session.preview, document: command.apply(session.preview.baseline) } };
}

export function cancelPreview<Document extends RevisionedDocument>(session: EditorSession<Document>): EditorSession<Document> {
  return session.preview ? { ...session, preview: null } : session;
}

export function commitPreview<Document extends RevisionedDocument>(session: EditorSession<Document>): EditorSession<Document> {
  if (!session.preview) return session;
  const next: Document = { ...session.preview.document, revision: session.committed.revision + 1 };
  return { committed: next, preview: null, past: [...session.past, session.committed], future: [] };
}

export function applyCommand<Document extends RevisionedDocument>(session: EditorSession<Document>, command: EditorCommand<Document>): EditorSession<Document> {
  if (session.preview) throw new Error('Cannot apply a committed command while a preview is active.');
  const next: Document = { ...command.apply(session.committed), revision: session.committed.revision + 1 };
  return { committed: next, preview: null, past: [...session.past, session.committed], future: [] };
}

export function undo<Document extends RevisionedDocument>(session: EditorSession<Document>): EditorSession<Document> {
  if (session.preview || session.past.length === 0) return session;
  const previous = session.past[session.past.length - 1];
  return { committed: previous, preview: null, past: session.past.slice(0, -1), future: [session.committed, ...session.future] };
}

export function redo<Document extends RevisionedDocument>(session: EditorSession<Document>): EditorSession<Document> {
  if (session.preview || session.future.length === 0) return session;
  const next = session.future[0];
  return { committed: next, preview: null, past: [...session.past, session.committed], future: session.future.slice(1) };
}

export function visibleDocument<Document extends RevisionedDocument>(session: EditorSession<Document>): Document {
  return session.preview?.document ?? session.committed;
}
