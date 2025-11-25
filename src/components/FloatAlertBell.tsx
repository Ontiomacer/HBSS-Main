import React from 'react';

export default function FloatAlertBell({ count = 0, onClick }: { count?: number; onClick?: () => void }) {
  return (
    <button
      aria-label={`Alerts (${count})`}
      onClick={() => {
        if (onClick) onClick();
        else {
          // default action — replace with your alert panel open / navigation logic
          try {
            // If you use a router, replace this with navigation to alerts route
            // e.g. navigate('/alerts')
            window.alert(`You have ${count} alerts`);
          } catch {
            // noop
          }
        }
      }}
      style={{
        position: 'fixed',
        right: 20,
        bottom: 24,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 14,
        background: 'linear-gradient(90deg, rgba(45,255,210,0.12), rgba(20,200,160,0.08))',
        border: '1px solid rgba(46,242,201,0.18)',
        boxShadow: '0 6px 18px rgba(2,15,12,0.6), 0 0 18px rgba(46,242,201,0.06)',
        color: '#e6fffb',
        cursor: 'pointer',
        backdropFilter: 'blur(6px)',
        // prevent the button from being too large on small screens
        minWidth: 56,
      }}
    >
      {/* bell icon (inline SVG to avoid additional deps) */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 10-3 0v.68C7.64 5.36 6 7.929 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0h6z" stroke="#39ffec" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>

      {/* label - compact */}
      <span style={{ color: '#39ffec', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>
        Alerts{typeof count === 'number' ? ` (${count})` : ''}
      </span>
    </button>
  );
}
