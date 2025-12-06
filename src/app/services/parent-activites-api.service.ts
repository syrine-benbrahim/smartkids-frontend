import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ActiviteDisponible {
  id: number;
  nom: string;
  description?: string;
  type?: string;
  date_activite: string;
  heure_debut: string;
  heure_fin: string;
  prix?: number;
  image?: string;
  capacite_max?: number | null;
  materiel_requis?: string;
  consignes?: string;
  educateurs?: any[];
  participants_count?: number;
  places_restantes?: number | null;
  est_complet?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: { current_page: number; last_page: number; per_page: number; total: number };
  exception?: any;
}

export interface ParticipationActivite {
  id: number;
  nom: string;
  type?: string;
  date_activite: string;
  heure_debut: string;
  heure_fin: string;
  pivot: {
    statut_participation: 'present' | 'absent' | 'excuse' | 'en_attente' | 'inscrit';
    remarques?: string;
    note_evaluation?: number;
    date_inscription: string;
    date_presence?: string;
  };
}

export interface PaiementActivite {
  id: number;
  montant_total: number;
  statut: 'en_attente' | 'paye' | 'annule' | 'expire';
  methode_paiement?: string;
  date_echeance?: string;
  reference_transaction?: string;
  activite?: {
    id: number;
    nom: string;
  };
  enfant?: {
    id: number;
    prenom: string;
    nom: string;
  };
}

export interface StatistiquesEnfant {
  total_activites: number;
  activites_terminees: number;
  activites_a_venir: number;
  presences: number;
  absences: number;
  note_moyenne?: number;
  taux_presence: number;
  par_type: Array<{ type: string; count: number }>;
  dernieres_activites: ParticipationActivite[];
}

export interface CalendrierActivite {
  id: number;
  nom: string;
  date: string;
  heure_debut: string;
  heure_fin: string;
  type?: string;
  statut_participation: string;
  note_evaluation?: number;
}



@Injectable({ providedIn: 'root' })
export class ParentActivitesApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8000/api';

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    });
  }

  // ─── Activités disponibles pour inscription ───
  getActivitesDisponibles(filters: {
    type?: string;
    date_debut?: string;
    date_fin?: string;
    search?: string;
    per_page?: number;
    places_disponibles?: boolean;
    include_past?: boolean;
  } = {}): Observable<ApiResponse<ActiviteDisponible[]>> {
    let params = new HttpParams();

    if (filters.type) params = params.set('type', filters.type);
    if (filters.date_debut) params = params.set('date_debut', filters.date_debut);
    if (filters.date_fin) params = params.set('date_fin', filters.date_fin);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.per_page) params = params.set('per_page', String(filters.per_page));

    // Booleans must be sent as '1'/'0' or 'true'/'false' - controller uses $request->boolean()
    if (typeof filters.places_disponibles !== 'undefined') {
      params = params.set('places_disponibles', filters.places_disponibles ? '1' : '0');
    }

    if (typeof filters.include_past !== 'undefined') {
      params = params.set('include_past', filters.include_past ? '1' : '0');
    }

    return this.http.get<ApiResponse<ActiviteDisponible[]>>(
      `${this.baseUrl}/parent/activites/disponibles`,
      { headers: this.getHeaders(), params }
    );
  }

  // ─── Historique des activités d'un enfant ───
  getHistoriqueEnfant(enfantId: number, page: number = 1): Observable<ApiResponse<any>> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/parent/activites/enfant/${enfantId}/historique`,
      { headers: this.getHeaders(), params }
    );
  }

  // ─── Statistiques d'un enfant ───
  getStatistiquesEnfant(enfantId: number): Observable<ApiResponse<StatistiquesEnfant>> {
    return this.http.get<ApiResponse<StatistiquesEnfant>>(
      `${this.baseUrl}/parent/activites/enfant/${enfantId}/statistiques`,
      { headers: this.getHeaders() }
    );
  }

  // ─── Calendrier mensuel d'un enfant ───
  getCalendrierEnfant(enfantId: number, mois: number, annee: number): Observable<ApiResponse<{
    mois: number;
    annee: number;
    activites: CalendrierActivite[];
  }>> {
    const params = new HttpParams()
      .set('mois', mois.toString())
      .set('annee', annee.toString());

    return this.http.get<ApiResponse<{
      mois: number;
      annee: number;
      activites: CalendrierActivite[];
    }>>(
      `${this.baseUrl}/parent/activites/enfant/${enfantId}/calendrier`,
      { headers: this.getHeaders(), params }
    );
  }

  // ─── Détails d'une activité avec participation ───
  getDetailsActiviteEnfant(activiteId: number, enfantId: number): Observable<ApiResponse<{
    activite: any;
    participation: {
      statut_participation: string;
      remarques?: string;
      note_evaluation?: number;
      date_inscription: string;
      date_presence?: string;
    };
  }>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/parent/activites/activite/${activiteId}/enfant/${enfantId}`,
      { headers: this.getHeaders() }
    );
  }

  // ─── Participer à une activité ───
  participerActivite(activiteId: number, data: {
    enfant_id: number;
    remarques?: string;
    methode_paiement?: 'cash' | 'carte' | 'en_ligne';
  }): Observable<ApiResponse<{
    participation: any;
    paiement?: PaiementActivite;
  }>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/parent/activites/${activiteId}/participer`,
      data,
      { headers: this.getHeaders() }
    );
  }

  // ─── Annuler une participation ───
  annulerParticipation(activiteId: number, enfantId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.baseUrl}/parent/activites/${activiteId}/participations/${enfantId}`,
      { headers: this.getHeaders() }
    );
  }

  // ─── Liste des enfants (pour l'espace parent) ───
  getEnfants(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.baseUrl}/parent/enfants`,
      { headers: this.getHeaders() }
    );
  }

  // ─── Simuler un paiement ───
  simulatePayment(paiementId: number, data: {
    action: 'paye' | 'annule';
    methode_paiement?: string;
    montant?: number;
    reference_transaction?: string;
    remarques?: string;
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/paiements/${paiementId}/simulate`,
      data
    );
  }

  // ─── Récupérer les paiements en attente d'un parent ───
  getPaiementsEnAttente(): Observable<ApiResponse<PaiementActivite[]>> {
    return this.http.get<ApiResponse<PaiementActivite[]>>(
      `${this.baseUrl}/parent/paiements/en-attente`,
      { headers: this.getHeaders() }
    );
  }

  // ─── Récupérer les inscriptions scolaires du parent ───
  getInscriptions(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.baseUrl}/parent/inscriptions`,
      { headers: this.getHeaders() }
    );
  }
}