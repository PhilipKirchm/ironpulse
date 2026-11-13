import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

const fmt = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

/** Laufende Trainingsdauer. Rechnet ab dem Startzeitpunkt, laeuft also auch nach App-Wechsel korrekt weiter. */
export const ElapsedTime = ({ startedAt }) => {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);
    const sec = Math.max(0, Math.floor((now - startedAt) / 1000));
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg-card-highlight)', border: '1px solid var(--border)', borderRadius: 14, padding: '4px 10px', fontSize: '0.85rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>
            <Timer size={14} color="var(--primary)" /> {fmt(sec)}
        </div>
    );
};
