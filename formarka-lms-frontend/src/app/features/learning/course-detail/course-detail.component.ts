import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { Course, Module } from '../../../core/models/course.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  template: `
    <div class="course-detail-container" *ngIf="course">
      <section class="hero animate-fade">
        <div class="container hero-grid">
          <div class="hero-content animate-up">
            <nav class="breadcrumb">
              <a routerLink="/courses">Cursos</a> 
              <span class="sep">/</span> 
              <span class="curr">{{ course.category }}</span>
            </nav>
            <h1 class="hero-title">{{ course.title }}</h1>
            <p class="description">{{ course.description }}</p>
            
            <div class="meta-info">
              <div class="meta-item">
                <span class="label">Nivel</span>
                <span class="value level-val">{{ course.level | titlecase }}</span>
              </div>
              <div class="meta-item">
                <span class="label">Instructor</span>
                <span class="value">{{ course.instructorName }}</span>
              </div>
            </div>

            <div class="actions">
              <app-button (onClick)="handleCourseAction()" [loading]="isEnrolling">
                {{ isEnrolled ? 'Continuar tu formación' : 'Empieza tu transformación' }}
              </app-button>
              <div class="price-badge glass" *ngIf="!isEnrolled">
                <span class="icon">✨</span>
                Acceso Premium
              </div>
              <div class="progress-info" *ngIf="isEnrolled">
                <span class="label">Tu progreso:</span>
                <span class="value">{{ progress }}%</span>
              </div>
            </div>
          </div>
          
          <div class="hero-image-container animate-up" style="animation-delay: 0.2s">
            <div class="image-wrapper">
              <img [src]="course.thumbnailUrl" [alt]="course.title">
              <div class="image-overlay"></div>
            </div>
          </div>
        </div>
      </section>

      <section class="container content-grid animate-up" style="animation-delay: 0.3s">
        <div class="main-info">
          <div class="info-card glass">
            <h2>Acerca de este curso</h2>
            <p>En este curso aprenderás paso a paso cómo potenciar tu marca personal o comercial. Hemos diseñado este contenido pensando en emprendedores que buscan resultados profesionales con herramientas accesibles y con criterio de diseño real.</p>
            
            <div class="learning-points">
              <h3>Lo que dominarás</h3>
              <div class="points-grid">
                <div class="point">
                  <span class="check">✔</span>
                  Conceptos fundamentales de diseño y comunicación.
                </div>
                <div class="point">
                  <span class="check">✔</span>
                  Cómo aplicar la psicología del color a tu identidad.
                </div>
                <div class="point">
                  <span class="check">✔</span>
                  Estrategias prácticas para redes sociales.
                </div>
                <div class="point">
                  <span class="check">✔</span>
                  Optimización de recursos visuales de alto impacto.
                </div>
              </div>
            </div>
          </div>

          <div class="syllabus">
            <h3>Plan de Estudios</h3>
            <div 
              class="module-card" 
              *ngFor="let module of course.modules; let i = index" 
              [class.is-open]="module.isOpen"
            >
              <!-- Interactive Header to open/close -->
              <div class="module-header" (click)="toggleModule(module)">
                <div class="module-title">
                  <span class="module-num">{{ i + 1 }}</span>
                  <h4>{{ module.title }}</h4>
                </div>
                <div class="header-right">
                  <span class="lesson-count">{{ module.lessons.length }} lecciones</span>
                  <span class="chevron" [class.rotated]="module.isOpen">▼</span>
                </div>
              </div>

              <!-- Collapsible Body -->
              <div class="lesson-list-container" [style.max-height]="module.isOpen ? '1000px' : '0'">
                <ul class="lesson-list">
                  <li *ngFor="let lesson of module.lessons">
                    <div class="lesson-info">
                      <span class="play-icon">▶</span>
                      <span class="lesson-name">{{ lesson.title }}</span>
                    </div>
                    <span class="duration">{{ lesson.duration || '15:00' }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <aside class="sidebar">
          <div class="sticky-card glass animate-up" style="animation-delay: 0.5s">
            <h3>Garantía Formarka</h3>
            <p>Acceso ilimitado a las actualizaciones y soporte directo de nuestra comunidad de expertos.</p>
            <div class="divider"></div>
            <div class="features">
              <div class="feature">
                <span class="feat-icon">🌐</span>
                <span>100% Online y a tu ritmo</span>
              </div>
              <div class="feature">
                <span class="feat-icon">📜</span>
                <span>Certificado de excelencia</span>
              </div>
              <div class="feature">
                <span class="feat-icon">📥</span>
                <span>Recursos y plantillas Premium</span>
              </div>
            </div>
            <app-button variant="outline" class="full-width" style="margin-top: 30px">
              Solicitar información
            </app-button>
          </div>
        </aside>
      </section>
    </div>
  `,
  styles: [`
    .course-detail-container { background: var(--formarka-bg-light); }

    .hero {
      background: linear-gradient(135deg, var(--brand-black) 0%, var(--brand-purple-deep) 100%);
      color: var(--formarka-white);
      padding: 100px 0;
      margin-bottom: 80px;
      position: relative;
      overflow: hidden;
    }

    .hero-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 60px; align-items: center; }

    .hero-title {
      color: var(--formarka-white);
      font-size: 3.5rem;
      margin-bottom: 24px;
      line-height: 1.1;
      letter-spacing: -2px;
    }

    .description { font-size: 1.2rem; margin-bottom: 40px; opacity: 0.9; line-height: 1.5; }

    .meta-info { display: flex; gap: 40px; margin-bottom: 50px; }
    .meta-item .label { display: block; font-size: 0.7rem; text-transform: uppercase; color: var(--brand-purple-light); margin-bottom: 4px; font-weight: 800; }
    .meta-item .value { font-weight: 700; font-size: 1.1rem; }

    .actions { display: flex; align-items: center; gap: 20px; }

    @media (max-width: 576px) {
      .actions { flex-direction: column; align-items: stretch; }
      .price-badge { justify-content: center; }
    }

    .hero-image-container .image-wrapper {
      border-radius: 40px;
      overflow: hidden;
      box-shadow: 0 30px 70px rgba(0,0,0,0.5);
    }
    .hero-image-container img { width: 100%; display: block; }

    .content-grid { display: grid; grid-template-columns: 1fr 380px; gap: 60px; padding-bottom: 100px; }

    .info-card { padding: 40px; border-radius: 32px; margin-bottom: 40px; background: white; border: 1px solid #eee; }

    .learning-points { background: #fafafa; padding: 30px; border-radius: 24px; margin-top: 30px; }
    .points-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .point { display: flex; gap: 12px; font-weight: 600; font-size: 0.95rem; }
    .point .check { color: var(--brand-green-vibrant); }

    /* Accordion Syllabus Styles */
    .syllabus h3 { font-size: 1.8rem; margin-bottom: 30px; }

    .module-card {
      background: white;
      border-radius: 20px;
      margin-bottom: 16px;
      border: 1.5px solid #f0f0f0;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .module-card:hover { border-color: var(--brand-purple-light); }
    .module-card.is-open { border-color: var(--brand-purple-deep); box-shadow: 0 10px 30px rgba(78, 7, 103, 0.05); }

    .module-header {
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fdfbff;
      cursor: pointer;
      user-select: none;
    }

    .module-title { display: flex; align-items: center; gap: 16px; }
    .module-num {
      width: 32px; height: 32px; background: var(--brand-purple-deep); color: white;
      border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem;
    }

    .module-header h4 { margin: 0; font-size: 1.1rem; color: var(--brand-black); }

    .header-right { display: flex; align-items: center; gap: 15px; }
    .lesson-count { font-weight: 700; font-size: 0.85rem; color: var(--formarka-text-muted); }
    .chevron { color: var(--brand-purple-light); font-size: 0.8rem; transition: transform 0.3s ease; }
    .chevron.rotated { transform: rotate(180deg); }

    .lesson-list-container {
      overflow: hidden;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .lesson-list { list-style: none; padding: 0; border-top: 1px solid #f9f9f9; }
    .lesson-list li {
      padding: 14px 24px 14px 64px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #fafafa;
    }

    .lesson-info { display: flex; align-items: center; gap: 12px; }
    .play-icon { color: var(--brand-purple-light); font-size: 0.7rem; opacity: 0.5; }
    .lesson-name { font-weight: 600; font-size: 0.9rem; color: #444; }
    .duration { color: var(--formarka-text-muted); font-size: 0.8rem; font-weight: 700; }

    .sticky-card { position: sticky; top: 100px; padding: 40px; border-radius: 32px; background: white; border: 1px solid #eee; box-shadow: 0 20px 50px rgba(0,0,0,0.05); }
    .divider { height: 1px; background: #eee; margin: 30px 0; }
    .features { display: flex; flex-direction: column; gap: 15px; }
    .feature { display: flex; align-items: center; gap: 12px; font-weight: 700; color: #444; font-size: 0.9rem; }

    @media (max-width: 992px) {
      .hero h1 { font-size: 2.5rem; }
      .hero-grid, .content-grid { grid-template-columns: 1fr; }
      .sidebar { display: none; }
    }
  `]
})
export class CourseDetailComponent implements OnInit {
  course?: Course;
  isEnrolling = false;
  isEnrolled = false;
  progress = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.courseService.getCourse(id).subscribe(course => {
        this.course = course;
        if (course) {
          this.isEnrolled = course.isEnrolled || this.courseService.isEnrolled(course.id);
          this.progress = this.courseService.getCourseProgress(course.id);
          // By default, only first module open
          if (this.course?.modules && this.course.modules.length > 0) {
            this.course.modules[0].isOpen = true;
          }
        }
      });
    }
  }

  toggleModule(module: Module): void {
    module.isOpen = !module.isOpen;
  }

  handleCourseAction(): void {
    if (this.isEnrolled) {
      this.router.navigate(['/learning', this.course?.id]);
    } else {
      this.enroll();
    }
  }

  enroll(): void {
    if (!this.course) return;
    this.isEnrolling = true;
    this.courseService.enroll(this.course.id).subscribe({
      next: () => {
        this.isEnrolling = false;
        this.isEnrolled = true;
        this.router.navigate(['/learning', this.course?.id]);
      },
      error: () => {
        this.isEnrolling = false;
        alert('Error al matricularte.');
      }
    });
  }
}
