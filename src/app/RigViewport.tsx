import { useEffect, useRef } from 'react';
import type { RigDisplayModel } from '../display/types.js';
import type { TransformTarget } from '../editor/transform-target.js';
import type { RigidPose } from '../kernel/types.js';
import { RigViewportController, type CameraPreset, type ViewFitTarget } from '../render/rig-viewport-controller.js';

export interface RepresentationBindingView {
  sourceLocator: string;
  sourceNodeIndex: number;
  worldPose: RigidPose;
}

interface RigViewportProps {
  model: RigDisplayModel;
  rigVisible: boolean;
  selectedTarget: TransformTarget | null;
  cameraPreset: CameraPreset;
  transformMode: 'translate' | 'rotate';
  transformSpace: 'world' | 'local';
  sourceAssetUrl: string | null;
  sourceGeometryVisible: boolean;
  sourceDatumVisible: boolean;
  sourceSelectionPose: RigidPose | null;
  representationBinding: RepresentationBindingView | null;
  boundRepresentationVisible: boolean;
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
  useEffect(() => { controllerRef.current?.setRigVisible(props.rigVisible); }, [props.rigVisible]);
  useEffect(() => { controllerRef.current?.setCameraPreset(props.cameraPreset); }, [props.cameraPreset]);
  useEffect(() => { controllerRef.current?.setTransformMode(props.transformMode); }, [props.transformMode]);
  useEffect(() => { controllerRef.current?.setTransformSpace(props.transformSpace); }, [props.transformSpace]);
  useEffect(() => { controllerRef.current?.setSourceGeometryVisible(props.sourceGeometryVisible); }, [props.sourceGeometryVisible]);
  useEffect(() => { controllerRef.current?.setSourceDatumVisible(props.sourceDatumVisible); }, [props.sourceDatumVisible]);
  useEffect(() => { controllerRef.current?.setSourceSelection(props.sourceSelectionPose); }, [props.sourceSelectionPose]);
  useEffect(() => { controllerRef.current?.setBoundRepresentationVisible(props.boundRepresentationVisible); }, [props.boundRepresentationVisible]);
  useEffect(() => { controllerRef.current?.setBoundRepresentationPose(props.representationBinding?.worldPose ?? null); }, [props.representationBinding?.worldPose]);
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
  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    if (props.sourceAssetUrl && props.representationBinding) {
      void controller.showBoundRepresentation(props.sourceAssetUrl, props.representationBinding.sourceNodeIndex).catch((error: unknown) => {
        console.error('JURE BIND-00 representation load failed', error);
      });
    } else {
      controller.clearBoundRepresentation();
    }
  }, [props.sourceAssetUrl, props.representationBinding?.sourceLocator, props.representationBinding?.sourceNodeIndex]);

  return <div className="viewport" ref={hostRef} />;
}
