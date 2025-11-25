/**
 * Multi-Scheme Post-Quantum Signature Support
 * Includes HBSS, HBSS*, HBSS**, and simulated SPHINCS+
 */

import CryptoJS from 'crypto-js';
import { HBSSKeyPair, HBSSSignature, hbssKeygen, hbssSign, hbssVerify, hbssStarKeygen } from './HBSS';

export type SignatureScheme = 'HBSS' | 'HBSS*' | 'HBSS**' | 'SPHINCS+';

export interface SchemeMetrics {
  keygenTime: number;
  signTime: number;
  verifyTime: number;
  publicKeySize: number;
  privateKeySize: number;
  signatureSize: number;
  memoryFootprint: number;
  maxSignatures: number;
}

export interface SchemeComparison {
  scheme: SignatureScheme;
  stateless: boolean;
  postQuantum: boolean;
  keySize: string;
  sigSize: string;
  speed: 'Very Fast' | 'Fast' | 'Balanced' | 'Slow';
  securityLevel: number;
  description: string;
}

/**
 * HBSS** - Merkle-Enhanced Variant
 */
export interface HBSSStarStarKeyPair extends HBSSKeyPair {
  merkleTree: string[];
  merkleProofs: Map<number, string[]>;
}

export interface HBSSStarStarSignature extends HBSSSignature {
  merkleProof: string[];
}

/**
 * Generate HBSS** key pair with Merkle tree
 */
export async function hbssStarStarKeygen(m: number, n: number): Promise<HBSSStarStarKeyPair> {
  const baseKeys = await hbssKeygen(m, n);
  
  // Build full Merkle tree
  const merkleTree = buildFullMerkleTree(baseKeys.publicKey.commitments);
  
  // Precompute Merkle proofs for all leaves
  const merkleProofs = new Map<number, string[]>();
  for (let i = 0; i < baseKeys.publicKey.commitments.length; i++) {
    merkleProofs.set(i, getMerkleProof(merkleTree, i));
  }
  
  return {
    ...baseKeys,
    merkleTree,
    merkleProofs
  };
}

/**
 * Sign with HBSS** (includes Merkle proof)
 */
export async function hbssStarStarSign(
  message: string,
  keyPair: HBSSStarStarKeyPair
): Promise<HBSSStarStarSignature> {
  const baseSig = await hbssSign(message, keyPair.privateKey);
  
  // Get Merkle proof for first revealed index
  const merkleProof = keyPair.merkleProofs.get(baseSig.indices[0]) || [];
  
  return {
    ...baseSig,
    merkleProof
  };
}

/**
 * Verify HBSS** signature with Merkle proof
 */
export async function hbssStarStarVerify(
  message: string,
  signature: HBSSStarStarSignature,
  publicKey: HBSSKeyPair['publicKey']
): Promise<boolean> {
  // First verify base signature
  const baseValid = await hbssVerify(message, signature, publicKey);
  if (!baseValid) return false;
  
  // Verify Merkle proof
  return verifyMerkleProof(
    signature.revealedPreimages[0],
    signature.merkleProof,
    publicKey.commitmentRoot
  );
}

/**
 * Simulated SPHINCS+ (for comparison)
 */
export interface SPHINCSKeyPair {
  publicKey: { root: string; size: number };
  privateKey: { seed: string; size: number };
}

export interface SPHINCSSignature {
  signature: string;
  size: number;
}

export async function sphincsKeygen(): Promise<SPHINCSKeyPair> {
  const seed = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
  const root = CryptoJS.SHA512(seed + 'public').toString(CryptoJS.enc.Hex);
  
  return {
    publicKey: { root, size: 32 },
    privateKey: { seed, size: 64 }
  };
}

export async function sphincsSign(message: string, privateKey: SPHINCSKeyPair['privateKey']): Promise<SPHINCSSignature> {
  // Simulate SPHINCS+ signing (slower, larger signature)
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate computation
  
  const signature = CryptoJS.SHA512(message + privateKey.seed).toString(CryptoJS.enc.Hex);
  
  return {
    signature: signature + signature, // Larger signature
    size: 8192 // ~8KB
  };
}

export async function sphincsVerify(
  message: string,
  signature: SPHINCSSignature,
  publicKey: SPHINCSKeyPair['publicKey']
): Promise<boolean> {
  // Simulate SPHINCS+ verification (fast)
  await new Promise(resolve => setTimeout(resolve, 1));
  return signature.signature.length > 0;
}

/**
 * Build full Merkle tree
 */
function buildFullMerkleTree(leaves: string[]): string[] {
  const tree: string[] = [...leaves];
  let currentLevel = [...leaves];
  
  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        const parent = CryptoJS.SHA512(currentLevel[i] + currentLevel[i + 1]).toString(CryptoJS.enc.Hex);
        nextLevel.push(parent);
        tree.push(parent);
      } else {
        nextLevel.push(currentLevel[i]);
        tree.push(currentLevel[i]);
      }
    }
    
    currentLevel = nextLevel;
  }
  
  return tree;
}

/**
 * Get Merkle proof for a leaf
 */
function getMerkleProof(tree: string[], leafIndex: number): string[] {
  const proof: string[] = [];
  let index = leafIndex;
  let levelSize = Math.ceil(tree.length / 2);
  
  while (levelSize > 1) {
    const siblingIndex = index % 2 === 0 ? index + 1 : index - 1;
    if (siblingIndex < levelSize) {
      proof.push(tree[siblingIndex]);
    }
    index = Math.floor(index / 2);
    levelSize = Math.ceil(levelSize / 2);
  }
  
  return proof;
}

/**
 * Verify Merkle proof
 */
function verifyMerkleProof(leaf: string, proof: string[], root: string): boolean {
  let current = CryptoJS.SHA512(leaf).toString(CryptoJS.enc.Hex);
  
  for (const sibling of proof) {
    current = CryptoJS.SHA512(current + sibling).toString(CryptoJS.enc.Hex);
  }
  
  return current === root;
}

/**
 * Get scheme comparison data
 */
export function getSchemeComparisons(): SchemeComparison[] {
  return [
    {
      scheme: 'HBSS',
      stateless: true,
      postQuantum: true,
      keySize: '64 KB',
      sigSize: '4.3 KB',
      speed: 'Fast',
      securityLevel: 128,
      description: 'Hash-based stateless signatures with Bloom filters'
    },
    {
      scheme: 'HBSS*',
      stateless: true,
      postQuantum: true,
      keySize: '32 bytes (seed)',
      sigSize: '4.3 KB',
      speed: 'Fast',
      securityLevel: 128,
      description: 'Seed-based HBSS with reduced memory footprint'
    },
    {
      scheme: 'HBSS**',
      stateless: true,
      postQuantum: true,
      keySize: '64 bytes (root)',
      sigSize: '5.5 KB',
      speed: 'Balanced',
      securityLevel: 128,
      description: 'Merkle-enhanced HBSS with compact public keys'
    },
    {
      scheme: 'SPHINCS+',
      stateless: true,
      postQuantum: true,
      keySize: '32 bytes',
      sigSize: '8 KB',
      speed: 'Balanced',
      securityLevel: 128,
      description: 'NIST-standardized hash-based signatures'
    }
  ];
}

/**
 * Benchmark a signature scheme
 */
export async function benchmarkScheme(
  scheme: SignatureScheme,
  message: string
): Promise<SchemeMetrics> {
  const metrics: SchemeMetrics = {
    keygenTime: 0,
    signTime: 0,
    verifyTime: 0,
    publicKeySize: 0,
    privateKeySize: 0,
    signatureSize: 0,
    memoryFootprint: 0,
    maxSignatures: Infinity
  };

  try {
    switch (scheme) {
      case 'HBSS': {
        const keygenStart = performance.now();
        const keys = await hbssKeygen(512, 1024);
        metrics.keygenTime = performance.now() - keygenStart;
        
        const signStart = performance.now();
        const sig = await hbssSign(message, keys.privateKey);
        metrics.signTime = performance.now() - signStart;
        
        const verifyStart = performance.now();
        await hbssVerify(message, sig, keys.publicKey);
        metrics.verifyTime = performance.now() - verifyStart;
        
        metrics.publicKeySize = 32768; // 512 * 64
        metrics.privateKeySize = 65536; // 1024 * 64
        metrics.signatureSize = sig.revealedPreimages.length * 64 + 64;
        metrics.memoryFootprint = metrics.publicKeySize + metrics.privateKeySize;
        metrics.maxSignatures = Infinity;
        break;
      }
      
      case 'HBSS*': {
        const keygenStart = performance.now();
        const keys = await hbssStarKeygen('random-seed-' + Date.now(), 512, 1024);
        metrics.keygenTime = performance.now() - keygenStart;
        
        const signStart = performance.now();
        const sig = await hbssSign(message, keys.privateKey);
        metrics.signTime = performance.now() - signStart;
        
        const verifyStart = performance.now();
        await hbssVerify(message, sig, keys.publicKey);
        metrics.verifyTime = performance.now() - verifyStart;
        
        metrics.publicKeySize = 32768;
        metrics.privateKeySize = 32; // Just seed
        metrics.signatureSize = sig.revealedPreimages.length * 64 + 64;
        metrics.memoryFootprint = 32768 + 32;
        metrics.maxSignatures = Infinity;
        break;
      }
      
      case 'HBSS**': {
        const keygenStart = performance.now();
        const keys = await hbssStarStarKeygen(512, 1024);
        metrics.keygenTime = performance.now() - keygenStart;
        
        const signStart = performance.now();
        const sig = await hbssStarStarSign(message, keys);
        metrics.signTime = performance.now() - signStart;
        
        const verifyStart = performance.now();
        await hbssStarStarVerify(message, sig, keys.publicKey);
        metrics.verifyTime = performance.now() - verifyStart;
        
        metrics.publicKeySize = 64; // Just Merkle root
        metrics.privateKeySize = 65536;
        metrics.signatureSize = sig.revealedPreimages.length * 64 + sig.merkleProof.length * 64 + 64;
        metrics.memoryFootprint = 64 + 65536;
        metrics.maxSignatures = Infinity;
        break;
      }
      
      case 'SPHINCS+': {
        const keygenStart = performance.now();
        const keys = await sphincsKeygen();
        metrics.keygenTime = performance.now() - keygenStart;
        
        const signStart = performance.now();
        const sig = await sphincsSign(message, keys.privateKey);
        metrics.signTime = performance.now() - signStart;
        
        const verifyStart = performance.now();
        await sphincsVerify(message, sig, keys.publicKey);
        metrics.verifyTime = performance.now() - verifyStart;
        
        metrics.publicKeySize = 32;
        metrics.privateKeySize = 64;
        metrics.signatureSize = 8192;
        metrics.memoryFootprint = 96;
        metrics.maxSignatures = Infinity;
        break;
      }
    }
  } catch (error) {
    console.error(`Benchmark failed for ${scheme}:`, error);
  }

  return metrics;
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Format time to human-readable duration
 */
export function formatTime(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(2)} μs`;
  if (ms < 1000) return `${ms.toFixed(2)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}
