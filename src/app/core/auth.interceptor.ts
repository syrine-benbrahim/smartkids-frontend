import { HttpInterceptorFn, HttpErrorResponse, HttpContextToken } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const BYPASS_AUTH_REDIRECT = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Debug: vérifier si le token existe
  console.log('🔑 Token dans interceptor:', auth.token ? 'Présent' : 'Absent');

  const token = auth.token;

  // Cloner la requête avec les headers nécessaires
  const cloned = token ? req.clone({
    setHeaders: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }) : req.clone({
    setHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  // Debug: afficher la requête
  console.log('🚀 Requête:', cloned.method, cloned.url);
  console.log('📋 Headers:', cloned.headers.keys().map(key => `${key}: ${cloned.headers.get(key)}`));

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('❌ Erreur interceptor:', error);

      if (error.status === 401 && !req.context.get(BYPASS_AUTH_REDIRECT)) {
        console.log('🚪 Redirection vers login - Token invalide');
        auth.logout().subscribe({
          complete: () => {
            router.navigate(['/login']);
          },
          error: () => {
            // Si logout échoue, on redirige quand même
            router.navigate(['/login']);
          }
        });
      }

      return throwError(() => error);
    })
  );
};
