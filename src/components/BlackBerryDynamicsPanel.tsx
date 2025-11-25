import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Server, 
  Globe, 
  Activity,
  CheckCircle,
  AlertTriangle,
  Zap,
  HardDrive,
  Key,
  Eye
} from 'lucide-react';

interface BlackBerryDynamicsPanelProps {
  isConnected: boolean;
  onToggleConnection: () => void;
  className?: string;
}

export default function BlackBerryDynamicsPanel({ 
  isConnected, 
  onToggleConnection, 
  className 
}: BlackBerryDynamicsPanelProps) {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [encryptionType, setEncryptionType] = useState<'AES-256' | 'ChaCha20' | 'Hybrid'>('AES-256');
  const [keyStrength, setKeyStrength] = useState(256);
  const [latency, setLatency] = useState(0);
  const [throughput, setThroughput] = useState(0);
  const [containerStatus, setContainerStatus] = useState<'secured' | 'initializing' | 'error'>('secured');

  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('connecting');
      
      // Simulate connection process
      setTimeout(() => {
        setConnectionStatus('connected');
        setLatency(Math.random() * 50 + 10); // 10-60ms
        setThroughput(Math.random() * 500 + 200); // 200-700 Mbps
      }, 2000);

      // Simulate real-time metrics
      const metricsInterval = setInterval(() => {
        setLatency(prev => prev + (Math.random() - 0.5) * 10);
        setThroughput(prev => prev + (Math.random() - 0.5) * 100);
      }, 3000);

      return () => clearInterval(metricsInterval);
    } else {
      setConnectionStatus('disconnected');
    }
  }, [isConnected]);

  const handleEstablishChannel = () => {
    if (connectionStatus === 'disconnected') {
      onToggleConnection();
      
      // Simulate BlackBerry Dynamics SDK initialization
      setContainerStatus('initializing');
      setTimeout(() => {
        setContainerStatus('secured');
      }, 1500);
    } else {
      onToggleConnection();
      setConnectionStatus('disconnected');
      setContainerStatus('secured');
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'status-blackberry';
      case 'connecting': return 'status-warning';
      case 'disconnected': return 'status-danger';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'SECURE TUNNEL ACTIVE';
      case 'connecting': return 'ESTABLISHING CONNECTION';
      case 'disconnected': return 'DISCONNECTED';
    }
  };

  return (
    <Card className={`glass-panel p-6 ${isConnected ? 'bb-secure-channel' : ''} ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-neon-blue" />
            <h3 className="text-lg font-semibold text-neon-blue">BlackBerry Dynamics</h3>
          </div>
          <Badge variant="outline" className={`${getStatusColor()} font-mono text-xs`}>
            {getStatusText()}
          </Badge>
        </div>

        {/* Connection Controls */}
        <div className="space-y-3">
          <Button
            onClick={handleEstablishChannel}
            className={`w-full ${isConnected ? 'gradient-threat' : 'gradient-cyber'}`}
            disabled={connectionStatus === 'connecting'}
          >
            {connectionStatus === 'connecting' ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-spin" />
                Establishing Secure Channel...
              </>
            ) : isConnected ? (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Disconnect Secure Channel
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Establish Secure Channel
              </>
            )}
          </Button>

          {connectionStatus === 'connecting' && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Initializing BlackBerry Dynamics SDK...</div>
              <div className="w-full bg-muted/30 rounded-full h-2">
                <div className="bg-neon-blue h-2 rounded-full animate-data-stream w-1/3" />
              </div>
            </div>
          )}
        </div>

        {/* Connection Details */}
        {isConnected && connectionStatus === 'connected' && (
          <div className="space-y-4 pt-4 border-t border-neon-blue/30">
            {/* Encryption Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Key className="w-3 h-3" />
                  <span>Encryption</span>
                </div>
                <div className="text-sm font-mono text-neon-blue">{encryptionType}</div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Shield className="w-3 h-3" />
                  <span>Key Strength</span>
                </div>
                <div className="text-sm font-mono text-neon-blue">{keyStrength} bits</div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Zap className="w-3 h-3" />
                  <span>Latency</span>
                </div>
                <div className="text-sm font-mono">{latency.toFixed(1)} ms</div>
                <div className="w-full bg-muted/30 rounded-full h-1">
                  <div 
                    className="bg-neon-blue h-1 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(0, 100 - latency)}%` }}
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Activity className="w-3 h-3" />
                  <span>Throughput</span>
                </div>
                <div className="text-sm font-mono">{throughput.toFixed(0)} Mbps</div>
                <div className="w-full bg-muted/30 rounded-full h-1">
                  <div 
                    className="bg-neon-blue h-1 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, throughput / 10)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-neon-blue">Active Security Features</h4>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="w-3 h-3 text-neon-green" />
                    <span>App Containerization</span>
                  </div>
                  <CheckCircle className="w-3 h-3 text-neon-green" />
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-3 h-3 text-neon-green" />
                    <span>Secure Gateway</span>
                  </div>
                  <CheckCircle className="w-3 h-3 text-neon-green" />
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-3 h-3 text-neon-green" />
                    <span>DLP Monitoring</span>
                  </div>
                  <CheckCircle className="w-3 h-3 text-neon-green" />
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Server className="w-3 h-3 text-neon-green" />
                    <span>Enterprise Policies</span>
                  </div>
                  <CheckCircle className="w-3 h-3 text-neon-green" />
                </div>
              </div>
            </div>

            {/* Container Status */}
            <div className="pt-3 border-t border-neon-blue/30">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-neon-blue" />
                  <span>Container Status</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    containerStatus === 'secured' ? 'text-neon-green border-neon-green' :
                    containerStatus === 'initializing' ? 'text-yellow-400 border-yellow-400' :
                    'text-red-400 border-red-400'
                  }`}
                >
                  {containerStatus === 'secured' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {containerStatus === 'initializing' && <Activity className="w-3 h-3 mr-1 animate-spin" />}
                  {containerStatus === 'error' && <AlertTriangle className="w-3 h-3 mr-1" />}
                  {containerStatus.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* SDK Information */}
        <div className="pt-3 border-t border-border/50">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• Enterprise-grade mobile security platform</div>
            <div>• Secure app containerization and VPN tunneling</div>
            <div>• Policy enforcement and remote management</div>
            <div>• FIPS 140-2 Level 1 certified encryption</div>
          </div>
        </div>
      </div>
    </Card>
  );
}