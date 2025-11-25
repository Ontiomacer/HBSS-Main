import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Shield, 
  Network, 
  Zap, 
  Activity,
  Lock,
  Globe,
  Router,
  Server,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Eye,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface NetworkNode {
  id: string;
  type: 'device' | 'server' | 'router' | 'bb-gateway' | 'vpn' | 'internet';
  name: string;
  status: 'online' | 'offline' | 'warning' | 'secure';
  position: { x: number; y: number };
  connections: string[];
  security: {
    encrypted: boolean;
    protocol: string;
    strength: 'low' | 'medium' | 'high' | 'quantum';
  };
  blackBerryEnabled?: boolean;
  tunnelActive?: boolean;
}

interface NetworkConnection {
  id: string;
  from: string;
  to: string;
  type: 'standard' | 'encrypted' | 'bb-tunnel' | 'vpn';
  status: 'active' | 'inactive' | 'compromised';
  throughput: number;
  latency: number;
}

interface NetworkSimulatorExtendedProps {
  onBack: () => void;
}

export default function NetworkSimulatorExtended({ onBack }: NetworkSimulatorExtendedProps) {
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [connections, setConnections] = useState<NetworkConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showBBTunnels, setShowBBTunnels] = useState(true);
  const [threatLevel, setThreatLevel] = useState(0);

  useEffect(() => {
    initializeNetwork();
  }, []);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(simulateNetworkActivity, 2000);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  const initializeNetwork = () => {
    const initialNodes: NetworkNode[] = [
      {
        id: 'mobile1',
        type: 'device',
        name: 'Secure Mobile',
        status: 'secure',
        position: { x: 100, y: 300 },
        connections: ['bb-gateway'],
        security: { encrypted: true, protocol: 'BB-Dynamics', strength: 'quantum' },
        blackBerryEnabled: true,
        tunnelActive: true
      },
      {
        id: 'bb-gateway',
        type: 'bb-gateway',
        name: 'BlackBerry Gateway',
        status: 'secure',
        position: { x: 300, y: 200 },
        connections: ['mobile1', 'enterprise-server', 'vpn-gateway'],
        security: { encrypted: true, protocol: 'AppKinetics', strength: 'quantum' },
        blackBerryEnabled: true,
        tunnelActive: true
      },
      {
        id: 'enterprise-server',
        type: 'server',
        name: 'Enterprise Server',
        status: 'secure',
        position: { x: 500, y: 150 },
        connections: ['bb-gateway', 'internal-network'],
        security: { encrypted: true, protocol: 'TLS 1.3', strength: 'high' },
        blackBerryEnabled: true
      },
      {
        id: 'vpn-gateway',
        type: 'vpn',
        name: 'VPN Gateway',
        status: 'online',
        position: { x: 400, y: 350 },
        connections: ['bb-gateway', 'internet'],
        security: { encrypted: true, protocol: 'IPSec', strength: 'high' }
      },
      {
        id: 'internet',
        type: 'internet',
        name: 'Internet',
        status: 'warning',
        position: { x: 600, y: 400 },
        connections: ['vpn-gateway', 'threat-source'],
        security: { encrypted: false, protocol: 'HTTP/HTTPS', strength: 'medium' }
      },
      {
        id: 'threat-source',
        type: 'device',
        name: 'Threat Actor',
        status: 'offline',
        position: { x: 700, y: 300 },
        connections: ['internet'],
        security: { encrypted: false, protocol: 'Malicious', strength: 'low' }
      },
      {
        id: 'internal-network',
        type: 'router',
        name: 'Internal Router',
        status: 'online',
        position: { x: 650, y: 100 },
        connections: ['enterprise-server'],
        security: { encrypted: true, protocol: 'Internal', strength: 'medium' }
      }
    ];

    const initialConnections: NetworkConnection[] = [
      {
        id: 'conn1',
        from: 'mobile1',
        to: 'bb-gateway',
        type: 'bb-tunnel',
        status: 'active',
        throughput: 95,
        latency: 12
      },
      {
        id: 'conn2',
        from: 'bb-gateway',
        to: 'enterprise-server',
        type: 'bb-tunnel',
        status: 'active',
        throughput: 98,
        latency: 8
      },
      {
        id: 'conn3',
        from: 'bb-gateway',
        to: 'vpn-gateway',
        type: 'encrypted',
        status: 'active',
        throughput: 85,
        latency: 15
      },
      {
        id: 'conn4',
        from: 'vpn-gateway',
        to: 'internet',
        type: 'vpn',
        status: 'active',
        throughput: 70,
        latency: 25
      },
      {
        id: 'conn5',
        from: 'internet',
        to: 'threat-source',
        type: 'standard',
        status: 'inactive',
        throughput: 0,
        latency: 999
      },
      {
        id: 'conn6',
        from: 'enterprise-server',
        to: 'internal-network',
        type: 'encrypted',
        status: 'active',
        throughput: 92,
        latency: 5
      }
    ];

    setNodes(initialNodes);
    setConnections(initialConnections);
  };

  const simulateNetworkActivity = useCallback(() => {
    // Simulate dynamic network changes
    setConnections(prev => prev.map(conn => ({
      ...conn,
      throughput: Math.max(0, conn.throughput + (Math.random() - 0.5) * 10),
      latency: Math.max(1, conn.latency + (Math.random() - 0.5) * 5)
    })));

    // Simulate threat detection
    setThreatLevel(Math.random() * 100);

    // Simulate node status changes
    setNodes(prev => prev.map(node => {
      if (node.id === 'threat-source' && Math.random() > 0.7) {
        return { ...node, status: 'warning' as const };
      }
      return node;
    }));
  }, []);

  const getNodeIcon = (node: NetworkNode) => {
    switch (node.type) {
      case 'device':
        return <Smartphone className="w-6 h-6" />;
      case 'server':
        return <Server className="w-6 h-6" />;
      case 'router':
        return <Router className="w-6 h-6" />;
      case 'bb-gateway':
        return <Shield className="w-6 h-6" />;
      case 'vpn':
        return <Lock className="w-6 h-6" />;
      case 'internet':
        return <Globe className="w-6 h-6" />;
      default:
        return <Network className="w-6 h-6" />;
    }
  };

  const getNodeColor = (node: NetworkNode) => {
    switch (node.status) {
      case 'secure':
        return 'text-green-400 border-green-400 bg-green-400/10';
      case 'online':
        return 'text-blue-400 border-blue-400 bg-blue-400/10';
      case 'warning':
        return 'text-amber-400 border-amber-400 bg-amber-400/10';
      case 'offline':
        return 'text-red-400 border-red-400 bg-red-400/10';
      default:
        return 'text-muted-foreground border-muted bg-muted/10';
    }
  };

  const getConnectionColor = (connection: NetworkConnection) => {
    switch (connection.type) {
      case 'bb-tunnel':
        return 'stroke-blue-400';
      case 'encrypted':
        return 'stroke-green-400';
      case 'vpn':
        return 'stroke-purple-400';
      case 'standard':
        return 'stroke-gray-400';
      default:
        return 'stroke-muted-foreground';
    }
  };

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    initializeNetwork();
    setThreatLevel(0);
  };

  return (
    <div className="min-h-screen bg-background p-4 matrix-bg">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold holo-text">Network Topology Simulator</h1>
              <p className="text-muted-foreground font-mono text-sm">
                BlackBerry Dynamics Secure Tunnels & VPN Analysis
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowBBTunnels(!showBBTunnels)}
              className={showBBTunnels ? 'border-blue-400 text-blue-400' : ''}
            >
              <Shield className="w-4 h-4 mr-2" />
              BB Tunnels
            </Button>
            <Button
              variant="outline"
              onClick={toggleSimulation}
              className={isRunning ? 'border-green-400 text-green-400' : ''}
            >
              {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isRunning ? 'Pause' : 'Start'} Simulation
            </Button>
            <Button variant="outline" onClick={resetSimulation}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Network Visualization */}
          <div className="lg:col-span-3">
            <Card className="glass-panel p-6 h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary">Network Topology</h3>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="border-green-400 text-green-400">
                    <Activity className="w-3 h-3 mr-1" />
                    {threatLevel.toFixed(0)}% Threat Level
                  </Badge>
                  <Badge variant="outline" className="border-blue-400 text-blue-400">
                    <Shield className="w-3 h-3 mr-1" />
                    BB-Dynamics Active
                  </Badge>
                </div>
              </div>
              
              <div className="relative h-full bg-black/20 rounded-lg overflow-hidden">
                <svg className="w-full h-full">
                  {/* Render connections */}
                  {connections.map((connection) => {
                    const fromNode = nodes.find(n => n.id === connection.from);
                    const toNode = nodes.find(n => n.id === connection.to);
                    
                    if (!fromNode || !toNode) return null;
                    
                    const isVisible = showBBTunnels || connection.type !== 'bb-tunnel';
                    if (!isVisible) return null;

                    return (
                      <g key={connection.id}>
                        <line
                          x1={fromNode.position.x}
                          y1={fromNode.position.y}
                          x2={toNode.position.x}
                          y2={toNode.position.y}
                          strokeWidth={connection.type === 'bb-tunnel' ? 3 : 2}
                          className={`${getConnectionColor(connection)} ${
                            connection.status === 'active' ? 'opacity-80' : 'opacity-30'
                          }`}
                          strokeDasharray={connection.type === 'bb-tunnel' ? '5,5' : 'none'}
                        />
                        
                        {/* Connection status indicator */}
                        <circle
                          cx={(fromNode.position.x + toNode.position.x) / 2}
                          cy={(fromNode.position.y + toNode.position.y) / 2}
                          r="3"
                          className={`${getConnectionColor(connection)} fill-current`}
                        />
                      </g>
                    );
                  })}
                  
                  {/* Render nodes */}
                  {nodes.map((node) => (
                    <g key={node.id}>
                      <circle
                        cx={node.position.x}
                        cy={node.position.y}
                        r="30"
                        className={`${getNodeColor(node)} fill-current stroke-2 cursor-pointer`}
                        onClick={() => setSelectedNode(node)}
                      />
                      
                      {/* BlackBerry indicator */}
                      {node.blackBerryEnabled && (
                        <circle
                          cx={node.position.x + 20}
                          cy={node.position.y - 20}
                          r="8"
                          className="fill-blue-400 stroke-blue-400 stroke-2"
                        />
                      )}
                      
                      {/* Tunnel active indicator */}
                      {node.tunnelActive && showBBTunnels && (
                        <circle
                          cx={node.position.x}
                          cy={node.position.y}
                          r="35"
                          className="fill-none stroke-blue-400 stroke-2 opacity-50"
                          strokeDasharray="10,5"
                        />
                      )}
                    </g>
                  ))}
                </svg>
                
                {/* Node labels */}
                {nodes.map((node) => (
                  <div
                    key={`label-${node.id}`}
                    className="absolute text-xs text-center font-mono pointer-events-none"
                    style={{
                      left: node.position.x - 40,
                      top: node.position.y + 40,
                      width: 80
                    }}
                  >
                    <div className={`${getNodeColor(node)} px-2 py-1 rounded text-center`}>
                      {node.name}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            
            {/* Node Details */}
            {selectedNode && (
              <Card className="glass-panel p-4">
                <h4 className="font-semibold mb-3 flex items-center">
                  {getNodeIcon(selectedNode)}
                  <span className="ml-2">{selectedNode.name}</span>
                </h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-mono">{selectedNode.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant="outline" className={`text-xs ${getNodeColor(selectedNode)}`}>
                      {selectedNode.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Protocol:</span>
                    <span className="font-mono">{selectedNode.security.protocol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Encryption:</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        selectedNode.security.encrypted ? 'border-green-400 text-green-400' : 'border-red-400 text-red-400'
                      }`}
                    >
                      {selectedNode.security.encrypted ? 'Active' : 'None'}
                    </Badge>
                  </div>
                  {selectedNode.blackBerryEnabled && (
                    <div className="flex justify-between">
                      <span>BB Dynamics:</span>
                      <Badge variant="outline" className="border-blue-400 text-blue-400 text-xs">
                        Enabled
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Connection Stats */}
            <Card className="glass-panel p-4">
              <h4 className="font-semibold mb-3">Network Performance</h4>
              
              <div className="space-y-3">
                {connections.filter(c => c.status === 'active').map((connection) => (
                  <div key={connection.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-mono">{connection.from} → {connection.to}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getConnectionColor(connection).replace('stroke-', 'border-').replace('stroke-', 'text-')}`}
                      >
                        {connection.type}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Throughput: {connection.throughput.toFixed(0)}%</span>
                      <span>Latency: {connection.latency.toFixed(0)}ms</span>
                    </div>
                    <div className="w-full bg-muted/30 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full ${getConnectionColor(connection).replace('stroke-', 'bg-')}`}
                        style={{ width: `${connection.throughput}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Security Overview */}
            <Card className="glass-panel p-4">
              <h4 className="font-semibold mb-3">Security Overview</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>BB Tunnels:</span>
                  <span className="text-blue-400 font-mono">
                    {connections.filter(c => c.type === 'bb-tunnel').length} Active
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Encrypted Links:</span>
                  <span className="text-green-400 font-mono">
                    {connections.filter(c => c.type === 'encrypted').length} Active
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Threat Level:</span>
                  <span className={`font-mono ${
                    threatLevel > 70 ? 'text-red-400' : 
                    threatLevel > 40 ? 'text-amber-400' : 'text-green-400'
                  }`}>
                    {threatLevel.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Quantum Safe:</span>
                  <Badge variant="outline" className="border-purple-400 text-purple-400 text-xs">
                    Active
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}