
import { useState, useEffect, createContext, useContext, createElement } from 'react';
import { isSameDay, parseISO } from 'date-fns';
import { PLANS } from '../data/plans';
import { EXERCISES as DEFAULT_EXERCISES } from '../data/exercises';

const DataContext = createContext(null);

const STORAGE_KEY_BASE = 'fitness_app_v4'; 
const IS_TEST_BUILD = false; 

const GLOBAL_USERS_KEY = 'fitness_app_users';
const ACTIVE_USER_KEY = 'fitness_app_activeUser';

function getActiveUser() {
    try { return localStorage.getItem(ACTIVE_USER_KEY) || null; } catch { return null; }
}
function getGlobalUsers() {
    try { return JSON.parse(localStorage.getItem(GLOBAL_USERS_KEY) || '{}'); } catch { return {}; }
}
function setGlobalUsers(users) {
    localStorage.setItem(GLOBAL_USERS_KEY, JSON.stringify(users));
}
function setActiveUserStore(name) {
    if (name) localStorage.setItem(ACTIVE_USER_KEY, name);
    else localStorage.removeItem(ACTIVE_USER_KEY);
}

const INITIAL_DATA = {
    currentPlanId: null,
    currentDayIndex: 0,
    prs: {}, // { exerciseId: weight }
    customOverrides: {}, // { planId: { dayId: [exerciseIds] } }
    goals: {}, // { currentBodyweight, targetBodyweight }
    customExercises: [], // [{ id, name, muscle, type, substitutes }]
    startDate: new Date().toISOString(), // Track when user started for deload cycles
    logs: [], // Track completed workouts
    workoutDrafts: {}, // { dayId: { exercises, setsData } }
    machineSelections: {}, // { exerciseId: 'Technogym' | 'Gym80' | 'Panata' | etc }
    // New: simple auth and custom plans
    user: null, // { name, password }
    customPlans: [] // user created plans (merged with PLANS in memory)
    // Note: We merge DEFAULT_EXERCISES + customExercises in memory
};

function useDataProvider() {
    const [activeUser, setActiveUserState] = useState(getActiveUser);

    const [data, setData] = useState(() => {
        const user = getActiveUser();
        if (!user) return INITIAL_DATA;

        const key = `${STORAGE_KEY_BASE}_${user}`;

        try {
            const saved = localStorage.getItem(key);
            if (saved) return JSON.parse(saved);

            // Migration step for existing users
            const oldSaved = localStorage.getItem(STORAGE_KEY_BASE);
            if (oldSaved) {
                const parsed = JSON.parse(oldSaved);
                if (parsed.user && parsed.user.name === user) {
                    localStorage.setItem(key, oldSaved);
                    return parsed;
                }
            }

            if (IS_TEST_BUILD) return seedData(INITIAL_DATA);
            return INITIAL_DATA;
        } catch {
            return INITIAL_DATA;
        }
    });

    useEffect(() => {
        if (!activeUser) {
            setData(INITIAL_DATA);
            return;
        }

        const key = `${STORAGE_KEY_BASE}_${activeUser}`;
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                setData(JSON.parse(saved));
            } else {
                const oldSaved = localStorage.getItem(STORAGE_KEY_BASE);
                if (oldSaved) {
                    const parsed = JSON.parse(oldSaved);
                    if (parsed.user && parsed.user.name === activeUser) {
                        localStorage.setItem(key, oldSaved);
                        setData(parsed);
                        return;
                    }
                }
                setData({ ...INITIAL_DATA, user: { name: activeUser } });
            }
        } catch {
            setData(INITIAL_DATA);
        }
    }, [activeUser]);

    useEffect(() => {
        if (!activeUser) return;
        const key = `${STORAGE_KEY_BASE}_${activeUser}`;
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (err) {
            console.error('Speichern fehlgeschlagen (Speicher voll?)', err);
        }
    }, [data, activeUser]);

    // Merge default and custom exercises for usage
    const getAllExercises = () => {
        return [...DEFAULT_EXERCISES, ...(data.customExercises || [])];
    }

    // Return built-in + custom plans
    const getAllPlans = () => {
        return [...PLANS, ...(data.customPlans || [])];
    }

    // Select a plan
    const selectPlan = (planId) => {
        setData(prev => ({ ...prev, currentPlanId: planId, currentDayIndex: 0 }));
    };

    const resetPlan = () => {
        // simply unset the current plan but keep logs/prs/drafts intact so progress isn't lost
        setData(prev => ({ ...prev, currentPlanId: null }));
    }

    const registerUser = (name, password) => {
        if (!name) return { ok: false, error: 'Name required' };
        const users = getGlobalUsers();
        if (users[name]) return { ok: false, error: 'User already exists' };
        
        users[name] = password;
        setGlobalUsers(users);
        
        setActiveUserStore(name);
        setActiveUserState(name);
        
        setData(prev => ({ ...prev, user: { name } }));
        setTimeout(() => window.location.reload(), 50);
        return { ok: true };
    };

    const loginUser = (name, password) => {
        if (!name) return { ok: false, error: 'Name required' };
        const users = getGlobalUsers();
        
        // Fallback to exactly one global storage item if it exists
        const oldSaved = localStorage.getItem(STORAGE_KEY_BASE);
        let fallbackOk = false;
        if (oldSaved) {
            const parsed = JSON.parse(oldSaved);
            if (parsed.user && parsed.user.name === name && parsed.user.password === password) {
                fallbackOk = true;
                users[name] = password;
                setGlobalUsers(users);
            }
        }

        if (users[name] === password || fallbackOk) {
            setActiveUserStore(name);
            setActiveUserState(name);
            setTimeout(() => window.location.reload(), 50);
            return { ok: true };
        }
        return { ok: false, error: 'Invalid credentials' };
    };

    const logoutUser = () => {
        setActiveUserStore(null);
        setActiveUserState(null);
        setData(INITIAL_DATA);
        setTimeout(() => window.location.reload(), 50);
    };

    // Allow creating a new custom plan and select it immediately
    const addCustomPlan = (plan) => {
        const newId = `custom_${Date.now()}`;
        const newPlan = { id: newId, ...plan };
        setData(prev => ({ ...prev, customPlans: [...(prev.customPlans||[]), newPlan], currentPlanId: newId }));
        return newPlan;
    };

    const updateCustomPlan = (planId, updatedPlan) => {
        let activeId = planId;
        const isCustom = (data.customPlans || []).some(p => p.id === planId);

        if (!isCustom) {
            // Convert built-in plan edit into a new custom plan
            activeId = `custom_${Date.now()}`;
        }

        setData(prev => {
            if (isCustom) {
                // Beim Speichern im Plan-Editor gelten die Plan-Daten wieder; alte Workout-Overrides entfernen
                const { [planId]: _removed, ...remainingOverrides } = prev.customOverrides || {};
                return {
                    ...prev,
                    customPlans: (prev.customPlans || []).map(p => p.id === planId ? { ...p, ...updatedPlan } : p),
                    customOverrides: remainingOverrides,
                    currentPlanId: planId
                };
            } else {
                const newCustomPlan = { ...updatedPlan, id: activeId };
                return {
                    ...prev,
                    customPlans: [...(prev.customPlans || []), newCustomPlan],
                    currentPlanId: activeId
                };
            }
        });

        return activeId;
    };

    const duplicatePlan = (planId) => {
        const target = getAllPlans().find(p => p.id === planId);
        if (!target) return null;
        const newPlan = {
            id: `custom_${Date.now()}`,
            name: `${target.name} (Copy)`,
            description: target.description || '',
            days: JSON.parse(JSON.stringify(target.days))
        };
        setData(prev => ({
            ...prev,
            customPlans: [...(prev.customPlans || []), newPlan]
        }));
        return newPlan;
    };

    const deleteCustomPlan = (planId) => {
        setData(prev => {
            const newCustoms = (prev.customPlans || []).filter(p => p.id !== planId);
            const nextPlanId = prev.currentPlanId === planId ? (newCustoms[0]?.id || PLANS[0].id) : prev.currentPlanId;
            return {
                ...prev,
                customPlans: newCustoms,
                currentPlanId: nextPlanId
            };
        });
    };

    const getLastLoggedSession = (exerciseId) => {
        if (!data.logs || data.logs.length === 0) return null;
        const sorted = [...data.logs].sort((a, b) => new Date(b.date) - new Date(a.date));
        for (const log of sorted) {
            if (!log.exercises) continue;
            const ex = log.exercises.find(e => e.id === exerciseId);
            if (ex && ex.sets && ex.sets.length > 0) {
                const validSets = ex.sets.filter(s => s.weight !== '' && s.weight !== undefined && s.weight !== null);
                if (validSets.length > 0) {
                    return {
                        date: log.date,
                        sets: validSets,
                        note: ex.note || '',
                        machine: ex.machine || 'Free Weights'
                    };
                }
            }
        }
        return null;
    };

    const getExerciseStats = (exerciseId) => {
        const pr = data.prs[exerciseId] || 0;
        const lastSession = getLastLoggedSession(exerciseId);
        return { pr, lastSession };
    };

    const getPlan = () => {
        const all = getAllPlans();
        if (!all || all.length === 0) return null;
        return all.find(p => p.id === data.currentPlanId) || all[0];
    };

    // Calendar-based scheduling for consistency
    const getCurrentDay = () => {
        return getWorkoutForDate(new Date());
    }

    const getWorkoutForDate = (date) => {
        const plan = getPlan();
        if (!plan || !plan.days || plan.days.length === 0) return null;

        const d = date instanceof Date ? date : new Date(date);
        if (plan.id === 'ppl_ul_hybrid' || plan.days.length === 7) {
            const dayIndex = d.getDay(); // 0=Sun
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

    const recalculatePRs = (logs) => {
        const prs = {};
        (logs || []).forEach(log => {
            (log.exercises || []).forEach(ex => {
                (ex.sets || []).forEach(s => {
                    const w = parseFloat(s.weight);
                    if (!isNaN(w) && w > (prs[ex.id] || 0)) {
                        prs[ex.id] = w;
                    }
                });
            });
        });
        return prs;
    };

    const saveWorkout = (workoutLog) => {
        const plan = getPlan();
        setData(prev => {
            const nextLogs = [workoutLog, ...(prev.logs || [])];
            const newPrs = recalculatePRs(nextLogs);

            return {
                ...prev,
                logs: nextLogs,
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
            const newPrs = recalculatePRs(logsCpy);

            return {
                ...prev,
                logs: logsCpy,
                prs: newPrs
            };
        });
    };

    const deleteLog = (originalDate) => {
        setData(prev => {
            const nextLogs = (prev.logs || []).filter(l => l.date !== originalDate);
            const newPrs = recalculatePRs(nextLogs);
            return {
                ...prev,
                logs: nextLogs,
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
        const allPlans = getAllPlans();
        const plan = allPlans.find(p => p.id === planId) || getPlan();
        if (!plan || !plan.days || plan.days.length === 0) return [];

        if (data.customOverrides && data.customOverrides[plan.id] && data.customOverrides[plan.id][dayId]) {
            return data.customOverrides[plan.id][dayId].map(id => {
                const found = allExercises.find(e => e.id === id);
                return found || { id, name: id.replace(/_/g, ' '), muscle: 'Other', type: 'Custom' };
            }).filter(Boolean);
        }

        const day = plan.days.find(d => d.id === dayId) || plan.days[0];
        if (!day || !day.exercises) return [];

        return day.exercises.map(id => {
            const found = allExercises.find(e => e.id === id);
            return found || { id, name: id.replace(/_/g, ' '), muscle: 'Other', type: 'Custom' };
        }).filter(Boolean);
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

    const setMachineSelection = (exerciseId, manufacturer) => {
        setData(prev => ({
            ...prev,
            machineSelections: {
                ...prev.machineSelections,
                [exerciseId]: manufacturer
            }
        }));
    };

    const getMachineSelection = (exerciseId) => {
        return data.machineSelections?.[exerciseId] || 'Free Weights';
    };

    const setGoal = (key, value) => {
        setData(prev => ({
            ...prev,
            goals: {
                ...prev.goals,
                [key]: value
            }
        }));
    }

    const getTodayLog = () => {
        const now = new Date();
        return (data.logs || []).find(log => {
            try {
                return isSameDay(parseISO(log.date), now);
            } catch {
                return false;
            }
        });
    };

    const hasCompletedWorkoutToday = () => {
        return Boolean(getTodayLog());
    };

    const getNextTrainingDay = (fromDate = new Date()) => {
        const plan = getPlan();
        if (!plan || !plan.days || plan.days.length === 0) return null;

        if (plan.days.length === 7) {
            const currDate = fromDate instanceof Date ? fromDate : new Date(fromDate);
            for (let offset = 1; offset <= 7; offset++) {
                const checkDate = new Date(currDate);
                checkDate.setDate(currDate.getDate() + offset);
                const dayIndex = checkDate.getDay(); // 0=Sun
                const index = (dayIndex + 6) % 7;
                const candidate = plan.days[index];
                if (candidate && !candidate.name.toLowerCase().includes('rest') && !candidate.name.toLowerCase().includes('pause') && !candidate.name.toLowerCase().includes('ruhetag')) {
                    return {
                        ...candidate,
                        targetDate: checkDate,
                        daysAway: offset
                    };
                }
            }
            const tomorrow = new Date(currDate);
            tomorrow.setDate(currDate.getDate() + 1);
            const idx = (tomorrow.getDay() + 6) % 7;
            return { ...plan.days[idx], targetDate: tomorrow, daysAway: 1 };
        }

        let nextIndex = ((data.currentDayIndex || 0) + 1) % plan.days.length;
        for (let i = 0; i < plan.days.length; i++) {
            const day = plan.days[nextIndex];
            if (!day.name.toLowerCase().includes('rest') && !day.name.toLowerCase().includes('pause') && !day.name.toLowerCase().includes('ruhetag')) {
                return day;
            }
            nextIndex = (nextIndex + 1) % plan.days.length;
        }
        return plan.days[nextIndex];
    };

    const exportUserData = () => {
        // Passwort nie mit exportieren
        const { user, ...rest } = data;
        const safeUser = user ? { name: user.name } : null;
        return JSON.stringify({ schemaVersion: 1, ...rest, user: safeUser }, null, 2);
    };

    const importUserData = (jsonString) => {
        try {
            const parsed = JSON.parse(jsonString);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { ok: false, error: 'Ungültiges Datenformat' };
            if (!Array.isArray(parsed.logs)) return { ok: false, error: 'Keine Trainingsdaten (logs) gefunden' };
            const validLogs = parsed.logs.filter(l => l && typeof l.date === 'string' && typeof l.dayId === 'string' && Array.isArray(l.exercises));
            const { schemaVersion: _v, ...rest } = parsed;
            setData(prev => ({
                ...INITIAL_DATA,
                ...rest,
                logs: validLogs,
                prs: recalculatePRs(validLogs),
                user: prev.user // eingeloggtes Profil bleibt erhalten
            }));
            return { ok: true, imported: validLogs.length, skipped: parsed.logs.length - validLogs.length };
        } catch (err) {
            return { ok: false, error: err.message };
        }
    };

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
        getAllPlans,
        addCustomPlan,
        registerUser,
        loginUser,
        logoutUser,
        getWorkoutForDate,
        getWeekNumber,
        isDeloadWeek,
        getTodayLog,
        hasCompletedWorkoutToday,
        getNextTrainingDay,
        saveWorkoutDraft,
        clearWorkoutDraft,
        updateLog,
        deleteLog,
        exportUserData,
        importUserData,
        setMachineSelection,
        getMachineSelection,
        updateCustomPlan,
        duplicatePlan,
        deleteCustomPlan,
        getLastLoggedSession,
        getExerciseStats
    };
}

export function DataProvider({ children }) {
    const value = useDataProvider();
    return createElement(DataContext.Provider, { value }, children);
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
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
