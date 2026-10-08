import { useData } from '../hooks/useData';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { de } from 'date-fns/locale';
import { isRestDayName } from '../data/plans';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';

export const CalendarView = ({ onEditWorkout }) => {
    const { getWorkoutForDate, isDeloadWeek, data, getAllExercises } = useData();
    const allExercises = getAllExercises();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [direction, setDirection] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const nextMonth = () => {
        setDirection(1);
        setCurrentMonth(addMonths(currentMonth, 1));
    };
    const prevMonth = () => {
        setDirection(-1);
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const isDeload = isDeloadWeek(currentMonth);

    const selectedLog = data.logs?.find(log => isSameDay(parseISO(log.date), selectedDate));

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingTop: '10px' }}>
                <div>
                    <h1 className="title-lg" style={{ margin: 0, fontSize: '1.6rem' }}>{format(currentMonth, 'MMMM', { locale: de })}</h1>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', fontWeight: 500 }}>{format(currentMonth, 'yyyy')}</div>
                </div>
                <div style={{ display: 'flex', gap: '10px', background: 'var(--bg-card)', padding: '4px', borderRadius: '30px', border: '1px solid var(--border)' }}>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={prevMonth}
                        style={{ background: 'var(--bg-card-highlight)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', display: 'flex', cursor: 'pointer' }}
                    >
                        <ChevronLeft size={18} />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={nextMonth}
                        style={{ background: 'var(--bg-card-highlight)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', display: 'flex', cursor: 'pointer' }}
                    >
                        <ChevronRight size={18} />
                    </motion.button>
                </div>
            </div>

            {isDeload && (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                        background: 'linear-gradient(90deg, rgba(48, 209, 88, 0.1), rgba(48, 209, 88, 0.05))',
                        color: 'var(--accent)',
                        padding: '12px',
                        borderRadius: '12px',
                        marginBottom: '16px',
                        textAlign: 'center',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        border: '1px solid rgba(48, 209, 88, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
                    DELOAD-WOCHE
                </motion.div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '12px' }}>
                {['M', 'D', 'M', 'D', 'F', 'S', 'S'].map((day, i) => (
                    <div key={i} style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.7rem', fontWeight: 700, opacity: 0.5 }}>
                        {day}
                    </div>
                ))}
            </div>

            <motion.div
                key={currentMonth.toISOString()}
                initial={{ x: direction * 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}
            >
                {calendarDays.map((day) => {
                    const workout = getWorkoutForDate(day);
                    const isToday = isSameDay(day, new Date());
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isRest = isRestDayName(workout?.name);
                    const hasLog = data.logs?.some(log => isSameDay(parseISO(log.date), day));

                    return (
                        <motion.div
                            key={day.toISOString()}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedDate(day)}
                            style={{
                                position: 'relative',
                                background: isSelected ? 'var(--primary)' : 'var(--bg-card)',
                                border: isToday ? '2px solid var(--primary)' : '1px solid var(--border)',
                                borderStyle: isToday ? 'solid' : 'solid',
                                borderRadius: '12px',
                                padding: '6px 2px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                opacity: isCurrentMonth ? 1 : 0.2,
                                color: isSelected ? '#000' : 'inherit',
                                zIndex: isSelected ? 2 : 1,
                                minHeight: '60px',
                                cursor: 'pointer'
                            }}
                        >
                            <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{format(day, 'd')}</span>
                            <div style={{
                                fontSize: '0.5rem',
                                fontWeight: 700,
                                textAlign: 'center',
                                width: '100%',
                                opacity: isRest ? 0.4 : 0.9
                            }}>
                                {isRest ? 'PAUSE' : workout?.name?.split(' ')[0]?.toUpperCase()}
                            </div>
                            <div style={{ fontSize: '0.75rem', filter: isSelected ? 'invert(1)' : 'none', position: 'relative' }}>
                                {hasLog ? '✅' : (isRest ? '☕' : '🔥')}
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Details Section */}
            <div style={{ marginTop: '24px', flex: 1 }}>
                <h3 className="subtitle" style={{ marginBottom: '16px' }}>
                    {isSameDay(selectedDate, new Date()) ? 'Heute' : format(selectedDate, 'd. MMMM yyyy', { locale: de })}
                </h3>

                {selectedLog ? (
                    <div className="card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>
                                {selectedLog.dayId.replace(/_/g, ' ').toUpperCase()}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => onEditWorkout(selectedLog)} style={{ background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}>BEARBEITEN</button>
                                <div style={{ background: 'var(--accent)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800 }}>ERLEDIGT</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '12px' }}>
                            {selectedLog.exercises.map((ex, idx) => {
                                const exerciseInfo = allExercises.find(e => e.id === ex.id) ||
                                    { name: ex.id.replace(/_/g, ' ') };

                                return (
                                    <div key={idx} style={{ padding: '12px', background: 'var(--bg-card-highlight)', borderRadius: '12px' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>{exerciseInfo.name}</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {ex.sets.map((set, sIdx) => (
                                                <div key={sIdx} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-main)', padding: '4px 8px', borderRadius: '6px' }}>
                                                    {set.weight}kg × {set.reps}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', border: '1px dashed var(--border)', background: 'transparent' }}>
                        {isRestDayName(getWorkoutForDate(selectedDate)?.name) ? (
                            <p>Ruhetag. Kein Training eingetragen.</p>
                        ) : (
                            <p>An diesem Tag ist noch kein Training eingetragen.</p>
                        )}
                    </div>
                )}
            </div>

            <div className="card" style={{ marginTop: '20px', padding: '16px', border: '1px solid var(--border)', marginBottom: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                    <LegendItem icon="🔥" label="Geplant" />
                    <LegendItem icon="✅" label="Erledigt" />
                    <LegendItem icon="☕" label="Ruhetag" />
                    <LegendItem color="var(--primary)" label="Ausgewählt" />
                </div>
            </div>
        </motion.div>
    );
};

const LegendItem = ({ icon, label, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
        {icon ? <span>{icon}</span> : <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />}
        <span>{label}</span>
    </div>
);
