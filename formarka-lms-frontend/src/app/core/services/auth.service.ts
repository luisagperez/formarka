import { Injectable, signal, computed, inject } from '@angular/core';
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
  
  // Local signal using our User model for UI compatibility
  private currentUserSignal = signal<User | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());

  // Mock users for admin methods (to be migrated to backend later)
  private _users: User[] = [];

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    
    // Listen for auth state changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.updateCurrentUser(session?.user ?? null);
    });

    this.checkInitialSession();
  }

  private updateCurrentUser(supabaseUser: SupabaseUser | null): void {
    if (supabaseUser) {
      const user: User = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.user_metadata?.['full_name'] || supabaseUser.email!.split('@')[0],
        role: supabaseUser.user_metadata?.['role'] || 'student',
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
   * ADMIN METHODS: User Management (Keep for UI compatibility, currently mock)
   */
  getUsers(): Observable<User[]> {
    return of(this._users);
  }

  addUser(user: User): Observable<User> {
    this._users.push(user);
    return of(user);
  }

  updateUser(id: string, userData: Partial<User>): Observable<User> {
    const index = this._users.findIndex(u => u.id === id);
    if (index !== -1) {
      this._users[index] = { ...this._users[index], ...userData };
      return of(this._users[index]);
    }
    throw new Error('User not found');
  }

  deleteUser(id: string): Observable<boolean> {
    this._users = this._users.filter(u => u.id !== id);
    return of(true);
  }
}
