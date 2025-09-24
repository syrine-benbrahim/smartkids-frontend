import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, tap } from 'rxjs/operators';

export type UserRole = 'admin' | 'educateur' | 'parent';
export interface LoginResponse {
	success: boolean;
	message: string;
	token: string;
	token_type: string;
	user: { id: number; name: string; email: string; role: UserRole };
}

export interface RegisterResponse {
	message: string;
	token: string;
	token_type: string;
	user: { id: number; name: string; email: string; role: UserRole };
}

export interface MeResponse {
	user: { id: number; name: string; email: string; role: UserRole };
	profil: unknown;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
	private http = inject(HttpClient);
	private baseUrl = 'http://127.0.0.1:8000/api';
	private tokenKey = 'sk_auth_token';

	get token(): string | null {
		return localStorage.getItem(this.tokenKey);
	}

	set token(value: string | null) {
		if (value) {
			localStorage.setItem(this.tokenKey, value);
		} else {
			localStorage.removeItem(this.tokenKey);
		}
	}

	isAuthenticated(): boolean {
		return !!this.token;
	}

	getRole(): UserRole | null {
		const raw = localStorage.getItem('sk_role');
		return (raw as UserRole) ?? null;
	}

	setRole(role: UserRole | null) {
		if (role) localStorage.setItem('sk_role', role);
		else localStorage.removeItem('sk_role');
	}

	login(payload: { email: string; password: string }) {
		return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, payload).pipe(
			tap((res) => {
				this.token = res.token;
				this.setRole(res.user.role);
			})
		);
	}

	register(payload: { name: string; email: string; password: string; password_confirmation: string; role: UserRole }) {
		return this.http.post<RegisterResponse>(`${this.baseUrl}/auth/register`, payload).pipe(
			tap((res) => {
				this.token = res.token;
				this.setRole(res.user.role);
			})
		);
	}

	me() {
		return this.http.get<MeResponse>(`${this.baseUrl}/auth/me`).pipe(map((r) => r.user));
	}

	logout() {
		return this.http.post(`${this.baseUrl}/auth/logout`, {}).pipe(
			tap(() => {
				this.token = null;
				this.setRole(null);
			})
		);
	}
}



