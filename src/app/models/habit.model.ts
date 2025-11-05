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
}

