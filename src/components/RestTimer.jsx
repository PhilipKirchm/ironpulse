import { useEffect, useRef, useState } from 'react';
import { Timer, X } from 'lucide-react';

const PRESETS = [60, 90, 120, 180];

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/**
 * Pausentimer. Rechnet mit einer Endzeit (endAt), damit er auch nach kurzem
 * Wechsel in eine andere App korrekt weiterlaeuft.
 */
export const RestTimer = ({ endAt, duration, onAdjust, onPreset, onClose }) => {
    const [now, setNow] = useState(Date.now());
    const firedRef = useRef(false);

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 250);
        return () => clearInterval(id);
    }, []);

    const remaining = Math.max(0, Math.ceil((endAt - now) / 1000));
    const done = remaining === 0;

    // Neue Endzeit (z. B. neuer Satz) => wieder scharf schalten
    useEffect(() => { firedRef.current = false; }, [endAt]);

    useEffect(() => {
        if (!done || firedRef.current) return;
        firedRef.current = true;
        try { navigator.vibrate?.([200, 100, 200]); } catch { /* nicht unterstuetzt */ }
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [done, endAt, onClose]);

    const progress = duration > 0 ? Math.min(1, Math.max(0, 1 - remaining / duration)) : 1;

    return (
        <div style={{
            position: 'fixed', left: '50%', transform: 'translateX(-50%)',
            bottom: 0, width: 'min(500px, 100%)', boxSizing: 'border-box', zIndex: 90,
            padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
            background: 'rgba(28, 28, 30, 0.97)', backdropFilter: 'blur(20px)',
            borderTop: '1px solid var(--border)'
        }}>
            <div style={{ height: 3, background: 'var(--bg-card-highlight)', borderRadius: 2, marginBottom: 10, overflow: 'hidden' }}>
                <div style={{ width: `${progress * 100}%`, height: '100%', background: done ? 'var(--accent)' : 'var(--primary)', transition: 'width 0.25s linear' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Timer size={20} color={done ? 'var(--accent)' : 'var(--primary)'} />
                <div style={{ fontSize: '1.4rem', fontWeight: 700, minWidth: 64, fontVariantNumeric: 'tabular-nums', color: done ? 'var(--accent)' : 'var(--text-main)' }}>
                    {done ? 'Los!' : fmt(remaining)}
                </div>
                <button type="button" onClick={() => onAdjust(-15)} aria-label="15 Sekunden weniger"
                    style={chipStyle(false)}>-15</button>
                <button type="button" onClick={() => onAdjust(15)} aria-label="15 Sekunden mehr"
                    style={chipStyle(false)}>+15</button>
                <button type="button" onClick={onClose} aria-label="Timer schließen"
                    style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}>
                    <X size={22} />
                </button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {PRESETS.map(p => (
                    <button key={p} type="button" onClick={() => onPreset(p)} style={chipStyle(p === duration)}>
                        {p >= 120 ? `${p / 60} min` : `${p} s`}
                    </button>
                ))}
            </div>
        </div>
    );
};

const chipStyle = (active) => ({
    padding: '6px 12px', borderRadius: 16, border: 'none', cursor: 'pointer',
    fontSize: '0.8rem', fontWeight: 600,
    background: active ? 'var(--primary)' : 'var(--bg-card-highlight)',
    color: active ? '#fff' : 'var(--text-secondary)'
});
