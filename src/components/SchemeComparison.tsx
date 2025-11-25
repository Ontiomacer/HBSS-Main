import React from 'react';
import { Shield, Check, X, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSchemeComparisons } from '../services/crypto/MultiScheme';

export default function SchemeComparison() {
  const schemes = getSchemeComparisons();

  return (
    <div className="space-y-6">
      {/* Comparison Table */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Post-Quantum Signature Schemes
          </CardTitle>
          <CardDescription>
            Comprehensive comparison of quantum-resistant digital signature algorithms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Scheme</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-300">Stateless</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-300">PQ-Safe</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">Key Size</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">Sig Size</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-300">Speed</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">Security</th>
                </tr>
              </thead>
              <tbody>
                {schemes.map((scheme) => (
                  <tr key={scheme.scheme} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{scheme.scheme}</div>
                      <div className="text-xs text-slate-500 mt-1">{scheme.description}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {scheme.stateless ? (
                        <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {scheme.postQuantum ? (
                        <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-cyan-400">{scheme.keySize}</td>
                    <td className="py-3 px-4 text-right text-purple-400">{scheme.sigSize}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        scheme.speed === 'Very Fast' ? 'bg-emerald-500/20 text-emerald-400' :
                        scheme.speed === 'Fast' ? 'bg-green-500/20 text-green-400' :
                        scheme.speed === 'Balanced' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {scheme.speed}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-amber-400">{scheme.securityLevel}-bit</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schemes.map((scheme) => (
          <Card key={scheme.scheme} className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>{scheme.scheme}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  scheme.speed === 'Very Fast' ? 'bg-emerald-500/20 text-emerald-400' :
                  scheme.speed === 'Fast' ? 'bg-green-500/20 text-green-400' :
                  scheme.speed === 'Balanced' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {scheme.speed}
                </span>
              </CardTitle>
              <CardDescription>{scheme.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">Key Size</div>
                  <div className="text-sm font-medium text-cyan-400">{scheme.keySize}</div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">Signature Size</div>
                  <div className="text-sm font-medium text-purple-400">{scheme.sigSize}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Stateless</span>
                  {scheme.stateless ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Yes
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1">
                      <X className="w-4 h-4" /> No
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Post-Quantum</span>
                  {scheme.postQuantum ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Yes
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1">
                      <X className="w-4 h-4" /> No
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Security Level</span>
                  <span className="text-amber-400 font-medium">{scheme.securityLevel}-bit</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            Understanding the Differences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-300">
          <div>
            <h4 className="font-medium text-white mb-2">HBSS (Base)</h4>
            <p className="text-slate-400">
              Uses full commitment array for fast verification. Larger public keys but excellent performance.
              Ideal for applications where public key size is not a constraint.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">HBSS* (Seed-Based)</h4>
            <p className="text-slate-400">
              Generates keys deterministically from a seed. Dramatically reduces private key storage to just 32 bytes.
              Perfect for resource-constrained devices and backup scenarios.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">HBSS** (Merkle-Enhanced)</h4>
            <p className="text-slate-400">
              Uses Merkle tree to compress public key to just 64 bytes. Signatures include Merkle proofs.
              Best for applications requiring minimal public key distribution overhead.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">SPHINCS+</h4>
            <p className="text-slate-400">
              NIST-standardized hash-based signature scheme. Larger signatures but very small keys.
              Industry standard for post-quantum signatures with extensive security analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
