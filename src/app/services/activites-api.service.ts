import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Activite {
  id: number;
  nom: string;
  description?: string;
  type?: string;
  date_activite: string;
  heure_debut: string;
  heure_fin: string;
  prix?: number;
  image?: string;
  statut: 'planifiee' | 'en_cours' | 'terminee' | 'annulee';
  capacite_max?: number;
  materiel_requis?: string;
  consignes?: string;
  educateurs?: any[];
  enfants?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface ActiviteFilters {
  date_debut?: string;
  date_fin?: string;
  type?: string;
  statut?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
  per_page?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: { current_page: number; last_page: number; per_page: number; total: number };
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class ActivitesApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8000/api/admin/activites';

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    });
  }
  getTypes(): Observable<any> {
      return this.http.get(`${this.baseUrl}/activites/types`);
    }
  // ─── Liste des activités avec filtres ───
  getAll(filters: ActiviteFilters = {}): Observable<ApiResponse<Activite[]>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    return this.http.get<ApiResponse<Activite[]>>(this.baseUrl, { headers: this.getHeaders(), params });
  }

  // ─── Récupère une activité par ID ───
  get(id: number): Observable<ApiResponse<Activite>> {
    return this.http.get<ApiResponse<Activite>>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  // ─── Création d'activité ───
  create(data: any, imageFile?: File): Observable<ApiResponse<Activite>> {
    if (imageFile) return this.createWithImage(data, imageFile);
    return this.createWithoutImage(data);
  }

  // ─── Mise à jour d'activité ───
  update(id: number, data: any, imageFile?: File): Observable<ApiResponse<Activite>> {
    if (imageFile) return this.updateWithImage(id, data, imageFile);
    return this.updateWithoutImage(id, data);
  }

  // ─── Suppression ───
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  // ─── Changer statut ───
  changeStatus(id: number, statut: string): Observable<ApiResponse<Activite>> {
    return this.http.patch<ApiResponse<Activite>>(
      `${this.baseUrl}/${id}/statut`,
      { statut },
      { headers: this.getHeaders() }
    );
  }

  // ─── Dupliquer activité ───
  duplicate(id: number, data: { date_activite: string; heure_debut?: string; heure_fin?: string }): Observable<ApiResponse<Activite>> {
    return this.http.post<ApiResponse<Activite>>(
      `${this.baseUrl}/${id}/duplicate`,
      data,
      { headers: this.getHeaders() }
    );
  }

  // ─── Inscrire enfant ───
  inscrireEnfant(activiteId: number, enfantId: number, remarques?: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.baseUrl}/${activiteId}/inscrire`,
      { enfant_id: enfantId, remarques },
      { headers: this.getHeaders() }
    );
  }

  // ─── Désinscrire enfant ───
  desinscrireEnfant(activiteId: number, enfantId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/${activiteId}/enfants/${enfantId}`,
      { headers: this.getHeaders() }
    );
  }

  // ─── JSON sans image ───
  private createWithoutImage(data: any): Observable<ApiResponse<Activite>> {
    return this.http.post<ApiResponse<Activite>>(this.baseUrl, data, { headers: this.getHeaders() });
  }

  private updateWithoutImage(id: number, data: any): Observable<ApiResponse<Activite>> {
    return this.http.put<ApiResponse<Activite>>(`${this.baseUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  // ─── FormData avec image ───
  private createWithImage(data: any, imageFile: File): Observable<ApiResponse<Activite>> {
    const formData = this.prepareFormData(data, imageFile);
    return this.http.post<ApiResponse<Activite>>(this.baseUrl, formData, { headers: this.getHeadersForFormData() });
  }

  private updateWithImage(id: number, data: any, imageFile: File): Observable<ApiResponse<Activite>> {
    const formData = this.prepareFormData(data, imageFile);
    formData.append('_method', 'PUT'); // Laravel PUT via POST
    return this.http.post<ApiResponse<Activite>>(`${this.baseUrl}/${id}`, formData, { headers: this.getHeadersForFormData() });
  }

  private getHeadersForFormData(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    });
  }

  private prepareFormData(data: any, imageFile: File): FormData {
    const formData = new FormData();
    for (const key in data) {
      if (Array.isArray(data[key])) {
        data[key].forEach((val: any, index: number) => formData.append(`${key}[${index}]`, val));
      } else {
        formData.append(key, data[key]);
      }
    }
    if (imageFile) formData.append('image', imageFile);
    return formData;
  }
}
