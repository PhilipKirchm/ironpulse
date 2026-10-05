
export const MACHINE_MANUFACTURERS = [
    'Free Weights',
    'Technogym',
    'Gym80',
    'Panata',
    'Hammer Strength',
    'Rogue',
    'Bodycraft',
    'Life Fitness',
    'Nautilus',
    'Matrix',
    'Other'
];

export const MUSCLE_GROUPS = [
    'Chest',
    'Back',
    'Shoulders',
    'Biceps',
    'Triceps',
    'Forearms',
    'Quads',
    'Hamstrings',
    'Glutes',
    'Calves',
    'Abs',
    'Other'
];

export const EXERCISES = [
    // --- CHEST ---
    { id: 'bench_press', name: 'Barbell Bench Press', muscle: 'Chest', type: 'Compound', substitutes: ['dumbbell_press', 'machine_chest_press', 'smith_bench_press'], machines: ['Free Weights'] },
    { id: 'smith_bench_press', name: 'Smith Machine Bench Press', muscle: 'Chest', type: 'Compound', substitutes: ['bench_press'], machines: ['Technogym', 'Gym 80 Panata', 'Rogue', 'Other'] },
    { id: 'dumbbell_press', name: 'Dumbbell Bench Press', muscle: 'Chest', type: 'Compound', substitutes: ['bench_press'], machines: ['Free Weights'] },
    { id: 'incline_bench_press', name: 'Incline Barbell Press', muscle: 'Chest', type: 'Compound', substitutes: ['incline_dumbell_press', 'smith_incline_press'] },
    { id: 'smith_incline_press', name: 'Incline Smith Machine Press', muscle: 'Chest', type: 'Compound', substitutes: ['incline_bench_press'] },
    { id: 'incline_dumbell_press', name: 'Incline Dumbbell Press', muscle: 'Chest', type: 'Compound', substitutes: ['incline_bench_press', 'incline_machine_press'] },
    { id: 'low_incline_dumbell_press', name: 'Low Incline DB Press', muscle: 'Chest', type: 'Compound', substitutes: ['incline_dumbell_press'] },
    { id: 'incline_machine_press', name: 'Incline Machine Press', muscle: 'Chest', type: 'Compound', substitutes: ['incline_dumbell_press'] },
    { id: 'machine_chest_press', name: 'Machine Chest Press', muscle: 'Chest', type: 'Compound', substitutes: ['bench_press'] },
    { id: 'cable_fly', name: 'Cable Fly', muscle: 'Chest', type: 'Isolation', substitutes: ['pec_deck', 'dumbbell_fly', 'cable_cross_over'] },
    { id: 'cable_cross_over', name: 'Cable Crossover', muscle: 'Chest', type: 'Isolation', substitutes: ['cable_fly'] },
    { id: 'pec_deck', name: 'Pec Deck / Butterfly', muscle: 'Chest', type: 'Isolation', substitutes: ['cable_fly'] },
    { id: 'dumbbell_fly', name: 'Dumbbell Fly', muscle: 'Chest', type: 'Isolation', substitutes: ['cable_fly'] },
    { id: 'dip', name: 'Weighted Dip', muscle: 'Chest', type: 'Compound', substitutes: ['machine_dip'] },
    { id: 'machine_dip', name: 'Machine Dip', muscle: 'Chest', type: 'Compound', substitutes: ['dip'] },
    { id: 'landmine_press', name: 'Landmine Press', muscle: 'Chest', type: 'Compound', substitutes: ['incline_dumbell_press'] },

    // --- BACK ---
    { id: 'pull_up', name: 'Pull Up', muscle: 'Back', type: 'Compound', substitutes: ['lat_pulldown', 'assisted_pull_up'] },
    { id: 'assisted_pull_up', name: 'Assisted Pull Up', muscle: 'Back', type: 'Compound', substitutes: ['pull_up'] },
    { id: 'toes_to_bar_pull_up', name: 'Pull Up (Weighted)', muscle: 'Back', type: 'Compound', substitutes: ['pull_up'] },
    { id: 'chin_up', name: 'Chin Up', muscle: 'Back', type: 'Compound', substitutes: ['pull_up'] },
    { id: 'lat_pulldown', name: 'Lat Pulldown (Wide)', muscle: 'Back', type: 'Compound', substitutes: ['pull_up', 'v_grip_pulldown'] },
    { id: 'v_grip_pulldown', name: 'Neutral Grip Pulldown', muscle: 'Back', type: 'Compound', substitutes: ['lat_pulldown'] },
    { id: 'reverse_grip_pulldown', name: 'Reverse Grip Pulldown', muscle: 'Back', type: 'Compound', substitutes: ['lat_pulldown'] },
    { id: 'barbell_row', name: 'Barbell Row', muscle: 'Back', type: 'Compound', substitutes: ['dumbbell_row', 'machine_row', 'smith_row'] },
    { id: 'smith_row', name: 'Smith Machine Row', muscle: 'Back', type: 'Compound', substitutes: ['barbell_row'] },
    { id: 'dumbbell_row', name: 'Dumbbell Row', muscle: 'Back', type: 'Compound', substitutes: ['barbell_row', 'meadows_row'] },
    { id: 'meadows_row', name: 'Meadows Row', muscle: 'Back', type: 'Compound', substitutes: ['dumbbell_row'] },
    { id: 't_bar_row', name: 'T-Bar Row', muscle: 'Back', type: 'Compound', substitutes: ['barbell_row'] },
    { id: 'chest_supported_t_bar', name: 'Chest Supported T-Bar Row', muscle: 'Back', type: 'Compound', substitutes: ['barbell_row'] },
    { id: 'cable_row', name: 'Seated Cable Row', muscle: 'Back', type: 'Compound', substitutes: ['machine_row'] },
    { id: 'machine_row', name: 'Chest Supported Row', muscle: 'Back', type: 'Compound', substitutes: ['dumbbell_row'] },
    { id: 'lat_prayer', name: 'Cable Lat Prayer / Pullover', muscle: 'Back', type: 'Isolation', substitutes: ['dumbbell_pullover'] },
    { id: 'dumbbell_pullover', name: 'Dumbbell Pullover', muscle: 'Back', type: 'Isolation', substitutes: ['lat_prayer'] },
    { id: 'face_pull', name: 'Face Pull', muscle: 'Shoulders', type: 'Isolation', substitutes: ['reverse_pec_deck'] },
    { id: 'reverse_pec_deck', name: 'Reverse Pec Deck', muscle: 'Shoulders', type: 'Isolation', substitutes: ['face_pull'] },
    { id: 'shrugs', name: 'Dumbbell Shrugs', muscle: 'Back', type: 'Isolation', substitutes: ['barbell_shrugs', 'smith_shrugs'] },
    { id: 'smith_shrugs', name: 'Smith Machine Shrug', muscle: 'Back', type: 'Isolation', substitutes: ['shrugs'] },

    // --- LEGS (QUADS) ---
    { id: 'squat', name: 'Barbell Squat', muscle: 'Quads', type: 'Compound', substitutes: ['hack_squat', 'spider_bar_squat', 'smith_squat'] },
    { id: 'smith_squat', name: 'Smith Machine Squat', muscle: 'Quads', type: 'Compound', substitutes: ['squat'] },
    { id: 'front_squat', name: 'Front Squat', muscle: 'Quads', type: 'Compound', substitutes: ['squat'] },
    { id: 'hack_squat', name: 'Hack Squat', muscle: 'Quads', type: 'Compound', substitutes: ['leg_press', 'pendulum_squat'] },
    { id: 'pendulum_squat', name: 'Pendulum Squat', muscle: 'Quads', type: 'Compound', substitutes: ['hack_squat'] },
    { id: 'leg_press', name: 'Leg Press', muscle: 'Quads', type: 'Compound', substitutes: ['hack_squat'] },
    { id: 'leg_extension', name: 'Leg Extension', muscle: 'Quads', type: 'Isolation', substitutes: [] },
    { id: 'bulgarian_split_squat', name: 'Bulgarian Split Squat', muscle: 'Quads', type: 'Compound', substitutes: ['lunge', 'step_up'] },
    { id: 'lunge', name: 'Walking Lunge', muscle: 'Quads', type: 'Compound', substitutes: ['bulgarian_split_squat'] },
    { id: 'goblet_squat', name: 'Goblet Squat', muscle: 'Quads', type: 'Compound', substitutes: ['hack_squat'] },
    { id: 'step_up', name: 'Step Up', muscle: 'Quads', type: 'Compound', substitutes: ['lunge'] },
    { id: 'sissy_squat', name: 'Sissy Squat', muscle: 'Quads', type: 'Isolation', substitutes: ['leg_extension'] },

    // --- LEGS (HAMSTRINGS/GLUTES) ---
    { id: 'deadlift', name: 'Deadlift (Conventional)', muscle: 'Hamstrings', type: 'Compound', substitutes: ['sumo_deadlift', 'trap_bar_deadlift'] },
    { id: 'sumo_deadlift', name: 'Sumo Deadlift', muscle: 'Hamstrings', type: 'Compound', substitutes: ['deadlift'] },
    { id: 'trap_bar_deadlift', name: 'Trap Bar Deadlift', muscle: 'Hamstrings', type: 'Compound', substitutes: ['deadlift'] },
    { id: 'rdl', name: 'Romanian Deadlift', muscle: 'Hamstrings', type: 'Compound', substitutes: ['stiff_leg_deadlift', 'good_morning', 'dumbbell_rdl'] },
    { id: 'dumbbell_rdl', name: 'Dumbbell RDL', muscle: 'Hamstrings', type: 'Compound', substitutes: ['rdl'] },
    { id: 'stiff_leg_deadlift', name: 'Stiff Leg Deadlift', muscle: 'Hamstrings', type: 'Compound', substitutes: ['rdl'] },
    { id: 'good_morning', name: 'Good Morning', muscle: 'Hamstrings', type: 'Compound', substitutes: ['rdl'] },
    { id: 'leg_curl', name: 'Lying Leg Curl', muscle: 'Hamstrings', type: 'Isolation', substitutes: ['seated_leg_curl'] },
    { id: 'seated_leg_curl', name: 'Seated Leg Curl', muscle: 'Hamstrings', type: 'Isolation', substitutes: ['leg_curl'] },
    { id: 'hip_thrust', name: 'Hip Thrust', muscle: 'Glutes', type: 'Compound', substitutes: ['glute_bridge', 'kas_glute_bridge'] },
    { id: 'kas_glute_bridge', name: 'KAS Glute Bridge', muscle: 'Glutes', type: 'Compound', substitutes: ['hip_thrust'] },
    { id: 'glute_bridge', name: 'Glute Bridge', muscle: 'Glutes', type: 'Compound', substitutes: ['hip_thrust'] },
    { id: 'cable_kickback', name: 'Glute Kickback', muscle: 'Glutes', type: 'Isolation', substitutes: [] },
    { id: 'hyperextension', name: 'Hyperextension (45 Degree)', muscle: 'Hamstrings', type: 'Isolation', substitutes: [] },

    // --- CALVES ---
    { id: 'standing_calf_raise', name: 'Standing Calf Raise', muscle: 'Calves', type: 'Isolation', substitutes: ['seated_calf_raise', 'smith_calf_raise'] },
    { id: 'smith_calf_raise', name: 'Smith Machine Calf Raise', muscle: 'Calves', type: 'Isolation', substitutes: ['standing_calf_raise'] },
    { id: 'seated_calf_raise', name: 'Seated Calf Raise', muscle: 'Calves', type: 'Isolation', substitutes: ['standing_calf_raise'] },
    { id: 'leg_press_calf_raise', name: 'Leg Press Calf Raise', muscle: 'Calves', type: 'Isolation', substitutes: ['standing_calf_raise'] },

    // --- SHOULDERS ---
    { id: 'ohp', name: 'Overhead Press (Barbell)', muscle: 'Shoulders', type: 'Compound', substitutes: ['dumbbell_shoulder_press', 'machine_shoulder_press', 'smith_shoulder_press'] },
    { id: 'smith_shoulder_press', name: 'Smith Machine Shoulder Press', muscle: 'Shoulders', type: 'Compound', substitutes: ['ohp'] },
    { id: 'dumbbell_shoulder_press', name: 'Dumbbell Shoulder Press', muscle: 'Shoulders', type: 'Compound', substitutes: ['ohp'] },
    { id: 'arnold_press', name: 'Arnold Press', muscle: 'Shoulders', type: 'Compound', substitutes: ['dumbbell_shoulder_press'] },
    { id: 'machine_shoulder_press', name: 'Machine Shoulder Press', muscle: 'Shoulders', type: 'Compound', substitutes: ['dumbbell_shoulder_press'] },
    { id: 'lateral_raise', name: 'Dumbbell Lateral Raise', muscle: 'Shoulders', type: 'Isolation', substitutes: ['cable_lateral_raise', 'machine_lateral_raise'] },
    { id: 'cable_lateral_raise', name: 'Cable Lateral Raise', muscle: 'Shoulders', type: 'Isolation', substitutes: ['lateral_raise'] },
    { id: 'machine_lateral_raise', name: 'Machine Lateral Raise', muscle: 'Shoulders', type: 'Isolation', substitutes: ['lateral_raise'] },
    { id: 'egyptian_lateral_raise', name: 'Egyptian Lateral Raise', muscle: 'Shoulders', type: 'Isolation', substitutes: ['cable_lateral_raise'] },
    { id: 'rear_delt_fly', name: 'Dumbbell Rear Delt Fly', muscle: 'Shoulders', type: 'Isolation', substitutes: ['reverse_pec_deck'] },

    // --- ARMS (BICEPS) ---
    { id: 'bicep_curl', name: 'Barbell Curl', muscle: 'Biceps', type: 'Isolation', substitutes: ['dumbbell_curl', 'cable_curl'] },
    { id: 'dumbbell_curl', name: 'Dumbbell Curl', muscle: 'Biceps', type: 'Isolation', substitutes: ['bicep_curl'] },
    { id: 'cable_curl', name: 'Cable Curl', muscle: 'Biceps', type: 'Isolation', substitutes: ['bicep_curl'] },
    { id: 'ez_bar_curl', name: 'EZ Bar Curl', muscle: 'Biceps', type: 'Isolation', substitutes: ['bicep_curl'] },
    { id: 'hammer_curl', name: 'Hammer Curl', muscle: 'Biceps', type: 'Isolation', substitutes: ['rope_curl'] },
    { id: 'rope_curl', name: 'Rope Hammer Curl', muscle: 'Biceps', type: 'Isolation', substitutes: ['hammer_curl'] },
    { id: 'preacher_curl', name: 'Preacher Curl', muscle: 'Biceps', type: 'Isolation', substitutes: ['machine_curl'] },
    { id: 'machine_curl', name: 'Machine Bicep Curl', muscle: 'Biceps', type: 'Isolation', substitutes: ['preacher_curl'] },
    { id: 'incline_curl', name: 'Incline Dumbbell Curl', muscle: 'Biceps', type: 'Isolation', substitutes: ['bayesian_curl'] },
    { id: 'bayesian_curl', name: 'Bayesian Cable Curl', muscle: 'Biceps', type: 'Isolation', substitutes: ['incline_curl'] },

    // --- ARMS (TRICEPS) ---
    { id: 'tricep_pushdown', name: 'Tricep Pushdown (Bar)', muscle: 'Triceps', type: 'Isolation', substitutes: ['rope_pushdown', 'v_bar_pushdown'] },
    { id: 'v_bar_pushdown', name: 'V-Bar Pushdown', muscle: 'Triceps', type: 'Isolation', substitutes: ['tricep_pushdown'] },
    { id: 'rope_pushdown', name: 'Tricep Pushdown (Rope)', muscle: 'Triceps', type: 'Isolation', substitutes: ['tricep_pushdown'] },
    { id: 'skull_crusher', name: 'Skull Crusher', muscle: 'Triceps', type: 'Isolation', substitutes: ['overhead_extension', 'jm_press'] },
    { id: 'overhead_extension', name: 'Overhead Extension (DB)', muscle: 'Triceps', type: 'Isolation', substitutes: ['cable_overhead_extension'] },
    { id: 'cable_overhead_extension', name: 'Cable Overhead Extension', muscle: 'Triceps', type: 'Isolation', substitutes: ['overhead_extension'] },
    { id: 'close_grip_bench', name: 'Close Grip Bench Press', muscle: 'Triceps', type: 'Compound', substitutes: ['dip', 'smith_close_grip'] },
    { id: 'smith_close_grip', name: 'Smith Machine Close Grip', muscle: 'Triceps', type: 'Compound', substitutes: ['close_grip_bench'] },
    { id: 'jm_press', name: 'JM Press', muscle: 'Triceps', type: 'Compound', substitutes: ['close_grip_bench'] },

    // --- ABS ---
    { id: 'hanging_leg_raise', name: 'Hanging Leg Raise', muscle: 'Abs', type: 'Isolation', substitutes: ['captain_chair_raise', 'crunch'] },
    { id: 'captain_chair_raise', name: 'Captain\'s Chair Raise', muscle: 'Abs', type: 'Isolation', substitutes: ['hanging_leg_raise'] },
    { id: 'cable_crunch', name: 'Cable Crunch', muscle: 'Abs', type: 'Isolation', substitutes: ['plank'] },
    { id: 'plank', name: 'Plank', muscle: 'Abs', type: 'Isolation', substitutes: ['ab_wheel'] },
    { id: 'ab_wheel', name: 'Ab Wheel', muscle: 'Abs', type: 'Isolation', substitutes: ['plank'] },
    { id: 'russian_twist', name: 'Russian Twist', muscle: 'Abs', type: 'Isolation', substitutes: [] }
];

export const getExerciseById = (id) => EXERCISES.find(e => e.id === id);
