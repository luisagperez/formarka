import { Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

/**
 * Authentication Service
 * 
 * Handles authentication and user management for the LMS.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Mock users as requested: 2 admins, 2 teachers, 2 students
  private _users: User[] = [
    { id: 'a1', email: 'admin1@formarka.com', name: 'Luisa administradora', role: 'admin' },
    { id: 'a2', email: 'admin2@formarka.com', name: 'Camila administradora', role: 'admin' },
    { id: 't1', email: 'profesor1@formarka.com', name: 'Luis Instructor', role: 'teacher', specialty: 'Diseño de Marca' },
    { id: 't2', email: 'profesor2@formarka.com', name: 'Maria Experta', role: 'teacher', specialty: 'Marketing Digital' },
    { id: 's1', email: 'alumno1@formarka.com', name: 'Juan Alumno', role: 'student', enrolledCourses: ['1'] },
    { id: 's2', email: 'alumno2@formarka.com', name: 'Ana Estudiante', role: 'student', enrolledCourses: ['1', '2'] }
  ];

  private currentUserSignal = signal<User | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = signal(false).asReadonly();

  constructor() {
    this.checkSession();
  }

  /**
   * Mock login method
   */
  login(email: string, password: string): Observable<User> {
    console.log('Mock login initiated with:', email);
    
    const user = this._users.find(u => u.email === email);
    
    // Generic error message for both wrong email and wrong password
    const genericError = new Error('Credenciales inválidas. Por favor verifica tu correo y contraseña.');

    if (!user || password !== '012345') {
      return throwError(() => genericError);
    }

    this.setCurrentUser(user);
    return of(user).pipe(delay(800));
  }

  private setCurrentUser(user: User): void {
    this.currentUserSignal.set(user);
    localStorage.setItem('f-lms-token', 'mock-jwt-' + user.id);
    localStorage.setItem('f-lms-user', JSON.stringify(user));
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem('f-lms-token');
    localStorage.removeItem('f-lms-user');
    window.location.href = '/auth/login'; // Redirect to login
  }

  /**
   * Mock register method
   */
  register(userData: any): Observable<User> {
    console.log('Mock registration initiated with:', userData.email);
    
    // BACKEND REQUEST (Commented out):
    // return this.http.post<User>('/api/auth/register', userData).pipe(
    //   tap(user => this.setCurrentUser(user))
    // );

    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      email: userData.email,
      name: userData.name,
      role: 'student',
      enrolledCourses: []
    };
    
    this._users.push(newUser);
    this.setCurrentUser(newUser);
    return of(newUser).pipe(delay(1000));
  }

  /**
   * ADMIN METHODS: User Management
   */
  getUsers(): Observable<User[]> {
    // BACKEND REQUEST (Commented out):
    // return this.http.get<User[]>('/api/admin/users');
    return of(this._users).pipe(delay(500));
  }

  addUser(user: User): Observable<User> {
    // BACKEND REQUEST (Commented out):
    // return this.http.post<User>('/api/admin/users', user);
    this._users.push(user);
    return of(user).pipe(delay(500));
  }

  updateUser(id: string, userData: Partial<User>): Observable<User> {
    // BACKEND REQUEST (Commented out):
    // return this.http.put<User>(`/api/admin/users/${id}`, userData);
    const index = this._users.findIndex(u => u.id === id);
    if (index !== -1) {
      this._users[index] = { ...this._users[index], ...userData };
      return of(this._users[index]).pipe(delay(500));
    }
    throw new Error('User not found');
  }

  deleteUser(id: string): Observable<boolean> {
    // BACKEND REQUEST (Commented out):
    // return this.http.delete<boolean>(`/api/admin/users/${id}`);
    this._users = this._users.filter(u => u.id !== id);
    return of(true).pipe(delay(500));
  }

  private checkSession(): void {
    const savedUser = localStorage.getItem('f-lms-user');
    if (savedUser) {
      this.currentUserSignal.set(JSON.parse(savedUser));
    }
  }
}
