import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return from(authService.getSession()).pipe(
    switchMap(session => {
      if (session?.access_token) {
        console.log('AuthInterceptor: Adjuntando token JWT');
        const clonedRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${session.access_token}`
          }
        });
        return next(clonedRequest);
      }
      console.warn('AuthInterceptor: No hay sesión activa, la petición se envía sin token');
      return next(req); 
    })
  );
};
