import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quiz, QuizQuestion } from '../../../core/models/course.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CourseService } from '../../../core/services/course.service';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="quiz-container shadow-sm" *ngIf="quiz">
      <div class="quiz-intro" *ngIf="step === 'intro'">
        <h2>{{ quiz.title }}</h2>
        <p>Pon a prueba tus conocimientos sobre esta lección.</p>
        <div class="quiz-meta">
          <span>Preguntas: {{ quiz.questions.length }}</span>
          <span>Para aprobar: {{ quiz.passingScore }}%</span>
        </div>
        <app-button (onClick)="startQuiz()">Comenzar Quiz</app-button>
      </div>

      <div class="quiz-question" *ngIf="step === 'question' && currentQuestion">
        <div class="progress-bar">
          <div class="progress" [style.width.%]="progress"></div>
        </div>
        <span class="question-number">Pregunta {{ currentQuestionIndex + 1 }} de {{ quiz.questions.length }}</span>
        <h3>{{ currentQuestion.text }}</h3>

        <div class="options">
          <button 
            *ngFor="let option of currentQuestion.options" 
            class="option-btn"
            [class.selected]="selectedOptionId === option.id"
            (click)="selectOption(option.id)"
          >
            {{ option.text }}
          </button>
        </div>

        <div class="actions">
          <app-button 
            [disabled]="selectedOptionId === null || isSubmitting" 
            [loading]="isSubmitting"
            (onClick)="nextQuestion()">
            {{ isLastQuestion ? 'Finalizar' : 'Siguiente' }}
          </app-button>
        </div>
      </div>

      <div class="quiz-result" *ngIf="step === 'result'">
        <div class="result-icon" [class.pass]="isPassed" [class.fail]="!isPassed">
          {{ isPassed ? '🏆' : '📚' }}
        </div>
        <h2>{{ isPassed ? '¡Felicidades!' : 'Sigue intentándolo' }}</h2>
        <p>Tu puntuación ha sido: <strong>{{ score }}%</strong></p>
        <p *ngIf="isPassed">Has aprobado satisfactoriamente esta evaluación.</p>
        <p *ngIf="!isPassed">No has alcanzado el puntaje mínimo de {{ quiz.passingScore }}%.</p>
        
        <div class="actions">
          <app-button variant="outline" (onClick)="restart()">Reintentar</app-button>
          <app-button *ngIf="isPassed" (onClick)="finish()">Continuar Curso</app-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quiz-container {
      background: var(--formarka-white);
      padding: 40px;
      border-radius: 12px;
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
    }

    .quiz-intro h2 { margin-bottom: 15px; }
    .quiz-intro p { color: var(--formarka-text-muted); margin-bottom: 30px; }

    .quiz-meta {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-bottom: 30px;
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--formarka-primary);
    }

    .progress-bar {
      height: 6px;
      background: #eee;
      border-radius: 3px;
      margin-bottom: 30px;
      overflow: hidden;
    }

    .progress {
      height: 100%;
      background: var(--formarka-accent);
      transition: width 0.3s ease;
    }

    .question-number {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--formarka-text-muted);
      margin-bottom: 10px;
      display: block;
    }

    .quiz-question h3 { margin-bottom: 30px; }

    .options {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 40px;
    }

    .option-btn {
      padding: 15px 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: var(--formarka-white);
      text-align: left;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .option-btn:hover {
      background: #f9f9f9;
      border-color: var(--formarka-accent);
    }

    .option-btn.selected {
      background: var(--formarka-primary);
      color: var(--formarka-white);
      border-color: var(--formarka-primary);
    }

    .result-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .quiz-result h2 { margin-bottom: 10px; }
    .quiz-result p { margin-bottom: 20px; color: var(--formarka-text-muted); }

    .actions {
      display: flex;
      justify-content: center;
      gap: 15px;
    }
  `]
})
export class QuizComponent {
  private courseService = inject(CourseService);
  
  @Input({ required: true }) quiz!: Quiz;
  @Output() onComplete = new EventEmitter<number>();

  step: 'intro' | 'question' | 'result' = 'intro';
  currentQuestionIndex = 0;
  selectedOptionId: string | number | null = null;
  answers: { [key: number]: number } = {};
  score = 0;
  isPassed = false;
  isSubmitting = false;

  get currentQuestion(): QuizQuestion {
    return this.quiz.questions[this.currentQuestionIndex];
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.quiz.questions.length - 1;
  }

  get progress(): number {
    return ((this.currentQuestionIndex) / this.quiz.questions.length) * 100;
  }

  startQuiz() {
    this.step = 'question';
    this.currentQuestionIndex = 0;
    this.selectedOptionId = null;
    this.answers = {};
  }

  selectOption(optionId: string | number) {
    this.selectedOptionId = optionId;
  }

  nextQuestion() {
    if (this.selectedOptionId === null) return;

    // Save answer
    this.answers[this.currentQuestion.id as number] = this.selectedOptionId as number;

    if (this.isLastQuestion) {
      this.calculateResult();
    } else {
      this.currentQuestionIndex++;
      this.selectedOptionId = null;
    }
  }

  calculateResult() {
    this.isSubmitting = true;
    this.courseService.submitQuiz(this.quiz.id, this.answers).subscribe({
      next: (res) => {
        this.score = res.score;
        this.isPassed = res.passed;
        this.step = 'result';
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error submitting quiz:', err);
        // Fallback calculation in case API fails
        let correctCount = 0;
        this.quiz.questions.forEach(q => {
          if (q.correctOptionId && this.answers[q.id as number] === q.correctOptionId) {
            correctCount++;
          }
        });
        this.score = Math.round((correctCount / this.quiz.questions.length) * 100);
        this.isPassed = this.score >= this.quiz.passingScore;
        this.step = 'result';
        this.isSubmitting = false;
      }
    });
  }

  restart() {
    this.startQuiz();
  }

  finish() {
    this.onComplete.emit(this.score);
  }
}
