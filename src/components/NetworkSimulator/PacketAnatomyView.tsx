import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Shield, 
  Network,
  Clock,
  Hash,
  Layers,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Packet } from './types';

interface PacketAnatomyViewProps {
  packet: Packet | null;
}

export function PacketAnatomyView({ packet }: PacketAnatomyViewProps) {
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getHeaderColor = (type: string) => {
    switch (type) {
      case 'network': return 'border-cipher-terminal text-cipher-terminal';
      case 'transport': return 'border-primary text-primary';
      case 'encryption': return 'border-cipher-glow text-cipher-glow';
      case 'application': return 'border-cipher-amber text-cipher-amber';
      default: return 'border-muted-foreground text-muted-foreground';
    }
  };

  const packetLayers = packet ? [
    {
      name: 'Application Layer',
      type: 'application',
      data: {
        'Payload': packet.payload,
        'Content-Length': `${packet.size} bytes`,
        'Content-Type': 'application/encrypted'
      }
    },
    {
      name: 'Encryption Layer',
      type: 'encryption',
      data: {
        'Algorithm': packet.encryptionType,
        'Key-Exchange': packet.encrypted ? 'ECDH-256' : 'None',
        'Integrity': packet.integrity ? 'HMAC-SHA256' : 'COMPROMISED',
        'Cipher-Mode': packet.encrypted ? 'GCM' : 'Plaintext'
      }
    },
    {
      name: 'Transport Layer',
      type: 'transport',
      data: {
        'Protocol': packet.protocol,
        'Source-Port': '443',
        'Dest-Port': '8080',
        'Flags': packet.flags,
        'Priority': packet.priority
      }
    },
    {
      name: 'Network Layer',
      type: 'network',
      data: {
        'Source-IP': packet.sourceIP,
        'Dest-IP': packet.destIP,
        'TTL': packet.ttl.toString(),
        'Packet-ID': packet.id.substring(0, 12) + '...',
        'Hops': packet.hops.toString()
      }
    }
  ] : [];

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary flex items-center">
          <Layers className="w-5 h-5 mr-2" />
          Packet Anatomy
        </h3>
        
        {packet && (
          <div className="flex space-x-2">
            <Badge variant="outline" className="border-primary text-primary">
              {packet.protocol}
            </Badge>
            {packet.integrity ? (
              <Badge variant="outline" className="border-cipher-terminal text-cipher-terminal">
                <CheckCircle className="w-3 h-3 mr-1" />
                VERIFIED
              </Badge>
            ) : (
              <Badge variant="outline" className="border-destructive text-destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                COMPROMISED
              </Badge>
            )}
          </div>
        )}
      </div>

      {packet ? (
        <div className="space-y-4">
          {/* Packet Overview */}
          <div className="message-block">
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <div className="text-muted-foreground mb-1">Packet ID</div>
                <div className="flex items-center">
                  <Hash className="w-3 h-3 mr-1" />
                  {packet.id.substring(0, 16)}...
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Timestamp</div>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTimestamp(packet.timestamp)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Total Size</div>
                <div>{packet.size} bytes</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Transmission</div>
                <div>{Math.round(packet.progress)}% complete</div>
              </div>
            </div>
            
            <div className="mt-3">
              <Progress value={packet.progress} className="h-2" />
            </div>
          </div>

          {/* Protocol Stack */}
          <div className="space-y-3">
            {packetLayers.map((layer, index) => (
              <div key={layer.name} className="message-block">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded border-2 ${getHeaderColor(layer.type)}`} />
                    <span className="font-semibold text-sm">{layer.name}</span>
                  </div>
                  <Badge variant="outline" className={`text-xs ${getHeaderColor(layer.type)}`}>
                    L{packetLayers.length - index}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 gap-2 text-xs font-mono">
                  {Object.entries(layer.data).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground">{key}:</span>
                      <span className={
                        key === 'Integrity' && value === 'COMPROMISED' ? 'text-destructive' :
                        key.includes('Cipher') || key.includes('Algorithm') ? 'text-cipher-terminal' :
                        'text-foreground'
                      }>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Security Analysis */}
          <div className="message-block border border-cipher-terminal/30">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-4 h-4 text-cipher-terminal" />
              <span className="font-semibold text-sm text-cipher-terminal">Security Analysis</span>
            </div>
            
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span>Encryption Status:</span>
                <span className={packet.encrypted ? 'text-cipher-terminal' : 'text-cipher-amber'}>
                  {packet.encrypted ? 'ENCRYPTED' : 'PLAINTEXT'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Data Integrity:</span>
                <span className={packet.integrity ? 'text-cipher-terminal' : 'text-destructive'}>
                  {packet.integrity ? 'INTACT' : 'COMPROMISED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Packet State:</span>
                <span className={packet.dropped ? 'text-destructive' : 'text-cipher-terminal'}>
                  {packet.dropped ? 'DROPPED' : 'ACTIVE'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Jitter:</span>
                <span className="text-foreground">{Math.round(packet.jitter)}ms</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p className="font-mono text-sm">Select a packet to analyze</p>
          <p className="text-xs">View detailed protocol stack breakdown</p>
        </div>
      )}
    </Card>
  );
}