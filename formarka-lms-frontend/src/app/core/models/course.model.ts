export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  correctOptionId: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'pdf' | 'zip' | 'link' | 'excel';
}

export interface Deliverable {
  id: string;
  studentId: string;
  courseId: string;
  lessonId: string;
  contentUrl: string;
  submissionDate: string;
  grade?: number;
  feedback?: string;
  status: 'pending' | 'graded';
}

export interface Lesson {
  id: string;
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
  id: string;
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
}
