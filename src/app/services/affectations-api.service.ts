import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AffectationRequest {
  educateur_id: number;
  classe_id: number;
}

export interface ChangeEducateurRequest {
  ancien_educateur_id: number;
  nouveau_educateur_id: number;
  classe_id: number;
}

export interface RemoveEducateurRequest {
  educateur_id: number;
  classe_id: number;
}

export interface AssignMultipleRequest {
  classe_id: number;
  educateurs_ids: number[];
}

export interface EducateurInfo {
  id: number;
  nom: string;
  email: string;
  diplome: string;
  assigned_at?: string;
}

export interface ClasseInfo {
  id: number;
  nom: string;
  niveau: number; // Integer as per your migration
  capacite_max: number;
}

export interface ClasseEducateursResponse {
  success: boolean;
  data: {
    classe: ClasseInfo;
    educateurs: EducateurInfo[];
  };
}

export interface EducateurClassesResponse {
  success: boolean;
  data: {
    educateur: EducateurInfo;
    classes: ClasseInfo[];
  };
}

export interface AvailableEducateursResponse {
  success: boolean;
  data: {
    classe: ClasseInfo;
    educateurs_disponibles: EducateurInfo[];
  };
}

export interface AffectationResumeItem {
  classe: {
    id: number;
    nom: string;
    niveau: number; // Integer as per your migration
    capacite_max: number;
  };
  educateurs: EducateurInfo[];
  nombre_educateurs: number;
}

export interface AffectationsStats {
  total_classes: number;
  classes_avec_educateurs: number;
  classes_sans_educateurs: number;
  total_educateurs: number;
  educateurs_assignes: number;
  educateurs_non_assignes: number;
  total_affectations: number;
}

export interface AffectationsResumeResponse {
  success: boolean;
  data: {
    affectations: AffectationResumeItem[];
    statistiques: AffectationsStats;
  };
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface AssignMultipleResult {
  success: Array<{
    educateur: EducateurInfo;
    classe: ClasseInfo;
    assigned_at: string;
  }>;
  errors?: Array<{
    educateur_id: number;
    error: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class AffectationsApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000/api/admin';

  /**
   * Assigner un éducateur à une classe
   */
  assignEducateur(data: AffectationRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/affectations/assign`, data);
  }

  /**
   * Retirer un éducateur d'une classe
   */
  removeEducateur(data: RemoveEducateurRequest): Observable<ApiResponse> {
    return this.http.request<ApiResponse>('DELETE', `${this.baseUrl}/affectations/remove`, {
      body: data
    });
  }

  /**
   * Changer l'éducateur d'une classe
   */
  changeEducateur(data: ChangeEducateurRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.baseUrl}/affectations/change`, data);
  }

  /**
   * Assigner plusieurs éducateurs à une classe en une fois
   */
  assignMultipleEducateurs(data: AssignMultipleRequest): Observable<{
    success: boolean;
    message: string;
    data: AssignMultipleResult;
  }> {
    return this.http.post<any>(`${this.baseUrl}/affectations/assign-multiple`, data);
  }

  /**
   * Obtenir le résumé complet des affectations avec statistiques
   */
  getAffectationsResume(): Observable<AffectationsResumeResponse> {
    return this.http.get<AffectationsResumeResponse>(`${this.baseUrl}/affectations/resume`);
  }

  /**
   * Obtenir les éducateurs d'une classe spécifique
   */
  getEducateursByClasse(classeId: number): Observable<ClasseEducateursResponse> {
    return this.http.get<ClasseEducateursResponse>(`${this.baseUrl}/classes/${classeId}/educateurs`);
  }

  /**
   * Obtenir les classes d'un éducateur spécifique
   */
  getClassesByEducateur(educateurId: number): Observable<EducateurClassesResponse> {
    return this.http.get<EducateurClassesResponse>(`${this.baseUrl}/educateurs/${educateurId}/classes`);
  }

  /**
   * Obtenir les éducateurs disponibles pour une classe (non assignés à cette classe)
   */
  getAvailableEducateurs(classeId: number): Observable<AvailableEducateursResponse> {
    return this.http.get<AvailableEducateursResponse>(`${this.baseUrl}/affectations/classe/${classeId}/educateurs-disponibles`);
  }

  /**
   * Obtenir les classes de l'éducateur connecté (pour les éducateurs)
   */
  getMesClasses(): Observable<EducateurClassesResponse> {
    return this.http.get<EducateurClassesResponse>(`${this.baseUrl}/educateur/mes-classes`);
  }
}