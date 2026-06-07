# Fase 3: Configuración del Frontend (Angular 19)

En esta fase conectaremos la interfaz de usuario de tu LMS con Supabase y tu API en .NET utilizando el nuevo paradigma de componentes Standalone y Signals.

## 1. Instalar Supabase JS

Abre una terminal en la carpeta raíz de tu proyecto frontend en Angular y ejecuta el siguiente comando para instalar el SDK oficial:

```bash
npm install @supabase/supabase-js
```

## 2. Configurar Entornos (`src/environments/environment.ts`)

Crea o edita el archivo de variables de entorno para almacenar las credenciales públicas de Supabase.

```typescript
export const environment = {
  production: false,
  supabaseUrl: '[https://dunnqmbybmmaoeahnhzx.supabase.co](https://dunnqmbybmmaoeahnhzx.supabase.co)',
  supabaseKey: 'TU_ANON_PUBLIC_KEY' 
};
```

## 3. Crear el Servicio de Autenticación (`src/app/services/auth.service.ts`)

Este servicio encapsula la comunicación con Supabase y expone el estado del usuario utilizando Signals para que la UI reaccione automáticamente.

```typescript
import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  
  // Signal para mantener el estado del usuario reactivo
  currentUser = signal<User | null>(null);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    
    // Escuchar cambios de sesión
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser.set(session?.user ?? null);
    });
  }

  async getSession() {
    const { data, error } = await this.supabase.auth.getSession();
    return data.session;
  }

  async signUp(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password });
  }

  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }
}
```

## 4. Crear el Interceptor para .NET (`src/app/interceptors/auth.interceptor.ts`)

Este interceptor inyectará automáticamente el token JWT en el encabezado `Authorization` de todas las peticiones HTTP hacia tu API.

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return from(authService.getSession()).pipe(
    switchMap(session => {
      if (session?.access_token) {
        const clonedRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${session.access_token}`
          }
        });
        return next(clonedRequest);
      }
      return next(req); 
    })
  );
};
```

## 5. Registrar el Interceptor (`src/app/app.config.ts`)

Configura la aplicación para que utilice el cliente HTTP y aplique el interceptor.

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])) 
  ]
};
```

## 6. El Componente de UI (`src/app/components/auth/auth.component.ts`)

Componente Standalone con los formularios de registro, inicio de sesión y la prueba de comunicación con .NET.

```typescript
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div style="max-width: 400px; margin: 40px auto; padding: 20px; font-family: sans-serif; border: 1px solid #ccc; border-radius: 8px;">
      <h2 *ngIf="!authService.currentUser()">Acceso a la Plataforma</h2>
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
        <button (click)="testBackend()" style="padding: 10px 15px; background: #0056b3; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">
          Llamar Endpoint Privado (.NET)
        </button>
        
        <pre style="background: #f4f4f4; padding: 10px; margin-top: 15px; overflow-x: auto; border-radius: 4px;" *ngIf="backendResponse()">{{ backendResponse() | json }}</pre>
      </div>
    </div>
  `
})
export class AuthComponent {
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

  testBackend() {
    this.http.get('https://localhost:32769/api/Values/private').subscribe({
      next: (res) => this.backendResponse.set(res),
      error: (err) => this.backendResponse.set({ 
        error: err.message, 
        status: err.status 
      })
    });
  }
}
```