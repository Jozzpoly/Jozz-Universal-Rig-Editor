import { inspectGltfSource } from '../source/gltf-source-index.js';
import type { SourceInspection } from '../source/types.js';
import { sha256Hex } from './hash.js';

interface PickerWindow extends Window {
  showOpenFilePicker?: (options?: unknown) => Promise<FileSystemFileHandle[]>;
}

export interface OpenSourceAsset {
  name: string;
  sha256: string;
  bytes: ArrayBuffer;
  objectUrl: string;
  inspection: SourceInspection;
}

export async function openSourceAsset(): Promise<OpenSourceAsset> {
  const picker = (window as PickerWindow).showOpenFilePicker;
  if (!picker) throw new Error('This browser does not support local source asset opening. Use current Chrome or Edge.');
  const [handle] = await picker({
    types: [{ description: 'glTF / GLB source', accept: { 'model/gltf+json': ['.gltf'], 'model/gltf-binary': ['.glb'] } }],
    multiple: false,
  });
  const file = await handle.getFile();
  const bytes = await file.arrayBuffer();
  const inspection = inspectGltfSource(bytes);
  return { name: file.name, sha256: await sha256Hex(bytes), bytes, objectUrl: URL.createObjectURL(file), inspection };
}
