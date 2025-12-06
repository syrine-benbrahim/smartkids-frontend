// src/app/services/inscription.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InscriptionFormData {
  // Année scolaire et niveau
  annee_scolaire: string;
  niveau_souhaite: string;

  // Parent
  nom_parent: string;
  prenom_parent: string;
  email_parent: string;
  telephone_parent: string;
  adresse_parent?: string;
  profession_parent?: string;

  // Enfant
  nom_enfant: string;
  prenom_enfant: string;
  date_naissance_enfant: string;
  genre_enfant: 'M' | 'F';

  // Médical / docs
  problemes_sante?: string[];
  allergies?: string[];
  medicaments?: string[];
  documents_fournis?: string[];

  // Contact d'urgence
  contact_urgence_nom?: string;
  contact_urgence_telephone?: string;

  remarques?: string;
}

export interface InscriptionResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    statut: string;
    annee_scolaire: string;
    niveau_souhaite: string;
    parent: {
      nom: string;
      prenom: string;
      email: string;
      telephone: string;
    };
    enfant: {
      nom: string;
      prenom: string;
      date_naissance: string;
      genre: string;
    };
    created_at: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {
  private apiUrl = `${environment.apiUrl}/inscriptions`;

  constructor(private http: HttpClient) {}

  /**
   * Soumettre une demande d'inscription publique
   */
  submitInscription(data: InscriptionFormData): Observable<InscriptionResponse> {
    return this.http.post<InscriptionResponse>(this.apiUrl, data);
  }

  /**
   * Obtenir l'année scolaire actuelle
   */
  getCurrentSchoolYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Si on est entre septembre et décembre, l'année commence cette année
    // Sinon elle a commencé l'année précédente
    if (month >= 8) { // Septembre = 8
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  }

  /**
   * Obtenir la prochaine année scolaire
   */
  getNextSchoolYear(): string {
    const current = this.getCurrentSchoolYear();
    const [start] = current.split('-').map(Number);
    return `${start + 1}-${start + 2}`;
  }
}