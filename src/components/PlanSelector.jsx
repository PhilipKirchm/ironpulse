import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Edit2, Copy, Trash2, Plus, Search, X, Dumbbell, ArrowLeft, Zap, Moon } from 'lucide-react';
import { useData } from '../hooks/useData';
import { MUSCLE_GROUPS } from '../data/exercises';
import { getSuggestedExercisesForDayName } from '../data/plans';

const WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

const DEFAULT_7_DAYS = () => WEEKDAYS.map((name, i) => ({
  id: `day_${Date.now()}_${i}`,
  name: i < 3 ? ['Push', 'Pull', 'Legs'][i] : 'Rest',
  weekday: name,
  exercises: i < 3 ? [
    ['bench_press', 'ohp', 'tricep_pushdown'],
    ['pull_up', 'barbell_row', 'bicep_curl'],
    ['squat', 'rdl', 'leg_extension'],
  ][i] : []
}));

/** Normalize any plan's days array into exactly 7 weekday-based entries */
function normalizeTo7Days(days) {
  if (!days || days.length === 0) return DEFAULT_7_DAYS();

  // If plan already has exactly 7 days with weekday property, use as-is
  if (days.length === 7 && days[0].weekday) return JSON.parse(JSON.stringify(days));

  // Map existing days onto 7 weekday slots best effort
  return WEEKDAYS.map((weekday, i) => {
    const existing = days[i];
    if (existing) {
      return {
        ...JSON.parse(JSON.stringify(existing)),
        weekday,
        // preserve name; if it was a generic "Tag X" rename to weekday placeholder
      };
    }
    return { id: `day_${Date.now()}_${i}`, name: 'Rest', weekday, exercises: [] };
  });
}

const isRestDay = (day) => {
  const n = (day.name || '').toLowerCase().trim();
  return n === 'rest' || n === 'ruhetag' || n === 'pause' || n === '';
};

export const PlanSelector = ({ onSelect }) => {
  const { getAllPlans, addCustomPlan, updateCustomPlan, duplicatePlan, deleteCustomPlan, getAllExercises } = useData();

  const plans = getAllPlans();
  const allExercises = getAllExercises();

  const [editingPlanId, setEditingPlanId] = useState(null);
  const [planForm, setPlanForm] = useState({ name: '', description: '', days: [] });

  const [activeDayIndexForAdd, setActiveDayIndexForAdd] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('ALL');

  const startCreateNew = () => {
    setPlanForm({
      name: 'Mein Trainingsplan',
      description: 'Individueller Trainingsplan',
      days: DEFAULT_7_DAYS()
    });
    setEditingPlanId('NEW');
  };

  const startEditPlan = (plan) => {
    setPlanForm({
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      days: normalizeTo7Days(plan.days)
    });
    setEditingPlanId(plan.id);
  };

  const handleDuplicate = (planId, e) => {
    e.stopPropagation();
    const cloned = duplicatePlan(planId);
    if (cloned) alert(`Plan "${cloned.name}" wurde dupliziert!`);
  };

  const handleDelete = (planId, e) => {
    e.stopPropagation();
    if (confirm('Möchtest du diesen Trainingsplan wirklich löschen?')) {
      deleteCustomPlan(planId);
    }
  };

  const handleSavePlan = () => {
    if (!planForm.name.trim()) return alert('Bitte gib einen Namen für den Trainingsplan ein.');

    const payload = {
      name: planForm.name.trim(),
      description: planForm.description.trim(),
      days: planForm.days
    };

    if (editingPlanId === 'NEW') {
      const created = addCustomPlan(payload);
      if (onSelect && created) onSelect(created.id);
    } else {
      updateCustomPlan(editingPlanId, payload);
      if (onSelect) onSelect(editingPlanId);
    }
    setEditingPlanId(null);
  };

  /** Update the workout type name for a day */
  const handleUpdateDayName = (dayIndex, name) => {
    setPlanForm(prev => {
      const nextDays = [...prev.days];
      nextDays[dayIndex] = { ...nextDays[dayIndex], name };

      // Clear exercises when switching to Rest
      const willBeRest = isRestDay({ name });
      if (willBeRest) {
        nextDays[dayIndex].exercises = [];
      } else if (nextDays[dayIndex].exercises.length === 0) {
        // Auto-prefill suggestions when exercises are empty and name matches a preset
        const suggestions = getSuggestedExercisesForDayName(name);
        if (suggestions.length > 0) nextDays[dayIndex].exercises = suggestions;
      }
      return { ...prev, days: nextDays };
    });
  };

  const handleAutoPrefillDay = (dayIndex) => {
    setPlanForm(prev => {
      const nextDays = [...prev.days];
      const suggestions = getSuggestedExercisesForDayName(nextDays[dayIndex]?.name || '');
      if (suggestions.length > 0) nextDays[dayIndex] = { ...nextDays[dayIndex], exercises: suggestions };
      return { ...prev, days: nextDays };
    });
  };

  const handleRemoveExerciseFromDay = (dayIndex, exerciseId) => {
    setPlanForm(prev => {
      const nextDays = [...prev.days];
      nextDays[dayIndex] = {
        ...nextDays[dayIndex],
        exercises: nextDays[dayIndex].exercises.filter(id => id !== exerciseId)
      };
      return { ...prev, days: nextDays };
    });
  };

  const handleAddExerciseToDay = (exerciseId) => {
    if (activeDayIndexForAdd === null) return;
    setPlanForm(prev => {
      const nextDays = [...prev.days];
      const current = nextDays[activeDayIndexForAdd].exercises || [];
      if (!current.includes(exerciseId)) {
        nextDays[activeDayIndexForAdd] = { ...nextDays[activeDayIndexForAdd], exercises: [...current, exerciseId] };
      }
      return { ...prev, days: nextDays };
    });
    setActiveDayIndexForAdd(null);
  };

  const filteredExercises = allExercises.filter(ex => {
    const matchesMuscle = selectedMuscle === 'ALL' || ex.muscle === selectedMuscle;
    const matchesSearch = !searchQuery.trim()
      || ex.name.toLowerCase().includes(searchQuery.toLowerCase())
      || ex.muscle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMuscle && matchesSearch;
  });

  return (
    <motion.div className="scroll-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ padding: 24, paddingTop: 60, paddingBottom: 100, height: '100%', boxSizing: 'border-box' }}>

      {/* ── PLAN LIST ── */}
      {editingPlanId === null ? (
        <>
          <h1 className="title-lg" style={{ textAlign: 'center' }}>Trainingsplan wählen</h1>
          <p className="subtitle" style={{ textAlign: 'center', marginBottom: 24 }}>
            Wähle ein Programm oder erstelle deinen eigenen individuellen Plan.
          </p>

          <div style={{ display: 'grid', gap: 14 }}>
            {plans.map((plan, i) => {
              const isCustom = plan.id.startsWith('custom_');
              const trainingDaysCount = plan.days?.filter(d => d.exercises?.length > 0 && !isRestDay(d)).length || 0;
              const restDaysCount = (plan.days?.length || 0) - trainingDaysCount;
              const totalExercises = plan.days?.reduce((acc, d) => acc + (d.exercises?.length || 0), 0) || 0;

              return (
                <motion.div key={plan.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.04 }} className="card"
                  style={{ padding: 18, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12 }}
                  onClick={() => onSelect && onSelect(plan.id)}>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>{plan.name}</h2>
                        {isCustom && (
                          <span style={{ fontSize: '0.7rem', background: 'rgba(10,132,255,0.15)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                            EIGENER PLAN
                          </span>
                        )}
                      </div>
                      <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>{plan.description}</p>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 6 }}>
                        {trainingDaysCount} Trainingstage{restDaysCount > 0 ? ` · ${restDaysCount} Ruhetag${restDaysCount > 1 ? 'e' : ''}` : ''} · {totalExercises} Übungen
                      </div>
                    </div>
                    <ChevronRight color="var(--text-tertiary)" />
                  </div>

                  <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
                    <button type="button" className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}
                      onClick={e => { e.stopPropagation(); startEditPlan(plan); }}>
                      <Edit2 size={13} /> {isCustom ? 'Bearbeiten' : 'Individualisieren'}
                    </button>
                    <button type="button" className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}
                      onClick={e => handleDuplicate(plan.id, e)}>
                      <Copy size={13} /> Duplizieren
                    </button>
                    {isCustom && (
                      <button type="button" className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--danger)', background: 'rgba(255,69,58,0.1)', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}
                        onClick={e => handleDelete(plan.id, e)}>
                        <Trash2 size={13} /> Löschen
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}

            <button className="btn-primary"
              style={{ padding: 14, marginTop: 10, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onClick={startCreateNew}>
              <Plus size={18} /> Neuen Trainingsplan erstellen
            </button>
          </div>
        </>
      ) : (

        /* ── PLAN EDITOR ── */
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <button onClick={() => setEditingPlanId(null)}
              style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
              <ArrowLeft size={20} /> Zurück
            </button>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, flex: 1, textAlign: 'center' }}>
              {editingPlanId === 'NEW' ? 'Neuer Trainingsplan' : 'Plan Bearbeiten'}
            </h2>
          </div>

          {/* Plan meta */}
          <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>NAME DES PLANS</label>
              <input className="input-field" placeholder="z. B. Mein Hypertrophie Split"
                value={planForm.name} onChange={e => setPlanForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>BESCHREIBUNG</label>
              <input className="input-field" placeholder="z. B. Push/Pull/Legs 5 Tage"
                value={planForm.description} onChange={e => setPlanForm(prev => ({ ...prev, description: e.target.value }))} />
            </div>
          </div>

          {/* 7 Weekday slots */}
          <h3 style={{ margin: '0 0 12px', fontSize: '1.05rem', fontWeight: 600 }}>Wochentage</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
            {planForm.days.map((day, dayIdx) => {
              const rest = isRestDay(day);
              return (
                <div key={day.id || dayIdx} className="card"
                  style={{ padding: 16, opacity: rest ? 0.75 : 1, border: rest ? '1px solid var(--border)' : '1px solid var(--border)' }}>

                  {/* Weekday label + type input */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: rest ? 0 : 12 }}>
                    {/* Weekday badge */}
                    <div style={{
                      minWidth: 80, fontSize: '0.75rem', fontWeight: 700, color: rest ? 'var(--text-tertiary)' : 'var(--primary)',
                      background: rest ? 'var(--bg-card-highlight)' : 'rgba(10,132,255,0.12)',
                      padding: '4px 10px', borderRadius: 8, textAlign: 'center', flexShrink: 0
                    }}>
                      {day.weekday}
                    </div>

                    {/* Workout type selector */}
                    <div style={{ flex: 1 }}>
                      <select
                        value={rest ? 'Rest' : day.name}
                        onChange={e => handleUpdateDayName(dayIdx, e.target.value)}
                        style={{
                          width: '100%', padding: '8px 12px', borderRadius: 8,
                          border: '1px solid var(--border)', background: 'var(--bg-main)',
                          color: rest ? 'var(--text-tertiary)' : 'var(--text-main)',
                          fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer'
                        }}
                      >
                        <option value="Rest">🌙 Rest – Ruhetag</option>
                        <option value="Push">💪 Push</option>
                        <option value="Pull">🔄 Pull</option>
                        <option value="Legs">🦵 Legs</option>
                        <option value="Upper">⬆️ Upper</option>
                        <option value="Lower">⬇️ Lower</option>
                        <option value="Chest & Back">🏋️ Chest &amp; Back</option>
                        <option value="Shoulders & Arms">💎 Shoulders &amp; Arms</option>
                        <option value="Fullbody">🔥 Fullbody</option>
                        <option value="Cardio">🏃 Cardio</option>
                        {/* Custom name if none of the above */}
                        {!['Rest','Push','Pull','Legs','Upper','Lower','Chest & Back','Shoulders & Arms','Fullbody','Cardio'].includes(day.name) && !rest && (
                          <option value={day.name}>{day.name}</option>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* REST state: locked message */}
                  {rest ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, padding: '8px 12px', borderRadius: 8, background: 'var(--bg-card-highlight)' }}>
                      <Moon size={15} color="var(--text-tertiary)" />
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Ruhetag – keine Übungen</span>
                    </div>
                  ) : (
                    <>
                      {/* Auto-prefill button */}
                      {(() => {
                        const suggestions = getSuggestedExercisesForDayName(day.name);
                        if (suggestions.length > 0) return (
                          <button type="button" onClick={() => handleAutoPrefillDay(dayIdx)} style={{
                            width: '100%', padding: '7px 10px', marginBottom: 10, borderRadius: 8,
                            border: '1px solid rgba(48,209,88,0.4)', background: 'rgba(48,209,88,0.12)',
                            color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer'
                          }}>
                            <Zap size={13} /> Auto-Befüllen ({suggestions.length} Übungen)
                          </button>
                        );
                        return null;
                      })()}

                      {/* Exercise list */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                        {day.exercises.map((exId, exIdx) => {
                          const foundEx = allExercises.find(e => e.id === exId);
                          const exName = foundEx ? foundEx.name : exId.replace(/_/g, ' ');
                          const muscle = foundEx ? foundEx.muscle : 'Andere';
                          return (
                            <div key={`${exId}-${exIdx}`} style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              background: 'var(--bg-main)', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Dumbbell size={14} color="var(--primary)" />
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{exName}</div>
                                  <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>{muscle}</div>
                                </div>
                              </div>
                              <button type="button" onClick={() => handleRemoveExerciseFromDay(dayIdx, exId)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                                <X size={15} />
                              </button>
                            </div>
                          );
                        })}
                        {day.exercises.length === 0 && (
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '10px 0' }}>
                            Noch keine Übungen hinzugefügt.
                          </div>
                        )}
                      </div>

                      {/* Add exercise button – only visible on non-rest days */}
                      <button type="button" className="btn-secondary"
                        style={{ width: '100%', padding: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        onClick={() => { setActiveDayIndexForAdd(dayIdx); setSearchQuery(''); setSelectedMuscle('ALL'); }}>
                        <Plus size={14} /> Übung Auswählen
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Save / Cancel */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-primary" style={{ flex: 1, padding: 14 }} onClick={handleSavePlan}>
              Plan Speichern &amp; Aktivieren
            </button>
            <button className="btn-secondary" style={{ padding: 14 }} onClick={() => setEditingPlanId(null)}>
              Abbrechen
            </button>
          </div>
        </motion.div>
      )}

      {/* ── EXERCISE PICKER MODAL ── */}
      <AnimatePresence>
        {activeDayIndexForAdd !== null && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--bg-main)', zIndex: 3000, display: 'flex', flexDirection: 'column' }}>

            <div style={{ padding: 20, paddingTop: 'max(20px, env(safe-area-inset-top))', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input autoFocus className="input-field" style={{ paddingLeft: 40 }}
                  placeholder="Übung suchen..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <button onClick={() => setActiveDayIndexForAdd(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>
                Fertig
              </button>
            </div>

            <div style={{ padding: '12px 20px', display: 'flex', gap: 8, overflowX: 'auto', borderBottom: '1px solid var(--border)' }}>
              {['ALL', ...MUSCLE_GROUPS].map(m => (
                <button key={m} type="button" onClick={() => setSelectedMuscle(m)} style={{
                  padding: '6px 14px', borderRadius: 16, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.8rem', fontWeight: 600,
                  background: selectedMuscle === m ? 'var(--primary)' : 'var(--bg-card-highlight)',
                  color: selectedMuscle === m ? '#fff' : 'var(--text-secondary)'
                }}>
                  {m === 'ALL' ? 'ALLE' : m}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              <div style={{ display: 'grid', gap: 8 }}>
                {filteredExercises.map(ex => (
                  <button key={ex.id} type="button" className="card"
                    style={{ width: '100%', textAlign: 'left', padding: 14, color: 'var(--text-main)', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    onClick={() => handleAddExerciseToDay(ex.id)}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{ex.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{ex.muscle} · {ex.type}</div>
                    </div>
                    <Plus size={18} color="var(--primary)" />
                  </button>
                ))}
                {filteredExercises.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: 30 }}>
                    Keine passenden Übungen gefunden.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
