import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonComponent,
    FormFieldComponent
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  getPasswordControl(): FormControl {
    return this.resetForm.get('password') as FormControl;
  }

  getConfirmPasswordControl(): FormControl {
    return this.resetForm.get('confirmPassword') as FormControl;
  }

  onSubmit(): void {
    if (this.resetForm.valid) {
      this.isLoading = true;
      const { password } = this.resetForm.value;

      this.authService.updatePassword(password).then(({ error }) => {
        this.isLoading = false;
        if (error) {
          this.errorMessage = 'Hubo un error al actualizar tu contraseña. Puede que el enlace haya expirado.';
        } else {
          // Password updated successfully. Redirect to login or home.
          // Since they are technically logged in now (Supabase does this after recovery),
          // we might want to redirect them to courses.
          this.router.navigate(['/courses']);
        }
      });
    } else {
      this.resetForm.markAllAsTouched();
    }
  }
}
