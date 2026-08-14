export async function sha256Hex(data: ArrayBuffer | Uint8Array | string): Promise<string> {
  let bytes: Uint8Array;
  if (typeof data === 'string') bytes = new TextEncoder().encode(data);
  else if (data instanceof Uint8Array) bytes = data;
  else bytes = new Uint8Array(data);

  // TypeScript 7 correctly distinguishes ArrayBuffer from SharedArrayBuffer.
  // Web Crypto accepts BufferSource, so make the backing storage explicitly
  // ArrayBuffer instead of relying on the broader ArrayBufferLike generic.
  const input = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(input).set(bytes);

  const digest = await crypto.subtle.digest('SHA-256', input);
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join('');
}
