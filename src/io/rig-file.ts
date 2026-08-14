import { parseRigDocument, serializeRigDocument } from '../kernel/serialize.js';
import type { RigDocument } from '../kernel/types.js';
import { sha256Hex } from './hash.js';

interface PickerWindow extends Window {
  showOpenFilePicker?: (options?: unknown) => Promise<FileSystemFileHandle[]>;
  showSaveFilePicker?: (options?: unknown) => Promise<FileSystemFileHandle>;
}

export interface OpenRigFile {
  handle: FileSystemFileHandle;
  baselineHash: string;
  document: RigDocument;
  name: string;
}

export async function openRigFile(): Promise<OpenRigFile> {
  const picker = (window as PickerWindow).showOpenFilePicker;
  if (!picker) throw new Error('This browser does not support the File System Access API. Use current Chrome or Edge.');
  const [handle] = await picker({ types: [{ description: 'RigDocument JSON', accept: { 'application/json': ['.json'] } }], multiple: false });
  const file = await handle.getFile();
  const text = await file.text();
  return { handle, baselineHash: await sha256Hex(text), document: parseRigDocument(text), name: file.name };
}

export async function saveRigFile(handle: FileSystemFileHandle, expectedBaselineHash: string, document: RigDocument): Promise<string> {
  const currentFile = await handle.getFile();
  const currentText = await currentFile.text();
  const currentHash = await sha256Hex(currentText);
  if (currentHash !== expectedBaselineHash) throw new Error('Save blocked: the file changed outside this Workbench session. Reopen or Save As instead of overwriting it.');
  const nextText = serializeRigDocument(document);
  const writable = await handle.createWritable();
  await writable.write(nextText);
  await writable.close();
  return sha256Hex(nextText);
}

export async function saveRigFileAs(document: RigDocument): Promise<{ handle: FileSystemFileHandle; baselineHash: string; name: string }> {
  const picker = (window as PickerWindow).showSaveFilePicker;
  if (!picker) throw new Error('This browser does not support the File System Access API. Use current Chrome or Edge.');
  const handle = await picker({ suggestedName: 'rig.json', types: [{ description: 'RigDocument JSON', accept: { 'application/json': ['.json'] } }] });
  const text = serializeRigDocument(document);
  const writable = await handle.createWritable();
  await writable.write(text);
  await writable.close();
  return { handle, baselineHash: await sha256Hex(text), name: (await handle.getFile()).name };
}
