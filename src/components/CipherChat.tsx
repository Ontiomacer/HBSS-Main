import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  ArrowLeft, 
  Lock, 
  Unlock, 
  Clock, 
  Shield, 
  Eye,
  ChevronUp,
  Hash,
  Zap
} from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  senderHash: string;
  content: string;
  timestamp: string;
  encryptionLevel: string;
  ttl: string;
  isEncrypted: boolean;
  debugInfo?: string;
}

interface CipherChatProps {
  onBack: () => void;
}

export default function CipherChat({ onBack }: CipherChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'Alice',
      senderHash: '7F3A2B9E',
      content: 'Quantum encryption test successful. Ready for phase 2.',
      timestamp: '14:23:15',
      encryptionLevel: 'AES-256',
      ttl: '5h 23m',
      isEncrypted: false,
      debugInfo: 'Enc: AES-256-GCM | Key: 0x7F3A...9E2B | IV: 0x123...ABC | MAC: Valid'
    },
    {
      id: '2',
      sender: 'Bob',
      senderHash: '2E9DC4F1',
      content: 'AGkgbmVlZCB0byB0ZXN0IHRoZSBuZXcgY2lwaGVyIGFsZ29yaXRobQ==',
      timestamp: '14:25:33',
      encryptionLevel: 'CUSTOM',
      ttl: '2h 45m',
      isEncrypted: true,
      debugInfo: 'Enc: Custom-XOR-ROT13 | Seed: 0x2E9D...F1C4 | Rounds: 7 | Status: Encrypted'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [showDebugLog, setShowDebugLog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      sender: 'You',
      senderHash: 'A1B2C3D4',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      encryptionLevel: 'AES-256',
      ttl: '24h 0m',
      isEncrypted: false,
      debugInfo: 'Enc: AES-256-GCM | Key: 0xA1B2...D4E5 | IV: 0x567...DEF | MAC: Valid'
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
    
    // Simulate typing sound effect
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJmMiI4gDg4mJQ==');
    audio.volume = 0.1;
    audio.play().catch(() => {});
  };

  const handleDecryptMessage = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: 'I need to test the new cipher algorithm', isEncrypted: false }
        : msg
    ));
  };

  const toggleDebugLog = () => {
    setShowDebugLog(!showDebugLog);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      {/* Header */}
      <div className="glass-panel p-4 m-4 mb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold holo-text">Cipher Channel #alpha</h2>
              <p className="text-sm text-muted-foreground font-mono">End-to-end encrypted</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-primary text-primary">
              <Shield className="w-3 h-3 mr-1" />
              SECURE
            </Badge>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleDebugLog}
              className="font-mono text-xs"
            >
              <Eye className="w-4 h-4 mr-1" />
              DEBUG
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 pt-0 overflow-y-auto">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div key={message.id} className="message-block">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold">{message.sender}</span>
                  <Badge variant="outline" className="text-xs font-mono">
                    <Hash className="w-3 h-3 mr-1" />
                    {message.senderHash}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      message.encryptionLevel === 'AES-256' 
                        ? 'border-primary text-primary'
                        : 'border-cipher-amber text-cipher-amber'
                    }`}
                  >
                    {message.encryptionLevel}
                  </Badge>
                  
                  <span className="text-xs text-muted-foreground font-mono">
                    {message.timestamp}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                {message.isEncrypted ? (
                  <div className="bg-muted/50 p-3 rounded border-l-2 border-l-cipher-amber">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-cipher-amber font-mono">ENCRYPTED MESSAGE</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDecryptMessage(message.id)}
                        className="border-cipher-amber text-cipher-amber hover:bg-cipher-amber/10 h-7"
                      >
                        <Unlock className="w-3 h-3 mr-1" />
                        Decrypt
                      </Button>
                    </div>
                    <p className="font-mono text-sm text-muted-foreground break-all">
                      {message.content}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed animate-decrypt-reveal">
                    {message.content}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    TTL: {message.ttl}
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    {message.encryptionLevel}
                  </div>
                </div>
                
                {showDebugLog && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMessage(
                      selectedMessage === message.id ? null : message.id
                    )}
                    className="h-6 text-xs font-mono"
                  >
                    <ChevronUp className={`w-3 h-3 transition-transform ${
                      selectedMessage === message.id ? 'rotate-180' : ''
                    }`} />
                    Debug
                  </Button>
                )}
              </div>

              {showDebugLog && selectedMessage === message.id && (
                <div className="mt-3 bg-muted/30 p-3 rounded border font-mono text-xs">
                  <div className="text-primary mb-1">Encryption Debug Info:</div>
                  <div className="text-muted-foreground whitespace-pre-wrap">
                    {message.debugInfo}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="glass-panel p-4 m-4 mt-0">
        <div className="flex items-center space-x-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type secure message..."
              className="terminal-input pr-12"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Badge variant="outline" className="border-primary text-primary text-xs">
                <Lock className="w-3 h-3 mr-1" />
                AES-256
              </Badge>
            </div>
          </div>
          
          <Button 
            onClick={handleSendMessage}
            className="cipher-button"
            disabled={!newMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}