import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { closestAxisParameterToRay } from '../features/map-resize/axis-drag.js';
import {
  mapBoxFaceFrame,
  type MapAxis,
  type MapBoxResizeOrigin,
  type MapFaceSide,
} from '../features/map-resize/box-face-resize.js';
import type { MapDocument, MapEntity, MapRigidPose, MapVec3, MapVisual } from '../map/types.js';

export type MapTransformMode = 'translate' | 'rotate' | 'resize';

export interface MapViewportCallbacks {
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

interface BoxProjection {
  pose: MapRigidPose;
  halfExtents: MapVec3;
}

interface ResizeHandleTarget {
  entityId: string;
  axis: MapAxis;
  side: MapFaceSide;
  center: THREE.Vector3;
  outwardNormal: THREE.Vector3;
  orientation: THREE.Quaternion;
}

interface ResizeHandleVisual {
  target: ResizeHandleTarget;
  facePlate: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  stem: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>;
  head: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>;
}

interface ActiveFaceResizeDrag {
  pointerId: number;
  entityId: string;
  axis: MapAxis;
  side: MapFaceSide;
  axisOrigin: THREE.Vector3;
  outwardNormal: THREE.Vector3;
  startAxisParameter: number;
  lastOutwardDelta: number;
  lastOrigin: MapBoxResizeOrigin;
  didPreview: boolean;
}

const RESIZE_AXES: MapAxis[] = ['x', 'y', 'z'];
const RESIZE_SIDES: MapFaceSide[] = [-1, 1];
const HANDLE_AXIS_HIDE_ALIGNMENT = 0.985;
const RESIZE_FIXED_CUE_COLOR = 0xe7edf5;
const RESIZE_CENTER_CUE_COLOR = 0xf4f7fb;

function materialForVisual(visual: MapVisual, selected: boolean): THREE.MeshStandardMaterial {
  if (selected) {
    return new THREE.MeshStandardMaterial({ color: 0x85b6ff, roughness: 0.52, metalness: 0.08 });
  }
  if (visual.kind === 'none') {
    return new THREE.MeshStandardMaterial({
      color: 0x68737f,
      roughness: 0.72,
      metalness: 0.02,
      wireframe: true,
      transparent: true,
      opacity: 0.72,
    });
  }
  const color = new THREE.Color().setRGB(visual.color[0], visual.color[1], visual.color[2], THREE.SRGBColorSpace);
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.6,
    metalness: 0.04,
    transparent: visual.color[3] < 1,
    opacity: visual.color[3],
  });
}

function midpoint(a: MapVec3, b: MapVec3): THREE.Vector3 {
  return new THREE.Vector3((a.x + b.x) * 0.5, (a.y + b.y) * 0.5, (a.z + b.z) * 0.5);
}

function toThree(value: MapVec3): THREE.Vector3 {
  return new THREE.Vector3(value.x, value.y, value.z);
}

function toMap(value: THREE.Vector3): MapVec3 {
  return { x: value.x, y: value.y, z: value.z };
}

function resizeAxisColor(axis: MapAxis): number {
  if (axis === 'x') return 0xf15b5b;
  if (axis === 'y') return 0x65d86e;
  return 0x6278ff;
}

function sameResizeTarget(a: ResizeHandleTarget | undefined, b: ResizeHandleTarget): boolean {
  return Boolean(
    a
    && a.entityId === b.entityId
    && a.axis === b.axis
    && a.side === b.side,
  );
}

export class MapViewportController {
  readonly scene = new THREE.Scene();
  private readonly renderer: THREE.WebGLRenderer;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly orbit: OrbitControls;
  private readonly transform: TransformControls;
  private readonly mapRoot = new THREE.Group();
  private readonly spawnRoot = new THREE.Group();
  private readonly resizeHandleRoot = new THREE.Group();
  private readonly selectedProxy = new THREE.Object3D();
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly selectable = new Map<THREE.Object3D, string>();
  private readonly entityPoses = new Map<string, MapRigidPose>();
  private readonly boxProjections = new Map<string, BoxProjection>();
  private readonly resizeHandleTargets = new Map<THREE.Object3D, ResizeHandleTarget>();
  private readonly resizeHandleVisuals: ResizeHandleVisual[] = [];
  private selectedEntityId: string | null = null;
  private resizeCenterCue: THREE.Mesh<THREE.OctahedronGeometry, THREE.MeshBasicMaterial> | null = null;
  private resizeObserver: ResizeObserver;
  private animationFrame = 0;
  private callbacks: MapViewportCallbacks;
  private transformMode: MapTransformMode = 'translate';
  private transformDragActive = false;
  private transformCancelRequested = false;
  private activeFaceResizeDrag: ActiveFaceResizeDrag | null = null;
  private hoveredResizeHandle: THREE.Object3D | null = null;
  private fittedInitialDocument = false;

  constructor(private readonly host: HTMLElement, callbacks: MapViewportCallbacks) {
    this.callbacks = callbacks;
    this.scene.background = new THREE.Color(0x111418);
    this.camera = new THREE.PerspectiveCamera(46, 1, 0.01, 4000);
    this.camera.position.set(8, 6, 10);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(this.renderer.domElement);

    this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbit.enableDamping = true;
    this.orbit.dampingFactor = 0.08;
    this.orbit.target.set(0, 0, 0);

    this.transform = new TransformControls(this.camera, this.renderer.domElement);
    this.transform.setMode('translate');
    this.transform.setSpace('world');
    this.transform.setSize(0.85);

    this.scene.add(
      this.mapRoot,
      this.spawnRoot,
      this.resizeHandleRoot,
      this.selectedProxy,
      this.transform.getHelper(),
    );

    const grid = new THREE.GridHelper(40, 80, 0x3f4852, 0x252b31);
    this.scene.add(grid);
    this.scene.add(new THREE.AxesHelper(0.7));
    this.scene.add(new THREE.HemisphereLight(0xdbe7ff, 0x20252b, 2.1));
    const key = new THREE.DirectionalLight(0xffffff, 2.5);
    key.position.set(8, 12, 7);
    this.scene.add(key);

    this.transform.addEventListener('mouseDown', () => {
      const entityId = this.selectedEntityId;
      if (this.transformMode === 'resize' || !entityId || !this.entityPoses.has(entityId)) return;
      this.transformDragActive = true;
      this.transformCancelRequested = false;
      this.orbit.enabled = false;
      this.callbacks.onTransformStart(entityId);
    });
    this.transform.addEventListener('objectChange', () => {
      const entityId = this.selectedEntityId;
      if (this.transformMode === 'resize' || !this.transformDragActive || this.transformCancelRequested || !entityId) return;
      this.callbacks.onTransformPreview(entityId, this.readProxyPose());
    });
    this.transform.addEventListener('dragging-changed', (event) => {
      if (this.activeFaceResizeDrag) return;
      const dragging = Boolean((event as { value?: boolean }).value);
      this.orbit.enabled = !dragging;
    });
    this.transform.addEventListener('mouseUp', () => {
      if (this.transformMode === 'resize') return;
      this.orbit.enabled = true;
      const entityId = this.selectedEntityId;
      if (!this.transformDragActive || this.transformCancelRequested || !entityId) {
        this.resetTransformDragState();
        return;
      }
      this.callbacks.onTransformCommit(entityId);
      this.resetTransformDragState();
    });

    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown, true);
    this.renderer.domElement.addEventListener('pointermove', this.onPointerMove, true);
    this.renderer.domElement.addEventListener('pointerup', this.onPointerUp, true);
    this.renderer.domElement.addEventListener('pointercancel', this.onPointerCancel, true);
    this.host.ownerDocument.defaultView?.addEventListener('keydown', this.onWindowKeyDown);
    this.host.ownerDocument.defaultView?.addEventListener('keyup', this.onWindowKeyUp);
    this.host.ownerDocument.defaultView?.addEventListener('blur', this.onWindowBlur);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
    this.resize();
    this.animate();
  }

  setCallbacks(callbacks: MapViewportCallbacks): void {
    this.callbacks = callbacks;
  }

  setTransformMode(mode: MapTransformMode): void {
    if ((this.transformDragActive || this.activeFaceResizeDrag) && mode !== this.transformMode) {
      this.cancelActiveInteraction();
    }
    this.transformMode = mode;
    if (mode !== 'resize') this.transform.setMode(mode);
    this.syncInteractionWidgets();
  }

  setDocument(document: MapDocument, selectedEntityId: string | null): void {
    if (
      (this.transformDragActive || this.activeFaceResizeDrag)
      && this.selectedEntityId !== selectedEntityId
    ) {
      this.cancelActiveInteraction();
    }

    this.disposeChildren(this.mapRoot);
    this.disposeChildren(this.spawnRoot);
    this.selectable.clear();
    this.entityPoses.clear();
    this.boxProjections.clear();

    for (const entity of document.entities) {
      const object = this.createEntityObject(entity, entity.id === selectedEntityId);
      this.applyPose(object, entity.pose);
      object.userData.mapEntityId = entity.id;
      this.mapRoot.add(object);
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) this.selectable.set(child, entity.id);
      });
      this.entityPoses.set(entity.id, entity.pose);
      if (entity.collision.kind === 'box') {
        this.boxProjections.set(entity.id, {
          pose: entity.pose,
          halfExtents: entity.collision.halfExtents,
        });
      }
    }

    for (const spawn of document.spawnPoints) {
      const marker = new THREE.Group();
      this.applyPose(marker, spawn.pose);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.34, 0.025, 8, 32),
        new THREE.MeshBasicMaterial({ color: 0x62d8ff, depthTest: false }),
      );
      ring.rotation.x = Math.PI / 2;
      marker.add(ring);
      const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 0.7, 0x62d8ff, 0.18, 0.09);
      marker.add(arrow);
      this.spawnRoot.add(marker);
    }

    this.selectedEntityId = selectedEntityId;
    this.syncInteractionWidgets();

    if (!this.fittedInitialDocument && document.entities.length > 0) {
      this.fittedInitialDocument = true;
      this.fitAll();
    }
  }

  fitAll(): void {
    const bounds = new THREE.Box3();
    bounds.expandByObject(this.mapRoot);
    if (bounds.isEmpty()) return;

    const sphere = bounds.getBoundingSphere(new THREE.Sphere());
    const radius = Math.max(sphere.radius, 0.5);
    const center = sphere.center;
    const direction = this.camera.position.clone().sub(this.orbit.target);
    if (direction.lengthSq() < 1e-12) direction.set(1, 0.7, 1);
    direction.normalize();

    const verticalFov = THREE.MathUtils.degToRad(this.camera.fov);
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * Math.max(this.camera.aspect, 1e-6));
    const limitingFov = Math.min(verticalFov, horizontalFov);
    const distance = Math.max(radius / Math.sin(limitingFov / 2) * 1.2, 2);
    this.camera.position.copy(center).addScaledVector(direction, distance);
    this.orbit.target.copy(center);
    this.camera.lookAt(center);
    this.orbit.update();
  }

  dispose(): void {
    if (this.transformDragActive) {
      this.transformCancelRequested = true;
      this.transform.reset();
      this.transform.pointerUp(null);
    }
    this.clearActiveFaceResizeDrag(false);
    cancelAnimationFrame(this.animationFrame);
    this.resizeObserver.disconnect();
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown, true);
    this.renderer.domElement.removeEventListener('pointermove', this.onPointerMove, true);
    this.renderer.domElement.removeEventListener('pointerup', this.onPointerUp, true);
    this.renderer.domElement.removeEventListener('pointercancel', this.onPointerCancel, true);
    this.host.ownerDocument.defaultView?.removeEventListener('keydown', this.onWindowKeyDown);
    this.host.ownerDocument.defaultView?.removeEventListener('keyup', this.onWindowKeyUp);
    this.host.ownerDocument.defaultView?.removeEventListener('blur', this.onWindowBlur);
    this.orbit.dispose();
    this.transform.dispose();
    this.disposeChildren(this.mapRoot);
    this.disposeChildren(this.spawnRoot);
    this.disposeChildren(this.resizeHandleRoot);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private createEntityObject(entity: MapEntity, selected: boolean): THREE.Object3D {
    const material = materialForVisual(entity.visual, selected);
    if (entity.collision.kind === 'box') {
      const half = entity.collision.halfExtents;
      return new THREE.Mesh(new THREE.BoxGeometry(half.x * 2, half.y * 2, half.z * 2), material);
    }

    const group = new THREE.Group();
    const a = new THREE.Vector3(entity.collision.pointA.x, entity.collision.pointA.y, entity.collision.pointA.z);
    const b = new THREE.Vector3(entity.collision.pointB.x, entity.collision.pointB.y, entity.collision.pointB.z);
    const direction = b.clone().sub(a);
    const length = direction.length();
    const cylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(entity.collision.radius, entity.collision.radius, length, 18),
      material,
    );
    cylinder.position.copy(midpoint(entity.collision.pointA, entity.collision.pointB));
    cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    group.add(cylinder);

    const sphereGeometry = new THREE.SphereGeometry(entity.collision.radius, 18, 12);
    const sphereA = new THREE.Mesh(sphereGeometry, material);
    const sphereB = new THREE.Mesh(sphereGeometry, material);
    sphereA.position.copy(a);
    sphereB.position.copy(b);
    group.add(sphereA, sphereB);
    return group;
  }

  private syncInteractionWidgets(): void {
    this.syncTransformProxy();
    this.syncResizeHandles();
  }

  private syncTransformProxy(): void {
    const entityId = this.selectedEntityId;
    if (this.transformMode === 'resize' || !entityId) {
      this.transform.detach();
      return;
    }
    const pose = this.entityPoses.get(entityId);
    if (!pose) {
      this.transform.detach();
      return;
    }
    this.applyPose(this.selectedProxy, pose);
    this.selectedProxy.scale.set(1, 1, 1);
    this.transform.attach(this.selectedProxy);
  }

  private syncResizeHandles(): void {
    this.disposeChildren(this.resizeHandleRoot);
    this.resizeHandleTargets.clear();
    this.resizeHandleVisuals.length = 0;
    this.resizeCenterCue = null;
    this.hoveredResizeHandle = null;

    const entityId = this.selectedEntityId;
    if (this.transformMode !== 'resize' || !entityId) return;
    const box = this.boxProjections.get(entityId);
    if (!box) return;

    const orientation = new THREE.Quaternion(
      box.pose.rotation.x,
      box.pose.rotation.y,
      box.pose.rotation.z,
      box.pose.rotation.w,
    );

    for (const axis of RESIZE_AXES) {
      for (const side of RESIZE_SIDES) {
        const frame = mapBoxFaceFrame(box.pose, box.halfExtents, axis, side);
        const target: ResizeHandleTarget = {
          entityId,
          axis,
          side,
          center: toThree(frame.center),
          outwardNormal: toThree(frame.outwardNormal).normalize(),
          orientation: orientation.clone(),
        };
        const axisColor = resizeAxisColor(axis);
        const facePlate = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1),
          new THREE.MeshBasicMaterial({
            color: axisColor,
            transparent: true,
            opacity: 0.4,
            depthTest: true,
            depthWrite: false,
            side: THREE.DoubleSide,
          }),
        );
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(1, 1, 1, 10),
          new THREE.MeshBasicMaterial({
            color: axisColor,
            transparent: true,
            opacity: 0.75,
            depthTest: false,
            depthWrite: false,
          }),
        );
        const head = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshBasicMaterial({
            color: axisColor,
            transparent: true,
            opacity: 0.9,
            depthTest: false,
            depthWrite: false,
          }),
        );
        facePlate.renderOrder = 38;
        stem.renderOrder = 40;
        head.renderOrder = 41;
        this.resizeHandleRoot.add(facePlate, stem, head);
        this.resizeHandleTargets.set(stem, target);
        this.resizeHandleTargets.set(head, target);
        this.resizeHandleVisuals.push({ target, facePlate, stem, head });
      }
    }

    const centerCue = new THREE.Mesh(
      new THREE.OctahedronGeometry(1, 0),
      new THREE.MeshBasicMaterial({
        color: RESIZE_CENTER_CUE_COLOR,
        transparent: true,
        opacity: 0.9,
        depthTest: false,
        depthWrite: false,
        wireframe: true,
      }),
    );
    centerCue.renderOrder = 45;
    centerCue.visible = false;
    this.resizeHandleRoot.add(centerCue);
    this.resizeCenterCue = centerCue;
    this.updateResizeHandleAppearance();
  }

  private updateResizeHandleAppearance(): void {
    const active = this.activeFaceResizeDrag;
    const hoveredTarget = this.hoveredResizeHandle
      ? this.resizeHandleTargets.get(this.hoveredResizeHandle)
      : undefined;
    const selectedBox = this.selectedEntityId ? this.boxProjections.get(this.selectedEntityId) : undefined;

    if (this.resizeCenterCue) {
      const showCenter = Boolean(active && active.lastOrigin === 'center' && selectedBox);
      this.resizeCenterCue.visible = showCenter;
      if (showCenter && selectedBox) {
        const center = toThree(selectedBox.pose.position);
        const distance = Math.max(this.camera.position.distanceTo(center), 0.01);
        const size = THREE.MathUtils.clamp(distance * 0.011, 0.07, 0.2);
        this.resizeCenterCue.position.copy(center);
        this.resizeCenterCue.scale.setScalar(size);
      }
    }

    for (const visual of this.resizeHandleVisuals) {
      const { target, facePlate, stem, head } = visual;
      const cameraVector = this.camera.position.clone().sub(target.center);
      const distance = Math.max(cameraVector.length(), 0.01);
      const viewDirection = cameraVector.normalize();
      const alignment = Math.abs(viewDirection.dot(target.outwardNormal));
      const facesCamera = target.outwardNormal.dot(viewDirection) > 0;
      const isActiveHandle = Boolean(
        active
        && active.entityId === target.entityId
        && active.axis === target.axis
        && active.side === target.side,
      );
      const isOppositeHandle = Boolean(
        active
        && active.entityId === target.entityId
        && active.axis === target.axis
        && active.side === -target.side,
      );
      const isFixedCue = isOppositeHandle && active?.lastOrigin === 'opposite-face';
      const isCenterPair = isOppositeHandle && active?.lastOrigin === 'center';
      const hovered = sameResizeTarget(hoveredTarget, target);
      const visible = isActiveHandle || isFixedCue || isCenterPair || alignment < HANDLE_AXIS_HIDE_ALIGNMENT;
      facePlate.visible = visible;
      stem.visible = visible;
      head.visible = visible;
      if (!visible) continue;

      const baseSize = THREE.MathUtils.clamp(distance * 0.018, 0.08, 0.32);
      const headScale = baseSize * (hovered || isActiveHandle ? 1.08 : (isCenterPair ? 1 : 0.9));
      const stemLength = baseSize * (hovered || isActiveHandle ? 1.85 : 1.65);
      const stemRadius = baseSize * (hovered || isActiveHandle ? 0.13 : 0.105);
      const plateScale = baseSize * (hovered || isActiveHandle || isFixedCue || isCenterPair ? 1.65 : 1.38);

      facePlate.position.copy(target.center).addScaledVector(target.outwardNormal, 0.004);
      facePlate.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), target.outwardNormal);
      facePlate.scale.set(plateScale, plateScale, 1);

      stem.position.copy(target.center).addScaledVector(target.outwardNormal, stemLength * 0.5 + baseSize * 0.1);
      stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), target.outwardNormal);
      stem.scale.set(stemRadius, stemLength, stemRadius);

      head.position.copy(target.center).addScaledVector(target.outwardNormal, stemLength + baseSize * 0.18);
      head.quaternion.copy(target.orientation);
      head.scale.setScalar(headScale);

      const axisColor = resizeAxisColor(target.axis);
      const faceMaterial = facePlate.material;
      const stemMaterial = stem.material;
      const headMaterial = head.material;

      faceMaterial.color.setHex(isFixedCue ? RESIZE_FIXED_CUE_COLOR : axisColor);
      stemMaterial.color.setHex(axisColor);
      headMaterial.color.setHex(axisColor);

      if (isActiveHandle || hovered) {
        faceMaterial.opacity = 0.82;
        stemMaterial.opacity = 1;
        headMaterial.opacity = 1;
      } else if (isCenterPair) {
        faceMaterial.opacity = 0.58;
        stemMaterial.opacity = 0.78;
        headMaterial.opacity = 0.88;
      } else if (isFixedCue) {
        faceMaterial.opacity = 0.9;
        stemMaterial.opacity = 0.28;
        headMaterial.opacity = 0.38;
      } else if (facesCamera) {
        faceMaterial.opacity = 0.42;
        stemMaterial.opacity = 0.72;
        headMaterial.opacity = 0.9;
      } else {
        faceMaterial.opacity = 0.08;
        stemMaterial.opacity = 0.18;
        headMaterial.opacity = 0.28;
      }
    }
  }

  private readProxyPose(): MapRigidPose {
    return {
      position: {
        x: this.selectedProxy.position.x,
        y: this.selectedProxy.position.y,
        z: this.selectedProxy.position.z,
      },
      rotation: {
        x: this.selectedProxy.quaternion.x,
        y: this.selectedProxy.quaternion.y,
        z: this.selectedProxy.quaternion.z,
        w: this.selectedProxy.quaternion.w,
      },
    };
  }

  private applyPose(object: THREE.Object3D, pose: MapRigidPose): void {
    object.position.set(pose.position.x, pose.position.y, pose.position.z);
    object.quaternion.set(pose.rotation.x, pose.rotation.y, pose.rotation.z, pose.rotation.w);
  }

  private updatePointerRay(event: PointerEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1,
      -((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.pointer, this.camera);
  }

  private axisParameterForCurrentRay(origin: THREE.Vector3, direction: THREE.Vector3): number | null {
    return closestAxisParameterToRay(
      toMap(origin),
      toMap(direction),
      toMap(this.raycaster.ray.origin),
      toMap(this.raycaster.ray.direction),
    );
  }

  private beginFaceResize(event: PointerEvent, target: ResizeHandleTarget): boolean {
    this.updatePointerRay(event);
    const startAxisParameter = this.axisParameterForCurrentRay(target.center, target.outwardNormal);
    if (startAxisParameter === null) return false;

    this.activeFaceResizeDrag = {
      pointerId: event.pointerId,
      entityId: target.entityId,
      axis: target.axis,
      side: target.side,
      axisOrigin: target.center.clone(),
      outwardNormal: target.outwardNormal.clone(),
      startAxisParameter,
      lastOutwardDelta: 0,
      lastOrigin: event.altKey ? 'center' : 'opposite-face',
      didPreview: false,
    };
    this.orbit.enabled = false;
    this.callbacks.onTransformStart(target.entityId);
    try { this.renderer.domElement.setPointerCapture(event.pointerId); } catch { /* pointer capture is best effort */ }
    this.renderer.domElement.style.cursor = 'grabbing';
    return true;
  }

  private previewActiveFaceResize(origin: MapBoxResizeOrigin): void {
    const active = this.activeFaceResizeDrag;
    if (!active || !active.didPreview) return;
    active.lastOrigin = origin;
    this.callbacks.onBoxFaceResizePreview?.(
      active.entityId,
      active.axis,
      active.side,
      active.lastOutwardDelta,
      origin,
    );
  }

  private updateFaceResizeDrag(event: PointerEvent): void {
    const active = this.activeFaceResizeDrag;
    if (!active || event.pointerId !== active.pointerId) return;
    this.updatePointerRay(event);
    const currentAxisParameter = this.axisParameterForCurrentRay(active.axisOrigin, active.outwardNormal);
    if (currentAxisParameter === null) return;

    const outwardDelta = currentAxisParameter - active.startAxisParameter;
    if (!Number.isFinite(outwardDelta)) return;
    const origin: MapBoxResizeOrigin = event.altKey ? 'center' : 'opposite-face';
    active.lastOutwardDelta = outwardDelta;
    active.lastOrigin = origin;

    if (Math.abs(outwardDelta) <= 1e-10 && !active.didPreview) return;
    active.didPreview = true;
    this.callbacks.onBoxFaceResizePreview?.(
      active.entityId,
      active.axis,
      active.side,
      outwardDelta,
      origin,
    );
  }

  private finishActiveFaceResize(event: PointerEvent): void {
    const active = this.activeFaceResizeDrag;
    if (!active || event.pointerId !== active.pointerId) return;
    const entityId = active.entityId;
    const shouldCommit = active.didPreview;
    this.clearActiveFaceResizeDrag(false);
    if (shouldCommit) this.callbacks.onTransformCommit(entityId);
    else this.callbacks.onTransformCancel(entityId);
  }

  private clearActiveFaceResizeDrag(notifyCancel: boolean): void {
    const active = this.activeFaceResizeDrag;
    if (!active) return;
    this.activeFaceResizeDrag = null;
    this.orbit.enabled = true;
    try {
      if (this.renderer.domElement.hasPointerCapture(active.pointerId)) {
        this.renderer.domElement.releasePointerCapture(active.pointerId);
      }
    } catch { /* pointer capture is best effort */ }
    this.renderer.domElement.style.cursor = '';
    if (notifyCancel) this.callbacks.onTransformCancel(active.entityId);
  }

  private cancelActiveTransform(): void {
    if (!this.transformDragActive || !this.selectedEntityId) return;
    const entityId = this.selectedEntityId;
    this.transformCancelRequested = true;
    this.transform.reset();
    this.callbacks.onTransformCancel(entityId);
    this.transform.pointerUp(null);
    this.orbit.enabled = true;
  }

  private cancelActiveInteraction(): void {
    if (this.activeFaceResizeDrag) {
      this.clearActiveFaceResizeDrag(true);
      return;
    }
    this.cancelActiveTransform();
  }

  private resetTransformDragState(): void {
    this.transformDragActive = false;
    this.transformCancelRequested = false;
    this.selectedProxy.scale.set(1, 1, 1);
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (this.activeFaceResizeDrag) return;
    this.updatePointerRay(event);

    if (this.transformMode === 'resize') {
      const handles = [...this.resizeHandleTargets.keys()].filter((handle) => handle.visible);
      const handleHit = this.raycaster.intersectObjects(handles, false)[0];
      if (handleHit) {
        const target = this.resizeHandleTargets.get(handleHit.object);
        if (target && this.beginFaceResize(event, target)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        }
      }
    } else if (this.transform.dragging || this.transform.axis !== null) {
      return;
    }

    const hits = this.raycaster.intersectObjects([...this.selectable.keys()], false);
    this.callbacks.onSelect(hits.length > 0 ? this.selectable.get(hits[0].object) ?? null : null);
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (this.activeFaceResizeDrag) {
      this.updateFaceResizeDrag(event);
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (this.transformMode !== 'resize') return;

    this.updatePointerRay(event);
    const handles = [...this.resizeHandleTargets.keys()].filter((handle) => handle.visible);
    const hit = this.raycaster.intersectObjects(handles, false)[0]?.object ?? null;
    this.hoveredResizeHandle = hit;
    this.renderer.domElement.style.cursor = hit ? 'grab' : '';
  };

  private onPointerUp = (event: PointerEvent): void => {
    if (!this.activeFaceResizeDrag) return;
    this.finishActiveFaceResize(event);
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  private onPointerCancel = (event: PointerEvent): void => {
    if (this.activeFaceResizeDrag && event.pointerId === this.activeFaceResizeDrag.pointerId) {
      this.clearActiveFaceResizeDrag(true);
      event.stopImmediatePropagation();
      return;
    }
    this.cancelActiveTransform();
  };

  private onWindowKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.cancelActiveInteraction();
      return;
    }
    if (event.key === 'Alt' && this.activeFaceResizeDrag) {
      this.previewActiveFaceResize('center');
    }
  };

  private onWindowKeyUp = (event: KeyboardEvent): void => {
    if (event.key === 'Alt' && this.activeFaceResizeDrag) {
      this.previewActiveFaceResize('opposite-face');
    }
  };

  private onWindowBlur = (): void => {
    this.cancelActiveInteraction();
  };

  private resize(): void {
    const width = Math.max(1, this.host.clientWidth);
    const height = Math.max(1, this.host.clientHeight);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private animate = (): void => {
    this.animationFrame = requestAnimationFrame(this.animate);
    this.orbit.update();
    if (this.transformMode === 'resize') this.updateResizeHandleAppearance();
    this.renderer.render(this.scene, this.camera);
  };

  private disposeObjectTree(root: THREE.Object3D): void {
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    root.traverse((object) => {
      const renderable = object as THREE.Object3D & {
        geometry?: THREE.BufferGeometry;
        material?: THREE.Material | THREE.Material[];
      };
      if (renderable.geometry) geometries.add(renderable.geometry);
      const material = renderable.material;
      if (Array.isArray(material)) material.forEach((entry) => materials.add(entry));
      else if (material) materials.add(material);
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
  }

  private disposeChildren(root: THREE.Object3D): void {
    while (root.children.length > 0) {
      const child = root.children.pop()!;
      this.disposeObjectTree(child);
    }
  }
}
