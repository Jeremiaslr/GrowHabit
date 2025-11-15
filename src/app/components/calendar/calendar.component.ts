import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { HabitService } from '../../services/habit.service';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  completedHabitsCount: number;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {
  currentDate = signal(new Date());
  
  // Nombres de los meses en español
  monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Nombres de los días de la semana en español (Lunes a Domingo)
  dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  constructor(protected habitService: HabitService) {}

  // Obtiene el mes y año actuales
  currentMonth = computed(() => {
    const date = this.currentDate();
    return this.monthNames[date.getMonth()];
  });

  currentYear = computed(() => {
    return this.currentDate().getFullYear();
  });

  // Genera los días del calendario
  calendarDays = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);
    
    // Día de la semana del primer día (0 = Domingo, 6 = Sábado)
    // Convertimos a formato Lunes=0, Domingo=6
    const startDayOfWeek = firstDay.getDay();
    const startDayMondayBased = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    
    // Días del mes anterior para completar la primera semana
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Días del mes anterior (empezando desde Lunes)
    for (let i = startDayMondayBased - 1; i >= 0; i--) {
      const dayDate = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({
        date: dayDate,
        dayNumber: dayDate.getDate(),
        isCurrentMonth: false,
        isToday: this.isSameDay(dayDate, today),
        completedHabitsCount: this.getCompletedHabitsForDate(dayDate)
      });
    }
    
    // Días del mes actual
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dayDate = new Date(year, month, day);
      days.push({
        date: dayDate,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: this.isSameDay(dayDate, today),
        completedHabitsCount: this.getCompletedHabitsForDate(dayDate)
      });
    }
    
    // Días del mes siguiente para completar la última semana (múltiplo de 7 días)
    const totalDays = days.length;
    const remainingDays = Math.ceil(totalDays / 7) * 7 - totalDays;
    for (let day = 1; day <= remainingDays; day++) {
      const dayDate = new Date(year, month + 1, day);
      days.push({
        date: dayDate,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: this.isSameDay(dayDate, today),
        completedHabitsCount: this.getCompletedHabitsForDate(dayDate)
      });
    }
    
    return days;
  });

  /**
   * Obtiene el número de hábitos completados en una fecha específica
   */
  private getCompletedHabitsForDate(date: Date): number {
    const habits = this.habitService.habits();
    const dateString = this.getDateString(date);
    
    return habits.filter(habit => {
      return habit.completedDates.some(completedDate => {
        return this.getDateString(completedDate) === dateString;
      });
    }).length;
  }

  /**
   * Convierte una fecha a string YYYY-MM-DD
   */
  private getDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
   * Navega al mes anterior
   */
  previousMonth(): void {
    const date = new Date(this.currentDate());
    date.setMonth(date.getMonth() - 1);
    this.currentDate.set(date);
  }

  /**
   * Navega al mes siguiente
   */
  nextMonth(): void {
    const date = new Date(this.currentDate());
    date.setMonth(date.getMonth() + 1);
    this.currentDate.set(date);
  }

  /**
   * Vuelve al mes actual
   */
  goToToday(): void {
    this.currentDate.set(new Date());
  }

  /**
   * Obtiene el total de días con hábitos completados en el mes actual
   */
  getTotalCompletedDays(): number {
    const days = this.calendarDays();
    const currentMonthDays = days.filter(day => day.isCurrentMonth && day.completedHabitsCount > 0);
    return currentMonthDays.length;
  }

  /**
   * Calcula la tasa de completado del mes
   */
  getCompletionRate(): number {
    const days = this.calendarDays();
    const currentMonthDays = days.filter(day => day.isCurrentMonth);
    const daysWithHabits = currentMonthDays.filter(day => day.completedHabitsCount > 0).length;
    const totalHabits = this.habitService.habits().length;
    
    if (totalHabits === 0) return 0;
    
    const totalPossibleDays = currentMonthDays.length * totalHabits;
    const completedDays = currentMonthDays.reduce((sum, day) => sum + day.completedHabitsCount, 0);
    
    return Math.round((completedDays / totalPossibleDays) * 100);
  }

  /**
   * Genera un array de números para iterar (helper para el template)
   */
  getArray(length: number): number[] {
    return Array.from({ length }, (_, i) => i);
  }

  /**
   * Obtiene el mínimo entre dos números (helper para el template)
   */
  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  /**
   * Calcula el porcentaje de completado para un día específico
   */
  getCompletionPercentage(day: CalendarDay): number {
    const totalHabits = this.habitService.habits().length;
    if (totalHabits === 0) return 0;
    return Math.round((day.completedHabitsCount / totalHabits) * 100);
  }

  /**
   * Genera el path del arco para el clipPath del círculo de progreso
   * El círculo se rellena desde arriba en sentido horario
   */
  getArcPath(percentage: number): string {
    if (percentage === 0) return '';
    if (percentage === 100) return 'M 0 0 L 32 0 L 32 32 L 0 32 Z'; // Relleno completo
    
    const radius = 14;
    const centerX = 16;
    const centerY = 16;
    
    // Convertir porcentaje a ángulo (empezar desde arriba, sentido horario)
    const angle = (percentage / 100) * 360 - 90;
    const angleRad = (angle * Math.PI) / 180;
    
    // Calcular el punto final del arco
    const x = centerX + radius * Math.cos(angleRad);
    const y = centerY + radius * Math.sin(angleRad);
    
    // Determinar si necesitamos el arco grande o pequeño
    const largeArcFlag = percentage > 50 ? 1 : 0;
    
    // Crear el path: Mover al centro, línea al inicio (arriba), arco hasta el punto final, cerrar
    return `M ${centerX} ${centerY} L ${centerX} ${centerY - radius} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x} ${y} Z`;
  }
}

