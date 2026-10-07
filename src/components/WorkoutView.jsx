
import { useState, useEffect, useMemo } from 'react';
import { ExerciseCard } from './ExerciseCard';
import { useData } from '../hooks/useData';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Edit2, Check, Search, X, Plus, Save, Moon } from 'lucide-react';
import { MUSCLE_GROUPS } from '../data/exercises';
import confetti from 'canvas-confetti';

export const WorkoutView = ({ planId, dayId, onFinish, onBack, editLog }) => {
    const { getExercisesForDay, customizeDay, saveWorkout, updateLog, data, addCustomExercise, getAllExercises, saveWorkoutDraft, clearWorkoutDraft, setMachineSelection, getMachineSelection, getLastLoggedSession } = useData();
    const [exercises, setExercises] = useState([]);
    const [setsData, setSetsData] = useState({});
    const [notes, setNotes] = useState({}); // Stores notes per exerciseId
    const [machineSelections, setMachineSelections] = useState({}); // Stores machine per exerciseId
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [swappingId, setSwappingId] = useState(null); // ID or 'NEW'
    const [searchQuery, setSearchQuery] = useState('');

    // Custom Create Mode
    const [isCreating, setIsCreating] = useState(false);
    const [newExerciseName, setNewExerciseName] = useState('');
    const [newExerciseMuscle, setNewExerciseMuscle] = useState('Chest');

    // Load exercises (including custom ones)
    const allExercises = getAllExercises();

    useEffect(() => {
        if (editLog) {
            const loaded = editLog.exercises.map(ex => {
                const found = allExercises.find(e => e.id === ex.id);
                return found || { id: ex.id, name: ex.id.replace(/_/g, ' '), muscle: 'Other', type: 'Custom', substitutes: [] };
            });
            setExercises(loaded);

            const initialSets = {};
            const initialNotes = {};
            const initialMachines = {};
            editLog.exercises.forEach(ex => {
                initialSets[ex.id] = ex.sets.map(s => ({ ...s, done: true }));
                if (ex.note) initialNotes[ex.id] = ex.note;
                if (ex.machine) initialMachines[ex.id] = ex.machine;
            });
            setSetsData(initialSets);
            setNotes(initialNotes);
            setMachineSelections(initialMachines);
        } else {
            const draft = data.workoutDrafts?.[dayId];
            if (draft) {
                setExercises(draft.exercises);
                setSetsData(draft.setsData);
                setNotes(draft.notes || {});
                setMachineSelections(draft.machineSelections || {});
            } else {
                const loaded = getExercisesForDay(planId, dayId);
                setExercises(loaded);
                setSetsData(prev => {
                    const next = { ...prev };
                    loaded.forEach(ex => {
                        if (!next[ex.id]) {
                            const lastSession = getLastLoggedSession(ex.id);
                            if (lastSession && lastSession.sets && lastSession.sets.length > 0) {
                                next[ex.id] = lastSession.sets.map(s => ({
                                    weight: String(s.weight),
                                    reps: String(s.reps),
                                    done: false
                                }));
                            } else {
                                next[ex.id] = [{ weight: '', reps: '', done: false }, { weight: '', reps: '', done: false }];
                            }
                        }
                    });
                    return next;
                });
                setNotes({});
                // Initialize machine selections from global data or last session
                const machines = {};
                loaded.forEach(ex => {
                    const lastSession = getLastLoggedSession(ex.id);
                    machines[ex.id] = lastSession?.machine || getMachineSelection(ex.id);
                });
                setMachineSelections(machines);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [planId, dayId, editLog]);

    // Auto-save draft
    useEffect(() => {
        if (!editLog && exercises.length > 0) {
            saveWorkoutDraft(dayId, { exercises, setsData, notes, machineSelections });
        }
    }, [exercises, setsData, notes, machineSelections, dayId, editLog]);

    const handleUpdateSets = (exId, newSets) => {
        setSetsData(prev => ({ ...prev, [exId]: newSets }));
    };

    const handleUpdateNote = (exId, note) => {
        setNotes(prev => ({ ...prev, [exId]: note }));
    };

    const handleMachineChange = (exId, manufacturer) => {
        setMachineSelections(prev => ({ ...prev, [exId]: manufacturer }));
        setMachineSelection(exId, manufacturer);
    };

    const handleFinish = () => {
        if (isSaving) return; // verhindert doppeltes Speichern
        setIsSaving(true);
        const payloadExercises = exercises.map(ex => ({
            id: ex.id,
            // Koerpergewichtsuebungen: leeres Gewicht wird als 0 kg gespeichert statt verworfen
            sets: (setsData[ex.id] || [])
                .filter(s => s.done && s.reps)
                .map(s => ({ ...s, weight: s.weight === '' || s.weight == null ? '0' : s.weight })),
            note: notes[ex.id] || '',
            machine: machineSelections[ex.id] || 'Free Weights'
        }));

        if (editLog) {
            const updatedLog = {
                ...editLog,
                exercises: payloadExercises
            };
            updateLog(editLog.date, updatedLog);
            
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#0a84ff', '#30d158', '#ffffff']
            });

            setTimeout(() => {
                onFinish();
            }, 1000);
            return;
        }

        const log = {
            date: new Date().toISOString(),
            planId,
            dayId,
            exercises: payloadExercises
        };
        saveWorkout(log);
        clearWorkoutDraft(dayId);

        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#0a84ff', '#30d158', '#ffffff']
        });

        // Delay returning to dashboard to show confetti
        setTimeout(() => {
            onFinish();
        }, 2500);
    };

    const handleRemove = (exId) => {
        const newIds = exercises.filter(e => e.id !== exId).map(e => e.id);
        if (!editLog) customizeDay(planId, dayId, newIds); // alte Eintraege aendern den Plan nicht
        setExercises(prev => prev.filter(e => e.id !== exId));
    };

    const handleSwap = (exId) => {
        setSwappingId(exId);
        setSearchQuery('');
        setIsCreating(false);
    };

    const handleAddExercise = () => {
        setSwappingId('NEW');
        setSearchQuery('');
        setIsCreating(false);
    }

    const handleCreateCustom = () => {
        if (!newExerciseName.trim()) return;
        const newEx = addCustomExercise(newExerciseName.trim(), newExerciseMuscle);

        // Objekt direkt uebergeben: allExercises kennt die neue Uebung erst nach dem naechsten Render
        commitSwapOrAdd(newEx);
        setIsCreating(false);
        setNewExerciseName('');
    }

    const commitSwapOrAdd = (target) => {
        // target: Uebungs-Objekt (oder ID aus der Suchliste)
        const newEx = typeof target === 'string' ? allExercises.find(e => e.id === target) : target;
        if (!newEx) return;
        const newId = newEx.id;
        if (swappingId === 'NEW') {
            // Add new
            if (exercises.find(e => e.id === newId)) { setSwappingId(null); return; } // Anti-Duplikat

            const newExercises = [...exercises, newEx];
            const newIds = newExercises.map(e => e.id);
            if (!editLog) customizeDay(planId, dayId, newIds);
            setExercises(newExercises);

            setSetsData(prev => ({
                ...prev,
                [newId]: [{ weight: '', reps: '', done: false }, { weight: '', reps: '', done: false }]
            }));

        } else {
            // Swap
            const idx = exercises.findIndex(e => e.id === swappingId);
            if (idx === -1) return;

            const newExercises = [...exercises];
            newExercises[idx] = newEx;

            const newIds = newExercises.map(e => e.id);
            if (!editLog) customizeDay(planId, dayId, newIds);
            setExercises(newExercises);

            setSetsData(prev => {
                const next = { ...prev };
                delete next[swappingId];
                next[newId] = [{ weight: '', reps: '', done: false }, { weight: '', reps: '', done: false }];
                return next;
            });
        }

        setSwappingId(null);
    }

    // Filter exercises for search
    const filteredExercises = useMemo(() => {
        if (!swappingId) return [];

        let results = allExercises;
        if (swappingId !== 'NEW') {
            results = results.filter(e => e.id !== swappingId);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            results = results.filter(e => e.name.toLowerCase().includes(q) || e.muscle.toLowerCase().includes(q));
        } else {
            if (swappingId !== 'NEW') {
                const currentEx = exercises.find(e => e.id === swappingId);
                if (currentEx) {
                    results = results.filter(e => e.muscle === currentEx.muscle);
                }
            }
        }
        return results;
    }, [swappingId, searchQuery, exercises, allExercises]);

    const currentSwapExercise = swappingId === 'NEW' ? null : exercises.find(e => e.id === swappingId);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="scroll-container"
            style={{ height: '100%', paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 20px))', padding: '20px', boxSizing: 'border-box' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', marginTop: '10px' }}>
                <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '1rem', fontWeight: 500 }}>
                    <ChevronLeft size={20} /> Back
                </button>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Active Workout</h2>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    style={{ background: isEditing ? 'var(--primary)' : 'rgba(255,255,255,0.1)', color: isEditing ? 'white' : 'var(--text-main)', border: 'none', padding: '8px 12px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                    {isEditing ? <Check size={16} /> : <Edit2 size={16} />}
                    {isEditing ? 'Done' : 'Edit'}
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {exercises.map((ex, i) => (
                    <ExerciseCard
                        key={`${ex.id}-${i}`}
                        exercise={ex}
                        sets={setsData[ex.id]}
                        onUpdateSets={handleUpdateSets}
                        note={notes[ex.id] || ''}
                        onUpdateNote={(val) => handleUpdateNote(ex.id, val)}
                        isEditing={isEditing}
                        onRemove={() => handleRemove(ex.id)}
                        onSwap={() => handleSwap(ex.id)}
                        pr={data.prs[ex.id]}
                        lastSession={getLastLoggedSession(ex.id)}
                        machineSelection={machineSelections[ex.id]}
                        onMachineChange={(mfg) => handleMachineChange(ex.id, mfg)}
                    />
                ))}
                {exercises.length === 0 && (
                    <div className="card" style={{ padding: '32px 20px', textAlign: 'center', margin: '10px 0' }}>
                        <Moon size={36} color="var(--primary)" style={{ marginBottom: 12 }} />
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>Ruhetag oder keine Übungen</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                            Für diesen Tag sind noch keine Übungen eingetragen. Du kannst unten neue Übungen hinzufügen.
                        </p>
                    </div>
                )}
            </div>

            {/* Add Exercise Button */}
            <button
                onClick={handleAddExercise}
                className="card"
                style={{ width: '100%', marginTop: '16px', padding: '16px', border: '2px dashed var(--border)', background: 'transparent', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
            >
                <Plus /> Add Exercise
            </button>

            {!isEditing && (
                <div style={{ padding: '40px 0 20px 0', display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        className="btn-primary"
                        style={{ width: '100%', maxWidth: '500px' }}
                        onClick={handleFinish}
                        disabled={isSaving}
                    >
                        {editLog ? 'Save Edit' : 'Finish Workout'}
                    </motion.button>
                </div>
            )}

            {/* Universal Search Modal (Add/Swap) */}
            <AnimatePresence>
                {swappingId && (
                    <motion.div
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--bg-main)', zIndex: 100, display: 'flex', flexDirection: 'column' }}
                    >
                        <div style={{ padding: '20px', paddingTop: 'max(20px, env(safe-area-inset-top))', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                                <input
                                    autoFocus
                                    className="input-field"
                                    style={{ paddingLeft: '40px' }}
                                    placeholder={isCreating ? "New Exercise Name" : "Search exercises..."}
                                    value={isCreating ? newExerciseName : searchQuery}
                                    onChange={(e) => isCreating ? setNewExerciseName(e.target.value) : setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button onClick={() => setSwappingId(null)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        </div>

                        {isCreating ? (
                            <div style={{ padding: '20px' }}>
                                <div style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Muscle Group</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                                    {MUSCLE_GROUPS.map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setNewExerciseMuscle(m)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '20px',
                                                border: 'none',
                                                background: newExerciseMuscle === m ? 'var(--primary)' : 'var(--bg-card-highlight)',
                                                color: 'white',
                                                fontWeight: 500
                                            }}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    className="btn-primary"
                                    style={{ width: '100%' }}
                                    onClick={handleCreateCustom}
                                >
                                    <Save size={18} /> Save & Add
                                </button>
                            </div>
                        ) : (
                            <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px 20px', paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 20px))' }}>
                                {searchQuery && (
                                    <button
                                        onClick={() => { setIsCreating(true); setNewExerciseName(searchQuery); }}
                                        className="card"
                                        style={{ width: '100%', padding: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(10, 132, 255, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        <Plus size={20} /> Create "{searchQuery}"
                                    </button>
                                )}

                                <div style={{ padding: '16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                    {searchQuery ? 'SEARCH RESULTS' : (currentSwapExercise ? `SUGGESTED (${currentSwapExercise?.muscle.toUpperCase()})` : 'ALL EXERCISES')}
                                </div>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    {filteredExercises.map(ex => (
                                        <button
                                            key={ex.id}
                                            className="card"
                                            style={{ width: '100%', textAlign: 'left', padding: '16px', color: 'var(--text-main)', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                            onClick={() => commitSwapOrAdd(ex.id)}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{ex.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{ex.muscle} • {ex.type}</div>
                                            </div>
                                            {swappingId !== 'NEW' ?
                                                <ChevronLeft size={16} style={{ transform: 'rotate(180deg)', color: 'var(--text-tertiary)' }} /> :
                                                <Plus size={20} color="var(--primary)" />
                                            }
                                        </button>
                                    ))}
                                    {filteredExercises.length === 0 && !searchQuery && (
                                        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '20px' }}>No exercises found.</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
