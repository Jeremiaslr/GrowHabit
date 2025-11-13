import { Injectable, signal } from '@angular/core';
import { Habit } from '../models/habit.model';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private readonly STORAGE_KEY = 'habits';
  
  // Signal para los hábitos
  habits = signal<Habit[]>([]);

  constructor() {
    this.loadHabitsFromStorage();
  }

  /**
   * Agrega un nuevo hábito
   */
  addHabit(name: string, description?: string, durationMinutes?: number, category?: string): void {
    const newHabit: Habit = {
      id: this.generateId(),
      name,
      description,
      durationMinutes,
      category,
      completed: false,
      createdAt: new Date(),
      completedDates: []
    };

    this.habits.update(habits => [...habits, newHabit]);
    this.saveHabitsToStorage();
  }

  /**
   * Marca un hábito como completado o no completado
   */
  toggleHabit(id: string): void {
    this.habits.update(habits => 
      habits.map(habit => {
        if (habit.id === id) {
          const completed = !habit.completed;
          const completedDates = completed 
            ? [...habit.completedDates, new Date()]
            : habit.completedDates.filter(date => {
                // Eliminar la fecha de hoy si existe
                const today = new Date();
                return !this.isSameDay(date, today);
              });
          
          return { ...habit, completed, completedDates };
        }
        return habit;
      })
    );
    this.saveHabitsToStorage();
  }

  /**
   * Actualiza un hábito existente
   */
  updateHabit(id: string, name: string, description?: string, durationMinutes?: number, category?: string): void {
    this.habits.update(habits =>
      habits.map(habit => {
        if (habit.id === id) {
          return {
            ...habit,
            name,
            description,
            durationMinutes,
            category
          };
        }
        return habit;
      })
    );
    this.saveHabitsToStorage();
  }

  /**
   * Obtiene un hábito por su ID
   */
  getHabitById(id: string): Habit | undefined {
    return this.habits().find(h => h.id === id);
  }

  /**
   * Elimina un hábito
   */
  deleteHabit(id: string): void {
    this.habits.update(habits => habits.filter(habit => habit.id !== id));
    this.saveHabitsToStorage();
  }

  /**
   * Obtiene el número total de días que un hábito ha sido completado
   */
  getCompletedDays(id: string): number {
    const habit = this.habits().find(h => h.id === id);
    return habit?.completedDates.length || 0;
  }

  /**
   * Genera un ID único
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Guarda los hábitos en localStorage
   */
  private saveHabitsToStorage(): void {
    try {
      const habits = this.habits().map(habit => ({
        ...habit,
        createdAt: habit.createdAt.toISOString(),
        completedDates: habit.completedDates.map(date => date.toISOString())
      }));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(habits));
    } catch (error) {
      console.error('Error guardando hábitos:', error);
    }
  }

  /**
   * Carga los hábitos desde localStorage
   */
  private loadHabitsFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const habits = JSON.parse(stored).map((habit: any) => ({
          ...habit,
          createdAt: new Date(habit.createdAt),
          completedDates: habit.completedDates.map((date: string) => new Date(date))
        }));
        this.habits.set(habits);
      }
    } catch (error) {
      console.error('Error cargando hábitos:', error);
    }
  }

  /**
   * Verifica si dos fechas son el mismo día
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Resetea el estado de completado de todos los hábitos al final del día
   */
  resetDailyCompletion(): void {
    this.habits.update(habits =>
      habits.map(habit => ({
        ...habit,
        completed: false
      }))
    );
    this.saveHabitsToStorage();
  }
}

