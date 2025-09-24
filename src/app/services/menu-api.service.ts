// src/app/services/menu-api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MenuItem {
  id?: number;
  description: string;
  ingredients: string;
  date_menu: string;
  type_repas: 'lunch' | 'snack';
  created_at?: string;
  updated_at?: string;
}

export interface MenuResponse {
  success: boolean;
  data: MenuItem | MenuItem[];
  message: string;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface WeeklyMenuParams {
  week_start_date: string;
  type_repas: 'lunch' | 'snack';
}

// CORRECTION: Respecter exactement la structure attendue par le backend Laravel
export interface DailyMenuPayload {
  date_menu: string;
  type: 'lunch' | 'snack' | 'both'; // 'type' au lieu de 'type_repas'
  lunch?: { description: string; ingredients: string };
  snack?: { description: string; ingredients: string };
}

export interface WeeklyMenuPayload {
  week_start_date: string;
  type_repas: 'lunch' | 'snack';
  menus: Array<{ description: string; ingredients: string }>;
}

export interface DuplicateWeeklyMenuPayload {
  source_week_start: string;
  target_week_start: string;
  type_repas: 'lunch' | 'snack';
}

@Injectable({ providedIn: 'root' })
export class MenusApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000/api/admin/menus';

  // Récupérer tous les menus avec filtres optionnels
  getAll(params?: any): Observable<MenuResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    
    return this.http.get<MenuResponse>(this.baseUrl, { params: httpParams });
  }

  // Récupérer un menu par ID
  getById(id: number): Observable<MenuResponse> {
    return this.http.get<MenuResponse>(`${this.baseUrl}/${id}`);
  }

  // Créer un menu quotidien (utilise l'endpoint /day du backend)
  createDaily(payload: DailyMenuPayload): Observable<MenuResponse> {
    console.log('Envoi payload vers /day:', payload);
    return this.http.post<MenuResponse>(`${this.baseUrl}/day`, payload);
  }

  // Mettre à jour un menu existant
  update(id: number, data: Partial<MenuItem>): Observable<MenuResponse> {
    console.log('Mise à jour menu:', id, data);
    return this.http.put<MenuResponse>(`${this.baseUrl}/${id}`, data);
  }

  // Supprimer un menu
  delete(id: number): Observable<MenuResponse> {
    return this.http.delete<MenuResponse>(`${this.baseUrl}/${id}`);
  }

  // Récupérer le menu d'une semaine spécifique
  getWeeklyMenu(params: WeeklyMenuParams): Observable<MenuResponse> {
    const httpParams = new HttpParams()
      .set('week_start_date', params.week_start_date)
      .set('type_repas', params.type_repas);
    
    return this.http.get<MenuResponse>(`${this.baseUrl}/weekly/by-date`, { params: httpParams });
  }

  // Récupérer le menu de la semaine courante
  getCurrentWeekMenu(typeRepas: 'lunch' | 'snack'): Observable<MenuResponse> {
    const httpParams = new HttpParams().set('type_repas', typeRepas);
    return this.http.get<MenuResponse>(`${this.baseUrl}/weekly/current`, { params: httpParams });
  }

  // Créer un menu pour une semaine entière
  createWeeklyMenu(payload: WeeklyMenuPayload): Observable<MenuResponse> {
    console.log('Création menu hebdomadaire:', payload);
    return this.http.post<MenuResponse>(`${this.baseUrl}/weekly`, payload);
  }

  // Dupliquer un menu hebdomadaire vers une autre semaine
  duplicateWeeklyMenu(payload: DuplicateWeeklyMenuPayload): Observable<MenuResponse> {
    console.log('Duplication menu hebdomadaire:', payload);
    return this.http.post<MenuResponse>(`${this.baseUrl}/weekly/duplicate`, payload);
  }

  // Méthodes utilitaires pour faciliter l'usage

  // Créer un menu déjeuner uniquement
  createLunchMenu(date: string, description: string, ingredients: string): Observable<MenuResponse> {
    const payload: DailyMenuPayload = {
      date_menu: date,
      type: 'lunch',
      lunch: { description, ingredients }
    };
    return this.createDaily(payload);
  }

  // Créer un menu goûter uniquement
  createSnackMenu(date: string, description: string, ingredients: string): Observable<MenuResponse> {
    const payload: DailyMenuPayload = {
      date_menu: date,
      type: 'snack',
      snack: { description, ingredients }
    };
    return this.createDaily(payload);
  }

  // Créer les deux menus (déjeuner + goûter) pour une même date
  createBothMenus(
    date: string, 
    lunch: { description: string; ingredients: string },
    snack: { description: string; ingredients: string }
  ): Observable<MenuResponse> {
    const payload: DailyMenuPayload = {
      date_menu: date,
      type: 'both',
      lunch,
      snack
    };
    return this.createDaily(payload);
  }

  // Récupérer les menus d'une période
  getMenusByDateRange(startDate: string, endDate: string, type?: 'lunch' | 'snack'): Observable<MenuResponse> {
    const params: any = {
      date_start: startDate,
      date_end: endDate
    };
    
    if (type) {
      params.type_repas = type;
    }
    
    return this.getAll(params);
  }

  // Rechercher des menus par contenu
  searchMenus(query: string, type?: 'lunch' | 'snack'): Observable<MenuResponse> {
    const params: any = {
      search: query
    };
    
    if (type) {
      params.type_repas = type;
    }
    
    return this.getAll(params);
  }

  // Vérifier si un menu existe pour une date et un type donnés
  checkMenuExists(date: string, type: 'lunch' | 'snack'): Observable<MenuResponse> {
    return this.getAll({
      date_menu: date,
      type_repas: type
    });
  }
}