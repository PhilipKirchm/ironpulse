
import { useData } from '../hooks/useData';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Target, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export const StatsView = () => {
    const { data, setGoal, getAllExercises } = useData();
    const [selectedExercise, setSelectedExercise] = useState('bench_press');
    const [isEditingGoals, setIsEditingGoals] = useState(false);
    const [tempGoals, setTempGoals] = useState({ current: '', target: '' });

    // Init temp goals on load (or when data changes)
    useEffect(() => {
        setTempGoals({
            current: data.goals.currentBodyweight || '',
            target: data.goals.targetBodyweight || ''
        });
    }, [data.goals]);

    const handleSaveGoals = () => {
        setGoal('currentBodyweight', tempGoals.current);
        setGoal('targetBodyweight', tempGoals.target);
        setIsEditingGoals(false);
    };

    // Prepare chart data for selected exercise
    const chartData = (data.logs || [])
        .map(log => {
            if (!log.exercises) return null;
            const exLog = log.exercises.find(e => e.id === selectedExercise);
            if (!exLog || !exLog.sets) return null;
            
            let best1RM = 0;
            let bestWeight = 0;
            let bestReps = 0;

            exLog.sets.forEach(s => {
                const w = parseFloat(s.weight) || 0;
                const r = parseFloat(s.reps) || 0;
                if (w > 0 && r > 0) {
                    // Epley Formula for 1RM estimate
                    const oneRM = w * (1 + r / 30);
                    if (oneRM > best1RM) {
                        best1RM = oneRM;
                        bestWeight = w;
                        bestReps = r;
                    }
                } else if (w > 0 && r === 0) {
                    if (w > best1RM) {
                        best1RM = w;
                        bestWeight = w;
                        bestReps = 1;
                    }
                }
            });

            if (best1RM === 0) return null;

            return {
                date: new Date(log.date).toLocaleDateString('de-AT'),
                weight: Math.round(best1RM),
                actualWeight: bestWeight,
                actualReps: bestReps,
                timestamp: new Date(log.date).getTime()
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.timestamp - b.timestamp);

    // Get list of exercises user has actually done for the dropdown
    const availableExercisesIds = Object.keys(data.prs || {});

    // Map IDs to exercises to get names
    const allExercisesList = getAllExercises();

    // Effect to set first available exercise as default if bench isn't available
    useEffect(() => {
        if (availableExercisesIds.length > 0 && !availableExercisesIds.includes(selectedExercise)) {
            setSelectedExercise(availableExercisesIds[0]);
        }
    }, [availableExercisesIds, selectedExercise]);

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ padding: '24px', paddingBottom: '100px' }}
        >
            <h1 className="title-lg" style={{ paddingTop: '40px' }}>Fortschritt</h1>

            {/* Goals Section */}
            <div className="card" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, var(--bg-card) 0%, #2c2c2e 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Target color="var(--accent)" /> Ziele
                    </h3>
                    <button
                        onClick={() => isEditingGoals ? handleSaveGoals() : setIsEditingGoals(true)}
                        style={{ background: isEditingGoals ? 'var(--primary)' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                    >
                        {isEditingGoals ? 'Speichern' : 'Bearbeiten'}
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Körpergewicht</div>
                        {isEditingGoals ? (
                            <input
                                className="input-field"
                                type="number"
                                placeholder="kg"
                                value={tempGoals.current}
                                onChange={e => setTempGoals(prev => ({ ...prev, current: e.target.value }))}
                                style={{ width: '80px', padding: '6px' }}
                                autoFocus
                            />
                        ) : (
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                {data.goals.currentBodyweight || '--'} <span style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>kg</span>
                            </div>
                        )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Zielgewicht</div>
                        {isEditingGoals ? (
                            <input
                                className="input-field"
                                type="number"
                                placeholder="kg"
                                value={tempGoals.target}
                                onChange={e => setTempGoals(prev => ({ ...prev, target: e.target.value }))}
                                style={{ width: '80px', padding: '6px', textAlign: 'right' }}
                            />
                        ) : (
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                                {data.goals.targetBodyweight || '--'} <span style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>kg</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp color="var(--primary)" /> Kraft
                    </h3>
                    <select
                        value={selectedExercise}
                        onChange={e => setSelectedExercise(e.target.value)}
                        className="input-field"
                        style={{ width: 'auto', maxWidth: '150px', padding: '8px', fontSize: '0.9rem', textOverflow: 'ellipsis' }}
                    >
                        {availableExercisesIds.map(id => {
                            const found = allExercisesList.find(e => e.id === id);
                            return (
                                <option key={id} value={id}>{found ? found.name : id.replace(/_/g, ' ')}</option>
                            );
                        })}
                        {availableExercisesIds.length === 0 && <option>Keine Daten</option>}
                    </select>
                </div>

                <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <XAxis dataKey="date" stroke="var(--text-tertiary)" tick={{ fontSize: 10 }} />
                                <YAxis stroke="var(--text-tertiary)" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.4)', border: '1px solid var(--border)' }}>
                                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>{label}</div>
                                                    <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>{data.weight} kg <span style={{fontSize: '0.7rem', color: 'var(--text-tertiary)'}}>(geschätztes 1RM)</span></div>
                                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Bester Satz: {data.actualWeight}kg × {data.actualReps}</div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Line type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={4} activeDot={{ r: 6, fill: 'var(--primary)', stroke: 'white' }} dot={{ r: 4, fill: 'var(--bg-card)', stroke: 'var(--primary)', strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', gap: '12px' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                                <TrendingUp size={20} />
                            </div>
                            <span style={{ fontSize: '0.9rem', textAlign: 'center' }}>
                                Noch keine Trainingsdaten.<br />
                                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Trage ein Workout ein, um deinen Fortschritt zu sehen!</span>
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
