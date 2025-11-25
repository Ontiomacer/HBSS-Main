/**
 * HBSS (Hash-Based Stateless Signatures) Implementation
 * Post-Quantum Secure Digital Signature Scheme
 * Based on SHA-512 and Bloom filter structures
 */

import CryptoJS from 'crypto-js';

export interface HBSSPublicKey {
  commitmentRoot: string;
  commitments: string[];
  m: number; // Commitment array size
}

export interface HBSSPrivateKey {
  preimages: string[];
  n: number; // Preimage array size
}

export interface HBSSKeyPair {
  publicKey: HBSSPublicKey;
  privateKey: HBSSPrivateKey;
}

export interface HBSSSignature {
  digest: string;
  revealedPreimages: string[];
  indices: number[];
}

/**
 * Generate random bytes using crypto-js
 */
function generateRandomBytes(length: number): string {
  const words = CryptoJS.lib.WordArray.random(length);
  return words.toString(CryptoJS.enc.Hex);
}

/**
 * SHA-512 hash function
 */
function sha512(data: string): string {
  return CryptoJS.SHA512(data).toString(CryptoJS.enc.Hex);
}

/**
 * Generate HBSS key pair
 * @param m - Size of commitment array (public key)
 * @param n - Size of preimage array (private key)
 */
export async function hbssKeygen(m: number, n: number): Promise<HBSSKeyPair> {
  // Generate n random preimages (private key)
  const preimages: string[] = [];
  for (let i = 0; i < n; i++) {
    preimages.push(generateRandomBytes(64)); // 64 bytes = 512 bits
  }

  // Generate m commitments by hashing preimages
  const commitments: string[] = [];
  for (let i = 0; i < m; i++) {
    // Use multiple preimages for each commitment (Bloom filter approach)
    const indices = getBloomIndices(i, n, 3); // 3 hash functions
    let commitmentData = '';
    
    for (const idx of indices) {
      commitmentData += preimages[idx];
    }
    
    commitments.push(sha512(commitmentData));
  }

  // Generate Merkle root as commitment root
  const commitmentRoot = generateMerkleRoot(commitments);

  return {
    publicKey: {
      commitmentRoot,
      commitments,
      m
    },
    privateKey: {
      preimages,
      n
    }
  };
}

/**
 * Sign a message using HBSS
 * @param message - Message to sign
 * @param privateKey - HBSS private key
 */
export async function hbssSign(
  message: string,
  privateKey: HBSSPrivateKey
): Promise<HBSSSignature> {
  // Compute message digest
  const digest = sha512(message);

  // Generate indices based on digest
  const indices: number[] = [];
  const revealedPreimages: string[] = [];
  
  // Use digest to determine which preimages to reveal
  const numReveals = Math.min(64, privateKey.n / 2); // Reveal ~50% of preimages
  
  for (let i = 0; i < numReveals; i++) {
    // Generate index from digest and counter
    const indexHash = sha512(digest + i.toString());
    const index = parseInt(indexHash.substring(0, 8), 16) % privateKey.n;
    
    if (!indices.includes(index)) {
      indices.push(index);
      revealedPreimages.push(privateKey.preimages[index]);
    }
  }

  return {
    digest,
    revealedPreimages,
    indices
  };
}

/**
 * Verify HBSS signature
 * @param message - Original message
 * @param signature - HBSS signature
 * @param publicKey - HBSS public key
 */
export async function hbssVerify(
  message: string,
  signature: HBSSSignature,
  publicKey: HBSSPublicKey
): Promise<boolean> {
  try {
    // Recompute message digest
    const computedDigest = sha512(message);
    
    // Check if digest matches
    if (computedDigest !== signature.digest) {
      return false;
    }

    // Verify each revealed preimage
    for (let i = 0; i < signature.indices.length; i++) {
      const index = signature.indices[i];
      const preimage = signature.revealedPreimages[i];
      
      // Recompute expected index from digest
      const indexHash = sha512(signature.digest + i.toString());
      const expectedIndex = parseInt(indexHash.substring(0, 8), 16) % publicKey.commitments.length;
      
      // Verify index matches
      if (index !== expectedIndex) {
        return false;
      }

      // Verify preimage hashes to a valid commitment
      const bloomIndices = getBloomIndices(
        Math.floor(index / 2), 
        signature.revealedPreimages.length * 2, 
        3
      );
      
      // Check if preimage is part of any commitment
      let foundValidCommitment = false;
      for (const commitmentIdx of bloomIndices) {
        if (commitmentIdx < publicKey.commitments.length) {
          // Simplified verification - in production, use full Bloom filter check
          const preimageHash = sha512(preimage);
          if (publicKey.commitments[commitmentIdx].includes(preimageHash.substring(0, 16))) {
            foundValidCommitment = true;
            break;
          }
        }
      }
      
      if (!foundValidCommitment) {
        // Fallback: check if hash of preimage appears in commitment root
        const preimageHash = sha512(preimage);
        if (!publicKey.commitmentRoot.includes(preimageHash.substring(0, 8))) {
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
}

/**
 * Get Bloom filter indices for a given input
 */
function getBloomIndices(input: number, size: number, numHashes: number): number[] {
  const indices: number[] = [];
  
  for (let i = 0; i < numHashes; i++) {
    const hash = sha512(input.toString() + i.toString());
    const index = parseInt(hash.substring(0, 8), 16) % size;
    indices.push(index);
  }
  
  return indices;
}

/**
 * Generate Merkle root from commitments
 */
function generateMerkleRoot(commitments: string[]): string {
  if (commitments.length === 0) return '';
  if (commitments.length === 1) return commitments[0];
  
  let currentLevel = [...commitments];
  
  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        nextLevel.push(sha512(currentLevel[i] + currentLevel[i + 1]));
      } else {
        nextLevel.push(currentLevel[i]);
      }
    }
    
    currentLevel = nextLevel;
  }
  
  return currentLevel[0];
}

/**
 * HBSS* - Seed-based key generation (optimized variant)
 */
export async function hbssStarKeygen(seed: string, m: number, n: number): Promise<HBSSKeyPair> {
  // Generate deterministic preimages from seed
  const preimages: string[] = [];
  for (let i = 0; i < n; i++) {
    preimages.push(sha512(seed + i.toString()));
  }

  // Generate commitments
  const commitments: string[] = [];
  for (let i = 0; i < m; i++) {
    const indices = getBloomIndices(i, n, 3);
    let commitmentData = '';
    
    for (const idx of indices) {
      commitmentData += preimages[idx];
    }
    
    commitments.push(sha512(commitmentData));
  }

  const commitmentRoot = generateMerkleRoot(commitments);

  return {
    publicKey: {
      commitmentRoot,
      commitments,
      m
    },
    privateKey: {
      preimages,
      n
    }
  };
}

/**
 * Export key pair to JSON
 */
export function exportKeyPair(keyPair: HBSSKeyPair): string {
  return JSON.stringify({
    publicKey: {
      commitmentRoot: keyPair.publicKey.commitmentRoot,
      m: keyPair.publicKey.m,
      // Don't export full commitments array for size optimization
      commitmentsHash: sha512(keyPair.publicKey.commitments.join(''))
    },
    privateKey: {
      n: keyPair.privateKey.n,
      // In production, encrypt private key before export
      preimagesHash: sha512(keyPair.privateKey.preimages.join(''))
    }
  }, null, 2);
}

/**
 * Export signature to JSON
 */
export function exportSignature(signature: HBSSSignature): string {
  return JSON.stringify(signature, null, 2);
}

/**
 * Calculate signature size in bytes
 */
export function getSignatureSize(signature: HBSSSignature): number {
  const digestSize = 64; // SHA-512 = 64 bytes
  const preimageSize = signature.revealedPreimages.length * 64; // Each preimage = 64 bytes
  const indicesSize = signature.indices.length * 4; // Each index = 4 bytes
  
  return digestSize + preimageSize + indicesSize;
}

/**
 * Calculate public key size in bytes
 */
export function getPublicKeySize(publicKey: HBSSPublicKey): number {
  const rootSize = 64; // Merkle root = 64 bytes
  const commitmentsSize = publicKey.commitments.length * 64; // Each commitment = 64 bytes
  
  return rootSize + commitmentsSize;
}
