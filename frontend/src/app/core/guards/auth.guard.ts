import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Preferences } from '@capacitor/preferences';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = await auth.getAccessToken();
  if (token) return true;

  // fallback direct check in case the signal hasn't hydrated yet
  const { value } = await Preferences.get({ key: 'access_token' });
  if (value) return true;

  router.navigateByUrl('/login');
  return false;
};
