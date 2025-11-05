import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/habits-list/habits-list.component').then(m => m.HabitsListComponent)
  },
  {
    path: 'habit/:id/edit',
    loadComponent: () => import('./components/habit-edit/habit-edit.component').then(m => m.HabitEditComponent)
  }
];
