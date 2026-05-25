export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'student' | 'instructor' | 'admin';
}

export interface Comment {
  id: string;
  lessonId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: 'student' | 'instructor' | 'admin';
  content: string;
  createdAt: Date;
  likes: number;
  isLikedByMe: boolean;
  replies: Comment[];
  parentId?: string;
  engagementScore: number;
  isTopComment?: boolean;
}

export type CommentSortOrder = 'relevant' | 'recent' | 'liked';
