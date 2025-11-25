import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Plus, 
  Play, 
  QrCode, 
  RotateCcw, 
  Shuffle, 
  Eye, 
  EyeOff,
  Download,
  Copy,
  CheckCircle
} from 'lucide-react';

interface CipherStep {
  id: string;
  type: 'XOR' | 'ROTATE' | 'MASK' | 'SUBSTITUTE';
  params: { [key: string]: any };
  description: string;
}

interface CipherBuilderProps {
  onBack: () => void;
}

export default function CipherBuilder({ onBack }: CipherBuilderProps) {
  const [steps, setSteps] = useState<CipherStep[]>([]);
  const [testInput, setTestInput] = useState('Hello, World!');
  const [testOutput, setTestOutput] = useState('');
  const [showQR, setShowQR] = useState(false);

  const cipherOperations = [
    { type: 'XOR', icon: '⊕', description: 'XOR with key' },
    { type: 'ROTATE', icon: '↻', description: 'Rotate bits' },
    { type: 'MASK', icon: '▣', description: 'Apply bit mask' },
    { type: 'SUBSTITUTE', icon: '⇄', description: 'Character substitution' }
  ];

  const addStep = (type: CipherStep['type']) => {
    const newStep: CipherStep = {
      id: Date.now().toString(),
      type,
      params: type === 'XOR' ? { key: '0xFF' } : 
             type === 'ROTATE' ? { positions: 3 } :
             type === 'MASK' ? { mask: '0xAA' } :
             { mapping: 'A-Z→N-ZA-M' },
      description: cipherOperations.find(op => op.type === type)?.description || ''
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(step => step.id !== id));
  };

  const runTest = () => {
    let result = testInput;
    // Simulate encryption process
    steps.forEach(step => {
      switch (step.type) {
        case 'XOR':
          result = result.split('').map(c => 
            String.fromCharCode(c.charCodeAt(0) ^ 0xFF)
          ).join('');
          break;
        case 'ROTATE':
          result = result.slice(step.params.positions) + result.slice(0, step.params.positions);
          break;
        // Add more operations as needed
      }
    });
    setTestOutput(btoa(result)); // Base64 encode for display
  };

  const exportConfig = () => {
    setShowQR(true);
    setTimeout(() => setShowQR(false), 5000);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold holo-text">Cipher Laboratory</h2>
                <p className="text-sm text-muted-foreground font-mono">
                  Design custom encryption algorithms
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={exportConfig}>
                <QrCode className="w-4 h-4 mr-2" />
                Export QR
              </Button>
              <Button className="cipher-button" onClick={runTest}>
                <Play className="w-4 h-4 mr-2" />
                Test Cipher
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Operations Panel */}
          <Card className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Available Operations
            </h3>
            
            <div className="space-y-3">
              {cipherOperations.map((op) => (
                <Button
                  key={op.type}
                  variant="outline"
                  className="w-full justify-start border-primary/50 hover:bg-primary/10"
                  onClick={() => addStep(op.type as CipherStep['type'])}
                >
                  <span className="text-lg mr-3">{op.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold text-sm">{op.type}</div>
                    <div className="text-xs text-muted-foreground">{op.description}</div>
                  </div>
                  <Plus className="w-4 h-4 ml-auto" />
                </Button>
              ))}
            </div>
          </Card>

          {/* Cipher Pipeline */}
          <Card className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">
                Cipher Pipeline
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSteps([])}
                disabled={steps.length === 0}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
            
            {steps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shuffle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-mono text-sm">No operations added</p>
                <p className="text-xs">Drag operations from the left panel</p>
              </div>
            ) : (
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={step.id} className="message-block">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-primary text-primary text-xs">
                          Step {index + 1}
                        </Badge>
                        <span className="font-semibold text-sm">{step.type}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeStep(step.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {step.description}
                    </p>
                    
                    <div className="font-mono text-xs bg-muted/30 p-2 rounded">
                      {JSON.stringify(step.params)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Test Panel */}
          <Card className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Test & Debug
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Input Text
                </label>
                <Input
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="terminal-input"
                  placeholder="Enter test message..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Encrypted Output
                </label>
                <div className="relative">
                  <div className="terminal-input min-h-[100px] p-3 font-mono text-sm break-all">
                    {testOutput || 'Run test to see encrypted output...'}
                  </div>
                  {testOutput && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => navigator.clipboard.writeText(testOutput)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={runTest} 
                className="cipher-button w-full"
                disabled={steps.length === 0}
              >
                <Play className="w-4 h-4 mr-2" />
                Execute Test
              </Button>
              
              {testOutput && (
                <div className="flex items-center space-x-2 text-sm text-primary">
                  <CheckCircle className="w-4 h-4" />
                  <span>Encryption successful</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* QR Code Modal */}
        {showQR && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="glass-panel p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-primary mb-4">
                  Cipher Configuration
                </h3>
                
                {/* Placeholder QR Code */}
                <div className="w-48 h-48 mx-auto mb-4 bg-muted/30 rounded-lg flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-primary" />
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 font-mono">
                  Scan to import cipher configuration
                </p>
                
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Save Config
                  </Button>
                  <Button 
                    className="cipher-button flex-1"
                    onClick={() => setShowQR(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}