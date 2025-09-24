// src/app/services/inscriptions-api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Inscription {
  id: number;
  enfant_id: number;
  classe_id: number;
  annee_scolaire: string;
  date_inscription: string;
  statut: 'en_attente' | 'accepte' | 'refuse' | 'liste_attente';
  position_attente?: number;
  frais_inscription?: number;
  frais_mensuel?: number;
  documents_fournis?: string[];
  remarques?: string;
  date_traitement?: string;
  traite_par_admin_id?: number;
  enfant?: any;
  classe?: any;
  adminTraitant?: any;
}

export interface InscriptionForm {
  enfant_id: number;
  classe_id: number;
  annee_scolaire?: string;
  frais_inscription?: number;
  frais_mensuel?: number;
  documents_fournis?: string[];
  remarques?: string;
}

export interface TraiterInscriptionRequest {
  action: 'accepter' | 'refuser' | 'mettre_en_attente';
  remarques?: string;
}

export interface InscriptionStats {
  en_attente: number;
  acceptees: number;
  en_liste_attente: number;
  refusees: number;
}

@Injectable({
  providedIn: 'root'
})
export class InscriptionsApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000/api/';

  // Admin routes
  getInscriptions(params?: { statut?: string; classe_id?: number; annee_scolaire?: string }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.statut) httpParams = httpParams.set('statut', params.statut);
      if (params.classe_id) httpParams = httpParams.set('classe_id', params.classe_id.toString());
      if (params.annee_scolaire) httpParams = httpParams.set('annee_scolaire', params.annee_scolaire);
    }
    return this.http.get(`${this.baseUrl}/admin/inscriptions`, { params: httpParams });
  }

  getInscription(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/inscriptions/${id}`);
  }

  traiterInscription(id: number, data: TraiterInscriptionRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/inscriptions/${id}/traiter`, data);
  }

  getListeAttente(classeId: number, anneeScolaire?: string): Observable<any> {
    let params = new HttpParams();
    if (anneeScolaire) params = params.set('annee_scolaire', anneeScolaire);
    return this.http.get(`${this.baseUrl}/admin/inscriptions/classe/${classeId}/liste-attente`, { params });
  }

  choisirCandidat(classeId: number, inscriptionId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/inscriptions/classe/${classeId}/choisir`, {
      inscription_id: inscriptionId
    });
  }

  remettreEnTraitement(classeId: number, inscriptionId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/inscriptions/classe/${classeId}/remettre-traitement`, {
      inscription_id: inscriptionId
    });
  }

  toggleModeAutomatique(classeId: number, modeAutomatique: boolean): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/inscriptions/classe/${classeId}/mode-auto`, {
      mode_automatique: modeAutomatique
    });
  }

  libererPlace(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/inscriptions/${id}/liberer`, {});
  }

  getDashboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/inscriptions/dashboard`);
  }

  // Parent routes
  getClassesDisponibles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/parent/inscriptions/create`);
  }

  creerInscription(data: InscriptionForm): Observable<any> {
    return this.http.post(`${this.baseUrl}/parent/inscriptions`, data);
  }

  getInscriptionParent(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/parent/inscriptions/${id}`);
  }
}