import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService, UserRole } from './auth.service';

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
	const auth = inject(AuthService);
	const router = inject(Router);
	const allowed = (route.data?.['roles'] as UserRole[] | undefined) ?? [];
	const role = auth.getRole();
	if (role && allowed.includes(role)) return true;
	router.navigate(['/login']);
	return false;
};



