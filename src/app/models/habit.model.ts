export interface Habit {
  id: string;
  name: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  completedDates: Date[];
}

