// Minimal mock for browser builds — logs actions and uses localStorage as a fallback.
export const GdApp = {
  start: (_opts?: any, success?: () => void, failure?: (err:any) => void) => {
    console.info('[GD MOCK] start called');
    try {
      // emulate async startup
      setTimeout(() => success && success(), 100);
    } catch (e) {
      failure && failure(e);
    }
  },
  on: (evt: string, cb: (...args:any[]) => void) => {
    console.info('[GD MOCK] on', evt);
    // no-op - mock does not emit events
  },
  isReady: () => true,
};

export const GdSecureStorage = {
  get: (key: string, success: (value: string | null) => void, failure?: (err:any) => void) => {
    try {
      const v = localStorage.getItem(`gd:${key}`);
      console.info('[GD MOCK] get', key, v);
      success(v);
    } catch (e) {
      console.warn('[GD MOCK] get error', e);
      failure && failure(e);
    }
  },
  set: (key: string, value: string, success?: () => void, failure?: (err:any) => void) => {
    try {
      localStorage.setItem(`gd:${key}`, value);
      console.info('[GD MOCK] set', key);
      success && success();
    } catch (e) {
      console.warn('[GD MOCK] set error', e);
      failure && failure(e);
    }
  },
  remove: (key: string, success?: () => void, failure?: (err:any) => void) => {
    try {
      localStorage.removeItem(`gd:${key}`);
      console.info('[GD MOCK] remove', key);
      success && success();
    } catch (e) {
      console.warn('[GD MOCK] remove error', e);
      failure && failure(e);
    }
  },
};

export const GdHttpRequest = {
  // Minimal wrapper that delegates to fetch in the mock
  sendRequest: (options: { url: string; method?: string; headers?: any; body?: any }, onSuccess: (status:number, headers:any, body:string)=>void, onError: (err:any)=>void) => {
    console.info('[GD MOCK] sendRequest', options.method, options.url);
    fetch(options.url, {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body,
    })
      .then(async (res) => {
        const text = await res.text();
        const hdrs: any = {};
        res.headers.forEach((v,k) => (hdrs[k]=v));
        onSuccess(res.status, hdrs, text);
      })
      .catch(onError);
  },
};
