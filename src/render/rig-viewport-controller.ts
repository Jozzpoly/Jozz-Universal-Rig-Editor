import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { RigDisplayModel } from '../display/types.js';
import type { TransformTarget } from '../editor/transform-target.js';
import type { RigidPose, RigId } from '../kernel/types.js';

export type CameraPreset = 'perspective' | 'front' | 'top' | 'side';

export interface ViewportCallbacks {
  onSelect(target: TransformTarget | null): void;
  onTransformStart(target: TransformTarget): void;
  onTransformPreview(target: TransformTarget, worldPose: RigidPose): void;
  onTransformCommit(target: TransformTarget): void;
  onTransformCancel(target: TransformTarget): void;
}

function sameTarget(a: TransformTarget | null, b: TransformTarget | null): boolean {
  return a?.kind === b?.kind && a?.id === b?.id;
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
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly selectable = new Map<THREE.Object3D, TransformTarget>();
  private selectedTarget: TransformTarget | null = null;
  private readonly selectedProxy = new THREE.Object3D();
  private readonly targetWorldPoses = new Map<RigId, RigidPose>();
  private resizeObserver: ResizeObserver;
  private animationFrame = 0;
  private callbacks: ViewportCallbacks;
  private transformDragActive = false;
  private transformCancelRequested = false;

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
    this.scene.add(this.selectedProxy, this.root, this.sourceRoot);

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
      if (!this.selectedTarget) return;
      if (!this.targetWorldPoses.has(this.selectedTarget.id)) return;
      this.transformDragActive = true;
      this.transformCancelRequested = false;
      this.orbit.enabled = false;
      this.callbacks.onTransformStart(this.selectedTarget);
    });
    this.transform.addEventListener('objectChange', () => {
      if (!this.transformDragActive || this.transformCancelRequested || !this.selectedTarget) return;
      this.callbacks.onTransformPreview(this.selectedTarget, this.readProxyPose());
    });
    this.transform.addEventListener('dragging-changed', (event) => {
      const dragging = Boolean((event as { value?: boolean }).value);
      this.orbit.enabled = !dragging;
    });
    this.transform.addEventListener('mouseUp', () => {
      this.orbit.enabled = true;
      const target = this.selectedTarget;
      if (!this.transformDragActive || this.transformCancelRequested || !target) {
        this.resetDragState();
        return;
      }
      this.callbacks.onTransformCommit(target);
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
    if (this.transformDragActive && !sameTarget(this.selectedTarget, selectedTarget)) {
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
    this.disposeChildren(this.sourceRoot);
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(objectUrl);
    gltf.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const material = new THREE.MeshStandardMaterial({ color: 0x728191, transparent: true, opacity: 0.34, depthWrite: false, roughness: 0.7 });
        object.material = material;
      }
    });
    this.sourceRoot.add(gltf.scene);
  }

  clearSourceAsset(): void { this.disposeChildren(this.sourceRoot); }

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
    this.disposeChildren(this.root);
    this.disposeChildren(this.sourceRoot);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private syncTransformProxy(): void {
    if (!this.selectedTarget) { this.transform.detach(); return; }
    const pose = this.targetWorldPoses.get(this.selectedTarget.id);
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

  private cancelActiveTransform(): void {
    if (!this.transformDragActive || !this.selectedTarget) return;
    const target = this.selectedTarget;
    this.transformCancelRequested = true;
    this.transform.reset();
    this.callbacks.onTransformCancel(target);
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
    const scale = 1.05;
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
  };

  private disposeChildren(root: THREE.Object3D): void {
    while (root.children.length > 0) {
      const child = root.children.pop()!;
      child.traverse((object) => {
        const maybe = object as THREE.Mesh;
        maybe.geometry?.dispose?.();
        const material = maybe.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
        else material?.dispose?.();
      });
    }
  }
}
