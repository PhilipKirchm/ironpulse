
import { useState, useEffect } from 'react';
import { PLANS } from '../data/plans';
import { EXERCISES as DEFAULT_EXERCISES } from '../data/exercises';

const STORAGE_KEY = 'fitness_app_v4'; // Production Key
const IS_TEST_BUILD = false; // Disable seeding

const INITIAL_DATA = {
    currentPlanId: null,
    currentDayIndex: 0,
    prs: {}, // { exerciseId: weight }
    customOverrides: {}, // { planId: { dayId: [exerciseIds] } }
    goals: {}, // { currentBodyweight, targetBodyweight }
    customExercises: [], // [{ id, name, muscle, type, substitutes }]
    startDate: new Date().toISOString(), // Track when user started for deload cycles
    logs: [], // Track completed workouts
    workoutDrafts: {} // { dayId: { exercises, setsData } }
    // Note: We merge DEFAULT_EXERCISES + customExercises in memory
};

export function useData() {
    const [data, setData] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved);

            // If no data and we are in test build, seed it
            if (IS_TEST_BUILD) {
                return seedData(INITIAL_DATA);
            }
            return INITIAL_DATA;
        } catch (e) {
            return INITIAL_DATA;
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [data]);

    // Merge default and custom exercises for usage
    const getAllExercises = () => {
        return [...DEFAULT_EXERCISES, ...(data.customExercises || [])];
    }

    const selectPlan = (planId) => {
        setData(prev => ({ ...prev, currentPlanId: planId, currentDayIndex: 0 }));
    };

    const resetPlan = () => {
        setData(prev => ({ ...prev, currentPlanId: null }));
    }

    const getPlan = () => PLANS.find(p => p.id === data.currentPlanId);

    // Calendar-based scheduling for consistency
    const getCurrentDay = () => {
        return getWorkoutForDate(new Date());
    }

    const getWorkoutForDate = (date) => {
        const plan = getPlan();
        if (!plan) return null;

        if (plan.id === 'ppl_ul_hybrid' || plan.days.length === 7) {
            const dayIndex = date.getDay(); // 0=Sun
            // Convert to 0=Mon, 6=Sun to match array
            const index = (dayIndex + 6) % 7;
            return plan.days[index];
        }

        // Fallback for non-calendar plans (just return first day as projection is hard without history)
        return plan.days[0];
    }

    const getWeekNumber = (date = new Date()) => {
        if (!data.startDate) return 1;
        const start = new Date(data.startDate);
        const current = new Date(date);
        const diffTime = Math.abs(current - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.ceil(diffDays / 7);
    }

    const isDeloadWeek = (date = new Date()) => {
        const week = getWeekNumber(date);
        // Deload every 8th week
        return week > 0 && week % 8 === 0;
    }

    // Skip day just moves the pointer for sequential, or does nothing for calendar
    const skipDay = () => {
        const plan = getPlan();
        if (!plan) return;

        // For calendar plans, skipping isn't really a thing, but we could perhaps rely on data.currentDayIndex if we wanted overrides,
        // but for now let's keep it simple: Calendar determines the day.
        if (plan.id === 'ppl_ul_hybrid' || plan.days.length === 7) {
            // Calendar plans don't really support "skipping" in the traditional sense
            // as the day is fixed by the date.
            return;
        }

        setData(prev => ({
            ...prev,
            currentDayIndex: (prev.currentDayIndex + 1) % plan.days.length
        }));
    }

    const updatePR = (exerciseId, weight) => {
        setData(prev => {
            const current = prev.prs[exerciseId] || 0;
            if (weight > current) {
                return { ...prev, prs: { ...prev.prs, [exerciseId]: weight } };
            }
            return prev;
        });
    };

    const saveWorkout = (workoutLog) => {
        const plan = getPlan();
        setData(prev => {
            let newPrs = { ...prev.prs };
            workoutLog.exercises.forEach(ex => {
                ex.sets.forEach(set => {
                    const w = parseFloat(set.weight);
                    if (w > (newPrs[ex.id] || 0)) {
                        newPrs[ex.id] = w;
                    }
                });
            });

            return {
                ...prev,
                logs: [workoutLog, ...(prev.logs || [])],
                prs: newPrs,
                currentDayIndex: (prev.currentDayIndex + 1) % (plan?.days.length || 1)
            };
        });
    };

    const updateLog = (originalDate, updatedLog) => {
        setData(prev => {
            const logsCpy = [...(prev.logs || [])];
            const idx = logsCpy.findIndex(l => l.date === originalDate);
            if (idx !== -1) {
                logsCpy[idx] = updatedLog;
            }

            // Recalculate PRs based on the updated log for simplicity, or just update if higher.
            let newPrs = { ...prev.prs };
            updatedLog.exercises.forEach(ex => {
                ex.sets.forEach(set => {
                    const w = parseFloat(set.weight);
                    if (w > (newPrs[ex.id] || 0)) {
                        newPrs[ex.id] = w;
                    }
                });
            });

            return {
                ...prev,
                logs: logsCpy,
                prs: newPrs
            };
        });
    };

    const customizeDay = (planId, dayId, newExerciseList) => {
        setData(prev => ({
            ...prev,
            customOverrides: {
                ...prev.customOverrides,
                [planId]: {
                    ...(prev.customOverrides[planId] || {}),
                    [dayId]: newExerciseList
                }
            }
        }));
    };

    const getExercisesForDay = (planId, dayId) => {
        const allExercises = getAllExercises();
        if (data.customOverrides && data.customOverrides[planId] && data.customOverrides[planId][dayId]) {
            return data.customOverrides[planId][dayId].map(id => allExercises.find(e => e.id === id)).filter(Boolean);
        }
        const plan = PLANS.find(p => p.id === planId);
        const day = plan?.days.find(d => d.id === dayId);
        return day ? day.exercises.map(id => allExercises.find(e => e.id === id)).filter(Boolean) : [];
    };

    const addExerciseToDay = () => {
        // Placeholder if we implemented strictly inside hook, but logic is in component for now.
    }

    const addCustomExercise = (name, muscle) => {
        const newId = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
        const newEx = {
            id: newId,
            name,
            muscle,
            type: 'Custom',
            substitutes: []
        };

        setData(prev => ({
            ...prev,
            customExercises: [...(prev.customExercises || []), newEx]
        }));
        return newEx;
    }

    const setGoal = (key, value) => {
        setData(prev => ({
            ...prev,
            goals: {
                ...prev.goals,
                [key]: value
            }
        }));
    }

    const hasCompletedWorkoutToday = () => {
        const today = new Date().toISOString().split('T')[0];
        return (data.logs || []).some(log => log.date.split('T')[0] === today);
    }

    const getNextTrainingDay = () => {
        const plan = getPlan();
        if (!plan) return null;

        // Simple logic: get the next day in the sequence that isn't rest
        let nextIndex = (data.currentDayIndex) % plan.days.length;
        // Search ahead for the next non-rest day if current one is rest
        for (let i = 0; i < plan.days.length * 2; i++) {
            const day = plan.days[nextIndex];
            if (!day.name.toLowerCase().includes('rest')) {
                return day;
            }
            nextIndex = (nextIndex + 1) % plan.days.length;
        }
        return plan.days[nextIndex];
    }

    const saveWorkoutDraft = (dayId, draftData) => {
        setData(prev => ({
            ...prev,
            workoutDrafts: {
                ...(prev.workoutDrafts || {}),
                [dayId]: draftData
            }
        }));
    };

    const clearWorkoutDraft = (dayId) => {
        setData(prev => {
            const newDrafts = { ...(prev.workoutDrafts || {}) };
            delete newDrafts[dayId];
            return { ...prev, workoutDrafts: newDrafts };
        });
    };

    return {
        data,
        selectPlan,
        resetPlan,
        getPlan,
        getCurrentDay,
        skipDay,
        updatePR,
        saveWorkout,
        customizeDay,
        getExercisesForDay,
        setGoal,
        addExerciseToDay,
        addCustomExercise, // Exported
        getAllExercises, // Exported
        getWorkoutForDate,
        getWeekNumber,
        isDeloadWeek,
        hasCompletedWorkoutToday,
        getNextTrainingDay,
        saveWorkoutDraft,
        clearWorkoutDraft,
        updateLog
    };
}

// Seeding Logic
function seedData(initialData) {
    const newData = { ...initialData };
    newData.currentPlanId = 'ppl_ul_hybrid'; // Default plan
    newData.logs = [];

    // Seed Range: Dec 1, 2025 to Jan 29, 2026
    const startDate = new Date('2025-12-01T12:00:00');
    const endDate = new Date('2026-02-05T12:00:00');
    const plan = PLANS.find(p => p.id === 'ppl_ul_hybrid');

    if (!plan) {
        // Fallback log to indicate error
        newData.logs.push({
            date: new Date().toISOString(),
            planId: 'ERROR',
            dayId: 'PLAN_NOT_FOUND_IN_SEED',
            exercises: []
        });
        return newData;
    }

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        // Simple pattern: 3 days on, 1 off, or just follow the week pattern
        const dayOfWeek = currentDate.getDay(); // 0=Sun, 6=Sat

        let planDay = null; // RESTORED VARIABLE

        // Skip Sundays and maybe Thursdays (rest)
        if (dayOfWeek !== 0 && dayOfWeek !== 4) { // Training days
            // Map roughly to plan days
            if (dayOfWeek === 1) planDay = plan.days[0]; // Mon
            if (dayOfWeek === 2) planDay = plan.days[1]; // Tue
            if (dayOfWeek === 3) planDay = plan.days[2]; // Wed
            if (dayOfWeek === 5) planDay = plan.days[4]; // Fri (Upper Power - Index 4)
            if (dayOfWeek === 6) planDay = plan.days[5]; // Sat (Lower Power - Index 5)

            if (planDay) {
                const log = {
                    date: currentDate.toISOString(),
                    planId: plan.id,
                    dayId: planDay.id,
                    exercises: planDay.exercises.map(exId => ({
                        id: exId,
                        sets: [
                            { weight: '50', reps: '10', done: true },
                            { weight: '50', reps: '10', done: true }
                        ],
                        note: 'Seeded data'
                    }))
                };
                newData.logs.push(log);
            }
        }

        // Next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Reverse logs so newest is first (standard convention usually)
    newData.logs.reverse();

    // ERROR CHECK: If no logs generated, add a placeholder
    if (newData.logs.length === 0) {
        newData.logs.push({
            date: new Date().toISOString(),
            planId: 'ERROR',
            dayId: 'NO_LOGS_GENERATED',
            exercises: []
        });
    }

    // Also set start date to Dec 1 for stats
    newData.startDate = startDate.toISOString();

    return newData;
}
