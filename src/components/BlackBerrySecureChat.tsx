import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Send, 
  Shield, 
  Lock, 
  CheckCircle2, 
  Users, 
  Phone, 
  Settings,
  Paperclip,
  MoreVertical,
  Search,
  Video,
  File,
  Image,
  FileText,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { blackBerryDynamics } from '@/services/BlackBerryDynamics';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  encrypted: boolean;
  deliveryStatus: 'sending' | 'delivered' | 'read';
  messageType: 'text' | 'file' | 'image';
  fileName?: string;
  fileSize?: string;
  isOwn: boolean;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  avatar?: string;
  department?: string;
}

interface BlackBerrySecureChatProps {
  onBack: () => void;
}

export default function BlackBerrySecureChat({ onBack }: BlackBerrySecureChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactList, setShowContactList] = useState(true);
  const [messagesEndRef, setMessagesEndRef] = useState<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  // guard to ensure initialization effect runs only once
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return; // prevent repeated runs
    initializedRef.current = true;

    let mounted = true;
    async function loadMessages() {
      setLoading(true);
      try {
        // Simulate loading enterprise contacts
        const enterpriseContacts: Contact[] = [
          {
            id: '1',
            name: 'Sarah Connor',
            email: 's.connor@cyberdyne.corp',
            status: 'online',
            department: 'Security Operations'
          },
          {
            id: '2', 
            name: 'John Matrix',
            email: 'j.matrix@defense.mil',
            status: 'away',
            department: 'Military Intelligence',
            lastSeen: new Date(Date.now() - 300000)
          },
          {
            id: '3',
            name: 'Diana Prince',
            email: 'd.prince@justice.gov',
            status: 'online',
            department: 'Federal Security'
          },
          {
            id: '4',
            name: 'Bruce Wayne',
            email: 'b.wayne@waynetech.com',
            status: 'offline',
            department: 'Technology Division',
            lastSeen: new Date(Date.now() - 7200000)
          }
        ];
        
        setContacts(enterpriseContacts);
        
        // Auto-select first contact and load messages
        if (enterpriseContacts.length > 0) {
          setSelectedContact(enterpriseContacts[0]);
          loadMessagesForContact(enterpriseContacts[0].id);
        }
      } catch (e) {
        console.warn('loadMessages error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadMessages();

    return () => {
      mounted = false;
    };
  }, []); // run once on mount

  const loadMessagesForContact = async (contactId: string) => {
    // Simulate loading encrypted messages for selected contact
    const sampleMessages: Message[] = [
      {
        id: '1',
        sender: contacts.find(c => c.id === contactId)?.name || 'Unknown',
        content: 'The quantum encryption keys have been rotated successfully.',
        timestamp: new Date(Date.now() - 600000),
        encrypted: true,
        deliveryStatus: 'read',
        messageType: 'text',
        isOwn: false
      },
      {
        id: '2',
        sender: 'You',
        content: 'Confirmed. All BlackBerry Dynamics policies are enforced.',
        timestamp: new Date(Date.now() - 300000),
        encrypted: true,
        deliveryStatus: 'read',
        messageType: 'text',
        isOwn: true
      },
      {
        id: '3',
        sender: contacts.find(c => c.id === contactId)?.name || 'Unknown',
        content: 'Sending classified document via secure channel.',
        timestamp: new Date(Date.now() - 120000),
        encrypted: true,
        deliveryStatus: 'delivered',
        messageType: 'file',
        fileName: 'threat_assessment_report.pdf',
        fileSize: '2.4 MB',
        isOwn: false
      },
      {
        id: '4',
        sender: 'You',
        content: 'Document received and verified. Integrity check passed.',
        timestamp: new Date(Date.now() - 60000),
        encrypted: true,
        deliveryStatus: 'delivered',
        messageType: 'text',
        isOwn: true
      }
    ];
    
    setMessages(sampleMessages);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    const messageData = {
      content: newMessage,
      recipient: selectedContact.id,
      encrypted: isEncrypted
    };

    // Encrypt and send via BlackBerry Dynamics
    const encryptedMessage = await blackBerryDynamics.encryptMessage(messageData.content, 'temp_key', 'AES-256-GCM');
    
    const message: Message = {
      id: Date.now().toString(),
      sender: 'You',
      content: newMessage,
      timestamp: new Date(),
      encrypted: isEncrypted,
      deliveryStatus: 'sending',
      messageType: 'text',
      isOwn: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate delivery confirmation
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, deliveryStatus: 'delivered' }
            : msg
        )
      );
    }, 1000);
  };

  const getDeliveryStatusIcon = (status: Message['deliveryStatus']) => {
    switch (status) {
      case 'sending':
        return <div className="w-3 h-3 border border-muted-foreground border-t-transparent rounded-full animate-spin" />;
      case 'delivered':
        return <CheckCircle2 className="w-3 h-3 text-primary" />;
      case 'read':
        return <div className="flex -space-x-1">
          <CheckCircle2 className="w-3 h-3 text-primary" />
          <CheckCircle2 className="w-3 h-3 text-primary" />
        </div>;
    }
  };

  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background matrix-bg">
      <div className="max-w-7xl mx-auto h-screen flex">
        
        {/* Contact List Sidebar */}
        {showContactList && (
          <div className="w-80 border-r border-border bg-card/50 backdrop-blur-sm">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onBack}
                  className="hover:bg-primary/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
              
              <h2 className="text-lg font-semibold mb-3 holo-text flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-400" />
                BlackBerry SecureChat
              </h2>
              
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="terminal-input pl-10"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => {
                    setSelectedContact(contact);
                    loadMessagesForContact(contact.id);
                  }}
                  className={`p-4 cursor-pointer transition-colors hover:bg-primary/10 border-b border-border/50 ${
                    selectedContact?.id === contact.id ? 'bg-primary/20' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-mono">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${getStatusColor(contact.status)}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium truncate">{contact.name}</h4>
                        <Badge variant="outline" className="border-blue-500 text-blue-400 text-xs">
                          BB-DYN
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
                      <p className="text-xs text-blue-400">{contact.department}</p>
                      {contact.status === 'offline' && contact.lastSeen && (
                        <p className="text-xs text-muted-foreground">
                          Last seen: {contact.lastSeen.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          
          {/* Chat Header */}
          {selectedContact && (
            <div className="p-4 border-b border-border bg-card/30 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {!showContactList && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowContactList(true)}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <div className="relative">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-mono">
                        {selectedContact.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${getStatusColor(selectedContact.status)}`} />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">{selectedContact.name}</h3>
                    <p className="text-xs text-muted-foreground">{selectedContact.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="border-blue-500 text-blue-400 text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        E2EE Active
                      </Badge>
                      <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        AES-256-GCM
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedContact ? (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'glass-panel'
                      }`}
                    >
                      {!message.isOwn && (
                        <p className="text-xs text-blue-400 mb-1">{message.sender}</p>
                      )}
                      
                      {message.messageType === 'file' ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{message.fileName}</p>
                              <p className="text-xs text-muted-foreground">{message.fileSize}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="text-xs">
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs">
                              <Eye className="w-3 h-3 mr-1" />
                              Preview
                            </Button>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1">
                          {message.encrypted && (
                            <Lock className="w-3 h-3 text-green-400" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        
                        {message.isOwn && (
                          <div className="flex items-center">
                            {getDeliveryStatusIcon(message.deliveryStatus)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={setMessagesEndRef} />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">BlackBerry SecureChat</h3>
                  <p className="text-muted-foreground">Select a contact to start secure messaging</p>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          {selectedContact && (
            <div className="p-4 border-t border-border bg-card/30 backdrop-blur-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                  <Lock className="w-3 h-3 mr-1" />
                  End-to-End Encrypted
                </Badge>
                <Badge variant="outline" className="border-blue-500 text-blue-400 text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  BlackBerry Dynamics
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a secure message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="terminal-input pr-12"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEncrypted(!isEncrypted)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {isEncrypted ? (
                      <Eye className="w-4 h-4 text-green-400" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-red-400" />
                    )}
                  </Button>
                </div>
                
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="cipher-button"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}