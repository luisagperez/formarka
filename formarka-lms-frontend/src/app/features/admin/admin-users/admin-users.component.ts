import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, FormFieldComponent],
  template: `
    <div class="container admin-container animate-up">
      <div class="admin-header">
        <div>
          <h1 class="text-gradient">Gestión de Usuarios</h1>
          <p>Administra administradores, profesores y alumnos del LMS.</p>
        </div>
        <app-button (onClick)="showAddModal = true">
          <span class="icon">+</span> Nuevo Usuario
        </app-button>
      </div>

      <div class="table-card glass">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Especialidad / Cursos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users" class="animate-up">
              <td>
                <div class="user-cell">
                  <div class="user-avatar">{{ user.name.charAt(0) }}</div>
                  <strong>{{ user.name }}</strong>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span class="role-badge" [ngClass]="user.role">{{ user.role | titlecase }}</span>
              </td>
              <td>
                <span *ngIf="user.role === 'teacher'">{{ user.specialty || 'N/A' }}</span>
                <span *ngIf="user.role === 'student'">{{ user.enrolledCourses?.length || 0 }} cursos</span>
                <span *ngIf="user.role === 'admin'">Acceso Total</span>
              </td>
              <td class="actions-cell">
                <button class="action-btn edit" (click)="editUser(user)" title="Editar">✏️</button>
                <button class="action-btn delete" (click)="deleteUser(user.id)" title="Eliminar">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Modal -->
      <div class="modal-overlay" *ngIf="showAddModal || editingUser">
        <div class="modal-content glass animate-up">
          <h3>{{ editingUser ? 'Editar Usuario' : 'Nuevo Usuario' }}</h3>
          <form [formGroup]="userForm" (ngSubmit)="saveUser()">
            <app-form-field label="Nombre Completo" [control]="getControl('name')"></app-form-field>
            <app-form-field label="Email" [control]="getControl('email')"></app-form-field>
            
            <div class="form-field">
              <label class="label">Rol</label>
              <select formControlName="role" class="select-input">
                <option value="admin">Administrador</option>
                <option value="teacher">Profesor</option>
                <option value="student">Alumno</option>
              </select>
            </div>

            <app-form-field *ngIf="userForm.get('role')?.value === 'teacher'" label="Especialidad" [control]="getControl('specialty')"></app-form-field>

            <div class="modal-actions">
              <app-button variant="outline" type="button" (onClick)="closeModal()">Cancelar</app-button>
              <app-button type="submit">{{ editingUser ? 'Actualizar' : 'Crear' }}</app-button>
            </div>
          </form>
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
    .role-badge { padding: 4px 12px; border-radius: 100px; font-size: 0.8rem; font-weight: 700; }
    .role-badge.admin { background: #fee2e2; color: #ef4444; }
    .role-badge.teacher { background: #fef9c3; color: #a16207; }
    .role-badge.student { background: #dcfce7; color: #15803d; }
    .action-btn { background: none; border: none; cursor: pointer; font-size: 1.2rem; }
    
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; padding: 40px; border-radius: 32px; width: 500px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 24px; }
    .select-input { width: 100%; padding: 12px; border-radius: 12px; border: 1.5px solid #eee; }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  showAddModal = false;
  editingUser: User | null = null;
  userForm: FormGroup;

  constructor(private authService: AuthService, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['student', Validators.required],
      specialty: ['']
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.authService.getUsers().subscribe(users => this.users = users);
  }

  getControl(name: string) { return this.userForm.get(name) as any; }

  editUser(user: User) {
    this.editingUser = user;
    this.userForm.patchValue(user);
    this.showAddModal = true;
  }

  saveUser() {
    if (this.userForm.invalid) return;
    const userData = this.userForm.value;
    
    if (this.editingUser) {
      this.authService.updateUser(this.editingUser.id, userData).subscribe(() => {
        this.loadUsers();
        this.closeModal();
      });
    } else {
      this.authService.addUser({ ...userData, id: Math.random().toString(36).substring(2, 9) }).subscribe(() => {
        this.loadUsers();
        this.closeModal();
      });
    }
  }

  deleteUser(id: string) {
    if (confirm('¿Eliminar usuario?')) {
      this.authService.deleteUser(id).subscribe(() => this.loadUsers());
    }
  }

  closeModal() {
    this.showAddModal = false;
    this.editingUser = null;
    this.userForm.reset({ role: 'student' });
  }
}
