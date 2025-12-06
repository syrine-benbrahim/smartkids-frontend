import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MenuDuJour {
  id: number;
  description: string;
  ingredients: string;
}

export interface MenuSemaine {
  date_menu: string;
  lunch: MenuDuJour | null;
  snack: MenuDuJour | null;
}

export interface MenuWeekResponse {
  success: boolean;
  data: MenuSemaine[];
  message: string;
}

@Injectable({ providedIn: 'root' })
export class MenuParentService {
  private http = inject(HttpClient);
  // Utiliser la configuration centralisée
  private baseUrl = `${environment.apiUrl}/parent/menus`;

  getCurrentWeekMenu(type?: 'lunch' | 'snack'): Observable<MenuWeekResponse> {
    let params = new HttpParams();
    if (type) {
      params = params.set('type_repas', type);
    }
    
    return this.http.get<MenuWeekResponse>(`${this.baseUrl}/weekly/current`, { params });
  }

  getMenuByDate(date: string, type?: 'lunch' | 'snack'): Observable<MenuWeekResponse> {
    let params = new HttpParams().set('date_menu', date);
    if (type) {
      params = params.set('type_repas', type);
    }
    
    return this.http.get<MenuWeekResponse>(`${this.baseUrl}/weekly/current`, { params });
  }
}