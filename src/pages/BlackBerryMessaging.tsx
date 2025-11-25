import React, { useEffect, useRef, useState } from 'react';

type Message = {
	id: string;
	author: string;
	text: string;
	timestamp: number;
};

export default function BlackBerryMessaging(): JSX.Element {
	const [messages, setMessages] = useState<Message[]>([]);
	const [text, setText] = useState('');
	const [loading, setLoading] = useState(false);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const bottomRef = useRef<HTMLDivElement | null>(null);
	const [isNearBottom, setIsNearBottom] = useState(true); // assume start at bottom
	const AUTO_SCROLL_THRESHOLD = 120; // px from bottom to auto-scroll

	// update isNearBottom on scroll
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		function checkNearBottom() {
			const delta = container.scrollHeight - container.scrollTop - container.clientHeight;
			setIsNearBottom(delta < AUTO_SCROLL_THRESHOLD);
		}

		// initial check
		checkNearBottom();

		container.addEventListener('scroll', checkNearBottom, { passive: true });
		return () => container.removeEventListener('scroll', checkNearBottom);
	}, []);

	// Safe scroll-to-bottom helper
	function scrollToBottom(smooth = true) {
		const container = containerRef.current;
		if (container) {
			try {
				container.scrollTo({ top: container.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
				return;
			} catch {}
		}
		if (bottomRef.current) {
			try {
				bottomRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' });
			} catch {}
		}
	}

	// Initial load (no forced jump to bottom)
	useEffect(() => {
		let mounted = true;
		(async function load() {
			setLoading(true);
			try {
				// Replace with secure http/get via your GD wrapper/context
				const seed: Message[] = [
					{ id: '1', author: 'Alice', text: 'Welcome to secure chat', timestamp: Date.now() - 90000 },
					{ id: '2', author: 'Bob', text: 'BlackBerry Dynamics policies active', timestamp: Date.now() - 60000 },
				];
				if (mounted) setMessages(seed);
			} catch (e) {
				console.warn('fetchMessages error', e);
			} finally {
				if (mounted) setLoading(false);
				// DO NOT force scrollToBottom here; respect user/viewport
			}
		})();
		return () => {
			mounted = false;
		};
	}, []);

	// Auto-scroll only when user is near bottom
	useEffect(() => {
		if (isNearBottom) {
			// small delay to wait for DOM paint
			const id = setTimeout(() => scrollToBottom(true), 30);
			return () => clearTimeout(id);
		}
		// if user scrolled up, do nothing (preserve position)
	}, [messages.length, isNearBottom]);

	// Example sendMessage (optimistic)
	async function sendMessage() {
		const trimmed = text.trim();
		if (!trimmed) return;
		const newMsg: Message = { id: String(Date.now()), author: 'Me', text: trimmed, timestamp: Date.now() };
		setMessages((s) => [...s, newMsg]);
		setText('');
		// server call omitted; auto-scroll will run only if user is near bottom
	}

	// Helper to show "Jump to latest" when not at bottom
	const showJumpButton = !isNearBottom;

	return (
		<div style={styles.container}>
			<header style={styles.header}>
				<div style={styles.badgeRow}>
					<span style={styles.badge}>End-to-End Encrypted</span>
					<span style={styles.tag}>BlackBerry Dynamics</span>
				</div>
				<div style={styles.title}>BlackBerry Messaging</div>
			</header>

			<div style={styles.chatArea}>
				<div ref={containerRef} style={styles.messages}>
					{loading && <div style={styles.empty}>Loading messages…</div>}
					{!loading && messages.length === 0 && <div style={styles.empty}>No messages yet.</div>}
					{messages.map((m) => (
						<div key={m.id} style={styles.msgRow}>
							<div style={styles.msgHeader}>
								<span style={styles.msgAuthor}>{m.author}</span>
								<span style={styles.msgTime}>{new Date(m.timestamp).toLocaleTimeString()}</span>
							</div>
							<div style={styles.msgText}>{m.text}</div>
						</div>
					))}
					<div ref={bottomRef} />
				</div>

				{/* Jump-to-latest floating button */}
				{showJumpButton && (
					<button onClick={() => scrollToBottom(true)} style={styles.jumpBtn} aria-label="Jump to latest">
						Latest
					</button>
				)}

				<div style={styles.inputRow}>
					<textarea
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder="Type a secure message..."
						style={styles.input}
						rows={1}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								sendMessage();
							}
						}}
						aria-label="Message input"
					/>
					<button onClick={sendMessage} style={styles.sendBtn} aria-label="Send message">
						➤
					</button>
				</div>
			</div>
		</div>
	);
}

const styles: { [k: string]: React.CSSProperties } = {
	container: {
		display: 'flex',
		flexDirection: 'column',
		height: '100vh',
		background: 'linear-gradient(180deg,#071018 0%,#05080a 100%)',
		color: '#bff7ee',
		padding: 12,
		boxSizing: 'border-box',
	},
	header: {
		padding: '8px 12px',
		borderBottom: '1px solid rgba(20,32,39,0.6)',
	},
	badgeRow: {
		display: 'flex',
		gap: 8,
		alignItems: 'center',
	},
	badge: {
		background: '#003b2f',
		color: '#a7fff0',
		padding: '4px 8px',
		borderRadius: 12,
		fontSize: 12,
	},
	tag: {
		background: '#072f3a',
		color: '#66ffcc',
		padding: '4px 8px',
		borderRadius: 12,
		fontSize: 12,
	},
	title: {
		color: '#39ffec',
		fontWeight: 700,
		marginTop: 8,
	},
	chatArea: {
		display: 'flex',
		flexDirection: 'column',
		flex: 1,
		minHeight: 0,
		marginTop: 12,
		position: 'relative',
	},
	messages: {
		flex: 1,
		overflowY: 'auto',
		padding: 12,
		display: 'flex',
		flexDirection: 'column',
		gap: 10,
		borderRadius: 8,
		backgroundImage:
			'repeating-linear-gradient(transparent, transparent 3px, rgba(0,20,10,0.02) 3px, rgba(0,20,10,0.02) 4px)',
	},
	msgRow: {
		backgroundColor: '#071018',
		border: '1px solid #072634',
		padding: 12,
		borderRadius: 8,
		maxWidth: '80%',
		alignSelf: 'flex-start',
	},
	msgHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		marginBottom: 6,
	},
	msgAuthor: {
		color: '#9df7e8',
		fontWeight: 600,
	},
	msgTime: {
		color: '#66ffcc88',
		fontSize: 11,
	},
	msgText: {
		color: '#dffef6',
		fontSize: 15,
	},
	jumpBtn: {
		position: 'absolute',
		right: 18,
		bottom: 84,
		background: 'linear-gradient(90deg,#27f2b8,#0bd6a3)',
		color: '#041014',
		border: 'none',
		padding: '8px 12px',
		borderRadius: 20,
		cursor: 'pointer',
		boxShadow: '0 6px 18px rgba(0,0,0,0.4)',
		fontWeight: 700,
	},
	inputRow: {
		display: 'flex',
		gap: 8,
		paddingTop: 10,
		borderTop: '1px solid rgba(20,32,39,0.5)',
	},
	input: {
		flex: 1,
		resize: 'none',
		backgroundColor: '#06131a',
		color: '#bff7ee',
		padding: '10px 12px',
		borderRadius: 8,
		border: '1px solid #09343d',
		outline: 'none',
		minHeight: 40,
	},
	sendBtn: {
		backgroundColor: '#2ef2c9',
		border: 'none',
		borderRadius: 8,
		padding: '10px 14px',
		cursor: 'pointer',
		fontWeight: 700,
	},
	empty: {
		color: '#66ffcc88',
		textAlign: 'center',
		marginTop: 20,
	},
};
	msgText: {
		color: '#dffef6',
		fontSize: 15,
	},
	inputRow: {
		display: 'flex',
		gap: 8,
		paddingTop: 10,
		borderTop: '1px solid rgba(20,32,39,0.5)',
	},
	input: {
		flex: 1,
		resize: 'none',
		backgroundColor: '#06131a',
		color: '#bff7ee',
		padding: '10px 12px',
		borderRadius: 8,
		border: '1px solid #09343d',
		outline: 'none',
		minHeight: 40,
	},
	sendBtn: {
		backgroundColor: '#2ef2c9',
		border: 'none',
		borderRadius: 8,
		padding: '10px 14px',
		cursor: 'pointer',
		fontWeight: 700,
	},
	empty: {
		color: '#66ffcc88',
		textAlign: 'center',
		marginTop: 20,
	},
};
