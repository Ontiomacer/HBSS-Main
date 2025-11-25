// Educational Hamming(12,8)-like encode/decode and simple QKD check

export function encodeMessage(text: string): Uint8Array {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  // each input byte -> 12-bit code stored in 2 bytes (little-endian)
  const out = new Uint8Array(bytes.length * 2);
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    const code = hamming12EncodeByte(b);
    out[i * 2] = code & 0xff;
    out[i * 2 + 1] = (code >> 8) & 0xff;
  }
  return out;
}

export function simulateNoise(encoded: Uint8Array, p = 0.01): Uint8Array {
  const out = new Uint8Array(encoded.length);
  for (let i = 0; i < encoded.length; i++) {
    let byte = encoded[i];
    let mask = 0;
    for (let bit = 0; bit < 8; bit++) {
      if (Math.random() < p) mask |= 1 << bit;
    }
    out[i] = byte ^ mask;
  }
  return out;
}

export function decodeMessage(encoded: Uint8Array): { text: string; corrected: number; uncorrectable: number } {
  const bytes: number[] = [];
  let corrected = 0;
  let uncorrectable = 0;
  for (let i = 0; i + 1 < encoded.length; i += 2) {
    const low = encoded[i];
    const high = encoded[i + 1];
    const word = ((high << 8) | low) & 0xfff;
    const res = hamming12DecodeWord(word);
    if (res.corrected) corrected++;
    if (res.uncorrectable) uncorrectable++;
    bytes.push(res.byte);
  }
  let text = '';
  try {
    text = new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    text = bytes.map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '?')).join('');
  }
  return { text, corrected, uncorrectable };
}

export function qkdCheck(orig: Uint8Array, received: Uint8Array): { qber: number; ok: boolean } {
  // compute bit error rate between two encoded buffers
  const len = Math.min(orig.length, received.length);
  let bitErrors = 0;
  let totalBits = len * 8;
  for (let i = 0; i < len; i++) {
    const v = orig[i] ^ received[i];
    bitErrors += popcount8(v);
  }
  const qber = totalBits === 0 ? 0 : bitErrors / totalBits;
  // detect eavesdrop if QBER > threshold (educational)
  const ok = qber <= 0.05;
  return { qber, ok };
}

/* internal helpers */

function popcount8(x: number) {
  x = x & 0xff;
  let c = 0;
  while (x) {
    c += x & 1;
    x >>= 1;
  }
  return c;
}

/** Hamming helper functions (same as earlier Hamming(12,8)) */
function hamming12EncodeByte(b: number): number {
  const d = new Array(9).fill(0);
  for (let i = 1; i <= 8; i++) d[i] = (b >> (i - 1)) & 1;
  const pos = new Array(13).fill(0);
  pos[3] = d[1];
  pos[5] = d[2];
  pos[6] = d[3];
  pos[7] = d[4];
  pos[9] = d[5];
  pos[10] = d[6];
  pos[11] = d[7];
  pos[12] = d[8];
  const p1 = pos[3] ^ pos[5] ^ pos[7] ^ pos[9] ^ pos[11];
  const p2 = pos[3] ^ pos[6] ^ pos[7] ^ pos[10] ^ pos[11];
  const p4 = pos[5] ^ pos[6] ^ pos[7] ^ pos[12];
  const p8 = pos[9] ^ pos[10] ^ pos[11] ^ pos[12];
  pos[1] = p1; pos[2] = p2; pos[4] = p4; pos[8] = p8;
  let code = 0;
  for (let i = 1; i <= 12; i++) code |= (pos[i] & 1) << (i - 1);
  return code & 0xfff;
}

function hamming12DecodeWord(code12: number): { byte: number; corrected: boolean; uncorrectable: boolean } {
  const pos = new Array(13).fill(0);
  for (let i = 1; i <= 12; i++) pos[i] = (code12 >> (i - 1)) & 1;
  const s1 = pos[1] ^ pos[3] ^ pos[5] ^ pos[7] ^ pos[9] ^ pos[11];
  const s2 = pos[2] ^ pos[3] ^ pos[6] ^ pos[7] ^ pos[10] ^ pos[11];
  const s4 = pos[4] ^ pos[5] ^ pos[6] ^ pos[7] ^ pos[12];
  const s8 = pos[8] ^ pos[9] ^ pos[10] ^ pos[11] ^ pos[12];
  const syndrome = (s8 << 3) | (s4 << 2) | (s2 << 1) | s1;
  let corrected = false;
  let uncorrectable = false;
  if (syndrome !== 0) {
    if (syndrome >= 1 && syndrome <= 12) {
      pos[syndrome] = pos[syndrome] ^ 1;
      corrected = true;
    } else {
      uncorrectable = true;
    }
  }
  const check1 = pos[1] ^ pos[3] ^ pos[5] ^ pos[7] ^ pos[9] ^ pos[11];
  const check2 = pos[2] ^ pos[3] ^ pos[6] ^ pos[7] ^ pos[10] ^ pos[11];
  const check4 = pos[4] ^ pos[5] ^ pos[6] ^ pos[7] ^ pos[12];
  const check8 = pos[8] ^ pos[9] ^ pos[10] ^ pos[11] ^ pos[12];
  if ((check1 | check2 | check4 | check8) !== 0) uncorrectable = true;
  const dataPositions = [3,5,6,7,9,10,11,12];
  let outByte = 0;
  for (let i = 0; i < 8; i++) outByte |= (pos[dataPositions[i]] & 1) << i;
  return { byte: outByte & 0xff, corrected, uncorrectable };
}
