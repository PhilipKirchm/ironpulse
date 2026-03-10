
import { useData } from '../hooks/useData';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';

export const HistoryView = ({ onEditWorkout }) => {
    const { data, getPlan } = useData();
    const sortedLogs = [...data.logs].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Simple grouping by month could be nice, but let's stick to a clean list first

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ padding: '24px', paddingBottom: '100px' }}
        >
            <h1 className="title-lg" style={{ paddingTop: '40px' }}>History</h1>

            <div style={{ display: 'grid', gap: '16px', marginTop: '24px' }}>
                {sortedLogs.map((log, i) => {
                    const plan = data.currentPlanId === log.planId ? getPlan() : null; // Logic is loose if plan changes, but fine for now
                    const date = parseISO(log.date);
                    // Use plan data to get day name if possible, or just fallback
                    // A real app would store the day name in the log to avoid this dependency
                    const dayId = log.dayId;

                    return (
                        <motion.div
                            key={i}
                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
                            className="card"
                            style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}
                        >
                            <div style={{ background: 'var(--bg-card-highlight)', padding: '12px', borderRadius: '12px', textAlign: 'center', minWidth: '50px' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{format(date, 'MMM')}</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{format(date, 'd')}</div>
                            </div>

                            <div>
                                <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>
                                    {dayId.replace(/_/g, ' ').toUpperCase()}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {log.exercises.length} Exercises Completed
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', alignItems: 'center' }}>
                                <button onClick={() => onEditWorkout(log)} style={{ background: 'transparent', color: 'var(--primary)', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', padding: '4px 8px' }}>
                                    Edit
                                </button>
                                <div style={{ color: 'var(--accent)' }}>
                                    <CheckCircle2 />
                                </div>
                            </div>
                        </motion.div>
                    )
                })}

                {sortedLogs.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        <CalendarIcon size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <p>No workouts logged yet. Go make history!</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
