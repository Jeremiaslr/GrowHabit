import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, WritableSignal, effect, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'preferred_theme';
  private readonly prefersDark = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  isDarkMode: WritableSignal<boolean> = signal(false);

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.loadInitialTheme();

    effect(() => {
      const theme = this.isDarkMode() ? 'dark' : 'light';
      this.document.documentElement.setAttribute('data-theme', theme);
      this.saveTheme(theme);
    });

    if (this.prefersDark) {
      this.prefersDark.addEventListener('change', event => {
        const stored = this.getStoredTheme();
        if (!stored) {
          this.setDarkMode(event.matches);
        }
      });
    }
  }

  toggleTheme(): void {
    this.setDarkMode(!this.isDarkMode());
  }

  setDarkMode(enabled: boolean): void {
    this.isDarkMode.set(enabled);
  }

  private loadInitialTheme(): void {
    const stored = this.getStoredTheme();

    if (stored) {
      this.isDarkMode.set(stored === 'dark');
      return;
    }

    if (this.prefersDark) {
      this.isDarkMode.set(this.prefersDark.matches);
      return;
    }

    this.isDarkMode.set(false);
  }

  private getStoredTheme(): 'light' | 'dark' | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return null;
  }

  private saveTheme(theme: 'light' | 'dark'): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(this.STORAGE_KEY, theme);
  }
}

