
import { useData } from '../hooks/useData';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isRestDayName, dayLabel } from '../data/plans';
import { muscleLabel } from '../data/exercises';
import { Settings, Play, Dumbbell, Calendar, ChevronRight, ChevronDown, Check } from 'lucide-react';

export const Dashboard = ({ onStartWorkout, onOpenSettings }) => {
    const { getCurrentDay, hasCompletedWorkoutToday, getNextTrainingDay, data, getPlan, getAllExercises } = useData();
    const currentDay = getCurrentDay();
    const [openMuscle, setOpenMuscle] = useState(null);
    const isCompleted = hasCompletedWorkoutToday();
    const nextDay = getNextTrainingDay();
    const plan = getPlan();

    if (!plan) return null;

    const isRestDay = isRestDayName(currentDay?.name);

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ padding: '24px', paddingTop: '40px' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Aktiver Trainingsplan</div>
                    <h1 className="title-lg" style={{ margin: '2px 0 0 0', fontSize: '1.4rem' }}>{plan.name}</h1>
                </div>
                <button 
                    onClick={onOpenSettings} 
                    style={{ background: 'var(--bg-card-highlight)', border: '1px solid var(--border)', color: 'var(--primary)', borderRadius: '12px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                >
                    <Settings size={18} />
                    <span>Plan ändern</span>
                </button>
            </div>

            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
                {isCompleted ? (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 700 }}>
                            <Check size={16} /> TRAINING ABGESCHLOSSEN!
                        </div>
                        <h2 style={{ fontSize: '1.8rem', margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>{dayLabel(currentDay?.name)}</h2>
                        <div style={{ height: '1px', background: 'var(--border)', margin: '20px 0' }} />
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>ALS NÄCHSTES</div>
                        <h3 style={{ fontSize: '1.2rem', margin: '0 0 10px 0' }}>{dayLabel(nextDay?.name)}</h3>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: 0 }}>Stark! Bleib dran.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
                            <Calendar size={16} /> HEUTIGES TRAINING
                        </div>
                        <h2 style={{ fontSize: '1.8rem', margin: '0 0 24px 0', letterSpacing: '-0.5px' }}>{dayLabel(currentDay?.name)}</h2>

                        {isRestDay ? (
                            <div>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>Ruhetage sind wichtig – heute regenerieren.</p>
                            </div>
                        ) : (
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                className="btn-primary"
                                style={{ width: '100%' }}
                                onClick={onStartWorkout}
                            >
                                <Play size={20} fill="white" /> Training starten
                            </motion.button>
                        )}
                    </>
                )}
            </div>

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 className="subtitle">Persönliche Rekorde</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                    {/* Empty block to be removed, replaced with Accordion below */}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(() => {
                        const allExercises = getAllExercises();
                        const prsByMuscle = {};
                        Object.entries(data.prs).forEach(([id, weight]) => {
                            const ex = allExercises.find(e => e.id === id);
                            const muscle = ex ? ex.muscle : 'Other';
                            if (!prsByMuscle[muscle]) prsByMuscle[muscle] = [];
                            prsByMuscle[muscle].push({ id, weight, name: ex ? ex.name : id.replace(/_/g, ' ') });
                        });

                        return Object.entries(prsByMuscle).map(([muscle, prs]) => {
                            const isOpen = openMuscle === muscle;
                            return (
                                <div key={muscle} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                                    <button 
                                        onClick={() => setOpenMuscle(isOpen ? null : muscle)}
                                        style={{ width: '100%', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Dumbbell size={18} color="var(--primary)" />
                                            {muscleLabel(muscle)} <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>({prs.length})</span>
                                        </div>
                                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                                            <ChevronDown size={20} color="var(--text-secondary)" />
                                        </motion.div>
                                    </button>
                                    
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }} 
                                                animate={{ height: 'auto', opacity: 1 }} 
                                                exit={{ height: 0, opacity: 0 }}
                                                style={{ overflow: 'hidden' }}
                                            >
                                                <div style={{ padding: '0 16px 16px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                                                    {prs.map(({ id, weight, name }, i) => (
                                                        <div key={id} style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {name}
                                                            </div>
                                                            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                                                                {weight}<span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginLeft: '2px' }}>kg</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        });
                    })()}
                </div>
                {Object.keys(data.prs).length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                        Noch keine Daten.
                    </div>
                )}
            </div>
        </motion.div>
    );
};
