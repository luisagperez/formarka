import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

/**
 * Authentication Service
 * 
 * Handles authentication and user management using Supabase and Backend API.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // Local signal using our User model for UI compatibility
  private currentUserSignal = signal<User | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());

  // Mock users for admin methods (to be migrated to backend later)
  private _users: User[] = [];

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    
    // Listen for auth state changes (crucial for email verification redirects)
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth State Change:', event);
      this.updateCurrentUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session) {
        // When signing in (or returning from email confirmation), check if profile is complete
        this.checkProfileAndRedirect(session.user.id);
      }
    });

    this.checkInitialSession();
  }

  async checkProfileAndRedirect(userId?: string) {
    const currentUrl = this.router.url;
    
    // Actuamos si el usuario está en una pantalla de autenticación, en el home o en el catálogo inicial
    // para asegurar que el perfil esté completo.
    if (currentUrl.includes('/auth/') || currentUrl === '/' || currentUrl === '/courses' || currentUrl === '') {
      try {
        // Consultamos al backend si el perfil ya existe en PostgreSQL
        const status = await this.http.get<any>(`${environment.apiUrl}/users/profile/status`).toPromise();
        
        // Manejamos posibles variaciones de casing (isProfileComplete vs IsProfileComplete)
        const isComplete = status?.isProfileComplete || status?.IsProfileComplete;

        if (isComplete) {
          // Si el perfil ya está completo y estamos en una pantalla de auth (que no sea el perfil mismo)
          // o en el home, lo mandamos al catálogo.
          if ((currentUrl.includes('/auth/') && !currentUrl.includes('complete-profile')) || currentUrl === '/' || currentUrl === '') {
            this.router.navigate(['/courses']);
          }
        } else {
          // Si no existe en nuestra DB y no estamos ya en la página de completar, debe completar perfil
          if (!currentUrl.includes('/auth/complete-profile')) {
            this.router.navigate(['/auth/complete-profile']);
          }
        }
      } catch (error) {
        console.error('Error al verificar estado del perfil:', error);
        // Por seguridad, si falla la verificación y estamos en auth, lo mandamos a completar
        if (currentUrl.includes('/auth/') && !currentUrl.includes('/auth/complete-profile')) {
          this.router.navigate(['/auth/complete-profile']);
        }
      }
    }
  }

  private updateCurrentUser(supabaseUser: SupabaseUser | null): void {
    if (supabaseUser) {
      const user: User = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.user_metadata?.['full_name'] || supabaseUser.email!.split('@')[0],
        role: (supabaseUser.user_metadata?.['role'] || 'student').toLowerCase(),
        photoUrl: supabaseUser.user_metadata?.['avatar_url']
      };
      this.currentUserSignal.set(user);
      localStorage.setItem('f-lms-user', JSON.stringify(user));
    } else {
      this.currentUserSignal.set(null);
      localStorage.removeItem('f-lms-user');
    }
  }

  private async checkInitialSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    this.updateCurrentUser(session?.user ?? null);
  }

  async getSession() {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async signUp(email: string, password: string, name?: string) {
    return this.supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: name,
          role: 'student' // Default role
        }
      }
    });
  }

  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    await this.supabase.auth.signOut();
    window.location.href = '/auth/login';
  }

  logout() {
    this.signOut();
  }

  /**
   * Compatibility method for existing login logic
   */
  login(email: string, password: string): Observable<User> {
    return from(this.signIn(email, password)).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        if (!data.user) throw new Error('No user found');
        
        // Map to our User model
        return {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.['full_name'] || data.user.email!.split('@')[0],
          role: data.user.user_metadata?.['role'] || 'student'
        } as User;
      }),
      catchError(err => throwError(() => new Error(err.message || 'Credenciales inválidas.')))
    );
  }

  /**
   * Compatibility method for existing register logic
   */
  register(userData: any): Observable<User> {
    return from(this.signUp(userData.email, userData.password, userData.name)).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        if (!data.user) throw new Error('No user found');
        
        return {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.['full_name'] || data.user.email!.split('@')[0],
          role: 'student'
        } as User;
      }),
      catchError(err => throwError(() => new Error(err.message || 'Error al crear la cuenta.')))
    );
  }

  /**
   * Completes the user profile in the backend
   */
  completeProfile(profileData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/users/profile/complete`, profileData).pipe(
      tap(() => {
        // Update local user data if needed
        const current = this.currentUserSignal();
        if (current) {
          this.currentUserSignal.set({
            ...current,
            name: profileData.name,
            role: profileData.role.toLowerCase(),
            photoUrl: profileData.photoUrl
          });
        }
      }),
      catchError(err => {
        console.error('Error completing profile:', err);
        return throwError(() => new Error(err.error?.message || 'Error al completar el perfil.'));
      })
    );
  }

  /**
   * ADMIN METHODS: User Management using Backend API
   */
  getUsers(): Observable<User[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/users`).pipe(
      map(users => users.map(u => ({
        id: u.id,
        name: u.fullName,
        email: u.email,
        role: u.role.toLowerCase(),
        specialty: u.specialty,
        enrolledCourses: new Array(u.enrolledCoursesCount) // Mocking array for UI
      } as User)))
    );
  }

  getInstructors(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/users/instructors`);
  }

  addUser(user: User): Observable<User> {
    // Note: Creating users manually in Supabase is complex via API without admin key.
    // For now, we'll just log and return. Real users should sign up.
    console.warn('Manual user creation via Admin not fully implemented for Supabase side.');
    return of(user);
  }

  updateUser(id: string, userData: Partial<User>): Observable<any> {
    // Send full object to the general update endpoint
    const payload = {
      id: id,
      name: userData.name,
      role: userData.role,
      specialty: userData.specialty
    };
    return this.http.put(`${environment.apiUrl}/users/${id}`, payload);
  }

  deleteUser(id: string): Observable<boolean> {
    return this.http.delete(`${environment.apiUrl}/users/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
