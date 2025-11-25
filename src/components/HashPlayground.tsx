import React, { useState, useEffect } from 'react';
import { Hash, Zap, AlertCircle, Copy, Check } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

type HashAlgorithm = 'SHA-256' | 'SHA-512' | 'SHA3-512' | 'BLAKE2b';

export default function HashPlayground() {
  const [input, setInput] = useState('Hello, World!');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-512');
  const [hash, setHash] = useState('');
  const [previousHash, setPreviousHash] = useState('');
  const [bitDifference, setBitDifference] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    computeHash();
  }, [input, algorithm]);

  const computeHash = () => {
    let newHash = '';
    
    switch (algorithm) {
      case 'SHA-256':
        newHash = CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
        break;
      case 'SHA-512':
        newHash = CryptoJS.SHA512(input).toString(CryptoJS.enc.Hex);
        break;
      case 'SHA3-512':
        newHash = CryptoJS.SHA3(input, { outputLength: 512 }).toString(CryptoJS.enc.Hex);
        break;
      case 'BLAKE2b':
        // Simulate BLAKE2b with SHA-512 (for demo purposes)
        newHash = CryptoJS.SHA512(input + 'blake2b').toString(CryptoJS.enc.Hex);
        break;
    }
    
    if (previousHash && previousHash !== newHash) {
      setBitDifference(calculateBitDifference(previousHash, newHash));
    }
    
    setPreviousHash(hash);
    setHash(newHash);
  };

  const calculateBitDifference = (hash1: string, hash2: string): number => {
    let differences = 0;
    const minLength = Math.min(hash1.length, hash2.length);
    
    for (let i = 0; i < minLength; i++) {
      const byte1 = parseInt(hash1.substring(i * 2, i * 2 + 2), 16);
      const byte2 = parseInt(hash2.substring(i * 2, i * 2 + 2), 16);
      const xor = byte1 ^ byte2;
      
      // Count set bits
      let count = xor;
      while (count > 0) {
        differences += count & 1;
        count >>= 1;
      }
    }
    
    return differences;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const testAvalancheEffect = () => {
    const testCases = [
      'Hello, World!',
      'Hello, World',  // One char removed
      'hello, World!', // Case change
      'Hello, World!!' // One char added
    ];
    
    setInput(testCases[Math.floor(Math.random() * testCases.length)]);
  };

  const getHashInfo = () => {
    switch (algorithm) {
      case 'SHA-256':
        return { bits: 256, bytes: 32, speed: 'Very Fast', security: 'High' };
      case 'SHA-512':
        return { bits: 512, bytes: 64, speed: 'Fast', security: 'Very High' };
      case 'SHA3-512':
        return { bits: 512, bytes: 64, speed: 'Balanced', security: 'Very High' };
      case 'BLAKE2b':
        return { bits: 512, bytes: 64, speed: 'Very Fast', security: 'Very High' };
    }
  };

  const info = getHashInfo();

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Hash className="w-5 h-5 text-cyan-400" />
            Hash Playground
          </CardTitle>
          <CardDescription>
            Explore cryptographic hash functions and their properties
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Algorithm Selector */}
          <div className="flex gap-2">
            {(['SHA-256', 'SHA-512', 'SHA3-512', 'BLAKE2b'] as HashAlgorithm[]).map((algo) => (
              <button
                key={algo}
                onClick={() => setAlgorithm(algo)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  algorithm === algo
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {algo}
              </button>
            ))}
          </div>

          {/* Input */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Input Message
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to hash..."
              className="w-full h-24 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-500">
                {input.length} characters, {new Blob([input]).size} bytes
              </span>
              <Button
                onClick={testAvalancheEffect}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                <Zap className="w-3 h-3 mr-1" />
                Test Avalanche
              </Button>
            </div>
          </div>

          {/* Hash Output */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">
                Hash Output ({info.bits}-bit)
              </label>
              <Button
                onClick={copyToClipboard}
                size="sm"
                variant="ghost"
                className="text-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-700 rounded-lg">
              <code className="text-xs text-cyan-400 break-all font-mono">
                {hash}
              </code>
            </div>
          </div>

          {/* Avalanche Effect */}
          {bitDifference > 0 && (
            <Alert className="bg-purple-500/10 border-purple-500/30">
              <AlertCircle className="w-4 h-4 text-purple-400" />
              <AlertDescription className="text-purple-300">
                <strong>Avalanche Effect:</strong> {bitDifference} bits changed (
                {((bitDifference / (info.bits)) * 100).toFixed(1)}% of total bits)
                <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
                    style={{ width: `${(bitDifference / info.bits) * 100}%` }}
                  />
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Hash Properties */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400 mb-1">Output Size</div>
              <div className="text-sm font-medium text-white">{info.bits} bits</div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400 mb-1">Bytes</div>
              <div className="text-sm font-medium text-white">{info.bytes} bytes</div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400 mb-1">Speed</div>
              <div className="text-sm font-medium text-emerald-400">{info.speed}</div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400 mb-1">Security</div>
              <div className="text-sm font-medium text-cyan-400">{info.security}</div>
            </div>
          </div>

          {/* Properties Explanation */}
          <div className="space-y-2 text-sm text-slate-400">
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <span><strong>Deterministic:</strong> Same input always produces same output</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <span><strong>Avalanche Effect:</strong> Small input change drastically changes output</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <span><strong>Preimage Resistance:</strong> Cannot reverse hash to find input</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <span><strong>Collision Resistance:</strong> Extremely hard to find two inputs with same hash</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collision Finder Simulation */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            Collision Resistance Demo
          </CardTitle>
          <CardDescription>
            Understanding the difficulty of finding hash collisions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-amber-500/10 border-amber-500/30">
            <AlertDescription className="text-amber-300">
              <strong>Birthday Paradox:</strong> For {algorithm}, finding a collision requires approximately{' '}
              <strong>2^{info.bits / 2}</strong> hash computations. That's{' '}
              <strong>{Math.pow(2, info.bits / 2).toExponential(2)}</strong> attempts!
            </AlertDescription>
          </Alert>

          <div className="p-4 bg-slate-950 border border-slate-700 rounded-lg">
            <div className="text-sm text-slate-300 mb-3">
              <strong>Computational Impossibility:</strong>
            </div>
            <div className="space-y-2 text-xs text-slate-400">
              <div>• At 1 billion hashes/second: {(Math.pow(2, info.bits / 2) / 1e9 / 31536000).toExponential(2)} years</div>
              <div>• More than the age of the universe (13.8 billion years)</div>
              <div>• Even quantum computers need ~2^{info.bits / 2} operations (Grover's algorithm)</div>
            </div>
          </div>

          <div className="text-sm text-slate-400">
            This is why cryptographic hash functions are considered <strong className="text-emerald-400">collision-resistant</strong> and safe for digital signatures, blockchain, and password hashing.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
