export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  photoUrl?: string;
  enrolledCourses?: string[]; // IDs of courses student is enrolled in
  specialty?: string; // For teachers
}

export interface AuthResponse {
  user: User;
  token: string;
}
