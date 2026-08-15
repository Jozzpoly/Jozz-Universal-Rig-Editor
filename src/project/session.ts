import type { JureProjectModel } from './types.js';

export interface JureProjectCommand {
  label: string;
  apply(project: JureProjectModel): JureProjectModel;
}

export interface ProjectHistoryEntry {
  label: string;
  project: JureProjectModel;
}

export interface ProjectPreviewState {
  label: string;
  baseline: JureProjectModel;
  project: JureProjectModel;
}

export interface ProjectSession {
  committed: JureProjectModel;
  preview: ProjectPreviewState | null;
  past: ProjectHistoryEntry[];
  future: ProjectHistoryEntry[];
}

export function createProjectSession(project: JureProjectModel): ProjectSession {
  return { committed: project, preview: null, past: [], future: [] };
}

export function beginProjectPreview(session: ProjectSession, label: string): ProjectSession {
  if (session.preview) return session;
  return {
    ...session,
    preview: {
      label,
      baseline: session.committed,
      project: session.committed,
    },
  };
}

export function updateProjectPreview(session: ProjectSession, command: JureProjectCommand): ProjectSession {
  if (!session.preview) throw new Error('Project preview must be started before it can be updated.');
  return {
    ...session,
    preview: {
      ...session.preview,
      project: command.apply(session.preview.baseline),
    },
  };
}

export function cancelProjectPreview(session: ProjectSession): ProjectSession {
  return session.preview ? { ...session, preview: null } : session;
}

export function commitProjectPreview(session: ProjectSession): ProjectSession {
  if (!session.preview) return session;
  if (session.preview.project === session.committed) return { ...session, preview: null };
  return {
    committed: session.preview.project,
    preview: null,
    past: [...session.past, { label: session.preview.label, project: session.committed }],
    future: [],
  };
}

export function applyProjectCommand(session: ProjectSession, command: JureProjectCommand): ProjectSession {
  if (session.preview) throw new Error('Cannot apply a committed project command while a preview is active.');
  const next = command.apply(session.committed);
  if (next === session.committed) return session;
  return {
    committed: next,
    preview: null,
    past: [...session.past, { label: command.label, project: session.committed }],
    future: [],
  };
}

export function undoProject(session: ProjectSession): ProjectSession {
  if (session.preview || session.past.length === 0) return session;
  const previous = session.past[session.past.length - 1];
  return {
    committed: previous.project,
    preview: null,
    past: session.past.slice(0, -1),
    future: [{ label: previous.label, project: session.committed }, ...session.future],
  };
}

export function redoProject(session: ProjectSession): ProjectSession {
  if (session.preview || session.future.length === 0) return session;
  const next = session.future[0];
  return {
    committed: next.project,
    preview: null,
    past: [...session.past, { label: next.label, project: session.committed }],
    future: session.future.slice(1),
  };
}

export function visibleProject(session: ProjectSession): JureProjectModel {
  return session.preview?.project ?? session.committed;
}

export function canUndoProject(session: ProjectSession): boolean {
  return session.past.length > 0 && !session.preview;
}

export function canRedoProject(session: ProjectSession): boolean {
  return session.future.length > 0 && !session.preview;
}
