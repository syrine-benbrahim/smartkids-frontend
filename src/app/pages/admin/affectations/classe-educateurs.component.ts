import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AffectationsApiService, ClasseInfo, EducateurInfo } from '../../../services/affectations-api.service';

@Component({
  selector: 'app-classe-educateurs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4 sm:p-6">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="relative mb-8">
          <div class="card relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10"></div>
            
            <div class="relative flex flex-col lg:flex-row items-center justify-between gap-6">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M7 21h2m3 0h2M7 3h2m3 0h2"/>
                  </svg>
                </div>
                <div *ngIf="classe()">
                  <h1 class="text-3xl font-black text-gray-800 tracking-tight">
                    {{ classe()!.nom }}
                  </h1>
                  <p class="text-gray-600 font-medium">
                    {{ classe()!.niveau }} • Capacité: {{ classe()!.capacite_max }}
                  </p>
                </div>
              </div>
              
              <div class="flex items-center gap-3">
                <span class="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {{ educateurs().length }} éducateur(s)
                </span>
                <button 
                  class="btn-secondary bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl border border-gray-300 font-medium shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2"
                  routerLink="/admin/classes"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M7 21h2m3 0h2M7 3h2m3 0h2"/>
                  </svg>
                  Classes
                </button>
                <button 
                  class="btn-primary bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                  routerLink="/admin/affectations"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                  </svg>
                  Retour Affectations
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Section d'ajout d'éducateur -->
        <div class="card mb-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-800">Assigner un éducateur</h2>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 items-end">
            <div class="flex-1 space-y-2">
              <label class="text-sm font-bold text-gray-700">Éducateur disponible</label>
              <select 
                [(ngModel)]="selectedEducateurId"
                class="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 bg-white font-medium transition-all duration-200"
              >
                <option value="">Sélectionner un éducateur</option>
                <option *ngFor="let educateur of availableEducateurs()" [value]="educateur.id">
                  {{ educateur.nom }} - {{ educateur.diplome }}
                </option>
              </select>
            </div>

            <button 
              class="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              (click)="assignEducateur()"
              [disabled]="!selectedEducateurId"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Assigner
            </button>
          </div>
        </div>

        <!-- Message -->
        <div *ngIf="message()" class="mb-6">
          <div [class]="message()!.type === 'success' ? 'p-4 bg-green-50 border-2 border-green-200 rounded-2xl' : 'p-4 bg-red-50 border-2 border-red-200 rounded-2xl'">
            <div class="flex items-center gap-3">
              <div [class]="message()!.type === 'success' ? 'w-6 h-6 bg-green-500 rounded-full flex items-center justify-center' : 'w-6 h-6 bg-red-500 rounded-full flex items-center justify-center'">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path *ngIf="message()!.type === 'success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  <path *ngIf="message()!.type === 'error'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
              <p [class]="message()!.type === 'success' ? 'text-green-700 font-medium' : 'text-red-700 font-medium'">{{ message()!.text }}</p>
            </div>
          </div>
        </div>

        <!-- Liste des éducateurs -->
        <div class="card">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-800">Éducateurs assignés</h2>
          </div>

          <div *ngIf="loading()" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>

          <div *ngIf="!loading() && educateurs().length === 0" class="text-center py-12">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <h3 class="text-xl font-semibold text-gray-600 mb-2">Aucun éducateur assigné</h3>
            <p class="text-gray-500">Cette classe n'a pas encore d'éducateur assigné</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div *ngFor="let educateur of educateurs(); trackBy: trackByEducateurId" 
                 class="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
              
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-md">
                    <span class="text-white font-bold text-lg">{{ educateur.nom.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-gray-800">{{ educateur.nom }}</h3>
                    <p class="text-gray-600 text-sm">{{ educateur.email }}</p>
                  </div>
                </div>

                <button 
                  class="text-red-600 hover:text-red-700 p-2 rounded-xl hover:bg-red-50 transition-all duration-200"
                  (click)="removeEducateur(educateur.id)"
                  title="Retirer de la classe"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>

              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
                  </svg>
                  <span class="text-sm text-gray-700">{{ educateur.diplome || 'Diplôme non renseigné' }}</span>
                </div>

                <div *ngIf="educateur.assigned_at" class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-1 8v6m-6-6v6M5 9h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2z"/>
                  </svg>
                  <span class="text-sm text-gray-600">Assigné le {{ formatDate(educateur.assigned_at) }}</span>
                </div>
              </div>

              <div class="mt-4 pt-3 border-t border-gray-200">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span class="text-xs text-gray-500 font-medium">ACTIF</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ClasseEducateursComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private affectationsApi = inject(AffectationsApiService);

  loading = signal(false);
  classe = signal<ClasseInfo | null>(null);
  educateurs = signal<EducateurInfo[]>([]);
  availableEducateurs = signal<EducateurInfo[]>([]);
  message = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  classeId: number = 0;
  selectedEducateurId: string = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.classeId = +id;
      this.loadClasseEducateurs();
      this.loadAvailableEducateurs();
    }
  }

  loadClasseEducateurs() {
    this.loading.set(true);
    this.affectationsApi.getEducateursByClasse(this.classeId).subscribe({
      next: (response) => {
        if (response.success) {
          this.classe.set(response.data.classe);
          this.educateurs.set(response.data.educateurs);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
        this.showMessage('error', 'Erreur lors du chargement des données');
        this.loading.set(false);
      }
    });
  }

  loadAvailableEducateurs() {
    this.affectationsApi.getAvailableEducateurs(this.classeId).subscribe({
      next: (response) => {
        if (response.success) {
          this.availableEducateurs.set(response.data.educateurs_disponibles);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des éducateurs disponibles:', error);
      }
    });
  }

  assignEducateur() {
    if (!this.selectedEducateurId) {
      this.showMessage('error', 'Veuillez sélectionner un éducateur');
      return;
    }

    this.affectationsApi.assignEducateur({
      classe_id: this.classeId,
      educateur_id: +this.selectedEducateurId
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage('success', response.message);
          this.selectedEducateurId = '';
          this.loadClasseEducateurs();
          this.loadAvailableEducateurs();
        }
      },
      error: (error) => {
        console.error('Erreur lors de l\'assignation:', error);
        this.showMessage('error', error.error?.message || 'Erreur lors de l\'assignation');
      }
    });
  }

  removeEducateur(educateurId: number) {
    if (!confirm('Êtes-vous sûr de vouloir retirer cet éducateur de cette classe ?')) {
      return;
    }

    this.affectationsApi.removeEducateur({
      educateur_id: educateurId,
      classe_id: this.classeId
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage('success', response.message);
          this.loadClasseEducateurs();
          this.loadAvailableEducateurs();
        }
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.showMessage('error', 'Erreur lors de la suppression de l\'affectation');
      }
    });
  }

  showMessage(type: 'success' | 'error', text: string) {
    this.message.set({ type, text });
    setTimeout(() => {
      this.message.set(null);
    }, 5000);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  trackByEducateurId(index: number, item: EducateurInfo): number {
    return item.id;
  }
}