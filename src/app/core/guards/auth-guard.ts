import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  if (authService.isAuthenticated()) {
    return true;
  }

  toastr.warning('Please login to access this page', 'Authentication Required');
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
