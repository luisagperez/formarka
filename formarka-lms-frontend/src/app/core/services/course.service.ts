import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Course, Resource, Deliverable, StudentProgress } from '../models/course.model';
import { delay } from 'rxjs/operators';

/**
 * Course Service
 * 
 * Provides mock data and handles operations for courses, students, and grading.
 */
@Injectable({
  providedIn: 'root'
})
export class CourseService {
  // Enhanced mock data
  private _courses: Course[] = [
    {
      "id": "1",
      "title": "Construye tu Marca desde Cero",
      "description": "Aprende los fundamentos del diseño de marca para emprendedores.",
      "thumbnailUrl": "construye tu marca.png",
      "category": "Diseño",
      "level": "básico",
      "instructorName": "Profe Luis",
      "instructorId": "t1",
      "totalHours": 20,
      "enrolledStudents": [
        { "studentId": "s1", "studentName": "Estudiante Juan", "progress": 100, "grade": 95, "completedDate": "2026-05-01" },
        { "studentId": "s2", "studentName": "Estudiante Ana", "progress": 45 }
      ],
      "modules": [
        {
          "id": "m1",
          "title": "Módulo 1: Estrategia de marca",
          "isOpen": true,
          "lessons": [
            {
              "id": "l1_1",
              "title": "Introducción al ADN de Marca",
              "type": "video",
              "contentUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
              "duration": "08:45",
              "isCompleted": true,
              "resources": [
                { "id": "r1_1", "title": "Aspectos clave de la estrategia de marca", "url": "https://drive.google.com/file/d/1zu50WntNXq7djVGU8FIsUjy1ERrUqS5P/view?usp=sharing", "type": "pdf" }
              ]
            },
            {
              "id": "l1_2",
              "title": "Entregable: Definición de Buyer Persona",
              "type": "deliverable",
              "duration": "30:00",
              "isCompleted": false,
              "deliverable": {
                "id": "d1",
                "studentId": "s1",
                "courseId": "1",
                "lessonId": "l1_2",
                "contentUrl": "https://example.com/submission.pdf",
                "submissionDate": "2026-05-10",
                "status": "pending"
              }
            },
            {
              "id": "l1_3",
              "title": "Propuesta de Valor y Ventaja Competitiva",
              "type": "video",
              "contentUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
              "duration": "10:15",
              "isCompleted": false,
              "resources": [
                { "id": "r1_3", "title": "Cuadrante de Posicionamiento de Mercado", "url": "https://drive.google.com/file/d/example2/view", "type": "pdf" }
              ]
            }
          ]
        },
        {
          "id": "m2",
          "title": "Módulo 2: Uso correcto del color",
          "isOpen": false,
          "lessons": [
            {
              "id": "l2_1",
              "title": "Psicología y Teoría del Color en Branding",
              "type": "video",
              "contentUrl": "https://www.youtube.com/embed/Wmn4heF9yXE?si=Vdc05urVBueXxJc-",
              "duration": "09:15",
              "isCompleted": false,
              "resources": [
                { "id": "r2_1", "title": "Color profesional", "url": "https://drive.google.com/file/d/1kOLtEwzAOXBffq0XiSclJGJSgYVTdEZQ/view?usp=sharing", "type": "pdf" }
              ]
            },
            {
              "id": "l2_2",
              "title": "Cómo crear Paletas Cromáticas Armónicas",
              "type": "video",
              "contentUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
              "duration": "14:20",
              "isCompleted": false,
              "resources": [
                { "id": "r2_2", "title": "Guía de Combinaciones y Círculo Cromático", "url": "https://drive.google.com/file/d/example4/view", "type": "pdf" }
              ]
            },
            {
              "id": "l2_3",
              "title": "Entregable: Diseño de la Paleta Cromática",
              "type": "deliverable",
              "duration": "45:00",
              "isCompleted": false,
              "deliverable": {
                "id": "d2",
                "studentId": "s2",
                "courseId": "1",
                "lessonId": "l2_3",
                "contentUrl": "https://example.com/palette_submission.pdf",
                "submissionDate": "2026-05-15",
                "status": "graded"
              }
            }
          ]
        },
        {
          "id": "m3",
          "title": "Módulo 3: Tipografía",
          "isOpen": false,
          "lessons": [
            {
              "id": "l3_1",
              "title": "Clasificación y Anatomía Tipográfica",
              "type": "video",
              "contentUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
              "duration": "07:40",
              "isCompleted": false,
              "resources": [
                { "id": "r3_1", "title": "Tipografía Pro", "url": "https://drive.google.com/file/d/1Lk7-UCp1kL8f3VRE_MsUHHFQguSsVtk3/view?usp=drive_link", "type": "pdf" }
              ]
            },
            {
              "id": "l3_2",
              "title": "Maridaje Tipográfico: Combinación con Éxito",
              "type": "video",
              "contentUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
              "duration": "13:10",
              "isCompleted": false,
              "resources": [
                { "id": "r3_2", "title": "Manual de Jerarquías Visuales", "url": "https://drive.google.com/file/d/example6/view", "type": "pdf" }
              ]
            },
            {
              "id": "l3_3",
              "title": "Entregable: Definición del Sistema Tipográfico",
              "type": "deliverable",
              "duration": "40:00",
              "isCompleted": false,
              "deliverable": {
                "id": "d3",
                "studentId": "s1",
                "courseId": "1",
                "lessonId": "l3_3",
                "contentUrl": "",
                "submissionDate": "",
                "status": "pending"
              }
            }
          ]
        }
      ]
    },
    {
      "id": "2",
      "title": "Estrategia de Contenido para Redes",
      "description": "Cómo crear contenido que conecte con tu audiencia.",
      "thumbnailUrl": "estrategia marketing.png",
      "category": "Marketing",
      "level": "intermedio",
      "instructorName": "Profe Maria",
      "instructorId": "t2",
      "totalHours": 15,
      "enrolledStudents": [
        { "studentId": "s2", "studentName": "Estudiante Ana", "progress": 10 }
      ],
      "modules": [
        {
          "id": "m2_1",
          "title": "Módulo 1: Planificación y Calendario Editorial",
          "isOpen": true,
          "lessons": [
            {
              "id": "l2_1_1",
              "title": "Definición de Pilares de Contenido",
              "type": "video",
              "contentUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
              "duration": "11:15",
              "isCompleted": false,
              "resources": [
                { "id": "r2_1_1", "title": "Matriz de Contenidos XLS", "url": "https://drive.google.com/file/d/example7/view", "type": "excel" }
              ]
            },
            {
              "id": "l2_1_2",
              "title": "Entregable: Calendario Mensual de Redes",
              "type": "deliverable",
              "duration": "60:00",
              "isCompleted": false,
              "deliverable": {
                "id": "d4",
                "studentId": "s2",
                "courseId": "2",
                "lessonId": "l2_1_2",
                "contentUrl": "https://example.com/calendar_design.pdf",
                "submissionDate": "2026-05-12",
                "status": "pending"
              }
            }
          ]
        }
      ]
    },
    {
      "id": "3",
      "title": "Fotografía de Producto con Celular",
      "description": "Haz que tus productos luzcan profesionales con tu smartphone.",
      "thumbnailUrl": "fotografia productos.png",
      "category": "Fotografía",
      "level": "básico",
      "instructorName": "Profe Lucas",
      "instructorId": "t3",
      "totalHours": 12,
      "enrolledStudents": [
        { "studentId": "s1", "studentName": "Estudiante Juan", "progress": 20 }
      ],
      "modules": [
        {
          "id": "m3_1",
          "title": "Módulo 1: Iluminación Casera Avanzada",
          "isOpen": true,
          "lessons": [
            {
              "id": "l3_1_1",
              "title": "Dominando la Luz Natural de Ventana",
              "type": "video",
              "contentUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
              "duration": "09:50",
              "isCompleted": false,
              "resources": [
                { "id": "r3_1_1", "title": "Guía de Esquemas de Iluminación", "url": "https://drive.google.com/file/d/example8/view", "type": "pdf" }
              ]
            },
            {
              "id": "l3_1_2",
              "title": "Entregable: Set de Iluminación DIY",
              "type": "deliverable",
              "duration": "45:00",
              "isCompleted": false,
              "deliverable": {
                "id": "d5",
                "studentId": "s1",
                "courseId": "3",
                "lessonId": "l3_1_2",
                "contentUrl": "",
                "submissionDate": "",
                "status": "pending"
              }
            }
          ]
        }
      ]
    }
  ];

  private PROGRESS_KEY = 'f-lms-progress';
  private LAST_ACTIVITY_KEY = 'f-lms-last-activity';

  getCourses(): Observable<Course[]> {
    // BACKEND REQUEST: return this.http.get<Course[]>('/api/courses');
    return of(this.injectProgress(this._courses)).pipe(delay(400));
  }

  getCourse(id: string): Observable<Course | undefined> {
    // BACKEND REQUEST: return this.http.get<Course>(`/api/courses/${id}`);
    const course = this._courses.find(c => c.id === id);
    if (course) {
      return of(this.injectProgress([course])[0]).pipe(delay(300));
    }
    return of(undefined).pipe(delay(300));
  }

  /**
   * TEACHER & ADMIN: Course Management
   */
  createCourse(course: Course): Observable<Course> {
    // BACKEND REQUEST: return this.http.post<Course>('/api/courses', course);
    const newCourse = { ...course, id: Math.random().toString(36).substring(2, 9) };
    this._courses.push(newCourse);
    return of(newCourse).pipe(delay(600));
  }

  updateCourse(id: string, course: Partial<Course>): Observable<Course | undefined> {
    // BACKEND REQUEST: return this.http.put<Course>(`/api/courses/${id}`, course);
    const index = this._courses.findIndex(c => c.id === id);
    if (index !== -1) {
      this._courses[index] = { ...this._courses[index], ...course };
      return of(this._courses[index]).pipe(delay(600));
    }
    return of(undefined).pipe(delay(300));
  }

  deleteCourse(id: string): Observable<boolean> {
    // BACKEND REQUEST: return this.http.delete<boolean>(`/api/courses/${id}`);
    const initialLength = this._courses.length;
    this._courses = this._courses.filter(c => c.id !== id);
    return of(this._courses.length < initialLength).pipe(delay(500));
  }

  /**
   * TEACHER: Grading and Students
   */
  getEnrolledStudents(courseId: string): Observable<StudentProgress[]> {
    // BACKEND REQUEST: return this.http.get<StudentProgress[]>(`/api/courses/${courseId}/students`);
    const course = this._courses.find(c => c.id === courseId);
    return of(course?.enrolledStudents || []).pipe(delay(400));
  }

  gradeDeliverable(courseId: string, studentId: string, grade: number, feedback: string): Observable<boolean> {
    // BACKEND REQUEST: 
    // return this.http.post<boolean>(`/api/courses/${courseId}/students/${studentId}/grade`, { grade, feedback });

    console.log(`Mock: Grading student ${studentId} in course ${courseId} with ${grade}`);
    const course = this._courses.find(c => c.id === courseId);
    if (course && course.enrolledStudents) {
      const student = course.enrolledStudents.find(s => s.studentId === studentId);
      if (student) {
        student.grade = grade;
        // In a real app, we might also update the deliverable status
        return of(true).pipe(delay(600));
      }
    }
    return of(false);
  }

  uploadResource(courseId: string, lessonId: string, resource: Resource): Observable<Resource> {
    // BACKEND REQUEST: 
    // return this.http.post<Resource>(`/api/courses/${courseId}/lessons/${lessonId}/resources`, resource);

    console.log(`Mock: Uploading resource to lesson ${lessonId} in course ${courseId}`);
    const course = this._courses.find(c => c.id === courseId);
    if (course && course.modules) {
      for (const module of course.modules) {
        const lesson = module.lessons.find(l => l.id === lessonId);
        if (lesson) {
          if (!lesson.resources) lesson.resources = [];
          const newResource = { ...resource, id: Math.random().toString(36).substring(2, 9) };
          lesson.resources.push(newResource);
          return of(newResource).pipe(delay(500));
        }
      }
    }
    return of(resource).pipe(delay(500));
  }

  /**
   * ADMIN: Assign Teacher to Course
   */
  assignTeacher(courseId: string, teacherId: string, teacherName: string): Observable<boolean> {
    // BACKEND REQUEST: return this.http.post<boolean>(`/api/admin/courses/${courseId}/assign`, { teacherId });
    const course = this._courses.find(c => c.id === courseId);
    if (course) {
      course.instructorId = teacherId;
      course.instructorName = teacherName;
      return of(true).pipe(delay(500));
    }
    return of(false);
  }

  /**
   * STUDENT: Progress and Enrollment
   */
  enroll(courseId: string): Observable<boolean> {
    console.log(`Mock: Enrolling in course: ${courseId}`);
    // BACKEND REQUEST: return this.http.post<boolean>('/api/learning/enroll', { courseId });

    const course = this._courses.find(c => c.id === courseId);
    if (course) {
      if (!course.enrolledStudents) course.enrolledStudents = [];
      // Simulating adding current user to enrolled students
      // course.enrolledStudents.push({ studentId: 'current', studentName: 'Current User', progress: 0 });
      return of(true).pipe(delay(1000));
    }
    return of(false);
  }

  completeLesson(courseId: string, lessonId: string): void {
    const progress = this.getAllProgress();
    progress[`${courseId}_${lessonId}`] = true;
    localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(progress));
  }

  private getAllProgress(): { [key: string]: boolean } {
    const data = localStorage.getItem(this.PROGRESS_KEY);
    return data ? JSON.parse(data) : {};
  }

  getCourseProgress(courseId: string): number {
    const course = this._courses.find(c => c.id === courseId);
    if (!course || !course.modules) return 0;
    let totalLessons = 0, completedLessons = 0;
    const progress = this.getAllProgress();
    course.modules.forEach(m => {
      m.lessons.forEach(l => {
        totalLessons++;
        if (progress[`${courseId}_${l.id}`]) completedLessons++;
      });
    });
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  }

  private injectProgress(courses: Course[]): Course[] {
    const progress = this.getAllProgress();
    return courses.map(course => {
      if (course.modules) {
        course.modules.forEach(m => {
          m.lessons.forEach(l => {
            l.isCompleted = progress[`${course.id}_${l.id}`] || false;
          });
        });
      }
      return course;
    });
  }
}
