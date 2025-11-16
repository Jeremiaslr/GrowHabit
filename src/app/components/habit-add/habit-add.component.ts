import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HabitService } from '../../services/habit.service';
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

  categories = ['Salud', 'Trabajo', 'Estudio', 'Finanzas', 'Familia', 'Ocio', 'Otro'];

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

    // Convertir horas y minutos a minutos totales
    const hours = this.habitHours() ?? 0;
    const minutes = this.habitMinutes() ?? 0;
    const totalMinutes = hours * 60 + minutes;
    const duration = totalMinutes > 0 ? totalMinutes : undefined;

    this.habitService.addHabit(
      name,
      this.habitDescription().trim() || undefined,
      duration,
      this.habitCategory() || undefined
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
}

