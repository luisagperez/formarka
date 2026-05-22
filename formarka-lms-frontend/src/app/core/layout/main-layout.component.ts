import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  template: `
    <div class="layout-container">
      <app-header></app-header>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
      <footer class="footer">
        <div class="container">
          <p>&copy; 2026 Formarka LMS. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .content {
      flex: 1;
      padding: 40px 0;
    }

    .footer {
      background: var(--brand-black);
      color: var(--formarka-white);
      padding: 60px 0;
      text-align: center;
      font-size: 1rem;
      border-top: 6px solid var(--brand-purple-deep);
      font-family: var(--font-main);
      position: relative;
    }

    .footer p {
      opacity: 0.8;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .footer::before {
      content: '';
      position: absolute;
      top: -6px;
      left: 0;
      width: 40%;
      height: 6px;
      background: var(--brand-green-vibrant);
      z-index: 2;
    }
  `]
})
export class MainLayoutComponent {}
