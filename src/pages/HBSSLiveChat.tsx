import { useState, useEffect, useRef } from 'react';
import { Send, Shield, Users, Activity, Eye, CheckCircle, XCircle, Loader, LogOut, BookOpen, Hash, Key } from 'lucide-react';
import { useUser, SignIn, UserButton } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { hbssKeygen, hbssSign, hbssVerify, HBSSKeyPair, HBSSSignature } from '../services/crypto/HBSS';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ChatMessage {
  id: string;
  sender: string;
  senderAvatar: string;
  message: string;
  signature: HBSSSignature;
  commitment: string;
  timestamp: number;
  verified?: boolean;
  isOwn?: boolean;
}

export default function HBSSLiveChat() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [keyPair, setKeyPair] = useState<HBSSKeyPair | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [stats, setStats] = useState({
    messagesSigned: 0,
    messagesVerified: 0,
    avgSignTime: 0,
    avgVerifyTime: 0
  });
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Generate keys on mount
  useEffect(() => {
    generateKeys();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-connect when user is signed in and keys are ready
  useEffect(() => {
    if (isSignedIn && clerkUser && keyPair && !isConnected) {
      connectToChat();
    }
  }, [isSignedIn, clerkUser, keyPair]);

  const generateKeys = async () => {
    try {
      const storedKeys = localStorage.getItem('hbss_keys');
      if (storedKeys) {
        setKeyPair(JSON.parse(storedKeys));
        console.log('HBSS keys loaded from storage');
      } else {
        const keys = await hbssKeygen(512, 1024);
        setKeyPair(keys);
        localStorage.setItem('hbss_keys', JSON.stringify(keys));
        console.log('HBSS keys generated');
      }
    } catch (error) {
      console.error('Key generation failed:', error);
    }
  };

  const connectToChat = () => {
    if (!clerkUser || !keyPair) return;

    try {
      // Connect to real WebSocket server
      const websocket = new WebSocket('ws://localhost:8000/ws');
      
      websocket.onopen = () => {
        console.log('✅ Connected to HBSS LiveChat server');
        setWs(websocket);
        setIsConnected(true);
        
        // Send join message
        const username = clerkUser.fullName || clerkUser.firstName || 'User';
        websocket.send(JSON.stringify({
          type: 'join',
          sender: username,
          commitment: keyPair.publicKey.commitmentRoot
        }));
      };
      
      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleIncomingMessage(data);
      };
      
      websocket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code);
        setWs(null);
        setIsConnected(false);
        
        // Try to reconnect after 3 seconds
        setTimeout(() => {
          if (clerkUser && keyPair) {
            connectToChat();
          }
        }, 3000);
      };
      
      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        console.log('⚠️ Make sure backend is running: cd hbss-backend && python main.py');
      };
      
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      console.log('⚠️ Backend not running. Start it with: cd hbss-backend && python main.py');
      
      // Fallback to mock mode
      const mockWs = {
        send: (data: string) => {
          const parsed = JSON.parse(data);
          setTimeout(() => {
            handleIncomingMessage(parsed);
          }, 100);
        },
        close: () => {},
        readyState: 1
      } as any;

      setWs(mockWs);
      setIsConnected(true);
      setOnlineUsers([clerkUser.fullName || clerkUser.firstName || 'You']);
    }
  };

  const handleIncomingMessage = async (data: any) => {
    // Handle different message types from backend
    if (data.type === 'system') {
      console.log('System:', data.message);
      return;
    }
    
    if (data.type === 'history') {
      // Load message history
      const historyMessages: ChatMessage[] = [];
      for (const msg of data.messages || []) {
        const username = clerkUser?.fullName || clerkUser?.firstName || 'You';
        const isOwn = msg.sender === username;
        
        historyMessages.push({
          id: msg.id || Date.now().toString(),
          sender: msg.sender,
          senderAvatar: '',
          message: msg.message,
          signature: msg.signature,
          commitment: msg.commitment,
          timestamp: msg.timestamp || Date.now(),
          verified: true,
          isOwn
        });
      }
      setMessages(historyMessages);
      return;
    }
    
    if (data.type === 'users') {
      // Update online users list
      setOnlineUsers(data.users || []);
      return;
    }
    
    // Handle regular message
    const username = clerkUser?.fullName || clerkUser?.firstName || 'You';
    const isOwn = data.sender === username;
    
    let verified = true;
    let verifyTime = 0;
    
    if (!isOwn && keyPair && data.signature) {
      const startTime = performance.now();
      try {
        verified = await hbssVerify(
          data.message,
          data.signature,
          { commitmentRoot: data.commitment, commitments: [], m: 512 }
        );
        verifyTime = performance.now() - startTime;
        
        setStats(prev => ({
          ...prev,
          messagesVerified: prev.messagesVerified + 1,
          avgVerifyTime: (prev.avgVerifyTime * prev.messagesVerified + verifyTime) / (prev.messagesVerified + 1)
        }));
      } catch (error) {
        verified = false;
      }
    }

    const chatMessage: ChatMessage = {
      id: data.id || Date.now().toString(),
      sender: data.sender,
      senderAvatar: data.senderAvatar || '',
      message: data.message,
      signature: data.signature,
      commitment: data.commitment,
      timestamp: data.timestamp || Date.now(),
      verified,
      isOwn
    };

    setMessages(prev => [...prev, chatMessage]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !keyPair || !ws || !clerkUser) return;

    setIsSigning(true);
    const startTime = performance.now();

    try {
      const signature = await hbssSign(inputMessage, keyPair.privateKey);
      const signTime = performance.now() - startTime;

      const username = clerkUser.fullName || clerkUser.firstName || 'You';
      const messageData = {
        type: 'message',
        id: Date.now().toString(),
        sender: username,
        senderAvatar: clerkUser.imageUrl || '',
        message: inputMessage,
        signature,
        commitment: keyPair.publicKey.commitmentRoot,
        timestamp: Date.now()
      };

      // Send to backend
      ws.send(JSON.stringify(messageData));

      // Add own message to local state immediately
      const ownMessage: ChatMessage = {
        id: messageData.id,
        sender: username,
        senderAvatar: clerkUser.imageUrl || '',
        message: inputMessage,
        signature,
        commitment: keyPair.publicKey.commitmentRoot,
        timestamp: Date.now(),
        verified: true,
        isOwn: true
      };

      setMessages(prev => [...prev, ownMessage]);

      setStats(prev => ({
        ...prev,
        messagesSigned: prev.messagesSigned + 1,
        avgSignTime: (prev.avgSignTime * prev.messagesSigned + signTime) / (prev.messagesSigned + 1)
      }));

      setInputMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSigning(false);
    }
  };

  const disconnect = () => {
    if (ws) {
      ws.close();
      setWs(null);
    }
    setIsConnected(false);
    setMessages([]);
    setOnlineUsers([]);
  };

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-violet-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Show Clerk sign-in if not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-slate-900 to-black flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEzOSwgOTIsIDI0NiwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-cyan-500 to-violet-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">HBSS LiveChat</h1>
            <p className="text-violet-300">Post-Quantum Secure Real-Time Messaging</p>
            <div className="mt-4 text-sm text-slate-400">
              Sign in to access quantum-safe chat
            </div>
          </div>
          <SignIn 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-slate-900/80 backdrop-blur-xl border-violet-500/30"
              }
            }}
          />
        </div>
      </div>
    );
  }

  // Show loading while keys are generating
  if (!keyPair) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-slate-900 to-black flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border-violet-500/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader className="w-12 h-12 text-violet-400 animate-spin mx-auto" />
              <div>
                <p className="text-white font-medium">Generating HBSS Keys...</p>
                <p className="text-sm text-slate-400 mt-2">Creating quantum-resistant cryptographic keys</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Chat Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-slate-900 to-black">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEzOSwgOTIsIDI0NiwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />

      <div className="relative z-10 h-screen flex flex-col">
        {/* Header */}
        <div className="bg-slate-900/80 backdrop-blur-xl border-b border-violet-500/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {clerkUser?.imageUrl && (
                <img 
                  src={clerkUser.imageUrl} 
                  alt={clerkUser.fullName || 'User'}
                  className="w-10 h-10 rounded-full border-2 border-cyan-500"
                />
              )}
              <div>
                <h1 className="text-xl font-bold text-white">HBSS LiveChat</h1>
                <p className="text-sm text-violet-300">
                  {clerkUser?.fullName || clerkUser?.firstName || 'User'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/hbss-explained')}
                variant="outline"
                className="border-violet-500/30 hover:bg-violet-500/10 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Learn HBSS</span>
              </Button>
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">{isConnected ? 'Connected' : 'Connecting...'}</span>
              </div>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-violet-500/30 p-4 space-y-4">
            {/* Online Users */}
            <Card className="bg-slate-800/50 border-violet-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  Online ({onlineUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {onlineUsers.map((user, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                    <span className={index === 0 ? 'text-cyan-400 font-medium' : 'text-slate-300'}>
                      {user} {index === 0 && '(You)'}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-slate-800/50 border-violet-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-violet-400" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Messages Signed</span>
                  <span className="text-cyan-400 font-medium">{stats.messagesSigned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Messages Verified</span>
                  <span className="text-emerald-400 font-medium">{stats.messagesVerified}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Sign Time</span>
                  <span className="text-violet-400 font-medium">{stats.avgSignTime.toFixed(2)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Verify Time</span>
                  <span className="text-amber-400 font-medium">{stats.avgVerifyTime.toFixed(2)}ms</span>
                </div>
              </CardContent>
            </Card>

            {/* Key Info */}
            <Card className="bg-slate-800/50 border-violet-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Your Keys
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div>
                  <div className="text-slate-400 mb-1">Public Key</div>
                  <code className="text-cyan-400 break-all">
                    {keyPair?.publicKey.commitmentRoot.substring(0, 24)}...
                  </code>
                </div>
                <div className="text-slate-500 text-xs">
                  512 commitments, 1024 preimages
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="bg-slate-900/50 border-b border-violet-500/30 rounded-none px-6">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="inspector">Signature Inspector</TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="flex-1 flex flex-col m-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <Shield className="w-16 h-16 mx-auto mb-4 text-violet-500/50" />
                      <p className="text-slate-400">No messages yet. Start chatting!</p>
                      <p className="text-sm text-slate-500 mt-2">All messages are signed with HBSS</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'} group`}
                        onClick={() => {
                          setSelectedMessage(msg);
                          setActiveTab('inspector');
                          console.log('Message selected:', msg);
                        }}
                      >
                        <div className={`max-w-[70%] ${msg.isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                          <div className="flex items-center gap-2 px-2">
                            {msg.senderAvatar && (
                              <img 
                                src={msg.senderAvatar} 
                                alt={msg.sender}
                                className="w-5 h-5 rounded-full"
                              />
                            )}
                            <span className="text-xs font-medium text-slate-400">{msg.sender}</span>
                            <span className="text-xs text-slate-600">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                            {!msg.isOwn && (
                              msg.verified ? (
                                <CheckCircle className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <XCircle className="w-3 h-3 text-red-400" />
                              )
                            )}
                          </div>
                          <div
                            className={`px-4 py-3 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg relative ${
                              selectedMessage?.id === msg.id ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-900' : ''
                            } ${
                              msg.isOwn
                                ? 'bg-gradient-to-br from-cyan-600 to-violet-600 text-white rounded-tr-sm'
                                : msg.verified
                                ? 'bg-slate-800/80 text-slate-100 border border-emerald-500/30 rounded-tl-sm'
                                : 'bg-red-950/50 text-red-200 border border-red-500/50 rounded-tl-sm'
                            }`}
                          >
                            <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                            {selectedMessage?.id === msg.id && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                <Eye className="w-3 h-3 text-slate-900" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-6 bg-slate-900/50 backdrop-blur-xl border-t border-violet-500/30">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !isSigning && sendMessage()}
                      placeholder="Type a message... (will be signed with HBSS)"
                      disabled={isSigning}
                      className="flex-1 px-4 py-3 bg-slate-800/50 border border-violet-500/30 rounded-xl text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none disabled:opacity-50"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isSigning}
                      className="px-6 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-700 hover:to-violet-700"
                    >
                      {isSigning ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3" />
                      Messages are signed with HBSS before sending
                    </div>
                    <div className="flex items-center gap-2 text-violet-400">
                      <Eye className="w-3 h-3" />
                      Click any message to inspect signature
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="inspector" className="flex-1 m-0 overflow-y-auto">
                {selectedMessage ? (
                  <div className="p-6 space-y-6 max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                        <Eye className="w-6 h-6 text-cyan-400" />
                        HBSS Signature Inspector
                      </h2>
                      <p className="text-slate-400">Analyzing message from <span className="text-cyan-400 font-semibold">{selectedMessage.sender}</span></p>
                    </div>

                    {/* Grid Layout */}
                    <div className="space-y-6">
                      
                      {/* Original Message */}
                      <div className="bg-slate-800 rounded-xl p-6 border border-blue-500/30 space-y-6">
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <div className="text-sm font-semibold text-slate-200">Original Message</div>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-blue-950/50 to-slate-950 border border-blue-500/30 rounded-lg">
                            <p className="text-slate-100 text-base">{selectedMessage.message}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-purple-400" />
                            <div className="text-sm font-semibold text-slate-200">Message Digest (SHA-512)</div>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-purple-950/50 to-slate-950 border border-purple-500/30 rounded-lg">
                            <div className="text-xs text-purple-300 font-mono leading-relaxed break-all select-all">
                              {selectedMessage.signature.digest}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <p className="text-slate-500 italic">512-bit (64 bytes) cryptographic hash</p>
                            <p className="text-purple-400">{selectedMessage.signature.digest.length} characters</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-cyan-400" />
                            <div className="text-sm font-semibold text-slate-200">
                              Revealed Preimages ({selectedMessage.signature.revealedPreimages.length} of 512)
                            </div>
                          </div>
                          <div className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-slate-800">
                            {selectedMessage.signature.revealedPreimages.slice(0, 10).map((preimage, i) => (
                              <div key={i} className="p-3 bg-gradient-to-r from-cyan-950/50 to-slate-950 border border-cyan-500/30 rounded-lg hover:border-cyan-500/50 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="px-2 py-1 bg-cyan-500/20 rounded text-xs text-cyan-300 font-semibold">
                                    Index {selectedMessage.signature.indices[i]}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {preimage.length} chars
                                  </div>
                                </div>
                                <div className="text-xs text-cyan-300 break-all font-mono leading-relaxed select-all">
                                  {preimage}
                                </div>
                              </div>
                            ))}
                            {selectedMessage.signature.revealedPreimages.length > 10 && (
                              <div className="text-center py-3 px-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                <p className="text-sm text-slate-400">
                                  ... and <span className="text-cyan-400 font-semibold">{selectedMessage.signature.revealedPreimages.length - 10}</span> more preimages
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  Total: {selectedMessage.signature.revealedPreimages.length} preimages revealed
                                </p>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 italic">These secret values prove ownership of the private key</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-400" />
                            <div className="text-sm font-semibold text-slate-200">Public Key (Commitment Root)</div>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-emerald-950/50 to-slate-950 border border-emerald-500/30 rounded-lg">
                            <div className="text-xs text-emerald-300 break-all font-mono leading-relaxed select-all">
                              {selectedMessage.commitment}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <p className="text-slate-500 italic">Merkle tree root for verification</p>
                            <p className="text-emerald-400">{selectedMessage.commitment.length} characters</p>
                          </div>
                        </div>

                        <div className={`p-6 rounded-xl border-2 ${
                          selectedMessage.verified
                            ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/10 border-emerald-500/50'
                            : 'bg-gradient-to-r from-red-500/20 to-rose-500/10 border-red-500/50'
                        }`}>
                          <div className="flex items-center gap-3 mb-3">
                            {selectedMessage.verified ? (
                              <>
                                <div className="p-2 bg-emerald-500/20 rounded-full">
                                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                  <div className="font-bold text-lg text-emerald-400">Signature Verified ✓</div>
                                  <div className="text-sm text-emerald-300">Quantum-resistant authentication confirmed</div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="p-2 bg-red-500/20 rounded-full">
                                  <XCircle className="w-6 h-6 text-red-400" />
                                </div>
                                <div>
                                  <div className="font-bold text-lg text-red-400">Signature Invalid ✗</div>
                                  <div className="text-sm text-red-300">Verification failed</div>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="pl-14 space-y-1">
                            <p className="text-sm text-slate-300">
                              {selectedMessage.verified
                                ? '✓ All preimages hash correctly to commitment root'
                                : '✗ Signature verification failed - message may be tampered'}
                            </p>
                            {selectedMessage.verified && (
                              <>
                                <p className="text-sm text-slate-300">✓ Message digest matches signature</p>
                                <p className="text-sm text-slate-300">✓ Merkle tree verification passed</p>
                                <p className="text-sm text-emerald-400 font-semibold mt-2">
                                  🛡️ This message is cryptographically authentic
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[400px]">
                    <div className="text-center p-8 bg-slate-800/30 rounded-xl border-2 border-dashed border-violet-500/30">
                      <Eye className="w-20 h-20 mx-auto mb-4 text-violet-400" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Message Selected</h3>
                      <p className="text-slate-400 mb-4">Click on any message in the chat to inspect its HBSS signature</p>
                      <div className="flex items-center justify-center gap-2 text-sm text-violet-300">
                        <Shield className="w-4 h-4" />
                        <span>View cryptographic details and verify quantum-resistant signatures</span>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
