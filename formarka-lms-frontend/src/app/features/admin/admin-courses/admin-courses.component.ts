import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { Course } from '../../../core/models/course.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  template: `
    <div class="container admin-container animate-up">
      <div class="admin-header">
        <div>
          <h1 class="text-gradient">Gestión de la Academia</h1>
          <p>{{ userRole === 'admin' ? 'Administra el catálogo de cursos, usuarios y el progreso de los estudiantes.' : 'Administra el catálogo de cursos y el progreso de tus estudiantes.' }}</p>
        </div>
        <div class="header-actions">
          <app-button *ngIf="userRole === 'admin'" variant="outline" routerLink="/admin/users">
            Gestionar Usuarios
          </app-button>
          <app-button routerLink="/admin/courses/new">
            <span class="icon">+</span> Nuevo Curso
          </app-button>
        </div>
      </div>

      <div class="table-card glass">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Curso</th>
              <th>Profesor</th>
              <th>Intensidad</th>
              <th>Estudiantes</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let course of courses; let i = index" class="animate-up" [style.animation-delay]="i * 0.1 + 's'">
              <td>
                <div class="course-cell">
                  <div class="thumb-wrapper">
                    <img [src]="course.thumbnailUrl" [alt]="course.title" class="course-thumb">
                  </div>
                  <div class="course-info">
                    <span class="course-title">{{ course.title }}</span>
                    <span class="category-tag">{{ course.category }} • {{ course.level }}</span>
                  </div>
                </div>
              </td>
              <td>
                <div class="instructor-cell">
                  <span class="instructor-name">{{ course.instructorName || 'Sin asignar' }}</span>
                  <button *ngIf="userRole === 'admin'" class="assign-btn" (click)="assignTeacher(course)">Reasignar</button>
                </div>
              </td>
              <td>
                <span class="hours-badge">{{ course.totalHours }}h totales</span>
              </td>
              <td>
                <div class="student-info">
                  <span class="count">{{ course.enrolledStudents?.length || 0 }}</span> activos
                  <a [routerLink]="['/admin/courses', course.id, 'students']" class="view-link">Ver Listado</a>
                </div>
              </td>
              <td class="actions-cell">
                <div class="action-group">
                  <button class="action-btn edit" [routerLink]="['/admin/courses', course.id, 'edit']" title="Editar">✏️</button>
                  <button class="action-btn delete" (click)="deleteCourse(course.id)" title="Eliminar">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-container { padding: 40px 0; }
    .admin-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
    .header-actions { display: flex; gap: 16px; }
    .table-card { border-radius: 32px; overflow: hidden; background: white; }
    .admin-table { width: 100%; border-collapse: collapse; }
    .admin-table th { padding: 20px; text-align: left; background: #fafafa; color: var(--brand-purple-deep); font-weight: 800; }
    .admin-table td { padding: 20px; border-bottom: 1px solid #eee; }
    .course-cell { display: flex; align-items: center; gap: 16px; }
    .thumb-wrapper { width: 50px; height: 50px; border-radius: 12px; overflow: hidden; }
    .course-thumb { width: 100%; height: 100%; object-fit: cover; }
    .course-title { display: block; font-weight: 800; color: var(--brand-black); }
    .category-tag { font-size: 0.8rem; color: var(--formarka-text-muted); font-weight: 600; }
    .instructor-name { font-weight: 700; color: var(--brand-purple-deep); display: block; }
    .assign-btn { background: none; border: none; font-size: 0.75rem; color: #999; cursor: pointer; text-decoration: underline; padding: 0; }
    .hours-badge { background: #f0f0f0; padding: 4px 10px; border-radius: 8px; font-size: 0.85rem; font-weight: 700; }
    .student-info { font-size: 0.9rem; }
    .student-info .count { font-weight: 800; color: var(--brand-purple-deep); }
    .view-link { display: block; font-size: 0.8rem; color: var(--brand-purple-deep); font-weight: 700; text-decoration: none; margin-top: 4px; }
    .action-group { display: flex; gap: 10px; }
    .action-btn { border: 1.5px solid #eee; background: white; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
    .action-btn:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
    .action-btn.edit:hover { border-color: var(--brand-purple-deep); color: var(--brand-purple-deep); }
    .action-btn.delete:hover { border-color: #ef4444; color: #ef4444; }
  `]
})
export class AdminCoursesComponent implements OnInit {
  courses: Course[] = [];
  userRole: string = 'student';

  constructor(
    private courseService: CourseService,
    private authService: AuthService
  ) {
    this.userRole = this.authService.currentUser()?.role || 'student';
  }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses() {
    this.courseService.getCourses().subscribe(data => this.courses = data);
  }

  assignTeacher(course: Course) {
    const teacherId = prompt('ID del profesor (t1 o t2):');
    if (teacherId) {
      const name = teacherId === 't1' ? 'Profe Luis' : 'Profe Maria';
      this.courseService.assignTeacher(course.id, teacherId, name).subscribe(() => this.loadCourses());
    }
  }

  deleteCourse(id: string): void {
    if (confirm('¿Eliminar curso?')) {
      this.courseService.deleteCourse(id).subscribe(() => this.loadCourses());
    }
  }
}
