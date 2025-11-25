import { useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Router, 
  Server, 
  Smartphone,
  Plus,
  Network,
  Zap,
  Lock
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Node, Connection, Packet, SimulationMode } from './types';

interface NetworkCanvasProps {
  nodes: Node[];
  connections: Connection[];
  packets: Packet[];
  onNodesChange: (nodes: Node[]) => void;
  onConnectionsChange: (connections: Connection[]) => void;
  selectedNode: string | null;
  selectedPacket: string | null;
  selectedConnection: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onSelectPacket: (packetId: string | null) => void;
  onSelectConnection: (connectionId: string | null) => void;
  connecting: string | null;
  onConnecting: (nodeId: string | null) => void;
  simulationMode: SimulationMode;
  quantumMode?: boolean;
  quantumStats?: { bits: number; qber: number; eavesdropper: boolean };
}


export function NetworkCanvas({
  nodes,
  connections,
  packets,
  onNodesChange,
  onConnectionsChange,
  selectedNode,
  selectedPacket,
  selectedConnection,
  onSelectNode,
  onSelectPacket,
  onSelectConnection,
  connecting,
  onConnecting,
  simulationMode,
  quantumMode,
  quantumStats
}: NetworkCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const nodeIcons = {
    client: Smartphone,
    router: Router,
    server: Server
  };

  const getNodeStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'border-cipher-terminal shadow-cipher-terminal/50';
      case 'offline': return 'border-muted-foreground shadow-muted/30';
      case 'compromised': return 'border-destructive shadow-destructive/50 animate-pulse';
      case 'idle': return 'border-cipher-amber shadow-cipher-amber/50';
      default: return 'border-primary shadow-primary/50';
    }
  };

  const getPacketColor = (packet: Packet) => {
    if (packet.dropped) return 'bg-destructive shadow-destructive/80';
    if (!packet.integrity) return 'bg-cipher-danger shadow-cipher-danger/80 animate-pulse';
    if (packet.encrypted) {
      switch (packet.encryptionType) {
        case 'AES-256': return 'bg-cipher-terminal shadow-cipher-terminal/80';
        case 'CipherCore v1.1': return 'bg-primary shadow-primary/80';
        case 'RSA-2048': return 'bg-cipher-glow shadow-cipher-glow/80';
        default: return 'bg-cipher-amber shadow-cipher-amber/80';
      }
    }
    return 'bg-muted-foreground shadow-muted/60';
  };

  const addNode = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current || connecting) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const nodeTypes = ['client', 'router', 'server'] as const;
    const nodeType = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
    
    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      label: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} ${nodes.length + 1}`,
      x,
      y,
      status: 'online',
      cpuLoad: Math.floor(Math.random() * 100),
      memoryUsage: Math.floor(Math.random() * 100),
      networkLoad: Math.floor(Math.random() * 100),
      encryptionModule: nodeType === 'client' ? 'CipherCore v1.1' : 
                      nodeType === 'router' ? 'AES-256' : 'Military-Grade RSA',
      messages: []
    };
    
    onNodesChange([...nodes, newNode]);
  }, [nodes, onNodesChange, connecting]);

  const handleNodeClick = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (connecting) {
      if (connecting !== nodeId) {
        // Create connection
        const newConnection: Connection = {
          id: `conn-${Date.now()}`,
          from: connecting,
          to: nodeId,
          latency: Math.floor(Math.random() * 100) + 10,
          bandwidth: [100, 1000, 10000][Math.floor(Math.random() * 3)],
          encrypted: Math.random() > 0.3,
          status: 'active'
        };
        onConnectionsChange([...connections, newConnection]);
        
        // Add haptic feedback for mobile
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
        
        // Audio feedback
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
      }
      onConnecting(null);
    } else {
      onSelectNode(selectedNode === nodeId ? null : nodeId);
      
      // Add haptic feedback for mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    }
  }, [connecting, selectedNode, connections, onSelectNode, onConnectionsChange, onConnecting]);

  const startConnection = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onConnecting(nodeId);
  }, [onConnecting]);

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary">Network Topology</h3>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="border-primary text-primary">
            <Network className="w-3 h-3 mr-1" />
            {nodes.length} NODES
          </Badge>
          {connecting && (
            <Badge variant="outline" className="border-cipher-amber text-cipher-amber animate-pulse">
              <Zap className="w-3 h-3 mr-1" />
              CONNECTING
            </Badge>
          )}
        </div>
      </div>
      
      <div 
        ref={canvasRef}
        className="relative h-96 bg-muted/5 rounded-lg border border-primary/20 overflow-hidden cursor-crosshair"
        onClick={addNode}
      >
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {connections.map(conn => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            if (!fromNode || !toNode) return null;
            
            const isSelected = selectedConnection === conn.id;
            const hasTraffic = packets.some(p => (p.source === conn.from && p.destination === conn.to) || (p.source === conn.to && p.destination === conn.from));
            
            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const mx = (fromNode.x + toNode.x) / 2;
            const my = (fromNode.y + toNode.y) / 2;
            const norm = Math.hypot(dx, dy) || 1;
            const off = 40;
            const cx = mx - (dy / norm) * off;
            const cy = my + (dx / norm) * off;
            const pathD = `M ${fromNode.x},${fromNode.y} Q ${cx},${cy} ${toNode.x},${toNode.y}`;
            
            return (
              <g key={conn.id}>
                <path
                  d={pathD}
                  stroke={conn.encrypted ? "hsl(var(--cipher-terminal))" : "hsl(var(--muted-foreground))"}
                  strokeWidth={isSelected ? 4 : 2}
                  className={`cursor-pointer ${hasTraffic ? "dash-flow" : ""} ${conn.status === 'active' ? "" : "opacity-60"}`}
                  style={{ pointerEvents: 'stroke' }}
                  fill="none"
                />
                {/* Quantum photon visualization */}
                {quantumMode && (
                  <circle
                    cx={(fromNode.x + toNode.x) / 2}
                    cy={(fromNode.y + toNode.y) / 2 - 10}
                    r="3"
                    fill="hsl(var(--primary))"
                    className="photon"
                  />
                )}
                
                {/* Connection status indicator */}
                <circle
                  cx={(fromNode.x + toNode.x) / 2}
                  cy={(fromNode.y + toNode.y) / 2}
                  r={isSelected ? "5" : "3"}
                  fill={conn.status === 'active' ? "hsl(var(--cipher-terminal))" : "hsl(var(--muted-foreground))"}
                  className={`cursor-pointer ${conn.status === 'active' ? "animate-pulse" : ""} ${isSelected ? "animate-ping" : ""}`}
                  style={{ pointerEvents: 'all' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectConnection?.(selectedConnection === conn.id ? null : conn.id);
                    if ('vibrate' in navigator) {
                      navigator.vibrate(30);
                    }
                  }}
                />
                
                {/* Connection info on hover/select */}
                {isSelected && (
                  <foreignObject
                    x={(fromNode.x + toNode.x) / 2 - 40}
                    y={(fromNode.y + toNode.y) / 2 + 10}
                    width="80"
                    height="30"
                  >
                    <div className="bg-background/95 backdrop-blur-sm border border-primary/20 rounded px-2 py-1 text-xs font-mono text-center">
                      {conn.latency}ms • {conn.bandwidth}Mbps
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>
        
        {/* Nodes */}
        {nodes.map(node => {
          const Icon = nodeIcons[node.type];
          const isSelected = selectedNode === node.id;
          const isConnecting = connecting === node.id;
          
          return (
            <div
              key={node.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 transition-all duration-200 ${
                isSelected ? 'scale-110' : 'hover:scale-105'
              }`}
              style={{ left: node.x, top: node.y }}
              onClick={(e) => handleNodeClick(node.id, e)}
              onDoubleClick={(e) => startConnection(node.id, e)}
            >
              <div className={`
                relative w-16 h-16 rounded-full border-2 
                ${getNodeStatusColor(node.status)} 
                ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                ${isConnecting ? 'ring-2 ring-cipher-amber ring-offset-2 ring-offset-background animate-pulse' : ''}
                bg-background/90 backdrop-blur-sm flex items-center justify-center 
                shadow-lg transition-all duration-200
              `}>
                <Icon className="w-8 h-8" />
                
                {/* Status indicator */}
                <div className={`
                  absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background
                  ${node.status === 'online' ? 'bg-cipher-terminal' : 
                    node.status === 'compromised' ? 'bg-destructive animate-pulse' :
                    node.status === 'idle' ? 'bg-cipher-amber' : 'bg-muted-foreground'}
                `} />
                
                {/* Load indicators */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                  <div className="flex space-x-1">
                    <div className={`w-1 h-2 rounded ${node.cpuLoad > 80 ? 'bg-destructive' : node.cpuLoad > 50 ? 'bg-cipher-amber' : 'bg-cipher-terminal'}`} />
                    <div className={`w-1 h-2 rounded ${node.memoryUsage > 80 ? 'bg-destructive' : node.memoryUsage > 50 ? 'bg-cipher-amber' : 'bg-cipher-terminal'}`} />
                    <div className={`w-1 h-2 rounded ${node.networkLoad > 80 ? 'bg-destructive' : node.networkLoad > 50 ? 'bg-cipher-amber' : 'bg-cipher-terminal'}`} />
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-center mt-2 font-mono text-foreground">
                {node.label}
              </div>
            </div>
          );
        })}
        
        {/* Packets */}
        {packets.map(packet => {
          const fromNode = nodes.find(n => n.id === packet.source);
          const toNode = nodes.find(n => n.id === packet.destination);
          if (!fromNode || !toNode) return null;
          
          const x = fromNode.x + (toNode.x - fromNode.x) * (packet.progress / 100);
          const y = fromNode.y + (toNode.y - fromNode.y) * (packet.progress / 100);
          
          const isSelected = selectedPacket === packet.id;
          
          return (
            <Tooltip key={packet.id}>
              <TooltipTrigger asChild>
                <div
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 transition-all duration-150 ${
                    isSelected ? 'scale-150' : 'hover:scale-125'
                  }`}
                  style={{ left: x, top: y }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPacket(selectedPacket === packet.id ? null : packet.id);
                  }}
                >
                  <div className={`
                    w-3 h-3 rounded-full 
                    ${getPacketColor(packet)}
                    ${simulationMode === 'running' ? 'animate-pulse' : ''}
                    ${isSelected ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
                    transition-all duration-150
                  `}>
                    {/* Packet trail effect */}
                    <div className="absolute inset-0 rounded-full bg-current opacity-40 animate-ping" />
                    <div className="absolute inset-0 rounded-full bg-current opacity-60" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="font-mono text-xs">
                <div className="space-y-0.5">
                  <div>{packet.encrypted ? 'Encrypted' : 'Plaintext'} • {packet.encryptionType}</div>
                  <div>{packet.protocol} • {packet.size} bytes</div>
                  <div>{new Date(packet.timestamp).toLocaleTimeString()}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
        
        {/* Instructions */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Plus className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-mono text-sm">Click to place nodes</p>
              <p className="text-xs">Double-click to connect nodes</p>
            </div>
          </div>
        )}
        
        {connecting && (
          <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm border border-cipher-amber/50 rounded px-3 py-2 text-sm font-mono text-cipher-amber">
            Click another node to create connection
          </div>
        )}
      </div>
    </Card>
  );
}