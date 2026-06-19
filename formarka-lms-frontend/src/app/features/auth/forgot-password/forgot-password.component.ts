import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonComponent,
    FormFieldComponent
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm: FormGroup;
  isLoading = false;
  isSent = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    console.log('ForgotPasswordComponent loaded');
  }

  getEmailControl(): FormControl {
    return this.forgotForm.get('email') as FormControl;
  }

  onSubmit(): void {
    if (this.forgotForm.valid) {
      this.isLoading = true;
      const { email } = this.forgotForm.value;

      this.authService.resetPassword(email).then(({ error }) => {
        this.isLoading = false;
        if (error) {
          this.errorMessage = 'Hubo un error al procesar tu solicitud. Inténtalo de nuevo.';
        } else {
          this.isSent = true;
        }
      });
    } else {
      this.forgotForm.markAllAsTouched();
    }
  }
}
