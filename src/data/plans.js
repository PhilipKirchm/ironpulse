
export const PLANS = [
    {
        id: 'ppl_classic',
        name: 'Classic PPL (6 Day)',
        description: 'High frequency push/pull/legs split.',
        days: [
            { id: 'push', name: 'Push A', exercises: ['bench_press', 'ohp', 'incline_dumbell_press', 'lateral_raise', 'tricep_pushdown'] },
            { id: 'pull', name: 'Pull A', exercises: ['pull_up', 'barbell_row', 'cable_row', 'face_pull', 'bicep_curl'] },
            { id: 'legs', name: 'Legs A', exercises: ['squat', 'rdl', 'leg_extension', 'leg_curl', 'standing_calf_raise'] },
            { id: 'push_b', name: 'Push B', exercises: ['ohp', 'incline_dumbell_press', 'cable_fly', 'lateral_raise', 'skull_crusher'] },
            { id: 'pull_b', name: 'Pull B', exercises: ['lat_pulldown', 'cable_row', 'face_pull', 'hammer_curl'] },
            { id: 'legs_b', name: 'Legs B', exercises: ['deadlift', 'leg_press', 'lunges', 'leg_curl'] },
            { id: 'rest', name: 'Rest', exercises: [] }
        ]
    },
    {
        id: 'ppl_ul_hybrid',
        name: 'PPL + Upper/Lower (5 Day)',
        description: 'Perfect balance of volume and recovery.',
        days: [
            { id: 'push_hyper', name: 'Push Hypertrophy', exercises: ['incline_dumbell_press', 'machine_chest_press', 'lateral_raise', 'cable_fly', 'overhead_extension', 'tricep_pushdown'] },
            { id: 'pull_hyper', name: 'Pull Hypertrophy', exercises: ['lat_pulldown', 'cable_row', 'face_pull', 'reverse_pec_deck', 'hammer_curl', 'bayesian_curl'] },
            { id: 'legs_hyper', name: 'Legs Hypertrophy (Hammies)', exercises: ['rdl', 'seated_leg_curl', 'hack_squat', 'bulgarian_split_squat', 'seated_calf_raise'] },
            { id: 'rest', name: 'Rest', exercises: [] },
            { id: 'upper_power', name: 'Upper Power', exercises: ['bench_press', 'barbell_row', 'ohp', 'pull_up', 'jm_press', 'bicep_curl'] },
            { id: 'lower_power', name: 'Lower Power (Quads)', exercises: ['squat', 'leg_press', 'leg_extension', 'rdl', 'standing_calf_raise'] },
            { id: 'rest_2', name: 'Rest', exercises: [] }
        ]
    },
    {
        id: 'ppl_arnold',
        name: 'PPL + Arms (Arnold Split Focus)',
        description: 'Prioritizing arm growth with dedicated days.',
        days: [
            { id: 'chest_back', name: 'Chest & Back', exercises: ['bench_press', 'pull_up', 'incline_dumbell_press', 'barbell_row', 'cable_fly'] },
            { id: 'shoulders_arms', name: 'Shoulders & Arms', exercises: ['ohp', 'lateral_raise', 'bicep_curl', 'skull_crusher', 'hammer_curl', 'tricep_pushdown'] },
            { id: 'legs', name: 'Legs', exercises: ['squat', 'rdl', 'leg_extension', 'leg_curl'] },
            { id: 'upper_pump', name: 'Upper Pump', exercises: ['low_incline_dumbell_press', 'lat_pulldown', 'machine_shoulder_press', 'preacher_curl', 'overhead_extension'] },
            { id: 'legs_vol', name: 'Legs Volume', exercises: ['leg_press', 'hack_squat', 'lunges', 'leg_curl'] },
            { id: 'rest', name: 'Rest', exercises: [] },
            { id: 'rest_2', name: 'Rest', exercises: [] }
        ]
    }
];
