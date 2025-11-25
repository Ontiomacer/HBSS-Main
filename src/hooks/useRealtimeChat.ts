import { useEffect, useRef, useState } from 'react';
import { useGd } from '@/contexts/GdContext';

type RemoteMsg = {
  id: string;
  text: string;
  senderId?: string;
  mode?: string;
  ts?: number;
  tampered?: boolean;
  info?: any;
};

type TransportState = {
  connected: boolean;
  type: 'ws' | 'rest' | 'none';
  polling?: boolean;
};

const WS_URL = (() => {
  // try to use same host, backend port 3001 (adjust as needed)
  if (typeof window === 'undefined') return '';
  const host = window.location.hostname || 'localhost';
  return `ws://${host}:3001/rt/messages`;
})();

export default function useRealtimeChat() {
  const { http } = useGd();
  const [messages, setMessages] = useState<RemoteMsg[]>([]);
  const [transport, setTransport] = useState<TransportState>({ connected: false, type: 'none' });
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    let reconnectDelay = 1000;

    function connect() {
      if (!mounted) return;
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;
        setTransport({ connected: false, type: 'ws' });

        ws.onopen = () => {
          if (!mounted) return;
          reconnectDelay = 1000;
          setTransport({ connected: true, type: 'ws' });
        };

        ws.onmessage = (ev) => {
          if (!mounted) return;
          try {
            const payload = JSON.parse(ev.data);
            if (payload.type === 'backlog' && Array.isArray(payload.messages)) {
              // replace/initialize
              setMessages((prev) => {
                // merge uniquely by id
                const map = new Map<string, RemoteMsg>();
                prev.forEach((m) => map.set(m.id, m));
                payload.messages.forEach((m: any) => map.set(m.id, { ...m }));
                return Array.from(map.values()).sort((a, b) => (a.ts || 0) - (b.ts || 0));
              });
            } else if (payload.type === 'message' && payload.message) {
              setMessages((prev) => [...prev, payload.message]);
            }
          } catch (e) {
            // ignore malformed
          }
        };

        ws.onclose = () => {
          if (!mounted) return;
          setTransport({ connected: false, type: 'ws' });
          // schedule reconnect
          if (reconnectRef.current == null) {
            reconnectRef.current = window.setTimeout(() => {
              reconnectRef.current = null;
              connect();
            }, reconnectDelay);
            reconnectDelay = Math.min(30000, reconnectDelay * 1.5);
          }
        };

        ws.onerror = () => {
          // let onclose handle reconnect
        };
      } catch (e) {
        // WebSocket not available — fallback to polling via REST
        setTransport({ connected: false, type: 'rest', polling: true });
      }
    }

    connect();

    return () => {
      mounted = false;
      if (wsRef.current) {
        try { wsRef.current.close(); } catch {}
      }
      if (reconnectRef.current != null) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // simple send wrapper: tries WS first, otherwise uses http.post
  async function sendMessage(text: string, mode: string) {
    const payload = { type: 'chat', text, mode: mode === 'MDS' || mode === 'Quantum' ? 'QuantumMDS' : 'GD' };
    // try ws
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(payload));
        return;
      } catch (e) {
        // fall through to HTTP
      }
    }

    // fallback HTTP via GD-enabled http if available, else fetch
    try {
      if (http && typeof http.post === 'function') {
        await http.post('/messages', { text, mode: payload.mode });
        return;
      }
    } catch {
      // fallback to fetch
    }

    // final fallback: plain fetch to same origin /messages
    try {
      await fetch('/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode: payload.mode }),
      });
    } catch (e) {
      throw e;
    }
  }

  return { messages, sendMessage, transport };
}
