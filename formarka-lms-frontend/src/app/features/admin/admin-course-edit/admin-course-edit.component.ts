import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
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
              <app-form-field 
                label="Nombre del Instructor" 
                [control]="getControl('instructorName')"
                placeholder="Ej. Esteban Formarka">
              </app-form-field>
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

                        <!-- Quiz: URL + Duration -->
                        <div *ngSwitchCase="'quiz'" class="form-row">
                          <app-form-field label="Enlace al Cuestionario" [control]="getLessonControl(i, j, 'contentUrl')" placeholder="URL del quiz o evaluación"></app-form-field>
                          <app-form-field label="Tiempo Sugerido (min)" [control]="getLessonControl(i, j, 'duration')" placeholder="Ej. 15:00"></app-form-field>
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
  `]
})
export class AdminCourseEditComponent implements OnInit {
  courseForm: FormGroup;
  isEditMode = false;
  isSaving = false;
  courseId?: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService
  ) {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required]],
      category: ['', [Validators.required]],
      level: ['básico', [Validators.required]],
      thumbnailUrl: ['', [Validators.required]],
      instructorName: ['', [Validators.required]],
      totalHours: [20, [Validators.required, Validators.min(1)]],
      modules: this.fb.array([])
    });
  }

  get modules() { return this.courseForm.get('modules') as FormArray; }

  getLessons(moduleIndex: number) { return this.modules.at(moduleIndex).get('lessons') as FormArray; }

  getResources(moduleIndex: number, lessonIndex: number) { 
    return this.getLessons(moduleIndex).at(lessonIndex).get('resources') as FormArray; 
  }

  addModule() {
    const moduleGroup = this.fb.group({
      id: [Math.random().toString(36).substring(2, 9)],
      title: ['', Validators.required],
      lessons: this.fb.array([])
    });
    this.modules.push(moduleGroup);
    this.addLesson(this.modules.length - 1);
  }

  removeModule(index: number) { if (confirm('¿Eliminar módulo?')) this.modules.removeAt(index); }

  addLesson(moduleIndex: number) {
    const lessonGroup = this.fb.group({
      id: [Math.random().toString(36).substring(2, 9)],
      title: ['', Validators.required],
      type: ['video', Validators.required],
      contentUrl: [''],
      duration: [''],
      resources: this.fb.array([])
    });
    this.getLessons(moduleIndex).push(lessonGroup);
  }

  removeLesson(moduleIndex: number, lessonIndex: number) { this.getLessons(moduleIndex).removeAt(lessonIndex); }

  addResource(moduleIndex: number, lessonIndex: number) {
    const resGroup = this.fb.group({
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
            instructorName: course.instructorName,
            totalHours: course.totalHours
          });
          
          if (course.modules) {
            this.modules.clear();
            course.modules.forEach(m => {
              const moduleGroup = this.fb.group({
                id: [m.id],
                title: [m.title, Validators.required],
                lessons: this.fb.array(m.lessons.map(l => this.fb.group({
                  id: [l.id],
                  title: [l.title, Validators.required],
                  type: [l.type, Validators.required],
                  contentUrl: [l.contentUrl || ''],
                  duration: [l.duration || ''],
                  resources: this.fb.array((l.resources || []).map(r => this.fb.group({
                    title: [r.title],
                    url: [r.url],
                    type: [r.type]
                  })))
                })))
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

  saveCourse(): void {
    if (this.courseForm.invalid) return;
    this.isSaving = true;
    const courseData = this.courseForm.value;
    
    // BACKEND REQUEST:
    // this.http.post('/api/courses', courseData)...

    const obs = this.isEditMode && this.courseId 
      ? this.courseService.updateCourse(this.courseId, courseData)
      : this.courseService.createCourse(courseData);

    obs.subscribe(() => {
      this.isSaving = false;
      this.router.navigate(['/admin/courses']);
    });
  }
}
