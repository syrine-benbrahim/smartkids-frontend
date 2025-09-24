import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface EducateurListItem {
	id: number;
	user_id: number;
	name: string;
	email: string;
	diplome: string | null;
	date_embauche: string | null; // YYYY-MM-DD
	salaire?: number; // only for admin in resource
}

export interface PaginatedEducateursResponse {
	data: EducateurListItem[];
	meta?: { total: number };
	links?: unknown;
}

export interface EducateurResourceResponse {
	data: EducateurListItem;
}

@Injectable({ providedIn: 'root' })
export class EducateursApiService {
	private http = inject(HttpClient);
	private baseUrl = 'http://127.0.0.1:8000/api/admin/educateurs';

	list(params: { page?: number; per_page?: number; search?: string } = {}) {
		let httpParams = new HttpParams();
		if (params.page) httpParams = httpParams.set('page', params.page);
		if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
		if (params.search) httpParams = httpParams.set('search', params.search);
		return this.http.get<PaginatedEducateursResponse>(this.baseUrl, { params: httpParams });
	}

	get(id: number) {
		return this.http.get<EducateurResourceResponse | { data: EducateurListItem }>(`${this.baseUrl}/${id}`);
	}

	create(payload: { 
	diplome: string; 
	date_embauche: string; 
	salaire: number; 
	user: { 
		name: string; 
		email: string; 
		password?: string 
	} 
	}) {
	return this.http.post<EducateurResourceResponse>(this.baseUrl, payload);
	}

	update(id: number, payload: Partial<{ 
	diplome: string; 
	date_embauche: string; 
	salaire: number; 
	user: { 
		name?: string; 
		email?: string; 
		password?: string 
	} 
	}>) {
	return this.http.put<EducateurResourceResponse>(`${this.baseUrl}/${id}`, payload);
	}

	delete(id: number) {
		return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
	}
}



