import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Comment, CommentSortOrder, User } from '../models/comment.model';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/comments`;

  getComments(lessonId: string | number, sort: CommentSortOrder = 'relevant'): Observable<Comment[]> {
    const numericLessonId = typeof lessonId === 'string' ? parseInt(lessonId) : lessonId;
    return this.http.get<any[]>(`${this.apiUrl}/lesson/${numericLessonId}`).pipe(
      map(comments => comments.map(c => this.mapToFrontend(c))),
      map(comments => this.sortComments(comments, sort)),
      catchError(err => {
        console.error('Error fetching comments:', err);
        return of([]);
      })
    );
  }

  private sortComments(comments: Comment[], sort: CommentSortOrder): Comment[] {
    const sorted = [...comments];
    if (sort === 'relevant') {
      // Basic relevant sorting: likes and recent
      sorted.sort((a, b) => (b.likes * 2 + (new Date(b.createdAt).getTime() / 1000000)) - (a.likes * 2 + (new Date(a.createdAt).getTime() / 1000000)));
    } else if (sort === 'recent') {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'liked') {
      sorted.sort((a, b) => b.likes - a.likes);
    }
    
    if (sorted.length > 0 && sorted[0].likes > 10) sorted[0].isTopComment = true;
    return sorted;
  }

  addComment(lessonId: string | number, content: string, parentId?: string): Observable<Comment> {
    const numericLessonId = typeof lessonId === 'string' ? parseInt(lessonId) : lessonId;
    const numericParentId = parentId ? parseInt(parentId) : null;

    const payload = {
      lessonId: numericLessonId,
      content,
      parentId: numericParentId
    };

    return this.http.post<any>(this.apiUrl, payload).pipe(
      map(comment => this.mapToFrontend(comment))
    );
  }

  toggleLike(commentId: string): void {
    // Backend like implementation pending, for now just local UI feedback if needed
    console.log('Like toggled for:', commentId);
  }

  private mapToFrontend(c: any): Comment {
    return {
      id: c.id.toString(),
      lessonId: c.lessonId.toString(),
      userId: c.userId,
      userName: c.userName,
      userAvatar: c.userAvatar || 'default-avatar.png',
      userRole: 'student', // Default role for now as it's not in DTO yet
      content: c.content,
      createdAt: new Date(c.createdAt),
      likes: c.likes,
      isLikedByMe: false, // Pending backend implementation
      replies: c.replies ? c.replies.map((r: any) => this.mapToFrontend(r)) : [],
      parentId: c.parentId?.toString(),
      engagementScore: c.likes * 5
    };
  }

  getCurrentUser(): User | null {
    const profile = this.authService.currentUser();
    if (!profile) return null;
    return {
      id: profile.id,
      name: profile.name,
      avatar: profile.photoUrl || 'default-avatar.png',
      role: profile.role.toLowerCase() as any
    };
  }
}

