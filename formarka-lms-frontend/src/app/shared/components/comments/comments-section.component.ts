import { Component, Input, OnInit, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Comment, CommentSortOrder, User } from '../../../core/models/comment.model';
import { CommentService } from '../../../core/services/comment.service';
import { CommentCardComponent } from './comment-card.component';
import { CommentComposerComponent } from './comment-composer.component';

@Component({
  selector: 'app-comments-section',
  standalone: true,
  imports: [CommonModule, CommentCardComponent, CommentComposerComponent],
  template: `
    <section class="comments-section animate-up">
      <!-- (Same template as before) -->
      <div class="section-header">
        <div class="title-area">
          <h2 class="text-gradient">Discusión de la clase</h2>
          <p>Comparte aprendizajes, dudas o aportes con otros estudiantes.</p>
        </div>
        
        <div class="filters-area">
          <label for="sortOrder">Ordenar por:</label>
          <div class="select-wrapper">
            <select id="sortOrder" (change)="onSortChange($event)">
              <option value="relevant">Más relevantes</option>
              <option value="recent">Más recientes</option>
              <option value="liked">Más valorados</option>
            </select>
          </div>
        </div>
      </div>

      <app-comment-composer 
        [currentUser]="currentUser"
        (submitComment)="postComment($event)"
      ></app-comment-composer>

      <div class="loading-state" *ngIf="isLoading()">
        <div class="skeleton-comment" *ngFor="let i of [1,2,3]">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-content">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line medium"></div>
          </div>
        </div>
      </div>

      <div class="comments-list" *ngIf="!isLoading()">
        <app-comment-card 
          *ngFor="let comment of comments()" 
          [comment]="comment"
          [currentUser]="currentUser"
          (like)="onLike($event)"
          (reply)="onReply($event)"
        ></app-comment-card>
      </div>

      <div class="empty-state" *ngIf="!isLoading() && comments().length === 0">
        <span class="empty-icon">💬</span>
        <h3>Aún no hay comentarios</h3>
        <p>Sé el primero en compartir algo interesante.</p>
      </div>
    </section>
  `,
  styles: [`
    /* (Same styles as before) */
    .comments-section {
      margin-top: 60px;
      padding-top: 40px;
      border-top: 2px solid #f0f0f0;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 32px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .title-area h2 {
      font-size: 2rem;
      margin-bottom: 8px;
    }

    .title-area p {
      color: var(--formarka-text-muted);
      font-size: 1.1rem;
    }

    .filters-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .filters-area label {
      font-weight: 700;
      font-size: 0.9rem;
      color: var(--brand-black);
    }

    .select-wrapper {
      position: relative;
    }

    select {
      appearance: none;
      background: white;
      border: 1px solid #ddd;
      padding: 8px 36px 8px 16px;
      border-radius: 10px;
      font-family: inherit;
      font-weight: 600;
      cursor: pointer;
      color: var(--brand-black);
      transition: all 0.2s;
    }

    select:focus {
      outline: none;
      border-color: var(--brand-purple-light);
      box-shadow: 0 0 0 3px rgba(202, 99, 240, 0.1);
    }

    .select-wrapper::after {
      content: '▼';
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.7rem;
      pointer-events: none;
      color: var(--formarka-text-muted);
    }

    .comments-list {
      display: flex;
      flex-direction: column;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .skeleton-comment {
      display: flex;
      gap: 16px;
      opacity: 0.6;
    }

    .skeleton-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #eee;
    }

    .skeleton-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .skeleton-line {
      height: 12px;
      background: #eee;
      border-radius: 6px;
      width: 100%;
    }

    .skeleton-line.short { width: 30%; }
    .skeleton-line.medium { width: 60%; }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: #f8f9fa;
      border-radius: 20px;
    }

    .empty-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 16px;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-up {
      animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class CommentsSectionComponent implements OnInit, OnChanges {
  @Input() lessonId!: string;
  
  private commentService = inject(CommentService);
  
  comments = signal<Comment[]>([]);
  currentUser: User = this.commentService.getCurrentUser();
  isLoading = signal(true);
  currentSort: CommentSortOrder = 'relevant';

  ngOnInit() {
    this.loadComments();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['lessonId'] && !changes['lessonId'].firstChange) {
      this.loadComments();
    }
  }

  loadComments() {
    if (!this.lessonId) return;
    this.isLoading.set(true);
    this.commentService.getComments(this.lessonId, this.currentSort).subscribe(data => {
      this.comments.set(data);
      this.isLoading.set(false);
    });
  }

  onSortChange(event: any) {
    this.currentSort = event.target.value as CommentSortOrder;
    this.loadComments();
  }

  onLike(commentId: string) {
    this.commentService.toggleLike(commentId);
    this.loadComments(); 
  }

  postComment(content: string) {
    this.commentService.addComment(this.lessonId, content).subscribe(() => {
      this.loadComments();
    });
  }

  onReply(event: { parentId: string, content: string }) {
    this.commentService.addComment(this.lessonId, event.content, event.parentId).subscribe(() => {
      this.loadComments();
    });
  }
}
