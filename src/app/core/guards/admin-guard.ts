import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  if (!authService.isAuthenticated()) {
    toastr.warning('Please login to access this page', 'Authentication Required');
    router.navigate(['/auth/login']);
    return false;
  }

  if (authService.isAdmin()) {
    return true;
  }

  toastr.error('You do not have admin privileges', 'Access Denied');
  router.navigate(['/']);
  return false;
};