import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  PackageX, 
  RotateCcw, 
  Activity,
  Gauge,
  Cpu,
  Shield,
  Bug,
  AlertTriangle,
  Terminal,
  RefreshCw
} from 'lucide-react';

interface NetworkToolbarProps {
  onSendPacket: () => void;
  onClearSimulation: () => void;
  simulationSpeed: number;
  onSpeedChange: (speed: number) => void;
  entropyLevel: number;
  onResetTopology: () => void;
  onInjectFault: () => void;
  debugMode: boolean;
  onDebugModeChange: (enabled: boolean) => void;
  logs: string[];
  quantumMode: boolean;
  onToggleQuantumMode: (enabled: boolean) => void;
  educationalMode: boolean;
  onToggleEducationalMode: (enabled: boolean) => void;
  onEstablishSecureChannel: () => void;
  secureStatus: { active: boolean; type: string; keyStrength: string } | null;
  quantumStats?: { bits: number; qber: number; eavesdropper: boolean };
}

export function NetworkToolbar({
  onSendPacket,
  onClearSimulation,
  simulationSpeed,
  onSpeedChange,
  entropyLevel,
  onResetTopology,
  onInjectFault,
  debugMode,
  onDebugModeChange,
  logs,
  quantumMode,
  onToggleQuantumMode,
  educationalMode,
  onToggleEducationalMode,
  onEstablishSecureChannel,
  secureStatus,
  quantumStats
}: NetworkToolbarProps) {
  const getEntropyColor = () => {
    if (entropyLevel > 70) return 'text-cipher-terminal';
    if (entropyLevel > 40) return 'text-cipher-amber';
    return 'text-destructive';
  };

  const getEntropyStatus = () => {
    if (entropyLevel > 70) return 'OPTIMAL';
    if (entropyLevel > 40) return 'MODERATE';
    return 'LOW';
  };

  return (
    <Card className="glass-panel p-6">
      <h3 className="text-lg font-semibold text-primary mb-4">Simulation Control</h3>
      
      <div className="space-y-6">
        {/* Entropy Monitor */}
        <div className="message-block">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-sm font-semibold">
              <Activity className="w-4 h-4 mr-2" />
              Entropy Level
            </div>
            <Badge variant="outline" className={`border-current ${getEntropyColor()}`}>
              {getEntropyStatus()}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span>0%</span>
              <span className={getEntropyColor()}>{entropyLevel.toFixed(1)}%</span>
              <span>100%</span>
            </div>
            <Progress value={entropyLevel} className="h-2" />
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            System randomness for cryptographic operations
          </p>
        </div>

        {/* Simulation Speed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              <Gauge className="w-4 h-4 inline mr-2" />
              Speed Multiplier
            </label>
            <Badge variant="outline" className="border-primary text-primary">
              {simulationSpeed}x
            </Badge>
          </div>
          
          <Slider
            value={[simulationSpeed]}
            onValueChange={(value) => onSpeedChange(value[0])}
            min={0.5}
            max={5}
            step={0.5}
            className="w-full"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.5x</span>
            <span>2.5x</span>
            <span>5x</span>
          </div>
        </div>

        {/* Modes & Security */}
        <div className="message-block">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Modes</span>
              <div className="flex gap-2">
                <Button
                  variant={quantumMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onToggleQuantumMode(!quantumMode)}
                >
                  QKD {quantumMode ? 'On' : 'Off'}
                </Button>
                <Button
                  variant={educationalMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onToggleEducationalMode(!educationalMode)}
                >
                  {educationalMode ? 'Educational' : 'Live'}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Secure Channel</span>
              <div className="flex items-center gap-2">
                {secureStatus?.active ? (
                  <Badge variant="outline" className="border-cipher-terminal text-cipher-terminal">
                    {secureStatus.type} • {secureStatus.keyStrength}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-muted-foreground text-muted-foreground">Inactive</Badge>
                )}
                <Button size="sm" className="cipher-button" onClick={onEstablishSecureChannel}>Secure Channel</Button>
              </div>
            </div>

            {quantumMode && (
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2 rounded border border-primary/20 bg-muted/5">
                  <div className="text-muted-foreground">Bits</div>
                  <div className="text-primary font-semibold">{quantumStats?.bits ?? 0}</div>
                </div>
                <div className="p-2 rounded border border-primary/20 bg-muted/5">
                  <div className="text-muted-foreground">QBER</div>
                  <div className={quantumStats && quantumStats.qber > 5 ? 'text-destructive font-semibold' : 'text-primary font-semibold'}>
                    {(quantumStats?.qber ?? 0).toFixed(1)}%
                  </div>
                </div>
                <div className="p-2 rounded border border-primary/20 bg-muted/5">
                  <div className="text-muted-foreground">Intrusion</div>
                  <div className={quantumStats?.eavesdropper ? 'text-destructive font-semibold' : 'text-cipher-terminal font-semibold'}>
                    {quantumStats?.eavesdropper ? 'Detected' : 'Clear'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* System Stats */}
        <div className="message-block">
          <div className="text-sm font-semibold mb-3 flex items-center">
            <Cpu className="w-4 h-4 mr-2" />
            System Overview
          </div>
          
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span>Simulation Engine</span>
              <span className="text-cipher-terminal">ACTIVE</span>
            </div>
            <div className="flex justify-between">
              <span>Crypto Modules</span>
              <span className="text-cipher-terminal">LOADED</span>
            </div>
            <div className="flex justify-between">
              <span>Network Security</span>
              <span className="text-cipher-terminal">ENABLED</span>
            </div>
            <div className="flex justify-between">
              <span>Packet Integrity</span>
              <span className="text-cipher-terminal">VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={onSendPacket} 
            className="cipher-button w-full"
          >
            <Zap className="w-4 h-4 mr-2" />
            Send Test Packet
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onClearSimulation}
            className="w-full"
          >
            <PackageX className="w-4 h-4 mr-2" />
            Clear Simulation
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onResetTopology}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Topology
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onInjectFault}
            className="w-full border-cipher-danger text-cipher-danger hover:bg-cipher-danger/10"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Inject Fault
          </Button>
          
          <Button 
            variant={debugMode ? "default" : "outline"}
            onClick={() => onDebugModeChange(!debugMode)}
            className="w-full"
          >
            <Bug className="w-4 h-4 mr-2" />
            Debug Mode
          </Button>
        </div>

        {/* Debug Logs */}
        {debugMode && (
          <div className="message-block border border-cipher-amber/30">
            <div className="flex items-center space-x-2 mb-3">
              <Terminal className="w-4 h-4 text-cipher-amber" />
              <span className="text-xs font-semibold text-cipher-amber">DEBUG CONSOLE</span>
            </div>
            
            <div className="terminal-input h-32 overflow-y-auto text-xs font-mono space-y-1">
              {logs.length === 0 ? (
                <div className="text-muted-foreground">No debug logs yet...</div>
              ) : (
                logs.slice(0, 10).map((log, index) => (
                  <div key={index} className="text-foreground">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="message-block border border-cipher-terminal/30">
          <div className="flex items-start space-x-2">
            <Shield className="w-4 h-4 text-cipher-terminal mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs font-semibold text-cipher-terminal mb-1">
                SECURE ENVIRONMENT
              </div>
              <p className="text-xs text-muted-foreground">
                All simulations run in isolated sandbox with military-grade encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}