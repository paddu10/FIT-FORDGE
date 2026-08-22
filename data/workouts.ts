// ──────────────────────────────────────────────
// FIT-FORDGE  —  Comprehensive Workout Data
// ──────────────────────────────────────────────
// Each exercise is tagged with:
//   mode       → 'home' (bodyweight / calisthenics) or 'gym' (equipment)
//   category   → muscle group
//   difficulty → 'beginner' | 'intermediate' | 'advanced'
//   bmiRange   → which BMI categories this exercise is recommended for
// ──────────────────────────────────────────────

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type WorkoutMode = 'home' | 'gym';
export type MuscleCategory = 'abs' | 'back' | 'chest' | 'shoulders' | 'legs' | 'arms';
export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  sets: number;
  reps: string;       // e.g. "12" or "30s" for timed exercises
  restSeconds: number;
  difficulty: Difficulty;
  mode: WorkoutMode;
  category: MuscleCategory;
  bmiRange: BmiCategory[];
  icon: string;        // emoji
}

export function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return 'underweight';
  if (bmi <= 24.9) return 'normal';
  if (bmi <= 29.9) return 'overweight';
  return 'obese';
}

export const CATEGORY_META: Record<MuscleCategory, { label: string; icon: string; color: string }> = {
  abs:       { label: 'Abs & Core',  icon: '🔥', color: '#FF6B35' },
  chest:     { label: 'Chest',       icon: '🏋️', color: '#4ECDC4' },
  back:      { label: 'Back',        icon: '🦅', color: '#45B7D1' },
  shoulders: { label: 'Shoulders',   icon: '💪', color: '#96CEB4' },
  legs:      { label: 'Legs',        icon: '🦵', color: '#DDA0DD' },
  arms:      { label: 'Arms',        icon: '💥', color: '#FFD93D' },
};

// ────────────────────────────
//  HOME  (calisthenics)
// ────────────────────────────

const homeExercises: Exercise[] = [
  // ── ABS ──
  { id: 'h-abs-1',  name: 'Crunches',              description: 'Lie on your back, knees bent, lift shoulders off the floor.',                 sets: 3, reps: '15',  restSeconds: 30, difficulty: 'beginner',     mode: 'home', category: 'abs', bmiRange: ['underweight','normal','overweight','obese'], icon: '🔥' },
  { id: 'h-abs-2',  name: 'Bicycle Crunches',       description: 'Alternate elbow-to-opposite-knee in a pedalling motion.',                     sets: 3, reps: '20',  restSeconds: 30, difficulty: 'beginner',     mode: 'home', category: 'abs', bmiRange: ['underweight','normal','overweight'], icon: '🚴' },
  { id: 'h-abs-3',  name: 'Mountain Climbers',       description: 'Drive knees to chest alternately in a plank position.',                       sets: 3, reps: '30s', restSeconds: 30, difficulty: 'intermediate', mode: 'home', category: 'abs', bmiRange: ['underweight','normal','overweight'], icon: '⛰️' },
  { id: 'h-abs-4',  name: 'Plank Hold',              description: 'Hold a forearm plank with a straight body line.',                             sets: 3, reps: '45s', restSeconds: 30, difficulty: 'beginner',     mode: 'home', category: 'abs', bmiRange: ['underweight','normal','overweight','obese'], icon: '🧱' },
  { id: 'h-abs-5',  name: 'Leg Raises',              description: 'Lie flat and raise straight legs to 90° then lower slowly.',                  sets: 3, reps: '12',  restSeconds: 30, difficulty: 'intermediate', mode: 'home', category: 'abs', bmiRange: ['underweight','normal','overweight'], icon: '🦵' },
  { id: 'h-abs-6',  name: 'Flutter Kicks',           description: 'Lie flat and alternate small kicks keeping legs straight.',                    sets: 3, reps: '30s', restSeconds: 30, difficulty: 'beginner',     mode: 'home', category: 'abs', bmiRange: ['underweight','normal','overweight','obese'], icon: '🌊' },
  { id: 'h-abs-7',  name: 'V-Ups',                   description: 'Simultaneously lift legs and torso to touch toes at the top.',                sets: 3, reps: '10',  restSeconds: 45, difficulty: 'advanced',     mode: 'home', category: 'abs', bmiRange: ['underweight','normal'], icon: '✌️' },
  { id: 'h-abs-8',  name: 'Dead Bug',                description: 'Lie on back, extend opposite arm/leg while keeping core braced.',             sets: 3, reps: '10',  restSeconds: 30, difficulty: 'beginner',     mode: 'home', category: 'abs', bmiRange: ['underweight','normal','overweight','obese'], icon: '🐛' },

  // ── CHEST ──
  { id: 'h-chest-1', name: 'Push-Ups',               description: 'Classic push-up with hands shoulder-width apart.',                            sets: 3, reps: '15',  restSeconds: 45, difficulty: 'beginner',     mode: 'home', category: 'chest', bmiRange: ['underweight','normal','overweight'], icon: '💪' },
  { id: 'h-chest-2', name: 'Wide Push-Ups',           description: 'Hands wider than shoulders to target outer chest.',                           sets: 3, reps: '12',  restSeconds: 45, difficulty: 'intermediate', mode: 'home', category: 'chest', bmiRange: ['underweight','normal','overweight'], icon: '🦅' },
  { id: 'h-chest-3', name: 'Diamond Push-Ups',        description: 'Hands together under chest forming a diamond shape.',                         sets: 3, reps: '10',  restSeconds: 45, difficulty: 'advanced',     mode: 'home', category: 'chest', bmiRange: ['underweight','normal'], icon: '💎' },
  { id: 'h-chest-4', name: 'Decline Push-Ups',        description: 'Feet elevated on a chair to increase upper chest activation.',                sets: 3, reps: '10',  restSeconds: 45, difficulty: 'intermediate', mode: 'home', category: 'chest', bmiRange: ['underweight','normal','overweight'], icon: '📐' },
  { id: 'h-chest-5', name: 'Knee Push-Ups',           description: 'Modified push-up from your knees for beginners.',                             sets: 3, reps: '15',  restSeconds: 30, difficulty: 'beginner',     mode: 'home', category: 'chest', bmiRange: ['underweight','normal','overweight','obese'], icon: '🙏' },
  { id: 'h-chest-6', name: 'Archer Push-Ups',         description: 'Shift weight side to side while pushing up.',                                 sets: 3, reps: '8',   restSeconds: 60, difficulty: 'advanced',     mode: 'home', category: 'chest', bmiRange: ['underweight','normal'], icon: '🏹' },
  { id: 'h-chest-7', name: 'Explosive Push-Ups',      description: 'Push off the ground explosively so hands leave the floor.',                   sets: 3, reps: '8',   restSeconds: 60, difficulty: 'advanced',     mode: 'home', category: 'chest', bmiRange: ['underweight','normal'], icon: '🚀' },

  // ── BACK ──
  { id: 'h-back-1', name: 'Superman Hold',           description: 'Lie face down and lift arms and legs off the ground.',                        sets: 3, reps: '30s', restSeconds: 30, difficulty: 'beginner',     mode: 'home', category: 'back', bmiRange: ['underweight','normal','overweight','obese'], icon: '🦸' },
  { id: 'h-back-2', name: 'Reverse Snow Angels',     description: 'Lie face down and sweep arms from hips to overhead.',                         sets: 3, reps: '12',  restSeconds: 30, difficulty: 'beginner',     mode: 'home', category: 'back', bmiRange: ['underweight','normal','overweight','obese'], icon: '👼' },
  { id: 'h-back-3', name: 'Good Mornings',           description: 'Stand, hands behind head, hinge at hips keeping back straight.',              sets: 3, reps: '15',  restSeconds: 30, difficulty: 'beginner',     mode: 'home', category: 'back', bmiRange: ['underweight','normal','overweight','obese'], icon: '🌅' },
  { id: 'h-back-4', name: 'Prone Y Raises',          description: 'Lie face down and lift arms into a Y position.',                              sets: 3, reps: '12',  restSeconds: 30, difficulty: 'intermediate', mode: 'home', category: 'back', bmiRange: ['underweight','normal','overweight'], icon: '🙌' },
  { id: 'h-back-5', name: 'Door Frame Rows',         description: 'Hold a door frame and lean back, then pull yourself in.',                     sets: 3, reps: '12',  restSeconds: 45, difficulty: 'intermediate', mode: 'home', category: 'back', bmiRange: ['underweight','normal','overweight'], icon: '🚪' },
  { id: 'h-back-6', name: 'Pull-Ups (if bar available)', description: 'Hang from a bar and pull chin above it.',                                sets: 3, reps: '8',   restSeconds: 60, difficulty: 'advanced',     mode: 'home', category: 'back', bmiRange: ['underweight','normal'], icon: '🏋️' },

  // ── SHOULDERS ──
  { id: 'h-shldr-1', name: 'Pike Push-Ups',          description: 'Push-up with hips high in an inverted V to target shoulders.',                sets: 3, reps: '10',  restSeconds: 45, difficulty: 'intermediate', mode: 'home', category: 'shoulders', bmiRange: ['underweight','normal','overweight'], icon: '🔺' },
  { id: 'h-shldr-2', name: 'Arm Circles',            description: 'Extend arms out and make small circles, building to larger ones.',            sets: 3, reps: '30s', restSeconds: 20, difficulty: 'beginner',     mode: 'home', category: 'shoulders', bmiRange: ['underweight','normal','overweight','obese'], icon: '🔄' },
  { id: 'h-shldr-3', name: 'Wall Push-Ups',          description: 'Push-up against a wall for a lighter shoulder press alternative.',            sets: 3, reps: '15',  restSeconds: 30, difficulty: 'beginner',     mode: 'home', category: 'shoulders', bmiRange: ['underweight','normal','overweight','obese'], icon: '🧱' },
  { id: 'h-shldr-4', name: 'Plank Shoulder Taps',    description: 'In a plank, tap opposite shoulder alternately.',                              sets: 3, reps: '20',  restSeconds: 30, difficulty: 'intermediate', mode: 'home', category: 'shoulders', bmiRange: ['underweight','normal','overweight'], icon: '👋' },
  { id: 'h-shldr-5', name: 'Handstand Wall Hold',    description: 'Kick up into a handstand against a wall and hold.',                           sets: 3, reps: '20s', restSeconds: 60, difficulty: 'advanced',     mode: 'home', category: 'shoulders', bmiRange: ['underweight','normal'], icon: '🤸' },
  { id: 'h-shldr-6', name: 'YTW Raises',             description: 'Lie face down, raise arms in Y, T, then W patterns.',                        sets: 3, reps: '10',  restSeconds: 30, difficulty: 'beginner',     mode: 'home', category: 'shoulders', bmiRange: ['underweight','normal','overweight','obese'], icon: '✋' },

  // ── LEGS ──
  { id: 'h-legs-1', name: 'Bodyweight Squats',       description: 'Stand shoulder-width, squat until thighs are parallel.',                     sets: 3, reps: '15',  restSeconds: 30, difficulty: 'beginner',     mode: 'home', category: 'legs', bmiRange: ['underweight','normal','overweight','obese'], icon: '🏋️' },
  { id: 'h-legs-2', name: 'Lunges',                  description: 'Step forward and lower until both knees are at 90°.',                        sets: 3, reps: '12',  restSeconds: 30, difficulty: 'beginner',     mode: 'home', category: 'legs', bmiRange: ['underweight','normal','overweight','obese'], icon: '🚶' },
  { id: 'h-legs-3', name: 'Jump Squats',             description: 'Squat down then explode upward into a jump.',                                sets: 3, reps: '10',  restSeconds: 45, difficulty: 'intermediate', mode: 'home', category: 'legs', bmiRange: ['underweight','normal'], icon: '🐸' },
  { id: 'h-legs-4', name: 'Wall Sit',                description: 'Lean against a wall with knees at 90° and hold.',                            sets: 3, reps: '45s', restSeconds: 30, difficulty: 'beginner',     mode: 'home', category: 'legs', bmiRange: ['underweight','normal','overweight','obese'], icon: '🧱' },
  { id: 'h-legs-5', name: 'Calf Raises',             description: 'Rise onto your toes then lower back down slowly.',                           sets: 3, reps: '20',  restSeconds: 20, difficulty: 'beginner',     mode: 'home', category: 'legs', bmiRange: ['underweight','normal','overweight','obese'], icon: '⬆️' },
  { id: 'h-legs-6', name: 'Bulgarian Split Squats',  description: 'Rear foot on a chair, squat on the front leg.',                              sets: 3, reps: '10',  restSeconds: 45, difficulty: 'intermediate', mode: 'home', category: 'legs', bmiRange: ['underweight','normal','overweight'], icon: '🇧🇬' },
  { id: 'h-legs-7', name: 'Glute Bridges',           description: 'Lie on back, push hips up squeezing glutes at the top.',                     sets: 3, reps: '15',  restSeconds: 30, difficulty: 'beginner',     mode: 'home', category: 'legs', bmiRange: ['underweight','normal','overweight','obese'], icon: '🌉' },
  { id: 'h-legs-8', name: 'Pistol Squats',           description: 'Single-leg squat with the other leg extended forward.',                      sets: 3, reps: '5',   restSeconds: 60, difficulty: 'advanced',     mode: 'home', category: 'legs', bmiRange: ['underweight','normal'], icon: '🔫' },

  // ── ARMS ──
  { id: 'h-arms-1', name: 'Tricep Dips (Chair)',     description: 'Hands on a chair behind you, lower and press back up.',                      sets: 3, reps: '12',  restSeconds: 30, difficulty: 'beginner',     mode: 'home', category: 'arms', bmiRange: ['underweight','normal','overweight','obese'], icon: '🪑' },
  { id: 'h-arms-2', name: 'Close-Grip Push-Ups',     description: 'Push-ups with hands close together to target triceps.',                      sets: 3, reps: '12',  restSeconds: 45, difficulty: 'intermediate', mode: 'home', category: 'arms', bmiRange: ['underweight','normal','overweight'], icon: '🤏' },
  { id: 'h-arms-3', name: 'Chin-Ups (if bar)',       description: 'Underhand grip pull-ups to target biceps.',                                  sets: 3, reps: '8',   restSeconds: 60, difficulty: 'advanced',     mode: 'home', category: 'arms', bmiRange: ['underweight','normal'], icon: '🏋️' },
  { id: 'h-arms-4', name: 'Plank Up-Downs',          description: 'From forearm plank, push up to hands and back down.',                        sets: 3, reps: '10',  restSeconds: 30, difficulty: 'intermediate', mode: 'home', category: 'arms', bmiRange: ['underweight','normal','overweight'], icon: '🔼' },
  { id: 'h-arms-5', name: 'Isometric Bicep Hold',    description: 'Push palms up under a table and hold the contraction.',                      sets: 3, reps: '20s', restSeconds: 30, difficulty: 'beginner',     mode: 'home', category: 'arms', bmiRange: ['underweight','normal','overweight','obese'], icon: '💪' },
  { id: 'h-arms-6', name: 'Towel Curls',             description: 'Step on a towel and curl upward against resistance.',                        sets: 3, reps: '15',  restSeconds: 30, difficulty: 'beginner',     mode: 'home', category: 'arms', bmiRange: ['underweight','normal','overweight','obese'], icon: '🧻' },
];

// ────────────────────────────
//  GYM  (equipment)
// ────────────────────────────

const gymExercises: Exercise[] = [
  // ── ABS ──
  { id: 'g-abs-1', name: 'Cable Crunches',          description: 'Kneel at a cable machine and crunch downward against resistance.',           sets: 3, reps: '15',  restSeconds: 30, difficulty: 'intermediate', mode: 'gym', category: 'abs', bmiRange: ['underweight','normal','overweight'], icon: '🔥' },
  { id: 'g-abs-2', name: 'Hanging Leg Raises',      description: 'Hang from a bar and raise legs to 90°.',                                    sets: 3, reps: '12',  restSeconds: 45, difficulty: 'intermediate', mode: 'gym', category: 'abs', bmiRange: ['underweight','normal','overweight'], icon: '🦵' },
  { id: 'g-abs-3', name: 'Ab Wheel Rollout',        description: 'Kneel and roll the wheel forward, extending your body.',                    sets: 3, reps: '10',  restSeconds: 45, difficulty: 'advanced',     mode: 'gym', category: 'abs', bmiRange: ['underweight','normal'], icon: '🎡' },
  { id: 'g-abs-4', name: 'Decline Sit-Ups',         description: 'Sit-ups on a decline bench for added resistance.',                          sets: 3, reps: '15',  restSeconds: 30, difficulty: 'intermediate', mode: 'gym', category: 'abs', bmiRange: ['underweight','normal','overweight'], icon: '📐' },
  { id: 'g-abs-5', name: 'Machine Crunches',        description: 'Use the ab crunch machine with controlled movement.',                       sets: 3, reps: '15',  restSeconds: 30, difficulty: 'beginner',     mode: 'gym', category: 'abs', bmiRange: ['underweight','normal','overweight','obese'], icon: '⚙️' },
  { id: 'g-abs-6', name: 'Pallof Press',            description: 'Stand perpendicular to cable, press handles forward resisting rotation.',   sets: 3, reps: '12',  restSeconds: 30, difficulty: 'intermediate', mode: 'gym', category: 'abs', bmiRange: ['underweight','normal','overweight','obese'], icon: '🎯' },

  // ── CHEST ──
  { id: 'g-chest-1', name: 'Flat Barbell Bench Press',   description: 'Lie flat on bench, press bar from chest to lockout.',                   sets: 4, reps: '10',  restSeconds: 90, difficulty: 'intermediate', mode: 'gym', category: 'chest', bmiRange: ['underweight','normal','overweight'], icon: '🏋️' },
  { id: 'g-chest-2', name: 'Incline Dumbbell Press',     description: 'Press dumbbells on an incline bench for upper chest.',                   sets: 3, reps: '12',  restSeconds: 60, difficulty: 'intermediate', mode: 'gym', category: 'chest', bmiRange: ['underweight','normal','overweight'], icon: '📐' },
  { id: 'g-chest-3', name: 'Cable Flyes',                description: 'Stand between cables and bring handles together in an arc.',             sets: 3, reps: '15',  restSeconds: 45, difficulty: 'beginner',     mode: 'gym', category: 'chest', bmiRange: ['underweight','normal','overweight','obese'], icon: '🦋' },
  { id: 'g-chest-4', name: 'Chest Press Machine',        description: 'Seated machine press for controlled chest work.',                        sets: 3, reps: '12',  restSeconds: 45, difficulty: 'beginner',     mode: 'gym', category: 'chest', bmiRange: ['underweight','normal','overweight','obese'], icon: '⚙️' },
  { id: 'g-chest-5', name: 'Dumbbell Flyes',             description: 'Lie flat, lower dumbbells in a wide arc then squeeze together.',          sets: 3, reps: '12',  restSeconds: 45, difficulty: 'intermediate', mode: 'gym', category: 'chest', bmiRange: ['underweight','normal','overweight'], icon: '🦅' },
  { id: 'g-chest-6', name: 'Decline Bench Press',        description: 'Press on a decline bench for lower chest emphasis.',                     sets: 3, reps: '10',  restSeconds: 60, difficulty: 'intermediate', mode: 'gym', category: 'chest', bmiRange: ['underweight','normal','overweight'], icon: '⬇️' },
  { id: 'g-chest-7', name: 'Pec Deck Machine',           description: 'Seated fly machine focusing on chest squeeze.',                          sets: 3, reps: '15',  restSeconds: 30, difficulty: 'beginner',     mode: 'gym', category: 'chest', bmiRange: ['underweight','normal','overweight','obese'], icon: '🤝' },

  // ── BACK ──
  { id: 'g-back-1', name: 'Lat Pulldown',            description: 'Pull the bar down to chest level, squeezing lats.',                        sets: 3, reps: '12',  restSeconds: 45, difficulty: 'beginner',     mode: 'gym', category: 'back', bmiRange: ['underweight','normal','overweight','obese'], icon: '⬇️' },
  { id: 'g-back-2', name: 'Barbell Rows',            description: 'Hinge forward and row barbell to lower chest.',                            sets: 4, reps: '10',  restSeconds: 60, difficulty: 'intermediate', mode: 'gym', category: 'back', bmiRange: ['underweight','normal','overweight'], icon: '🚣' },
  { id: 'g-back-3', name: 'Seated Cable Row',        description: 'Sit at the cable row machine and pull handle to torso.',                   sets: 3, reps: '12',  restSeconds: 45, difficulty: 'beginner',     mode: 'gym', category: 'back', bmiRange: ['underweight','normal','overweight','obese'], icon: '🎣' },
  { id: 'g-back-4', name: 'Deadlift',                description: 'Lift the barbell from the floor using hip hinge mechanics.',               sets: 4, reps: '8',   restSeconds: 120,difficulty: 'advanced',     mode: 'gym', category: 'back', bmiRange: ['underweight','normal'], icon: '🏋️' },
  { id: 'g-back-5', name: 'T-Bar Row',               description: 'Straddle the T-bar and row to chest.',                                    sets: 3, reps: '10',  restSeconds: 60, difficulty: 'intermediate', mode: 'gym', category: 'back', bmiRange: ['underweight','normal','overweight'], icon: '🔩' },
  { id: 'g-back-6', name: 'Face Pulls',              description: 'Pull rope attachment to face level, squeezing rear delts.',               sets: 3, reps: '15',  restSeconds: 30, difficulty: 'beginner',     mode: 'gym', category: 'back', bmiRange: ['underweight','normal','overweight','obese'], icon: '🎯' },
  { id: 'g-back-7', name: 'Single-Arm Dumbbell Row', description: 'One arm on bench, row dumbbell to hip.',                                  sets: 3, reps: '12',  restSeconds: 45, difficulty: 'intermediate', mode: 'gym', category: 'back', bmiRange: ['underweight','normal','overweight'], icon: '💪' },

  // ── SHOULDERS ──
  { id: 'g-shldr-1', name: 'Overhead Press',         description: 'Press the barbell overhead from shoulder level.',                           sets: 4, reps: '10',  restSeconds: 60, difficulty: 'intermediate', mode: 'gym', category: 'shoulders', bmiRange: ['underweight','normal','overweight'], icon: '⬆️' },
  { id: 'g-shldr-2', name: 'Lateral Raises',         description: 'Raise dumbbells out to the sides to shoulder height.',                     sets: 3, reps: '15',  restSeconds: 30, difficulty: 'beginner',     mode: 'gym', category: 'shoulders', bmiRange: ['underweight','normal','overweight','obese'], icon: '🦅' },
  { id: 'g-shldr-3', name: 'Front Raises',           description: 'Raise dumbbells forward to shoulder height.',                              sets: 3, reps: '12',  restSeconds: 30, difficulty: 'beginner',     mode: 'gym', category: 'shoulders', bmiRange: ['underweight','normal','overweight','obese'], icon: '🙌' },
  { id: 'g-shldr-4', name: 'Arnold Press',           description: 'Rotate dumbbells from front to lateral during the press.',                 sets: 3, reps: '10',  restSeconds: 60, difficulty: 'intermediate', mode: 'gym', category: 'shoulders', bmiRange: ['underweight','normal','overweight'], icon: '🔄' },
  { id: 'g-shldr-5', name: 'Reverse Pec Deck',      description: 'Face the machine and open arms backward for rear delts.',                  sets: 3, reps: '15',  restSeconds: 30, difficulty: 'beginner',     mode: 'gym', category: 'shoulders', bmiRange: ['underweight','normal','overweight','obese'], icon: '🔙' },
  { id: 'g-shldr-6', name: 'Upright Rows',           description: 'Pull barbell or dumbbells straight up close to your body.',                sets: 3, reps: '12',  restSeconds: 45, difficulty: 'intermediate', mode: 'gym', category: 'shoulders', bmiRange: ['underweight','normal','overweight'], icon: '⬆️' },
  { id: 'g-shldr-7', name: 'Machine Shoulder Press',  description: 'Seated machine press for controlled shoulder work.',                       sets: 3, reps: '12',  restSeconds: 45, difficulty: 'beginner',     mode: 'gym', category: 'shoulders', bmiRange: ['underweight','normal','overweight','obese'], icon: '⚙️' },

  // ── LEGS ──
  { id: 'g-legs-1', name: 'Barbell Squats',          description: 'Bar on upper back, squat to parallel or below.',                          sets: 4, reps: '10',  restSeconds: 90, difficulty: 'intermediate', mode: 'gym', category: 'legs', bmiRange: ['underweight','normal','overweight'], icon: '🏋️' },
  { id: 'g-legs-2', name: 'Leg Press',               description: 'Press the platform away using leg press machine.',                        sets: 3, reps: '12',  restSeconds: 60, difficulty: 'beginner',     mode: 'gym', category: 'legs', bmiRange: ['underweight','normal','overweight','obese'], icon: '🦵' },
  { id: 'g-legs-3', name: 'Leg Curl Machine',        description: 'Curl weight with hamstrings using the machine.',                          sets: 3, reps: '12',  restSeconds: 30, difficulty: 'beginner',     mode: 'gym', category: 'legs', bmiRange: ['underweight','normal','overweight','obese'], icon: '⚙️' },
  { id: 'g-legs-4', name: 'Leg Extension Machine',   description: 'Extend knees against resistance for quad isolation.',                     sets: 3, reps: '12',  restSeconds: 30, difficulty: 'beginner',     mode: 'gym', category: 'legs', bmiRange: ['underweight','normal','overweight','obese'], icon: '🦿' },
  { id: 'g-legs-5', name: 'Romanian Deadlift',       description: 'Hinge at hips with slight knee bend, lowering barbell along legs.',       sets: 3, reps: '10',  restSeconds: 60, difficulty: 'intermediate', mode: 'gym', category: 'legs', bmiRange: ['underweight','normal','overweight'], icon: '🏋️' },
  { id: 'g-legs-6', name: 'Hip Thrust',              description: 'Back on bench, drive hips up with barbell across hips.',                  sets: 3, reps: '12',  restSeconds: 45, difficulty: 'intermediate', mode: 'gym', category: 'legs', bmiRange: ['underweight','normal','overweight'], icon: '🌉' },
  { id: 'g-legs-7', name: 'Calf Raise Machine',      description: 'Standing or seated calf raise using a machine.',                          sets: 4, reps: '15',  restSeconds: 20, difficulty: 'beginner',     mode: 'gym', category: 'legs', bmiRange: ['underweight','normal','overweight','obese'], icon: '⬆️' },
  { id: 'g-legs-8', name: 'Hack Squat',              description: 'Squat on the hack squat machine for quad emphasis.',                      sets: 3, reps: '10',  restSeconds: 60, difficulty: 'intermediate', mode: 'gym', category: 'legs', bmiRange: ['underweight','normal','overweight'], icon: '🔩' },

  // ── ARMS ──
  { id: 'g-arms-1', name: 'Barbell Curl',            description: 'Curl the barbell up with an underhand grip.',                             sets: 3, reps: '12',  restSeconds: 45, difficulty: 'beginner',     mode: 'gym', category: 'arms', bmiRange: ['underweight','normal','overweight','obese'], icon: '💪' },
  { id: 'g-arms-2', name: 'Tricep Pushdown',         description: 'Push the cable bar or rope downward, extending elbows.',                  sets: 3, reps: '15',  restSeconds: 30, difficulty: 'beginner',     mode: 'gym', category: 'arms', bmiRange: ['underweight','normal','overweight','obese'], icon: '⬇️' },
  { id: 'g-arms-3', name: 'Hammer Curls',            description: 'Curl dumbbells with a neutral (hammer) grip.',                            sets: 3, reps: '12',  restSeconds: 30, difficulty: 'beginner',     mode: 'gym', category: 'arms', bmiRange: ['underweight','normal','overweight','obese'], icon: '🔨' },
  { id: 'g-arms-4', name: 'Skull Crushers',          description: 'Lie on bench, lower EZ bar to forehead then extend.',                     sets: 3, reps: '10',  restSeconds: 45, difficulty: 'intermediate', mode: 'gym', category: 'arms', bmiRange: ['underweight','normal','overweight'], icon: '💀' },
  { id: 'g-arms-5', name: 'Preacher Curl',           description: 'Curl on a preacher bench for strict bicep isolation.',                    sets: 3, reps: '10',  restSeconds: 45, difficulty: 'intermediate', mode: 'gym', category: 'arms', bmiRange: ['underweight','normal','overweight'], icon: '📖' },
  { id: 'g-arms-6', name: 'Overhead Tricep Extension',description: 'Hold dumbbell overhead, lower behind head then press up.',              sets: 3, reps: '12',  restSeconds: 30, difficulty: 'beginner',     mode: 'gym', category: 'arms', bmiRange: ['underweight','normal','overweight','obese'], icon: '⬆️' },
  { id: 'g-arms-7', name: 'Concentration Curls',     description: 'Sit, elbow on inner thigh, curl dumbbell with strict form.',              sets: 3, reps: '10',  restSeconds: 30, difficulty: 'intermediate', mode: 'gym', category: 'arms', bmiRange: ['underweight','normal','overweight'], icon: '🧠' },
  { id: 'g-arms-8', name: 'Cable Rope Curl',         description: 'Curl with cable rope attachment for constant tension.',                   sets: 3, reps: '15',  restSeconds: 30, difficulty: 'beginner',     mode: 'gym', category: 'arms', bmiRange: ['underweight','normal','overweight','obese'], icon: '🪢' },
];

export const ALL_EXERCISES: Exercise[] = [...homeExercises, ...gymExercises];

/**
 * Get exercises filtered by mode, category, and the user's BMI category.
 */
export function getExercisesFor(
  mode: WorkoutMode,
  category: MuscleCategory,
  bmiCategory: BmiCategory
): Exercise[] {
  return ALL_EXERCISES.filter(
    (e) =>
      e.mode === mode &&
      e.category === category &&
      e.bmiRange.includes(bmiCategory)
  );
}

export function countExercisesFor(
  mode: WorkoutMode,
  category: MuscleCategory,
  bmiCategory: BmiCategory
): number {
  return getExercisesFor(mode, category, bmiCategory).length;
}

// ─────────────────────────────────────────────
//  Phase 5 — Weekly Plan Engine
// ─────────────────────────────────────────────

export type DayPlan = {
  day: number;          // 0 = Sunday … 6 = Saturday
  dayName: string;
  category: MuscleCategory | null;
  isRestDay: boolean;
  label: string;        // e.g. "Chest & Triceps"
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function generateWeeklyPlan(goal: string, fitnessLevel: string): DayPlan[] {
  type Split = Partial<Record<number, { category: MuscleCategory; label: string }>>;

  const splits: Record<string, Split> = {
    beginner: {
      1: { category: 'chest',     label: 'Chest & Arms'     },
      3: { category: 'legs',      label: 'Legs & Core'      },
      5: { category: 'back',      label: 'Back & Shoulders' },
    },
    intermediate: {
      1: { category: 'chest',     label: 'Chest & Triceps'  },
      2: { category: 'back',      label: 'Back & Biceps'    },
      4: { category: 'shoulders', label: 'Shoulders & Arms' },
      5: { category: 'legs',      label: 'Legs & Glutes'    },
    },
    advanced: {
      1: { category: 'chest',     label: 'Chest & Triceps'      },
      2: { category: 'back',      label: 'Back & Biceps'        },
      3: { category: 'legs',      label: 'Legs & Glutes'        },
      4: { category: 'shoulders', label: 'Shoulders'            },
      5: { category: 'arms',      label: 'Arms & Core'          },
      6: { category: 'abs',       label: 'Core & Conditioning'  },
    },
  };

  const split: Split = splits[fitnessLevel] ?? splits.beginner;

  return Array.from({ length: 7 }, (_, day) => {
    const entry = split[day];
    return entry
      ? { day, dayName: DAY_NAMES[day], category: entry.category, isRestDay: false, label: entry.label }
      : { day, dayName: DAY_NAMES[day], category: null, isRestDay: true, label: 'Rest' };
  });
}

