import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HabitService } from '../../services/habit.service';

@Component({
  selector: 'app-habit-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './habit-edit.component.html',
  styleUrl: './habit-edit.component.scss'
})
export class HabitEditComponent implements OnInit {
  habitId: string = '';
  habitName = signal('');
  habitDescription = signal('');
  habitHours = signal<number | null>(null);
  habitMinutes = signal<number | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private habitService: HabitService
  ) {}

  ngOnInit(): void {
    this.habitId = this.route.snapshot.paramMap.get('id') || '';
    this.loadHabit();
  }

  /**
   * Carga los datos del hábito a editar
   */
  loadHabit(): void {
    const habit = this.habitService.getHabitById(this.habitId);
    if (!habit) {
      // Si no se encuentra el hábito, redirigir a la lista
      this.router.navigate(['/']);
      return;
    }

    this.habitName.set(habit.name);
    this.habitDescription.set(habit.description || '');
    
    // Convertir minutos a horas y minutos
    if (habit.durationMinutes) {
      this.habitHours.set(Math.floor(habit.durationMinutes / 60));
      this.habitMinutes.set(habit.durationMinutes % 60);
    } else {
      this.habitHours.set(null);
      this.habitMinutes.set(null);
    }
  }

  /**
   * Guarda los cambios del hábito
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

    this.habitService.updateHabit(
      this.habitId,
      name,
      this.habitDescription().trim() || undefined,
      duration
    );

    // Redirigir a la lista de hábitos
    this.router.navigate(['/']);
  }

  /**
   * Cancela la edición y vuelve a la lista
   */
  cancel(): void {
    this.router.navigate(['/']);
  }
}

