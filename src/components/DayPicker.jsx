import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { X, Check, RotateCcw } from 'lucide-react';
import { useData } from '../hooks/useData';
import { dayLabel } from '../data/plans';
import { dateKey } from '../lib/progression';

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

/**
 * Auswahl, welches Training an einem bestimmten Datum stattfindet.
 * Aendert nur diesen Tag (scheduleOverrides), nicht den Plan.
 */
export const DayPicker = ({ date, onClose }) => {
    const { getPlan, getWorkoutForDate, setDayForDate, data } = useData();
    const plan = getPlan();
    if (!plan) return null;

    const current = getWorkoutForDate(date);
    const hasOverride = Boolean((data.scheduleOverrides || {})[dateKey(date)]);
    const planned = plan.days.length === 7 ? plan.days[(date.getDay() + 6) % 7] : null;

    const choose = (day) => {
        // Entspricht die Wahl dem Plan, den Override entfernen
        setDayForDate(date, planned && planned.id === day.id ? null : day.id);
        onClose();
    };

    return (
        <div
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        >
            <motion.div
                initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: 'min(500px, 100%)', boxSizing: 'border-box', background: 'var(--bg-card)',
                    borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20,
                    paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))', maxHeight: '85vh', overflowY: 'auto'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <h3 style={{ margin: 0 }}>Training wählen</h3>
                    <button onClick={onClose} aria-label="Schließen" style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}>
                        <X size={22} />
                    </button>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
                    {format(date, 'EEEE, d. MMMM', { locale: de })}. Nur dieser Tag ändert sich, dein Plan bleibt gleich.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {plan.days.map((day, i) => {
                        const active = current?.id === day.id;
                        return (
                            <button
                                key={day.id}
                                onClick={() => choose(day)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, textAlign: 'left',
                                    padding: '12px 14px', borderRadius: 12, cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600,
                                    background: active ? 'rgba(10,132,255,0.15)' : 'var(--bg-card-highlight)',
                                    border: active ? '1px solid var(--primary)' : '1px solid var(--border)', color: 'var(--text-main)'
                                }}
                            >
                                <span>
                                    <span style={{ color: 'var(--text-tertiary)', marginRight: 10, fontWeight: 700 }}>{plan.days.length === 7 ? WEEKDAYS[i] : i + 1}</span>
                                    {dayLabel(day.name)}
                                </span>
                                {active && <Check size={18} color="var(--primary)" />}
                            </button>
                        );
                    })}
                </div>

                {hasOverride && (
                    <button
                        onClick={() => { setDayForDate(date, null); onClose(); }}
                        className="btn-secondary"
                        style={{ width: '100%', marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                        <RotateCcw size={16} /> Zurück auf den Plan
                    </button>
                )}
            </motion.div>
        </div>
    );
};
