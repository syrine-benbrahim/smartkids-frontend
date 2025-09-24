import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClasseListItem {
  id: number;
  nom: string;
  niveau: number; // Changed to number to match backend
  capacite_max: number;
  description?: string;
  nombre_enfants: number;
  places_disponibles: number;
  est_complete: boolean;
  taux_occupation: number;
  nombre_educateurs: number;
  nombre_matieres?: number;
  created_at: string;
  updated_at: string;
}

export interface ClasseDetail extends ClasseListItem {
  educateurs?: Array<{
    id: number;
    nom: string;
    prenom: string;
    email: string;
  }>;
  enfants?: Array<{
    id: number;
    nom: string;
    prenom: string;
    date_naissance: string;
  }>;
  matieres?: Array<{
    id: number;
    nom: string;
  }>;
  statistiques?: {
    age_moyen?: number;
    age_min?: number;
    age_max?: number;
  };
}

export interface ClasseFormData {
  nom: string;
  niveau: string | number; // Flexible type - string for form, number for API
  capacite_max: number;
  description?: string;
}

export interface ClassesListResponse {
  success: boolean;
  data: {
    data: ClasseListItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ClasseResponse {
  success: boolean;
  data: ClasseDetail;
  message?: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  errors?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ClassesApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000/api/admin/classes';

  list(params?: { 
    page?: number; 
    per_page?: number; 
    search?: string; 
    niveau?: number;
    capacite_min?: number;
    capacite_max?: number;
    sort_by?: string;
    sort_order?: string;
  }): Observable<ClassesListResponse> {
    return this.http.get<ClassesListResponse>(this.baseUrl, { params });
  }

  get(id: number): Observable<ClasseResponse> {
    return this.http.get<ClasseResponse>(`${this.baseUrl}/${id}`);
  }

  create(data: ClasseFormData): Observable<ClasseResponse> {
    return this.http.post<ClasseResponse>(this.baseUrl, data);
  }

  update(id: number, data: Partial<ClasseFormData>): Observable<ClasseResponse> {
    return this.http.put<ClasseResponse>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/${id}`);
  }

  // Méthodes utilitaires
  listSimple(): Observable<{ success: boolean; data: Array<{ id: number; nom: string; niveau: number; }> }> {
    return this.http.get<any>(`${this.baseUrl}/list/simple`);
  }

  statistics(): Observable<{ success: boolean; data: any }> {
    return this.http.get<any>(`${this.baseUrl}/statistics/all`);
  }

  checkNomDisponibilite(nom: string, excludeId?: number): Observable<{ success: boolean; available: boolean; message: string }> {
    return this.http.post<any>(`${this.baseUrl}/check-nom`, { nom, exclude_id: excludeId });
  }

  canDelete(id: number): Observable<{ success: boolean; can_delete: boolean; message: string; nombre_enfants: number }> {
    return this.http.get<any>(`${this.baseUrl}/${id}/can-delete`);
  }

  duplicate(id: number): Observable<ClasseResponse> {
    return this.http.post<ClasseResponse>(`${this.baseUrl}/${id}/duplicate`, {});
  }

  // Helper method to get niveau labels
  static getNiveauLabel(niveau: number): string {
    const niveauLabels: { [key: number]: string } = {
      1: 'Petite Section',
      2: 'Moyenne Section',
      3: 'Grande Section',
      4: 'CP',
      5: 'CE1',
      6: 'CE2',
      7: 'CM1',
      8: 'CM2'
    };
    return niveauLabels[niveau] || `Niveau ${niveau}`;
  }
}