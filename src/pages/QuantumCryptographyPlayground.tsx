import React, { useEffect, useRef, useState } from 'react';
import { encodeMessage, simulateNoise, decodeMessage, qkdRun } from '@/services/quantum/QuantumMds';
import { useGd } from '@/contexts/GdContext';

type HistoryItem = {
	id: string;
	mode: 'AES' | 'BlackBerry' | 'Quantum';
	original: string;
	details?: any;
	timestamp: number;
	status: 'sent' | 'failed' | 'local';
};

const BACKEND_SEND = 'https://example.secure.api/messages'; // <- replace with your secure endpoint
const STORAGE_KEY_MODE = 'qc-preferred-mode';

export default function QuantumCryptographyPlayground(): JSX.Element {
	const { http, storage, gdReady } = useGd();
	const [mode, setMode] = useState<'AES' | 'BlackBerry' | 'Quantum'>('Quantum');
	const [input, setInput] = useState('');
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const bottomRef = useRef<HTMLDivElement | null>(null);
	const [isNearBottom, setIsNearBottom] = useState(true);
	const AUTO_SCROLL_THRESHOLD = 120;

	// load preferred mode
	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const pref = await storage.getItem(STORAGE_KEY_MODE);
				if (mounted && pref && (pref === 'AES' || pref === 'BlackBerry' || pref === 'Quantum')) setMode(pref);
			} catch (e) {
				console.warn('load pref failed', e);
			}
		})();
		return () => {
			mounted = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [gdReady]);

	// persist preferred mode
	useEffect(() => {
		storage.setItem(STORAGE_KEY_MODE, mode).catch(() => {});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mode]);

	// monitor scroll position
	useEffect(() => {
		const c = containerRef.current;
		if (!c) return;
		const check = () => {
			const delta = c.scrollHeight - c.scrollTop - c.clientHeight;
			setIsNearBottom(delta < AUTO_SCROLL_THRESHOLD);
		};
		check();
		c.addEventListener('scroll', check, { passive: true });
		return () => c.removeEventListener('scroll', check);
	}, []);

	// auto-scroll when user near bottom
	useEffect(() => {
		if (isNearBottom) {
			const id = setTimeout(() => {
				if (containerRef.current) {
					try {
						containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'auto' });
						return;
					} catch {}
				}
				if (bottomRef.current) bottomRef.current.scrollIntoView({ block: 'end' });
			}, 40);
			return () => clearTimeout(id);
		}
	}, [history.length, isNearBottom]);

	function pushHistory(item: HistoryItem) {
		setHistory((s) => [...s, item]);
	}

	async function send() {
		if (!input.trim()) return;
		const id = String(Date.now());
		const original = input;
		pushHistory({ id, mode, original, timestamp: Date.now(), status: 'local' });
		setInput('');

		if (mode === 'AES') {
			// demo AES placeholder: base64 as "ciphertext"
			const cipher = typeof window !== 'undefined' && window.btoa ? window.btoa(unescape(encodeURIComponent(original))) : Buffer.from(original).toString('base64');
			try {
				await http.post(BACKEND_SEND, { mode: 'AES', payload: cipher });
				setHistory((s) => s.map((h) => (h.id === id ? { ...h, details: { cipher }, status: 'sent' } : h)));
			} catch (e) {
				setHistory((s) => s.map((h) => (h.id === id ? { ...h, details: { cipher, error: String(e) }, status: 'failed' } : h)));
			}
		} else if (mode === 'BlackBerry') {
			try {
				await http.post(BACKEND_SEND, { mode: 'BlackBerry', payload: original });
				setHistory((s) => s.map((h) => (h.id === id ? { ...h, details: { via: 'GD' }, status: 'sent' } : h)));
			} catch (e) {
				setHistory((s) => s.map((h) => (h.id === id ? { ...h, details: { error: String(e) }, status: 'failed' } : h)));
			}
		} else {
			// Quantum mode: run encoding, noise, decode locally and transport original securely via GD
			try {
				const enc = encodeMessage(original);
				const noisy = simulateNoise(enc, 0.02); // 2% bit error rate default
				const decoded = decodeMessage(noisy);
				// attempt to send original via GD-secure post for demo
				let transportOk = true;
				try {
					await http.post(BACKEND_SEND, { mode: 'Quantum', payload: original, meta: { encLen: enc.length } });
				} catch (e) {
					transportOk = false;
					console.warn('transport failed', e);
				}

				setHistory((s) =>
					s.map((h) =>
						h.id === id
							? {
									...h,
									details: {
										encodedPreview: Array.from(enc.slice(0, Math.min(16, enc.length))).map((b) => b.toString(16).padStart(2, '0')).join(' '),
										decoded,
										noisyPreview: Array.from(noisy.slice(0, Math.min(16, noisy.length))).map((b) => b.toString(16).padStart(2, '0')).join(' '),
									},
									status: transportOk ? 'sent' : 'failed',
							  }
							: h
					)
				);
			} catch (e) {
				console.warn('quantum path failed', e);
				setHistory((s) => s.map((h) => (h.id === id ? { ...h, details: { error: String(e) }, status: 'failed' } : h)));
			}
		}
	}

	function runQkd() {
		const res = qkdRun(128, Math.random() < 0.4 ? 0.12 : 0.0);
		pushHistory({
			id: 'qkd-' + Date.now(),
			mode: 'Quantum',
			original: '[QKD demo]',
			details: res,
			timestamp: Date.now(),
			status: 'local',
		});
	}

	return (
		<div style={styles.page}>
			<header style={styles.header}>
				<div>
					<h1 style={styles.title}>Quantum Cryptography Playground</h1>
					<div style={styles.sub}>GD: {gdReady ? 'connected' : 'initializing...'}</div>
				</div>

				<div style={styles.controls}>
					<select value={mode} onChange={(e) => setMode(e.target.value as any)} style={styles.select}>
						<option value="AES">AES (sim)</option>
						<option value="BlackBerry">BlackBerry (GD transport)</option>
						<option value="Quantum">Quantum (Hamming demo)</option>
					</select>
					<button onClick={runQkd} style={styles.btn}>Run QKD</button>
				</div>
			</header>

			<div style={styles.body}>
				{/* Left: topology + explanation */}
				<section style={styles.left}>
					<div style={styles.vis}>
						<div style={styles.topoRow}>
							<div style={styles.node}><strong>Sender</strong><div style={styles.small}>message</div></div>
							<div style={styles.arrow}>→</div>
							<div style={styles.node}><strong>Encoder</strong><div style={styles.small}>{mode === 'Quantum' ? 'Hamming(12,8)' : 'AES/GD'}</div></div>
							<div style={styles.arrow}>→</div>
							<div style={styles.node}><strong>Channel</strong><div style={styles.small}>noise & adversary</div></div>
							<div style={styles.arrow}>→</div>
							<div style={styles.node}><strong>Decoder</strong><div style={styles.small}>{mode === 'Quantum' ? 'error-correct' : 'decrypt'}</div></div>
							<div style={styles.arrow}>→</div>
							<div style={styles.node}><strong>Receiver</strong><div style={styles.small}>message</div></div>
						</div>
					</div>

					<div style={styles.legend}>
						<div style={styles.legendItem}><span style={{...styles.swatch, background:'#2ef2c9'}}/>AES</div>
						<div style={styles.legendItem}><span style={{...styles.swatch, background:'#39ffec'}}/>BlackBerry (GD)</div>
						<div style={styles.legendItem}><span style={{...styles.swatch, background:'#8a66ff'}}/>Quantum MDS</div>
					</div>
				</section>

				{/* Right: composer + history */}
				<section style={styles.right}>
					<div style={styles.composer}>
						<input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Type message..."
							style={styles.input}
							onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } }}
						/>
						<button onClick={send} style={styles.sendBtn}>Send</button>
					</div>

					<div ref={containerRef} style={styles.history}>
						{history.length === 0 && <div style={styles.empty}>No messages yet</div>}
						{history.map((h) => (
							<article key={h.id} style={styles.msg}>
								<header style={styles.msgHdr}>
									<span style={styles.tag}>{h.mode}</span>
									<time style={styles.time}>{new Date(h.timestamp).toLocaleTimeString()}</time>
									<span style={{ marginLeft: 8, color: h.status === 'sent' ? '#9df7e8' : '#ff7b7b' }}>{h.status}</span>
								</header>
								<div style={styles.msgBody}>
									<div style={styles.orig}>{h.original}</div>
									{h.details && <pre style={styles.pre}>{JSON.stringify(h.details, null, 2)}</pre>}
								</div>
							</article>
						))}
						<div ref={bottomRef} />
					</div>

					{!isNearBottom && <button onClick={() => { if (containerRef.current) containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' }); }} style={styles.latestBtn}>Latest ▾</button>}
				</section>
			</div>
		</div>
	);
}

const styles: { [k: string]: React.CSSProperties } = {
	page: { minHeight: '100vh', background: 'linear-gradient(180deg,#04060a 0%,#071018 100%)', color: '#dffef6', padding: 16, boxSizing: 'border-box' },
	header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
	title: { color: '#39ffec', margin: 0 },
	sub: { color: '#66ffcc88', fontSize: 13 },
	controls: { display: 'flex', gap: 8, alignItems: 'center' },
	select: { background: '#06131a', color: '#bff7ee', borderRadius: 8, padding: '8px 10px', border: '1px solid #09343d' },
	btn: { background: '#2ef2c9', border: 'none', padding: '8px 10px', borderRadius: 8, cursor: 'pointer' },

	body: { display: 'flex', gap: 12 },
	left: { flex: 1 },
	right: { width: 560, display: 'flex', flexDirection: 'column' },

	vis: { background: '#06131a', padding: 12, borderRadius: 10, border: '1px solid #072634' },
	topoRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
	node: { background: '#071018', padding: '12px 18px', borderRadius: 8, border: '1px solid #09343d', color: '#9df7e8', minWidth: 90, textAlign: 'center' },
	arrow: { color: '#66ffcc', fontWeight: 700 },

	legend: { marginTop: 12, display: 'flex', gap: 12 },
	legendItem: { display: 'flex', gap: 8, alignItems: 'center', color: '#bff7ee' },
	swatch: { width: 14, height: 14, borderRadius: 3 },

	composer: { display: 'flex', gap: 8, marginBottom: 12 },
	input: { flex: 1, padding: 10, borderRadius: 8, border: '1px solid #09343d', background: '#06131a', color: '#bff7ee' },
	sendBtn: { background: '#39ffec', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer' },

	history: { background: '#071018', border: '1px solid #072634', borderRadius: 8, padding: 12, overflowY: 'auto', maxHeight: 520, display: 'flex', flexDirection: 'column', gap: 10 },
	empty: { color: '#66ffcc88', textAlign: 'center', padding: 18 },

	msg: { background: '#06131a', border: '1px solid #09343d', padding: 10, borderRadius: 8 },
	msgHdr: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 },
	tag: { color: '#8a66ff', fontWeight: 700 },
	time: { color: '#66ffcc88', fontSize: 12 },
	msgBody: { color: '#dffef6' },
	orig: { fontWeight: 600 },
	pre: { marginTop: 8, color: '#66ffcc88', fontSize: 12, background: 'rgba(0,0,0,0.12)', padding: 8, borderRadius: 6, overflowX: 'auto' },

	latestBtn: { position: 'absolute', right: 36, bottom: 140, background: '#2ef2c9', border: 'none', padding: '8px 12px', borderRadius: 20, fontWeight: 700, cursor: 'pointer' },
};
								</div>
							</div>
						))}
						<div ref={bottomRef} />
					</div>

					{/* Jump to latest when user scrolled up */}
					{!isNearBottom && (
						<button onClick={() => scrollToBottom(true)} style={styles.jumpBtn}>
							Latest
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

const styles: { [k: string]: React.CSSProperties } = {
	page: {
		padding: 16,
		background: 'linear-gradient(180deg,#071018 0%,#05080a 100%)',
		minHeight: '100vh',
		color: '#dffef6',
		boxSizing: 'border-box',
	},
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	title: { color: '#39ffec', margin: 0 },
	subtitle: { color: '#66ffcc88', fontSize: 13 },
	controls: { display: 'flex', gap: 8, alignItems: 'center' },
	select: { background: '#06131a', color: '#bff7ee', borderRadius: 8, padding: '8px 10px', border: '1px solid #09343d' },
	smallBtn: { background: '#2ef2c9', border: 'none', padding: '8px 10px', borderRadius: 8, cursor: 'pointer' },

	body: { display: 'flex', gap: 12, marginTop: 12 },
	left: { flex: 1 },
	right: { width: 560, display: 'flex', flexDirection: 'column' },

	visBox: { background: '#06131a', padding: 12, borderRadius: 10, border: '1px solid #072634' },
	topologyRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
	node: { background: '#071018', padding: '12px 18px', borderRadius: 8, border: '1px solid #09343d', color: '#9df7e8' },
	arrow: { color: '#66ffcc', fontWeight: 700 },
	legend: { marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' },
	legendItem: { display: 'flex', gap: 8, alignItems: 'center' },
	legendSwatch: { width: 12, height: 12, borderRadius: 3 },

	inputRow: { display: 'flex', gap: 8, marginBottom: 8 },
	input: { flex: 1, background: '#06131a', color: '#bff7ee', padding: '10px', borderRadius: 8, border: '1px solid #09343d' },
	sendBtn: { background: '#39ffec', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer' },

	messages: { background: '#071018', border: '1px solid #072634', borderRadius: 8, padding: 12, overflowY: 'auto', maxHeight: 520, display: 'flex', flexDirection: 'column', gap: 10 },
	empty: { color: '#66ffcc88', textAlign: 'center', padding: 18 },

	msg: { background: '#06131a', border: '1px solid #09343d', padding: 10, borderRadius: 8 },
	msgHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
	msgMode: { color: '#8a66ff', fontWeight: 700 },
	msgTime: { color: '#66ffcc88', fontSize: 12 },
	msgBody: { color: '#dffef6' },
	msgOriginal: { fontWeight: 600 },
	msgPreview: { color: '#bff7ee', marginTop: 6 },
	msgResult: { color: '#9df7e8', marginTop: 6 },
	msgInfo: { marginTop: 8, color: '#66ffcc88', fontSize: 12, background: 'rgba(0,0,0,0.12)', padding: 8, borderRadius: 6 },

	jumpBtn: { position: 'absolute', right: 40, bottom: 140, background: '#2ef2c9', border: 'none', padding: '8px 12px', borderRadius: 20, cursor: 'pointer', fontWeight: 700 },
};
