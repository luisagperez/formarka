import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
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
        next: async (user) => {
          try {
            await this.authService.checkProfileAndRedirect(user.id);
            this.isLoading = false;
          } catch (err) {
            this.isLoading = false;
            this.errorMessage = 'Ocurrió un error al verificar tu perfil. Por favor, intenta de nuevo más tarde.';
            this.showErrorModal = true;
          }
        },
        error: (err) => {
          this.isLoading = false;
          // Always use a generic message for security
          this.errorMessage = 'Los datos ingresados no coinciden con nuestros registros. Inténtalo de nuevo.';
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

  navigateToForgot(event: Event): void {
    event.preventDefault();
    console.log('Navigating to forgot password');
    this.router.navigate(['/auth/forgot-password']);
  }

  navigateToRegister(event: Event): void {
    event.preventDefault();
    console.log('Navigating to register');
    this.router.navigate(['/auth/register']);
  }
}
