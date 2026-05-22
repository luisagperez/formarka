import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-field">
      <label [for]="id" class="label">{{ label }}</label>
      <div class="input-container">
        <input 
          [id]="id"
          [type]="type"
          [formControl]="control"
          [placeholder]="placeholder"
          class="input"
          [class.error]="control.invalid && control.touched"
        />
      </div>
      <div class="error-message" *ngIf="control.invalid && control.touched">
        <span *ngIf="control.errors?.['required']">Este campo es requerido</span>
        <span *ngIf="control.errors?.['email']">Email no válido</span>
        <span *ngIf="control.errors?.['minlength']">Mínimo {{ control.errors?.['minlength'].requiredLength }} caracteres</span>
      </div>
    </div>
  `,
  styles: [`
    .form-field {
      margin-bottom: 24px;
      width: 100%;
    }

    .label {
      display: block;
      margin-bottom: 10px;
      font-weight: 600;
      color: var(--formarka-text);
      font-size: 0.95rem;
      font-family: var(--font-main);
    }

    .input {
      width: 100%;
      padding: 14px 20px;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background-color: var(--formarka-white);
      font-family: var(--font-main);
      color: var(--formarka-text);
    }

    .input:focus {
      outline: none;
      border-color: var(--formarka-primary);
      box-shadow: 0 0 0 4px rgba(128, 18, 246, 0.1);
      background-color: #fff;
    }

    .input.error {
      border-color: #ef4444;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.85rem;
      margin-top: 6px;
      font-weight: 500;
    }
  `]
})
export class FormFieldComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) control!: FormControl;
  @Input() id = 'input-' + Math.random().toString(36).substring(2, 9);
  @Input() type = 'text';
  @Input() placeholder = '';
}
