import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [type]="type" 
      [disabled]="disabled || loading"
      [class]="'btn btn-' + variant"
      (click)="onClick.emit($event)">
      <span *ngIf="loading" class="spinner"></span>
      <span *ngIf="!loading"><ng-content></ng-content></span>
    </button>
  `,
  styles: [`
    .btn {
      padding: 14px 36px;
      border-radius: 100px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      width: 100%;
      min-height: 52px;
      font-family: var(--font-main);
      letter-spacing: 0.5px;
      position: relative;
      overflow: hidden;
      z-index: 1;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      filter: grayscale(1);
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--brand-purple-deep), var(--brand-purple-light));
      color: var(--formarka-white);
      box-shadow: 0 10px 20px -10px var(--brand-purple-deep);
    }

    .btn-primary::before {
      content: '';
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: linear-gradient(135deg, var(--brand-green-vibrant), var(--brand-purple-deep));
      z-index: -1;
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 15px 30px -10px var(--brand-purple-deep);
    }

    .btn-primary:hover::before {
      opacity: 1;
    }

    .btn-outline {
      background-color: transparent;
      border: 2.5px solid var(--brand-purple-deep);
      color: var(--brand-purple-deep);
    }

    .btn-outline:hover:not(:disabled) {
      background-color: var(--brand-purple-deep);
      color: var(--formarka-white);
      transform: translateY(-3px);
      box-shadow: 0 8px 20px -8px var(--brand-purple-deep);
    }

    .spinner {
      width: 22px;
      height: 22px;
      border: 3px solid rgba(255,255,255,.2);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: 'primary' | 'outline' = 'primary';
  @Input() disabled = false;
  @Input() loading = false;
  @Output() onClick = new EventEmitter<MouseEvent>();
}
