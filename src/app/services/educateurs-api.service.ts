import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface EducateurListItem {
	id: number;
	user_id: number;
	name: string;
	email: string;
	diplome: string | null;
	date_embauche: string | null;
	salaire?: number;
	photo?: string | null;
	telephone?: string | null;
}

export interface EducateurProfile {
	id: number;
	name: string;
	email: string;
	diplome: string;
	date_embauche: string;
	salaire: number;
	photo?: string | null;
	telephone?: string | null;
	must_change_password?: boolean;
	user?: {
		id: number;
		name: string;
		email: string;
		must_change_password?: boolean;
	}
}

export interface PaginatedEducateursResponse {
	data: EducateurListItem[];
	meta?: { total: number };
	links?: unknown;
}

export interface EducateurResourceResponse {
	data: EducateurListItem | EducateurProfile;
}

export interface ProfileResponse {
	success: boolean;
	data: EducateurProfile;
}

export interface ProfileUpdatePayload {
	name?: string;
	email?: string;
	diplome?: string;
	telephone?: string;
	photo?: string;
	password?: string;
	current_password?: string;
}

export interface ProfileUpdateResponse {
	success: boolean;
	message: string;
	data: EducateurProfile;
}

export interface CreateEducateurResponse {
	success: boolean;
	message: string;
	data: EducateurListItem | EducateurProfile;
	generated_password?: string; // Le mot de passe généré
}

@Injectable({ providedIn: 'root' })
export class EducateursApiService {
	private http = inject(HttpClient);
	private baseUrl = 'http://127.0.0.1:8000/api/admin/educateurs';
	private educateurBaseUrl = 'http://127.0.0.1:8000/api/educateur';

	list(params: { page?: number; per_page?: number; search?: string } = {}) {
		let httpParams = new HttpParams();
		if (params.page) httpParams = httpParams.set('page', params.page);
		if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
		if (params.search) httpParams = httpParams.set('search', params.search);
		return this.http.get<PaginatedEducateursResponse>(this.baseUrl, { params: httpParams });
	}

	get(id: number) {
		return this.http.get<EducateurResourceResponse | { data: EducateurListItem | EducateurProfile }>(`${this.baseUrl}/${id}`);
	}

	create(payload: { 
		diplome: string; 
		date_embauche: string; 
		salaire: number;
		telephone?: string;
		photo?: string;
		user: { 
			name: string; 
			email: string; 
		} 
	}) {
		return this.http.post<CreateEducateurResponse>(this.baseUrl, payload);
	}

	update(id: number, payload: Partial<{ 
		diplome: string; 
		date_embauche: string; 
		salaire: number;
		telephone?: string;
		photo?: string;
		user: { 
			name?: string; 
			email?: string; 
		};
		reset_password?: boolean;
	}>) {
		return this.http.put<{ success: boolean; message: string; data: EducateurListItem | EducateurProfile }>(`${this.baseUrl}/${id}`, payload);
	}

	delete(id: number) {
		return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
	}

	/**
	 * Réinitialiser le mot de passe d'un éducateur (Admin uniquement)
	 */
	resetPassword(id: number) {
		return this.http.post<{ success: boolean; message: string }>(`${this.baseUrl}/${id}/reset-password`, {});
	}

	/**
	 * Get current educateur's profile
	 */
	getMyProfile() {
		return this.http.get<ProfileResponse>(`${this.educateurBaseUrl}/profile`);
	}

	/**
	 * Update current educateur's profile
	 */
	updateMyProfile(payload: ProfileUpdatePayload) {
		return this.http.put<ProfileUpdateResponse>(`${this.educateurBaseUrl}/profile`, payload);
	}
}