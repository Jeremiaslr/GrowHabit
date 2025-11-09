import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    canMatch: [authGuard],
    loadComponent: () => import('./components/habits-list/habits-list.component').then(m => m.HabitsListComponent)
  },
  {
    path: 'habit/:id/edit',
    canMatch: [authGuard],
    loadComponent: () => import('./components/habit-edit/habit-edit.component').then(m => m.HabitEditComponent)
  }
];
