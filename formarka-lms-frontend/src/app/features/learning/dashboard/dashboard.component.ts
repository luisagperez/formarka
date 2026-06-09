import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { CertificateService } from '../../../core/services/certificate.service';
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
                <div class="progress" [style.width.%]="getCourseProgress(course)"></div>
              </div>
              <div class="footer-actions">
                <span class="progress-text">{{ getCourseProgress(course) }}% completado</span>
                <button 
                  *ngIf="getCourseProgress(course) === 100" 
                  class="cert-btn" 
                  (click)="downloadCertificate(course.id)"
                  [disabled]="loadingCerts[course.id]"
                >
                  {{ loadingCerts[course.id] ? 'Generando...' : '🎓 Certificado' }}
                </button>
              </div>
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
      background: var(--brand-green-vibrant);
    }

    .footer-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .progress-text {
      font-size: 0.8rem;
      color: var(--formarka-text-muted);
      font-weight: 600;
    }

    .cert-btn {
      background: var(--brand-purple-deep);
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .cert-btn:hover {
      background: var(--brand-purple-light);
      transform: translateY(-2px);
    }

    .cert-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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
  loadingCerts: { [key: string]: boolean } = {};

  public authService = inject(AuthService);
  private courseService = inject(CourseService);
  private certificateService = inject(CertificateService);
  private router = inject(Router);

  ngOnInit(): void {
    this.courseService.getMyCourses().subscribe(data => {
      this.enrolledCourses = data;
      this.calculateStats();
    });
  }

  calculateStats(): void {
    let totalProgress = 0;
    this.totalCompletedLessons = 0;

    this.enrolledCourses.forEach(course => {
      const p = this.getCourseProgress(course);
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

  getCourseProgress(course: Course): number {
    if (!course.modules) return 0;
    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    if (totalLessons === 0) return 0;
    const completedLessons = course.modules.reduce((acc, m) => 
      acc + m.lessons.filter(l => l.isCompleted).length, 0);
    return Math.round((completedLessons / totalLessons) * 100);
  }

  continueCourse(id: string): void {
    this.router.navigate(['/learning', id]);
  }

  downloadCertificate(courseId: string): void {
    this.loadingCerts[courseId] = true;
    this.certificateService.getCertificate(courseId).subscribe({
      next: (cert) => {
        this.loadingCerts[courseId] = false;
        this.certificateService.downloadCertificate(cert);
      },
      error: (err) => {
        this.loadingCerts[courseId] = false;
        console.error('Error fetching certificate:', err);
        alert('No se pudo generar el certificado. Asegúrate de haber completado todas las lecciones.');
      }
    });
  }
}

