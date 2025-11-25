import path from 'path';
import fs from 'fs/promises';

type GdSdk = any;

const STORAGE_FILE = path.resolve(__dirname, '../../_gd_fallback_storage.json');
const CHAT_KEY = 'chat_history';

let sdk: GdSdk | null = null;
let sdkLoaded = false;

async function loadSdk() {
  if (sdkLoaded) return;
  sdkLoaded = true;
  try {
    // adjust path if your SDK folder name differs
    const sdkPath = path.resolve(__dirname, '..', '..', '..', 'BlackBerry_Dynamics_SDK_for_React_Native_v13.0.0.21', 'modules');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    sdk = require(sdkPath);
    console.info('[GD WRAPPER] Loaded SDK from', sdkPath);
    // attach some event handlers if available
    if (sdk && sdk.GdApp && typeof sdk.GdApp.on === 'function') {
      sdk.GdApp.on('authorized', () => console.info('[GD] authorized'));
      sdk.GdApp.on('locked', () => console.warn('[GD] locked'));
      sdk.GdApp.on('wiped', () => console.warn('[GD] wiped'));
    }
  } catch (e) {
    sdk = null;
    console.warn('[GD WRAPPER] SDK not available, using fallback file storage', e);
  }
}

// fallback small key-value file store
async function readFallback(): Promise<Record<string, any>> {
  try {
    const txt = await fs.readFile(STORAGE_FILE, 'utf8');
    return JSON.parse(txt || '{}');
  } catch {
    return {};
  }
}
async function writeFallback(data: Record<string, any>) {
  await fs.writeFile(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// gd storage wrappers
export async function gdSetItem(key: string, value: string): Promise<void> {
  await loadSdk();
  if (sdk && sdk.GdSecureStorage && typeof sdk.GdSecureStorage.set === 'function') {
    return new Promise((resolve, reject) => {
      try {
        sdk.GdSecureStorage.set(key, value, () => resolve(), (err: any) => reject(err));
      } catch (e) {
        reject(e);
      }
    });
  }
  // fallback file
  const data = await readFallback();
  data[key] = value;
  await writeFallback(data);
}

export async function gdGetItem(key: string): Promise<string | null> {
  await loadSdk();
  if (sdk && sdk.GdSecureStorage && typeof sdk.GdSecureStorage.get === 'function') {
    return new Promise((resolve, reject) => {
      try {
        sdk.GdSecureStorage.get(key, (val: string | null) => resolve(val), (err: any) => reject(err));
      } catch (e) {
        reject(e);
      }
    });
  }
  const data = await readFallback();
  return data[key] ?? null;
}

export async function gdSendRequest(options: { url: string; method?: string; headers?: any; body?: any; timeout?: number }): Promise<{ status:number; headers:any; body:string }> {
  await loadSdk();
  if (sdk && sdk.GdHttpRequest && typeof sdk.GdHttpRequest.sendRequest === 'function') {
    return new Promise((resolve, reject) => {
      try {
        sdk.GdHttpRequest.sendRequest(
          { url: options.url, method: options.method || 'GET', headers: options.headers, body: options.body },
          (status: number, headers: any, body: string) => resolve({ status, headers, body }),
          (err: any) => reject(err)
        );
      } catch (e) {
        reject(e);
      }
    });
  }
  // fallback to native fetch (node 18+) or node-fetch if needed
  const fetchFn = (global as any).fetch;
  if (typeof fetchFn === 'function') {
    const res = await fetchFn(options.url, { method: options.method || 'GET', headers: options.headers, body: options.body });
    const txt = await res.text();
    const hdrs: Record<string,string> = {};
    (res.headers || new Map()).forEach?.((v: any, k: string) => { hdrs[k] = v; });
    return { status: res.status, headers: hdrs, body: txt };
  }
  throw new Error('No HTTP transport available');
}

// simple token validation (best-effort). Adjust to call SDK token verification if available.
export async function validateGdToken(token?: string): Promise<{ ok: boolean; reason?: string; senderId?: string }> {
  await loadSdk();
  if (!token) return { ok: false, reason: 'missing token' };
  // If SDK exposes server-side verification, call it here. Fallback: accept any non-empty token and echo senderId.
  // WARNING: For production, use real GD server-side verification.
  return { ok: true, senderId: token };
}

// convenience: store/retrieve chat history (array)
export async function gdLoadChatHistory(limit = 200): Promise<any[]> {
  try {
    const raw = await gdGetItem(CHAT_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return [];
    if (limit) return arr.slice(-limit);
    return arr;
  } catch (e) {
    console.warn('gdLoadChatHistory parse error', e);
    return [];
  }
}

export async function gdSaveChatMessage(msg: any): Promise<void> {
  const arr = await gdLoadChatHistory(0);
  arr.push(msg);
  await gdSetItem(CHAT_KEY, JSON.stringify(arr));
}

export async function gdClearChat() {
  await gdSetItem(CHAT_KEY, JSON.stringify([]));
}
