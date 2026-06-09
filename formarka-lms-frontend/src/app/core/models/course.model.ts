export interface QuizOption {
  id: string | number;
  text: string;
}

export interface QuizQuestion {
  id: string | number;
  text: string;
  options: QuizOption[];
  correctOptionId?: string | number;
}

export interface Quiz {
  id: string | number;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
}

export interface Resource {
  id: string | number;
  title: string;
  url: string;
  type: 'pdf' | 'zip' | 'link' | 'excel';
}

export interface Deliverable {
  id: string | number;
  studentId: string;
  courseId: string | number;
  lessonId: string | number;
  contentUrl: string;
  submissionDate: string;
  grade?: number;
  feedback?: string;
  status: 'pending' | 'graded';
}

export interface Lesson {
  id: string | number;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'file' | 'deliverable';
  contentUrl?: string; // YouTube URL for videos
  duration?: string;
  isCompleted?: boolean;
  quiz?: Quiz; // Optional quiz data
  resources?: Resource[]; // Downloadable resources
  deliverable?: Deliverable; // For student submission
}

export interface Module {
  id: string | number;
  title: string;
  lessons: Lesson[];
  isOpen?: boolean;
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  progress: number; // 0-100
  grade?: number; // Average grade
  completedDate?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  level: 'básico' | 'intermedio' | 'avanzado';
  instructorName?: string;
  instructorId?: string;
  totalHours: number;
  modules?: Module[];
  enrolledStudents?: StudentProgress[];
  isEnrolled?: boolean;
}
