import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Course, Resource, Deliverable, StudentProgress } from '../models/course.model';
import { delay, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Course Service
 * 
 * Provides operations for courses, students, and grading using Backend API.
 */
@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/courses`;

  private PROGRESS_KEY = 'f-lms-progress';
  private LAST_ACTIVITY_KEY = 'f-lms-last-activity';
  private ENROLLMENT_KEY = 'f-lms-enrollments';

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl).pipe(
      delay(400)
    );
  }

  getCourse(id: string | number): Observable<Course | undefined> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`).pipe(
      delay(300)
    );
  }

  getMyCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/my-courses`).pipe(
      delay(400)
    );
  }

  getAdminCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/admin`);
  }

  isEnrolled(courseId: string | number): boolean {
    const enrollments = this.getEnrollments();
    return enrollments.includes(courseId.toString());
  }

  private getEnrollments(): string[] {
    const data = localStorage.getItem(this.ENROLLMENT_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * STUDENT: Progress and Enrollment
   */
  enroll(courseId: string | number): Observable<boolean> {
    const numericId = typeof courseId === 'string' ? parseInt(courseId) : courseId;
    if (isNaN(numericId)) return of(false);

    return this.http.post(`${this.apiUrl}/${numericId}/enroll`, {}).pipe(
      map(() => {
        const enrollments = this.getEnrollments();
        if (!enrollments.includes(courseId.toString())) {
          enrollments.push(courseId.toString());
          localStorage.setItem(this.ENROLLMENT_KEY, JSON.stringify(enrollments));
        }
        return true;
      }),
      catchError(err => {
        console.error('Error enrolling via API:', err);
        return of(false);
      })
    );
  }

  enrollStudent(courseId: string | number, studentId: string): Observable<boolean> {
    const numericId = typeof courseId === 'string' ? parseInt(courseId) : courseId;
    return this.http.post(`${this.apiUrl}/${numericId}/enroll-student`, JSON.stringify(studentId), {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  unenrollStudent(courseId: string | number, studentId: string): Observable<boolean> {
    const numericId = typeof courseId === 'string' ? parseInt(courseId) : courseId;
    return this.http.delete(`${this.apiUrl}/${numericId}/enroll-student/${studentId}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  submitQuiz(quizId: string | number, answers: { [key: number]: number }): Observable<{ score: number, passed: boolean }> {
    return this.http.post<{ score: number, passed: boolean }>(`${environment.apiUrl}/quizzes/${quizId}/submit`, answers);
  }

  getQuizByLesson(lessonId: string | number): Observable<any> {
    const numericLessonId = typeof lessonId === 'string' ? parseInt(lessonId) : lessonId;
    return this.http.get<any>(`${environment.apiUrl}/quizzes/lesson/${numericLessonId}`);
  }

  upsertQuiz(quiz: any): Observable<number> {
    return this.http.post<number>(`${environment.apiUrl}/quizzes/upsert`, quiz);
  }

  submitDeliverable(lessonId: string | number, contentUrl: string): Observable<Deliverable> {
    const numericLessonId = typeof lessonId === 'string' ? parseInt(lessonId) : lessonId;
    return this.http.post<Deliverable>(`${environment.apiUrl}/deliverables/lesson/${numericLessonId}`, JSON.stringify(contentUrl), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  getDeliverable(lessonId: string | number): Observable<Deliverable> {
    const numericLessonId = typeof lessonId === 'string' ? parseInt(lessonId) : lessonId;
    return this.http.get<Deliverable>(`${environment.apiUrl}/deliverables/lesson/${numericLessonId}`);
  }

  saveLastActivity(courseId: string | number, lessonId: string | number): void {
    const activity = this.getAllLastActivity();
    activity[courseId.toString()] = lessonId.toString();
    localStorage.setItem(this.LAST_ACTIVITY_KEY, JSON.stringify(activity));
  }

  getLastActivity(courseId: string | number): string | null {
    const activity = this.getAllLastActivity();
    return activity[courseId.toString()] || null;
  }

  private getAllLastActivity(): { [key: string]: string } {
    const data = localStorage.getItem(this.LAST_ACTIVITY_KEY);
    return data ? JSON.parse(data) : {};
  }

  trackLessonAccess(lessonId: string | number): void {
    const numericLessonId = typeof lessonId === 'string' ? parseInt(lessonId) : lessonId;
    if (!isNaN(numericLessonId)) {
      this.http.post(`${environment.apiUrl}/lessons/${numericLessonId}/track`, {}).subscribe({
        next: () => console.log('API: Lesson access tracked'),
        error: (err) => console.error('API Error tracking lesson access:', err)
      });
    }
  }

  getCertificate(courseId: string | number): Observable<any> {
    const numericId = typeof courseId === 'string' ? parseInt(courseId) : courseId;
    return this.http.get<any>(`${environment.apiUrl}/certificates/course/${numericId}`);
  }

  completeLesson(courseId: string | number, lessonId: string | number): void {
    const progress = this.getAllProgress();
    progress[`${courseId}_${lessonId}`] = true;
    localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(progress));
    this.saveLastActivity(courseId, lessonId);

    const numericLessonId = typeof lessonId === 'string' ? parseInt(lessonId) : lessonId;
    if (!isNaN(numericLessonId)) {
      this.http.post(`${environment.apiUrl}/lessons/${numericLessonId}/complete`, {}).subscribe({
        next: () => console.log('API: Lesson marked as completed'),
        error: (err) => console.error('API Error marking lesson as completed:', err)
      });
    }
  }

  private getAllProgress(): { [key: string]: boolean } {
    const data = localStorage.getItem(this.PROGRESS_KEY);
    return data ? JSON.parse(data) : {};
  }

  getCourseProgress(courseId: string | number): number {
    const progress = this.getAllProgress();
    // This is a bit complex without the full course object loaded.
    // For now, we return 0 if not fully implemented or used in a place where we have the course.
    return 0; 
  }

  /**
   * TEACHER & ADMIN: Course Management
   */
  createCourse(course: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, course);
  }

  updateCourse(id: string | number, course: any): Observable<any> {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    return this.http.put(`${this.apiUrl}/${numericId}`, { ...course, id: numericId });
  }

  deleteCourse(id: string | number): Observable<boolean> {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    return this.http.delete(`${this.apiUrl}/${numericId}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  /**
   * TEACHER: Grading and Students
   */
  getEnrolledStudents(courseId: string | number): Observable<StudentProgress[]> {
    const numericId = typeof courseId === 'string' ? parseInt(courseId) : courseId;
    return this.http.get<StudentProgress[]>(`${this.apiUrl}/${numericId}/students`);
  }

  getStudentDeliverables(courseId: string | number, studentId: string): Observable<Deliverable[]> {
    const numericId = typeof courseId === 'string' ? parseInt(courseId) : courseId;
    return this.http.get<Deliverable[]>(`${environment.apiUrl}/deliverables/course/${numericId}/student/${studentId}`);
  }

  gradeDeliverable(deliverableId: string | number, grade: number, feedback: string): Observable<boolean> {
    const numericId = typeof deliverableId === 'string' ? parseInt(deliverableId) : deliverableId;
    return this.http.post(`${environment.apiUrl}/deliverables/${numericId}/grade`, { grade, feedback }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  uploadResource(courseId: string | number, lessonId: string | number, resource: Resource): Observable<Resource> {
    const numericLessonId = typeof lessonId === 'string' ? parseInt(lessonId) : lessonId;
    return this.http.post<Resource>(`${environment.apiUrl}/resources`, {
      lessonId: numericLessonId,
      title: resource.title,
      url: resource.url,
      type: resource.type || 'pdf'
    });
  }

  /**
   * ADMIN: Assign Teacher to Course
   */
  assignTeacher(courseId: string | number, teacherId: string, teacherName: string): Observable<boolean> {
    const numericId = typeof courseId === 'string' ? parseInt(courseId) : courseId;
    return this.http.post(`${this.apiUrl}/${numericId}/assign-instructor`, JSON.stringify(teacherId), {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
