import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Course } from '../../../core/models/course.model';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="course-card">
      <div class="card-image">
        <img [src]="course.thumbnailUrl" [alt]="course.title">
        <span class="category">{{ course.category }}</span>
      </div>
      <div class="card-content">
        <div class="card-header">
          <span class="level" [ngClass]="course.level">{{ course.level | titlecase }}</span>
          <span class="instructor">por {{ course.instructorName }}</span>
        </div>
        <h3>{{ course.title }}</h3>
        <p>{{ course.description }}</p>
        <div class="card-footer">
          <app-button variant="outline" (onClick)="onAction.emit(course.id)">
            Ver Curso
          </app-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .course-card {
      background: var(--formarka-white);
      border-radius: 32px;
      overflow: hidden;
      box-shadow: 0 12px 40px rgba(78, 7, 103, 0.08);
      transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
      display: flex;
      flex-direction: column;
      height: 100%;
      border: 1px solid rgba(78, 7, 103, 0.05);
      position: relative;
    }

    .course-card:hover {
      transform: translateY(-12px);
      box-shadow: 0 20px 60px rgba(78, 7, 103, 0.15);
      border-color: rgba(78, 7, 103, 0.1);
    }

    .card-image {
      position: relative;
      height: 220px;
      overflow: hidden;
    }

    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.8s ease;
    }

    .course-card:hover .card-image img {
      transform: scale(1.1);
    }

    .category {
      position: absolute;
      top: 20px;
      right: 20px;
      background: var(--brand-purple-deep);
      color: white;
      padding: 8px 18px;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      backdrop-filter: blur(8px);
      z-index: 2;
    }

    .card-content {
      padding: 28px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .level {
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      padding: 6px 12px;
      border-radius: 100px;
      letter-spacing: 0.5px;
    }

    .level.básico { background: #E6FCE6; color: #008000; border: 1.5px solid #00D80033; }
    .level.intermedio { background: #FFF9E6; color: #B38600; border: 1.5px solid #E3C50533; }
    .level.avanzado { background: #FCE6F3; color: #9B0058; border: 1.5px solid #CA63F033; }

    .instructor {
      font-size: 0.85rem;
      color: var(--formarka-text-muted);
      font-weight: 600;
    }

    h3 {
      font-size: 1.4rem;
      margin-bottom: 14px;
      line-height: 1.2;
      color: var(--brand-black);
      font-weight: 800;
    }

    p {
      font-size: 1rem;
      color: var(--formarka-text-muted);
      margin-bottom: 28px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex-grow: 1;
      line-height: 1.6;
    }

    .card-footer {
      margin-top: auto;
    }
  `]
})
export class CourseCardComponent {
  @Input({ required: true }) course!: Course;
  @Output() onAction = new EventEmitter<string>();
}
