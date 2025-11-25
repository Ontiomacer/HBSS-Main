import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Key, Lock, CheckCircle, ArrowRight, Hash, Layers, Zap, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function HBSSIllustration() {
  const [activeStep, setActiveStep] = useState(0);
  const [visualStep, setVisualStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const keygenSteps = [
    {
      title: "Generate Random Preimages",
      description: "Create 1024 random 256-bit values",
      visual: "🎲 → [P₁, P₂, P₃, ..., P₁₀₂₄]",
      detail: "Each preimage is a cryptographically secure random number"
    },
    {
      title: "Hash Preimages Multiple Times",
      description: "Hash each preimage 512 times using SHA-512",
      visual: "P₁ → H(P₁) → H(H(P₁)) → ... → C₁",
      detail: "Creates a one-way chain: easy to compute forward, impossible to reverse"
    },
    {
      title: "Build Merkle Tree",
      description: "Organize commitments into a binary tree",
      visual: "C₁ C₂ → H(C₁||C₂) → Root",
      detail: "Allows efficient verification of any commitment"
    },
    {
      title: "Store Keys",
      description: "Private key = preimages, Public key = root",
      visual: "🔐 Private: [P₁...P₁₀₂₄] | 🔓 Public: Root",
      detail: "Public key is just 64 bytes, private key is ~32KB"
    }
  ];

  const signingSteps = [
    {
      title: "Hash the Message",
      description: "Create SHA-512 digest of the message",
      visual: "\"Hello\" → SHA-512 → digest",
      detail: "Produces a 512-bit fingerprint of the message"
    },
    {
      title: "Select Preimages",
      description: "Use digest bits to choose which preimages to reveal",
      visual: "digest[0]=1 → reveal P₁, digest[1]=0 → skip P₂",
      detail: "Each bit determines if we reveal that preimage"
    },
    {
      title: "Create Signature",
      description: "Package digest, indices, and revealed preimages",
      visual: "σ = {digest, [1,3,5...], [P₁,P₃,P₅...]}",
      detail: "Signature size: ~16KB (half the preimages on average)"
    }
  ];

  const verifySteps = [
    {
      title: "Hash the Message",
      description: "Recompute the message digest",
      visual: "\"Hello\" → SHA-512 → digest'",
      detail: "Must match the digest in the signature"
    },
    {
      title: "Hash Revealed Preimages",
      description: "Hash each preimage 512 times",
      visual: "P₁ → H⁵¹²(P₁) → C₁'",
      detail: "Recreate the commitments from preimages"
    },
    {
      title: "Verify Commitments",
      description: "Check if commitments match public key",
      visual: "C₁' == C₁ (from public key)",
      detail: "Uses Merkle tree to verify efficiently"
    },
    {
      title: "Signature Valid!",
      description: "All checks passed",
      visual: "✅ Message is authentic",
      detail: "Quantum computers can't forge this signature"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-slate-900 to-black p-6">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEzOSwgOTIsIDI0NiwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-cyan-500 to-violet-600 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">HBSS Explained</h1>
          <p className="text-violet-300 text-lg">Hash-Based Stateless Signatures - Behind the Scenes</p>
        </div>

        {/* Overview */}
        <Card className="bg-slate-900/80 backdrop-blur-xl border-violet-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-cyan-400" />
              What is HBSS?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              HBSS (Hash-Based Stateless Signatures) is a <span className="text-cyan-400 font-semibold">quantum-resistant</span> digital signature scheme. 
              Unlike RSA or ECDSA which can be broken by quantum computers, HBSS relies only on hash functions (SHA-512), 
              which remain secure even against quantum attacks.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <Shield className="w-8 h-8 text-emerald-400 mb-2" />
                <h3 className="text-emerald-400 font-semibold mb-1">Quantum-Safe</h3>
                <p className="text-sm text-slate-400">Secure against quantum computers</p>
              </div>
              
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <Hash className="w-8 h-8 text-cyan-400 mb-2" />
                <h3 className="text-cyan-400 font-semibold mb-1">Hash-Based</h3>
                <p className="text-sm text-slate-400">Uses only SHA-512 hashing</p>
              </div>
              
              <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
                <Zap className="w-8 h-8 text-violet-400 mb-2" />
                <h3 className="text-violet-400 font-semibold mb-1">Stateless</h3>
                <p className="text-sm text-slate-400">No state tracking required</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Tabs */}
        <Tabs defaultValue="keygen" className="space-y-4">
          <TabsList className="bg-slate-900/50 border border-violet-500/30 p-1">
            <TabsTrigger value="visual" className="data-[state=active]:bg-pink-600">
              <Zap className="w-4 h-4 mr-2" />
              Live Demo
            </TabsTrigger>
            <TabsTrigger value="keygen" className="data-[state=active]:bg-cyan-600">
              <Key className="w-4 h-4 mr-2" />
              Key Generation
            </TabsTrigger>
            <TabsTrigger value="signing" className="data-[state=active]:bg-violet-600">
              <Lock className="w-4 h-4 mr-2" />
              Signing
            </TabsTrigger>
            <TabsTrigger value="verify" className="data-[state=active]:bg-emerald-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              Verification
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-amber-600">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Interactive Visual Demo Tab */}
          <TabsContent value="visual" className="space-y-4">
            <Card className="bg-slate-900/80 backdrop-blur-xl border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-white">Interactive HBSS Signing Visualization</CardTitle>
                <CardDescription>Watch the signing process step-by-step</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Visual Flow Diagram */}
                <div className="relative p-8 bg-slate-950 rounded-lg border border-pink-500/30">
                  {/* Step 0: Message Input */}
                  <div className={`transition-all duration-500 ${visualStep >= 0 ? 'opacity-100' : 'opacity-30'}`}>
                    <div className="flex items-center justify-center mb-8">
                      <div className="p-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg shadow-lg">
                        <div className="text-white text-center">
                          <div className="text-sm font-semibold mb-2">📝 Original Message</div>
                          <div className="text-2xl font-mono">"Hello, World!"</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  {visualStep >= 1 && (
                    <div className="flex justify-center mb-8 animate-pulse">
                      <ArrowRight className="w-8 h-8 text-pink-400 rotate-90" />
                    </div>
                  )}

                  {/* Step 1: Hash Message */}
                  <div className={`transition-all duration-500 ${visualStep >= 1 ? 'opacity-100' : 'opacity-30'}`}>
                    <div className="flex items-center justify-center mb-8">
                      <div className="p-6 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg shadow-lg">
                        <div className="text-white text-center">
                          <div className="text-sm font-semibold mb-2">🔐 SHA-512 Hash</div>
                          <div className="text-xs font-mono break-all max-w-md">
                            a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e...
                          </div>
                          <div className="text-xs text-violet-300 mt-2">512 bits (64 bytes)</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  {visualStep >= 2 && (
                    <div className="flex justify-center mb-8 animate-pulse">
                      <ArrowRight className="w-8 h-8 text-pink-400 rotate-90" />
                    </div>
                  )}

                  {/* Step 2: Select Preimages */}
                  <div className={`transition-all duration-500 ${visualStep >= 2 ? 'opacity-100' : 'opacity-30'}`}>
                    <div className="flex items-center justify-center mb-8">
                      <div className="p-6 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-lg shadow-lg">
                        <div className="text-white text-center">
                          <div className="text-sm font-semibold mb-3">🎯 Select Preimages</div>
                          <div className="flex gap-2 justify-center flex-wrap max-w-md">
                            <div className="px-3 py-1 bg-emerald-500 rounded text-xs">P₁ ✓</div>
                            <div className="px-3 py-1 bg-slate-700 rounded text-xs opacity-50">P₂ ✗</div>
                            <div className="px-3 py-1 bg-emerald-500 rounded text-xs">P₃ ✓</div>
                            <div className="px-3 py-1 bg-emerald-500 rounded text-xs">P₄ ✓</div>
                            <div className="px-3 py-1 bg-slate-700 rounded text-xs opacity-50">P₅ ✗</div>
                            <div className="px-3 py-1 bg-emerald-500 rounded text-xs">P₆ ✓</div>
                            <div className="text-white">...</div>
                          </div>
                          <div className="text-xs text-cyan-300 mt-2">Based on hash bits: 1,0,1,1,0,1...</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  {visualStep >= 3 && (
                    <div className="flex justify-center mb-8 animate-pulse">
                      <ArrowRight className="w-8 h-8 text-pink-400 rotate-90" />
                    </div>
                  )}

                  {/* Step 3: Create Signature */}
                  <div className={`transition-all duration-500 ${visualStep >= 3 ? 'opacity-100' : 'opacity-30'}`}>
                    <div className="flex items-center justify-center mb-8">
                      <div className="p-6 bg-gradient-to-r from-pink-600 to-rose-600 rounded-lg shadow-lg">
                        <div className="text-white text-center">
                          <div className="text-sm font-semibold mb-3">✍️ HBSS Signature</div>
                          <div className="space-y-2 text-xs">
                            <div className="p-2 bg-slate-900 rounded">
                              <span className="text-pink-300">Digest:</span> a591a6d40bf4...
                            </div>
                            <div className="p-2 bg-slate-900 rounded">
                              <span className="text-pink-300">Indices:</span> [1, 3, 4, 6, ...]
                            </div>
                            <div className="p-2 bg-slate-900 rounded">
                              <span className="text-pink-300">Preimages:</span> [P₁, P₃, P₄, P₆, ...]
                            </div>
                          </div>
                          <div className="text-xs text-pink-300 mt-2">~16 KB signature size</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  {visualStep >= 4 && (
                    <div className="flex justify-center mb-8 animate-pulse">
                      <ArrowRight className="w-8 h-8 text-pink-400 rotate-90" />
                    </div>
                  )}

                  {/* Step 4: Verification */}
                  <div className={`transition-all duration-500 ${visualStep >= 4 ? 'opacity-100' : 'opacity-30'}`}>
                    <div className="flex items-center justify-center">
                      <div className="p-6 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg shadow-lg">
                        <div className="text-white text-center">
                          <div className="text-sm font-semibold mb-3">✅ Verification</div>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2 justify-center">
                              <CheckCircle className="w-4 h-4 text-emerald-300" />
                              <span>Hash message → matches digest</span>
                            </div>
                            <div className="flex items-center gap-2 justify-center">
                              <CheckCircle className="w-4 h-4 text-emerald-300" />
                              <span>Hash preimages → matches commitments</span>
                            </div>
                            <div className="flex items-center gap-2 justify-center">
                              <CheckCircle className="w-4 h-4 text-emerald-300" />
                              <span>Verify Merkle tree → matches public key</span>
                            </div>
                          </div>
                          <div className="text-lg font-bold text-emerald-300 mt-3">Signature Valid! 🎉</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={() => setVisualStep(Math.max(0, visualStep - 1))}
                    disabled={visualStep === 0}
                    variant="outline"
                    className="border-pink-500/30"
                  >
                    Previous Step
                  </Button>
                  
                  <div className="px-4 py-2 bg-pink-500/20 border border-pink-500/30 rounded-lg">
                    <span className="text-pink-300 font-semibold">
                      Step {visualStep + 1} of 5
                    </span>
                  </div>

                  <Button
                    onClick={() => setVisualStep(Math.min(4, visualStep + 1))}
                    disabled={visualStep === 4}
                    className="bg-gradient-to-r from-pink-600 to-rose-600"
                  >
                    Next Step
                  </Button>
                </div>

                {/* Step Descriptions */}
                <div className="p-4 bg-slate-800/50 rounded-lg border border-pink-500/30">
                  <h3 className="text-white font-semibold mb-2">
                    {visualStep === 0 && "Step 1: Original Message"}
                    {visualStep === 1 && "Step 2: Hash the Message"}
                    {visualStep === 2 && "Step 3: Select Preimages"}
                    {visualStep === 3 && "Step 4: Create Signature"}
                    {visualStep === 4 && "Step 5: Verify Signature"}
                  </h3>
                  <p className="text-slate-300 text-sm">
                    {visualStep === 0 && "Start with any message you want to sign. This could be a chat message, document, or any data."}
                    {visualStep === 1 && "Hash the message using SHA-512 to create a 512-bit digest. This is a unique fingerprint of the message."}
                    {visualStep === 2 && "Use each bit of the digest to decide which preimages to reveal. Bit=1 means reveal, bit=0 means skip."}
                    {visualStep === 3 && "Package the digest, indices, and revealed preimages into the final signature. This proves you have the private key."}
                    {visualStep === 4 && "Anyone can verify by hashing the message, hashing the preimages, and checking against the public key. Quantum computers can't forge this!"}
                  </p>
                </div>

                {/* Reset Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={() => setVisualStep(0)}
                    variant="outline"
                    className="border-pink-500/30"
                  >
                    Reset Animation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Key Generation Tab */}
          <TabsContent value="keygen" className="space-y-4">
            <Card className="bg-slate-900/80 backdrop-blur-xl border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-white">Key Generation Process</CardTitle>
                <CardDescription>How HBSS creates quantum-resistant key pairs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {keygenSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      activeStep === index
                        ? 'bg-cyan-500/20 border-cyan-500'
                        : 'bg-slate-800/50 border-slate-700 hover:border-cyan-500/50'
                    }`}
                    onClick={() => setActiveStep(index)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activeStep === index ? 'bg-cyan-600' : 'bg-slate-700'
                      }`}>
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                        <p className="text-slate-400 text-sm mb-2">{step.description}</p>
                        <div className="p-3 bg-slate-950 rounded border border-slate-700 font-mono text-sm text-cyan-400">
                          {step.visual}
                        </div>
                        {activeStep === index && (
                          <p className="text-slate-300 text-sm mt-3 italic">
                            💡 {step.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <Alert className="bg-cyan-500/10 border-cyan-500/30">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <AlertDescription className="text-cyan-300">
                    <strong>Time:</strong> Key generation takes 2-5 seconds for 512 commitments. 
                    This is a one-time operation per user.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signing Tab */}
          <TabsContent value="signing" className="space-y-4">
            <Card className="bg-slate-900/80 backdrop-blur-xl border-violet-500/30">
              <CardHeader>
                <CardTitle className="text-white">Message Signing Process</CardTitle>
                <CardDescription>How HBSS creates quantum-resistant signatures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {signingSteps.map((step, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                        <p className="text-slate-400 text-sm mb-2">{step.description}</p>
                        <div className="p-3 bg-slate-950 rounded border border-slate-700 font-mono text-sm text-violet-400">
                          {step.visual}
                        </div>
                        <p className="text-slate-300 text-sm mt-3 italic">
                          💡 {step.detail}
                        </p>
                      </div>
                    </div>
                    {index < signingSteps.length - 1 && (
                      <div className="flex justify-center mt-4">
                        <ArrowRight className="w-6 h-6 text-violet-400" />
                      </div>
                    )}
                  </div>
                ))}

                <Alert className="bg-violet-500/10 border-violet-500/30">
                  <Zap className="w-4 h-4 text-violet-400" />
                  <AlertDescription className="text-violet-300">
                    <strong>Performance:</strong> Signing takes 30-100ms per message. 
                    Signature size is approximately 16KB.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verify" className="space-y-4">
            <Card className="bg-slate-900/80 backdrop-blur-xl border-emerald-500/30">
              <CardHeader>
                <CardTitle className="text-white">Signature Verification Process</CardTitle>
                <CardDescription>How HBSS verifies message authenticity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {verifySteps.map((step, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        index === verifySteps.length - 1 ? 'bg-emerald-600' : 'bg-slate-700'
                      }`}>
                        {index === verifySteps.length - 1 ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-white font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                        <p className="text-slate-400 text-sm mb-2">{step.description}</p>
                        <div className={`p-3 bg-slate-950 rounded border font-mono text-sm ${
                          index === verifySteps.length - 1
                            ? 'border-emerald-500 text-emerald-400'
                            : 'border-slate-700 text-slate-400'
                        }`}>
                          {step.visual}
                        </div>
                        <p className="text-slate-300 text-sm mt-3 italic">
                          💡 {step.detail}
                        </p>
                      </div>
                    </div>
                    {index < verifySteps.length - 1 && (
                      <div className="flex justify-center mt-4">
                        <ArrowRight className="w-6 h-6 text-emerald-400" />
                      </div>
                    )}
                  </div>
                ))}

                <Alert className="bg-emerald-500/10 border-emerald-500/30">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <AlertDescription className="text-emerald-300">
                    <strong>Speed:</strong> Verification takes 30-100ms per message. 
                    Anyone with the public key can verify signatures.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card className="bg-slate-900/80 backdrop-blur-xl border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-white">Security Analysis</CardTitle>
                <CardDescription>Why HBSS is quantum-resistant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <h3 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Quantum Resistance
                    </h3>
                    <p className="text-slate-300 text-sm mb-2">
                      HBSS is secure against quantum computers because it only uses hash functions. 
                      Grover's algorithm (the best quantum attack on hash functions) only provides a quadratic speedup, 
                      which can be countered by using longer hash outputs.
                    </p>
                    <div className="p-3 bg-slate-950 rounded border border-emerald-700 text-sm">
                      <div className="text-emerald-400 font-mono">Classical Security: 2²⁵⁶ operations</div>
                      <div className="text-emerald-400 font-mono">Quantum Security: 2¹²⁸ operations (still secure!)</div>
                    </div>
                  </div>

                  <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <h3 className="text-cyan-400 font-semibold mb-2 flex items-center gap-2">
                      <Hash className="w-5 h-5" />
                      One-Way Functions
                    </h3>
                    <p className="text-slate-300 text-sm mb-2">
                      The security relies on the one-way property of hash functions. 
                      Given a commitment C = H⁵¹²(P), it's computationally infeasible to find P, 
                      even with a quantum computer.
                    </p>
                    <div className="p-3 bg-slate-950 rounded border border-cyan-700 text-sm text-cyan-400 font-mono">
                      Easy: P → H⁵¹²(P) = C<br />
                      Impossible: C → ??? = P
                    </div>
                  </div>

                  <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
                    <h3 className="text-violet-400 font-semibold mb-2 flex items-center gap-2">
                      <Layers className="w-5 h-5" />
                      Merkle Tree Efficiency
                    </h3>
                    <p className="text-slate-300 text-sm mb-2">
                      Using a Merkle tree allows efficient verification without revealing all commitments. 
                      The verifier only needs the root (public key) and the revealed preimages.
                    </p>
                    <div className="p-3 bg-slate-950 rounded border border-violet-700 text-sm text-violet-400 font-mono">
                      Public Key Size: 64 bytes<br />
                      Signature Size: ~16 KB<br />
                      Verification: O(log n) operations
                    </div>
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <h3 className="text-amber-400 font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Limitations
                    </h3>
                    <ul className="text-slate-300 text-sm space-y-2">
                      <li>• <strong>Large signatures:</strong> ~16KB vs ~64 bytes for ECDSA</li>
                      <li>• <strong>Slower:</strong> 30-100ms vs &lt;1ms for ECDSA</li>
                      <li>• <strong>One-time use:</strong> Each preimage should only be revealed once (stateless variant mitigates this)</li>
                      <li>• <strong>Key generation:</strong> Takes 2-5 seconds vs instant for ECDSA</li>
                    </ul>
                  </div>
                </div>

                <Alert className="bg-amber-500/10 border-amber-500/30">
                  <Info className="w-4 h-4 text-amber-400" />
                  <AlertDescription className="text-amber-300">
                    <strong>Trade-off:</strong> HBSS sacrifices speed and size for quantum resistance. 
                    This is acceptable for applications where long-term security is critical.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Comparison */}
        <Card className="bg-slate-900/80 backdrop-blur-xl border-violet-500/30">
          <CardHeader>
            <CardTitle className="text-white">HBSS vs Traditional Signatures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-3 text-slate-400">Feature</th>
                    <th className="text-left p-3 text-emerald-400">HBSS</th>
                    <th className="text-left p-3 text-red-400">RSA/ECDSA</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-800">
                    <td className="p-3">Quantum Resistant</td>
                    <td className="p-3 text-emerald-400">✅ Yes</td>
                    <td className="p-3 text-red-400">❌ No</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="p-3">Signature Size</td>
                    <td className="p-3 text-amber-400">~16 KB</td>
                    <td className="p-3 text-emerald-400">~64 bytes</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="p-3">Signing Speed</td>
                    <td className="p-3 text-amber-400">30-100ms</td>
                    <td className="p-3 text-emerald-400">&lt;1ms</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="p-3">Verification Speed</td>
                    <td className="p-3 text-amber-400">30-100ms</td>
                    <td className="p-3 text-emerald-400">&lt;1ms</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="p-3">Key Generation</td>
                    <td className="p-3 text-amber-400">2-5 seconds</td>
                    <td className="p-3 text-emerald-400">Instant</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="p-3">Security Basis</td>
                    <td className="p-3 text-emerald-400">Hash functions</td>
                    <td className="p-3 text-red-400">Number theory</td>
                  </tr>
                  <tr>
                    <td className="p-3">Future-Proof</td>
                    <td className="p-3 text-emerald-400">✅ Yes</td>
                    <td className="p-3 text-red-400">❌ Vulnerable to quantum</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-700 hover:to-violet-700"
          >
            Back to Chat
          </Button>
        </div>
      </div>
    </div>
  );
}
