import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  Terminal, 
  Lock,
  Clock,
  User
} from 'lucide-react';
import { Node } from './types';

interface NodeMessageQueueProps {
  nodes: Node[];
  onSendMessage: (nodeId: string, message: string) => void;
}

export function NodeMessageQueue({ nodes, onSendMessage }: NodeMessageQueueProps) {
  const [selectedNode, setSelectedNode] = useState<string>(nodes[0]?.id || '');
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedNode) return;
    
    setIsTyping(true);
    setTimeout(() => {
      onSendMessage(selectedNode, messageInput);
      setMessageInput('');
      setIsTyping(false);
    }, 500 + Math.random() * 1000);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const currentNode = nodes.find(n => n.id === selectedNode);

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary flex items-center">
          <Terminal className="w-5 h-5 mr-2" />
          Message Queue
        </h3>
        
        <div className="flex space-x-2">
          {nodes.map(node => (
            <Button
              key={node.id}
              variant={selectedNode === node.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedNode(node.id)}
              className="text-xs"
            >
              {node.label}
            </Button>
          ))}
        </div>
      </div>

      {currentNode && (
        <div className="space-y-4">
          {/* Node Status */}
          <div className="message-block">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="font-semibold text-sm">{currentNode.label}</span>
              </div>
              <Badge variant="outline" className="border-cipher-terminal text-cipher-terminal">
                {currentNode.messages.length} MESSAGES
              </Badge>
            </div>
            
            <div className="text-xs font-mono text-muted-foreground">
              Encryption: {currentNode.encryptionModule}
            </div>
          </div>

          {/* Message History */}
          <div className="space-y-2">
            <div className="flex items-center text-sm font-medium text-muted-foreground">
              <MessageSquare className="w-4 h-4 mr-2" />
              Terminal History
            </div>
            
            <ScrollArea className="h-40 w-full border border-primary/20 rounded-lg bg-muted/5">
              <div className="p-3 space-y-2">
                {currentNode.messages.length === 0 ? (
                  <div className="text-center text-muted-foreground text-xs font-mono py-4">
                    No messages received
                  </div>
                ) : (
                  currentNode.messages.map(message => (
                    <div key={message.id} className="terminal-input p-2 rounded text-xs font-mono">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-cipher-terminal">FROM: {message.sender}</span>
                          {message.encrypted && (
                            <Lock className="w-3 h-3 text-cipher-terminal" />
                          )}
                        </div>
                        <div className="flex items-center text-muted-foreground text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>
                      
                      <div className="text-foreground">
                        {message.content}
                      </div>
                    </div>
                  ))
                )}
                
                {isTyping && (
                  <div className="terminal-input p-2 rounded text-xs font-mono animate-pulse">
                    <div className="text-cipher-amber">
                      Incoming transmission...
                      <span className="animate-pulse">█</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Enter secure message..."
                className="terminal-input font-mono text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isTyping}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || isTyping}
                className="cipher-button"
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground font-mono">
              Messages will be encrypted with {currentNode.encryptionModule}
            </div>
          </div>
        </div>
      )}
      
      {nodes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Terminal className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p className="font-mono text-sm">No client nodes available</p>
          <p className="text-xs">Add client nodes to the network</p>
        </div>
      )}
    </Card>
  );
}