export type HabitFrequencyType =
  | 'daily'
  | 'weekly'
  | 'specificDays'
  | 'weekends'
  | 'weekdays';

export type HabitSpecificDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface HabitFrequency {
  type: HabitFrequencyType;
  // Número objetivo de días por semana cuando se selecciona la opción semanal
  daysPerWeek?: number;
  // Días específicos seleccionados cuando se marca la opción de días concretos
  selectedDays?: HabitSpecificDay[];
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  // Duración opcional del hábito en minutos
  durationMinutes?: number;
  // Categoría/etiqueta opcional para agrupar hábitos
  category?: string;
  completed: boolean;
  createdAt: Date;
  completedDates: Date[];
  // Configuración elegida para la frecuencia del hábito
  frequency?: HabitFrequency;
}

export const HABIT_CATEGORY_EMOJIS: Record<string, string> = {
  Salud: '💪',
  Trabajo: '💼',
  Estudio: '📚',
  Finanzas: '💰',
  Familia: '👨‍👩‍👧‍👦',
  Ocio: '🎯',
  Otro: '✨'
};

export function getHabitCategoryEmoji(category?: string): string {
  if (!category) {
    return '🏷️';
  }
  return HABIT_CATEGORY_EMOJIS[category] ?? '🏷️';
}

