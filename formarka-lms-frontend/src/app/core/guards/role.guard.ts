import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();
  
  const allowedRoles = route.data?.['roles'] as Array<string>;

  if (user && allowedRoles.includes(user.role)) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
