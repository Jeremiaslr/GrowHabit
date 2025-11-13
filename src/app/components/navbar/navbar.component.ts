import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  isMenuOpen = signal(false);

  constructor(
    protected authService: AuthService,
    private router: Router
  ) {}

  /**
   * Obtiene el saludo según la hora del día
   */
  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 13) {
      return 'Buenos días';
    } else if (hour >= 13 && hour < 20) {
      return 'Buenas tardes';
    } else {
      return 'Buenas noches';
    }
  });

  /**
   * Obtiene el nombre de usuario formateado (primera letra mayúscula)
   */
  userName = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '';
    return user.charAt(0).toUpperCase() + user.slice(1);
  });

  /**
   * Alterna el estado del menú hamburguesa
   */
  toggleMenu(): void {
    this.isMenuOpen.update(open => !open);
  }

  /**
   * Cierra el menú
   */
  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  /**
   * Cierra la sesión y navega al login
   */
  logout(): void {
    this.authService.logout();
    this.closeMenu();
    this.router.navigate(['/login']);
  }

  /**
   * Navega a una ruta y cierra el menú
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeMenu();
  }
}

