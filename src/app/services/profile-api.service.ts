import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BaseProfile {
    id: number;
    name: string;
    email: string;
    password?: string;
    current_password?: string;
}

export interface ParentProfile extends BaseProfile {
    nom: string;
    prenom: string;
    profession: string;
    telephone: string;
    adresse: string;
    contact_urgence_nom: string;
    contact_urgence_telephone: string;
    password_confirmation?: string;
}

export interface EducateurProfile extends BaseProfile {
    diplome: string;
    telephone: string;
    photo: string;
    date_embauche: string; // Read-only in UI
    salaire: number; // Read-only in UI
}

@Injectable({
    providedIn: 'root'
})
export class ProfileApiService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiUrl;

    getAdminProfile(): Observable<any> {
        return this.http.get(`${this.baseUrl}/auth/me`);
    }

    getEducateurProfile(): Observable<any> {
        return this.http.get(`${this.baseUrl}/educateur/profile`);
    }

    getParentProfile(): Observable<any> {
        return this.http.get(`${this.baseUrl}/parent/profile`);
    }

    updateParentProfile(data: Partial<ParentProfile>): Observable<any> {
        return this.http.post(`${this.baseUrl}/parent/profile`, data);
    }

    updateEducateurProfile(data: Partial<EducateurProfile>): Observable<any> {
        return this.http.post(`${this.baseUrl}/educateur/profile`, data);
    }
}
