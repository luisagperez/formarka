import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Deliverable } from '../../../core/models/course.model';
import { CourseService } from '../../../core/services/course.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-deliverable',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div class="deliverable-container glass">
      <div class="deliverable-header">
        <span class="icon">📤</span>
        <h2>Entrega de Tarea</h2>
        <p>Sube el enlace a tu trabajo (Google Drive, Dropbox, Behance, etc.) para que el instructor pueda revisarlo.</p>
      </div>

      <div class="submission-form" *ngIf="!existingDeliverable()?.id || isEditing">
        <div class="input-group">
          <label for="contentUrl">Enlace de la entrega</label>
          <input 
            type="url" 
            id="contentUrl" 
            [(ngModel)]="submissionUrl" 
            placeholder="https://drive.google.com/..."
            [disabled]="isSubmitting()"
          >
        </div>
        <div class="actions">
          <app-button 
            [disabled]="!submissionUrl || isSubmitting()" 
            [loading]="isSubmitting()"
            (onClick)="submit()"
          >
            {{ existingDeliverable()?.id ? 'Actualizar Entrega' : 'Enviar Tarea' }}
          </app-button>
          <app-button 
            variant="outline" 
            *ngIf="isEditing" 
            (onClick)="isEditing = false"
          >
            Cancelar
          </app-button>
        </div>
      </div>

      <div class="submission-status" *ngIf="existingDeliverable()?.id && !isEditing">
        <div class="status-card" [class.graded]="existingDeliverable()?.status === 'graded'">
          <div class="status-badge" [class.badge-pending]="existingDeliverable()?.status === 'pending'" [class.badge-graded]="existingDeliverable()?.status === 'graded'">
            {{ existingDeliverable()?.status === 'pending' ? 'Pendiente de revisión' : 'Calificado' }}
          </div>
          <div class="submission-detail">
            <span class="label">Enviado el:</span>
            <span class="value">{{ existingDeliverable()?.submissionDate | date:'medium' }}</span>
          </div>
          <div class="submission-link">
            <span class="label">Tu enlace:</span>
            <a [href]="existingDeliverable()?.contentUrl" target="_blank" class="value link">{{ existingDeliverable()?.contentUrl }}</a>
          </div>

          <div class="grade-box" *ngIf="existingDeliverable()?.status === 'graded'">
            <div class="grade-value">
              <span class="score">{{ existingDeliverable()?.grade }}</span>
              <span class="total">/ 100</span>
            </div>
            <div class="feedback" *ngIf="existingDeliverable()?.feedback">
              <strong>Comentarios del instructor:</strong>
              <p>{{ existingDeliverable()?.feedback }}</p>
            </div>
          </div>

          <div class="actions" *ngIf="existingDeliverable()?.status === 'pending'">
            <button class="edit-btn" (click)="isEditing = true">Editar Entrega</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .deliverable-container {
      background: white;
      padding: 40px;
      border-radius: 24px;
      border: 1px solid #eee;
      max-width: 800px;
      margin: 0 auto;
    }

    .deliverable-header { text-align: center; margin-bottom: 40px; }
    .deliverable-header .icon { font-size: 3rem; display: block; margin-bottom: 16px; }
    .deliverable-header h2 { margin-bottom: 8px; font-size: 1.8rem; }
    .deliverable-header p { color: var(--formarka-text-muted); font-size: 1.1rem; }

    .input-group { margin-bottom: 30px; }
    .input-group label { display: block; font-weight: 700; margin-bottom: 12px; color: var(--brand-black); }
    .input-group input {
      width: 100%;
      padding: 16px 20px;
      border-radius: 12px;
      border: 2px solid #eee;
      font-size: 1rem;
      transition: all 0.2s;
    }
    .input-group input:focus { border-color: var(--brand-purple-light); outline: none; }

    .actions { display: flex; gap: 16px; justify-content: center; margin-top: 20px; }

    .status-card {
      background: #fdfbff;
      border-radius: 20px;
      padding: 30px;
      border: 1px solid #eee;
    }
    .status-card.graded { border-color: var(--brand-green-vibrant); background: #f6fff9; }

    .status-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 24px;
    }
    .badge-pending { background: #fff8e6; color: #b08900; }
    .badge-graded { background: #e6ffef; color: #1e7e34; }

    .submission-detail, .submission-link { margin-bottom: 16px; display: flex; flex-direction: column; gap: 4px; }
    .label { font-size: 0.8rem; font-weight: 700; color: #999; text-transform: uppercase; }
    .value { font-weight: 600; color: var(--brand-black); }
    .link { color: var(--brand-purple-light); text-decoration: underline; word-break: break-all; }

    .grade-box {
      margin-top: 30px;
      padding-top: 30px;
      border-top: 1px solid #eee;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .grade-value { display: flex; align-items: baseline; gap: 4px; }
    .score { font-size: 3rem; font-weight: 800; color: var(--brand-purple-deep); }
    .total { font-size: 1.2rem; font-weight: 700; color: #999; }
    .feedback { background: white; padding: 20px; border-radius: 12px; border: 1px solid #f0f0f0; }

    .edit-btn {
      background: none;
      border: none;
      color: var(--brand-purple-light);
      font-weight: 700;
      cursor: pointer;
      text-decoration: underline;
    }
  `]
})
export class DeliverableComponent {
  private courseService = inject(CourseService);

  @Input({ required: true }) lessonId!: string | number;
  @Output() onComplete = new EventEmitter<void>();

  existingDeliverable = signal<Deliverable | null>(null);
  submissionUrl: string = '';
  isSubmitting = signal(false);
  isEditing = false;

  ngOnInit() {
    this.loadDeliverable();
  }

  loadDeliverable() {
    this.courseService.getDeliverable(this.lessonId).subscribe({
      next: (d) => {
        this.existingDeliverable.set(d);
        if (d) this.submissionUrl = d.contentUrl;
      },
      error: () => this.existingDeliverable.set(null)
    });
  }

  submit() {
    if (!this.submissionUrl) return;
    this.isSubmitting.set(true);
    this.courseService.submitDeliverable(this.lessonId, this.submissionUrl).subscribe({
      next: (d) => {
        this.existingDeliverable.set(d);
        this.isSubmitting.set(false);
        this.isEditing = false;
        this.onComplete.emit();
      },
      error: (err) => {
        console.error('Error submitting deliverable:', err);
        this.isSubmitting.set(false);
        alert('Error al enviar la tarea. Por favor, inténtalo de nuevo.');
      }
    });
  }
}
