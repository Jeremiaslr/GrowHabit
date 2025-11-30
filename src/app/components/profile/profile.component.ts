import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { HabitService } from '../../services/habit.service';
import { AuthService } from '../../services/auth.service';
import { Habit, HabitSpecificDay, getHabitCategoryEmoji } from '../../models/habit.model';

interface CategoryStat {
  category: string;
  count: number;
  percentage: number;
}

interface ActivityEntry {
  habitName: string;
  date: Date;
  category?: string;
  description?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  private readonly habitsSignal = computed(() => this.habitService.habits());
  private readonly dayKeys: HabitSpecificDay[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  protected readonly userName = computed(() => {
    const user = this.authService.currentUser();
    if (!user) {
      return 'Invitado';
    }
    return user.charAt(0).toUpperCase() + user.slice(1);
  });

  protected readonly userInitials = computed(() => {
    const user = this.authService.currentUser();
    if (!user) {
      return 'GH';
    }
    const [first, second] = user.split(/[.\-_ ]+/).filter(Boolean);
    if (first && second) {
      return `${first[0]}${second[0]}`.toUpperCase();
    }
    return user.slice(0, 2).toUpperCase();
  });

  protected readonly memberSince = computed(() => {
    const habits = this.habitsSignal();
    if (habits.length === 0) {
      return null;
    }
    return habits.reduce<Date>((earliest, habit) => {
      return habit.createdAt < earliest ? habit.createdAt : earliest;
    }, habits[0].createdAt);
  });

  protected readonly totalHabits = computed(() => this.habitsSignal().length);

  protected readonly scheduledHabitsToday = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.habitsSignal().filter(habit => this.isHabitScheduledForDate(habit, today));
  });

  protected readonly scheduledHabitsCountToday = computed(() => this.scheduledHabitsToday().length);

  protected readonly completedToday = computed(() => {
    return this.scheduledHabitsToday().filter(habit => habit.completed).length;
  });

  protected readonly pendingHabits = computed(() => {
    return Math.max(this.scheduledHabitsCountToday() - this.completedToday(), 0);
  });

  protected readonly completionRate = computed(() => {
    const scheduled = this.scheduledHabitsCountToday();
    if (scheduled === 0) {
      return 0;
    }
    return Math.round((this.completedToday() / scheduled) * 100);
  });

  protected readonly categoryStats = computed<CategoryStat[]>(() => {
    const total = this.totalHabits();
    if (total === 0) {
      return [];
    }

    const stats = new Map<string, number>();
    this.habitsSignal().forEach(habit => {
      const key = habit.category?.trim() || 'Sin categoría';
      stats.set(key, (stats.get(key) ?? 0) + 1);
    });

    return Array.from(stats.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  });

  protected readonly recentActivity = computed<ActivityEntry[]>(() => {
    const entries: ActivityEntry[] = [];

    this.habitsSignal().forEach(habit => {
      habit.completedDates.forEach(date => {
        entries.push({
          habitName: habit.name,
          date,
          category: habit.category,
          description: habit.description
        });
      });
    });

    return entries
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 6);
  });

  protected readonly currentStreak = computed(() => this.calculateCurrentStreak());

  protected readonly longestStreak = computed(() => this.calculateLongestStreak());

  constructor(
    protected habitService: HabitService,
    protected authService: AuthService,
    private router: Router
  ) {}

  protected navigateToHabits(): void {
    this.router.navigate(['/']);
  }

  protected navigateToCalendar(): void {
    this.router.navigate(['/calendar']);
  }

  protected navigateToNewHabit(): void {
    this.router.navigate(['/habit/add']);
  }

  protected navigateToEditProfile(): void {
    this.router.navigate(['/profile/edit']);
  }

  protected formatDate(date: Date | null): string {
    if (!date) {
      return 'Sin registros';
    }
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  protected formatActivityDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  protected hasHabits(): boolean {
    return this.totalHabits() > 0;
  }

  private calculateCurrentStreak(): number {
    const dateKeys = this.getCompletionDateKeys().sort((a, b) => b.localeCompare(a));
    if (dateKeys.length === 0) {
      return 0;
    }

    let streak = 1;
    let previous = this.toUTCDate(dateKeys[0]);

    for (let i = 1; i < dateKeys.length; i++) {
      const current = this.toUTCDate(dateKeys[i]);
      const diff = this.getDayDiff(current, previous);

      if (diff === 1) {
        streak++;
        previous = current;
      } else if (diff > 1) {
        break;
      }
    }

    // Si la última fecha registrada no es hoy, el marcador visual se mantiene
    // para la última racha lograda.
    return streak;
  }

  private calculateLongestStreak(): number {
    const dateKeys = this.getCompletionDateKeys().sort();
    if (dateKeys.length === 0) {
      return 0;
    }

    let longest = 1;
    let streak = 1;

    for (let i = 1; i < dateKeys.length; i++) {
      const previous = this.toUTCDate(dateKeys[i - 1]);
      const current = this.toUTCDate(dateKeys[i]);
      const diff = this.getDayDiff(previous, current);

      if (diff === 1) {
        streak++;
        longest = Math.max(longest, streak);
      } else if (diff > 1) {
        streak = 1;
      }
    }

    return longest;
  }

  private isHabitScheduledForDate(habit: Habit, date: Date): boolean {
    const frequency = habit.frequency ?? { type: 'daily' };
    const dayKey = this.getDayKey(date);
    const isWeekend = dayKey === 'sat' || dayKey === 'sun';

    switch (frequency.type) {
      case 'daily':
        return true;
      case 'weekly':
        return true;
      case 'specificDays':
        return (frequency.selectedDays ?? []).includes(dayKey);
      case 'weekends':
        return isWeekend;
      case 'weekdays':
        return !isWeekend;
      default:
        return true;
    }
  }

  private getDayKey(date: Date): HabitSpecificDay {
    const index = date.getDay();
    return this.dayKeys[index];
  }

  protected getCategoryEmoji(category?: string): string {
    return getHabitCategoryEmoji(category);
  }

  private getCompletionDateKeys(): string[] {
    const dates = new Set<string>();

    this.habitsSignal().forEach((habit: Habit) => {
      habit.completedDates.forEach(date => {
        dates.add(this.getDateKey(date));
      });
    });

    return Array.from(dates);
  }

  private getDateKey(date: Date): string {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized.toISOString().split('T')[0];
  }

  private toUTCDate(dateKey: string): Date {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  private getDayDiff(earlier: Date, later: Date): number {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.round((later.getTime() - earlier.getTime()) / millisecondsPerDay);
  }
}


