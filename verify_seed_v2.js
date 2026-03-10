
import { PLANS } from './src/data/plans.js';

function seedData(initialData) {
    const newData = { ...initialData };
    newData.currentPlanId = 'ppl_ul_hybrid'; // Default plan
    newData.logs = [];

    // Seed Range: Dec 1, 2025 to Jan 29, 2026
    const startDate = new Date('2025-12-01T12:00:00');
    const endDate = new Date('2026-02-05T12:00:00');
    const plan = PLANS.find(p => p.id === 'ppl_ul_hybrid');

    if (!plan) {
        console.error("Plan not found");
        return newData;
    }

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay(); // 0=Sun, 6=Sat

        let planDay = null; // RESTORED VARIABLE

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
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Reverse logs so newest is first
    newData.logs.reverse();
    newData.startDate = startDate.toISOString();

    return newData;
}

const INITIAL_DATA = { logs: [] };
const result = seedData(INITIAL_DATA);

console.log("Total logs generated:", result.logs.length);
if (result.logs.length > 0) {
    const firstLog = result.logs[0];
    const lastLog = result.logs[result.logs.length - 1];
    console.log("First log date (newest):", firstLog.date, "Day:", firstLog.dayId);
    console.log("Last log date (oldest):", lastLog.date, "Day:", lastLog.dayId);

    // Check specific Friday/Saturday
    // Dec 5, 2025 was a Friday.
    const friLog = result.logs.find(l => l.date.includes('2025-12-05'));
    console.log("Log for 2025-12-05 (Friday):", friLog ? friLog.dayId : "NONE");

    // Dec 6, 2025 was a Saturday.
    const satLog = result.logs.find(l => l.date.includes('2025-12-06'));
    console.log("Log for 2025-12-06 (Saturday):", satLog ? satLog.dayId : "NONE");
} else {
    console.log("NO LOGS GENERATED!");
}
