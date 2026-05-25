import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Comment, User } from '../../../core/models/comment.model';
import { CommentService } from '../../../core/services/comment.service';

@Component({
  selector: 'app-comment-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="comment-card" [class.is-reply]="!!comment.parentId" [class.is-top]="comment.isTopComment">
      <div class="comment-header">
        <img [src]="comment.userAvatar" [alt]="comment.userName" class="avatar">
        <div class="user-info">
          <div class="name-badge">
            <span class="username">{{ comment.userName }}</span>
            <span class="badge" *ngIf="comment.userRole !== 'student'">{{ comment.userRole | uppercase }}</span>
            <span class="badge top-badge" *ngIf="comment.isTopComment">DESTACADO</span>
          </div>
          <span class="timestamp">{{ comment.createdAt | date:'short' }}</span>
        </div>
      </div>

      <div class="comment-content">
        <p>{{ comment.content }}</p>
      </div>

      <div class="comment-actions">
        <button class="action-btn like-btn" [class.liked]="comment.isLikedByMe" (click)="onLike()">
          <span class="icon">❤</span>
          <span class="count">{{ comment.likes }}</span>
        </button>
        <button class="action-btn reply-btn" (click)="isReplying = !isReplying">
          Responder
        </button>
      </div>

      <!-- Reply Composer -->
      <div class="reply-composer animate-fade" *ngIf="isReplying">
        <div class="composer-inner">
          <img [src]="currentUser.avatar" class="avatar-small">
          <textarea 
            #replyText
            placeholder="Escribe una respuesta..." 
            (input)="adjustHeight($event)"
          ></textarea>
          <div class="composer-actions">
            <button class="btn-text" (click)="isReplying = false">Cancelar</button>
            <button class="btn-small" (click)="sendReply(replyText.value); replyText.value = ''; isReplying = false">Responder</button>
          </div>
        </div>
      </div>

      <!-- Nested Replies -->
      <div class="replies-thread" *ngIf="comment.replies.length > 0">
        <app-comment-card 
          *ngFor="let replyItem of comment.replies" 
          [comment]="replyItem"
          [currentUser]="currentUser"
          (like)="like.emit($event)"
          (reply)="reply.emit($event)"
        ></app-comment-card>
      </div>
    </div>
  `,
  styles: [`
    .comment-card {
      padding: 24px 0;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      position: relative;
    }

    .comment-card.is-reply {
      padding-left: 48px;
      padding-top: 16px;
      border-bottom: none;
      border-left: 2px solid #f0f0f0;
      margin-left: 12px;
      margin-top: 8px;
    }

    .comment-card.is-top {
      background: linear-gradient(90deg, rgba(202, 99, 240, 0.05) 0%, transparent 100%);
      padding: 24px;
      border-radius: 16px;
      border-left: 4px solid var(--brand-purple-light);
    }

    .comment-header {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }

    .avatar-small {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .name-badge {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .username {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--brand-black);
    }

    .badge {
      font-size: 0.65rem;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 4px;
      background: var(--brand-purple-deep);
      color: white;
    }

    .top-badge {
      background: var(--brand-purple-light);
    }

    .timestamp {
      font-size: 0.75rem;
      color: var(--formarka-text-muted);
    }

    .comment-content {
      margin-left: 52px;
      margin-bottom: 16px;
      font-size: 1rem;
      color: #333;
      line-height: 1.6;
    }

    .comment-actions {
      margin-left: 52px;
      display: flex;
      gap: 16px;
    }

    .action-btn {
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--formarka-text-muted);
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      color: var(--brand-purple-light);
    }

    .like-btn.liked {
      color: #e0245e;
    }

    .reply-composer {
      margin-top: 16px;
      margin-left: 52px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 12px;
    }

    .composer-inner {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: flex-start;
    }

    textarea {
      flex: 1;
      min-width: 200px;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 10px;
      font-family: inherit;
      resize: none;
      overflow: hidden;
      min-height: 40px;
      transition: border-color 0.2s;
    }

    textarea:focus {
      outline: none;
      border-color: var(--brand-purple-light);
    }

    .composer-actions {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .btn-small {
      background: var(--brand-purple-deep);
      color: white;
      border: none;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-text {
      background: none;
      border: none;
      color: var(--formarka-text-muted);
      font-weight: 600;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .replies-thread {
      margin-top: 8px;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-fade {
      animation: fadeIn 0.3s ease;
    }
  `]
})
export class CommentCardComponent {
  @Input() comment!: Comment;
  @Input() currentUser!: User;
  @Output() like = new EventEmitter<string>();
  @Output() reply = new EventEmitter<{ parentId: string, content: string }>();

  isReplying = false;

  onLike() {
    this.like.emit(this.comment.id);
  }

  sendReply(content: string) {
    if (content.trim()) {
      this.reply.emit({ parentId: this.comment.id, content });
    }
  }

  adjustHeight(event: any) {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}
