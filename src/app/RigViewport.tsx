import { useEffect, useRef } from 'react';
import type { RigDisplayModel } from '../display/types.js';
import type { TransformTarget } from '../editor/transform-target.js';
import type { RigidPose } from '../kernel/types.js';
import { RigViewportController, type CameraPreset, type SourcePlacementView, type ViewFitTarget } from '../render/rig-viewport-controller.js';

interface RigViewportProps {
  model: RigDisplayModel;
  rigVisible: boolean;
  selectedTarget: TransformTarget | null;
  cameraPreset: CameraPreset;
  transformMode: 'translate' | 'rotate';
  transformSpace: 'world' | 'local';
  sourceAssetUrl: string | null;
  sourcePlacement?: SourcePlacementView | null;
  sourceGeometryVisible: boolean;
  sourceDatumVisible: boolean;
  sourceSelectionPose: RigidPose | null;
  viewRequest: { id: number; target: ViewFitTarget } | null;
  onSelect(target: TransformTarget | null): void;
  onTransformStart(target: TransformTarget): void;
  onTransformPreview(target: TransformTarget, worldPose: RigidPose): void;
  onTransformCommit(target: TransformTarget): void;
  onTransformCancel(target: TransformTarget): void;
  onSourceTransformStart?(sourceInstanceId: string): void;
  onSourceTransformPreview?(sourceInstanceId: string, worldPose: RigidPose): void;
  onSourceTransformCommit?(sourceInstanceId: string): void;
  onSourceTransformCancel?(sourceInstanceId: string): void;
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

  useEffect(() => { controllerRef.current?.setCallbacks(props); }, [props.onSelect, props.onTransformStart, props.onTransformPreview, props.onTransformCommit, props.onTransformCancel, props.onSourceTransformStart, props.onSourceTransformPreview, props.onSourceTransformCommit, props.onSourceTransformCancel]);
  useEffect(() => { controllerRef.current?.setDisplayModel(props.model, props.selectedTarget); }, [props.model, props.selectedTarget]);
  useEffect(() => { controllerRef.current?.setRigVisible(props.rigVisible); }, [props.rigVisible]);
  useEffect(() => { controllerRef.current?.setCameraPreset(props.cameraPreset); }, [props.cameraPreset]);
  useEffect(() => { controllerRef.current?.setTransformMode(props.transformMode); }, [props.transformMode]);
  useEffect(() => { controllerRef.current?.setTransformSpace(props.transformSpace); }, [props.transformSpace]);
  useEffect(() => { controllerRef.current?.setSourceGeometryVisible(props.sourceGeometryVisible); }, [props.sourceGeometryVisible]);
  useEffect(() => { controllerRef.current?.setSourcePlacement(props.sourcePlacement ?? null); }, [props.sourcePlacement?.sourceInstanceId, props.sourcePlacement?.editActive, props.sourcePlacement?.pose]);
  useEffect(() => { controllerRef.current?.setSourceDatumVisible(props.sourceDatumVisible); }, [props.sourceDatumVisible]);
  useEffect(() => { controllerRef.current?.setSourceSelection(props.sourceSelectionPose); }, [props.sourceSelectionPose]);
  useEffect(() => {
    if (props.viewRequest) controllerRef.current?.fitView(props.viewRequest.target);
  }, [props.viewRequest?.id]);
  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    if (props.sourceAssetUrl) {
      void controller.showSourceAsset(props.sourceAssetUrl).catch((error: unknown) => {
        console.error('JURE SOURCE display load failed', error);
      });
    } else {
      controller.clearSourceAsset();
    }
  }, [props.sourceAssetUrl]);

  return <div className="viewport" ref={hostRef} />;
}
