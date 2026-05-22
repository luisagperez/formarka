import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { StudentProgress, Course } from '../../../core/models/course.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, FormsModule],
  template: `
    <div class="container admin-container animate-up">
      <div class="admin-header">
        <div>
          <h1 class="text-gradient">Estudiantes del Curso</h1>
          <p>Seguimiento de progreso, calificaciones y entregables de {{ course?.title }}.</p>
        </div>
        <app-button variant="outline" routerLink="/admin/courses">Volver</app-button>
      </div>

      <div class="table-card glass">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Progreso</th>
              <th>Calificación Promedio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let student of students" class="animate-up">
              <td>
                <div class="user-cell">
                  <div class="user-avatar">{{ student.studentName.charAt(0) }}</div>
                  <strong>{{ student.studentName }}</strong>
                </div>
              </td>
              <td>
                <div class="progress-wrapper">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="student.progress"></div>
                  </div>
                  <span class="progress-text">{{ student.progress }}%</span>
                </div>
              </td>
              <td>
                <span class="grade-badge" [class.low]="(student.grade || 0) < 70" [class.high]="(student.grade || 0) >= 90">
                  {{ student.grade ? student.grade + '%' : 'N/A' }}
                </span>
              </td>
              <td>
                <span class="status-pill" [class.completed]="student.progress === 100">
                  {{ student.progress === 100 ? 'Completado' : 'En curso' }}
                </span>
              </td>
              <td class="actions-cell">
                <app-button variant="outline" (onClick)="viewDeliverables(student)">Revisar Entregables</app-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Deliverables Modal -->
      <div class="modal-overlay" *ngIf="selectedStudent">
        <div class="modal-content glass animate-up large-modal">
          <div class="modal-header">
            <h3>Entregables de {{ selectedStudent.studentName }}</h3>
            <button class="close-btn" (click)="selectedStudent = null">×</button>
          </div>
          
          <div class="deliverables-list">
            <div *ngIf="mockDeliverables.length === 0" class="empty-state">
              No hay entregables pendientes.
            </div>
            <div *ngFor="let del of mockDeliverables" class="deliverable-item card animate-up">
              <div class="del-header">
                <h4>Definición de Buyer Persona</h4>
                <span class="del-date">{{ del.submissionDate }}</span>
              </div>
              <p>El estudiante ha enviado su propuesta de marca y segmentación.</p>
              <a [href]="del.contentUrl" target="_blank" class="view-link">📄 Ver Archivo Enviado</a>
              
              <div class="grading-section">
                <div class="form-field">
                  <label>Calificación (0-100)</label>
                  <input type="number" [(ngModel)]="gradeValue" class="grade-input" placeholder="90">
                </div>
                <div class="form-field">
                  <label>Feedback / Comentarios</label>
                  <textarea [(ngModel)]="feedbackText" class="feedback-input" placeholder="¡Excelente trabajo! Solo ajusta..."></textarea>
                </div>
                <app-button (onClick)="submitGrade(del.id)">Guardar Calificación</app-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container { padding: 40px 0; }
    .admin-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
    .table-card { border-radius: 32px; overflow: hidden; background: white; }
    .admin-table { width: 100%; border-collapse: collapse; }
    .admin-table th { padding: 20px; text-align: left; background: #fafafa; color: var(--brand-purple-deep); }
    .admin-table td { padding: 20px; border-bottom: 1px solid #eee; }
    
    .user-cell { display: flex; align-items: center; gap: 12px; }
    .user-avatar { width: 36px; height: 36px; background: var(--brand-purple-light); color: var(--brand-purple-deep); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; }
    
    .progress-wrapper { display: flex; align-items: center; gap: 12px; }
    .progress-bar { flex: 1; height: 8px; background: #eee; border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--brand-purple-deep); transition: width 0.3s; }
    .progress-text { font-size: 0.85rem; font-weight: 700; min-width: 40px; }
    
    .grade-badge { padding: 4px 10px; border-radius: 8px; font-weight: 800; background: #f0f0f0; }
    .grade-badge.high { background: #dcfce7; color: #15803d; }
    .grade-badge.low { background: #fee2e2; color: #ef4444; }
    
    .status-pill { padding: 4px 12px; border-radius: 100px; font-size: 0.8rem; font-weight: 700; background: #f3f4f6; color: #6b7280; }
    .status-pill.completed { background: #dcfce7; color: #15803d; }

    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .large-modal { width: 800px; max-height: 90vh; overflow-y: auto; background: white; padding: 40px; border-radius: 32px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .close-btn { background: none; border: none; font-size: 2rem; cursor: pointer; color: #999; }
    
    .deliverable-item { padding: 24px; border: 1.5px solid #eee; border-radius: 20px; margin-bottom: 20px; }
    .del-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
    .del-date { font-size: 0.85rem; color: #999; }
    .view-link { display: inline-block; margin: 15px 0; color: var(--brand-purple-deep); font-weight: 700; text-decoration: none; }
    
    .grading-section { background: #f9fafb; padding: 20px; border-radius: 16px; margin-top: 20px; }
    .grade-input { width: 100px; padding: 10px; border-radius: 10px; border: 1.5px solid #ddd; margin-bottom: 15px; }
    .feedback-input { width: 100%; padding: 12px; border-radius: 12px; border: 1.5px solid #ddd; min-height: 80px; margin-bottom: 15px; }
  `]
})
export class AdminStudentsComponent implements OnInit {
  courseId: string = '';
  course?: Course;
  students: StudentProgress[] = [];
  selectedStudent: StudentProgress | null = null;
  
  gradeValue: number = 0;
  feedbackText: string = '';

  mockDeliverables = [
    { id: 'd1', submissionDate: '2026-05-15', contentUrl: '#', status: 'pending' }
  ];

  constructor(private route: ActivatedRoute, private courseService: CourseService) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    this.courseService.getCourse(this.courseId).subscribe(c => this.course = c);
    this.courseService.getEnrolledStudents(this.courseId).subscribe(s => this.students = s);
  }

  viewDeliverables(student: StudentProgress) {
    this.selectedStudent = student;
  }

  submitGrade(delId: string) {
    if (!this.selectedStudent) return;
    
    this.courseService.gradeDeliverable(this.courseId, this.selectedStudent.studentId, this.gradeValue, this.feedbackText).subscribe(() => {
      alert(`Calificación de ${this.gradeValue} guardada con éxito para ${this.selectedStudent?.studentName}`);
      this.courseService.getEnrolledStudents(this.courseId).subscribe(s => this.students = s);
      this.selectedStudent = null;
    });
  }
}
