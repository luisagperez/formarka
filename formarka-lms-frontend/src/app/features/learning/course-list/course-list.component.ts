import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';
import { CourseCardComponent } from '../../../shared/components/course-card/course-card.component';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CourseCardComponent],
  template: `
    <div class="container animate-up">
      <div class="list-header">
        <h1 class="text-gradient">Explora nuestros cursos</h1>
        <p>Aprende las herramientas reales para construir una marca con criterio y coherencia.</p>
      </div>

      <div class="controls-container animate-up">
        <div class="search-box glass">
          <i class="search-icon">🔍</i>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="applyFilters()"
            placeholder="Buscar cursos por título, instructor o descripción..."
            class="search-input"
          />
        </div>

        <div class="filters-row">
          <div class="filters-container glass">
            <div class="filters">
              <button 
                *ngFor="let cat of categories"
                (click)="setCategory(cat)"
                [class.active]="selectedCategory === cat"
                class="filter-btn">
                {{ cat }}
              </button>
            </div>
          </div>

          <div class="filters-container glass">
            <div class="filters">
              <button 
                *ngFor="let lvl of levels"
                (click)="setLevel(lvl)"
                [class.active]="selectedLevel === lvl"
                class="filter-btn">
                {{ lvl === 'all' ? 'Todos los Niveles' : (lvl | titlecase) }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="courses-grid" *ngIf="!isLoading; else loadingTemplate">
        <app-course-card 
          *ngFor="let course of filteredCourses; let i = index" 
          [course]="course"
          (onAction)="goToCourse($event)"
          class="animate-up"
          [style.animation-delay]="i * 0.1 + 's'">
        </app-course-card>
        
        <div class="no-results glass animate-up" *ngIf="filteredCourses.length === 0">
          <h3>No encontramos cursos que coincidan con tu búsqueda</h3>
          <p>Prueba con otros términos o limpia los filtros.</p>
          <button class="reset-btn" (click)="resetFilters()">Ver todos los cursos</button>
        </div>
      </div>

      <ng-template #loadingTemplate>
        <div class="loading-grid">
          <div class="skeleton-card" *ngFor="let i of [1,2,3]"></div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .container {
      padding: 60px 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .list-header {
      margin-bottom: 40px;
      text-align: center;
    }

    .list-header h1 {
      font-size: 3.5rem;
      margin-bottom: 16px;
      letter-spacing: -1px;
    }

    .list-header p {
      font-size: 1.25rem;
      color: var(--formarka-text-muted);
      max-width: 700px;
      margin: 0 auto;
      font-weight: 500;
    }

    .controls-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      margin-bottom: 60px;
    }

    .search-box {
      width: 100%;
      max-width: 600px;
      padding: 8px 24px;
      border-radius: 100px;
      display: flex;
      align-items: center;
      gap: 12px;
      border: 1px solid rgba(78, 7, 103, 0.1);
      background: white;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    }

    .search-icon {
      font-size: 1.2rem;
      opacity: 0.5;
    }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      padding: 12px 0;
      font-size: 1.1rem;
      font-family: var(--font-main);
      color: var(--formarka-text-main);
      outline: none;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .filters-container {
      padding: 8px;
      border-radius: 100px;
      display: inline-flex;
      border: 1px solid rgba(78, 7, 103, 0.1);
      background: white;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    }

    .filters {
      display: flex;
      gap: 4px;
    }

    .filter-btn {
      padding: 10px 24px;
      border-radius: 100px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-weight: 700;
      transition: all 0.3s ease;
      color: var(--formarka-text-muted);
      font-family: var(--font-main);
      font-size: 0.9rem;
      white-space: nowrap;
    }

    .filter-btn.active {
      background: var(--brand-purple-deep);
      color: var(--formarka-white);
      box-shadow: 0 4px 12px rgba(78, 7, 103, 0.2);
    }

    .filter-btn:hover:not(.active) {
      background: #f8f2ff;
      color: var(--brand-purple-deep);
    }

    .courses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 40px;
      min-height: 400px;
    }

    .no-results {
      grid-column: 1 / -1;
      text-align: center;
      padding: 80px 40px;
      border-radius: 32px;
      background: white;
      border: 1px solid rgba(78, 7, 103, 0.1);
    }

    .no-results h3 {
      font-size: 1.8rem;
      margin-bottom: 12px;
      color: var(--brand-purple-deep);
    }

    .reset-btn {
      margin-top: 24px;
      padding: 12px 32px;
      border-radius: 100px;
      border: none;
      background: var(--brand-purple-deep);
      color: white;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .reset-btn:hover {
      transform: scale(1.05);
    }

    .loading-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 40px;
    }

    .skeleton-card {
      height: 480px;
      background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      border-radius: 32px;
      animation: shimmer 2s infinite linear;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    @media (max-width: 768px) {
      .list-header h1 { font-size: 2.5rem; }
      .filters-container { border-radius: 20px; width: 100%; }
      .filters { flex-wrap: wrap; width: 100%; justify-content: center; }
      .courses-grid { grid-template-columns: 1fr; }
      .search-box { border-radius: 24px; }
    }
  `]
})
export class CourseListComponent implements OnInit {
  allCourses: Course[] = [];
  filteredCourses: Course[] = [];
  isLoading = true;

  // Search and Filters
  searchQuery = '';
  selectedCategory = 'Todos los Programas';
  selectedLevel = 'all';

  categories = ['Todos los Programas', 'Diseño', 'Marketing', 'Fotografía'];
  levels = ['all', 'básico', 'intermedio', 'avanzado'];

  constructor(
    private courseService: CourseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.courseService.getCourses().subscribe({
      next: (data) => {
        this.allCourses = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching courses:', err);
        this.isLoading = false;
      }
    });
  }

  setCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  setLevel(level: string): void {
    this.selectedLevel = level;
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'Todos los Programas';
    this.selectedLevel = 'all';
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.allCourses];

    // Filter by Category
    if (this.selectedCategory !== 'Todos los Programas') {
      filtered = filtered.filter(c => c.category === this.selectedCategory);
    }

    // Filter by Level
    if (this.selectedLevel !== 'all') {
      filtered = filtered.filter(c => c.level === this.selectedLevel);
    }

    // Dynamic Search
    if (this.searchQuery.trim()) {
      const normalizedQuery = this.normalizeText(this.searchQuery);
      filtered = filtered.filter(c => 
        this.normalizeText(c.title).includes(normalizedQuery) ||
        this.normalizeText(c.description).includes(normalizedQuery) ||
        (c.instructorName && this.normalizeText(c.instructorName).includes(normalizedQuery))
      );
    }

    this.filteredCourses = filtered;
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, "");
  }

  goToCourse(id: string): void {
    this.router.navigate(['/courses', id]);
  }
}
