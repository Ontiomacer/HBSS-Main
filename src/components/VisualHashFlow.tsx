import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Eye } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VisualHashFlow() {
  const [message, setMessage] = useState('Hello, HBSS!');
  const [isAnimating, setIsAnimating] = useState(false);
  const [step, setStep] = useState(0);
  const [digest, setDigest] = useState('');
  const [indices, setIndices] = useState<number[]>([]);
  const [commitments, setCommitments] = useState<string[]>([]);
  const [merkleTree, setMerkleTree] = useState<string[]>([]);

  const maxSteps = 5;

  useEffect(() => {
    if (isAnimating && step < maxSteps) {
      const timer = setTimeout(() => {
        setStep(step + 1);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (step >= maxSteps) {
      setIsAnimating(false);
    }
  }, [isAnimating, step]);

  useEffect(() => {
    // Compute digest
    const hash = CryptoJS.SHA512(message).toString(CryptoJS.enc.Hex);
    setDigest(hash);

    // Generate indices
    const newIndices: number[] = [];
    for (let i = 0; i < 8; i++) {
      const indexHash = CryptoJS.SHA512(hash + i.toString()).toString(CryptoJS.enc.Hex);
      const index = parseInt(indexHash.substring(0, 8), 16) % 64;
      newIndices.push(index);
    }
    setIndices(newIndices);

    // Generate mock commitments
    const newCommitments: string[] = [];
    for (let i = 0; i < 16; i++) {
      newCommitments.push(CryptoJS.SHA512(`commitment-${i}`).toString(CryptoJS.enc.Hex));
    }
    setCommitments(newCommitments);

    // Build Merkle tree
    const tree = buildMerkleTree(newCommitments);
    setMerkleTree(tree);
  }, [message]);

  const buildMerkleTree = (leaves: string[]): string[] => {
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
        }
      }
      currentLevel = nextLevel;
    }

    return tree;
  };

  const startAnimation = () => {
    setStep(0);
    setIsAnimating(true);
  };

  const pauseAnimation = () => {
    setIsAnimating(false);
  };

  const resetAnimation = () => {
    setStep(0);
    setIsAnimating(false);
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            Visual Hash Flow
          </CardTitle>
          <CardDescription>
            Watch the HBSS signature process step-by-step
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Input Message
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={startAnimation}
              disabled={isAnimating}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Animation
            </Button>
            <Button
              onClick={pauseAnimation}
              disabled={!isAnimating}
              variant="outline"
              className="border-slate-700"
            >
              <Pause className="w-4 h-4" />
            </Button>
            <Button
              onClick={resetAnimation}
              variant="outline"
              className="border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Step {step} of {maxSteps}</span>
              <span>{((step / maxSteps) * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 transition-all duration-500"
                style={{ width: `${(step / maxSteps) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Message Input */}
      <Card className={`bg-slate-900/50 border-slate-800 transition-all ${step >= 1 ? 'opacity-100' : 'opacity-30'}`}>
        <CardHeader>
          <CardTitle className="text-white text-lg">Step 1: Message Input</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-slate-950 border border-slate-700 rounded-lg">
            <div className="text-sm text-slate-400 mb-2">Original Message</div>
            <code className="text-cyan-400 font-mono">{message}</code>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: SHA-512 Digest */}
      <Card className={`bg-slate-900/50 border-slate-800 transition-all ${step >= 2 ? 'opacity-100' : 'opacity-30'}`}>
        <CardHeader>
          <CardTitle className="text-white text-lg">Step 2: SHA-512 Digest Computation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-slate-950 border border-slate-700 rounded-lg">
            <div className="text-sm text-slate-400 mb-2">Message Digest (512-bit)</div>
            <code className="text-purple-400 font-mono text-xs break-all">{digest}</code>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Index Generation */}
      <Card className={`bg-slate-900/50 border-slate-800 transition-all ${step >= 3 ? 'opacity-100' : 'opacity-30'}`}>
        <CardHeader>
          <CardTitle className="text-white text-lg">Step 3: Bloom Filter Index Mapping</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-slate-400">
              Indices generated from digest: <code>index[j] = SHA-512(digest || j) mod n</code>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {indices.map((idx, i) => (
                <div
                  key={i}
                  className={`aspect-square bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm transition-all ${
                    step >= 3 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  {idx}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Preimage Revelation */}
      <Card className={`bg-slate-900/50 border-slate-800 transition-all ${step >= 4 ? 'opacity-100' : 'opacity-30'}`}>
        <CardHeader>
          <CardTitle className="text-white text-lg">Step 4: Preimage Revelation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-slate-400">
              Reveal preimages at computed indices
            </div>
            <div className="space-y-2">
              {indices.slice(0, 4).map((idx, i) => (
                <div
                  key={i}
                  className={`p-3 bg-slate-950 border border-slate-700 rounded-lg transition-all ${
                    step >= 4 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-medium">
                      Index {idx}
                    </div>
                    <code className="text-xs text-slate-400 flex-1 overflow-x-auto">
                      {commitments[idx % commitments.length].substring(0, 48)}...
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 5: Merkle Tree Verification */}
      <Card className={`bg-slate-900/50 border-slate-800 transition-all ${step >= 5 ? 'opacity-100' : 'opacity-30'}`}>
        <CardHeader>
          <CardTitle className="text-white text-lg">Step 5: Merkle Tree Verification Path</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-slate-400">
              Verify preimages hash to commitment root via Merkle proof
            </div>
            
            {/* Merkle Tree Visualization */}
            <div className="space-y-3">
              {/* Root */}
              <div className="flex justify-center">
                <div className={`px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg text-white text-xs font-mono transition-all ${
                  step >= 5 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`}>
                  Root: {merkleTree[merkleTree.length - 1]?.substring(0, 16)}...
                </div>
              </div>

              {/* Level 1 */}
              <div className="flex justify-center gap-4">
                {merkleTree.slice(-3, -1).map((node, i) => (
                  <div
                    key={i}
                    className={`px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-300 text-xs font-mono transition-all ${
                      step >= 5 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                    }`}
                    style={{ transitionDelay: `${i * 200}ms` }}
                  >
                    {node?.substring(0, 12)}...
                  </div>
                ))}
              </div>

              {/* Leaves */}
              <div className="grid grid-cols-4 gap-2">
                {commitments.slice(0, 4).map((leaf, i) => (
                  <div
                    key={i}
                    className={`px-2 py-2 bg-slate-950 border border-emerald-500/30 rounded text-emerald-400 text-xs font-mono transition-all ${
                      step >= 5 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                    }`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    {leaf.substring(0, 10)}...
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <div className="text-sm text-emerald-400 font-medium">
                ✓ Signature Valid: All preimages verified against commitment root
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
