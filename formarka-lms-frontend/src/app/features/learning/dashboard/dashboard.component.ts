import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { Course } from '../../../core/models/course.model';
import { CourseCardComponent } from '../../../shared/components/course-card/course-card.component';

import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CourseCardComponent, ButtonComponent],
  template: `
    <div class="container">
      <div class="dashboard-header">
        <h1>¡Hola, {{ authService.currentUser()?.name }}!</h1>
        <p>Continúa donde lo dejaste y sigue construyendo tu marca.</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">{{ enrolledCourses.length }}</span>
          <span class="stat-label">Cursos inscritos</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ totalCompletedLessons }}</span>
          <span class="stat-label">Lecciones completadas</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ averageProgress }}%</span>
          <span class="stat-label">Progreso promedio</span>
        </div>
      </div>

      <section class="my-courses">
        <div class="section-title">
          <h2>Mis Cursos</h2>
          <a routerLink="/courses" class="link">Ver catálogo completo</a>
        </div>

        <div class="courses-grid" *ngIf="enrolledCourses.length > 0; else emptyState">
          <div *ngFor="let course of enrolledCourses" class="course-progress-card shadow-sm">
            <app-course-card 
              [course]="course"
              (onAction)="continueCourse($event)">
            </app-course-card>
            <div class="progress-footer">
              <div class="progress-bar">
                <div class="progress" [style.width.%]="getCourseProgress(course.id)"></div>
              </div>
              <span class="progress-text">{{ getCourseProgress(course.id) }}% completado</span>
            </div>
          </div>
        </div>

        <ng-template #emptyState>
          <div class="empty-state">
            <p>Aún no estás inscrito en ningún curso.</p>
            <app-button routerLink="/courses">Explorar Catálogo</app-button>
          </div>
        </ng-template>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-header {
      margin-bottom: 40px;
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      margin-bottom: 8px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 50px;
    }

    .stat-card {
      background: var(--formarka-white);
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      text-align: center;
      border-bottom: 4px solid var(--formarka-accent);
    }

    .stat-value {
      display: block;
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--formarka-primary);
    }

    .stat-label {
      font-size: 0.9rem;
      color: var(--formarka-text-muted);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .section-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .link {
      color: var(--formarka-accent);
      text-decoration: none;
      font-weight: 600;
    }

    .courses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 30px;
    }

    .course-progress-card {
      background: var(--formarka-white);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .progress-footer {
      padding: 0 20px 20px 20px;
    }

    .progress-bar {
      height: 6px;
      background: #eee;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progress {
      height: 100%;
      background: var(--formarka-accent);
    }

    .progress-text {
      font-size: 0.8rem;
      color: var(--formarka-text-muted);
      font-weight: 600;
    }

    .empty-state {
      text-align: center;
      padding: 60px;
      background: var(--formarka-white);
      border-radius: 12px;
    }

    .empty-state p {
      margin-bottom: 24px;
      color: var(--formarka-text-muted);
    }
  `]
})
export class DashboardComponent implements OnInit {
  enrolledCourses: Course[] = [];
  totalCompletedLessons = 0;
  averageProgress = 0;

  constructor(
    public authService: AuthService,
    private courseService: CourseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.courseService.getCourses().subscribe(data => {
      // Mock: first 2 courses are enrolled
      this.enrolledCourses = data.slice(0, 2);
      this.calculateStats();
    });
  }

  calculateStats(): void {
    let totalProgress = 0;
    this.totalCompletedLessons = 0;

    this.enrolledCourses.forEach(course => {
      const p = this.getCourseProgress(course.id);
      totalProgress += p;
      
      if (course.modules) {
        course.modules.forEach(m => {
          m.lessons.forEach(l => {
            if (l.isCompleted) this.totalCompletedLessons++;
          });
        });
      }
    });

    this.averageProgress = this.enrolledCourses.length > 0 
      ? Math.round(totalProgress / this.enrolledCourses.length) 
      : 0;
  }

  getCourseProgress(courseId: string): number {
    return this.courseService.getCourseProgress(courseId);
  }

  continueCourse(id: string): void {
    this.router.navigate(['/learning', id]);
  }
}
