import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  username = signal('');
  password = signal('');
  confirmPassword = signal('');
  error = signal('');
  loading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.error.set('');
    this.loading.set(true);

    // Validar que las contraseñas coincidan
    if (this.password() !== this.confirmPassword()) {
      this.error.set('Las contraseñas no coinciden');
      this.loading.set(false);
      return;
    }

    const result = this.authService.register(this.username(), this.password());

    if (result.success) {
      this.router.navigate(['/']);
    } else {
      this.error.set(result.message || 'Error al registrar');
      this.loading.set(false);
    }
  }
}

