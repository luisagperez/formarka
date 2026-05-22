import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';
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
              <app-button (onClick)="enroll()" [loading]="isEnrolling">
                Empieza tu transformación
              </app-button>
              <div class="price-badge glass">
                <span class="icon">✨</span>
                Acceso Premium
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
            <div class="module-card animate-up" *ngFor="let module of course.modules; let i = index" [style.animation-delay]="0.4 + (i * 0.1) + 's'">
              <div class="module-header">
                <div class="module-title">
                  <span class="module-num">{{ i + 1 }}</span>
                  <h4>{{ module.title }}</h4>
                </div>
                <span class="lesson-count">{{ module.lessons.length }} lecciones</span>
              </div>
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
    .course-detail-container {
      background: var(--formarka-bg-light);
    }

    .hero {
      background: linear-gradient(135deg, var(--brand-black) 0%, var(--brand-purple-deep) 100%);
      color: var(--formarka-white);
      padding: 100px 0;
      margin-bottom: 80px;
      position: relative;
      overflow: hidden;
    }

    .hero::after {
      content: '';
      position: absolute;
      bottom: -50px;
      right: -50px;
      width: 300px;
      height: 300px;
      background: var(--brand-green-vibrant);
      filter: blur(150px);
      opacity: 0.15;
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 60px;
      align-items: center;
    }

    .breadcrumb {
      font-size: 0.95rem;
      margin-bottom: 24px;
      font-weight: 600;
      display: flex;
      gap: 10px;
      opacity: 0.8;
    }

    .breadcrumb a { color: var(--brand-purple-light); text-decoration: none; }
    .breadcrumb .sep { color: #555; }

    .hero-title {
      color: var(--formarka-white);
      font-size: 4rem;
      margin-bottom: 24px;
      line-height: 1.1;
      letter-spacing: -2px;
    }

    .description {
      font-size: 1.3rem;
      margin-bottom: 40px;
      opacity: 0.9;
      line-height: 1.5;
      max-width: 600px;
    }

    .meta-info {
      display: flex;
      gap: 60px;
      margin-bottom: 50px;
    }

    .meta-item .label {
      display: block;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: var(--brand-purple-light);
      margin-bottom: 8px;
      font-weight: 800;
    }

    .meta-item .value {
      font-weight: 700;
      font-size: 1.2rem;
    }

    .level-val { color: var(--brand-green-vibrant); }

    .actions {
      display: flex;
      align-items: center;
      gap: 30px;
    }

    .price-badge {
      padding: 10px 24px;
      border-radius: 100px;
      font-weight: 800;
      color: var(--brand-purple-light);
      border-color: rgba(202, 99, 240, 0.2);
    }

    .hero-image-container .image-wrapper {
      position: relative;
      border-radius: 40px;
      overflow: hidden;
      box-shadow: 0 30px 70px rgba(0,0,0,0.5);
      border: 4px solid rgba(255,255,255,0.1);
    }

    .hero-image-container img {
      width: 100%;
      display: block;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 60px;
      padding-bottom: 100px;
    }

    .info-card {
      padding: 50px;
      border-radius: 40px;
      margin-bottom: 60px;
      background: white;
    }

    h2 { font-size: 2.2rem; margin-bottom: 30px; color: var(--brand-black); }
    h3 { font-size: 1.6rem; margin-bottom: 30px; color: var(--brand-purple-deep); }

    .main-info p {
      font-size: 1.15rem;
      color: var(--formarka-text-muted);
      margin-bottom: 50px;
      line-height: 1.7;
    }

    .learning-points {
      background: #fafafa;
      padding: 40px;
      border-radius: 30px;
      border: 1px solid #eee;
    }

    .points-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .point {
      display: flex;
      gap: 15px;
      font-weight: 600;
      color: var(--brand-black);
    }

    .point .check {
      color: var(--brand-green-vibrant);
      font-weight: 900;
    }

    .module-card {
      background: white;
      border-radius: 24px;
      margin-bottom: 24px;
      border: 1px solid #eee;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .module-card:hover {
      box-shadow: 0 10px 30px rgba(78, 7, 103, 0.05);
      border-color: var(--brand-purple-light);
    }

    .module-header {
      padding: 24px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fdfbff;
    }

    .module-title {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .module-num {
      width: 36px;
      height: 36px;
      background: var(--brand-purple-deep);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      flex-shrink: 0;
    }

    .module-header h4 { margin: 0; font-size: 1.2rem; }
    .lesson-count { font-weight: 700; font-size: 0.9rem; color: var(--brand-purple-light); }

    .lesson-list { list-style: none; padding: 10px 0; }
    .lesson-list li {
      padding: 16px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background 0.2s;
    }

    .lesson-list li:hover { background: #f9f9f9; }

    .lesson-info { display: flex; align-items: center; gap: 15px; }
    .play-icon { color: var(--brand-purple-light); font-size: 0.8rem; }
    .lesson-name { font-weight: 600; color: var(--formarka-text); }
    .duration { color: var(--formarka-text-muted); font-size: 0.85rem; font-weight: 700; }

    .sticky-card {
      position: sticky;
      top: 120px;
      padding: 40px;
      border-radius: 40px;
      background: white;
      box-shadow: 0 20px 50px rgba(0,0,0,0.05);
    }

    .divider { height: 1px; background: #eee; margin: 30px 0; }

    .features { display: flex; flex-direction: column; gap: 20px; }
    .feature { display: flex; align-items: center; gap: 15px; font-weight: 700; color: var(--brand-black); font-size: 0.95rem; }
    .feat-icon { font-size: 1.2rem; }

    .full-width { width: 100%; }

    @media (max-width: 1200px) {
      .hero h1 { font-size: 3rem; }
      .content-grid { grid-template-columns: 1fr; }
      .sidebar { display: none; }
    }

    @media (max-width: 992px) {
      .hero-grid { grid-template-columns: 1fr; text-align: center; }
      .hero-content { display: flex; flex-direction: column; align-items: center; }
      .meta-info { justify-content: center; }
      .actions { flex-direction: column; width: 100%; }
      .points-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class CourseDetailComponent implements OnInit {
  course?: Course;
  isEnrolling = false;

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
      });
    }
  }

  enroll(): void {
    if (!this.course) return;
    
    this.isEnrolling = true;
    this.courseService.enroll(this.course.id).subscribe({
      next: () => {
        this.isEnrolling = false;
        // After enrollment, go to the player
        this.router.navigate(['/learning', this.course?.id]);
      },
      error: () => {
        this.isEnrolling = false;
        alert('Hubo un error al matricularte. Inténtalo de nuevo.');
      }
    });
  }
}
