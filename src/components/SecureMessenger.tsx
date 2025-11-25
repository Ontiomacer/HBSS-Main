import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Send, 
  Shield, 
  Lock, 
  Key, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Users,
  Settings,
  ArrowLeft,
  Smartphone,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';
import CryptoStrengthIndicator from './CryptoStrengthIndicator';
import BlackBerryDynamicsPanel from './BlackBerryDynamicsPanel';

interface Message {
  id: string;
  sender: string;
  senderHash: string;
  content: string;
  timestamp: string;
  encryptionLevel: 'AES-256-GCM' | 'ChaCha20-Poly1305' | 'CRYSTALS-Kyber';
  ttl: string;
  isEncrypted: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  messageKey: string;
  quantumSafe: boolean;
  e2eeVerified: boolean;
}

interface SecureMessengerProps {
  onBack: () => void;
}

export default function SecureMessenger({ onBack }: SecureMessengerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'Agent Alpha',
      senderHash: 'a7f3c9d2',
      content: 'Secure channel established. All communications encrypted with AES-256-GCM.',
      timestamp: '14:23:45',
      encryptionLevel: 'AES-256-GCM',
      ttl: '23h 36m',
      isEncrypted: true,
      status: 'read',
      messageKey: 'k1_9f8e7d6c',
      quantumSafe: false,
      e2eeVerified: true
    },
    {
      id: '2',
      sender: 'Control',
      senderHash: 'b8e4d1f5',
      content: 'Mission parameters updated. Switching to quantum-safe protocols.',
      timestamp: '14:24:12',
      encryptionLevel: 'CRYSTALS-Kyber',
      ttl: '23h 35m',
      isEncrypted: true,
      status: 'delivered',
      messageKey: 'k2_3a2b1c9d',
      quantumSafe: true,
      e2eeVerified: true
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [selectedEncryption, setSelectedEncryption] = useState<'AES-256-GCM' | 'ChaCha20-Poly1305' | 'CRYSTALS-Kyber'>('AES-256-GCM');
  const [isGdConnected, setIsGdConnected] = useState(false);
  const [showEncryptedContent, setShowEncryptedContent] = useState(false);
  const [activeChannel, setActiveChannel] = useState('command');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate real-time message status updates
    const interval = setInterval(() => {
      setMessages(prev => prev.map(msg => {
        if (msg.status === 'sending') return { ...msg, status: 'sent' };
        if (msg.status === 'sent' && Math.random() > 0.7) return { ...msg, status: 'delivered' };
        if (msg.status === 'delivered' && Math.random() > 0.8) return { ...msg, status: 'read' };
        return msg;
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: 'You',
      senderHash: 'f9a8b7c6',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      encryptionLevel: selectedEncryption,
      ttl: '24h 00m',
      isEncrypted: true,
      status: 'sending',
      messageKey: `k${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      quantumSafe: selectedEncryption === 'CRYSTALS-Kyber',
      e2eeVerified: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Auto-scroll to bottom
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }
    }, 100);
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending': return <Clock className="w-3 h-3 text-muted-foreground animate-spin" />;
      case 'sent': return <CheckCircle2 className="w-3 h-3 text-muted-foreground" />;
      case 'delivered': return <CheckCircle2 className="w-3 h-3 text-[hsl(var(--cipher-amber))]" />;
      case 'read': return <CheckCircle2 className="w-3 h-3 text-[hsl(var(--cipher-terminal))]" />;
    }
  };

  const getEncryptionColor = (level: Message['encryptionLevel']) => {
    switch (level) {
      case 'AES-256-GCM': return 'text-primary border-primary';
      case 'ChaCha20-Poly1305': return 'text-[hsl(var(--cipher-amber))] border-[hsl(var(--cipher-amber))]';
      case 'CRYSTALS-Kyber': return 'text-[hsl(var(--cipher-terminal))] border-[hsl(var(--cipher-terminal))]';
    }
  };

  const channels = [
    { id: 'command', name: 'Command', participants: 3, encrypted: true },
    { id: 'ops', name: 'Operations', participants: 7, encrypted: true },
    { id: 'intel', name: 'Intelligence', participants: 2, encrypted: true }
  ];

  return (
    <div className="min-h-screen bg-background matrix-bg">
      <div className="cyber-particles" />
      
      {/* Header */}
      <div className="border-b border-border/20 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold holo-text">SecureComm</h1>
                <Badge variant="outline" className="border-[hsl(var(--cipher-terminal))] text-[hsl(var(--cipher-terminal))]">
                  <Lock className="w-3 h-3 mr-1" />
                  E2EE
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isGdConnected ? 'default' : 'secondary'} className="font-mono">
                <Smartphone className="w-3 h-3 mr-1" />
                GD {isGdConnected ? 'Connected' : 'Offline'}
              </Badge>
              <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar - Channels & Security */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Channels */}
            <Card className="glass-panel p-4">
              <h3 className="text-sm font-semibold text-primary mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Secure Channels
              </h3>
              <div className="space-y-2">
                {channels.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannel(channel.id)}
                    className={`w-full p-2 rounded-lg text-left transition-all hover:bg-primary/10 ${
                      activeChannel === channel.id ? 'bg-primary/20 border border-primary/30' : 'border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm"># {channel.name}</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground">{channel.participants}</span>
                        {channel.encrypted && <Lock className="w-3 h-3 text-[hsl(var(--cipher-terminal))]" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Crypto Strength */}
            <CryptoStrengthIndicator 
              algorithm={selectedEncryption}
              keyLength={256}
              quantumResistant={selectedEncryption === 'CRYSTALS-Kyber'}
              isBlackBerry={isGdConnected}
            />

            {/* BlackBerry Dynamics Panel */}
            <BlackBerryDynamicsPanel 
              isConnected={isGdConnected}
              onToggleConnection={() => setIsGdConnected(!isGdConnected)}
            />
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="glass-panel h-[calc(100vh-200px)] flex flex-col">
              
              {/* Chat Header */}
              <div className="p-4 border-b border-border/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {activeChannel.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold">#{activeChannel}</h2>
                      <p className="text-xs text-muted-foreground font-mono">
                        {channels.find(c => c.id === activeChannel)?.participants} participants • End-to-end encrypted
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEncryptedContent(!showEncryptedContent)}
                      className="hover:bg-primary/10"
                    >
                      {showEncryptedContent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Badge variant="outline" className={getEncryptionColor(selectedEncryption)}>
                      <Key className="w-3 h-3 mr-1" />
                      {selectedEncryption}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${message.sender === 'You' ? 'order-2' : 'order-1'}`}>
                        <div className={`rounded-lg p-3 ${
                          message.sender === 'You' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted/50 border border-border/50'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono opacity-70">
                                {message.sender} • {message.senderHash}
                              </span>
                              {message.quantumSafe && (
                                <Badge variant="outline" className="text-xs border-[hsl(var(--cipher-terminal))] text-[hsl(var(--cipher-terminal))]">
                                  <Zap className="w-3 h-3 mr-1" />
                                  QS
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs opacity-70">{message.timestamp}</span>
                          </div>
                          
                          <p className="text-sm">
                            {showEncryptedContent 
                              ? `🔒 ${btoa(message.content).slice(0, 40)}...` 
                              : message.content
                            }
                          </p>
                          
                          <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono">TTL: {message.ttl}</span>
                              <span className="font-mono">Key: {message.messageKey}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {message.e2eeVerified && <Shield className="w-3 h-3 text-[hsl(var(--cipher-terminal))]" />}
                              {getStatusIcon(message.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border/20">
                <Tabs value={selectedEncryption} onValueChange={(value) => setSelectedEncryption(value as any)}>
                  <TabsList className="grid w-full grid-cols-3 mb-3">
                    <TabsTrigger value="AES-256-GCM" className="text-xs">AES-256</TabsTrigger>
                    <TabsTrigger value="ChaCha20-Poly1305" className="text-xs">ChaCha20</TabsTrigger>
                    <TabsTrigger value="CRYSTALS-Kyber" className="text-xs">Quantum-Safe</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type secure message..."
                    className="terminal-input flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="cipher-button"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-3 h-3" />
                    <span>Messages are end-to-end encrypted with {selectedEncryption}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Globe className="w-3 h-3" />
                    <span>Via BlackBerry Infrastructure</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}