import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, Shield, Wifi, WifiOff, ChevronDown, Lock, Phone, Video, MoreVertical, Paperclip, Smile } from 'lucide-react';
import { Link } from 'react-router-dom';
import useRealtimeChat from '../hooks/useRealtimeChat';
import { useGd } from '@/contexts/GdContext';

type LocalMsg = {
  id: string;
  senderId: string;
  text: string;
  mode: 'AES' | 'MDS' | 'Quantum';
  ts: number;
  tampered?: boolean;
};

const STORAGE_KEY = 'messaging-preferred-mode';
const AUTO_SCROLL_THRESHOLD = 120;

export default function Messaging(): JSX.Element {
  const { storage, gdReady } = useGd();
  const { messages: incomingMessages, sendMessage: hookSend, transport } = useRealtimeChat();

  const [mode, setMode] = useState<'AES' | 'MDS' | 'Quantum'>('AES');
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<LocalMsg[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [newPending, setNewPending] = useState(0);

  // Load preferred mode from GD secure storage
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const v = await storage.getItem(STORAGE_KEY);
        if (mounted && v && (v === 'AES' || v === 'MDS' || v === 'Quantum')) setMode(v);
      } catch (e) {
        console.warn('load mode failed', e);
      }
    })();
    return () => { mounted = false; };
  }, [gdReady, storage]);

  // Persist mode
  useEffect(() => {
    storage.setItem(STORAGE_KEY, mode).catch(() => {});
  }, [mode, storage]);

  // Merge incoming messages into local history with real-time updates
  useEffect(() => {
    if (!incomingMessages || incomingMessages.length === 0) return;
    
    setHistory((prev) => {
      const existingIds = new Set(prev.map(m => m.id));
      const newItems = incomingMessages
        .filter((m: any) => !existingIds.has(m.id))
        .map((m: any) => ({
          id: m.id,
          senderId: m.senderId ?? 'remote',
          text: m.text ?? '',
          mode: (m.mode === 'Quantum' || m.mode === 'MDS') ? 'MDS' : 'AES',
          ts: m.ts || Date.now(),
          tampered: !!m.tampered || !!m.info?.uncorrectable,
        })) as LocalMsg[];

      if (newItems.length === 0) return prev;

      // Auto-scroll if near bottom
      if (isNearBottom) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.scrollTop = containerRef.current.scrollHeight;
            }
          }, 50);
        });
      } else {
        setNewPending((n) => n + newItems.length);
      }
      
      return [...prev, ...newItems].sort((a, b) => a.ts - b.ts);
    });
  }, [incomingMessages, isNearBottom]);

  // Track scroll position
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const check = () => {
      const delta = c.scrollHeight - c.scrollTop - c.clientHeight;
      setIsNearBottom(delta < AUTO_SCROLL_THRESHOLD);
      if (delta < AUTO_SCROLL_THRESHOLD) setNewPending(0);
    };
    check();
    c.addEventListener('scroll', check, { passive: true });
    return () => c.removeEventListener('scroll', check);
  }, []);

  // Send handler
  async function onSend() {
    const txt = input.trim();
    if (!txt) return;
    
    const localId = `${Date.now()}-local`;
    const localMsg: LocalMsg = { 
      id: localId, 
      senderId: 'me', 
      text: txt, 
      mode, 
      ts: Date.now() 
    };
    
    setHistory((h) => [...h, localMsg]);
    setInput('');
    
    // Auto-scroll
    if (isNearBottom) {
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, 50);
    }
    
    try {
      await hookSend(txt, mode);
    } catch (e) {
      console.error('send failed', e);
      setHistory((h) => h.map((m) => 
        m.id === localId ? { ...m, text: `${m.text} ❌` } : m
      ));
    }
  }

  // Jump to latest
  function jumpToLatest() {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    setNewPending(0);
  }

  const isConnected = transport?.connected;
  const encryptionIcon = mode === 'AES' ? '🔐' : mode === 'MDS' ? '🛡️' : '⚛️';

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-semibold text-white">
              SC
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Sarah Connor</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-emerald-400 flex items-center gap-1">
                  {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">Security Operations</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Encryption Mode Selector */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <Shield className="w-4 h-4 text-emerald-400" />
            <select 
              value={mode} 
              onChange={(e) => setMode(e.target.value as any)}
              className="bg-transparent text-sm text-slate-300 border-none outline-none cursor-pointer"
            >
              <option value="AES">AES-256</option>
              <option value="MDS">MDS (Hamming)</option>
              <option value="Quantum">Quantum</option>
            </select>
          </div>

          <button className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
            <Phone className="w-5 h-5 text-slate-400" />
          </button>
          <button className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
            <Video className="w-5 h-5 text-slate-400" />
          </button>
          <button className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Status Bar */}
      <div className="px-6 py-2 bg-slate-900/30 border-b border-slate-800/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span className="text-slate-400">End-to-end encrypted</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">
            BlackBerry Dynamics: <span className={gdReady ? 'text-emerald-400' : 'text-amber-400'}>
              {gdReady ? 'Active' : 'Initializing'}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span>{encryptionIcon}</span>
          <span>{mode} Encryption Active</span>
        </div>
      </div>

      {/* Messages Area */}
      <main className="flex-1 overflow-hidden relative">
        <div 
          ref={containerRef}
          className="h-full overflow-y-auto px-6 py-4 space-y-4"
          style={{
            scrollBehavior: 'smooth',
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(51 65 85 / 0.1) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        >
          {history.map((m, idx) => {
            const isMe = m.senderId === 'me';
            const showAvatar = idx === 0 || history[idx - 1].senderId !== m.senderId;
            
            return (
              <div 
                key={m.id} 
                className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} ${!showAvatar && 'ml-12'}`}
              >
                {showAvatar && !isMe && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                    {m.senderId.substring(0, 2).toUpperCase()}
                  </div>
                )}
                {showAvatar && isMe && <div className="w-8" />}
                
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                  {showAvatar && (
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-xs font-medium text-slate-300">
                        {isMe ? 'You' : m.senderId}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  
                  <div 
                    className={`
                      px-4 py-2.5 rounded-2xl
                      ${isMe 
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white' 
                        : m.tampered 
                          ? 'bg-red-950/50 border border-red-500/50 text-red-200'
                          : 'bg-slate-800/50 text-slate-100 border border-slate-700/50'
                      }
                      ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}
                      backdrop-blur-sm
                      shadow-lg
                    `}
                  >
                    {m.tampered && (
                      <div className="flex items-center gap-1 text-xs text-red-400 mb-1">
                        <span>⚠️</span>
                        <span>Integrity check failed</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed break-words">{m.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* New Messages Indicator */}
        {newPending > 0 && !isNearBottom && (
          <button 
            onClick={jumpToLatest}
            className="absolute bottom-24 right-6 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg flex items-center gap-2 transition-all animate-bounce"
          >
            <ChevronDown className="w-4 h-4" />
            <span className="text-sm font-medium">{newPending} new message{newPending > 1 ? 's' : ''}</span>
          </button>
        )}
      </main>

      {/* Input Area */}
      <div className="px-6 py-4 bg-slate-900/50 backdrop-blur-xl border-t border-slate-800/50">
        <div className="flex items-end gap-3">
          <button className="p-2.5 hover:bg-slate-800/50 rounded-lg transition-colors mb-1">
            <Paperclip className="w-5 h-5 text-slate-400" />
          </button>
          
          <div className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden focus-within:border-emerald-500/50 transition-colors">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="Type a secure message..."
              className="w-full px-4 py-3 bg-transparent text-slate-100 placeholder-slate-500 outline-none text-sm"
            />
          </div>

          <button className="p-2.5 hover:bg-slate-800/50 rounded-lg transition-colors mb-1">
            <Smile className="w-5 h-5 text-slate-400" />
          </button>
          
          <button 
            onClick={onSend}
            disabled={!input.trim()}
            className="p-3 bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg disabled:shadow-none mb-1"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
