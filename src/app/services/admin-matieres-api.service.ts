import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Matiere {
    id: number;
    code: string;
    nom: string;
    description?: string;
    niveau: string; // ex: "petite_section"
    coefficient: number;
    couleur: string; // hex color
    actif: boolean;
    photo?: string; // URL
}

export interface AssignNiveauPayload {
    niveau: string;
    heures_par_semaine?: number;
    objectifs_specifiques?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: any;
}

@Injectable({
    providedIn: 'root'
})
export class AdminMatieresApiService {
    private http = inject(HttpClient);
    private baseUrl = 'http://127.0.0.1:8000/api/admin/matieres';

    list(params?: any): Observable<ApiResponse<{ data: Matiere[] }>> {
        return this.http.get<ApiResponse<{ data: Matiere[] }>>(this.baseUrl, { params });
    }

    get(id: number): Observable<ApiResponse<Matiere>> {
        return this.http.get<ApiResponse<Matiere>>(`${this.baseUrl}/${id}`);
    }

    create(data: FormData): Observable<ApiResponse<Matiere>> {
        return this.http.post<ApiResponse<Matiere>>(this.baseUrl, data);
    }

    update(id: number, data: FormData): Observable<ApiResponse<Matiere>> {
        return this.http.post<ApiResponse<Matiere>>(`${this.baseUrl}/${id}?_method=PUT`, data);
    }

    delete(id: number): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(`${this.baseUrl}/${id}`);
    }

    assignToNiveau(id: number, payload: AssignNiveauPayload): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.baseUrl}/${id}/assign-to-niveau`, payload);
    }
}
