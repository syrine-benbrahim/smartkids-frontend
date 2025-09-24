import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AffectationsApiService, AffectationResumeItem, AffectationsStats, EducateurInfo } from '../../../services/affectations-api.service';
import { ClassesApiService } from '../../../services/classes-api.service';

@Component({
  selector: 'app-affectations-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4 sm:p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="relative mb-8">
          <div class="absolute -top-4 -left-4 w-16 h-16 bg-yellow-300 rounded-full opacity-60 animate-bounce"></div>
          <div class="absolute -top-2 right-10 w-12 h-12 bg-pink-300 rounded-full opacity-60 animate-bounce" style="animation-delay: 0.5s;"></div>
          
          <div class="card relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10"></div>
            
            <div class="relative flex flex-col lg:flex-row items-center justify-between gap-6">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <div>
                  <h1 class="text-3xl font-black text-gray-800 tracking-tight">
                    Gestion des Affectations
                  </h1>
                  <p class="text-gray-600 font-medium">
                    Assignez les éducateurs aux classes
                  </p>
                </div>
              </div>
              
              <div class="flex items-center gap-3">
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
                  class="btn-secondary bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl border border-gray-300 font-medium shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2"
                  routerLink="/admin/educateurs"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  Éducateurs
                </button>
                <button 
                  class="btn-primary bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                  routerLink="/admin"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                  </svg>
                  Retour Admin
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistiques -->
        <div *ngIf="stats()" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M7 21h2m3 0h2M7 3h2m3 0h2"/>
                </svg>
              </div>
              <div>
                <div class="text-2xl font-bold text-blue-700">{{ stats()?.total_classes }}</div>
                <div class="text-sm text-blue-600 font-medium">Classes totales</div>
              </div>
            </div>
          </div>

          <div class="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div>
                <div class="text-2xl font-bold text-green-700">{{ stats()?.total_educateurs }}</div>
                <div class="text-sm text-green-600 font-medium">Éducateurs totaux</div>
              </div>
            </div>
          </div>

          <div class="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                </svg>
              </div>
              <div>
                <div class="text-2xl font-bold text-purple-700">{{ stats()?.total_affectations }}</div>
                <div class="text-sm text-purple-600 font-medium">Affectations actives</div>
              </div>
            </div>
          </div>

          <div class="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <div class="text-2xl font-bold text-orange-700">{{ stats()?.educateurs_assignes }}</div>
                <div class="text-sm text-orange-600 font-medium">Éducateurs assignés</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section d'affectation rapide -->
        <div class="card mb-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-800">Nouvelle Affectation</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div class="space-y-2">
              <label class="text-sm font-bold text-gray-700">Classe</label>
              <select 
                [(ngModel)]="assignForm.classe_id"
                class="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 bg-white font-medium transition-all duration-200"
                (change)="onClasseSelect()"
              >
                <option value="">Sélectionner une classe</option>
                <option *ngFor="let classe of classes()" [value]="classe.id">
                  {{ classe.nom }} (Niveau {{ classe.niveau }})
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-bold text-gray-700">Éducateur disponible</label>
              <select 
                [(ngModel)]="assignForm.educateur_id"
                class="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 bg-white font-medium transition-all duration-200"
              >
                <option value="">Sélectionner un éducateur</option>
                <option *ngFor="let educateur of availableEducateurs()" [value]="educateur.id">
                  {{ educateur.nom }}
                </option>
              </select>
            </div>

            <button 
              class="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              (click)="assignEducateur()"
              [disabled]="!assignForm.classe_id || !assignForm.educateur_id"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Assigner
            </button>
          </div>
        </div>

        <!-- Messages -->
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

        <!-- Liste des affectations -->
        <div class="space-y-6">
          <div *ngFor="let affectation of affectations(); trackBy: trackByClasseId" class="card">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M7 21h2m3 0h2M7 3h2m3 0h2"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-800">{{ affectation.classe.nom }}</h3>
                  <p class="text-gray-600">Niveau {{ affectation.classe.niveau }} • Capacité: {{ affectation.classe.capacite_max }}</p>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {{ affectation.nombre_educateurs }} éducateur(s)
                </span>
                <button 
                  class="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                  [routerLink]="['/admin/classes', affectation.classe.id, 'educateurs']"
                  title="Voir détails"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="space-y-3">
              <div *ngFor="let educateur of affectation.educateurs; trackBy: trackByEducateurId" 
                   class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                    <span class="text-white font-bold text-sm">{{ educateur.nom.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div>
                    <div class="font-semibold text-gray-800">{{ educateur.nom }}</div>
                    <div class="text-sm text-gray-600">{{ educateur.email }}</div>
                    <div class="text-xs text-gray-500">{{ educateur.diplome }}</div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <span *ngIf="educateur.assigned_at" class="text-xs text-gray-500">
                    Assigné le {{ formatDate(educateur.assigned_at) }}
                  </span>
                  <button 
                    class="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    (click)="removeEducateur(educateur.id, affectation.classe.id)"
                    title="Retirer de la classe"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div *ngIf="affectation.educateurs.length === 0" class="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                <svg class="w-8 h-8 text-yellow-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.64 0L4.175 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
                <p class="text-yellow-700 font-medium">Aucun éducateur assigné à cette classe</p>
              </div>
            </div>
          </div>
        </div>

        <!-- État de chargement -->
        <div *ngIf="loading()" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>

        <!-- Message vide -->
        <div *ngIf="!loading() && affectations().length === 0" class="card text-center py-12">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m14 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m14 0H6m14 0l-2-2m0 0l-2 2m2-2v2M6 13l2-2m0 0l2 2m-2-2v2"/>
          </svg>
          <h3 class="text-xl font-semibold text-gray-600 mb-2">Aucune affectation trouvée</h3>
          <p class="text-gray-500">Commencez par assigner des éducateurs aux classes</p>
        </div>
      </div>
    </div>
  `
})
export class AffectationsManagementComponent implements OnInit {
  private affectationsApi = inject(AffectationsApiService);
  private classesApi = inject(ClassesApiService);

  loading = signal(false);
  affectations = signal<AffectationResumeItem[]>([]);
  stats = signal<AffectationsStats | null>(null);
  classes = signal<Array<{ id: number; nom: string; niveau: number }>>([]);
  availableEducateurs = signal<EducateurInfo[]>([]);
  message = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  assignForm = {
    classe_id: '',
    educateur_id: ''
  };

  ngOnInit() {
    this.loadData();
    this.loadClasses();
  }

  loadData() {
    this.loading.set(true);
    this.affectationsApi.getAffectationsResume().subscribe({
      next: (response) => {
        if (response.success) {
          this.affectations.set(response.data.affectations);
          this.stats.set(response.data.statistiques);
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

  loadClasses() {
    this.classesApi.listSimple().subscribe({
      next: (response) => {
        if (response.success) {
          this.classes.set(response.data);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des classes:', error);
      }
    });
  }

  onClasseSelect() {
    if (this.assignForm.classe_id) {
      this.affectationsApi.getAvailableEducateurs(+this.assignForm.classe_id).subscribe({
        next: (response) => {
          if (response.success) {
            this.availableEducateurs.set(response.data.educateurs_disponibles);
          }
        },
        error: (error) => {
          console.error('Erreur lors du chargement des éducateurs disponibles:', error);
        }
      });
    } else {
      this.availableEducateurs.set([]);
    }
    this.assignForm.educateur_id = '';
  }

  assignEducateur() {
    if (!this.assignForm.classe_id || !this.assignForm.educateur_id) {
      this.showMessage('error', 'Veuillez sélectionner une classe et un éducateur');
      return;
    }

    this.affectationsApi.assignEducateur({
      classe_id: +this.assignForm.classe_id,
      educateur_id: +this.assignForm.educateur_id
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage('success', response.message);
          this.assignForm = { classe_id: '', educateur_id: '' };
          this.availableEducateurs.set([]);
          this.loadData();
        }
      },
      error: (error) => {
        console.error('Erreur lors de l\'assignation:', error);
        this.showMessage('error', error.error?.message || 'Erreur lors de l\'assignation');
      }
    });
  }

  removeEducateur(educateurId: number, classeId: number) {
    if (!confirm('Êtes-vous sûr de vouloir retirer cet éducateur de cette classe ?')) {
      return;
    }

    this.affectationsApi.removeEducateur({
      educateur_id: educateurId,
      classe_id: classeId
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage('success', response.message);
          this.loadData();
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

  trackByClasseId(index: number, item: AffectationResumeItem): number {
    return item.classe.id;
  }

  trackByEducateurId(index: number, item: EducateurInfo): number {
    return item.id;
  }
}