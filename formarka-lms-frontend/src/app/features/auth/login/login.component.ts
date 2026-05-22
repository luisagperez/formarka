import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

/**
 * Login Component
 * 
 * Handles user authentication.
 * 
 * For beginners:
 * - ReactiveFormsModule: Used for handling forms in a structured way.
 * - FormBuilder: A service that helps create form groups and controls.
 * - AuthService: Our custom service to talk to the backend.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    ButtonComponent,
    FormFieldComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  showErrorModal = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize the form with validation rules
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Helper methods to get controls as FormControl (needed for our app-form-field)
  getEmailControl(): FormControl {
    return this.loginForm.get('email') as FormControl;
  }

  getPasswordControl(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (user) => {
          this.isLoading = false;
          console.log('Login exitoso:', user);
          // Redirect to the courses page or dashboard
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Error al iniciar sesión. Por favor verifica tus credenciales.';
          this.showErrorModal = true;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.loginForm.markAllAsTouched();
    }
  }

  closeErrorModal(): void {
    this.showErrorModal = false;
  }
}
