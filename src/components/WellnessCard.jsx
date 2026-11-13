import { useState } from 'react';
import { HeartPulse } from 'lucide-react';
import { useData } from '../hooks/useData';
import { dateKey, wellnessScore, readinessAdvice } from '../lib/progression';

const QUESTIONS = [
    { key: 'sleep', label: 'Schlaf', low: 'schlecht', high: 'sehr gut' },
    { key: 'energy', label: 'Energie', low: 'müde', high: 'topfit' },
    { key: 'soreness', label: 'Muskeln', low: 'starker Kater', high: 'locker' },
    { key: 'stress', label: 'Stress', low: 'gestresst', high: 'entspannt' }
];
const COLORS = { good: 'var(--accent)', medium: '#ff9f0a', low: 'var(--danger)' };

/** Taeglicher Kurz-Check (4 Fragen, 1-5) mit Trainingsempfehlung. */
export const WellnessCard = () => {
    const { data, saveWellness } = useData();
    const today = (data.wellness || {})[dateKey(new Date())];
    const [editing, setEditing] = useState(false);
    const [vals, setVals] = useState({});

    const showForm = !today || editing;
    const complete = QUESTIONS.every(q => vals[q.key]);

    const save = () => {
        saveWellness({ ...vals });
        setEditing(false);
    };

    if (!showForm) {
        const score = wellnessScore(today);
        const advice = readinessAdvice(score);
        return (
            <div className="card" style={{ padding: 16, marginBottom: 16, borderLeft: `4px solid ${COLORS[advice.level]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <HeartPulse size={18} color={COLORS[advice.level]} /> {advice.title} <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>· {score} %</span>
                    </div>
                    <button onClick={() => { setVals({ ...today }); setEditing(true); }} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Ändern</button>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 6 }}>{advice.text}</div>
            </div>
        );
    }

    return (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <HeartPulse size={18} color="var(--primary)" /> Wie geht es dir heute?
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 14 }}>
                1 = schlecht, 5 = sehr gut. Ich passe daraufhin die Empfehlung fürs Training an.
            </div>
            {QUESTIONS.map(q => (
                <div key={q.key} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600 }}>{q.label}</span>
                        <span style={{ color: 'var(--text-tertiary)' }}>{q.low} → {q.high}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                        {[1, 2, 3, 4, 5].map(n => (
                            <button
                                key={n}
                                onClick={() => setVals(v => ({ ...v, [q.key]: n }))}
                                aria-label={`${q.label} ${n}`}
                                style={{ padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, background: vals[q.key] === n ? 'var(--primary)' : 'var(--bg-card-highlight)', color: vals[q.key] === n ? '#fff' : 'var(--text-main)' }}
                            >{n}</button>
                        ))}
                    </div>
                </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-primary" style={{ flex: 1 }} disabled={!complete} onClick={save}>Speichern</button>
                {editing && <button className="btn-secondary" onClick={() => setEditing(false)}>Abbrechen</button>}
            </div>
        </div>
    );
};
