import React, { useState } from 'react';
import { init, secureSet, secureGet, secureRemove } from '@/lib/blackberryDynamics';

export default function BBDynamicDemo(): JSX.Element {
  const [key, setKey] = useState('secret_key');
  const [value, setValue] = useState('top-secret-value');
  const [loadedValue, setLoadedValue] = useState<string | null>(null);
  const [status, setStatus] = useState('idle');

  async function onInit() {
    setStatus('initializing');
    try {
      await init();
      setStatus('initialized');
    } catch (e) {
      console.warn('init error', e);
      setStatus('init failed');
    }
  }

  async function onSave() {
    setStatus('saving');
    try {
      await secureSet(key, value);
      setStatus('saved');
    } catch (e) {
      console.warn('save error', e);
      setStatus('save failed');
    }
  }

  async function onLoad() {
    setStatus('loading');
    try {
      const v = await secureGet(key);
      setLoadedValue(v);
      setStatus('loaded');
    } catch (e) {
      console.warn('load error', e);
      setStatus('load failed');
    }
  }

  async function onRemove() {
    setStatus('removing');
    try {
      await secureRemove(key);
      setLoadedValue(null);
      setStatus('removed');
    } catch (e) {
      console.warn('remove error', e);
      setStatus('remove failed');
    }
  }

  return (
    <div style={{ background: '#071018', color: '#9df7e8', padding: 16, borderRadius: 8 }}>
      <h3 style={{ color: '#39ffec' }}>BlackBerry Dynamics Demo (web-friendly)</h3>
      <div style={{ marginBottom: 8 }}>
        <button onClick={onInit} style={{ marginRight: 8 }}>Init</button>
        <button onClick={onSave} style={{ marginRight: 8 }}>Secure Save</button>
        <button onClick={onLoad} style={{ marginRight: 8 }}>Load</button>
        <button onClick={onRemove}>Remove</button>
      </div>

      <div style={{ marginTop: 8 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Key</label>
        <input value={key} onChange={(e)=>setKey(e.target.value)} />
      </div>

      <div style={{ marginTop: 8 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Value</label>
        <input value={value} onChange={(e)=>setValue(e.target.value)} />
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Status:</strong> <span>{status}</span>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Loaded value:</strong> <span>{loadedValue ?? '<null>'}</span>
      </div>
    </div>
  );
}
