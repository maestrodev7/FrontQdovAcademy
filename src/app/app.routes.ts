import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/dashboard' },

  // Auth (login/register) hors du layout
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },

  // 🔥 Toutes les routes principales seront affichées dans ton layout
  {
    path: '',
    children: [
      {
        path: 'school',
        loadChildren: () => import('./school/school.module').then(m => m.SchoolModule)
      },
      {
        path: 'users',
        loadChildren: () => import('./users/users.module').then(m => m.UsersModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboad/dashboad.module').then(m => m.DashboadModule)
      }
    ]
  }
];
