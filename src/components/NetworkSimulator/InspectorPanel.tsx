import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Shield, 
  AlertTriangle,
  RotateCcw,
  Clock,
  Zap
} from 'lucide-react';
import { Node, Packet, Connection } from './types';

interface InspectorPanelProps {
  selectedNode: Node | null;
  selectedPacket: Packet | null;
  selectedConnection: Connection | null;
  onRetryPacket: (packet: Packet | null) => void;
}

export function InspectorPanel({ 
  selectedNode, 
  selectedPacket, 
  selectedConnection,
  onRetryPacket 
}: InspectorPanelProps) {
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'online': return 'border-cipher-terminal text-cipher-terminal';
      case 'compromised': return 'border-destructive text-destructive';
      case 'idle': return 'border-cipher-amber text-cipher-amber';
      default: return 'border-muted-foreground text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'border-destructive text-destructive';
      case 'Medium': return 'border-cipher-amber text-cipher-amber';
      case 'Low': return 'border-cipher-terminal text-cipher-terminal';
      default: return 'border-muted-foreground text-muted-foreground';
    }
  };

  return (
    <Card className="glass-panel p-6 h-fit">
      <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
        <Eye className="w-5 h-5 mr-2" />
        Cyber Inspector
      </h3>
      
      {selectedNode && (
        <div className="space-y-4">
          <div className="message-block">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm">Node Analysis</span>
              <Badge variant="outline" className={getStatusBadgeColor(selectedNode.status)}>
                {selectedNode.status.toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Node Identity</div>
                <div className="font-mono text-sm">{selectedNode.label}</div>
                <div className="font-mono text-xs text-muted-foreground">ID: {selectedNode.id}</div>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground mb-1">Encryption Module</div>
                <div className="font-mono text-sm text-cipher-terminal">{selectedNode.encryptionModule}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs">
                    <Cpu className="w-3 h-3 mr-1" />
                    CPU Load
                  </div>
                  <span className="font-mono text-xs">{selectedNode.cpuLoad}%</span>
                </div>
                <Progress value={selectedNode.cpuLoad} className="h-1" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs">
                    <HardDrive className="w-3 h-3 mr-1" />
                    Memory
                  </div>
                  <span className="font-mono text-xs">{selectedNode.memoryUsage}%</span>
                </div>
                <Progress value={selectedNode.memoryUsage} className="h-1" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs">
                    <Wifi className="w-3 h-3 mr-1" />
                    Network
                  </div>
                  <span className="font-mono text-xs">{selectedNode.networkLoad}%</span>
                </div>
                <Progress value={selectedNode.networkLoad} className="h-1" />
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground mb-1">Position</div>
                <div className="font-mono text-xs">
                  X: {Math.round(selectedNode.x)} | Y: {Math.round(selectedNode.y)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {selectedPacket && (
        <div className="space-y-4">
          <div className="message-block">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm">Packet Analysis</span>
              <div className="flex space-x-1">
                <Badge 
                  variant="outline" 
                  className={selectedPacket.encrypted ? 'border-cipher-terminal text-cipher-terminal' : 'border-cipher-amber text-cipher-amber'}
                >
                  {selectedPacket.encrypted ? 'ENCRYPTED' : 'PLAINTEXT'}
                </Badge>
                <Badge variant="outline" className={getPriorityColor(selectedPacket.priority)}>
                  {selectedPacket.priority}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <div className="text-muted-foreground">Source IP</div>
                  <div>{selectedPacket.sourceIP}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Dest IP</div>
                  <div>{selectedPacket.destIP}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Protocol</div>
                  <div>{selectedPacket.protocol}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Size</div>
                  <div>{selectedPacket.size} bytes</div>
                </div>
                <div>
                  <div className="text-muted-foreground">TTL</div>
                  <div>{selectedPacket.ttl}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Hops</div>
                  <div>{selectedPacket.hops}</div>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground mb-1">Encryption Layer</div>
                <div className="font-mono text-sm text-cipher-terminal">{selectedPacket.encryptionType}</div>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground mb-1">Progress</div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs">{Math.round(selectedPacket.progress)}%</span>
                  <span className="font-mono text-xs">{selectedPacket.delay}ms delay</span>
                </div>
                <Progress value={selectedPacket.progress} className="h-2" />
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground mb-1">Timestamp</div>
                <div className="font-mono text-xs flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTimestamp(selectedPacket.timestamp)}
                </div>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground mb-1">Payload</div>
                <div className="font-mono text-xs p-2 bg-muted/20 rounded border">
                  {selectedPacket.payload}
                </div>
              </div>
              
              {!selectedPacket.integrity && (
                <div className="flex items-center space-x-2 text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-semibold">INTEGRITY COMPROMISED</span>
                </div>
              )}
              
              {selectedPacket.dropped && (
                <div className="flex items-center space-x-2 text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-semibold">PACKET DROPPED</span>
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onRetryPacket(selectedPacket)}
                className="w-full cipher-button"
              >
                <RotateCcw className="w-3 h-3 mr-2" />
                Retry Transmission
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {selectedConnection && (
        <div className="space-y-4">
          <div className="message-block">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm">Connection Analysis</span>
              <Badge 
                variant="outline" 
                className={selectedConnection.encrypted ? 'border-cipher-terminal text-cipher-terminal' : 'border-muted-foreground text-muted-foreground'}
              >
                {selectedConnection.encrypted ? 'SECURED' : 'UNSECURED'}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <div className="text-muted-foreground">From</div>
                  <div>{selectedConnection.from}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">To</div>
                  <div>{selectedConnection.to}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Latency</div>
                  <div>{selectedConnection.latency}ms</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Bandwidth</div>
                  <div>{selectedConnection.bandwidth} Mbps</div>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground mb-1">Status</div>
                <Badge variant="outline" className={getStatusBadgeColor(selectedConnection.status)}>
                  {selectedConnection.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!selectedNode && !selectedPacket && !selectedConnection && (
        <div className="text-center py-8 text-muted-foreground">
          <Eye className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p className="font-mono text-sm">Select a node, packet, or connection</p>
          <p className="text-xs">to view detailed analysis</p>
        </div>
      )}
    </Card>
  );
}