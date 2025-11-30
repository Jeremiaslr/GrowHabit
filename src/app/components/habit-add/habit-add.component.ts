import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HabitService } from '../../services/habit.service';
import { HabitFrequency, HabitFrequencyType, HabitSpecificDay, getHabitCategoryEmoji } from '../../models/habit.model';
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
  weeklyDaysCount = signal(2);
  specificDaysSelection = signal<HabitSpecificDay[]>([]);
  frequencyError = signal<string | null>(null);

  readonly MIN_WEEKLY_DAYS = 2;
  readonly MAX_WEEKLY_DAYS = 6;

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

  getCategoryEmoji(category?: string): string {
    return getHabitCategoryEmoji(category);
  }

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
      this.weeklyDaysCount.set(this.MIN_WEEKLY_DAYS);
    }
    if (type !== 'specificDays') {
      this.specificDaysSelection.set([]);
    }
  }

  decrementWeeklyDays(): void {
    this.weeklyDaysCount.update(value =>
      Math.max(this.MIN_WEEKLY_DAYS, value - 1)
    );
  }

  incrementWeeklyDays(): void {
    this.weeklyDaysCount.update(value =>
      Math.min(this.MAX_WEEKLY_DAYS, value + 1)
    );
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
      if (!count || count < this.MIN_WEEKLY_DAYS || count > this.MAX_WEEKLY_DAYS) {
        this.frequencyError.set(`Selecciona entre ${this.MIN_WEEKLY_DAYS} y ${this.MAX_WEEKLY_DAYS} días por semana.`);
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
      const count = this.weeklyDaysCount();
      const clamped = Math.min(this.MAX_WEEKLY_DAYS, Math.max(this.MIN_WEEKLY_DAYS, count));
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

