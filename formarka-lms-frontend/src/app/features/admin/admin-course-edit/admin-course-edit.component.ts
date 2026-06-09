import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { Course, Resource } from '../../../core/models/course.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-admin-course-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonComponent, FormFieldComponent],
  template: `
    <div class="container admin-edit-container animate-up">
      <div class="edit-header">
        <nav class="breadcrumb">
          <a routerLink="/admin/courses">Gestión de Cursos</a> 
          <span class="separator">/</span> 
          <span class="current">{{ isEditMode ? 'Editar' : 'Nuevo' }} Curso</span>
        </nav>
        <h1 class="text-gradient">{{ isEditMode ? 'Panel de Edición Avanzada' : 'Crea una nueva Experiencia' }}</h1>
        <p class="subtitle">Configura cada detalle de tu programa educativo, desde la intensidad horaria hasta los entregables.</p>
      </div>

      <div class="edit-content">
        <form [formGroup]="courseForm" (ngSubmit)="saveCourse()" class="course-form">
          <!-- Información General -->
          <div class="form-card glass animate-up" style="animation-delay: 0.1s">
            <div class="card-header">
              <span class="step-num">1</span>
              <h3>Configuración General</h3>
            </div>
            
            <app-form-field 
              label="Título del Curso" 
              [control]="getControl('title')"
              placeholder="Ej. Branding Avanzado para Emprendedores">
            </app-form-field>

            <div class="form-row">
              <app-form-field 
                label="Categoría" 
                [control]="getControl('category')"
                placeholder="Ej. Estrategia">
              </app-form-field>

              <app-form-field 
                label="Intensidad Horaria (Total)" 
                type="number"
                [control]="getControl('totalHours')"
                placeholder="20">
              </app-form-field>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label class="label">Nivel de Dificultad</label>
                <div class="select-wrapper">
                  <select formControlName="level" class="select-input">
                    <option value="básico">Básico</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                </div>
              </div>
              <div class="form-field">
                <label class="label">Instructor Responsable</label>
                <div class="select-wrapper">
                  <select formControlName="instructorId" class="select-input">
                    <option value="" disabled>Seleccione un instructor</option>
                    <option *ngFor="let inst of instructors" [value]="inst.id">{{ inst.name }} ({{ inst.specialty }})</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="form-field">
              <label class="label">Descripción Detallada</label>
              <textarea 
                formControlName="description" 
                class="textarea-input" 
                rows="5"
                placeholder="¿Qué lograrán tus alumnos con este curso?">
              </textarea>
            </div>

            <app-form-field 
              label="URL Imagen de Portada" 
              [control]="getControl('thumbnailUrl')"
              placeholder="https://images.unsplash.com/...">
            </app-form-field>
          </div>

          <!-- Estructura de Módulos y Lecciones -->
          <div class="form-card glass animate-up" style="animation-delay: 0.2s">
            <div class="card-header flex-between">
              <div class="flex-align">
                <span class="step-num">2</span>
                <h3>Plan de Estudios y Recursos</h3>
              </div>
              <button type="button" class="add-btn" (click)="addModule()">
                + Añadir Módulo
              </button>
            </div>

            <div formArrayName="modules" class="modules-list">
              <div *ngFor="let module of modules.controls; let i=index" [formGroupName]="i" class="module-item animate-up">
                <div class="module-main-row">
                  <div class="module-drag-handle">⋮⋮</div>
                  <input type="text" formControlName="title" placeholder="Título del Módulo" class="module-title-input">
                  <button type="button" class="delete-icon-btn" (click)="removeModule(i)" title="Eliminar Módulo">🗑️</button>
                </div>

                <div formArrayName="lessons" class="lessons-list">
                  <div *ngFor="let lesson of getLessons(i).controls; let j=index" [formGroupName]="j" class="lesson-card">
                    <div class="lesson-header">
                      <input type="text" formControlName="title" placeholder="Título de la lección" class="lesson-title-input">
                      <div class="lesson-type-tag">
                        <select formControlName="type">
                          <option value="video">📹 Video</option>
                          <option value="text">📄 Texto</option>
                          <option value="quiz">🧠 Quiz</option>
                          <option value="deliverable">📤 Entregable</option>
                          <option value="file">📁 Archivo</option>
                        </select>
                      </div>
                      <button type="button" class="lesson-remove" (click)="removeLesson(i, j)">×</button>
                    </div>
                    
                    <div class="lesson-details">
                      <div [ngSwitch]="lesson.value.type">
                        <!-- Video: URL + Duration -->
                        <div *ngSwitchCase="'video'" class="form-row">
                          <app-form-field label="Enlace del Video (YouTube/Vimeo)" [control]="getLessonControl(i, j, 'contentUrl')" placeholder="https://youtube.com/watch?v=..."></app-form-field>
                          <app-form-field label="Duración (min)" [control]="getLessonControl(i, j, 'duration')" placeholder="Ej. 10:00"></app-form-field>
                        </div>

                        <!-- Text: Textarea for content -->
                        <div *ngSwitchCase="'text'" class="form-field">
                          <label class="label">Contenido de la Lección</label>
                          <textarea formControlName="contentUrl" class="textarea-input" rows="4" placeholder="Escribe aquí el texto o contenido de la lección..."></textarea>
                        </div>

                        <!-- File: URL only -->
                        <div *ngSwitchCase="'file'" class="form-row">
                          <app-form-field label="URL del Archivo / Recurso" [control]="getLessonControl(i, j, 'contentUrl')" placeholder="Link de descarga (Google Drive, Dropbox, etc)"></app-form-field>
                          <div class="type-info">
                            <p>Esta lección permite descargar un archivo directamente.</p>
                          </div>
                        </div>

                        <!-- Quiz Section -->
                        <div *ngSwitchCase="'quiz'" class="quiz-edit-box card shadow-sm">
                          <div [formGroupName]="'quiz'">
                            <div class="quiz-info-row">
                              <app-form-field label="Título del Quiz" [control]="getQuizControl(i, j, 'title')" placeholder="Ej. Evaluación de Marca"></app-form-field>
                              <app-form-field label="Puntaje para Aprobar" type="number" [control]="getQuizControl(i, j, 'passingScore')" placeholder="70"></app-form-field>
                            </div>

                            <div formArrayName="questions" class="questions-list">
                              <div *ngFor="let question of getQuestions(i, j).controls; let qi=index" [formGroupName]="qi" class="question-item">
                                <div class="question-header">
                                  <span class="q-num">Q{{ qi + 1 }}</span>
                                  <input type="text" formControlName="text" placeholder="Escribe la pregunta..." class="q-input">
                                  <input type="number" formControlName="points" placeholder="Pts" class="q-points">
                                  <button type="button" class="res-remove" (click)="removeQuestion(i, j, qi)">×</button>
                                </div>

                                <div formArrayName="options" class="options-list">
                                  <div *ngFor="let option of getOptions(i, j, qi).controls; let oi=index" [formGroupName]="oi" class="option-row">
                                    <input type="checkbox" formControlName="isCorrect" class="opt-check">
                                    <input type="text" formControlName="text" placeholder="Opción {{ oi + 1 }}" class="opt-input">
                                    <button type="button" class="res-remove" (click)="removeOption(i, j, qi, oi)">×</button>
                                  </div>
                                  <button type="button" class="small-add-btn" (click)="addOption(i, j, qi)">+ Añadir Opción</button>
                                </div>
                              </div>
                            </div>
                            <button type="button" class="add-question-btn" (click)="addQuestion(i, j)">+ Nueva Pregunta</button>
                          </div>
                        </div>

                        <!-- Deliverable: Instructions -->
                        <div *ngSwitchCase="'deliverable'" class="form-field">
                          <label class="label">Instrucciones del Entregable</label>
                          <textarea formControlName="contentUrl" class="textarea-input" rows="3" placeholder="Describe qué deben entregar los alumnos..."></textarea>
                        </div>

                        <!-- Fallback -->
                        <div *ngSwitchDefault class="form-row">
                          <app-form-field label="URL Contenido" [control]="getLessonControl(i, j, 'contentUrl')" placeholder="Link del recurso"></app-form-field>
                          <app-form-field label="Duración" [control]="getLessonControl(i, j, 'duration')" placeholder="00:00"></app-form-field>
                        </div>
                      </div>
                      
                      <!-- Resources inside lesson -->
                      <div class="resources-section">
                        <div class="resources-header">
                          <label>Recursos Descargables</label>
                          <button type="button" (click)="addResource(i, j)" class="small-add-btn">+ Añadir Link</button>
                        </div>
                        <div formArrayName="resources" class="resources-list">
                          <div *ngFor="let res of getResources(i, j).controls; let k=index" [formGroupName]="k" class="resource-row">
                            <input type="text" formControlName="title" placeholder="Nombre del recurso" class="res-input">
                            <input type="text" formControlName="url" placeholder="URL del recurso" class="res-input">
                            <button type="button" (click)="removeResource(i, j, k)" class="res-remove">×</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button type="button" class="add-lesson-btn" (click)="addLesson(i)">
                    + Nueva Lección
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions animate-up" style="animation-delay: 0.3s">
            <app-button variant="outline" type="button" routerLink="/admin/courses">
              Descartar
            </app-button>
            <app-button type="submit" [loading]="isSaving" [disabled]="courseForm.invalid">
              {{ isEditMode ? 'Guardar Cambios' : 'Publicar Curso' }}
            </app-button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .admin-edit-container { padding: 40px 0; }
    .edit-header { margin-bottom: 40px; }
    .breadcrumb { font-size: 0.9rem; margin-bottom: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
    .breadcrumb a { color: var(--brand-purple-deep); text-decoration: none; }
    .breadcrumb .separator { color: #ccc; }
    .edit-header h1 { font-size: 2.8rem; margin-bottom: 8px; }
    .subtitle { color: var(--formarka-text-muted); font-size: 1.1rem; }

    .edit-content { display: block; max-width: 1000px; margin: 0 auto; }

    .form-card { background: white; padding: 40px; border-radius: 32px; border: 1px solid rgba(78, 7, 103, 0.05); margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
    .card-header { display: flex; align-items: center; gap: 15px; margin-bottom: 30px; }
    .step-num { width: 32px; height: 32px; background: var(--brand-purple-deep); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; }
    .card-header h3 { margin: 0; font-size: 1.4rem; color: var(--brand-black); }
    .flex-between { justify-content: space-between; }
    .flex-align { display: flex; align-items: center; gap: 15px; }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 16px; }
    .label { display: block; margin-bottom: 10px; font-weight: 700; color: var(--brand-black); font-size: 0.95rem; }
    
    .select-input, .textarea-input, .module-title-input, .lesson-title-input, .res-input { 
      width: 100%; padding: 12px 18px; border: 1.5px solid #e2e8f0; border-radius: 12px; 
      font-size: 1rem; background: #fff; transition: all 0.3s; font-family: var(--font-main);
    }

    .add-btn { background: var(--brand-purple-light); color: var(--brand-purple-deep); border: none; padding: 8px 20px; border-radius: 100px; font-weight: 800; cursor: pointer; transition: all 0.3s; font-size: 0.9rem; }
    
    .modules-list { display: flex; flex-direction: column; gap: 30px; margin-top: 20px; }
    .module-item { background: #fcfaff; border-radius: 24px; padding: 30px; border: 1.5px solid #f0e6ff; }
    .module-main-row { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; }
    .module-title-input { font-weight: 800; border: none; background: transparent; padding: 10px; font-size: 1.3rem; color: var(--brand-purple-deep); }

    .lessons-list { margin-left: 20px; display: flex; flex-direction: column; gap: 20px; }
    .lesson-card { background: white; padding: 24px; border-radius: 20px; border: 1px solid #eee; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
    .lesson-header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; border-bottom: 1px solid #f5f5f5; padding-bottom: 15px; }
    .lesson-title-input { border: none; background: transparent; padding: 5px; font-weight: 700; font-size: 1.1rem; flex: 1; }
    .lesson-type-tag select { background: #f0f0f0; padding: 6px 12px; border-radius: 8px; font-weight: 700; border: none; }
    .lesson-remove { font-size: 1.5rem; color: #ccc; cursor: pointer; background: none; border: none; }

    .resources-section { margin-top: 20px; padding-top: 15px; border-top: 1px dashed #eee; }
    .resources-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .resources-header label { font-weight: 700; font-size: 0.9rem; color: #666; }
    .small-add-btn { background: #f0f0f0; border: none; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
    .resource-row { display: flex; gap: 10px; margin-bottom: 8px; align-items: center; }
    .res-input { padding: 8px 12px; font-size: 0.9rem; }
    .res-remove { color: #fca5a5; font-size: 1.2rem; background: none; border: none; cursor: pointer; }

    .add-lesson-btn { background: white; border: 1.5px dashed #d8b4fe; color: var(--brand-purple-deep); padding: 12px; border-radius: 14px; cursor: pointer; font-weight: 700; width: 100%; transition: all 0.3s; }
    .add-lesson-btn:hover { background: var(--brand-purple-light); }

    .form-actions { display: flex; justify-content: flex-end; gap: 20px; padding: 40px 0; }
    .delete-icon-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; }
    .type-info { display: flex; align-items: center; color: #666; font-size: 0.85rem; padding: 12px; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1; }
    .type-info p { margin: 0; line-height: 1.4; }

    /* Quiz Edit Styles */
    .quiz-edit-box { background: #fff; border: 2px solid var(--brand-purple-light); border-radius: 20px; padding: 24px; margin-top: 15px; }
    .quiz-info-row { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
    .question-item { background: #f9fafb; border-radius: 16px; padding: 20px; margin-bottom: 20px; border: 1px solid #e5e7eb; }
    .question-header { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
    .q-num { font-weight: 800; color: var(--brand-purple-deep); background: #eee; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
    .q-input { flex: 1; border: none; background: transparent; font-weight: 700; font-size: 1.1rem; border-bottom: 2px solid #ddd; padding: 5px; }
    .q-points { width: 60px; text-align: center; border: 1.5px solid #ddd; border-radius: 8px; padding: 4px; }
    
    .options-list { margin-left: 44px; display: flex; flex-direction: column; gap: 10px; }
    .option-row { display: flex; align-items: center; gap: 12px; }
    .opt-input { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; font-size: 0.9rem; }
    .opt-check { width: 18px; height: 18px; cursor: pointer; accent-color: var(--brand-purple-deep); }
    .add-question-btn { background: var(--brand-purple-deep); color: white; border: none; padding: 10px 20px; border-radius: 30px; font-weight: 700; cursor: pointer; width: 100%; margin-top: 10px; }
  `]
})
export class AdminCourseEditComponent implements OnInit {
  courseForm: FormGroup;
  isEditMode = false;
  isSaving = false;
  courseId?: string;
  instructors: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private authService: AuthService
  ) {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required]],
      category: ['', [Validators.required]],
      level: ['básico', [Validators.required]],
      thumbnailUrl: ['', [Validators.required]],
      instructorId: ['', [Validators.required]],
      totalHours: [20, [Validators.required, Validators.min(1)]],
      modules: this.fb.array([])
    });
  }

  get modules() { return this.courseForm.get('modules') as FormArray; }

  getLessons(moduleIndex: number) { return this.modules.at(moduleIndex).get('lessons') as FormArray; }

  getResources(mi: number, li: number) {
    return this.getLessons(mi).at(li).get('resources') as FormArray;
  }

  getQuizGroup(moduleIndex: number, lessonIndex: number) {
    return this.getLessons(moduleIndex).at(lessonIndex).get('quiz') as FormGroup;
  }

  getQuestions(mi: number, li: number) {
    return this.getQuizGroup(mi, li).get('questions') as FormArray;
  }

  getOptions(mi: number, li: number, qi: number) {
    return this.getQuestions(mi, li).at(qi).get('options') as FormArray;
  }

  addModule() {
    const moduleGroup = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      lessons: this.fb.array([])
    });
    this.modules.push(moduleGroup);
    this.addLesson(this.modules.length - 1);
  }

  removeModule(index: number) { if (confirm('¿Eliminar módulo?')) this.modules.removeAt(index); }

  addLesson(moduleIndex: number) {
    const lessonGroup = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      type: ['video', Validators.required],
      contentUrl: [''],
      duration: [''],
      resources: this.fb.array([]),
      quiz: this.fb.group({
        id: [null],
        title: [''],
        description: [''],
        passingScore: [70],
        questions: this.fb.array([])
      })
    });
    this.getLessons(moduleIndex).push(lessonGroup);

    lessonGroup.get('type')?.valueChanges.subscribe(type => {
      if (type === 'quiz' && !lessonGroup.get('quiz.title')?.value) {
        lessonGroup.get('quiz.title')?.setValue(`Evaluación: ${lessonGroup.get('title')?.value}`);
        if (this.getQuestions(moduleIndex, this.getLessons(moduleIndex).length - 1).length === 0) {
          this.addQuestion(moduleIndex, this.getLessons(moduleIndex).length - 1);
        }
      }
    });
  }

  addQuestion(mi: number, li: number) {
    const qGroup = this.fb.group({
      id: [null],
      text: ['', Validators.required],
      type: ['multiplechoice'],
      points: [10],
      options: this.fb.array([])
    });
    this.getQuestions(mi, li).push(qGroup);
    const qi = this.getQuestions(mi, li).length - 1;
    this.addOption(mi, li, qi);
    this.addOption(mi, li, qi);
  }

  removeQuestion(mi: number, li: number, qi: number) {
    this.getQuestions(mi, li).removeAt(qi);
  }

  addOption(mi: number, li: number, qi: number) {
    const oGroup = this.fb.group({
      id: [null],
      text: ['', Validators.required],
      isCorrect: [false]
    });
    this.getOptions(mi, li, qi).push(oGroup);
  }

  removeOption(mi: number, li: number, qi: number, oi: number) {
    this.getOptions(mi, li, qi).removeAt(oi);
  }

  removeLesson(moduleIndex: number, lessonIndex: number) { this.getLessons(moduleIndex).removeAt(lessonIndex); }

  addResource(moduleIndex: number, lessonIndex: number) {
    const resGroup = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      url: ['', Validators.required],
      type: ['pdf']
    });
    this.getResources(moduleIndex, lessonIndex).push(resGroup);
  }

  removeResource(moduleIndex: number, lessonIndex: number, resIndex: number) {
    this.getResources(moduleIndex, lessonIndex).removeAt(resIndex);
  }

  ngOnInit(): void {
    // Load instructors first
    this.authService.getInstructors().subscribe((list: any[]) => this.instructors = list);

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.courseId = id;
      this.courseService.getCourse(id).subscribe(course => {
        if (course) {
          this.courseForm.patchValue({
            title: course.title,
            description: course.description,
            category: course.category,
            level: course.level,
            thumbnailUrl: course.thumbnailUrl,
            instructorId: course.instructorId,
            totalHours: course.totalHours
          });
          
          if (course.modules) {
            this.modules.clear();
            course.modules.forEach((m, mi) => {
              const moduleGroup = this.fb.group({
                id: [m.id],
                title: [m.title, Validators.required],
                lessons: this.fb.array(m.lessons.map((l, li) => {
                  const lGroup = this.fb.group({
                    id: [l.id],
                    title: [l.title, Validators.required],
                    type: [l.type, Validators.required],
                    contentUrl: [l.contentUrl || ''],
                    duration: [l.duration || ''],
                    resources: this.fb.array((l.resources || []).map(r => this.fb.group({
                      id: [r.id],
                      title: [r.title],
                      url: [r.url],
                      type: [r.type]
                    }))),
                    quiz: this.fb.group({
                      id: [null],
                      title: [''],
                      description: [''],
                      passingScore: [70],
                      questions: this.fb.array([])
                    })
                  });

                  if (l.type === 'quiz') {
                    this.courseService.getQuizByLesson(l.id).subscribe(quiz => {
                      if (quiz) {
                        const qGroup = lGroup.get('quiz') as FormGroup;
                        qGroup.patchValue({
                          id: quiz.id,
                          title: quiz.title,
                          description: quiz.description,
                          passingScore: quiz.passingScore
                        });
                        const questionsArray = qGroup.get('questions') as FormArray;
                        questionsArray.clear();
                        quiz.questions.forEach((q: any) => {
                          questionsArray.push(this.fb.group({
                            id: [q.id],
                            text: [q.text, Validators.required],
                            type: [q.questionType || 'multiplechoice'],
                            points: [q.points || 10],
                            options: this.fb.array(q.options.map((o: any) => this.fb.group({
                              id: [o.id],
                              text: [o.text, Validators.required],
                              isCorrect: [o.isCorrect]
                            })))
                          }));
                        });
                      }
                    });
                  }
                  return lGroup;
                }))
              });
              this.modules.push(moduleGroup);
            });
          }
        }
      });
    } else {
      this.addModule();
    }
  }

  getControl(name: string): FormControl { return this.courseForm.get(name) as FormControl; }

  getLessonControl(mi: number, li: number, name: string): FormControl {
    return this.getLessons(mi).at(li).get(name) as FormControl;
  }

  getQuizControl(mi: number, li: number, name: string): FormControl {
    return this.getQuizGroup(mi, li).get(name) as FormControl;
  }

  saveCourse(): void {
    if (this.courseForm.invalid) return;
    this.isSaving = true;
    
    // Process form value to ensure correct types and include order
    const formValue = this.courseForm.getRawValue();
    const courseData = {
      ...formValue,
      modules: formValue.modules.map((m: any, mi: number) => ({
        ...m,
        order: mi + 1,
        lessons: m.lessons.map((l: any, li: number) => ({
          ...l,
          order: li + 1,
          quiz: l.type === 'quiz' ? l.quiz : null
        }))
      }))
    };

    const obs = this.isEditMode && this.courseId 
      ? this.courseService.updateCourse(this.courseId, courseData)
      : this.courseService.createCourse(courseData);

    obs.subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/admin/courses']);
      },
      error: () => {
        this.isSaving = false;
        alert('Error al guardar el curso.');
      }
    });
  }
}
