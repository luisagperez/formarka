import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  template: `
    <header class="header">
      <div class="container header-content">
        <div class="logo-area" routerLink="/">
          <img src="logo formarka.png" alt="Formarka Logo" class="logo" onerror="this.src='https://placehold.co/120x40/1a1a1a/f4f4f4?text=FORMARKA'">
        </div>

        <button class="menu-toggle" (click)="toggleMenu()" [class.active]="isMenuOpen" aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div class="nav-container" [class.open]="isMenuOpen">
          <nav class="nav">
            <a routerLink="/courses" routerLinkActive="active" (click)="closeMenu()">Catálogo</a>
            <a routerLink="/my-courses" routerLinkActive="active" *ngIf="authService.currentUser()" (click)="closeMenu()">Mis Cursos</a>
            <a routerLink="/admin" routerLinkActive="active" *ngIf="authService.currentUser()?.role === 'admin' || authService.currentUser()?.role === 'teacher'" (click)="closeMenu()">Administración</a>
          </nav>

          <div class="user-area">
            <ng-container *ngIf="authService.currentUser() as user; else guest">
              <div class="user-profile">
                <div class="user-info">
                  <span class="user-name">{{ user.name }}</span>
                  <button class="logout-btn" (click)="logout(); closeMenu()">Cerrar Sesión</button>
                </div>
                <img [src]="user.photoUrl || 'default-avatar.png'" class="avatar" onerror="this.src='default-avatar.png'">
              </div>
            </ng-container>
            <ng-template #guest>
              <app-button variant="outline" routerLink="/auth/login" (click)="closeMenu()">Iniciar Sesión</app-button>
            </ng-template>
          </div>
        </div>
      </div>
      <div class="mobile-overlay" *ngIf="isMenuOpen" (click)="closeMenu()"></div>
    </header>
  `,
  styles: [`
    .header {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(15px);
      height: auto;
      min-height: 120px;
      display: flex;
      align-items: center;
      box-shadow: 0 4px 20px rgba(78, 7, 103, 0.05);
      position: sticky;
      top: 0;
      z-index: 1000;
      font-family: var(--font-main);
      border-bottom: 1px solid rgba(78, 7, 103, 0.05);
      padding: 12px 0;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      position: relative;
    }

    .logo-area {
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: transform 0.3s ease;
      z-index: 1002;
    }

    .logo-area:hover {
      transform: scale(1.05);
    }

    .logo {
      height: 100px;
      width: auto;
      object-fit: contain;
    }

    .nav-container {
      display: flex;
      align-items: center;
      gap: 40px;
    }

    .nav {
      display: flex;
      gap: 40px;
    }

    .nav a {
      text-decoration: none;
      color: var(--brand-black);
      font-weight: 700;
      transition: all 0.3s ease;
      font-size: 1rem;
      position: relative;
      padding: 8px 0;
    }

    .nav a:hover, .nav a.active {
      color: var(--brand-purple-deep);
    }

    .nav a::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--brand-purple-deep), var(--brand-purple-light));
      border-radius: 50px;
      transition: width 0.3s ease;
    }

    .nav a:hover::after, .nav a.active::after {
      width: 100%;
    }

    .user-area {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #f8f2ff;
      padding: 6px 12px;
      padding-right: 20px;
      border-radius: 100px;
      border: 1.5px solid rgba(78, 7, 103, 0.05);
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .user-name {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--brand-black);
    }

    .avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: 2.5px solid var(--brand-purple-light);
      background: var(--formarka-white);
      object-fit: cover;
    }

    .logout-btn {
      background: none;
      border: none;
      color: #ef4444;
      font-size: 0.75rem;
      cursor: pointer;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 0;
      transition: color 0.2s;
    }

    .logout-btn:hover {
      color: #b91c1c;
    }

    .menu-toggle {
      display: none;
      flex-direction: column;
      justify-content: space-between;
      width: 30px;
      height: 21px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      z-index: 1002;
    }

    .menu-toggle span {
      width: 100%;
      height: 3px;
      background-color: var(--brand-purple-deep);
      border-radius: 10px;
      transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
    }

    .menu-toggle.active span:nth-child(1) {
      transform: translateY(9px) rotate(45deg);
    }

    .menu-toggle.active span:nth-child(2) {
      opacity: 0;
    }

    .menu-toggle.active span:nth-child(3) {
      transform: translateY(-9px) rotate(-45deg);
    }

    .mobile-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 999;
    }

    @media (max-width: 1024px) {
      .header {
        min-height: 90px;
      }

      .logo {
        height: 70px;
      }

      .menu-toggle {
        display: flex;
      }

      .nav-container {
        position: fixed;
        top: 0;
        right: -100%;
        width: 80%;
        max-width: 320px;
        height: 100vh;
        background: white;
        flex-direction: column;
        align-items: flex-start;
        padding: 120px 40px;
        transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
        box-shadow: -10px 0 30px rgba(0,0,0,0.1);
        z-index: 1001;
        gap: 40px;
        visibility: hidden;
        pointer-events: none;
      }

      .nav-container.open {
        right: 0;
        visibility: visible;
        pointer-events: auto;
      }

      .nav {
        flex-direction: column;
        gap: 24px;
        width: 100%;
      }

      .nav a {
        font-size: 1.2rem;
        width: 100%;
      }

      .user-area {
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
        margin-top: 20px;
        border-top: 1px solid rgba(0,0,0,0.05);
        padding-top: 30px;
      }

      .user-profile {
        width: 100%;
        flex-direction: row-reverse;
        justify-content: flex-end;
        background: transparent;
        padding: 0;
        border: none;
      }

      .user-info {
        align-items: flex-start;
      }

      .user-name {
        font-size: 1.1rem;
      }

      .logout-btn {
        font-size: 0.85rem;
      }
    }

    @media (max-width: 480px) {
      .header {
        min-height: 80px;
      }

      .logo {
        height: 55px;
      }

      .nav-container {
        width: 90%;
      }
    }
  `]
})
export class HeaderComponent {
  isMenuOpen = false;

  constructor(public authService: AuthService) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  closeMenu() {
    this.isMenuOpen = false;
    document.body.style.overflow = 'auto';
  }

  logout() {
    this.authService.logout();
  }
}
