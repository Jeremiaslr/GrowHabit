import { Component, signal, computed, effect, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HabitService } from '../../services/habit.service';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-habits-list',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, NavbarComponent],
  templateUrl: './habits-list.component.html',
  styleUrl: './habits-list.component.scss'
})
export class HabitsListComponent implements OnInit, OnDestroy {
  protected readonly title = signal('Aplicación de Hábitos');
  
  newHabitName = signal('');
  newHabitDescription = signal('');
  newHabitHours = signal<number | null>(null);
  newHabitMinutes = signal<number | null>(null);
  newHabitCategory = signal<string | null>(null);
  showForm = signal(false);
  showDeleteModal = signal(false);
  habitIdPendingDelete = signal<string | null>(null);
  private lastResetDate = signal<string>('');
  private dayCheckInterval: any;

  categories = ['Salud', 'Trabajo', 'Estudio', 'Finanzas', 'Familia', 'Ocio', 'Otro'];

  // Calcula el progreso diario
  dailyProgress = computed(() => {
    const habits = this.habitService.habits();
    if (habits.length === 0) return 0;
    
    const completedToday = habits.filter(habit => habit.completed).length;
    return Math.round((completedToday / habits.length) * 100);
  });

  // Calcula el número de hábitos completados hoy
  completedHabitsCount = computed(() => {
    return this.habitService.habits().filter(habit => habit.completed).length;
  });

  // Obtiene el nombre de usuario formateado (primera letra mayúscula)
  userName = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '';
    return user.charAt(0).toUpperCase() + user.slice(1);
  });

  // Verifica si todos los hábitos están completados
  isAllCompleted = computed(() => {
    return this.dailyProgress() === 100;
  });

  constructor(
    protected habitService: HabitService,
    protected authService: AuthService,
    private router: Router
  ) {
    // Efecto para resetear hábitos cuando cambie el día
    effect(() => {
      this.checkAndResetDaily();
    });
  }

  ngOnInit(): void {
    // Cargar la fecha del último reset desde localStorage
    this.loadLastResetDate();
    
    // Verificar inmediatamente si necesita resetear
    this.checkAndResetDaily();
    
    // Verificar cada minuto si cambió el día
    this.dayCheckInterval = setInterval(() => {
      this.checkAndResetDaily();
    }, 60000); // Cada minuto
  }

  ngOnDestroy(): void {
    if (this.dayCheckInterval) {
      clearInterval(this.dayCheckInterval);
    }
  }

  /**
   * Obtiene la fecha de hoy como string (YYYY-MM-DD)
   */
  private getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // getMonth() devuelve 0-11
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Carga la fecha del último reset desde localStorage
   */
  private loadLastResetDate(): void {
    try {
      const stored = localStorage.getItem('lastResetDate');
      if (stored) {
        this.lastResetDate.set(stored);
      } else {
        this.lastResetDate.set(this.getTodayDateString());
        this.saveLastResetDate();
      }
    } catch (error) {
      console.error('Error cargando fecha de reset:', error);
      this.lastResetDate.set(this.getTodayDateString());
    }
  }

  /**
   * Guarda la fecha del último reset en localStorage
   */
  private saveLastResetDate(): void {
    try {
      localStorage.setItem('lastResetDate', this.lastResetDate());
    } catch (error) {
      console.error('Error guardando fecha de reset:', error);
    }
  }

  /**
   * Verifica si cambió el día y resetea los hábitos completados
   */
  private checkAndResetDaily(): void {
    const today = this.getTodayDateString();
    const lastReset = this.lastResetDate();
    
    if (lastReset && lastReset !== today) {
      // El día cambió, resetear todos los hábitos completados
      this.habitService.resetDailyCompletion();
      this.lastResetDate.set(today);
      this.saveLastResetDate();
    } else if (!lastReset) {
      this.lastResetDate.set(today);
      this.saveLastResetDate();
    }
  }


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
      duration,
      this.newHabitCategory() || undefined
    );
    this.newHabitName.set('');
    this.newHabitDescription.set('');
    this.newHabitHours.set(null);
    this.newHabitMinutes.set(null);
    this.newHabitCategory.set(null);
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

