import { Injectable, signal } from '@angular/core';
import { Habit, HabitFrequency, HabitSpecificDay } from '../models/habit.model';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private readonly STORAGE_KEY = 'habits';
  private readonly SPECIFIC_DAY_VALUES: HabitSpecificDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  
  // Signal para los hábitos
  habits = signal<Habit[]>([]);

  constructor() {
    this.loadHabitsFromStorage();
  }

  /**
   * Agrega un nuevo hábito
   */
  addHabit(
    name: string,
    description?: string,
    durationMinutes?: number,
    category?: string,
    frequency?: HabitFrequency
  ): void {
    const newHabit: Habit = {
      id: this.generateId(),
      name,
      description,
      durationMinutes,
      category,
      completed: false,
      createdAt: new Date(),
      completedDates: [],
      frequency: frequency ? this.normalizeFrequency(frequency) : this.getDefaultFrequency()
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
  updateHabit(
    id: string,
    name: string,
    description?: string,
    durationMinutes?: number,
    category?: string,
    frequency?: HabitFrequency
  ): void {
    this.habits.update(habits =>
      habits.map(habit => {
        if (habit.id === id) {
          return {
            ...habit,
            name,
            description,
            durationMinutes,
            category,
            frequency: frequency
              ? this.normalizeFrequency(frequency)
              : habit.frequency ?? this.getDefaultFrequency()
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
          completedDates: habit.completedDates.map((date: string) => new Date(date)),
          frequency: this.normalizeFrequency(habit.frequency)
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

  /**
   * Devuelve la configuración por defecto para la frecuencia de un hábito
   */
  private getDefaultFrequency(): HabitFrequency {
    return { type: 'daily' };
  }

  /**
   * Normaliza y valida la configuración de frecuencia
   */
  private normalizeFrequency(frequency?: HabitFrequency): HabitFrequency {
    if (!frequency || !frequency.type) {
      return this.getDefaultFrequency();
    }

    if (frequency.type === 'weekly') {
      const days = frequency.daysPerWeek ?? 3;
      const clamped = Math.min(6, Math.max(2, days));
      return { type: 'weekly', daysPerWeek: clamped };
    }

    if (frequency.type === 'specificDays') {
      const selected = (frequency.selectedDays ?? []).filter(day =>
        this.SPECIFIC_DAY_VALUES.includes(day)
      );
      if (selected.length === 0) {
        return this.getDefaultFrequency();
      }
      return { type: 'specificDays', selectedDays: selected };
    }

    if (frequency.type === 'weekends' || frequency.type === 'weekdays' || frequency.type === 'daily') {
      return { type: frequency.type };
    }

    return this.getDefaultFrequency();
  }
}

