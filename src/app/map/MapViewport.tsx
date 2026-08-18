import { useEffect, useRef } from 'react';
import type { MapAxis, MapBoxResizeOrigin, MapFaceSide } from '../../features/map-resize/box-face-resize.js';
import type { MapDocument, MapRigidPose } from '../../map/types.js';
import { MapViewportController, type MapTransformMode } from '../../render/map-viewport-controller.js';

interface MapViewportProps {
  document: MapDocument;
  selectedEntityId: string | null;
  transformMode: MapTransformMode;
  fitRequest: number;
  onSelect(entityId: string | null): void;
  onTransformStart(entityId: string): void;
  onTransformPreview(entityId: string, pose: MapRigidPose): void;
  onBoxFaceResizePreview?(
    entityId: string,
    axis: MapAxis,
    side: MapFaceSide,
    outwardDelta: number,
    origin: MapBoxResizeOrigin,
  ): void;
  onTransformCommit(entityId: string): void;
  onTransformCancel(entityId: string): void;
}

export function MapViewport(props: MapViewportProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<MapViewportController | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    const controller = new MapViewportController(hostRef.current, props);
    controllerRef.current = controller;
    controller.setDocument(props.document, props.selectedEntityId);
    controller.setTransformMode(props.transformMode);
    return () => {
      controller.dispose();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    controllerRef.current?.setCallbacks(props);
  }, [
    props.onSelect,
    props.onTransformStart,
    props.onTransformPreview,
    props.onBoxFaceResizePreview,
    props.onTransformCommit,
    props.onTransformCancel,
  ]);

  useEffect(() => {
    controllerRef.current?.setDocument(props.document, props.selectedEntityId);
  }, [props.document, props.selectedEntityId]);

  useEffect(() => {
    controllerRef.current?.setTransformMode(props.transformMode);
  }, [props.transformMode]);

  useEffect(() => {
    if (props.fitRequest > 0) controllerRef.current?.fitAll();
  }, [props.fitRequest]);

  return <div className="map-viewport" ref={hostRef} />;
}
