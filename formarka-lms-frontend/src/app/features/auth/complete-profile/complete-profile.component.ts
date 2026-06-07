import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    ButtonComponent,
    FormFieldComponent
  ],
  templateUrl: './complete-profile.component.html',
  styleUrls: ['./complete-profile.component.css']
})
export class CompleteProfileComponent implements OnInit {
  profileForm: FormGroup;
  isLoading = false;
  showErrorModal = false;
  errorMessage = '';

  roles = [
    { value: 'Student', label: 'Estudiante' },
    { value: 'Teacher', label: 'Instructor' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required]],
      role: ['Student', [Validators.required]],
      specialty: [''],
      photoUrl: ['']
    });
  }

  ngOnInit(): void {
    // Check if user is authenticated
    this.authService.getSession().then(session => {
      if (!session) {
        console.error('No hay sesión activa. Redirigiendo a login.');
        this.router.navigate(['/auth/login']);
        return;
      }
      
      const currentUser = this.authService.currentUser();
      if (currentUser) {
        this.profileForm.patchValue({
          name: currentUser.name
        });
      }
    });
  }

  getControl(name: string): FormControl {
    return this.profileForm.get(name) as FormControl;
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.authService.completeProfile(this.profileForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          console.log('Perfil completado exitosamente');
          this.router.navigate(['/courses']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Error al completar el perfil. Inténtalo de nuevo.';
          this.showErrorModal = true;
        }
      });
    } else {
      this.profileForm.markAllAsTouched();
    }
  }

  closeErrorModal(): void {
    this.showErrorModal = false;
  }
}
