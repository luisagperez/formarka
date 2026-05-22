import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { SafePipe } from '../../../shared/pipes/safe.pipe';
import { Course, Lesson, Module } from '../../../core/models/course.model';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { QuizComponent } from '../quiz/quiz.component';

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [CommonModule, SafePipe, RouterModule, QuizComponent],
  templateUrl: './course-player.component.html',
  styleUrl: './course-player.component.css'
})
export class CoursePlayerComponent implements OnInit {
  course?: Course;
  currentLesson?: Lesson;
  progress: number = 0;
  showCelebration: boolean = false;
  userName: string = '';
  isSidebarOpen: boolean = true;
  window = window;
  
  constructor(
    public courseService: CourseService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.userName = this.authService.currentUser()?.name || 'Estudiante';
  }

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('courseId');
    if (courseId) {
      this.loadCourse(courseId);
    }
    
    // Check screen size on init
    if (window.innerWidth <= 1024) {
      this.isSidebarOpen = false;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  loadCourse(id: string) {
    this.courseService.getCourse(id).subscribe(course => {
      if (course) {
        this.course = course;
        this.updateProgress();
        if (course.modules && course.modules.length > 0 && course.modules[0].lessons.length > 0) {
          this.currentLesson = course.modules[0].lessons[0];
        }
      }
    });
  }

  updateProgress() {
    if (this.course) {
      this.progress = this.courseService.getCourseProgress(this.course.id);
      if (this.progress === 100) {
        this.showCelebration = true;
      }
    }
  }

  selectLesson(lesson: Lesson): void {
    this.currentLesson = lesson;
  }

  toggleModule(module: Module): void {
    module.isOpen = !module.isOpen;
  }

  markAsCompleted(): void {
    if (this.currentLesson && this.course) {
      this.currentLesson.isCompleted = true;
      this.courseService.completeLesson(this.course.id, this.currentLesson.id);
      this.updateProgress();
    }
  }

  downloadCertificate() {
    if (!this.course) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Certificado Formarka - ${this.course.title}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;800&display=swap');
              
              @page {
                size: letter landscape;
                margin: 0;
              }

              body { 
                font-family: 'Montserrat', sans-serif; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh; 
                margin: 0; 
                background: #fafafa; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

              .certificate { 
                width: 1000px; 
                padding: 50px 80px; 
                background: white; 
                border: 25px solid #4e0767; 
                text-align: center; 
                position: relative;
                box-shadow: 0 0 50px rgba(0,0,0,0.1);
                transform: scale(0.9);
                transform-origin: center;
                box-sizing: border-box;
              }

              .certificate::after { 
                content: ''; 
                position: absolute; 
                top: 15px; 
                left: 15px; 
                right: 15px; 
                bottom: 15px; 
                border: 2px solid #ca63f0; 
                pointer-events: none; 
              }

              .logo { font-size: 1.8rem; font-weight: 800; color: #4e0767; margin-bottom: 30px; letter-spacing: 5px; }
              h1 { color: #4e0767; font-size: 3rem; margin: 0 0 5px 0; font-weight: 800; text-transform: uppercase; }
              .subtitle { font-size: 1.2rem; color: #666; margin-bottom: 30px; }
              
              .user-name { 
                font-size: 2.8rem; 
                font-weight: 800; 
                color: #000; 
                margin: 25px 0; 
                border-bottom: 3px solid #ca63f0; 
                display: inline-block; 
                padding: 0 60px 5px 60px; 
              }
              
              .course-label { font-size: 1.1rem; color: #888; margin-top: 20px; }
              .course-name { font-size: 2rem; color: #4e0767; font-weight: 800; margin: 10px 0 30px 0; }
              
              .footer-info { 
                display: flex; 
                justify-content: space-between; 
                align-items: flex-end;
                margin-top: 40px; 
                padding: 0 40px;
                border-top: 1px solid #eee;
                padding-top: 25px;
              }
              
              .info-item { text-align: left; }
              .info-label { font-size: 0.75rem; color: #999; text-transform: uppercase; font-weight: 700; }
              .info-value { font-size: 1rem; color: #333; font-weight: 700; }
              .signature { border-top: 2px solid #333; width: 180px; padding-top: 10px; font-weight: 700; color: #4e0767; text-align: center; }
              
              @media print { 
                .no-print { display: none; } 
                body { background: white; }
                .certificate { 
                  box-shadow: none; 
                  border-width: 20px;
                  transform: scale(0.9);
                  transform-origin: center;
                }
              }
            </style>
          </head>
          <body>
            <div class="certificate">
              <div class="logo">FORMARKA</div>
              <h1>Certificado</h1>
              <p class="subtitle">Se otorga el presente reconocimiento a:</p>
              
              <div class="user-name">${this.userName}</div>
              
              <p class="course-label">Por haber completado satisfactoriamente el programa de:</p>
              <div class="course-name">${this.course.title}</div>
              
              <div class="footer-info">
                <div class="info-item">
                  <div class="info-label">Intensidad Horaria</div>
                  <div class="info-value">${this.course.totalHours} Horas Lectivas</div>
                </div>
                
                <div class="signature">
                  Director Académico
                </div>
                
                <div class="info-item" style="text-align: right;">
                  <div class="info-label">Fecha de Emisión</div>
                  <div class="info-value">${new Date().toLocaleDateString()}</div>
                </div>
              </div>
              
              <button class="no-print" onclick="window.print()" style="margin-top: 30px; padding: 12px 24px; background: #4e0767; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 800; font-size: 0.9rem;">🖨️ Imprimir / Guardar PDF</button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }
}
