// src/app/services/parent-presences-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EnfantWithStats {
  id: number;
  nom: string;
  prenom: string;
  nom_complet: string;
  sexe: string;
  date_naissance: string;
  age: number;
  classe: {
    id: number;
    nom: string;
    niveau: string;
  } | null;
  allergies?: string;
  remarques_medicales?: string;
  statistiques_presence: {
    total_jours: number;
    jours_presents: number;
    jours_absents: number;
    taux_presence: number;
  };
}

export interface Presence {
  id: number;
  date: string;
  date_libelle: string;
  statut: 'present' | 'absent';
  educateur_nom: string;
  remarque?: string;
  updated_at: string;
}

export interface PresencesResponse {
  enfant: {
    id: number;
    nom_complet: string;
    classe: {
      nom: string;
      niveau: string;
    } | null;
  };
  presences: Presence[];
  statistiques: {
    total_jours: number;
    jours_presents: number;
    jours_absents: number;
    taux_presence: number;
  };
  periode: {
    debut: string;
    fin: string;
  };
}

export interface JourCalendrier {
  date: string;
  jour: number;
  jour_semaine: string;
  est_weekend: boolean;
  statut: 'present' | 'absent' | null;
  a_presence: boolean;
}

export interface CalendrierResponse {
  mois: string;
  mois_libelle: string;
  calendrier: JourCalendrier[];
  statistiques_mois: {
    total_jours_ecole: number;
    jours_presents: number;
    jours_absents: number;
    taux_presence: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ParentPresencesApiService {
  private apiUrl = `${environment.apiUrl}/parent`;

  constructor(private http: HttpClient) { }

  /**
   * Récupérer la liste des enfants avec leurs statistiques
   */
  getEnfants(): Observable<{ success: boolean; data: EnfantWithStats[] }> {
    return this.http.get<{ success: boolean; data: EnfantWithStats[] }>(
      `${this.apiUrl}/enfants`
    );
  }

  /**
   * Récupérer les présences d'un enfant
   */
  getPresencesEnfant(
    enfantId: number,
    dateDebut?: string,
    dateFin?: string,
    perPage: number = 15,
    page: number = 1
  ): Observable<{ success: boolean; data: PresencesResponse; pagination: any }> {
    let params = new HttpParams()
      .set('per_page', perPage.toString())
      .set('page', page.toString());

    if (dateDebut) {
      params = params.set('date_debut', dateDebut);
    }
    if (dateFin) {
      params = params.set('date_fin', dateFin);
    }

    return this.http.get<{ success: boolean; data: PresencesResponse; pagination: any }>(
      `${this.apiUrl}/enfants/${enfantId}/presences`,
      { params }
    );
  }

  /**
   * Récupérer le calendrier mensuel d'un enfant
   */
  getCalendrierEnfant(
    enfantId: number,
    mois: string
  ): Observable<{ success: boolean; data: CalendrierResponse }> {
    const params = new HttpParams().set('mois', mois);

    return this.http.get<{ success: boolean; data: CalendrierResponse }>(
      `${this.apiUrl}/enfants/${enfantId}/presences/calendrier`,
      { params }
    );
  }
}