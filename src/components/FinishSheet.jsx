import { useState } from 'react';
import { motion } from 'framer-motion';

const RPE_TEXT = {
    1: 'Sehr leicht', 2: 'Leicht', 3: 'Leicht bis moderat', 4: 'Moderat', 5: 'Etwas anstrengend',
    6: 'Anstrengend – noch 4+ Wiederholungen übrig', 7: 'Hart – noch ca. 3 Wiederholungen übrig',
    8: 'Sehr hart – noch ca. 2 Wiederholungen übrig', 9: 'Extrem hart – noch ca. 1 Wiederholung übrig',
    10: 'Maximal – nichts mehr übrig'
};

/** Abschluss-Dialog: Intensitaet (Session-RPE) und Dauer bestaetigen. */
export const FinishSheet = ({ durationMin, onConfirm, onCancel, saving }) => {
    const [rpe, setRpe] = useState(null);
    const [minutes, setMinutes] = useState(String(Math.max(1, Math.round(durationMin))));

    const confirm = (withRpe) => {
        const m = parseFloat(String(minutes).replace(',', '.'));
        onConfirm({ rpe: withRpe ? rpe : null, durationMin: Number.isFinite(m) && m > 0 ? m : durationMin });
    };

    return (
        <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 210, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <motion.div
                initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
                style={{ width: 'min(500px, 100%)', boxSizing: 'border-box', background: 'var(--bg-card)', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}
            >
                <h3 style={{ margin: '0 0 4px 0' }}>Wie hart war das Training?</h3>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
                    Deine Einschätzung der gesamten Einheit (RPE 1–10). Daraus berechne ich deine Wochenbelastung.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <button
                            key={n}
                            onClick={() => setRpe(n)}
                            aria-label={`RPE ${n}`}
                            style={{
                                padding: '12px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '1rem',
                                background: rpe === n ? 'var(--primary)' : 'var(--bg-card-highlight)',
                                color: rpe === n ? '#fff' : 'var(--text-main)'
                            }}
                        >{n}</button>
                    ))}
                </div>
                <div style={{ minHeight: 22, margin: '10px 0 14px 0', fontSize: '0.85rem', color: rpe ? 'var(--primary)' : 'var(--text-tertiary)', fontWeight: 600 }}>
                    {rpe ? RPE_TEXT[rpe] : 'Tippe auf eine Zahl'}
                </div>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>
                    Dauer (Minuten)
                    <input
                        className="input-field"
                        type="number"
                        inputMode="decimal"
                        min="1"
                        value={minutes}
                        onChange={(e) => setMinutes(e.target.value)}
                        style={{ width: 90, textAlign: 'center' }}
                    />
                </label>

                <button className="btn-primary" style={{ width: '100%' }} disabled={!rpe || saving} onClick={() => confirm(true)}>
                    Speichern
                </button>
                <button className="btn-secondary" style={{ width: '100%', marginTop: 10 }} disabled={saving} onClick={() => confirm(false)}>
                    Ohne Bewertung speichern
                </button>
                <button onClick={onCancel} disabled={saving} style={{ width: '100%', marginTop: 8, background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: 10, cursor: 'pointer' }}>
                    Zurück zum Training
                </button>
            </motion.div>
        </div>
    );
};
