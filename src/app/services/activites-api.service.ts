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
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivitesApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8000/api/admin/activites';

  private getJsonHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  /**
   * Récupère la liste des activités avec filtres et pagination
   */
  getAll(filters: ActiviteFilters = {}): Observable<ApiResponse<Activite[]>> {
    let params = new HttpParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<Activite[]>>(this.baseUrl, { params });
  }

  /**
   * Récupère une activité spécifique
   */
  get(id: number): Observable<ApiResponse<Activite>> {
    return this.http.get<ApiResponse<Activite>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crée une nouvelle activité avec upload d'image
   */
  create(data: any, imageFile?: File): Observable<ApiResponse<Activite>> {
    if (imageFile) {
      return this.createWithImage(data, imageFile);
    } else {
      return this.createWithoutImage(data);
    }
  }

  /**
   * Met à jour une activité avec upload d'image optionnel
   */
  update(id: number, data: any, imageFile?: File): Observable<ApiResponse<Activite>> {
    if (imageFile) {
      return this.updateWithImage(id, data, imageFile);
    } else {
      return this.updateWithoutImage(id, data);
    }
  }

  /**
   * Crée une activité sans image (JSON)
   */
  private createWithoutImage(data: any): Observable<ApiResponse<Activite>> {
    const cleanData = this.prepareJsonData(data);
    return this.http.post<ApiResponse<Activite>>(this.baseUrl, cleanData, { 
      headers: this.getJsonHeaders() 
    });
  }

  /**
   * Met à jour une activité sans image (JSON)
   */
  private updateWithoutImage(id: number, data: any): Observable<ApiResponse<Activite>> {
    const cleanData = this.prepareJsonData(data);
    return this.http.put<ApiResponse<Activite>>(`${this.baseUrl}/${id}`, cleanData, { 
      headers: this.getJsonHeaders() 
    });
  }

  /**
   * Crée une activité avec image (FormData)
   */
  private createWithImage(data: any, imageFile: File): Observable<ApiResponse<Activite>> {
    const formData = this.prepareFormData(data, imageFile);
    const headers = new HttpHeaders({
      'Accept': 'application/json'
      // Ne pas définir Content-Type pour FormData
    });
    return this.http.post<ApiResponse<Activite>>(this.baseUrl, formData, { headers });
  }

  /**
   * Met à jour une activité avec image (FormData)
   */
  private updateWithImage(id: number, data: any, imageFile: File): Observable<ApiResponse<Activite>> {
    const formData = this.prepareFormData(data, imageFile);
    formData.append('_method', 'PUT');
    const headers = new HttpHeaders({
      'Accept': 'application/json'
      // Ne pas définir Content-Type pour FormData
    });
    return this.http.post<ApiResponse<Activite>>(`${this.baseUrl}/${id}`, formData, { headers });
  }

  /**
   * Supprime une activité
   */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Récupère les types d'activités disponibles
   */
  getTypes(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.baseUrl}/types`);
  }

  /**
   * Récupère les statistiques des activités
   */
  getStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/stats`);
  }

  /**
   * Change le statut d'une activité
   */
  changeStatus(id: number, statut: string): Observable<ApiResponse<Activite>> {
    return this.http.patch<ApiResponse<Activite>>(`${this.baseUrl}/${id}/statut`, { statut });
  }

  /**
   * Duplique une activité
   */
  duplicate(id: number, data: { date_activite: string; heure_debut?: string; heure_fin?: string }): Observable<ApiResponse<Activite>> {
    return this.http.post<ApiResponse<Activite>>(`${this.baseUrl}/${id}/duplicate`, data);
  }

  /**
   * Inscrit un enfant à une activité
   */
  inscrireEnfant(activiteId: number, enfantId: number, remarques?: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/${activiteId}/enfants/inscrire`, {
      enfant_id: enfantId,
      remarques
    });
  }

  /**
   * Désinscrit un enfant d'une activité
   */
  desinscrireEnfant(activiteId: number, enfantId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${activiteId}/enfants/${enfantId}`);
  }

  /**
   * Marque les présences pour une activité
   */
  marquerPresences(activiteId: number, presences: any[]): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/${activiteId}/presences`, { presences });
  }

  /**
   * Prépare les données JSON (sans image)
   */
  private prepareJsonData(formData: any): any {
    console.log('Préparation des données JSON:', formData);
    
    const data: any = {
      nom: formData.nom?.trim() || '',
      date_activite: formData.date_activite || '',
      heure_debut: formData.heure_debut || '',
      heure_fin: formData.heure_fin || '',
      statut: formData.statut || 'planifiee'
    };

    // Champs optionnels - ajouter seulement s'ils ont une valeur
    if (formData.description?.trim()) {
      data.description = formData.description.trim();
    }

    if (formData.type?.trim()) {
      data.type = formData.type.trim();
    }

    if (formData.prix !== null && formData.prix !== undefined && formData.prix !== '' && !isNaN(formData.prix)) {
      data.prix = parseFloat(formData.prix);
    }

    if (formData.capacite_max !== null && formData.capacite_max !== undefined && formData.capacite_max !== '' && !isNaN(formData.capacite_max)) {
      data.capacite_max = parseInt(formData.capacite_max);
    }

    if (formData.materiel_requis?.trim()) {
      data.materiel_requis = formData.materiel_requis.trim();
    }

    if (formData.consignes?.trim()) {
      data.consignes = formData.consignes.trim();
    }

    // Éducateurs
    if (formData.educateur_ids && Array.isArray(formData.educateur_ids) && formData.educateur_ids.length > 0) {
      data.educateur_ids = formData.educateur_ids;
    }

    console.log('Données JSON préparées:', data);
    return data;
  }

  /**
   * Prépare les données FormData (avec image)
   */
  private prepareFormData(formData: any, imageFile: File): FormData {
    const data = new FormData();
    
    console.log('Préparation FormData avec image:', formData);
    
    // Champs obligatoires
    data.append('nom', formData.nom?.trim() || '');
    data.append('date_activite', formData.date_activite || '');
    data.append('heure_debut', formData.heure_debut || '');
    data.append('heure_fin', formData.heure_fin || '');
    data.append('statut', formData.statut || 'planifiee');
    
    // Champs optionnels
    if (formData.description?.trim()) {
      data.append('description', formData.description.trim());
    }
    
    if (formData.type?.trim()) {
      data.append('type', formData.type.trim());
    }
    
    if (formData.prix !== null && formData.prix !== undefined && formData.prix !== '' && !isNaN(formData.prix)) {
      data.append('prix', parseFloat(formData.prix).toString());
    }
    
    if (formData.capacite_max !== null && formData.capacite_max !== undefined && formData.capacite_max !== '' && !isNaN(formData.capacite_max)) {
      data.append('capacite_max', parseInt(formData.capacite_max).toString());
    }
    
    if (formData.materiel_requis?.trim()) {
      data.append('materiel_requis', formData.materiel_requis.trim());
    }
    
    if (formData.consignes?.trim()) {
      data.append('consignes', formData.consignes.trim());
    }
    
    // Image
    if (imageFile instanceof File) {
      data.append('image', imageFile);
    }
    
    // Éducateurs
    if (formData.educateur_ids && Array.isArray(formData.educateur_ids)) {
      formData.educateur_ids.forEach((id: number, index: number) => {
        data.append(`educateur_ids[${index}]`, id.toString());
      });
    }
    
    console.log('FormData préparé');
    return data;
  }
}