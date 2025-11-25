// Educational/demo-only Hamming(12,8) helpers and a simple QKD simulation.
// Not production cryptography.

export type DecodeResult = {
	decoded: string;
	correctedCount: number;
	uncorrectableCount: number;
};

/** Encode one byte using Hamming(12,8). Returns 12-bit number (0..0xFFF). */
function hamming12EncodeByte(b: number): number {
	// data bits d1..d8 = bits 0..7 of b
	const d = new Array(9).fill(0); // 1-based
	for (let i = 1; i <= 8; i++) d[i] = (b >> (i - 1)) & 1;

	// positions 1..12: p1 p2 d1 p4 d2 d3 d4 p8 d5 d6 d7 d8
	const pos = new Array(13).fill(0);
	pos[3] = d[1];
	pos[5] = d[2];
	pos[6] = d[3];
	pos[7] = d[4];
	pos[9] = d[5];
	pos[10] = d[6];
	pos[11] = d[7];
	pos[12] = d[8];

	// parity bits
	const p1 = pos[3] ^ pos[5] ^ pos[7] ^ pos[9] ^ pos[11];
	const p2 = pos[3] ^ pos[6] ^ pos[7] ^ pos[10] ^ pos[11];
	const p4 = pos[5] ^ pos[6] ^ pos[7] ^ pos[12];
	const p8 = pos[9] ^ pos[10] ^ pos[11] ^ pos[12];

	pos[1] = p1;
	pos[2] = p2;
	pos[4] = p4;
	pos[8] = p8;

	// pack into 12-bit integer (positions 1 is LSB or MSB? choose pos1 as bit0)
	let code = 0;
	for (let i = 1; i <= 12; i++) {
		code |= (pos[i] & 1) << (i - 1);
	}
	return code & 0xfff;
}

/** Decode one 12-bit Hamming code -> returns {byte, corrected:boolean, uncorrectable:boolean} */
function hamming12DecodeWord(code12: number): { byte: number; corrected: boolean; uncorrectable: boolean } {
	// extract pos 1..12
	const pos = new Array(13).fill(0);
	for (let i = 1; i <= 12; i++) pos[i] = (code12 >> (i - 1)) & 1;

	// compute syndrome bits
	const s1 = pos[1] ^ pos[3] ^ pos[5] ^ pos[7] ^ pos[9] ^ pos[11];
	const s2 = pos[2] ^ pos[3] ^ pos[6] ^ pos[7] ^ pos[10] ^ pos[11];
	const s4 = pos[4] ^ pos[5] ^ pos[6] ^ pos[7] ^ pos[12];
	const s8 = pos[8] ^ pos[9] ^ pos[10] ^ pos[11] ^ pos[12];

	const syndrome = (s8 << 3) | (s4 << 2) | (s2 << 1) | s1; // 0..15

	let corrected = false;
	let uncorrectable = false;
	let correctedPos = syndrome;

	if (syndrome !== 0) {
		// single-bit error correction if syndrome in 1..12
		if (syndrome >= 1 && syndrome <= 12) {
			pos[syndrome] = pos[syndrome] ^ 1;
			corrected = true;
		} else {
			// syndrome points outside 1..12 => uncorrectable
			uncorrectable = true;
		}
	}

	// After possible correction, recompute parity to check consistency
	const check1 = pos[1] ^ pos[3] ^ pos[5] ^ pos[7] ^ pos[9] ^ pos[11];
	const check2 = pos[2] ^ pos[3] ^ pos[6] ^ pos[7] ^ pos[10] ^ pos[11];
	const check4 = pos[4] ^ pos[5] ^ pos[6] ^ pos[7] ^ pos[12];
	const check8 = pos[8] ^ pos[9] ^ pos[10] ^ pos[11] ^ pos[12];
	if ((check1 | check2 | check4 | check8) !== 0) {
		// still parity failure => uncorrectable
		uncorrectable = true;
	}

	// extract data bits positions 3,5,6,7,9,10,11,12 -> reconstruct byte (d1..d8)
	let outByte = 0;
	const dataPositions = [3, 5, 6, 7, 9, 10, 11, 12];
	for (let i = 0; i < 8; i++) {
		outByte |= (pos[dataPositions[i]] & 1) << i;
	}

	return { byte: outByte & 0xff, corrected, uncorrectable };
}

/** Encode a UTF-8 string into a Uint8Array of 16-bit words (each code stored as little-endian two bytes) */
export function encodeMessage(text: string): Uint8Array {
	const encoder = new TextEncoder();
	const data = encoder.encode(text); // bytes
	const out = new Uint8Array(data.length * 2);
	for (let i = 0; i < data.length; i++) {
		const code12 = hamming12EncodeByte(data[i]);
		// store as 2 bytes little-endian (16-bit container)
		out[i * 2] = code12 & 0xff;
		out[i * 2 + 1] = (code12 >> 8) & 0xff;
	}
	return out;
}

/** Flip bits randomly according to bitErrorRate (0..1) */
export function simulateNoise(encoded: Uint8Array, bitErrorRate = 0.01): Uint8Array {
	const out = new Uint8Array(encoded.length);
	// operate at bit level across the byte array
	for (let i = 0; i < encoded.length; i++) {
		let byte = encoded[i];
		let mask = 0;
		for (let b = 0; b < 8; b++) {
			if (Math.random() < bitErrorRate) mask |= 1 << b;
		}
		out[i] = byte ^ mask;
	}
	return out;
}

/** Decode Uint8Array produced by encodeMessage; returns decoded string and stats */
export function decodeMessage(encoded: Uint8Array): DecodeResult {
	const bytes = encoded;
	if (bytes.length % 2 !== 0) {
		// malformed length
		// attempt to ignore trailing byte
	}

	const correctedCountRef = { v: 0 };
	let uncorrectableCount = 0;
	const decodedBytes: number[] = [];

	for (let i = 0; i + 1 < bytes.length; i += 2) {
		const low = bytes[i];
		const high = bytes[i + 1];
		const code12 = ((high << 8) | low) & 0xfff;
		const { byte, corrected, uncorrectable } = hamming12DecodeWord(code12);
		if (corrected) correctedCountRef.v++;
		if (uncorrectable) uncorrectableCount++;
		decodedBytes.push(byte);
	}

	const decoder = new TextDecoder();
	let decoded = '';
	try {
		decoded = decoder.decode(new Uint8Array(decodedBytes));
	} catch {
		decoded = decodedBytes.map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '?')).join('');
	}

	return { decoded, correctedCount: correctedCountRef.v, uncorrectableCount };
}

/**
 * qkdRun - simple BB84-like simulation
 * - length: number of qubits simulated
 * - eavesdropProb: probability Eve intercepts and resends (introduces errors)
 * Returns summary: siftedKeyLength, qber, eavesdropDetected, sample bits
 */
export function qkdRun(length = 64, eavesdropProb = 0.0) {
	// Alice bits and bases
	const aliceBits: number[] = [];
	const aliceBases: number[] = []; // 0 or 1
	for (let i = 0; i < length; i++) {
		aliceBits.push(Math.random() < 0.5 ? 0 : 1);
		aliceBases.push(Math.random() < 0.5 ? 0 : 1);
	}

	// Eve may intercept some qubits: if intercepted, she measures in random basis and resends possibly flipped
	const transmittedBits: number[] = [];
	const transmittedBases: number[] = [];
	for (let i = 0; i < length; i++) {
		if (Math.random() < eavesdropProb) {
			// Eve intercepts: picks random basis -> measurement potentially disturbs
			const eveBasis = Math.random() < 0.5 ? 0 : 1;
			const measured = eveBasis === aliceBases[i] ? aliceBits[i] : Math.random() < 0.5 ? 0 : 1;
			// Eve resends measured bit in measured basis
			transmittedBits.push(measured);
			transmittedBases.push(eveBasis);
		} else {
			// no Eve, ideal channel (we can add small noise later)
			transmittedBits.push(aliceBits[i]);
			transmittedBases.push(aliceBases[i]);
		}
		// small channel noise 0.01
		if (Math.random() < 0.01) transmittedBits[i] = 1 - transmittedBits[i];
	}

	// Bob chooses random bases and measures transmitted bits according to his basis
	const bobBits: number[] = [];
	const bobBases: number[] = [];
	for (let i = 0; i < length; i++) {
		const bBasis = Math.random() < 0.5 ? 0 : 1;
		bobBases.push(bBasis);
		// if same basis as transmitted, he gets transmitted bit; else random
		if (bBasis === transmittedBases[i]) {
			bobBits.push(transmittedBits[i]);
		} else {
			bobBits.push(Math.random() < 0.5 ? 0 : 1);
		}
	}

	// Sifting: select positions where aliceBases === bobBases
	const siftedAlice: number[] = [];
	const siftedBob: number[] = [];
	for (let i = 0; i < length; i++) {
		if (aliceBases[i] === bobBases[i]) {
			siftedAlice.push(aliceBits[i]);
			siftedBob.push(bobBits[i]);
		}
	}

	// compute QBER on a sampled subset or full
	let mismatches = 0;
	for (let i = 0; i < siftedAlice.length; i++) {
		if (siftedAlice[i] !== siftedBob[i]) mismatches++;
	}
	const qber = siftedAlice.length === 0 ? 0 : mismatches / siftedAlice.length;
	const eavesdropDetected = qber > 0.05 || eavesdropProb > 0.05;

	return {
		length,
		siftedLen: siftedAlice.length,
		qber,
		eavesdropDetected,
		sampleAlice: siftedAlice.slice(0, 16),
		sampleBob: siftedBob.slice(0, 16),
	};
}
