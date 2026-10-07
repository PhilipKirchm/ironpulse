
export const PLANS = [
    {
        id: 'ppl_classic',
        name: 'Classic PPL (6 Tage)',
        description: 'High Frequency Push / Pull / Legs Split mit 1 Ruhetag.',
        days: [
            { id: 'mon_push_a', weekday: 'Montag', name: 'Push A', exercises: ['bench_press', 'ohp', 'incline_dumbell_press', 'lateral_raise', 'tricep_pushdown'] },
            { id: 'tue_pull_a', weekday: 'Dienstag', name: 'Pull A', exercises: ['pull_up', 'barbell_row', 'cable_row', 'face_pull', 'bicep_curl'] },
            { id: 'wed_legs_a', weekday: 'Mittwoch', name: 'Legs A', exercises: ['squat', 'rdl', 'leg_extension', 'leg_curl', 'standing_calf_raise'] },
            { id: 'thu_rest', weekday: 'Donnerstag', name: 'Rest', exercises: [] },
            { id: 'fri_push_b', weekday: 'Freitag', name: 'Push B', exercises: ['ohp', 'incline_dumbell_press', 'cable_fly', 'lateral_raise', 'skull_crusher'] },
            { id: 'sat_pull_b', weekday: 'Samstag', name: 'Pull B', exercises: ['lat_pulldown', 'cable_row', 'face_pull', 'hammer_curl'] },
            { id: 'sun_legs_b', weekday: 'Sonntag', name: 'Legs B', exercises: ['deadlift', 'leg_press', 'lunge', 'leg_curl'] }
        ]
    },
    {
        id: 'ppl_ul_hybrid',
        name: 'PPL + Upper/Lower (5 Tage)',
        description: 'Ausgewogener 5-Tage Hypertrophie & Power Split.',
        days: [
            { id: 'mon_push_h', weekday: 'Montag', name: 'Push Hypertrophy', exercises: ['incline_dumbell_press', 'machine_chest_press', 'lateral_raise', 'cable_fly', 'overhead_extension', 'tricep_pushdown'] },
            { id: 'tue_pull_h', weekday: 'Dienstag', name: 'Pull Hypertrophy', exercises: ['lat_pulldown', 'cable_row', 'face_pull', 'reverse_pec_deck', 'hammer_curl', 'bayesian_curl'] },
            { id: 'wed_legs_h', weekday: 'Mittwoch', name: 'Legs Hypertrophy', exercises: ['rdl', 'seated_leg_curl', 'hack_squat', 'bulgarian_split_squat', 'seated_calf_raise'] },
            { id: 'thu_rest', weekday: 'Donnerstag', name: 'Rest', exercises: [] },
            { id: 'fri_upper_p', weekday: 'Freitag', name: 'Upper Power', exercises: ['bench_press', 'barbell_row', 'ohp', 'pull_up', 'jm_press', 'bicep_curl'] },
            { id: 'sat_lower_p', weekday: 'Samstag', name: 'Lower Power', exercises: ['squat', 'leg_press', 'leg_extension', 'rdl', 'standing_calf_raise'] },
            { id: 'sun_rest', weekday: 'Sonntag', name: 'Rest', exercises: [] }
        ]
    },
    {
        id: 'ppl_arnold',
        name: 'Arnold Split (6 Tage)',
        description: 'Fokus auf Brust & Rücken, Schultern & Arme sowie Beine.',
        days: [
            { id: 'mon_cb', weekday: 'Montag', name: 'Chest & Back', exercises: ['bench_press', 'pull_up', 'incline_dumbell_press', 'barbell_row', 'cable_fly'] },
            { id: 'tue_sa', weekday: 'Dienstag', name: 'Shoulders & Arms', exercises: ['ohp', 'lateral_raise', 'bicep_curl', 'skull_crusher', 'hammer_curl', 'tricep_pushdown'] },
            { id: 'wed_legs', weekday: 'Mittwoch', name: 'Legs', exercises: ['squat', 'rdl', 'leg_extension', 'leg_curl'] },
            { id: 'thu_rest', weekday: 'Donnerstag', name: 'Rest', exercises: [] },
            { id: 'fri_cb2', weekday: 'Freitag', name: 'Chest & Back', exercises: ['low_incline_dumbell_press', 'lat_pulldown', 'machine_shoulder_press', 'preacher_curl', 'overhead_extension'] },
            { id: 'sat_sa2', weekday: 'Samstag', name: 'Shoulders & Arms', exercises: ['ohp', 'lateral_raise', 'bicep_curl', 'hammer_curl', 'tricep_pushdown'] },
            { id: 'sun_legs2', weekday: 'Sonntag', name: 'Legs Volume', exercises: ['leg_press', 'hack_squat', 'lunge', 'leg_curl'] }
        ]
    }
];

/** Einheitliche Ruhetag-Erkennung (rest / pause / ruhetag / leer) */
export const isRestDayName = (dayName) => {
    const n = (dayName || '').toLowerCase().trim();
    return n === '' || n.includes('rest') || n.includes('pause') || n.includes('ruhetag');
};

export const getSuggestedExercisesForDayName = (dayName) => {
    const name = (dayName || '').toLowerCase().trim();
    if (!name) return [];

    const isPush = name.includes('push');
    const isPull = name.includes('pull');
    const isLegs = name.includes('leg') || name.includes('bein');
    const isUpper = name.includes('upper') || name.includes('oberkörper') || name.includes('oberkoerper');
    const isLower = name.includes('lower') || name.includes('unterkörper') || name.includes('unterkoerper');
    const isChest = name.includes('chest') || name.includes('brust');
    const isBack = name.includes('back') || name.includes('rücken') || name.includes('ruecken');
    const isShoulders = name.includes('shoulder') || name.includes('schulter');
    const isArms = name.includes('arm') || name.includes('bicep') || name.includes('tricep');
    const isAbs = name.includes('abs') || name.includes('bauch');

    // Case 1: Push Pull (Hybrid / Combo) or Chest & Back / Brust & Rücken
    if ((isPush && isPull) || (isChest && isBack)) {
        // 3 Chest + 3 Back
        return [
            'bench_press',
            'incline_dumbell_press',
            'cable_fly',
            'pull_up',
            'barbell_row',
            'lat_pulldown'
        ];
    }

    // Case 2: Shoulders & Arms / Schultern & Arme
    if (isShoulders && isArms) {
        return [
            'ohp',
            'lateral_raise',
            'bicep_curl',
            'tricep_pushdown',
            'hammer_curl',
            'skull_crusher'
        ];
    }

    // Case 3: Push
    if (isPush) {
        return [
            'bench_press',
            'ohp',
            'incline_dumbell_press',
            'lateral_raise',
            'tricep_pushdown',
            'cable_fly'
        ];
    }

    // Case 4: Pull
    if (isPull) {
        return [
            'pull_up',
            'barbell_row',
            'lat_pulldown',
            'face_pull',
            'bicep_curl',
            'hammer_curl'
        ];
    }

    // Case 5: Legs / Beine
    if (isLegs) {
        return [
            'squat',
            'rdl',
            'leg_press',
            'leg_extension',
            'leg_curl',
            'standing_calf_raise'
        ];
    }

    // Case 6: Upper / Oberkörper
    if (isUpper) {
        return [
            'bench_press',
            'barbell_row',
            'ohp',
            'pull_up',
            'bicep_curl',
            'tricep_pushdown'
        ];
    }

    // Case 7: Lower / Unterkörper
    if (isLower) {
        return [
            'squat',
            'leg_press',
            'rdl',
            'leg_extension',
            'leg_curl',
            'standing_calf_raise'
        ];
    }

    // Case 8: Chest / Brust
    if (isChest) {
        return [
            'bench_press',
            'incline_dumbell_press',
            'machine_chest_press',
            'cable_fly',
            'dip'
        ];
    }

    // Case 9: Back / Rücken
    if (isBack) {
        return [
            'pull_up',
            'barbell_row',
            'lat_pulldown',
            'cable_row',
            'face_pull'
        ];
    }

    // Case 10: Arms / Arme
    if (isArms) {
        return [
            'bicep_curl',
            'tricep_pushdown',
            'hammer_curl',
            'skull_crusher',
            'preacher_curl',
            'overhead_extension'
        ];
    }

    // Case 11: Shoulders / Schultern
    if (isShoulders) {
        return [
            'ohp',
            'lateral_raise',
            'dumbbell_shoulder_press',
            'face_pull',
            'reverse_pec_deck'
        ];
    }

    // Case 12: Abs / Bauch
    if (isAbs) {
        return [
            'hanging_leg_raise',
            'cable_crunch',
            'plank',
            'ab_wheel'
        ];
    }

    return [];
};

