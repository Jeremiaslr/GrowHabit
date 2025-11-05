import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HabitService } from '../../services/habit.service';

@Component({
  selector: 'app-habits-list',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './habits-list.component.html',
  styleUrl: './habits-list.component.scss'
})
export class HabitsListComponent {
  protected readonly title = signal('Aplicación de Hábitos');
  
  newHabitName = signal('');
  newHabitDescription = signal('');
  newHabitHours = signal<number | null>(null);
  newHabitMinutes = signal<number | null>(null);
  showForm = signal(false);
  showDeleteModal = signal(false);
  habitIdPendingDelete = signal<string | null>(null);

  constructor(protected habitService: HabitService) {}

  /**
   * Agrega un nuevo hábito
   */
  addHabit(): void {
    const name = this.newHabitName().trim();
    if (!name) {
      return;
    }

    // Convertir horas y minutos a minutos totales
    const hours = this.newHabitHours() ?? 0;
    const minutes = this.newHabitMinutes() ?? 0;
    const totalMinutes = hours * 60 + minutes;
    const duration = totalMinutes > 0 ? totalMinutes : undefined;

    this.habitService.addHabit(
      name,
      this.newHabitDescription().trim() || undefined,
      duration
    );
    this.newHabitName.set('');
    this.newHabitDescription.set('');
    this.newHabitHours.set(null);
    this.newHabitMinutes.set(null);
    this.showForm.set(false);
  }

  /**
   * Alterna el estado de completado de un hábito
   */
  toggleHabit(id: string): void {
    this.habitService.toggleHabit(id);
  }

  /**
   * Abre el modal de confirmación para eliminar
   */
  openDeleteModal(id: string): void {
    this.habitIdPendingDelete.set(id);
    this.showDeleteModal.set(true);
  }

  /**
   * Confirma la eliminación en el modal
   */
  confirmDelete(): void {
    const id = this.habitIdPendingDelete();
    if (id) {
      this.habitService.deleteHabit(id);
    }
    this.closeDeleteModal();
  }

  /**
   * Cierra el modal sin eliminar
   */
  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.habitIdPendingDelete.set(null);
  }

  /**
   * Obtiene el número de días completados para un hábito
   */
  getCompletedDays(id: string): number {
    return this.habitService.getCompletedDays(id);
  }

  /**
   * Convierte minutos a formato legible (horas y minutos)
   */
  formatDuration(minutes: number): string {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours} h ${mins} min`;
    } else if (hours > 0) {
      return `${hours} h`;
    } else {
      return `${mins} min`;
    }
  }
}

