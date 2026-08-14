import { useEffect, useRef } from 'react';
import type { RigDisplayModel } from '../display/types.js';
import type { TransformTarget } from '../editor/transform-target.js';
import type { RigidPose } from '../kernel/types.js';
import { RigViewportController, type CameraPreset, type ViewFitTarget } from '../render/rig-viewport-controller.js';

interface RigViewportProps {
  model: RigDisplayModel;
  selectedTarget: TransformTarget | null;
  cameraPreset: CameraPreset;
  transformMode: 'translate' | 'rotate';
  transformSpace: 'world' | 'local';
  sourceAssetUrl: string | null;
  sourceSelectionPose: RigidPose | null;
  viewRequest: { id: number; target: ViewFitTarget } | null;
  onSelect(target: TransformTarget | null): void;
  onTransformStart(target: TransformTarget): void;
  onTransformPreview(target: TransformTarget, worldPose: RigidPose): void;
  onTransformCommit(target: TransformTarget): void;
  onTransformCancel(target: TransformTarget): void;
}

export function RigViewport(props: RigViewportProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<RigViewportController | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    const controller = new RigViewportController(hostRef.current, props);
    controllerRef.current = controller;
    return () => { controller.dispose(); controllerRef.current = null; };
  }, []);

  useEffect(() => { controllerRef.current?.setCallbacks(props); }, [props.onSelect, props.onTransformStart, props.onTransformPreview, props.onTransformCommit, props.onTransformCancel]);
  useEffect(() => { controllerRef.current?.setDisplayModel(props.model, props.selectedTarget); }, [props.model, props.selectedTarget]);
  useEffect(() => { controllerRef.current?.setCameraPreset(props.cameraPreset); }, [props.cameraPreset]);
  useEffect(() => { controllerRef.current?.setTransformMode(props.transformMode); }, [props.transformMode]);
  useEffect(() => { controllerRef.current?.setTransformSpace(props.transformSpace); }, [props.transformSpace]);
  useEffect(() => { controllerRef.current?.setSourceSelection(props.sourceSelectionPose); }, [props.sourceSelectionPose]);
  useEffect(() => {
    if (props.viewRequest) controllerRef.current?.fitView(props.viewRequest.target);
  }, [props.viewRequest?.id]);
  useEffect(() => {
    if (props.sourceAssetUrl) void controllerRef.current?.showSourceAsset(props.sourceAssetUrl);
    else controllerRef.current?.clearSourceAsset();
  }, [props.sourceAssetUrl]);

  return <div className="viewport" ref={hostRef} />;
}
