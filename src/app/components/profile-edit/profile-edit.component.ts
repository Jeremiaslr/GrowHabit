import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss'
})
export class ProfileEditComponent implements OnInit {
  username = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  feedback: { type: 'success' | 'error'; message: string } | null = null;
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.username = currentUser;
  }

  updateProfile(): void {
    this.feedback = null;

    const username = this.username.trim();
    const currentPassword = this.currentPassword;
    const newPassword = this.newPassword.trim();
    const confirmPassword = this.confirmPassword.trim();

    if (!username) {
      this.feedback = { type: 'error', message: 'El nombre de usuario es obligatorio.' };
      return;
    }

    if (!currentPassword) {
      this.feedback = { type: 'error', message: 'Debes ingresar tu contraseña actual.' };
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      this.feedback = { type: 'error', message: 'La confirmación no coincide con la nueva contraseña.' };
      return;
    }

    this.isSubmitting = true;

    const result = this.authService.updateUser({
      username,
      currentPassword,
      newPassword: newPassword || undefined
    });

    this.isSubmitting = false;

    if (!result.success) {
      this.feedback = { type: 'error', message: result.message || 'No se pudo actualizar el perfil.' };
      return;
    }

    this.feedback = { type: 'success', message: result.message || 'Perfil actualizado.' };
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';

    setTimeout(() => {
      this.router.navigate(['/profile']);
    }, 1200);
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }
}


