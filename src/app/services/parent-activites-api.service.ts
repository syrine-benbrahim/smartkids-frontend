import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaymentQuote {
  success: true;
  amount_due: number;
  currency: string;
  plan_type: string;
  details: {
    activite_nom: string;
    date: string;
    prix: number;
  };
}

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
  image_url?: string;
  capacite_max?: number | null;
  materiel_requis?: string;
  consignes?: string;
  statut?: string;
  educateurs?: Array<{
    id: number;
    user: { name: string };
  }>;
  participants_count?: number;
  places_restantes?: number | null;
  est_complet?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number
  };
}

export interface ParticipationResponse {
  participation: {
    id: number;
    enfant_id: number;
    activite_id: number;
    statut: string;
    date_inscription: string;
  };
  activite: {
    id: number;
    nom: string;
    date: string;
    prix: number;
  };
  paiement?: {
    id: number;
    montant: number;
    statut: string;
    methode: string;
    date_echeance: string;
    reference?: string;
  };
}

export interface StatistiquesEnfant {
  total_activites: number;
  presences: number;
  absences: number;
  en_attente: number;
  taux_participation: number;
}

export interface HistoriqueActivite {
  activite: {
    id: number;
    nom: string;
    type?: string;
    date: string;
    heure_debut: string;
    heure_fin: string;
    prix?: number;
    statut?: string;
  };
  participation: {
    statut: string;
    remarques?: string;
    date_inscription: string;
    date_presence?: string;
  };
  educateurs?: Array<{ id: number; nom: string }>;
}

export interface CalendrierActivite {
  id: number;
  nom: string;
  date: string;
  heure_debut: string;
  heure_fin: string;
  type?: string;
  statut_participation: string;
}

export interface PaiementActivite {
  id: number;
  montant: number;
  date_echeance: string;
  jours_restants: number;
  statut: string;
  methode: string;
  activite: {
    id: number;
    nom: string;
    date: string;
  };
  enfant: {
    id: number;
    nom: string;
    prenom: string;
  };
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
    if (filters.places_disponibles !== undefined) {
      params = params.set('places_disponibles', filters.places_disponibles ? '1' : '0');
    }
    if (filters.include_past !== undefined) {
      params = params.set('include_past', filters.include_past ? '1' : '0');
    }

    return this.http.get<ApiResponse<ActiviteDisponible[]>>(
      `${this.baseUrl}/parent/activites/disponibles`,
      { headers: this.getHeaders(), params }
    );
  }

  // ─── Participer à une activité ───
  participerActivite(activiteId: number, data: {
    enfant_id: number;
    remarques?: string;
    methode_paiement?: 'cash' | 'carte' | 'en_ligne';
  }): Observable<ApiResponse<ParticipationResponse>> {
    return this.http.post<ApiResponse<ParticipationResponse>>(
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

  // ─── Historique des participations d'un enfant ───
  getParticipationsEnfant(enfantId: number): Observable<ApiResponse<HistoriqueActivite[]>> {
    return this.http.get<ApiResponse<HistoriqueActivite[]>>(
      `${this.baseUrl}/parent/enfants/${enfantId}/participations`,
      { headers: this.getHeaders() }
    );
  }

  // ─── Statistiques d'un enfant ───
  getStatistiquesEnfant(enfantId: number): Observable<ApiResponse<StatistiquesEnfant>> {
    return this.http.get<ApiResponse<StatistiquesEnfant>>(
      `${this.baseUrl}/parent/activites/enfant/${enfantId}/statistiques`,
      { headers: this.getHeaders() }
    );
  }

  // ─── Paiements en attente ───
  getPaiementsEnAttente(): Observable<ApiResponse<PaiementActivite[]>> {
    return this.http.get<ApiResponse<PaiementActivite[]>>(
      `${this.baseUrl}/parent/activites/paiements-en-attente`,
      { headers: this.getHeaders() }
    );
  }

  // ─── Liste des enfants ───
  getEnfants(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.baseUrl}/parent/enfants`,
      { headers: this.getHeaders() }
    );
  }

  // ─── Paiement & Devis pour activité ───
  getQuote(activiteId: number, enfantId: number): Observable<PaymentQuote> {
    const params = new HttpParams().set('enfant_id', enfantId.toString());
    return this.http.get<PaymentQuote>(
      `${this.baseUrl}/parent/activites/${activiteId}/payment/quote`,
      { headers: this.getHeaders(), params }
    );
  }

  confirmPayment(activiteId: number, data: {
    enfant_id: number;
    methode: 'en_ligne' | 'carte' | 'cash';
    reference?: string;
    remarques?: string;
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/parent/activites/${activiteId}/payment/confirm`,
      data,
      { headers: this.getHeaders() }
    );
  }

  // ─── Simuler un paiement (pour tests) ───
  simulatePayment(paiementId: number, data: {
    action: 'paye' | 'annule';
    methode_paiement?: string;
    reference_transaction?: string;
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/paiements/${paiementId}/simulate`,
      data
    );
  }
}