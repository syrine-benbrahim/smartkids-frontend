// src/app/services/emploi.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EmploiSlot {
  id: number;
  emploi_template_id: number;
  jour_semaine: number;
  debut: string;
  fin: string;
  matiere_id: number;
  educateur_id: number;
  salle_id: number | null;
  status: 'planned' | 'locked' | 'cancelled';
  matiere_nom: string;
  matiere_photo?: string;
  educateur_nom: string;
  salle_code?: string;
  salle_nom?: string;
  classe_niveau?: string;
  classe_nom?: string;
  created_at: string;
  updated_at: string;
}

export interface EmploiTemplate {
  id: number;
  classe_id: number;
  classe_nom?: string;
  period_start: string;
  period_end: string;
  effective_from: string;
  status: 'draft' | 'published';
  version: number;
  generated_by: number;
  created_at: string;
  updated_at: string;
  slots: EmploiSlot[];
}

export interface BatchGenerationResult {
  success: boolean;
  templates: {
    classe_id: number;
    template_id: number;
    slots: number;
    unplaced: number;
  }[];
}

export interface GenerationRequest {
  classe_id?: number;
  classe_ids?: number[];
  period_start: string;
  period_end: string;
  effective_from: string;
}

export interface SlotUpdateRequest {
  jour_semaine?: number;
  debut?: string;
  fin?: string;
  matiere_id?: number;
  educateur_id?: number;
  salle_id?: number | null;
  status?: 'planned' | 'locked' | 'cancelled';
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class EmploiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;

  // Génération d'emplois
  generateEmploi(request: GenerationRequest): Observable<ApiResponse<EmploiTemplate>> {
    return this.http.post<ApiResponse<EmploiTemplate>>(
      `${this.apiUrl}/admin/emploi-templates/generate`,
      request
    );
  }

  generateAllEmplois(request: GenerationRequest): Observable<BatchGenerationResult> {
    return this.http.post<BatchGenerationResult>(
      `${this.apiUrl}/admin/emplois/generate-all`,
      request
    );
  }

  // Lecture des emplois
  getEmploiByClasse(classeId: number, weekStart?: string): Observable<ApiResponse<EmploiSlot[]>> {
    let params = new HttpParams();
    if (weekStart) {
      params = params.set('week_start', weekStart);
    }
    
    return this.http.get<ApiResponse<EmploiSlot[]>>(
      `${this.apiUrl}/emplois/classe/${classeId}`,
      { params }
    );
  }

  getActiveTemplateForClasse(classeId: number): Observable<ApiResponse<EmploiTemplate>> {
    return this.http.get<ApiResponse<EmploiTemplate>>(
      `${this.apiUrl}/emplois/classe/${classeId}/template-active`
    );
  }

  getTemplate(templateId: number): Observable<ApiResponse<EmploiTemplate>> {
    return this.http.get<ApiResponse<EmploiTemplate>>(
      `${this.apiUrl}/admin/emploi-templates/${templateId}`
    );
  }

  // Gestion des templates
  publishTemplate(templateId: number): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.apiUrl}/admin/emploi-templates/${templateId}/publish`,
      {}
    );
  }

  archiveTemplate(templateId: number): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.apiUrl}/admin/emploi-templates/${templateId}/archive`,
      {}
    );
  }

  deleteTemplate(templateId: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/admin/emploi-templates/${templateId}`
    );
  }

  // Gestion des slots
  updateSlot(templateId: number, slotId: number, data: SlotUpdateRequest): Observable<ApiResponse<EmploiSlot>> {
    return this.http.patch<ApiResponse<EmploiSlot>>(
      `${this.apiUrl}/admin/emploi-templates/${templateId}/slots/${slotId}`,
      data
    );
  }

  lockSlot(templateId: number, slotId: number): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.apiUrl}/admin/emploi-templates/${templateId}/slots/${slotId}/lock`,
      {}
    );
  }

  unlockSlot(templateId: number, slotId: number): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.apiUrl}/admin/emploi-templates/${templateId}/slots/${slotId}/unlock`,
      {}
    );
  }

  deleteSlot(templateId: number, slotId: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/admin/emploi-templates/${templateId}/slots/${slotId}`
    );
  }

  // Export PDF
  exportToPDF(templateId: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/admin/emploi-templates/${templateId}/export-pdf`,
      { responseType: 'blob' }
    );
  }

  // Utilitaires
  getJourName(jour: number): string {
    const jours = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return jours[jour] || '';
  }

  formatTime(time: string): string {
    return time.substring(0, 5); // HH:MM
  }

  getStatusLabel(status: string): string {
    const statuses: Record<string, string> = {
      'planned': 'Planifié',
      'locked': 'Verrouillé',
      'cancelled': 'Annulé',
      'draft': 'Brouillon',
      'published': 'Publié'
    };
    return statuses[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'planned': 'bg-blue-100 text-blue-800',
      'locked': 'bg-orange-100 text-orange-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
}