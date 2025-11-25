import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { gdGetItem, gdSetItem, gdLoadChatHistory, gdSaveChatMessage, validateGdToken } from './services/gdWrapper';
import { encodeMessage, simulateNoise, decodeMessage, qkdCheck } from './services/quantum/QuantumMds';
import path from 'path';
import { randomUUID } from 'crypto';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const app = express();
app.use(bodyParser.json({ limit: '1mb' }));

// middleware: validate gd token from Authorization: Bearer <token> or x-gd-token
async function gdAuthMiddleware(req: any, res: any, next: any) {
  try {
    const header = req.headers['authorization'] as string | undefined;
    const token = header && header.startsWith('Bearer ') ? header.substring(7) : (req.headers['x-gd-token'] as string | undefined);
    const v = await validateGdToken(token);
    if (!v.ok) return res.status(401).json({ error: 'unauthorized', reason: v.reason });
    (req as any).gdSenderId = v.senderId;
    next();
  } catch (e) {
    return res.status(500).json({ error: 'gd-auth-error', detail: String(e) });
  }
}

/** Data model type */
type ChatMessage = {
  id: string;
  text: string;
  raw?: string;
  senderId: string;
  mode: 'GD' | 'QuantumMDS';
  ts: number;
};

// POST /messages
app.post('/messages', gdAuthMiddleware, async (req, res) => {
  try {
    const { text, clientTs, mode } = req.body as { text: string; clientTs?: number; mode?: 'GD' | 'QuantumMDS' | string };
    if (typeof text !== 'string') return res.status(400).json({ error: 'invalid payload' });
    const senderId = (req as any).gdSenderId || 'anonymous';
    const ts = Date.now();
    const id = randomUUID();
    let msg: ChatMessage = { id, text: '', senderId, mode: mode === 'QuantumMDS' ? 'QuantumMDS' : 'GD', ts };

    if (mode === 'QuantumMDS') {
      const enc = encodeMessage(text);
      const noisy = simulateNoise(enc, 0.02); // demo noise
      const decoded = decodeMessage(noisy);
      const qkd = qkdCheck(enc, noisy);
      msg.raw = Buffer.from(enc).toString('hex');
      msg.text = decoded.text;
      // store audit with details
      await gdSaveChatMessage({ ...msg, audit: { encodedHex: msg.raw, corrected: decoded.corrected, uncorrectable: decoded.uncorrectable, qber: qkd.qber } });
    } else {
      // GD mode: text sent via secure transport; store plaintext for receiver
      msg.text = text;
      await gdSaveChatMessage(msg);
    }

    // broadcast to WS clients
    broadcast({ type: 'message', message: msg });

    return res.json(msg);
  } catch (e) {
    console.error('POST /messages error', e);
    return res.status(500).json({ error: 'server_error', detail: String(e) });
  }
});

// GET /messages?since=
app.get('/messages', gdAuthMiddleware, async (req, res) => {
  try {
    const since = req.query.since ? Number(req.query.since) : 0;
    const raw = await gdGetItem('chat_history');
    const arr = raw ? JSON.parse(raw) : [];
    let result = Array.isArray(arr) ? arr : [];
    if (since) result = result.filter((m: any) => (m.ts || 0) > since);
    result = result.slice(-50);
    // if QuantumMDS entries contain raw hex, decode a preview
    const transformed = result.map((m: any) => {
      if (m.mode === 'QuantumMDS' && m.raw) {
        try {
          const buf = Buffer.from(m.raw, 'hex');
          // decode as Uint8Array
          const decoded = decodeMessage(new Uint8Array(buf));
          return { ...m, decodedPreview: decoded.text, corrected: decoded.corrected, uncorrectable: decoded.uncorrectable };
        } catch {
          return m;
        }
      }
      return m;
    });
    return res.json({ messages: transformed });
  } catch (e) {
    console.error('GET /messages error', e);
    return res.status(500).json({ error: 'server_error', detail: String(e) });
  }
});

app.get('/health', async (req, res) => {
  // attempt to detect gd status (best-effort)
  let gdStatus = 'unknown';
  try {
    // if GD SDK available can probe
    const raw = await gdGetItem('gd_status_probe');
    gdStatus = raw ? 'available' : 'available-fallback';
  } catch {
    gdStatus = 'fallback';
  }
  return res.json({ status: 'ok', gdStatus, uptime: process.uptime() });
});

/* WebSocket server */
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/rt/messages' });
const clients = new Set<WebSocket>();

wss.on('connection', async (ws: WebSocket, req) => {
  try {
    // parse token from query ?token=...
    const url = req.url || '';
    const parsed = new URL('http://localhost' + url);
    const token = parsed.searchParams.get('token') || parsed.searchParams.get('gd_token') || undefined;
    const v = await validateGdToken(token || undefined);
    if (!v.ok) {
      ws.close(4401, 'unauthorized');
      return;
    }
    const senderId = v.senderId || 'ws-unknown';
    (ws as any).senderId = senderId;
    clients.add(ws);

    // preload last 20 messages
    const backlog = await gdLoadChatHistory(20);
    ws.send(JSON.stringify({ type: 'backlog', messages: backlog }));

    ws.on('message', async (data) => {
      try {
        const txt = data.toString();
        const payload = JSON.parse(txt);
        if (payload && payload.type === 'chat' && typeof payload.text === 'string') {
          const mode = payload.mode === 'QuantumMDS' ? 'QuantumMDS' : 'GD';
          const id = randomUUID();
          const ts = Date.now();
          let msg: ChatMessage = { id, text: '', senderId, mode: mode as any, ts };
          if (mode === 'QuantumMDS') {
            const enc = encodeMessage(payload.text);
            const noisy = simulateNoise(enc, payload.errorRate ?? 0.02);
            const decoded = decodeMessage(noisy);
            msg.raw = Buffer.from(enc).toString('hex');
            msg.text = decoded.text;
            await gdSaveChatMessage({ ...msg, audit: { encodedHex: msg.raw, corrected: decoded.corrected, uncorrectable: decoded.uncorrectable } });
          } else {
            msg.text = payload.text;
            await gdSaveChatMessage(msg);
          }
          broadcast({ type: 'message', message: msg });
        }
      } catch (err) {
        console.warn('ws message handler error', err);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });
  } catch (e) {
    console.warn('ws connection error', e);
    ws.close(1011, 'server error');
  }
});

function broadcast(obj: any) {
  const txt = JSON.stringify(obj);
  for (const c of clients) {
    if (c.readyState === WebSocket.OPEN) {
      c.send(txt);
    }
  }
}

server.listen(PORT, async () => {
  console.info(`Server listening on http://localhost:${PORT}`);
});
