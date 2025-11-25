// Cross-platform wrapper for BlackBerry Dynamics APIs.
// - When running in React Native, dynamically require the native SDK if available.
// - When running in web, falls back to mock / localStorage + fetch.
type Nullable<T> = T | null;

let sdk: any = null;
let usingNative = false;

function isReactNativeEnv(): boolean {
  // navigator.product === 'ReactNative' is a common RN runtime indicator
  return typeof navigator !== 'undefined' && (navigator as any).product === 'ReactNative';
}

async function ensureSdkLoaded(): Promise<void> {
  if (sdk) return;
  try {
    if (isReactNativeEnv()) {
      // dynamic require so bundlers for web don't try to resolve native module
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      sdk = require('blackberry-dynamics-sdk');
      usingNative = true;
      console.info('[GD WRAPPER] native SDK loaded');
    } else {
      // in web, alias resolves to our mock (vite.config alias)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      sdk = require('blackberry-dynamics-sdk');
      usingNative = false;
      console.info('[GD WRAPPER] web/mock SDK loaded');
    }
  } catch (e) {
    console.warn('[GD WRAPPER] failed to load SDK, falling back to web-mode', e);
    // fallback to a minimal inline mock if require failed
    sdk = {
      GdApp: { start: (opts:any,s?:any,f?:any)=>s && s(), on: ()=>{}, isReady: ()=>false },
      GdSecureStorage: {
        get: (k:any, s:any, f:any) => { try { s(localStorage.getItem(`gd:${k}`)); } catch(e){ f&&f(e);} },
        set: (k:any,v:any,s?:any,f?:any) => { try { localStorage.setItem(`gd:${k}`, v); s && s(); } catch(e){ f&&f(e);} },
        remove: (k:any,s?:any,f?:any) => { try { localStorage.removeItem(`gd:${k}`); s && s(); } catch(e){ f&&f(e);} },
      },
      GdHttpRequest: {
        sendRequest: (opts:any,onS:any,onE:any) => {
          fetch(opts.url, { method: opts.method || 'GET', headers: opts.headers, body: opts.body })
            .then(async (res)=> { const t = await res.text(); const hdrs:any={}; res.headers.forEach((v,k)=>(hdrs[k]=v)); onS(res.status, hdrs, t); })
            .catch(onE);
        }
      }
    };
    usingNative = false;
  }
}

// Public API
export async function init(options?: any): Promise<void> {
  await ensureSdkLoaded();
  return new Promise((resolve, reject) => {
    try {
      if (sdk && sdk.GdApp && typeof sdk.GdApp.start === 'function') {
        sdk.GdApp.start(
          options || {},
          () => {
            console.info('[GD WRAPPER] runtime started');
            resolve();
          },
          (err: any) => {
            console.warn('[GD WRAPPER] start error', err);
            reject(err);
          }
        );
      } else {
        console.info('[GD WRAPPER] no GdApp.start, resolving');
        resolve();
      }
    } catch (e) {
      reject(e);
    }
  });
}

export async function isReady(): Promise<boolean> {
  await ensureSdkLoaded();
  try {
    return !!(sdk && sdk.GdApp && sdk.GdApp.isReady ? sdk.GdApp.isReady() : true);
  } catch {
    return false;
  }
}

export async function secureSet(key: string, value: string): Promise<void> {
  await ensureSdkLoaded();
  return new Promise((resolve, reject) => {
    try {
      if (sdk && sdk.GdSecureStorage && typeof sdk.GdSecureStorage.set === 'function') {
        sdk.GdSecureStorage.set(
          key,
          value,
          () => resolve(),
          (err: any) => {
            console.warn('[GD WRAPPER] secureSet failure, falling back to localStorage', err);
            try {
              localStorage.setItem(`gd:${key}`, value);
              resolve();
            } catch (e) {
              reject(e);
            }
          }
        );
      } else {
        localStorage.setItem(`gd:${key}`, value);
        resolve();
      }
    } catch (e) {
      reject(e);
    }
  });
}

export async function secureGet(key: string): Promise<Nullable<string>> {
  await ensureSdkLoaded();
  return new Promise((resolve, reject) => {
    try {
      if (sdk && sdk.GdSecureStorage && typeof sdk.GdSecureStorage.get === 'function') {
        sdk.GdSecureStorage.get(
          key,
          (val: string | null) => resolve(val),
          (err: any) => {
            console.warn('[GD WRAPPER] secureGet failure, falling back to localStorage', err);
            try {
              resolve(localStorage.getItem(`gd:${key}`));
            } catch (e) {
              reject(e);
            }
          }
        );
      } else {
        resolve(localStorage.getItem(`gd:${key}`));
      }
    } catch (e) {
      reject(e);
    }
  });
}

export async function secureRemove(key: string): Promise<void> {
  await ensureSdkLoaded();
  return new Promise((resolve, reject) => {
    try {
      if (sdk && sdk.GdSecureStorage && typeof sdk.GdSecureStorage.remove === 'function') {
        sdk.GdSecureStorage.remove(
          key,
          () => resolve(),
          (err: any) => {
            console.warn('[GD WRAPPER] secureRemove failure, falling back to localStorage', err);
            try {
              localStorage.removeItem(`gd:${key}`);
              resolve();
            } catch (e) {
              reject(e);
            }
          }
        );
      } else {
        localStorage.removeItem(`gd:${key}`);
        resolve();
      }
    } catch (e) {
      reject(e);
    }
  });
}

export async function httpGet(url: string, headers: any = {}): Promise<{ status:number; headers:any; body:string }> {
  await ensureSdkLoaded();
  return new Promise((resolve, reject) => {
    try {
      if (sdk && sdk.GdHttpRequest && typeof sdk.GdHttpRequest.sendRequest === 'function') {
        sdk.GdHttpRequest.sendRequest(
          { url, method: 'GET', headers },
          (status:number, resHeaders:any, body:string) => resolve({ status, headers: resHeaders, body }),
          (err:any) => {
            console.warn('[GD WRAPPER] httpGet error', err);
            reject(err);
          }
        );
      } else {
        fetch(url, { method: 'GET', headers })
          .then(async (res) => {
            const text = await res.text();
            const hdrs:any = {};
            res.headers.forEach((v,k)=>(hdrs[k]=v));
            resolve({ status: res.status, headers: hdrs, body: text });
          })
          .catch(reject);
      }
    } catch (e) {
      reject(e);
    }
  });
}

export async function httpPost(url: string, body: any, headers: any = {}): Promise<{ status:number; headers:any; body:string }> {
  await ensureSdkLoaded();
  return new Promise((resolve, reject) => {
    try {
      if (sdk && sdk.GdHttpRequest && typeof sdk.GdHttpRequest.sendRequest === 'function') {
        sdk.GdHttpRequest.sendRequest(
          { url, method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, headers), body: typeof body === 'string' ? body : JSON.stringify(body) },
          (status:number, resHeaders:any, resBody:string) => resolve({ status, headers: resHeaders, body: resBody }),
          (err:any) => {
            console.warn('[GD WRAPPER] httpPost error', err);
            reject(err);
          }
        );
      } else {
        fetch(url, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, headers), body: typeof body === 'string' ? body : JSON.stringify(body) })
          .then(async (res) => {
            const text = await res.text();
            const hdrs:any = {};
            res.headers.forEach((v,k)=>(hdrs[k]=v));
            resolve({ status: res.status, headers: hdrs, body: text });
          })
          .catch(reject);
      }
    } catch (e) {
      reject(e);
    }
  });
}
