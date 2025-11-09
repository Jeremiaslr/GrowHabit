import { Injectable, signal } from '@angular/core';

interface User {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'users';
  private readonly SESSION_KEY = 'current_user';
  
  currentUser = signal<string | null>(null);

  constructor() {
    this.loadSession();
  }

  /**
   * Registra un nuevo usuario
   */
  register(username: string, password: string): { success: boolean; message?: string } {
    const normalizedUsername = username.trim().toLowerCase();
    
    if (!normalizedUsername || !password) {
      return { success: false, message: 'Usuario y contraseña son requeridos' };
    }

    if (password.length < 4) {
      return { success: false, message: 'La contraseña debe tener al menos 4 caracteres' };
    }

    const users = this.getUsers();
    
    if (users.some(u => u.username === normalizedUsername)) {
      return { success: false, message: 'El usuario ya existe' };
    }

    users.push({ username: normalizedUsername, password });
    this.saveUsers(users);
    
    // Iniciar sesión automáticamente después del registro
    this.currentUser.set(normalizedUsername);
    this.saveSession(normalizedUsername);
    
    return { success: true };
  }

  /**
   * Inicia sesión
   */
  login(username: string, password: string): { success: boolean; message?: string } {
    const normalizedUsername = username.trim().toLowerCase();
    const users = this.getUsers();
    const user = users.find(u => u.username === normalizedUsername && u.password === password);

    if (!user) {
      return { success: false, message: 'Usuario o contraseña incorrectos' };
    }

    this.currentUser.set(normalizedUsername);
    this.saveSession(normalizedUsername);
    
    return { success: true };
  }

  /**
   * Cierra sesión
   */
  logout(): void {
    this.currentUser.set(null);
    this.removeSession();
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.currentUser();
  }

  /**
   * Carga la sesión desde localStorage
   */
  private loadSession(): void {
    if (typeof window === 'undefined' || !localStorage) return;
    
    try {
      const user = localStorage.getItem(this.SESSION_KEY);
      if (user) {
        this.currentUser.set(user);
      }
    } catch (error) {
      console.error('Error cargando sesión:', error);
    }
  }

  /**
   * Guarda la sesión en localStorage
   */
  private saveSession(username: string): void {
    if (typeof window === 'undefined' || !localStorage) return;
    
    try {
      localStorage.setItem(this.SESSION_KEY, username);
    } catch (error) {
      console.error('Error guardando sesión:', error);
    }
  }

  /**
   * Elimina la sesión de localStorage
   */
  private removeSession(): void {
    if (typeof window === 'undefined' || !localStorage) return;
    
    try {
      localStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.error('Error eliminando sesión:', error);
    }
  }

  /**
   * Obtiene todos los usuarios almacenados
   */
  private getUsers(): User[] {
    if (typeof window === 'undefined' || !localStorage) return [];
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      return [];
    }
  }

  /**
   * Guarda los usuarios en localStorage
   */
  private saveUsers(users: User[]): void {
    if (typeof window === 'undefined' || !localStorage) return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error guardando usuarios:', error);
    }
  }
}

