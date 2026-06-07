import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-demo',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div style="max-width: 400px; margin: 40px auto; padding: 20px; font-family: sans-serif; border: 1px solid #ccc; border-radius: 8px;">
      <h2 *ngIf="!authService.currentUser()">Acceso a la Plataforma (Demo)</h2>
      <h2 *ngIf="authService.currentUser()">¡Bienvenido, {{ authService.currentUser()?.email }}!</h2>

      <div *ngIf="!authService.currentUser()">
        <input type="email" [(ngModel)]="email" placeholder="Correo electrónico" style="display:block; margin-bottom: 10px; width: 100%; padding: 8px;">
        <input type="password" [(ngModel)]="password" placeholder="Contraseña" style="display:block; margin-bottom: 15px; width: 100%; padding: 8px;">
        
        <div style="display: flex; gap: 10px;">
          <button (click)="onRegister()" style="flex: 1; padding: 10px; cursor: pointer;">Registrarse</button>
          <button (click)="onLogin()" style="flex: 1; padding: 10px; cursor: pointer;">Iniciar Sesión</button>
        </div>
        
        <p style="color: #d32f2f; margin-top: 15px; font-weight: bold;">{{ message() }}</p>
      </div>

      <div *ngIf="authService.currentUser()">
        <button (click)="authService.signOut()" style="padding: 8px 15px; cursor: pointer; margin-bottom: 20px;">Cerrar Sesión</button>
        <hr style="border: 0; border-top: 1px solid #eee; margin-bottom: 20px;">
        
        <h3>Prueba de Integración API</h3>
        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
          <button (click)="testPublic()" style="flex: 1; padding: 10px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Público
          </button>
          <button (click)="testBackend()" style="flex: 2; padding: 10px; background: #0056b3; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Privado (.NET)
          </button>
        </div>
        
        <pre style="background: #f4f4f4; padding: 10px; margin-top: 15px; overflow-x: auto; border-radius: 4px;" *ngIf="backendResponse()">{{ backendResponse() | json }}</pre>
      </div>
    </div>
  `
})
export class AuthDemoComponent {
  authService = inject(AuthService);
  http = inject(HttpClient); 

  email = '';
  password = '';
  message = signal('');
  backendResponse = signal<any>(null);

  async onRegister() {
    this.message.set('Procesando...');
    const { error } = await this.authService.signUp(this.email, this.password);
    if (error) {
      this.message.set(error.message);
    } else {
      this.message.set('¡Registro exitoso! Revisa tu correo para confirmar.');
    }
  }

  async onLogin() {
    this.message.set('Iniciando sesión...');
    const { error } = await this.authService.signIn(this.email, this.password);
    if (error) {
      this.message.set(error.message);
    } else {
      this.message.set('');
    }
  }

  testPublic() {
    this.http.get('https://localhost:7154/api/Values/public', { responseType: 'text' }).subscribe({
      next: (res) => this.backendResponse.set({ response: res }),
      error: (err) => this.backendResponse.set({ 
        error: err.message, 
        status: err.status 
      })
    });
  }

  testBackend() {
    this.http.get('https://localhost:7154/api/Values/private').subscribe({
      next: (res) => this.backendResponse.set(res),
      error: (err) => this.backendResponse.set({ 
        error: err.message, 
        status: err.status 
      })
    });
  }
}
