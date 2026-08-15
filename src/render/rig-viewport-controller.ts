import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { RigDisplayModel } from '../display/types.js';
import type { TransformTarget } from '../editor/transform-target.js';
import type { RigidPose, RigId } from '../kernel/types.js';

export type CameraPreset = 'perspective' | 'front' | 'top' | 'side';
export type ViewFitTarget = 'source-selection' | 'source' | 'rig' | 'all';

export interface SourcePlacementView {
  sourceInstanceId: string;
  pose: RigidPose;
  editActive: boolean;
}

export interface ViewportCallbacks {
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

type TransformSubject =
  | { kind: 'rig'; target: TransformTarget }
  | { kind: 'source-instance'; sourceInstanceId: string };

function sameTarget(a: TransformTarget | null, b: TransformTarget | null): boolean {
  return a?.kind === b?.kind && a?.id === b?.id;
}

function sameSubject(a: TransformSubject | null, b: TransformSubject | null): boolean {
  if (!a || !b || a.kind !== b.kind) return a === b;
  return a.kind === 'rig'
    ? b.kind === 'rig' && sameTarget(a.target, b.target)
    : b.kind === 'source-instance' && a.sourceInstanceId === b.sourceInstanceId;
}

export class RigViewportController {
  readonly scene = new THREE.Scene();
  private readonly renderer: THREE.WebGLRenderer;
  private readonly perspective: THREE.PerspectiveCamera;
  private readonly orthographic: THREE.OrthographicCamera;
  private camera: THREE.Camera;
  private readonly orbit: OrbitControls;
  private readonly transform: TransformControls;
  private readonly root = new THREE.Group();
  private readonly sourceRoot = new THREE.Group();
  private readonly sourceSelectionRoot = new THREE.Group();
  private readonly boundRepresentationRoot = new THREE.Group();
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly selectable = new Map<THREE.Object3D, TransformTarget>();
  private selectedTarget: TransformTarget | null = null;
  private sourcePlacement: SourcePlacementView | null = null;
  private readonly selectedProxy = new THREE.Object3D();
  private readonly targetWorldPoses = new Map<RigId, RigidPose>();
  private resizeObserver: ResizeObserver;
  private animationFrame = 0;
  private callbacks: ViewportCallbacks;
  private transformDragActive = false;
  private transformCancelRequested = false;
  private transformDragSubject: TransformSubject | null = null;
  private sourceSelectionPose: RigidPose | null = null;
  private boundRepresentationPose: RigidPose | null = null;
  private boundRepresentationTarget: THREE.Object3D | null = null;
  private rigVisible = true;
  private sourceGeometryVisible = true;
  private sourceDatumVisible = true;
  private boundRepresentationVisible = true;
  private sourceLoadGeneration = 0;
  private boundLoadGeneration = 0;
  private orthographicHalfHeight = 1.05;

  constructor(private readonly host: HTMLElement, callbacks: ViewportCallbacks) {
    this.callbacks = callbacks;
    this.scene.background = new THREE.Color(0x111418);
    this.perspective = new THREE.PerspectiveCamera(46, 1, 0.01, 1000);
    this.perspective.position.set(1.7, 1.25, 2.0);
    this.orthographic = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 1000);
    this.orthographic.position.set(0, 0, 5);
    this.camera = this.perspective;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(this.renderer.domElement);
    this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbit.enableDamping = true;
    this.orbit.dampingFactor = 0.08;
    this.orbit.target.set(0.25, 0.15, 0);
    this.transform = new TransformControls(this.camera, this.renderer.domElement);
    this.transform.setMode('translate');
    this.transform.setSpace('world');
    this.transform.setSize(0.85);
    this.scene.add(this.transform.getHelper());
    this.scene.add(this.selectedProxy, this.root, this.sourceRoot, this.sourceSelectionRoot, this.boundRepresentationRoot);

    const grid = new THREE.GridHelper(6, 60, 0x3f4852, 0x262d34);
    grid.position.y = -0.35;
    this.scene.add(grid);
    const axes = new THREE.AxesHelper(0.35);
    this.scene.add(axes);
    this.scene.add(new THREE.HemisphereLight(0xdbe7ff, 0x23282f, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(3, 5, 4);
    this.scene.add(key);

    this.transform.addEventListener('mouseDown', () => {
      const subject = this.currentTransformSubject();
      if (!subject) return;
      this.transformDragSubject = subject;
      this.transformDragActive = true;
      this.transformCancelRequested = false;
      this.orbit.enabled = false;
      if (subject.kind === 'rig') this.callbacks.onTransformStart(subject.target);
      else this.callbacks.onSourceTransformStart?.(subject.sourceInstanceId);
    });
    this.transform.addEventListener('objectChange', () => {
      if (!this.transformDragActive || this.transformCancelRequested || !this.transformDragSubject) return;
      const subject = this.transformDragSubject;
      if (subject.kind === 'rig') this.callbacks.onTransformPreview(subject.target, this.readProxyPose());
      else this.callbacks.onSourceTransformPreview?.(subject.sourceInstanceId, this.readProxyPose());
    });
    this.transform.addEventListener('dragging-changed', (event) => {
      const dragging = Boolean((event as { value?: boolean }).value);
      this.orbit.enabled = !dragging;
    });
    this.transform.addEventListener('mouseUp', () => {
      this.orbit.enabled = true;
      const subject = this.transformDragSubject;
      if (!this.transformDragActive || this.transformCancelRequested || !subject) {
        this.resetDragState();
        return;
      }
      if (subject.kind === 'rig') this.callbacks.onTransformCommit(subject.target);
      else this.callbacks.onSourceTransformCommit?.(subject.sourceInstanceId);
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

  setCallbacks(callbacks: ViewportCallbacks): void { this.callbacks = callbacks; }

  setTransformSpace(space: 'world' | 'local'): void { this.transform.setSpace(space); }
  setTransformMode(mode: 'translate' | 'rotate'): void { this.transform.setMode(mode); }

  setRigVisible(visible: boolean): void {
    if (!visible && this.transformDragSubject?.kind === 'rig') this.cancelActiveTransform();
    this.rigVisible = visible;
    this.root.visible = visible;
    this.syncTransformProxy();
  }

  setSourceGeometryVisible(visible: boolean): void {
    if (!visible && this.transformDragSubject?.kind === 'source-instance') this.cancelActiveTransform();
    this.sourceGeometryVisible = visible;
    this.sourceRoot.visible = visible;
    this.syncTransformProxy();
  }

  setSourcePlacement(placement: SourcePlacementView | null): void {
    const before = this.currentTransformSubject();
    const after: TransformSubject | null = placement?.editActive
      ? { kind: 'source-instance', sourceInstanceId: placement.sourceInstanceId }
      : (this.rigVisible && this.selectedTarget ? { kind: 'rig', target: this.selectedTarget } : null);
    if (this.transformDragActive && !sameSubject(before, after)) this.cancelActiveTransform();
    this.sourcePlacement = placement;
    if (placement) this.applyPose(this.sourceRoot, placement.pose);
    else {
      this.sourceRoot.position.set(0, 0, 0);
      this.sourceRoot.quaternion.identity();
    }
    this.syncTransformProxy();
  }

  setSourceDatumVisible(visible: boolean): void {
    this.sourceDatumVisible = visible;
    this.sourceSelectionRoot.visible = visible;
  }

  setBoundRepresentationVisible(visible: boolean): void {
    this.boundRepresentationVisible = visible;
    this.boundRepresentationRoot.visible = visible;
  }

  setBoundRepresentationPose(pose: RigidPose | null): void {
    this.boundRepresentationPose = pose;
    this.applyBoundRepresentationPose();
  }

  setSourceSelection(pose: RigidPose | null): void {
    this.sourceSelectionPose = pose;
    this.disposeChildren(this.sourceSelectionRoot);
    this.sourceSelectionRoot.visible = this.sourceDatumVisible;
    if (!pose) return;

    this.applyPose(this.sourceSelectionRoot, pose);
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 18, 14),
      new THREE.MeshBasicMaterial({ color: 0xff6bd6, depthTest: false, transparent: true, opacity: 0.95 }),
    );
    marker.renderOrder = 20;
    this.sourceSelectionRoot.add(marker);
    const axes = new THREE.AxesHelper(0.24);
    const axesMaterial = axes.material;
    if (Array.isArray(axesMaterial)) axesMaterial.forEach((material) => { material.depthTest = false; });
    else axesMaterial.depthTest = false;
    axes.renderOrder = 19;
    this.sourceSelectionRoot.add(axes);
  }

  fitView(target: ViewFitTarget): void {
    if (target === 'source-selection') {
      if (this.sourceDatumVisible && this.sourceSelectionPose) this.focusPoint(this.sourceSelectionPose.position);
      return;
    }

    const box = new THREE.Box3();
    if (target === 'rig' || target === 'all') {
      if (this.rigVisible) box.expandByObject(this.root);
      if (this.boundRepresentationVisible && this.boundRepresentationRoot.children.length > 0) box.expandByObject(this.boundRepresentationRoot);
    }
    if ((target === 'source' || target === 'all') && this.sourceGeometryVisible) box.expandByObject(this.sourceRoot);
    if (box.isEmpty()) return;

    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const radius = Math.max(sphere.radius, 0.05);
    const center = sphere.center;
    const direction = this.camera.position.clone().sub(this.orbit.target);
    if (direction.lengthSq() < 1e-12) direction.set(1, 0.75, 1);
    direction.normalize();

    if (this.camera === this.perspective) {
      const verticalFov = THREE.MathUtils.degToRad(this.perspective.fov);
      const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * Math.max(this.perspective.aspect, 1e-6));
      const limitingFov = Math.min(verticalFov, horizontalFov);
      const distance = Math.max(radius / Math.sin(limitingFov / 2) * 1.15, 0.25);
      this.camera.position.copy(center).addScaledVector(direction, distance);
    } else {
      const aspect = Math.max(this.host.clientWidth / Math.max(this.host.clientHeight, 1), 1e-6);
      this.orthographicHalfHeight = Math.max(radius * 1.2, radius * 1.2 / aspect, 0.1);
      const currentDistance = Math.max(this.camera.position.distanceTo(this.orbit.target), radius * 4, 1);
      this.camera.position.copy(center).addScaledVector(direction, currentDistance);
      this.resize();
    }

    this.orbit.target.copy(center);
    this.camera.lookAt(center);
    this.orbit.update();
  }

  setCameraPreset(preset: CameraPreset): void {
    const target = this.orbit.target.clone();
    if (preset === 'perspective') {
      this.camera = this.perspective;
      this.perspective.position.set(target.x + 1.7, target.y + 1.25, target.z + 2.0);
    } else {
      this.camera = this.orthographic;
      const distance = 5;
      if (preset === 'front') this.orthographic.position.set(target.x, target.y, target.z + distance);
      if (preset === 'top') this.orthographic.position.set(target.x, target.y + distance, target.z);
      if (preset === 'side') this.orthographic.position.set(target.x + distance, target.y, target.z);
      this.orthographic.up.set(0, preset === 'top' ? 0 : 1, preset === 'top' ? -1 : 0);
      this.orthographic.lookAt(target);
    }
    this.orbit.object = this.camera;
    this.transform.camera = this.camera;
    this.resize();
  }

  setDisplayModel(model: RigDisplayModel, selectedTarget: TransformTarget | null): void {
    if (this.transformDragActive && this.transformDragSubject?.kind === 'rig' && !sameTarget(this.transformDragSubject.target, selectedTarget)) {
      this.cancelActiveTransform();
    }

    this.disposeChildren(this.root);
    this.selectable.clear();
    this.targetWorldPoses.clear();
    for (const item of model.items) {
      if (item.kind === 'element') {
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.34, 0.12, 0.18),
          new THREE.MeshStandardMaterial({ color: item.selected ? 0x85b6ff : 0x697784, roughness: 0.55, metalness: 0.15 }),
        );
        this.applyPose(mesh, item.pose);
        mesh.userData.displayId = item.id;
        this.root.add(mesh);
        this.selectable.set(mesh, { kind: 'element', id: item.id });
        this.targetWorldPoses.set(item.id, item.pose);
      } else if (item.kind === 'frame') {
        const group = new THREE.Group();
        this.applyPose(group, item.pose);
        const marker = new THREE.Mesh(
          new THREE.SphereGeometry(item.selected ? 0.038 : 0.027, 16, 12),
          new THREE.MeshBasicMaterial({ color: item.selected ? 0xffc857 : 0x7dd3fc, depthTest: false }),
        );
        marker.renderOrder = 10;
        group.add(marker);
        const axes = new THREE.AxesHelper(item.selected ? 0.20 : 0.11);
        axes.renderOrder = 9;
        group.add(axes);
        this.root.add(group);
        this.selectable.set(marker, { kind: 'frame', id: item.id });
        this.targetWorldPoses.set(item.id, item.pose);
      } else {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...item.from),
          new THREE.Vector3(...item.to),
        ]);
        const color = item.severity === 'warning' ? 0xff705d : 0x55d18a;
        this.root.add(new THREE.Line(geometry, new THREE.LineBasicMaterial({ color })));
      }
    }
    this.selectedTarget = selectedTarget;
    this.syncTransformProxy();
  }

  async showSourceAsset(objectUrl: string): Promise<void> {
    const generation = ++this.sourceLoadGeneration;
    this.disposeChildren(this.sourceRoot);
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(objectUrl).catch((error: unknown) => {
      if (generation !== this.sourceLoadGeneration) return null;
      throw error;
    });
    if (!gltf) return;

    if (generation !== this.sourceLoadGeneration) {
      this.disposeObjectTree(gltf.scene);
      return;
    }

    gltf.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const material = new THREE.MeshStandardMaterial({ color: 0x728191, transparent: true, opacity: 0.34, depthWrite: false, roughness: 0.7 });
        object.material = material;
      }
    });
    this.sourceRoot.add(gltf.scene);
  }

  clearSourceAsset(): void {
    this.sourceLoadGeneration += 1;
    this.disposeChildren(this.sourceRoot);
  }

  async showBoundRepresentation(objectUrl: string, sourceNodeIndex: number): Promise<void> {
    const generation = ++this.boundLoadGeneration;
    this.disposeChildren(this.boundRepresentationRoot);
    this.boundRepresentationTarget = null;

    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(objectUrl).catch((error: unknown) => {
      if (generation !== this.boundLoadGeneration) return null;
      throw error;
    });
    if (!gltf) return;

    if (generation !== this.boundLoadGeneration) {
      this.disposeObjectTree(gltf.scene);
      return;
    }

    const parser = gltf.parser as unknown as { associations?: Map<unknown, { nodes?: number }> };
    const associations = parser.associations;
    let target: THREE.Object3D | null = null;
    if (associations) {
      for (const [object, mapping] of associations) {
        if (object instanceof THREE.Object3D && mapping?.nodes === sourceNodeIndex) {
          target = object;
          break;
        }
      }
    }

    if (!target) {
      this.disposeObjectTree(gltf.scene);
      throw new Error(`Rendered SOURCE node gltf2.node:${sourceNodeIndex} was not found in GLTFLoader associations.`);
    }

    gltf.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const material = new THREE.MeshStandardMaterial({
          color: 0x69aee8,
          transparent: true,
          opacity: 0.62,
          depthWrite: false,
          roughness: 0.58,
          metalness: 0.08,
        });
        object.material = material;
        object.renderOrder = 4;
      }
    });

    this.boundRepresentationTarget = target;
    this.boundRepresentationRoot.visible = this.boundRepresentationVisible;
    this.boundRepresentationRoot.add(gltf.scene);
    gltf.scene.updateMatrixWorld(true);
    this.applyBoundRepresentationPose();
  }

  clearBoundRepresentation(): void {
    this.boundLoadGeneration += 1;
    this.boundRepresentationTarget = null;
    this.disposeChildren(this.boundRepresentationRoot);
  }

  dispose(): void {
    this.sourceLoadGeneration += 1;
    this.boundLoadGeneration += 1;
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
    this.disposeChildren(this.root);
    this.disposeChildren(this.sourceRoot);
    this.disposeChildren(this.sourceSelectionRoot);
    this.disposeChildren(this.boundRepresentationRoot);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private focusPoint(point: { x: number; y: number; z: number }): void {
    const nextTarget = new THREE.Vector3(point.x, point.y, point.z);
    const delta = nextTarget.clone().sub(this.orbit.target);
    this.camera.position.add(delta);
    this.orbit.target.copy(nextTarget);
    this.camera.lookAt(nextTarget);
    this.orbit.update();
  }

  private currentTransformSubject(): TransformSubject | null {
    if (this.sourcePlacement?.editActive && this.sourceGeometryVisible) {
      return { kind: 'source-instance', sourceInstanceId: this.sourcePlacement.sourceInstanceId };
    }
    if (!this.rigVisible || !this.selectedTarget) return null;
    return this.targetWorldPoses.has(this.selectedTarget.id) ? { kind: 'rig', target: this.selectedTarget } : null;
  }

  private syncTransformProxy(): void {
    const subject = this.currentTransformSubject();
    if (!subject) { this.transform.detach(); return; }
    const pose = subject.kind === 'rig'
      ? this.targetWorldPoses.get(subject.target.id) ?? null
      : this.sourcePlacement?.pose ?? null;
    if (!pose) { this.transform.detach(); return; }
    this.applyPose(this.selectedProxy, pose);
    this.transform.attach(this.selectedProxy);
  }

  private readProxyPose(): RigidPose {
    return {
      position: { x: this.selectedProxy.position.x, y: this.selectedProxy.position.y, z: this.selectedProxy.position.z },
      rotation: { x: this.selectedProxy.quaternion.x, y: this.selectedProxy.quaternion.y, z: this.selectedProxy.quaternion.z, w: this.selectedProxy.quaternion.w },
    };
  }

  private applyPose(object: THREE.Object3D, pose: RigidPose): void {
    object.position.set(pose.position.x, pose.position.y, pose.position.z);
    object.quaternion.set(pose.rotation.x, pose.rotation.y, pose.rotation.z, pose.rotation.w);
  }

  private applyBoundRepresentationPose(): void {
    if (!this.boundRepresentationTarget || !this.boundRepresentationPose) return;
    const target = this.boundRepresentationTarget;
    const parent = target.parent;
    const desiredWorld = new THREE.Matrix4().compose(
      new THREE.Vector3(
        this.boundRepresentationPose.position.x,
        this.boundRepresentationPose.position.y,
        this.boundRepresentationPose.position.z,
      ),
      new THREE.Quaternion(
        this.boundRepresentationPose.rotation.x,
        this.boundRepresentationPose.rotation.y,
        this.boundRepresentationPose.rotation.z,
        this.boundRepresentationPose.rotation.w,
      ).normalize(),
      new THREE.Vector3(1, 1, 1),
    );

    if (parent) {
      parent.updateWorldMatrix(true, false);
      const local = new THREE.Matrix4().copy(parent.matrixWorld).invert().multiply(desiredWorld);
      local.decompose(target.position, target.quaternion, target.scale);
    } else {
      desiredWorld.decompose(target.position, target.quaternion, target.scale);
    }
    target.updateMatrix();
    target.updateWorldMatrix(false, true);
  }

  private cancelActiveTransform(): void {
    if (!this.transformDragActive || !this.transformDragSubject) return;
    const subject = this.transformDragSubject;
    this.transformCancelRequested = true;
    this.transform.reset();
    if (subject.kind === 'rig') this.callbacks.onTransformCancel(subject.target);
    else this.callbacks.onSourceTransformCancel?.(subject.sourceInstanceId);
    this.transform.pointerUp(null);
    this.orbit.enabled = true;
  }

  private resetDragState(): void {
    this.transformDragActive = false;
    this.transformCancelRequested = false;
    this.transformDragSubject = null;
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (!this.rigVisible || this.transform.dragging || this.transform.axis !== null) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects([...this.selectable.keys()], false);
    this.callbacks.onSelect(hits.length > 0 ? this.selectable.get(hits[0].object) ?? null : null);
  };

  private onPointerCancel = (): void => { this.cancelActiveTransform(); };

  private onWindowKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') this.cancelActiveTransform();
  };

  private onWindowBlur = (): void => { this.cancelActiveTransform(); };

  private resize(): void {
    const width = Math.max(1, this.host.clientWidth);
    const height = Math.max(1, this.host.clientHeight);
    this.renderer.setSize(width, height, false);
    this.perspective.aspect = width / height;
    this.perspective.updateProjectionMatrix();
    const scale = this.orthographicHalfHeight;
    this.orthographic.left = -scale * (width / height);
    this.orthographic.right = scale * (width / height);
    this.orthographic.top = scale;
    this.orthographic.bottom = -scale;
    this.orthographic.updateProjectionMatrix();
  }

  private animate = (): void => {
    this.animationFrame = requestAnimationFrame(this.animate);
    this.orbit.update();
    this.renderer.render(this.scene, this.camera);
  }

  private disposeObjectTree(root: THREE.Object3D): void {
    root.traverse((object) => {
      const maybe = object as THREE.Mesh;
      maybe.geometry?.dispose?.();
      const material = maybe.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
      else material?.dispose?.();
    });
  }

  private disposeChildren(root: THREE.Object3D): void {
    while (root.children.length > 0) {
      const child = root.children.pop()!;
      this.disposeObjectTree(child);
    }
  }
}
