import { Injectable, signal } from '@angular/core';
import { Comment, CommentSortOrder, User } from '../models/comment.model';
import { Observable, of, delay, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private mockCurrentUser: User = {
    id: 'u1',
    name: 'Estudiante Estrella',
    avatar: 'default-avatar.png',
    role: 'student'
  };

  private _comments = signal<Comment[]>([
    // COURSE 1 - Branding
    {
      id: 'c1', lessonId: 'l1_1', userId: 'u101', userName: 'Julián Rivas',
      userAvatar: 'https://randomuser.me/api/portraits/men/12.jpg', userRole: 'student',
      content: 'Me parece increíble cómo el ADN de marca no es solo lo que decimos, sino lo que el cliente percibe. Mi duda es: ¿cómo mantenemos esa esencia si decidimos pivotar el modelo de negocio?',
      createdAt: new Date(Date.now() - 3600000 * 5), likes: 24, isLikedByMe: false, replies: [
        {
          id: 'c1-1', lessonId: 'l1_1', userId: 'u2', userName: 'Ana García',
          userAvatar: 'https://randomuser.me/api/portraits/women/32.jpg', userRole: 'instructor',
          content: 'Excelente duda, Julián. Los valores fundamentales rara vez cambian, lo que cambia es la expresión.',
          createdAt: new Date(Date.now() - 3600000 * 4), likes: 15, isLikedByMe: false, replies: [], parentId: 'c1', engagementScore: 0
        }
      ], engagementScore: 0
    },
    {
      id: 'c2', lessonId: 'l1_1', userId: 'u102', userName: 'Valentina Torres',
      userAvatar: 'https://randomuser.me/api/portraits/women/26.jpg', userRole: 'student',
      content: '¡Brutal! He aplicado el ejercicio de los 5 valores y mi enfoque es mucho más claro ahora.',
      createdAt: new Date(Date.now() - 3600000 * 12), likes: 56, isLikedByMe: false, replies: [], engagementScore: 0
    },
    {
      id: 'c1_2_1', lessonId: 'l1_2', userId: 'u103', userName: 'Marcos Benítez',
      userAvatar: 'https://randomuser.me/api/portraits/men/33.jpg', userRole: 'student',
      content: 'Tengo dudas con el Buyer Persona. ¿Es mejor enfocarse en datos demográficos o en psicográficos para marcas de lujo?',
      createdAt: new Date(Date.now() - 3600000 * 2), likes: 12, isLikedByMe: false, replies: [], engagementScore: 0
    },
    {
      id: 'c1_2_2', lessonId: 'l1_2', userId: 'u106', userName: 'Daniela S.',
      userAvatar: 'https://randomuser.me/api/portraits/women/65.jpg', userRole: 'student',
      content: 'Daniela aquí, acabo de subir mi entregable. ¡Qué ganas de recibir feedback!',
      createdAt: new Date(Date.now() - 1800000), likes: 8, isLikedByMe: false, replies: [], engagementScore: 0
    },
    {
      id: 'c1_3_1', lessonId: 'l1_3', userId: 'u104', userName: 'Isabel Castillo',
      userAvatar: 'https://randomuser.me/api/portraits/women/45.jpg', userRole: 'student',
      content: 'La clase sobre Ventaja Competitiva es oro. Mi propuesta de valor acaba de subir de nivel.',
      createdAt: new Date(Date.now() - 3600000 * 24), likes: 42, isLikedByMe: false, replies: [], engagementScore: 0
    },
    {
      id: 'c2_1_1', lessonId: 'l2_1', userId: 'u105', userName: 'Ricardo Peña',
      userAvatar: 'https://randomuser.me/api/portraits/men/54.jpg', userRole: 'student',
      content: '¿Por qué el azul se asocia tanto a la tecnología? ¿Sería muy arriesgado usar un naranja vibrante para una Fintech?',
      createdAt: new Date(Date.now() - 3600000 * 1), likes: 15, isLikedByMe: false, replies: [], engagementScore: 0
    },
    {
      id: 'c2_2_1', lessonId: 'l2_2', userId: 'u107', userName: 'Sebastián Gómez',
      userAvatar: 'https://randomuser.me/api/portraits/men/76.jpg', userRole: 'student',
      content: 'El círculo cromático de los recursos es súper útil. Me ayudó a encontrar colores complementarios que no se ven chillones.',
      createdAt: new Date(Date.now() - 900000), likes: 19, isLikedByMe: false, replies: [], engagementScore: 0
    },
    {
      id: 'c3_1_1', lessonId: 'l3_1', userId: 'u108', userName: 'Sofía L.',
      userAvatar: 'https://randomuser.me/api/portraits/women/12.jpg', userRole: 'student',
      content: 'Nunca le había prestado atención a la anatomía de las letras. Entender las serifas cambió mi forma de elegir fuentes.',
      createdAt: new Date(Date.now() - 300000), likes: 22, isLikedByMe: false, replies: [], engagementScore: 0
    },

    // COURSE 2 - Marketing (IDs: l2_1_1, l2_1_2)
    {
      id: 'm1_1', lessonId: 'l2_1_1', userId: 'u201', userName: 'Carla Méndez',
      userAvatar: 'https://randomuser.me/api/portraits/women/33.jpg', userRole: 'student',
      content: '¿Cómo defino los pilares de contenido si mi audiencia es muy variada? Siento que el calendario se vuelve un caos.',
      createdAt: new Date(Date.now() - 3600000 * 3), likes: 34, isLikedByMe: false, replies: [], engagementScore: 0
    },
    {
      id: 'm1_2', lessonId: 'l2_1_2', userId: 'u202', userName: 'Andrés Kuz',
      userAvatar: 'https://randomuser.me/api/portraits/men/41.jpg', userRole: 'student',
      content: 'Subiendo mi calendario mensual. Usar la matriz XLS facilitó todo el proceso de planificación.',
      createdAt: new Date(Date.now() - 3600000 * 8), likes: 15, isLikedByMe: false, replies: [], engagementScore: 0
    },

    // COURSE 3 - Fotografía (IDs: l3_1_1, l3_1_2)
    {
      id: 'f1_1', lessonId: 'l3_1_1', userId: 'u301', userName: 'Lucía Paz',
      userAvatar: 'https://randomuser.me/api/portraits/women/52.jpg', userRole: 'student',
      content: 'No sabía que la luz de las 5 PM era tan buena para productos orgánicos. ¡Las fotos salieron con un tono cálido hermoso!',
      createdAt: new Date(Date.now() - 3600000 * 2), likes: 41, isLikedByMe: false, replies: [], engagementScore: 0
    },
    {
      id: 'f1_2', lessonId: 'l3_1_2', userId: 'u302', userName: 'Tomás Herrán',
      userAvatar: 'https://randomuser.me/api/portraits/men/18.jpg', userRole: 'student',
      content: 'Armé mi set DIY con papel cebolla y el cambio es total. Cero reflejos molestos en los envases de vidrio.',
      createdAt: new Date(Date.now() - 3600000 * 1), likes: 27, isLikedByMe: false, replies: [], engagementScore: 0
    }
  ]);

  constructor() {
    this.updateEngagementScores();
  }

  getComments(lessonId: string, sort: CommentSortOrder = 'relevant'): Observable<Comment[]> {
    return of(this._comments()).pipe(
      delay(500), // Simulate network delay
      map(comments => {
        const filtered = comments.filter(c => c.lessonId === lessonId);
        return this.sortComments(filtered, sort);
      })
    );
  }

  private sortComments(comments: Comment[], sort: CommentSortOrder): Comment[] {
    const sorted = [...comments];
    
    if (sort === 'relevant') {
      sorted.sort((a, b) => b.engagementScore - a.engagementScore);
    } else if (sort === 'recent') {
      sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sort === 'liked') {
      sorted.sort((a, b) => b.likes - a.likes);
    }

    // Mark top comment
    if (sorted.length > 0 && sorted[0].likes > 10) {
      sorted[0].isTopComment = true;
    }

    return sorted;
  }

  private updateEngagementScores() {
    this._comments.update(comments => 
      comments.map(c => ({
        ...c,
        engagementScore: (c.likes * 5) + (c.replies.length * 3)
      }))
    );
  }

  addComment(lessonId: string, content: string, parentId?: string): Observable<Comment> {
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      lessonId,
      userId: this.mockCurrentUser.id,
      userName: this.mockCurrentUser.name,
      userAvatar: this.mockCurrentUser.avatar,
      userRole: this.mockCurrentUser.role,
      content,
      createdAt: new Date(),
      likes: 0,
      isLikedByMe: false,
      replies: [],
      parentId,
      engagementScore: 0
    };

    if (parentId) {
      this._comments.update(comments => 
        comments.map(c => {
          if (c.id === parentId) {
            return { ...c, replies: [...c.replies, newComment] };
          }
          return c;
        })
      );
    } else {
      this._comments.update(comments => [newComment, ...comments]);
    }

    this.updateEngagementScores();
    return of(newComment).pipe(delay(800));
  }

  toggleLike(commentId: string): void {
    this._comments.update(comments => {
      return comments.map(c => {
        if (c.id === commentId) {
          const isLiked = !c.isLikedByMe;
          return {
            ...c,
            isLikedByMe: isLiked,
            likes: isLiked ? c.likes + 1 : c.likes - 1
          };
        }
        // Also search in replies
        const updatedReplies = c.replies.map(r => {
          if (r.id === commentId) {
            const isLiked = !r.isLikedByMe;
            return {
              ...r,
              isLikedByMe: isLiked,
              likes: isLiked ? r.likes + 1 : r.likes - 1
            };
          }
          return r;
        });
        return { ...c, replies: updatedReplies };
      });
    });
    this.updateEngagementScores();
  }

  getCurrentUser(): User {
    return this.mockCurrentUser;
  }
}
