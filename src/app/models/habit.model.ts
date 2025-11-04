export interface Habit {
  id: string;
  name: string;
  description?: string;
  // Duración opcional del hábito en minutos
  durationMinutes?: number;
  completed: boolean;
  createdAt: Date;
  completedDates: Date[];
}

