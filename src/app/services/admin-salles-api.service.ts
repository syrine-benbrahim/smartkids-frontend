import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Salle {
    id: number;
    code: string;
    nom: string;
    capacite: number;
    is_active: boolean;
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
export class AdminSallesApiService {
    private http = inject(HttpClient);
    private baseUrl = 'http://127.0.0.1:8000/api/admin/salles';

    list(params?: any): Observable<ApiResponse<{ data: Salle[] }>> {
        return this.http.get<ApiResponse<{ data: Salle[] }>>(this.baseUrl, { params });
    }

    get(id: number): Observable<ApiResponse<Salle>> {
        return this.http.get<ApiResponse<Salle>>(`${this.baseUrl}/${id}`);
    }

    create(payload: Partial<Salle>): Observable<ApiResponse<Salle>> {
        return this.http.post<ApiResponse<Salle>>(this.baseUrl, payload);
    }

    update(id: number, payload: Partial<Salle>): Observable<ApiResponse<Salle>> {
        return this.http.put<ApiResponse<Salle>>(`${this.baseUrl}/${id}`, payload);
    }

    delete(id: number): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(`${this.baseUrl}/${id}`);
    }
}
