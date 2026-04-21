/**
 * Calculate calories burned for an exercise.
 * Formula: calories = (MET * 3.5 * weight_kg * duration_minutes) / 200
 */
export const calculateCalories = (metValue, weightKg, durationMinutes) => {
  if (!metValue || !weightKg || !durationMinutes) {
    return 0;
  }

  return Math.round((metValue * 3.5 * weightKg * durationMinutes) / 200);
};
