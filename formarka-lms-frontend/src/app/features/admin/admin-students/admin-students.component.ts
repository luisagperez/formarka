import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { StudentProgress, Course } from '../../../core/models/course.model';
import { User } from '../../../core/models/user.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, FormsModule],
  template: `
    <div class="container admin-container animate-up">
      <div class="admin-header">
        <div class="title-area">
          <nav class="breadcrumb">
            <a routerLink="/admin/courses">Gestión de Cursos</a> 
            <span class="sep">/</span> 
            <span class="curr">Estudiantes</span>
          </nav>
          <h1 class="text-gradient">Gestión de Alumnos</h1>
          <p class="subtitle">Control de inscripciones y seguimiento de progreso para <strong>{{ course?.title }}</strong></p>
        </div>
        <div class="header-actions">
          <app-button (onClick)="openEnrollModal()">
            <span class="icon">➕</span> Inscribir Nuevo Alumno
          </app-button>
        </div>
      </div>

      <!-- Stats Quick View -->
      <div class="stats-grid animate-up" style="animation-delay: 0.1s">
        <div class="stat-card glass">
          <span class="stat-label">Total Inscritos</span>
          <span class="stat-value">{{ students.length }}</span>
        </div>
        <div class="stat-card glass">
          <span class="stat-label">Promedio de Progreso</span>
          <span class="stat-value">{{ averageProgress }}%</span>
        </div>
        <div class="stat-card glass">
          <span class="stat-label">Completados</span>
          <span class="stat-value">{{ completedCount }}</span>
        </div>
      </div>

      <div class="search-bar-container animate-up" style="animation-delay: 0.15s">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            placeholder="Buscar por nombre o correo..."
            class="search-input"
          />
        </div>
      </div>

      <div class="table-card glass animate-up" style="animation-delay: 0.2s">
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Progreso</th>
                <th>Calificación</th>
                <th>Estado</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let student of filteredStudents" class="student-row">
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">{{ student.studentName.charAt(0) }}</div>
                    <div class="user-info">
                      <span class="user-name">{{ student.studentName }}</span>
                      <span class="user-id">ID: {{ student.studentId.substring(0, 8) }}...</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="progress-container">
                    <div class="progress-bar-bg">
                      <div class="progress-bar-fill" [style.width.%]="student.progress"></div>
                    </div>
                    <span class="progress-label">{{ student.progress }}%</span>
                  </div>
                </td>
                <td>
                  <span class="grade-badge" 
                    [class.low]="(student.grade || 0) < 70" 
                    [class.high]="(student.grade || 0) >= 90"
                    *ngIf="student.grade">
                    {{ student.grade }}%
                  </span>
                  <span class="no-grade" *ngIf="!student.grade">N/A</span>
                </td>
                <td>
                  <span class="status-pill" [class.completed]="student.progress === 100">
                    {{ student.progress === 100 ? 'Certificado' : 'En Curso' }}
                  </span>
                </td>
                <td class="actions-cell text-right">
                  <div class="action-group">
                    <button class="icon-action-btn" (click)="viewDeliverables(student)" title="Ver Entregables">📂</button>
                    <button class="icon-action-btn delete" (click)="unenrollStudent(student)" title="Eliminar Inscripción">🗑️</button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredStudents.length === 0">
                <td colspan="5" class="empty-row">
                  <div class="empty-state">
                    <span class="empty-icon">👥</span>
                    <p>No se encontraron estudiantes para los filtros aplicados.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Enrollment Modal -->
      <div class="modal-overlay" *ngIf="showEnrollModal">
        <div class="modal-content glass animate-up enroll-modal">
          <div class="modal-header">
            <div>
              <h3>Inscribir Estudiante</h3>
              <p class="modal-subtitle">Selecciona un usuario de la plataforma para asignarlo a este curso.</p>
            </div>
            <button class="close-btn" (click)="showEnrollModal = false">×</button>
          </div>
          
          <div class="enroll-search">
            <input 
              type="text" 
              [(ngModel)]="userSearchTerm" 
              placeholder="Buscar por nombre o email..."
              class="search-input modal-search"
            />
          </div>

          <div class="available-users-list">
            <div *ngIf="isSearchingUsers" class="loading-users">Buscando usuarios...</div>
            <div *ngFor="let user of availableUsers" class="user-pick-item animate-up">
              <div class="user-cell">
                <div class="user-avatar">{{ user.name.charAt(0) }}</div>
                <div class="user-info">
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-email">{{ user.email }}</span>
                </div>
              </div>
              <app-button size="small" (onClick)="confirmEnroll(user)" [loading]="enrollingUserId === user.id">
                Inscribir
              </app-button>
            </div>
            <div *ngIf="availableUsers.length === 0 && !isSearchingUsers" class="empty-state small">
              No hay más estudiantes disponibles para este curso.
            </div>
          </div>
        </div>
      </div>

      <!-- Deliverables Modal (Existing, improved styles) -->
      <div class="modal-overlay" *ngIf="selectedStudent">
        <div class="modal-content glass animate-up large-modal">
          <div class="modal-header">
            <div>
              <h3>Entregables: {{ selectedStudent.studentName }}</h3>
              <p class="modal-subtitle">Revisa y califica las tareas enviadas por el alumno.</p>
            </div>
            <button class="close-btn" (click)="selectedStudent = null">×</button>
          </div>
          
          <div class="deliverables-list">
            <div *ngIf="isLoadingDeliverables" class="loading-users">Cargando trabajos...</div>
            <div *ngFor="let del of deliverables" class="deliverable-card card animate-up">
              <div class="del-info">
                <div class="del-main">
                  <h4>Lección #{{ del.lessonId }}</h4>
                  <span class="del-status-tag" [class.graded]="del.status === 'graded'">{{ del.status === 'graded' ? 'CALIFICADO' : 'PENDIENTE' }}</span>
                </div>
                <span class="del-date">Enviado el {{ del.submissionDate | date:'mediumDate' }}</span>
                <a [href]="del.contentUrl" target="_blank" class="file-link">
                  <span class="icon">📄</span> Ver Documento / Enlace
                </a>
              </div>
              
              <div class="grading-panel">
                <div class="grading-form">
                  <div class="input-group">
                    <label>Nota (0-100)</label>
                    <input type="number" [(ngModel)]="gradeValue" class="grade-input" max="100" min="0">
                  </div>
                  <div class="input-group full">
                    <label>Feedback para el alumno</label>
                    <textarea [(ngModel)]="feedbackText" class="feedback-input" placeholder="Escribe tus comentarios aquí..."></textarea>
                  </div>
                </div>
                <app-button (onClick)="submitGrade(del.id)" size="small" [loading]="isSavingGrade">Guardar y Notificar</app-button>
              </div>
            </div>
            <div *ngIf="!isLoadingDeliverables && deliverables.length === 0" class="empty-state">
              <p>El alumno aún no ha realizado envíos.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container { padding: 40px 24px; }
    .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .breadcrumb { font-size: 0.9rem; color: #666; margin-bottom: 8px; display: flex; gap: 8px; align-items: center; }
    .breadcrumb a { color: var(--brand-purple-deep); text-decoration: none; font-weight: 600; }
    .breadcrumb .sep { color: #ccc; }
    .subtitle { color: #666; font-size: 1.1rem; }
    .subtitle strong { color: var(--brand-purple-deep); }

    /* Stats Grid */
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: white; padding: 24px; border-radius: 24px; border: 1px solid rgba(78, 7, 103, 0.05); }
    .stat-label { display: block; font-size: 0.85rem; color: #666; font-weight: 700; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
    .stat-value { font-size: 2rem; font-weight: 800; color: var(--brand-purple-deep); }

    /* Search Bar */
    .search-bar-container { margin-bottom: 25px; }
    .search-input-wrapper { position: relative; max-width: 500px; }
    .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #999; }
    .search-input { width: 100%; padding: 14px 20px 14px 48px; border: 1.5px solid #eee; border-radius: 16px; font-size: 1rem; outline: none; transition: all 0.3s; }
    .search-input:focus { border-color: var(--brand-purple-light); box-shadow: 0 0 0 4px rgba(202, 99, 240, 0.1); }

    /* Table Styles */
    .table-card { background: white; border-radius: 24px; overflow: hidden; border: 1px solid #eee; }
    .admin-table { width: 100%; border-collapse: collapse; }
    .admin-table th { padding: 18px 24px; text-align: left; background: #fdfbff; font-weight: 800; color: var(--brand-purple-deep); font-size: 0.9rem; border-bottom: 1px solid #eee; }
    .student-row { transition: background 0.2s; }
    .student-row:hover { background: #fcfaff; }
    .admin-table td { padding: 18px 24px; border-bottom: 1px solid #f5f5f5; vertical-align: middle; }
    
    .user-cell { display: flex; align-items: center; gap: 14px; }
    .user-avatar { width: 42px; height: 42px; background: linear-gradient(135deg, var(--brand-purple-light), var(--brand-purple-deep)); color: white; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; }
    .user-info { display: flex; flex-direction: column; }
    .user-name { font-weight: 700; color: var(--brand-black); }
    .user-id { font-size: 0.75rem; color: #999; }
    .user-email { font-size: 0.8rem; color: #666; }
    
    .progress-container { display: flex; align-items: center; gap: 12px; min-width: 140px; }
    .progress-bar-bg { flex: 1; height: 10px; background: #f0f0f0; border-radius: 100px; overflow: hidden; }
    .progress-bar-fill { height: 100%; background: linear-gradient(to right, var(--brand-purple-light), var(--brand-purple-deep)); border-radius: 100px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }
    .progress-label { font-size: 0.85rem; font-weight: 800; min-width: 40px; color: var(--brand-purple-deep); }
    
    .grade-badge { padding: 6px 12px; border-radius: 10px; font-weight: 800; background: #f3f4f6; color: #374151; font-size: 0.85rem; }
    .grade-badge.high { background: #dcfce7; color: #15803d; }
    .grade-badge.low { background: #fee2e2; color: #ef4444; }
    .no-grade { font-size: 0.85rem; color: #ccc; }
    
    .status-pill { padding: 6px 14px; border-radius: 100px; font-size: 0.75rem; font-weight: 800; background: #fff7ed; color: #9a3412; border: 1px solid #ffedd5; }
    .status-pill.completed { background: #ecfdf5; color: #047857; border-color: #d1fae5; }

    .action-group { display: flex; gap: 8px; justify-content: flex-end; }
    .icon-action-btn { background: white; border: 1.5px solid #eee; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; font-size: 1rem; }
    .icon-action-btn:hover { border-color: var(--brand-purple-light); background: #fdfbff; transform: translateY(-2px); }
    .icon-action-btn.delete:hover { border-color: #ef4444; background: #fef2f2; color: #ef4444; }

    /* Modals */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .enroll-modal { width: 500px; padding: 32px; border-radius: 32px; background: white; }
    .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .modal-subtitle { color: #666; font-size: 0.9rem; margin-top: 4px; }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #ccc; transition: color 0.2s; }
    .close-btn:hover { color: #333; }

    .available-users-list { max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding-right: 8px; margin-top: 20px; }
    .user-pick-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-radius: 16px; border: 1px solid #f5f5f5; }
    .user-pick-item:hover { border-color: var(--brand-purple-light); background: #fdfbff; }

    .deliverable-card { padding: 24px; border: 1px solid #eee; border-radius: 24px; margin-bottom: 24px; background: #fff; }
    .del-info { margin-bottom: 20px; }
    .del-main { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .del-status-tag { font-size: 0.7rem; font-weight: 800; padding: 4px 8px; border-radius: 6px; background: #fef3c7; color: #92400e; }
    .del-status-tag.graded { background: #dcfce7; color: #166534; }
    .file-link { color: var(--brand-purple-deep); font-weight: 700; text-decoration: none; font-size: 0.9rem; display: flex; align-items: center; gap: 6px; margin-top: 10px; }

    .grading-panel { border-top: 1px solid #f0f0f0; padding-top: 20px; }
    .grading-form { display: grid; grid-template-columns: 100px 1fr; gap: 20px; margin-bottom: 15px; }
    .input-group label { display: block; font-size: 0.8rem; font-weight: 700; color: #666; margin-bottom: 6px; }
    .grade-input { width: 100%; padding: 10px; border-radius: 10px; border: 1.5px solid #eee; font-weight: 700; }
    .feedback-input { width: 100%; padding: 12px; border-radius: 12px; border: 1.5px solid #eee; min-height: 80px; resize: vertical; }

    .empty-state { text-align: center; padding: 60px 0; color: #999; }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 15px; opacity: 0.3; }
    .loading-users { text-align: center; padding: 30px; font-weight: 600; color: var(--brand-purple-deep); }

    @media (max-width: 768px) {
      .admin-container { padding: 20px; }
      .admin-header { flex-direction: column; align-items: flex-start; gap: 20px; }
      .header-actions { width: 100%; }
      .stats-grid { grid-template-columns: 1fr; }
      .large-modal { width: 95%; padding: 20px; }
      .grading-form { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminStudentsComponent implements OnInit {
  private courseService = inject(CourseService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  courseId: string = '';
  course?: Course;
  students: StudentProgress[] = [];
  allSystemUsers: User[] = [];
  
  searchTerm: string = '';
  userSearchTerm: string = '';
  
  showEnrollModal = false;
  isSearchingUsers = false;
  enrollingUserId: string | null = null;
  
  selectedStudent: StudentProgress | null = null;
  deliverables: any[] = [];
  isLoadingDeliverables = false;
  isSavingGrade = false;
  
  gradeValue: number = 0;
  feedbackText: string = '';

  get userRole() {
    return this.authService.currentUser()?.role || 'student';
  }

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    this.refreshData();
  }

  refreshData() {
    forkJoin({
      course: this.courseService.getCourse(this.courseId),
      students: this.courseService.getEnrolledStudents(this.courseId),
      users: this.authService.getUsers()
    }).subscribe({
      next: (res) => {
        this.course = res.course;
        this.students = res.students;
        this.allSystemUsers = res.users;
      },
      error: (err) => console.error('Error refreshing admin-students data:', err)
    });
  }

  get filteredStudents() {
    if (!this.searchTerm) return this.students;
    const term = this.searchTerm.toLowerCase();
    return this.students.filter(s => 
      s.studentName.toLowerCase().includes(term) || 
      s.studentId.includes(term)
    );
  }

  get availableUsers() {
    // Users that are NOT already enrolled and match the search term
    const enrolledIds = this.students.map(s => s.studentId);
    return this.allSystemUsers.filter(u => 
      !enrolledIds.includes(u.id) && 
      (u.name.toLowerCase().includes(this.userSearchTerm.toLowerCase()) || 
       u.email.toLowerCase().includes(this.userSearchTerm.toLowerCase()))
    );
  }

  get averageProgress() {
    if (this.students.length === 0) return 0;
    const total = this.students.reduce((acc, s) => acc + s.progress, 0);
    return Math.round(total / this.students.length);
  }

  get completedCount() {
    return this.students.filter(s => s.progress === 100).length;
  }

  openEnrollModal() {
    this.userSearchTerm = '';
    this.showEnrollModal = true;
  }

  confirmEnroll(user: User) {
    this.enrollingUserId = user.id;
    this.courseService.enrollStudent(this.courseId, user.id).subscribe({
      next: (success) => {
        this.enrollingUserId = null;
        if (success) {
          this.refreshData();
          // Optionally keep modal open or close it
        } else {
          alert('Error al inscribir al estudiante.');
        }
      },
      error: () => {
        this.enrollingUserId = null;
        alert('Error técnico al intentar inscribir.');
      }
    });
  }

  unenrollStudent(student: StudentProgress) {
    if (confirm(`¿Estás seguro de eliminar la inscripción de ${student.studentName}? Se perderá todo su progreso en este curso.`)) {
      this.courseService.unenrollStudent(this.courseId, student.studentId).subscribe({
        next: (success) => {
          if (success) {
            this.refreshData();
          } else {
            alert('Error al eliminar la inscripción.');
          }
        }
      });
    }
  }

  viewDeliverables(student: StudentProgress) {
    this.selectedStudent = student;
    this.isLoadingDeliverables = true;
    this.deliverables = [];
    this.courseService.getStudentDeliverables(this.courseId, student.studentId).subscribe({
      next: (d) => {
        this.deliverables = d;
        this.isLoadingDeliverables = false;
      },
      error: () => {
        this.isLoadingDeliverables = false;
        alert('Error al cargar entregables.');
      }
    });
  }

  submitGrade(delId: string | number) {
    if (!this.selectedStudent) return;
    this.isSavingGrade = true;
    
    this.courseService.gradeDeliverable(delId, this.gradeValue, this.feedbackText).subscribe({
      next: (success) => {
        this.isSavingGrade = false;
        if (success) {
          alert('Calificación guardada correctamente.');
          this.viewDeliverables(this.selectedStudent!); // Refresh list
          this.gradeValue = 0;
          this.feedbackText = '';
        }
      },
      error: () => {
        this.isSavingGrade = false;
        alert('Error al guardar calificación.');
      }
    });
  }
}
