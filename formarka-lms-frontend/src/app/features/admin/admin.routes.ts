import { Routes } from '@angular/router';
import { AdminCoursesComponent } from './admin-courses/admin-courses.component';
import { AdminCourseEditComponent } from './admin-course-edit/admin-course-edit.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminStudentsComponent } from './admin-students/admin-students.component';
import { roleGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'courses', pathMatch: 'full' },
  { 
    path: 'courses', 
    component: AdminCoursesComponent,
    canActivate: [roleGuard],
    data: { roles: ['admin', 'teacher'] }
  },
  { 
    path: 'courses/new', 
    component: AdminCourseEditComponent,
    canActivate: [roleGuard],
    data: { roles: ['admin', 'teacher'] }
  },
  { 
    path: 'courses/:id/edit', 
    component: AdminCourseEditComponent,
    canActivate: [roleGuard],
    data: { roles: ['admin', 'teacher'] }
  },
  { 
    path: 'courses/:id/students', 
    component: AdminStudentsComponent,
    canActivate: [roleGuard],
    data: { roles: ['admin', 'teacher'] }
  },
  { 
    path: 'users', 
    component: AdminUsersComponent,
    canActivate: [roleGuard],
    data: { roles: ['admin'] }
  }
];
