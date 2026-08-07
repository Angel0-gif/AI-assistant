import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Attaches the JWT access token to every API request, and retries once on 401. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  if (!req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
    return from(auth.getAccessToken()).pipe(
      switchMap((token) => {
        const authReq = token
          ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
          : req;

        return next(authReq).pipe(
          catchError((err: HttpErrorResponse) => {
            if (err.status === 401) {
              return from(auth.refreshAccessToken()).pipe(
                switchMap((newToken) => {
                  if (!newToken) return throwError(() => err);
                  const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
                  return next(retryReq);
                })
              );
            }
            return throwError(() => err);
          })
        );
      })
    );
  }

  return next(req);
};
