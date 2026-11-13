import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { BarChart, Bar, Cell, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Minus, Plus, RotateCcw, Info } from 'lucide-react';
import { useData } from '../hooks/useData';
import {
    weeklySummaries, targetsForMetric, acuteChronic, cycleInfo, wellnessAverage
} from '../lib/progression';

const nf = (n) => Math.round(n).toLocaleString('de-AT');

const Row = ({ label, value, target, unit }) => {
    const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
    return (
        <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                <span style={{ fontWeight: 600 }}>{label}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{nf(value)} / {target ? nf(target) : '–'} {unit}</span>
            </div>
            <div style={{ height: 8, background: 'var(--bg-card-highlight)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? 'var(--accent)' : 'var(--primary)', borderRadius: 4, transition: 'width 0.3s' }} />
            </div>
        </div>
    );
};

const Stat = ({ label, value }) => (
    <div style={{ background: 'var(--bg-card-highlight)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{value}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{label}</div>
    </div>
);

/** Wochenbelastung (Session-RPE), Zyklus, Wochenziele und Progressionseinstellungen. */
export const TrainingLoad = () => {
    const { data, updateSettings, restartCycle } = useData();
    const [showInfo, setShowInfo] = useState(false);

    const now = useMemo(() => new Date(), []);
    const cycleStart = data.cycleStart || data.startDate;
    const basePct = data.settings?.weeklyProgression ?? 12;

    const calc = useMemo(() => {
        const weeks = weeklySummaries(data.logs || [], now, 8);
        const wAvg = wellnessAverage(data.wellness, now);
        const args = { weeks, now, cycleStart, basePct, wellnessAvgPct: wAvg };
        return {
            weeks,
            info: cycleInfo(now, cycleStart),
            au: targetsForMetric({ ...args, metric: 'loadAU' }),
            vol: targetsForMetric({ ...args, metric: 'volume' }),
            acwr: acuteChronic(weeks, 'loadAU'),
            wAvg
        };
    }, [data.logs, data.wellness, cycleStart, basePct, now]);

    const cur = calc.weeks[calc.weeks.length - 1];
    const hasRated = calc.weeks.some(w => w.loadAU > 0);
    const hasAnyLog = calc.weeks.some(w => w.sessions > 0);
    const main = calc.au.current ? calc.au : calc.vol;
    const mainMetric = calc.au.current ? 'loadAU' : 'volume';

    const chart = calc.weeks.map(w => ({
        name: format(w.start, 'd.M.'),
        wert: hasRated ? w.loadAU : w.volume,
        deload: cycleInfo(w.start, cycleStart).isDeload
    }));

    return (
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Activity color="var(--primary)" /> Belastung</h3>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: 12, background: calc.info.isDeload ? 'rgba(48,209,88,0.15)' : 'rgba(10,132,255,0.15)', color: calc.info.isDeload ? 'var(--accent)' : 'var(--primary)' }}>
                    Woche {calc.info.week}/{calc.info.length} · {calc.info.isDeload ? 'Deload' : 'Aufbau'}
                </div>
            </div>

            {!hasAnyLog ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                    Sobald du Trainings abschließt und deine Intensität (RPE) angibst, berechne ich hier deine Wochenziele.
                </p>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
                        <Stat label="Einheiten" value={cur.sessions} />
                        <Stat label="Ø RPE" value={cur.avgRpe ?? '–'} />
                        <Stat label="Belastung (AU)" value={cur.loadAU ? nf(cur.loadAU) : '–'} />
                        <Stat label="Dauer (min)" value={cur.durationMin || '–'} />
                    </div>

                    {main.current ? (
                        <>
                            <Row
                                label={mainMetric === 'loadAU' ? 'Ziel diese Woche (RPE × Minuten)' : 'Ziel diese Woche (Volumen)'}
                                value={cur[mainMetric]} target={main.current} unit={mainMetric === 'loadAU' ? 'AU' : 'kg'}
                            />
                            {mainMetric === 'loadAU' && calc.vol.current > 0 && (
                                <Row label="Volumen (kg × Wdh.)" value={cur.volume} target={calc.vol.current} unit="kg" />
                            )}
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>{main.reason}</div>
                            {main.next > 0 && (
                                <div style={{ fontSize: '0.85rem', marginTop: 8 }}>
                                    <b>Nächste Woche:</b> Ziel ca. {nf(main.next)} {mainMetric === 'loadAU' ? 'AU' : 'kg'}
                                    {cycleInfo(new Date(now.getTime() + 7 * 86400000), cycleStart).isDeload ? ' (Deload-Woche)' : ''}
                                </div>
                            )}
                        </>
                    ) : (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 8px 0' }}>
                            Für Wochenziele brauche ich mindestens eine abgeschlossene Trainingswoche. Gib nach dem Training deine Intensität an, dann klappt es auch mit der Belastung in AU.
                        </p>
                    )}

                    {calc.acwr && (calc.acwr.caution || calc.acwr.high) && (
                        <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', background: 'rgba(255,159,10,0.12)', color: '#ff9f0a' }}>
                            Diese Woche liegt {Math.round((calc.acwr.ratio - 1) * 100)} % über deinem Schnitt der letzten Wochen. {calc.acwr.high ? 'Das ist ein sehr starker Sprung – Pausentage einplanen.' : 'Achte auf ausreichend Erholung.'}
                        </div>
                    )}

                    <div style={{ height: 150, marginTop: 16 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>
                            {hasRated ? 'Belastung pro Woche (AU)' : 'Volumen pro Woche (kg)'}
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chart} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8e8e93' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#1c1c1e', border: '1px solid #38383a', borderRadius: 8 }} formatter={(v) => [nf(v), hasRated ? 'AU' : 'kg']} labelFormatter={(l) => `Woche ab ${l}`} />
                                <Bar dataKey="wert" radius={[4, 4, 0, 0]}>
                                    {chart.map((c, i) => <Cell key={i} fill={c.deload ? '#30d158' : '#0a84ff'} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}

            <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Steigerung pro Woche</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Obergrenze, wird anhand deiner RPE angepasst</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button aria-label="Weniger" onClick={() => updateSettings({ weeklyProgression: Math.max(5, basePct - 1) })} style={stepBtn}><Minus size={16} /></button>
                        <div style={{ minWidth: 48, textAlign: 'center', fontWeight: 800 }}>{basePct} %</div>
                        <button aria-label="Mehr" onClick={() => updateSettings({ weeklyProgression: Math.min(20, basePct + 1) })} style={stepBtn}><Plus size={16} /></button>
                    </div>
                </div>
                <button
                    className="btn-secondary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}
                    onClick={() => { if (window.confirm('Zyklus ab dieser Woche neu starten? Diese Woche ist dann Woche 1 (Aufbau).')) restartCycle(); }}
                >
                    <RotateCcw size={16} /> Zyklus neu starten
                </button>
                <button onClick={() => setShowInfo(!showInfo)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', padding: 0 }}>
                    <Info size={14} /> So wird gerechnet
                </button>
                {showInfo && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
                        <p style={{ margin: '0 0 6px 0' }}><b>Belastung (AU)</b> = RPE × Trainingsminuten (Session-RPE nach Foster, 2001).</p>
                        <p style={{ margin: '0 0 6px 0' }}><b>Zyklus:</b> 3 Aufbauwochen mit begrenzter Steigerung, dann eine Deload-Woche mit ca. 40 % weniger Belastung. Danach geht es auf dem Niveau vor dem Deload weiter.</p>
                        <p style={{ margin: '0 0 6px 0' }}><b>Anpassung:</b> War die letzte Woche im Schnitt RPE ≥ 9, steigerst du höchstens 5 %. Bei RPE ≤ 6 darfst du mehr (bis max. 20 %). Ist dein Wohlbefinden niedrig, bleibt die Belastung gleich.</p>
                        <p style={{ margin: 0 }}><b>Warnhinweis:</b> Liegt die Woche über 130 % deines Schnitts der Vorwochen, bekommst du einen Hinweis (Akut:Chronisch-Verhältnis). Das ist eine Orientierung, keine Garantie.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const stepBtn = { background: 'var(--bg-card-highlight)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
