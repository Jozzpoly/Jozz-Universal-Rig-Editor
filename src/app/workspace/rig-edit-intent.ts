import { useCallback, useEffect, useSyncExternalStore } from 'react';
import type { TransformTarget } from '../../editor/transform-target.js';

let activeTarget: TransformTarget | null = null;
const listeners = new Set<() => void>();

function sameTarget(a: TransformTarget | null, b: TransformTarget | null): boolean {
  return a?.kind === b?.kind && a?.id === b?.id;
}

function emit(): void {
  for (const listener of listeners) listener();
}

function setActiveTarget(target: TransformTarget | null): void {
  if (sameTarget(activeTarget, target)) return;
  activeTarget = target;
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): TransformTarget | null {
  return activeTarget;
}

export interface RigEditIntentView {
  editActive: boolean;
  beginEdit(): void;
  endEdit(): void;
}

export function useRigEditIntent(selectedTarget: TransformTarget | null): RigEditIntentView {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const editActive = sameTarget(current, selectedTarget);

  useEffect(() => {
    if (current && !sameTarget(current, selectedTarget)) setActiveTarget(null);
  }, [current, selectedTarget?.kind, selectedTarget?.id]);

  const beginEdit = useCallback(() => {
    if (selectedTarget) setActiveTarget(selectedTarget);
  }, [selectedTarget?.kind, selectedTarget?.id]);

  const endEdit = useCallback(() => {
    if (sameTarget(activeTarget, selectedTarget)) setActiveTarget(null);
  }, [selectedTarget?.kind, selectedTarget?.id]);

  return { editActive, beginEdit, endEdit };
}
