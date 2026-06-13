import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout.component';
import { CoursePlayerComponent } from './features/learning/course-player/course-player.component';
import { CourseListComponent } from './features/learning/course-list/course-list.component';
import { CourseDetailComponent } from './features/learning/course-detail/course-detail.component';
import { DashboardComponent } from './features/learning/dashboard/dashboard.component';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { enrolledGuard } from './core/guards/enrolled.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'courses', pathMatch: 'full' },
  { 
    path: 'auth', 
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) 
  },
  { 
    path: 'learning/:courseId', 
    component: CoursePlayerComponent,
    canActivate: [authGuard, enrolledGuard]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'courses', component: CourseListComponent },
      { path: 'courses/:id', component: CourseDetailComponent },
      { path: 'my-courses', component: DashboardComponent },
      { 
        path: 'admin', 
        canActivate: [adminGuard],
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES) 
      }
    ]
  },
  { path: '**', redirectTo: 'courses' } // Catch-all route
];
