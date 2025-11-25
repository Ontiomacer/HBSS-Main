import React, { useState } from 'react';
import { Cpu, Zap, Play, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { benchmarkScheme, SignatureScheme, SchemeMetrics, formatBytes, formatTime } from '../services/crypto/MultiScheme';

export default function PerformanceAnalyzer() {
  const [selectedSchemes, setSelectedSchemes] = useState<SignatureScheme[]>(['HBSS', 'HBSS*', 'HBSS**', 'SPHINCS+']);
  const [benchmarks, setBenchmarks] = useState<Map<SignatureScheme, SchemeMetrics>>(new Map());
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message] = useState('The quick brown fox jumps over the lazy dog');

  const runBenchmarks = async () => {
    setIsRunning(true);
    setProgress(0);
    const results = new Map<SignatureScheme, SchemeMetrics>();

    for (let i = 0; i < selectedSchemes.length; i++) {
      const scheme = selectedSchemes[i];
      setProgress(((i + 1) / selectedSchemes.length) * 100);
      
      const metrics = await benchmarkScheme(scheme, message);
      results.set(scheme, metrics);
      setBenchmarks(new Map(results));
    }

    setIsRunning(false);
  };

  const toggleScheme = (scheme: SignatureScheme) => {
    setSelectedSchemes(prev =>
      prev.includes(scheme)
        ? prev.filter(s => s !== scheme)
        : [...prev, scheme]
    );
  };

  const exportResults = () => {
    const data = Array.from(benchmarks.entries()).map(([scheme, metrics]) => ({
      scheme,
      ...metrics
    }));
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hbss-benchmark-${Date.now()}.json`;
    a.click();
  };

  const getSpeedColor = (time: number) => {
    if (time < 10) return 'text-emerald-400';
    if (time < 50) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            Performance Analyzer
          </CardTitle>
          <CardDescription>
            Benchmark and compare post-quantum signature schemes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Scheme Selection */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">
              Select Schemes to Benchmark
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['HBSS', 'HBSS*', 'HBSS**', 'SPHINCS+'] as SignatureScheme[]).map((scheme) => (
                <button
                  key={scheme}
                  onClick={() => toggleScheme(scheme)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedSchemes.includes(scheme)
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="font-medium">{scheme}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Test Message */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Test Message
            </label>
            <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
              <code className="text-sm text-slate-300">{message}</code>
            </div>
          </div>

          {/* Run Button */}
          <div className="flex gap-3">
            <Button
              onClick={runBenchmarks}
              disabled={isRunning || selectedSchemes.length === 0}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? 'Running Benchmarks...' : 'Run Benchmarks'}
            </Button>
            {benchmarks.size > 0 && (
              <Button
                onClick={exportResults}
                variant="outline"
                className="border-slate-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
          </div>

          {isRunning && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-slate-400 text-center">
                Benchmarking schemes... {progress.toFixed(0)}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {benchmarks.size > 0 && (
        <>
          {/* Timing Comparison */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Timing Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Scheme</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">Key Gen</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">Sign</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">Verify</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(benchmarks.entries()).map(([scheme, metrics]) => {
                      const total = metrics.keygenTime + metrics.signTime + metrics.verifyTime;
                      return (
                        <tr key={scheme} className="border-b border-slate-800 hover:bg-slate-800/30">
                          <td className="py-3 px-4 font-medium text-white">{scheme}</td>
                          <td className={`py-3 px-4 text-right ${getSpeedColor(metrics.keygenTime)}`}>
                            {formatTime(metrics.keygenTime)}
                          </td>
                          <td className={`py-3 px-4 text-right ${getSpeedColor(metrics.signTime)}`}>
                            {formatTime(metrics.signTime)}
                          </td>
                          <td className={`py-3 px-4 text-right ${getSpeedColor(metrics.verifyTime)}`}>
                            {formatTime(metrics.verifyTime)}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-purple-400">
                            {formatTime(total)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Size Comparison */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Size Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Scheme</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">Public Key</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">Private Key</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">Signature</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">Memory</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(benchmarks.entries()).map(([scheme, metrics]) => (
                      <tr key={scheme} className="border-b border-slate-800 hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-medium text-white">{scheme}</td>
                        <td className="py-3 px-4 text-right text-cyan-400">
                          {formatBytes(metrics.publicKeySize)}
                        </td>
                        <td className="py-3 px-4 text-right text-amber-400">
                          {formatBytes(metrics.privateKeySize)}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-400">
                          {formatBytes(metrics.signatureSize)}
                        </td>
                        <td className="py-3 px-4 text-right text-purple-400">
                          {formatBytes(metrics.memoryFootprint)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Visual Comparison */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Visual Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.from(benchmarks.entries()).map(([scheme, metrics]) => {
                const maxTime = Math.max(...Array.from(benchmarks.values()).map(m => m.keygenTime + m.signTime + m.verifyTime));
                const totalTime = metrics.keygenTime + metrics.signTime + metrics.verifyTime;
                const percentage = (totalTime / maxTime) * 100;

                return (
                  <div key={scheme} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{scheme}</span>
                      <span className="text-sm text-slate-400">{formatTime(totalTime)}</span>
                    </div>
                    <div className="h-8 bg-slate-800 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-end px-3 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="text-xs font-medium text-white">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {benchmarks.size === 0 && !isRunning && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="py-12 text-center">
            <Cpu className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400 mb-4">No benchmarks run yet</p>
            <p className="text-sm text-slate-500">
              Select schemes and click "Run Benchmarks" to start
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
