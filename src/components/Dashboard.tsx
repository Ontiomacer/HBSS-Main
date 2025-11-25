import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  MessageSquare, 
  Activity, 
  Plus, 
  Zap, 
  Globe, 
  Clock,
  Users,
  Lock,
  AlertTriangle,
  TrendingUp,
  Network,
  Wrench
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: 'chat' | 'builder' | 'network' | 'messenger' | 'bb-chat' | 'bb-settings') => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [entropy, setEntropy] = useState(0);
  const [activeConnections, setActiveConnections] = useState(3);

  useEffect(() => {
    // Simulate live entropy feed
    const interval = setInterval(() => {
      setEntropy(Math.random() * 100);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getEntropyStatus = () => {
    if (entropy > 70) return { color: 'status-secure', text: 'OPTIMAL' };
    if (entropy > 40) return { color: 'status-warning', text: 'MODERATE' };
    return { color: 'status-danger', text: 'LOW' };
  };

  const entropyStatus = getEntropyStatus();

  return (
    <div className="min-h-screen bg-background p-4 matrix-bg">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold holo-text">Vault Terminal</h1>
            <p className="text-muted-foreground font-mono text-sm">Central Command Interface</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-primary text-primary">
              <Shield className="w-3 h-3 mr-1" />
              SECURED
            </Badge>
            <Badge variant="outline" className="border-cipher-amber text-cipher-amber">
              <Users className="w-3 h-3 mr-1" />
              {activeConnections} Active
            </Badge>
          </div>
        </div>

        {/* HBSS LiveChat Feature Card */}
        <a href="/hbss" className="block">
          <Card className="glass-panel p-6 border-2 border-violet-500/50 hover:border-violet-400 transition-all cursor-pointer group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">HBSS LiveChat</h3>
                  <p className="text-sm text-violet-300">Post-Quantum Secure Messaging</p>
                </div>
              </div>
              <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/50">
                NEW
              </Badge>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
              <span className="px-2 py-1 bg-violet-500/10 text-violet-400 rounded">Quantum-Resistant</span>
              <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded">Real-Time</span>
              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded">HBSS Signatures</span>
            </div>
          </Card>
        </a>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Button 
            onClick={() => onNavigate('bb-chat')} 
            className="cipher-button h-auto p-6 justify-start bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
          >
            <Shield className="w-6 h-6 mr-3" />
            <div className="text-left">
              <div className="font-semibold">BlackBerry SecureChat</div>
              <div className="text-sm opacity-80">Enterprise E2EE</div>
            </div>
          </Button>

          <Button 
            onClick={() => onNavigate('bb-settings')} 
            className="cipher-button h-auto p-6 justify-start bg-gradient-to-r from-blue-800 to-indigo-800 hover:from-blue-900 hover:to-indigo-900"
          >
            <Wrench className="w-6 h-6 mr-3" />
            <div className="text-left">
              <div className="font-semibold">BB Dynamics</div>
              <div className="text-sm opacity-80">Policy config</div>
            </div>
          </Button>
          
          <Button 
            onClick={() => onNavigate('messenger')} 
            className="cipher-button h-auto p-6 justify-start"
          >
            <Shield className="w-6 h-6 mr-3" />
            <div className="text-left">
              <div className="font-semibold">SecureComm</div>
              <div className="text-sm opacity-80">Military-grade E2EE</div>
            </div>
          </Button>
          
          <Button 
            onClick={() => onNavigate('chat')} 
            className="cipher-button h-auto p-6 justify-start"
          >
            <MessageSquare className="w-6 h-6 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Cipher Chat</div>
              <div className="text-sm opacity-80">Legacy messaging</div>
            </div>
          </Button>
          
          <Button 
            onClick={() => onNavigate('builder')} 
            className="cipher-button h-auto p-6 justify-start"
          >
            <Wrench className="w-6 h-6 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Cipher Lab</div>
              <div className="text-sm opacity-80">Build algorithms</div>
            </div>
          </Button>
          
          <Button 
            onClick={() => onNavigate('network')} 
            className="cipher-button h-auto p-6 justify-start"
          >
            <Network className="w-6 h-6 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Network Simulator</div>
              <div className="text-sm opacity-80">Topology analysis</div>
            </div>
          </Button>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Message Center */}
          <Card className="glass-panel p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Message Center</h3>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('chat')}>
                View All
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="message-block">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-muted-foreground">From: Sarah Connor</span>
                  <Badge variant="outline" className="border-blue-500 text-blue-400 text-xs">
                    BB-DYN
                  </Badge>
                </div>
                <p className="text-sm">BlackBerry Dynamics policy update complete. All security protocols enforced.</p>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  1 min ago • E2EE Active
                </div>
              </div>

              <div className="message-block">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-muted-foreground">From: Alice#7F3A</span>
                  <Badge variant="outline" className="border-primary text-primary text-xs">
                    AES-256
                  </Badge>
                </div>
                <p className="text-sm">Quantum-resistant protocol test successful...</p>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  2 min ago • TTL: 5h 23m
                </div>
              </div>
              
              <div className="message-block">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-muted-foreground">From: Bob#2E9D</span>
                  <Badge variant="outline" className="border-cipher-amber text-cipher-amber text-xs">
                    CUSTOM
                  </Badge>
                </div>
                <p className="text-sm">Challenge cipher uploaded for review...</p>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  15 min ago • TTL: 2h 45m
                </div>
              </div>
              
              <div className="message-block">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-muted-foreground">From: System</span>
                  <Badge variant="destructive" className="text-xs">
                    ALERT
                  </Badge>
                </div>
                <p className="text-sm">Anomalous encryption pattern detected...</p>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  1 hour ago • Requires attention
                </div>
              </div>
            </div>
          </Card>

          {/* System Status */}
          <div className="space-y-6">
            
            {/* Entropy Feed */}
            <Card className="glass-panel p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Entropy Feed</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">Current Level</span>
                  <span className={`text-sm font-bold ${entropyStatus.color}`}>
                    {entropyStatus.text}
                  </span>
                </div>
                
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all duration-500"
                    style={{ width: `${entropy}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-muted-foreground font-mono">
                  Sources: Motion • GPS • Clock drift • Network jitter
                </div>
                
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="text-sm font-mono">{entropy.toFixed(1)}% entropy</span>
                </div>
              </div>
            </Card>

            {/* Cipher Status */}
            <Card className="glass-panel p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Cipher Status</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-primary" />
                    <span className="text-sm">Active Sessions</span>
                  </div>
                  <span className="text-sm font-mono">{activeConnections}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-cipher-amber" />
                    <span className="text-sm">Key Rotations</span>
                  </div>
                  <span className="text-sm font-mono">47/day</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="text-sm">Network Status</span>
                  </div>
                  <Badge variant="outline" className="border-primary text-primary text-xs">
                    SECURE
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Entropy Level</span>
              <Activity className="w-4 h-4 text-cipher-green" />
            </div>
            <div className="text-2xl font-bold text-cipher-green">{entropy.toFixed(0)}%</div>
            <div className="w-full bg-muted/30 rounded-full h-1 mt-2">
              <div className="bg-cipher-green h-1 rounded-full animate-pulse" style={{ width: `${entropy}%` }}></div>
            </div>
          </div>
          
          <div className="glass-panel p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Active Sessions</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold">{activeConnections}</div>
            <div className="text-xs text-muted-foreground">+2 from yesterday</div>
          </div>
          
          <div className="glass-panel p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Cipher Rotations</span>
              <Zap className="w-4 h-4 text-cipher-amber" />
            </div>
            <div className="text-2xl font-bold">47</div>
            <div className="text-xs text-muted-foreground">Last: 2 min ago</div>
          </div>
          
          <div className="glass-panel p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Network Integrity</span>
              <Network className="w-4 h-4 text-cipher-green" />
            </div>
            <div className="text-2xl font-bold text-cipher-green">98.7%</div>
            <div className="text-xs text-muted-foreground">7 nodes active</div>
          </div>
        </div>
      </div>
    </div>
  );
}