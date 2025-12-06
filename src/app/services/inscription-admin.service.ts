import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type InscriptionStatut = 'pending' | 'accepted' | 'rejected' | 'waiting' | 'payment_pending';

export interface Inscription {
  id: number;
  statut: InscriptionStatut;
  niveau_souhaite: string | number;
  annee_scolaire: string;
  date_inscription: string;
  parent: {
    id?: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    adresse?: string;
    profession?: string;
  };
  enfant: {
    nom: string;
    prenom: string;
    date_naissance: string;
    genre: string;
    allergies?: string;
  };
  classe_id?: number;
  classe?: {
    id: number;
    nom: string;
    niveau: number;
  };
  remarques?: string;
  remarques_admin?: string;
  created_at: string;
  date_traitement?: string;
  traite_par_admin_id?: number;
}

export interface ClasseDisponible {
  id: number;
  nom: string;
  niveau: number;
  capacite_max: number;
  places_occupees: number;
  places_disponibles: number | null;
  description?: string;
  taux_occupation: number;
}

export interface InscriptionDecision {
  action: 'accept' | 'wait' | 'reject';
  classe_id?: number;
  frais_inscription?: number;
  frais_mensuel?: number;
  remarques?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class InscriptionAdminService {
  private apiUrl = `${environment.apiUrl}/admin/inscriptions`;

  constructor(private http: HttpClient) {}

  private static readonly NIVEAU_MAP: { [key: string]: number } = {
    'petite_section': 1,
    'moyenne_section': 2,
    'grande_section': 3,
    'cp': 4,
    'ce1': 5,
    'ce2': 6,
    'cm1': 7,
    'cm2': 8,
  };

  private static readonly NIVEAU_LABELS: { [key: number]: string } = {
    1: 'Petite Section',
    2: 'Moyenne Section',
    3: 'Grande Section',
    4: 'CP',
    5: 'CE1',
    6: 'CE2',
    7: 'CM1',
    8: 'CM2',
  };

  private static readonly STATUT_LABELS: { [key in InscriptionStatut]: string } = {
    'pending': 'En attente',
    'accepted': 'Acceptée',
    'rejected': 'Refusée',
    'waiting': 'Liste d\'attente',
    'payment_pending': 'Paiement en attente'
  };

  private static readonly STATUT_CLASSES: { [key in InscriptionStatut]: string } = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'accepted': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'waiting': 'bg-blue-100 text-blue-800',
    'payment_pending': 'bg-orange-100 text-orange-800'
  };

  private mapNiveauToInt(niveau: string | number): number {
    if (typeof niveau === 'number') {
      return niveau;
    }
    
    const normalized = niveau.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/-/g, '_');
    
    return InscriptionAdminService.NIVEAU_MAP[normalized] || 1;
  }

  getInscriptions(params?: {
    statut?: string;
    niveau?: string;
    classe_id?: number;
    page?: number;
  }): Observable<ApiResponse<PaginatedResponse<Inscription>>> {
    let httpParams = new HttpParams();
    
    if (params?.statut) httpParams = httpParams.set('statut', params.statut);
    if (params?.niveau) httpParams = httpParams.set('niveau', params.niveau);
    if (params?.classe_id) httpParams = httpParams.set('classe_id', params.classe_id.toString());
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());

    return this.http.get<ApiResponse<PaginatedResponse<Inscription>>>(
      this.apiUrl, 
      { params: httpParams }
    );
  }

  getInscription(id: number): Observable<ApiResponse<Inscription>> {
    return this.http.get<ApiResponse<Inscription>>(`${this.apiUrl}/${id}`);
  }

  getClassesDisponibles(
    niveau: string | number,
    anneeScolaire: string
  ): Observable<ApiResponse<ClasseDisponible[]>> {
    const niveauInt = this.mapNiveauToInt(niveau);
    
    const params = new HttpParams()
      .set('niveau', niveauInt.toString())
      .set('annee_scolaire', anneeScolaire);

    return this.http.get<ApiResponse<ClasseDisponible[]>>(
      `${this.apiUrl}/classes-disponibles`,
      { params }
    );
  }

  decideInscription(
    id: number,
    decision: InscriptionDecision
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/${id}/decide`,
      decision
    );
  }

  acceptInscription(
    id: number,
    data: {
      classe_id?: number;
      frais_inscription?: number;
      frais_mensuel?: number;
      remarques?: string;
    }
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/${id}/accept`,
      data
    );
  }

  waitInscription(
    id: number,
    remarques?: string
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/${id}/wait`,
      { remarques }
    );
  }

  rejectInscription(
    id: number,
    remarques?: string
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/${id}/reject`,
      { remarques }
    );
  }

  assignClass(id: number, classeId: number): Observable<ApiResponse<Inscription>> {
    return this.http.post<ApiResponse<Inscription>>(
      `${this.apiUrl}/${id}/assign-class`,
      { classe_id: classeId }
    );
  }

  static getNiveauLabelShort(niveau: string | number): string {
    if (typeof niveau === 'number') {
      return InscriptionAdminService.NIVEAU_LABELS[niveau] || `Niveau ${niveau}`;
    }
    
    const normalized = niveau.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
    const niveauInt = InscriptionAdminService.NIVEAU_MAP[normalized];
    
    if (niveauInt) {
      return InscriptionAdminService.NIVEAU_LABELS[niveauInt];
    }
    
    return niveau;
  }

  static getStatutLabel(statut: InscriptionStatut): string {
    return InscriptionAdminService.STATUT_LABELS[statut] || statut;
  }

  static getStatutClass(statut: InscriptionStatut): string {
    return InscriptionAdminService.STATUT_CLASSES[statut] || 'bg-gray-100 text-gray-800';
  }

  static formatAge(dateNaissance: string): string {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return `${age} ans`;
  }

  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  static getNiveauxDisponibles(): Array<{ value: number; label: string }> {
    return Object.entries(InscriptionAdminService.NIVEAU_LABELS).map(([value, label]) => ({
      value: parseInt(value),
      label
    }));
  }
}