import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import type { MapDocument, MapEntity, MapRigidPose, MapVec3, MapVisual } from '../map/types.js';

export type MapTransformMode = 'translate' | 'rotate';

export interface MapViewportCallbacks {
  onSelect(entityId: string | null): void;
  onTransformStart(entityId: string): void;
  onTransformPreview(entityId: string, pose: MapRigidPose): void;
  onTransformCommit(entityId: string): void;
  onTransformCancel(entityId: string): void;
}

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

export class MapViewportController {
  readonly scene = new THREE.Scene();
  private readonly renderer: THREE.WebGLRenderer;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly orbit: OrbitControls;
  private readonly transform: TransformControls;
  private readonly mapRoot = new THREE.Group();
  private readonly spawnRoot = new THREE.Group();
  private readonly selectedProxy = new THREE.Object3D();
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly selectable = new Map<THREE.Object3D, string>();
  private readonly entityPoses = new Map<string, MapRigidPose>();
  private selectedEntityId: string | null = null;
  private resizeObserver: ResizeObserver;
  private animationFrame = 0;
  private callbacks: MapViewportCallbacks;
  private transformDragActive = false;
  private transformCancelRequested = false;
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

    this.scene.add(this.mapRoot, this.spawnRoot, this.selectedProxy, this.transform.getHelper());

    const grid = new THREE.GridHelper(40, 80, 0x3f4852, 0x252b31);
    this.scene.add(grid);
    this.scene.add(new THREE.AxesHelper(0.7));
    this.scene.add(new THREE.HemisphereLight(0xdbe7ff, 0x20252b, 2.1));
    const key = new THREE.DirectionalLight(0xffffff, 2.5);
    key.position.set(8, 12, 7);
    this.scene.add(key);

    this.transform.addEventListener('mouseDown', () => {
      if (!this.selectedEntityId || !this.entityPoses.has(this.selectedEntityId)) return;
      this.transformDragActive = true;
      this.transformCancelRequested = false;
      this.orbit.enabled = false;
      this.callbacks.onTransformStart(this.selectedEntityId);
    });
    this.transform.addEventListener('objectChange', () => {
      if (!this.transformDragActive || this.transformCancelRequested || !this.selectedEntityId) return;
      this.callbacks.onTransformPreview(this.selectedEntityId, this.readProxyPose());
    });
    this.transform.addEventListener('dragging-changed', (event) => {
      const dragging = Boolean((event as { value?: boolean }).value);
      this.orbit.enabled = !dragging;
    });
    this.transform.addEventListener('mouseUp', () => {
      this.orbit.enabled = true;
      const entityId = this.selectedEntityId;
      if (!this.transformDragActive || this.transformCancelRequested || !entityId) {
        this.resetDragState();
        return;
      }
      this.callbacks.onTransformCommit(entityId);
      this.resetDragState();
    });

    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.addEventListener('pointercancel', this.onPointerCancel);
    this.host.ownerDocument.defaultView?.addEventListener('keydown', this.onWindowKeyDown);
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
    this.transform.setMode(mode);
  }

  setDocument(document: MapDocument, selectedEntityId: string | null): void {
    if (this.transformDragActive && this.selectedEntityId !== selectedEntityId) this.cancelActiveTransform();

    this.disposeChildren(this.mapRoot);
    this.disposeChildren(this.spawnRoot);
    this.selectable.clear();
    this.entityPoses.clear();

    for (const entity of document.entities) {
      const object = this.createEntityObject(entity, entity.id === selectedEntityId);
      this.applyPose(object, entity.pose);
      object.userData.mapEntityId = entity.id;
      this.mapRoot.add(object);
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) this.selectable.set(child, entity.id);
      });
      this.entityPoses.set(entity.id, entity.pose);
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
    this.syncTransformProxy();

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
    cancelAnimationFrame(this.animationFrame);
    this.resizeObserver.disconnect();
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.removeEventListener('pointercancel', this.onPointerCancel);
    this.host.ownerDocument.defaultView?.removeEventListener('keydown', this.onWindowKeyDown);
    this.host.ownerDocument.defaultView?.removeEventListener('blur', this.onWindowBlur);
    this.orbit.dispose();
    this.transform.dispose();
    this.disposeChildren(this.mapRoot);
    this.disposeChildren(this.spawnRoot);
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

  private syncTransformProxy(): void {
    if (!this.selectedEntityId) {
      this.transform.detach();
      return;
    }
    const pose = this.entityPoses.get(this.selectedEntityId);
    if (!pose) {
      this.transform.detach();
      return;
    }
    this.applyPose(this.selectedProxy, pose);
    this.transform.attach(this.selectedProxy);
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

  private cancelActiveTransform(): void {
    if (!this.transformDragActive || !this.selectedEntityId) return;
    const entityId = this.selectedEntityId;
    this.transformCancelRequested = true;
    this.transform.reset();
    this.callbacks.onTransformCancel(entityId);
    this.transform.pointerUp(null);
    this.orbit.enabled = true;
  }

  private resetDragState(): void {
    this.transformDragActive = false;
    this.transformCancelRequested = false;
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (this.transform.dragging || this.transform.axis !== null) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1,
      -((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects([...this.selectable.keys()], false);
    this.callbacks.onSelect(hits.length > 0 ? this.selectable.get(hits[0].object) ?? null : null);
  };

  private onPointerCancel = (): void => {
    this.cancelActiveTransform();
  };

  private onWindowKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') this.cancelActiveTransform();
  };

  private onWindowBlur = (): void => {
    this.cancelActiveTransform();
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
