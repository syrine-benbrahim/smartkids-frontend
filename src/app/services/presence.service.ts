import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface EducateurClasse {
  id: number;
  nom: string;
  niveau: string;
  capacite_max: number;
  nombre_enfants: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClassesEducateurResponse {
  success: boolean;
  data: EducateurClasse[];
  message?: string;
}

export interface EnfantPresence {
  id: number;
  nom: string;
  prenom: string;
  nom_complet: string;
  age: number;
  statut: 'present' | 'absent';
  presence_id: number | null;
  deja_enregistre: boolean;
  updated_at: string | null;
}

export interface ClassePresenceData {
  classe: {
    id: number;
    nom: string;
    niveau: string;
    capacite_max: number;
  };
  enfants: EnfantPresence[];
  resume: {
    total_enfants: number;
    presents: number;
    absents: number;
    taux_presence: number;
    peut_modifier: boolean;
  };
  date_libelle: string;
}

export interface PresenceResponse {
  success: boolean;
  data: ClassePresenceData;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000/api/educateur';

  /**
   * Récupère la liste des classes assignées à l'éducateur connecté
   */
  getClassesEducateur(): Observable<ClassesEducateurResponse> {
    return this.http.get<ClassesEducateurResponse>(`${this.baseUrl}/classes`)
      .pipe(
        catchError(error => {
          console.error('Erreur API getClassesEducateur:', error);
          // Retourne une réponse d'erreur structurée
          return of({
            success: false,
            data: [],
            message: this.getErrorMessage(error)
          });
        })
      );
  }

  /**
   * Récupère les enfants d'une classe avec leurs présences pour une date donnée
   */
  getEnfantsClasse(classeId: number, date?: string): Observable<PresenceResponse> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }

    return this.http.get<PresenceResponse>(`${this.baseUrl}/classes/${classeId}/presences`, { params })
      .pipe(
        catchError(error => {
          console.error('Erreur API getEnfantsClasse:', error);
          return of({
            success: false,
            data: {
              classe: { id: classeId, nom: '', niveau: '', capacite_max: 0 },
              enfants: [],
              resume: { total_enfants: 0, presents: 0, absents: 0, taux_presence: 0, peut_modifier: false },
              date_libelle: ''
            },
            message: this.getErrorMessage(error)
          });
        })
      );
  }

  /**
   * Enregistre les présences pour une classe à une date donnée
   */
  marquerPresences(classeId: number, data: {
    date_presence: string;
    presences: Array<{
      enfant_id: number;
      statut: 'present' | 'absent';
    }>;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/classes/${classeId}/presences`, data)
      .pipe(
        catchError(error => {
          console.error('Erreur API marquerPresences:', error);
          return of({
            success: false,
            message: this.getErrorMessage(error)
          });
        })
      );
  }

  /**
   * Met à jour une présence individuelle
   */
  updatePresence(presenceId: number, statut: 'present' | 'absent'): Observable<any> {
    return this.http.put(`${this.baseUrl}/presences/${presenceId}`, { statut })
      .pipe(
        catchError(error => {
          console.error('Erreur API updatePresence:', error);
          return of({
            success: false,
            message: this.getErrorMessage(error)
          });
        })
      );
  }

  /**
   * Récupère l'historique des présences d'une classe
   */
  getHistoriqueClasse(classeId: number, params?: {
    date_debut?: string;
    date_fin?: string;
    per_page?: number;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) httpParams = httpParams.set(key, value.toString());
      });
    }

    return this.http.get(`${this.baseUrl}/classes/${classeId}/presences/historique`, { params: httpParams })
      .pipe(
        catchError(error => {
          console.error('Erreur API getHistoriqueClasse:', error);
          return of({
            success: false,
            data: [],
            message: this.getErrorMessage(error)
          });
        })
      );
  }

  /**
   * Récupère les statistiques de présence pour l'éducateur
   */
  getStatistiquesEducateur(periode?: number): Observable<any> {
    let params = new HttpParams();
    if (periode) {
      params = params.set('periode', periode.toString());
    }

    return this.http.get(`${this.baseUrl}/presences/statistiques`, { params })
      .pipe(
        catchError(error => {
          console.error('Erreur API getStatistiquesEducateur:', error);
          return of({
            success: false,
            data: null,
            message: this.getErrorMessage(error)
          });
        })
      );
  }

  /**
   * Méthode utilitaire pour extraire un message d'erreur lisible
   */
  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
    }
    
    if (error.status === 401) {
      return 'Session expirée. Veuillez vous reconnecter.';
    }
    
    if (error.status === 403) {
      return 'Accès refusé. Vous n\'êtes pas autorisé à effectuer cette action.';
    }
    
    if (error.status === 404) {
      return 'Ressource non trouvée.';
    }
    
    if (error.status === 422) {
      return 'Données invalides envoyées au serveur.';
    }
    
    if (error.status === 500) {
      return 'Erreur serveur. Contactez l\'administrateur système.';
    }
    
    // Si l'erreur contient un message spécifique du backend
    if (error.error && error.error.message) {
      return error.error.message;
    }
    
    return 'Une erreur inattendue s\'est produite.';
  }

  /**
   * Méthode utilitaire pour vérifier si une réponse est valide
   */
  isValidResponse(response: any): boolean {
    return response && response.success === true;
  }

  /**
   * Méthode utilitaire pour obtenir les données d'une réponse ou un fallback
   */
  getResponseData<T>(response: any, fallback: T): T {
    return (response && response.success && response.data) ? response.data : fallback;
  }
}