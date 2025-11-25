import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Pause, SkipForward } from 'lucide-react';
import { NetworkCanvas } from './NetworkCanvas';
import { InspectorPanel } from './InspectorPanel';
import { NetworkToolbar } from './NetworkToolbar';
import { PacketAnatomyView } from './PacketAnatomyView';
import { NodeMessageQueue } from './NodeMessageQueue';
import { Node, Connection, Packet, SimulationMode } from './types';

interface NetworkSimulatorProps {
  onBack: () => void;
}

export default function NetworkSimulator({ onBack }: NetworkSimulatorProps) {
  const [nodes, setNodes] = useState<Node[]>([
    { 
      id: 'client1', 
      type: 'client', 
      label: 'Client Alpha', 
      x: 100, 
      y: 200, 
      status: 'online',
      cpuLoad: 12,
      memoryUsage: 45,
      networkLoad: 23,
      encryptionModule: 'CipherCore v1.1',
      messages: []
    },
    { 
      id: 'router1', 
      type: 'router', 
      label: 'Router Prime', 
      x: 350, 
      y: 150, 
      status: 'online',
      cpuLoad: 67,
      memoryUsage: 78,
      networkLoad: 89,
      encryptionModule: 'AES-256',
      messages: []
    },
    { 
      id: 'server1', 
      type: 'server', 
      label: 'Server Omega', 
      x: 600, 
      y: 200, 
      status: 'online',
      cpuLoad: 34,
      memoryUsage: 56,
      networkLoad: 12,
      encryptionModule: 'Military-Grade RSA',
      messages: []
    }
  ]);
  
  const [connections, setConnections] = useState<Connection[]>([
    { 
      id: 'conn1', 
      from: 'client1', 
      to: 'router1', 
      latency: 45, 
      bandwidth: 100, 
      encrypted: true,
      status: 'active'
    },
    { 
      id: 'conn2', 
      from: 'router1', 
      to: 'server1', 
      latency: 23, 
      bandwidth: 1000, 
      encrypted: true,
      status: 'active'
    }
  ]);

  const [packets, setPackets] = useState<Packet[]>([]);
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('paused');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedPacket, setSelectedPacket] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [entropyLevel, setEntropyLevel] = useState(73);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [debugMode, setDebugMode] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [quantumMode, setQuantumMode] = useState(false);
  const [educationalMode, setEducationalMode] = useState(true);
  const [secureStatus, setSecureStatus] = useState<{ active: boolean; type: string; keyStrength: string } | null>(null);
  const [quantumStats, setQuantumStats] = useState<{ bits: number; qber: number; eavesdropper: boolean}>({ bits: 0, qber: 0, eavesdropper: false });

  // Add log function
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  }, []);

  // Generate entropy fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setEntropyLevel(prev => {
        const change = (Math.random() - 0.5) * 10;
        return Math.max(0, Math.min(100, prev + change));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Packet simulation engine
  useEffect(() => {
    if (simulationMode !== 'running') return;
    
    const interval = setInterval(() => {
      setPackets(prev => {
        return prev.map(packet => {
          if (packet.dropped || packet.progress >= 100) return packet;
          
          const speedMultiplier = simulationSpeed * (Math.random() * 0.5 + 0.75);
          const newProgress = Math.min(packet.progress + (5 * speedMultiplier), 100);
          
          // Add debug logging
          if (debugMode && newProgress > packet.progress + 10) {
            addLog(`Packet ${packet.id.slice(-8)} progressed to ${Math.round(newProgress)}%`);
          }
          
          // Add message to destination when packet arrives
          if (newProgress >= 100 && packet.progress < 100) {
            addLog(`Packet ${packet.id.slice(-8)} delivered to ${packet.destination}`);
            setNodes(nodes => nodes.map(node => {
              if (node.id === packet.destination) {
                return {
                  ...node,
                  messages: [...node.messages, {
                    id: `msg-${Date.now()}`,
                    content: packet.payload,
                    timestamp: Date.now(),
                    encrypted: packet.encrypted,
                    sender: packet.source
                  }]
                };
              }
              return node;
            }));
          }
          
          return {
            ...packet,
            progress: newProgress,
            ttl: Math.max(packet.ttl - 1, 0),
            hops: packet.hops + (newProgress >= 100 && packet.progress < 100 ? 1 : 0)
          };
        }).filter(packet => {
          const shouldKeep = !packet.dropped && packet.ttl > 0;
          if (!shouldKeep && debugMode) {
            addLog(`Packet ${packet.id.slice(-8)} ${packet.dropped ? 'dropped' : 'expired'}`);
          }
          return shouldKeep;
        });
      });
    }, 100 / simulationSpeed);
    
    return () => clearInterval(interval);
  }, [simulationMode, simulationSpeed, debugMode, addLog]);

  // Quantum simulation (BB84-style visual stats)
  useEffect(() => {
    if (!quantumMode) return;
    const interval = setInterval(() => {
      setQuantumStats(prev => {
        const addedBits = Math.floor(50 + Math.random() * 100);
        const eavesdropper = Math.random() < 0.05 ? true : (prev.eavesdropper && Math.random() < 0.7);
        const qberDrift = eavesdropper ? (Math.random() * 3 + 1) : (Math.random() * 0.5);
        const qber = Math.min(20, Math.max(0, (prev.qber * 0.8) + qberDrift));
        return { bits: prev.bits + addedBits, qber, eavesdropper };
      });
    }, 1200);
    addLog('Quantum Mode engaged: Simulating BB84 key exchange');
    return () => clearInterval(interval);
  }, [quantumMode, addLog]);

  const sendPacket = useCallback((sourceId?: string, destId?: string) => {
    const source = sourceId ? nodes.find(n => n.id === sourceId) : nodes.find(n => n.type === 'client');
    const dest = destId ? nodes.find(n => n.id === destId) : nodes.find(n => n.type === 'server');
    
    if (!source || !dest) return;
    
    const encryptionTypes = ['AES-256', 'CipherCore v1.1', 'RSA-2048', 'Custom XOR', 'Plaintext'];
    const protocols = ['TCP', 'UDP', 'ICMP', 'HTTPS'];
    const payloads = [
      'Classified payload data',
      'Encrypted message content',
      'Secure file transfer',
      'Authentication token',
      'Command sequence'
    ];
    
    const encryption = encryptionTypes[Math.floor(Math.random() * encryptionTypes.length)];
    
    const newPacket: Packet = {
      id: `pkt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source: source.id,
      destination: dest.id,
      sourceIP: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      destIP: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      ttl: Math.floor(Math.random() * 32) + 32,
      flags: ['SYN', 'ACK', 'FIN', 'PSH', 'RST'][Math.floor(Math.random() * 5)],
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      encrypted: encryption !== 'Plaintext',
      encryptionType: encryption,
      payload: payloads[Math.floor(Math.random() * payloads.length)],
      currentNode: source.id,
      progress: 0,
      path: [source.id, dest.id],
      jitter: Math.random() * 50,
      dropped: Math.random() < 0.05,
      size: Math.floor(Math.random() * 1400) + 64,
      timestamp: Date.now(),
      hops: 0,
      delay: Math.floor(Math.random() * 100) + 10,
      integrity: Math.random() > 0.1,
      priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)] as 'High' | 'Medium' | 'Low'
    };
    
    addLog(`Generated ${encryption} packet from ${source.label} to ${dest.label}`);
    setPackets(prev => [...prev, newPacket]);
  }, [nodes]);

  const stepSimulation = () => {
    sendPacket();
    setSimulationMode('step');
    setTimeout(() => setSimulationMode('paused'), 1000);
  };

  const clearSimulation = () => {
    setPackets([]);
    setNodes(nodes => nodes.map(node => ({ ...node, messages: [] })));
    setLogs([]);
    addLog('Simulation cleared');
  };

  const resetTopology = () => {
    setNodes([
      { 
        id: 'client1', 
        type: 'client', 
        label: 'Client Alpha', 
        x: 100, 
        y: 200, 
        status: 'online',
        cpuLoad: 12,
        memoryUsage: 45,
        networkLoad: 23,
        encryptionModule: 'CipherCore v1.1',
        messages: []
      },
      { 
        id: 'router1', 
        type: 'router', 
        label: 'Router Prime', 
        x: 350, 
        y: 150, 
        status: 'online',
        cpuLoad: 67,
        memoryUsage: 78,
        networkLoad: 89,
        encryptionModule: 'AES-256',
        messages: []
      },
      { 
        id: 'server1', 
        type: 'server', 
        label: 'Server Omega', 
        x: 600, 
        y: 200, 
        status: 'online',
        cpuLoad: 34,
        memoryUsage: 56,
        networkLoad: 12,
        encryptionModule: 'Military-Grade RSA',
        messages: []
      }
    ]);
    setConnections([
      { 
        id: 'conn1', 
        from: 'client1', 
        to: 'router1', 
        latency: 45, 
        bandwidth: 100, 
        encrypted: true,
        status: 'active'
      },
      { 
        id: 'conn2', 
        from: 'router1', 
        to: 'server1', 
        latency: 23, 
        bandwidth: 1000, 
        encrypted: true,
        status: 'active'
      }
    ]);
    setPackets([]);
    setLogs([]);
    setSelectedNode(null);
    setSelectedPacket(null);
    setSelectedConnection(null);
    addLog('Topology reset to default configuration');
  };

  const injectFault = () => {
    // Randomly compromise a node or drop packets
    const faultType = Math.random();
    
    if (faultType < 0.3) {
      // Compromise a random node
      const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
      setNodes(prev => prev.map(node => 
        node.id === randomNode.id 
          ? { ...node, status: 'compromised' as const }
          : node
      ));
      addLog(`SECURITY ALERT: Node ${randomNode.label} compromised!`);
    } else if (faultType < 0.6) {
      // Drop random packets
      setPackets(prev => prev.map(packet => 
        Math.random() < 0.3 
          ? { ...packet, dropped: true }
          : packet
      ));
      addLog('NETWORK FAULT: Multiple packets dropped');
    } else {
      // Corrupt packet integrity
      setPackets(prev => prev.map(packet => 
        Math.random() < 0.4 
          ? { ...packet, integrity: false }
          : packet
      ));
      addLog('INTEGRITY ALERT: Packet corruption detected');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold holo-text">Network Topology Simulator</h2>
                <p className="text-sm text-muted-foreground font-mono">
                  Advanced packet flow visualization • Entropy: {entropyLevel.toFixed(1)}%
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-cipher-terminal text-cipher-terminal">
                {packets.length} ACTIVE PACKETS
              </Badge>
              <Badge variant="outline" className="border-primary text-primary">
                {nodes.length} NODES
              </Badge>
              <Button 
                variant={simulationMode === 'running' ? "destructive" : "default"}
                onClick={() => setSimulationMode(simulationMode === 'running' ? 'paused' : 'running')}
                className="cipher-button"
              >
                {simulationMode === 'running' ? 
                  <><Pause className="w-4 h-4 mr-2" /> Pause</> : 
                  <><Play className="w-4 h-4 mr-2" /> Run</>
                }
              </Button>
              <Button 
                variant="outline"
                onClick={stepSimulation}
                className="cipher-button"
              >
                <SkipForward className="w-4 h-4 mr-2" /> Step
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Toolbar */}
          <div className="xl:col-span-3">
            <NetworkToolbar
              onSendPacket={sendPacket}
              onClearSimulation={clearSimulation}
              simulationSpeed={simulationSpeed}
              onSpeedChange={setSimulationSpeed}
              entropyLevel={entropyLevel}
              onResetTopology={resetTopology}
              onInjectFault={injectFault}
              debugMode={debugMode}
              onDebugModeChange={setDebugMode}
              logs={logs}
              quantumMode={quantumMode}
              onToggleQuantumMode={setQuantumMode}
              educationalMode={educationalMode}
              onToggleEducationalMode={setEducationalMode}
              onEstablishSecureChannel={() => {
                setSecureStatus({ active: true, type: 'BlackBerry Dynamics', keyStrength: 'AES-256/FIPS' });
                addLog('Secure Channel established (simulated BlackBerry Dynamics)');
              }}
              secureStatus={secureStatus}
              quantumStats={quantumStats}
            />
          </div>

          {/* Network Canvas */}
          <div className="xl:col-span-6">
            <NetworkCanvas
              nodes={nodes}
              connections={connections}
              packets={packets}
              onNodesChange={setNodes}
              onConnectionsChange={setConnections}
              selectedNode={selectedNode}
              selectedPacket={selectedPacket}
              selectedConnection={selectedConnection}
              onSelectNode={setSelectedNode}
              onSelectPacket={setSelectedPacket}
              onSelectConnection={setSelectedConnection}
              connecting={connecting}
              onConnecting={setConnecting}
              simulationMode={simulationMode}
              quantumMode={quantumMode}
              quantumStats={quantumStats}
            />
          </div>

          {/* Inspector Panel */}
          <div className="xl:col-span-3">
            <InspectorPanel
              selectedNode={selectedNode ? nodes.find(n => n.id === selectedNode) : null}
              selectedPacket={selectedPacket ? packets.find(p => p.id === selectedPacket) : null}
              selectedConnection={selectedConnection ? connections.find(c => c.id === selectedConnection) : null}
              onRetryPacket={(packet) => {
                if (packet) {
                  sendPacket(packet.source, packet.destination);
                }
              }}
            />
          </div>
        </div>

        {/* Bottom Row - Message Queues and Packet Anatomy */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <NodeMessageQueue 
            nodes={nodes.filter(n => n.type === 'client')}
            onSendMessage={(nodeId, message) => {
              // Find a target node (prefer servers, then routers)
              const targetNode = nodes.find(n => n.type === 'server') || 
                               nodes.find(n => n.type === 'router' && n.id !== nodeId);
              if (targetNode) {
                sendPacket(nodeId, targetNode.id);
              }
            }}
          />
          
          <PacketAnatomyView 
            packet={selectedPacket ? packets.find(p => p.id === selectedPacket) : null}
          />
        </div>
      </div>
    </div>
  );
}