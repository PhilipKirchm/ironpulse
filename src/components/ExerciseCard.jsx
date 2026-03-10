
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Repeat, Trash2, Trophy, MoreHorizontal, Plus, X } from 'lucide-react';
import { useState } from 'react';

export const ExerciseCard = ({ exercise, onUpdateSets, sets = [], isEditing, onSwap, onRemove, pr, note, onUpdateNote }) => {
    const addSet = () => {
        onUpdateSets(exercise.id, [...sets, { weight: '', reps: '', done: false }]);
    };

    const updateSet = (index, field, value) => {
        const newSets = [...sets];
        newSets[index][field] = value;
        onUpdateSets(exercise.id, newSets);
    };

    const toggleSet = (index) => {
        const newSets = [...sets];
        newSets[index].done = !newSets[index].done;
        onUpdateSets(exercise.id, newSets);
    }

    const removeSet = (index) => {
        const newSets = sets.filter((_, i) => i !== index);
        onUpdateSets(exercise.id, newSets);
    }

    return (
        <motion.div
            layout
            className="card"
            style={{ padding: '20px', marginBottom: '16px', position: 'relative' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{exercise.name}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{exercise.muscle}</span>
                </div>
                {pr > 0 && propsHaveValues(sets) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 215, 0, 0.1)', color: '#FFD700', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', fontWeight: '600' }}>
                        <Trophy size={12} /> {pr}kg
                    </div>
                )}
            </div>

            {isEditing ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={onSwap}>
                        <Repeat size={16} /> Replace
                    </button>
                    <button className="btn-secondary" style={{ flex: 1, background: 'rgba(255, 69, 58, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={onRemove}>
                        <Trash2 size={16} /> Remove
                    </button>
                </div>
            ) : (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '30px 1fr 1fr 40px 30px', gap: '8px', marginBottom: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                        <span style={{ textAlign: 'center' }}>#</span>
                        <span>kg</span>
                        <span>Reps</span>
                        <span style={{ textAlign: 'center' }}></span>
                        <span></span>
                    </div>
                    <AnimatePresence initial={false}>
                        {sets.map((set, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                style={{ display: 'grid', gridTemplateColumns: '30px 1fr 1fr 40px 30px', gap: '8px', marginBottom: '8px', alignItems: 'center', overflow: 'hidden' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontWeight: '600' }}>
                                    {i + 1}
                                </div>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="-"
                                    value={set.weight}
                                    onChange={(e) => updateSet(i, 'weight', e.target.value)}
                                    style={{ padding: '8px', textAlign: 'center', background: set.done ? 'rgba(48, 209, 88, 0.1)' : 'var(--bg-card-highlight)' }}
                                />
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="-"
                                    value={set.reps}
                                    onChange={(e) => updateSet(i, 'reps', e.target.value)}
                                    style={{ padding: '8px', textAlign: 'center', background: set.done ? 'rgba(48, 209, 88, 0.1)' : 'var(--bg-card-highlight)' }}
                                />
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => toggleSet(i)}
                                    style={{
                                        background: set.done ? 'var(--accent)' : 'var(--bg-card-highlight)',
                                        borderRadius: '8px',
                                        border: 'none',
                                        color: set.done ? '#000' : 'var(--text-tertiary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer',
                                        height: '36px'
                                    }}
                                >
                                    <Check size={18} />
                                </motion.button>

                                <button
                                    onClick={() => removeSet(i)}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                                    aria-label="Remove set"
                                >
                                    <X size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    <button
                        onClick={addSet}
                        style={{ width: '100%', padding: '10px', background: 'transparent', color: 'var(--primary)', fontWeight: '600', border: 'none', cursor: 'pointer', marginTop: '4px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                        <Plus size={16} /> Add Set
                    </button>

                    <div style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                        <textarea
                            placeholder="Add notes..."
                            value={note || ''}
                            onChange={(e) => onUpdateNote && onUpdateNote(e.target.value)}
                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', resize: 'none', outline: 'none', fontFamily: 'inherit' }}
                        />
                    </div>
                </div>
            )}
        </motion.div>
    );
};

// Helper
const propsHaveValues = (sets) => {
    return sets.some(s => s.weight && s.weight > 0);
}
