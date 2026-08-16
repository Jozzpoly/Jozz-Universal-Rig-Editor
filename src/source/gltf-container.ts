const GLB_MAGIC = 0x46546c67;
const GLB_JSON_CHUNK = 0x4e4f534a;
const GLB_BIN_CHUNK = 0x004e4942;

export interface ParsedGltfContainer {
  document: Record<string, unknown>;
  internalBuffers: ReadonlyMap<number, Uint8Array>;
}

function objectRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error(`${label} must be an object.`);
  return value as Record<string, unknown>;
}

function parseJson(bytes: Uint8Array): Record<string, unknown> {
  const text = new TextDecoder().decode(bytes).replace(/\u0000+$/g, '').trimEnd();
  return objectRecord(JSON.parse(text) as unknown, 'glTF JSON root');
}

function decodeBase64(encoded: string, label: string): Uint8Array {
  let binary: string;
  try {
    binary = globalThis.atob(encoded);
  } catch {
    throw new Error(`${label} contains invalid base64.`);
  }
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function internalJsonBuffers(document: Record<string, unknown>): ReadonlyMap<number, Uint8Array> {
  const rawBuffers = document.buffers;
  if (rawBuffers === undefined) return new Map();
  if (!Array.isArray(rawBuffers)) throw new Error('glTF buffers must be an array.');
  const buffers = new Map<number, Uint8Array>();
  rawBuffers.forEach((raw, index) => {
    const buffer = objectRecord(raw, `buffers[${index}]`);
    const uri = buffer.uri;
    if (typeof uri !== 'string') return;
    const prefixes = [
      'data:application/octet-stream;base64,',
      'data:application/gltf-buffer;base64,',
    ];
    const prefix = prefixes.find((candidate) => uri.startsWith(candidate));
    if (!prefix) return;
    const bytes = decodeBase64(uri.slice(prefix.length), `buffers[${index}].uri`);
    const declaredLength = buffer.byteLength;
    if (typeof declaredLength === 'number' && Number.isInteger(declaredLength) && declaredLength >= 0 && bytes.byteLength < declaredLength) {
      throw new Error(`buffers[${index}] decoded bytes are shorter than declared byteLength.`);
    }
    buffers.set(index, bytes);
  });
  return buffers;
}

export function parseGltfContainer(bytes: ArrayBuffer): ParsedGltfContainer {
  const view = new DataView(bytes);
  if (bytes.byteLength >= 12 && view.getUint32(0, true) === GLB_MAGIC) {
    const version = view.getUint32(4, true);
    const declaredLength = view.getUint32(8, true);
    if (version !== 2) throw new Error(`Unsupported GLB version ${version}; expected 2.`);
    if (declaredLength > bytes.byteLength || declaredLength < 20) throw new Error('Invalid GLB length.');

    let offset = 12;
    let document: Record<string, unknown> | null = null;
    let binary: Uint8Array | null = null;
    while (offset + 8 <= declaredLength) {
      const chunkLength = view.getUint32(offset, true);
      const chunkType = view.getUint32(offset + 4, true);
      const start = offset + 8;
      const end = start + chunkLength;
      if (end > declaredLength) throw new Error('GLB chunk exceeds declared length.');
      if (chunkType === GLB_JSON_CHUNK) {
        if (document !== null) throw new Error('GLB contains more than one JSON chunk.');
        document = parseJson(new Uint8Array(bytes, start, chunkLength));
      } else if (chunkType === GLB_BIN_CHUNK && binary === null) {
        binary = new Uint8Array(bytes.slice(start, end));
      }
      offset = end;
    }
    if (document === null) throw new Error('GLB contains no JSON chunk.');
    const buffers = new Map<number, Uint8Array>();
    if (binary) buffers.set(0, binary);
    return { document, internalBuffers: buffers };
  }

  const document = parseJson(new Uint8Array(bytes));
  return { document, internalBuffers: internalJsonBuffers(document) };
}
