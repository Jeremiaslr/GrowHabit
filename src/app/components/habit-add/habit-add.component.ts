import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HabitService } from '../../services/habit.service';
import { HabitFrequency, HabitFrequencyType, HabitSpecificDay } from '../../models/habit.model';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-habit-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './habit-add.component.html',
  styleUrl: './habit-add.component.scss'
})
export class HabitAddComponent {
  habitName = signal('');
  habitDescription = signal('');
  habitHours = signal<number | null>(null);
  habitMinutes = signal<number | null>(null);
  habitCategory = signal<string | null>(null);
  frequencyType = signal<HabitFrequencyType>('daily');
  weeklyDaysCount = signal<number | null>(3);
  specificDaysSelection = signal<HabitSpecificDay[]>([]);
  frequencyError = signal<string | null>(null);

  categories = ['Salud', 'Trabajo', 'Estudio', 'Finanzas', 'Familia', 'Ocio', 'Otro'];
  frequencyOptions: Array<{ value: HabitFrequencyType; label: string; helper: string }> = [
    { value: 'daily', label: 'Todos los días', helper: 'Repite el hábito cada día de la semana.' },
    { value: 'weekly', label: 'X días a la semana', helper: 'Define cuántos días a la semana deseas cumplirlo.' },
    { value: 'specificDays', label: 'Días concretos', helper: 'Selecciona días específicos (L-D).' },
    { value: 'weekends', label: 'Solo fines de semana', helper: 'Sábado y domingo.' },
    { value: 'weekdays', label: 'Solo días laborales', helper: 'De lunes a viernes.' }
  ];
  specificDaysOptions: Array<{ value: HabitSpecificDay; label: string }> = [
    { value: 'mon', label: 'L' },
    { value: 'tue', label: 'M' },
    { value: 'wed', label: 'X' },
    { value: 'thu', label: 'J' },
    { value: 'fri', label: 'V' },
    { value: 'sat', label: 'S' },
    { value: 'sun', label: 'D' }
  ];

  constructor(
    private router: Router,
    private habitService: HabitService
  ) {}

  /**
   * Guarda el nuevo hábito
   */
  saveHabit(): void {
    const name = this.habitName().trim();
    if (!name) {
      return;
    }

    if (!this.validateFrequency()) {
      return;
    }

    // Convertir horas y minutos a minutos totales
    const hours = this.habitHours() ?? 0;
    const minutes = this.habitMinutes() ?? 0;
    const totalMinutes = hours * 60 + minutes;
    const duration = totalMinutes > 0 ? totalMinutes : undefined;

    this.habitService.addHabit(
      name,
      this.habitDescription().trim() || undefined,
      duration,
      this.habitCategory() || undefined,
      this.buildFrequencyPayload()
    );

    // Redirigir a la lista de hábitos
    this.router.navigate(['/']);
  }

  /**
   * Cancela la creación y vuelve a la lista
   */
  cancel(): void {
    this.router.navigate(['/']);
  }

  setFrequencyType(type: HabitFrequencyType): void {
    this.frequencyType.set(type);
    this.frequencyError.set(null);
    if (type !== 'weekly') {
      this.weeklyDaysCount.set(3);
    }
    if (type !== 'specificDays') {
      this.specificDaysSelection.set([]);
    }
  }

  setWeeklyDaysCount(value: string | number | null): void {
    if (value === null || value === '') {
      this.weeklyDaysCount.set(null);
      return;
    }

    const parsed = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(parsed)) {
      return;
    }

    this.weeklyDaysCount.set(Math.floor(parsed));
  }

  toggleSpecificDay(day: HabitSpecificDay): void {
    const current = this.specificDaysSelection();
    if (current.includes(day)) {
      this.specificDaysSelection.set(current.filter(d => d !== day));
    } else {
      this.specificDaysSelection.set([...current, day]);
    }
  }

  isSpecificDaySelected(day: HabitSpecificDay): boolean {
    return this.specificDaysSelection().includes(day);
  }

  private validateFrequency(): boolean {
    const type = this.frequencyType();
    if (type === 'weekly') {
      const count = this.weeklyDaysCount();
      if (!count || count < 1 || count > 7) {
        this.frequencyError.set('Selecciona entre 1 y 7 días por semana.');
        return false;
      }
    }

    if (type === 'specificDays' && this.specificDaysSelection().length === 0) {
      this.frequencyError.set('Selecciona al menos un día de la semana.');
      return false;
    }

    this.frequencyError.set(null);
    return true;
  }

  private buildFrequencyPayload(): HabitFrequency {
    const type = this.frequencyType();
    if (type === 'weekly') {
      const count = this.weeklyDaysCount() ?? 3;
      const clamped = Math.min(7, Math.max(1, count));
      return {
        type,
        daysPerWeek: clamped
      };
    }

    if (type === 'specificDays') {
      return {
        type,
        selectedDays: this.specificDaysSelection()
      };
    }

    return { type };
  }
}

