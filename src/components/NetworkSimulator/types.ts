export interface Node {
  id: string;
  type: 'client' | 'router' | 'server';
  label: string;
  x: number;
  y: number;
  status: 'online' | 'offline' | 'compromised' | 'idle';
  cpuLoad: number;
  memoryUsage: number;
  networkLoad: number;
  encryptionModule: string;
  messages: NodeMessage[];
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  latency: number;
  bandwidth: number;
  encrypted: boolean;
  status: 'active' | 'inactive' | 'congested';
}

export interface Packet {
  id: string;
  source: string;
  destination: string;
  sourceIP: string;
  destIP: string;
  ttl: number;
  flags: string;
  protocol: string;
  encrypted: boolean;
  encryptionType: string;
  payload: string;
  currentNode: string;
  progress: number;
  path: string[];
  jitter: number;
  dropped: boolean;
  size: number;
  timestamp: number;
  hops: number;
  delay: number;
  integrity: boolean;
  priority: 'High' | 'Medium' | 'Low';
}

export interface NodeMessage {
  id: string;
  content: string;
  timestamp: number;
  encrypted: boolean;
  sender: string;
}

export type SimulationMode = 'running' | 'paused' | 'step';