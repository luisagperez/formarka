import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (user && (user.role === 'admin' || user.role === 'teacher')) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
