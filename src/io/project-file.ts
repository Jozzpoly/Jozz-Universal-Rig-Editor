import { parseJureProjectModel, serializeJureProjectModel } from '../project/serialize.js';
import type { JureProjectModel } from '../project/types.js';
import { sha256Hex } from './hash.js';

interface PickerWindow extends Window {
  showOpenFilePicker?: (options?: unknown) => Promise<FileSystemFileHandle[]>;
  showSaveFilePicker?: (options?: unknown) => Promise<FileSystemFileHandle>;
}

export interface OpenJureProjectFile {
  handle: FileSystemFileHandle;
  baselineHash: string;
  project: JureProjectModel;
  name: string;
}

export async function openJureProjectFile(): Promise<OpenJureProjectFile> {
  const picker = (window as PickerWindow).showOpenFilePicker;
  if (!picker) throw new Error('This browser does not support the File System Access API. Use current Chrome or Edge.');
  const [handle] = await picker({
    types: [{ description: 'JURE logical project JSON', accept: { 'application/json': ['.json'] } }],
    multiple: false,
  });
  const file = await handle.getFile();
  const text = await file.text();
  return {
    handle,
    baselineHash: await sha256Hex(text),
    project: parseJureProjectModel(text),
    name: file.name,
  };
}

export async function saveJureProjectFile(
  handle: FileSystemFileHandle,
  expectedBaselineHash: string,
  project: JureProjectModel,
): Promise<string> {
  const currentFile = await handle.getFile();
  const currentText = await currentFile.text();
  const currentHash = await sha256Hex(currentText);
  if (currentHash !== expectedBaselineHash) throw new Error('Save blocked: the project file changed outside this Workbench session. Reopen or Save As instead of overwriting it.');
  const nextText = serializeJureProjectModel(project);
  const writable = await handle.createWritable();
  await writable.write(nextText);
  await writable.close();
  return sha256Hex(nextText);
}

export async function saveJureProjectFileAs(
  project: JureProjectModel,
): Promise<{ handle: FileSystemFileHandle; baselineHash: string; name: string }> {
  const picker = (window as PickerWindow).showSaveFilePicker;
  if (!picker) throw new Error('This browser does not support the File System Access API. Use current Chrome or Edge.');
  const handle = await picker({
    suggestedName: 'jure-project.json',
    types: [{ description: 'JURE logical project JSON', accept: { 'application/json': ['.json'] } }],
  });
  const text = serializeJureProjectModel(project);
  const writable = await handle.createWritable();
  await writable.write(text);
  await writable.close();
  return { handle, baselineHash: await sha256Hex(text), name: (await handle.getFile()).name };
}
