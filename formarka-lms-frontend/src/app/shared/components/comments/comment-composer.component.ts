import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../core/models/comment.model';

@Component({
  selector: 'app-comment-composer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="composer-container glass" [class.focused]="isFocused">
      <div class="composer-header">
        <img [src]="currentUser.avatar" class="avatar">
        <div class="composer-info">
          <span class="greeting">¿Qué opinas de esta clase?</span>
          <span class="subtitle">Comparte tus dudas o aportes con la comunidad.</span>
        </div>
      </div>
      
      <div class="input-wrapper">
        <textarea 
          #commentText
          placeholder="Escribe tu comentario aquí..." 
          (focus)="isFocused = true"
          (blur)="isFocused = commentText.value.length > 0"
          (input)="adjustHeight($event)"
        ></textarea>
        
        <div class="composer-footer" *ngIf="isFocused || commentText.value.length > 0">
          <div class="formatting-hints">
            <span>Presiona Enter para enviar (opcional)</span>
          </div>
          <div class="actions">
            <button class="btn-cancel" (click)="commentText.value = ''; isFocused = false">Cancelar</button>
            <button 
              class="btn-submit" 
              [disabled]="!commentText.value.trim()"
              (click)="onSubmit(commentText.value); commentText.value = ''; isFocused = false"
            >
              Publicar comentario
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .composer-container {
      padding: 24px;
      border-radius: 20px;
      border: 1px solid rgba(0,0,0,0.05);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      margin-bottom: 40px;
    }

    .composer-container.focused {
      box-shadow: 0 10px 30px rgba(78, 7, 103, 0.1);
      border-color: var(--brand-purple-light);
      background: white;
    }

    .composer-header {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      align-items: center;
    }

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .composer-info {
      display: flex;
      flex-direction: column;
    }

    .greeting {
      font-weight: 800;
      font-size: 1.1rem;
      color: var(--brand-black);
    }

    .subtitle {
      font-size: 0.85rem;
      color: var(--formarka-text-muted);
    }

    .input-wrapper {
      position: relative;
    }

    textarea {
      width: 100%;
      min-height: 60px;
      border: none;
      background: #f8f9fa;
      border-radius: 12px;
      padding: 16px;
      font-family: inherit;
      font-size: 1rem;
      resize: none;
      transition: all 0.2s;
      color: var(--brand-black);
    }

    textarea:focus {
      outline: none;
      background: #fff;
      box-shadow: inset 0 0 0 1px var(--brand-purple-light);
    }

    .composer-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      animation: fadeIn 0.3s ease;
    }

    .formatting-hints {
      font-size: 0.75rem;
      color: var(--formarka-text-muted);
    }

    .actions {
      display: flex;
      gap: 12px;
    }

    .btn-cancel {
      background: none;
      border: none;
      font-weight: 600;
      color: var(--formarka-text-muted);
      cursor: pointer;
      padding: 8px 16px;
    }

    .btn-submit {
      background: var(--brand-purple-deep);
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 30px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s, background 0.2s;
    }

    .btn-submit:hover:not(:disabled) {
      background: var(--brand-purple-light);
      transform: translateY(-2px);
    }

    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class CommentComposerComponent {
  @Input() currentUser!: User;
  @Output() submitComment = new EventEmitter<string>();

  isFocused = false;

  onSubmit(content: string) {
    if (content.trim()) {
      this.submitComment.emit(content);
    }
  }

  adjustHeight(event: any) {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}
