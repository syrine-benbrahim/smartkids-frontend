// src/app/services/enfant-fiche.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FicheEnfant {
  id: number;
  nom: string;
  prenom: string;
  nom_complet: string;
  sexe: string;
  date_naissance: string;
  age: number;
  photo: string | null;
  
  infos_medicales: {
    allergies: string | null;
    remarques_medicales: string | null;
  };
  
  classe: {
    id: number;
    nom: string;
    niveau: string;
    capacite_max: number;
    description: string | null;
    salle: {
      id: number;
      nom: string;
      code: string;
    } | null;
    educateur_principal: {
      id: number;
      nom_complet: string;
      email: string | null;
      telephone: string | null;
    } | null;
    educateurs: Array<{
      id: number;
      nom_complet: string;
      email: string | null;
      telephone: string | null;
    }>;
  } | null;
  
  statistiques_presence: {
    total_jours: number;
    jours_presents: number;
    jours_absents: number;
    taux_presence: number;
    mois_en_cours: {
      total: number;
      presents: number;
      taux: number;
    };
  };
  
  presences_recentes: Array<{
    id: number;
    date: string;
    statut: string;
    remarque: string | null;
    educateur: string;
  }>;
  
  activites_recentes: Array<{
    id: number;
    titre: string;
    type: string;
    date_activite: string;
    statut: string | null;
    note_evaluation: number | null;
  }>;
  
  statistiques_activites: {
    total_activites: number;
    activites_presentes: number;
    activites_absentes: number;
    taux_participation: number;
  };
  
  notes_recentes: Array<{
    id: number;
    matiere: string;
    note: number;
    type_evaluation: string;
    date_evaluation: string;
    trimestre: number;
    commentaire: string | null;
    educateur: string;
  }>;
  
  moyennes: {
    annee_scolaire: string;
    trimestre_1: number | null;
    trimestre_2: number | null;
    trimestre_3: number | null;
    moyenne_generale: number | null;
  };
  
  parents: Array<{
    id: number;
    nom_complet: string;
    telephone: string;
    email: string | null;
    profession: string | null;
  }>;
  
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnfantFicheService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/parent/enfants`;

  /**
   * Récupérer la fiche complète d'un enfant
   */
  getFicheEnfant(enfantId: number): Observable<ApiResponse<FicheEnfant>> {
    return this.http.get<ApiResponse<FicheEnfant>>(
      `${this.apiUrl}/${enfantId}/fiche`
    );
  }

  /**
   * Upload de photo pour l'enfant
   */
  uploadPhoto(enfantId: number, file: File): Observable<ApiResponse<{ photo_url: string }>> {
    const formData = new FormData();
    formData.append('photo', file);

    return this.http.post<ApiResponse<{ photo_url: string }>>(
      `${this.apiUrl}/${enfantId}/photo`,
      formData
    );
  }

  /**
   * Helper: Obtenir la classe CSS pour le taux de présence
   */
  getTauxPresenceClass(taux: number): string {
    if (taux >= 90) return 'text-green-600';
    if (taux >= 75) return 'text-blue-600';
    if (taux >= 60) return 'text-orange-600';
    return 'text-red-600';
  }

  /**
   * Helper: Obtenir la classe CSS pour la barre de progression
   */
  getProgressBarClass(taux: number): string {
    if (taux >= 90) return 'bg-gradient-to-r from-green-500 to-emerald-600';
    if (taux >= 75) return 'bg-gradient-to-r from-blue-500 to-cyan-600';
    if (taux >= 60) return 'bg-gradient-to-r from-orange-500 to-amber-600';
    return 'bg-gradient-to-r from-red-500 to-pink-600';
  }

  /**
   * Helper: Formater une date
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Helper: Obtenir l'icône pour un statut
   */
  getStatutIcon(statut: string): string {
    const icons: Record<string, string> = {
      'present': '✅',
      'absent': '❌',
      'inscrit': '📝',
      'retard': '⏰'
    };
    return icons[statut] || '❓';
  }

  /**
   * Helper: Obtenir la couleur pour une mention
   */
  getMentionColor(note: number): string {
    if (note >= 16) return 'text-green-600';
    if (note >= 14) return 'text-blue-600';
    if (note >= 12) return 'text-orange-600';
    if (note >= 10) return 'text-yellow-600';
    return 'text-red-600';
  }
}