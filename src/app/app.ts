import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HabitService } from './services/habit.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Aplicación de Hábitos');
  
  newHabitName = signal('');
  newHabitDescription = signal('');
  showForm = signal(false);

  constructor(protected habitService: HabitService) {}

  /**
   * Agrega un nuevo hábito
   */
  addHabit(): void {
    const name = this.newHabitName().trim();
    if (!name) {
      return;
    }

    this.habitService.addHabit(name, this.newHabitDescription().trim() || undefined);
    this.newHabitName.set('');
    this.newHabitDescription.set('');
    this.showForm.set(false);
  }

  /**
   * Alterna el estado de completado de un hábito
   */
  toggleHabit(id: string): void {
    this.habitService.toggleHabit(id);
  }

  /**
   * Elimina un hábito
   */
  deleteHabit(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este hábito?')) {
      this.habitService.deleteHabit(id);
    }
  }

  /**
   * Obtiene el número de días completados para un hábito
   */
  getCompletedDays(id: string): number {
    return this.habitService.getCompletedDays(id);
  }
}
