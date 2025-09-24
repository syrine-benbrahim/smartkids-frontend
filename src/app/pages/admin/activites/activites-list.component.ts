import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ActivitesApiService, Activite, ActiviteFilters, ApiResponse } from '../../../services/activites-api.service';

@Component({
  selector: 'app-activites-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4 sm:p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="relative mb-8">
          <div class="card relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-purple-500/10"></div>
            
            <div class="relative flex flex-col lg:flex-row items-center justify-between gap-6">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a4 4 0 014 4v1a2 2 0 002 2 2 2 0 002-2v-1a4 4 0 014-4h1m-1-4a2 2 0 012 2v3a2 2 0 01-2 2h-1a4 4 0 00-4 4v1a2 2 0 01-2 2 2 2 0 01-2-2v-1a4 4 0 00-4-4H6a2 2 0 01-2-2V7a2 2 0 012-2 2 2 0 012 2v1a4 4 0 004 4z"/>
                  </svg>
                </div>
                <div>
                  <h1 class="text-3xl font-black text-gray-800 tracking-tight">
                    Gestion des Activités
                  </h1>
                  <p class="text-gray-600 font-medium">
                    Planifiez et organisez les activités pédagogiques
                  </p>
                </div>
              </div>
              
              <div class="flex gap-4">
                <button 
                  class="btn-secondary bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                  routerLink="/admin"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                  </svg>
                  Retour
                </button>
                
                <button 
                  class="btn-primary bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-teal-200 hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                  routerLink="/admin/activites/create"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  Nouvelle Activité
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtres -->
        <div class="card mb-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800">Filtres et recherche</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Recherche -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Recherche</label>
              <input
                class="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                [(ngModel)]="filters.search"
                placeholder="Nom d'activité..."
                (input)="onFilterChange()"
              />
            </div>

            <!-- Type -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Type</label>
              <select
                class="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                [(ngModel)]="filters.type"
                (change)="onFilterChange()"
              >
                <option value="">Tous les types</option>
                <option *ngFor="let type of types()" [value]="type">{{ getTypeName(type) }}</option>
              </select>
            </div>

            <!-- Statut -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Statut</label>
              <select
                class="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                [(ngModel)]="filters.statut"
                (change)="onFilterChange()"
              >
                <option value="">Tous les statuts</option>
                <option value="planifiee">Planifiée</option>
                <option value="en_cours">En cours</option>
                <option value="terminee">Terminée</option>
                <option value="annulee">Annulée</option>
              </select>
            </div>

            <!-- Date -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Date début</label>
              <input
                type="date"
                class="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                [(ngModel)]="filters.date_debut"
                (change)="onFilterChange()"
              />
            </div>
          </div>

          <div class="flex justify-between items-center mt-4">
            <button
              class="text-gray-500 hover:text-gray-700 font-medium"
              (click)="clearFilters()"
            >
              Effacer les filtres
            </button>
            
            <div class="text-sm text-gray-600">
              {{ meta()?.total || 0 }} activité(s) trouvée(s)
            </div>
          </div>
        </div>

        <!-- Messages -->
        <div *ngIf="error()" class="card bg-red-50 border-red-200 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </div>
            <p class="text-red-700 font-medium">{{ error() }}</p>
          </div>
        </div>

        <div *ngIf="successMessage()" class="card bg-green-50 border-green-200 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <p class="text-green-700 font-medium">{{ successMessage() }}</p>
          </div>
        </div>

        <!-- Liste des activités -->
        <div *ngIf="loading()" class="text-center py-12">
          <div class="inline-flex items-center gap-3">
            <div class="w-6 h-6 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin"></div>
            <span class="text-gray-600 font-medium">Chargement des activités...</span>
          </div>
        </div>

        <div *ngIf="!loading() && activites().length === 0" class="card text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a4 4 0 014 4v1a2 2 0 002 2 2 2 0 002-2v-1a4 4 0 014-4h1m-1-4a2 2 0 012 2v3a2 2 0 01-2 2h-1a4 4 0 00-4 4v1a2 2 0 01-2 2 2 2 0 01-2-2v-1a4 4 0 00-4-4H6a2 2 0 01-2-2V7a2 2 0 012-2 2 2 0 012 2v1a4 4 0 004 4z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">Aucune activité trouvée</h3>
          <p class="text-gray-600 mb-6">Créez votre première activité pour commencer</p>
          <button 
            class="btn-primary bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg"
            routerLink="/admin/activites/create"
          >
            Créer une activité
          </button>
        </div>

        <div *ngIf="!loading() && activites().length > 0" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div *ngFor="let activite of activites(); trackBy: trackByActivite" 
               class="card hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
            
            <!-- Image ou placeholder -->
            <div class="h-48 overflow-hidden rounded-2xl mb-4 bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center">
              <img *ngIf="activite.image" 
                   [src]="getImageUrl(activite.image)" 
                   [alt]="activite.nom"
                   class="w-full h-full object-cover">
              <div *ngIf="!activite.image" class="text-center">
                <svg class="w-12 h-12 text-teal-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a4 4 0 014 4v1a2 2 0 002 2 2 2 0 002-2v-1a4 4 0 014-4h1m-1-4a2 2 0 012 2v3a2 2 0 01-2 2h-1a4 4 0 00-4 4v1a2 2 0 01-2 2 2 2 0 01-2-2v-1a4 4 0 00-4-4H6a2 2 0 01-2-2V7a2 2 0 012-2 2 2 0 012 2v1a4 4 0 004 4z"/>
                </svg>
                <p class="text-teal-600 font-medium">{{ getTypeName(activite.type || 'autre') }}</p>
              </div>
            </div>

            <!-- Contenu -->
            <div class="space-y-4">
              <!-- Titre et statut -->
              <div class="flex items-start justify-between gap-2">
                <h3 class="text-xl font-bold text-gray-800 leading-tight">{{ activite.nom }}</h3>
                <span [class]="getStatutClass(activite.statut)" class="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                  {{ getStatutName(activite.statut) }}
                </span>
              </div>

              <!-- Description -->
              <p *ngIf="activite.description" class="text-gray-600 text-sm line-clamp-2">
                {{ activite.description }}
              </p>

              <!-- Détails -->
              <div class="space-y-2">
                <div class="flex items-center gap-2 text-sm text-gray-700">
                  <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span class="font-medium">{{ formatDate(activite.date_activite) }}</span>
                </div>
                
                <div class="flex items-center gap-2 text-sm text-gray-700">
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span class="font-medium">{{ activite.heure_debut }} - {{ activite.heure_fin }}</span>
                </div>

                <div *ngIf="activite.type" class="flex items-center gap-2 text-sm text-gray-700">
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                  <span class="font-medium">{{ getTypeName(activite.type) }}</span>
                </div>

                <div *ngIf="activite.prix" class="flex items-center gap-2 text-sm text-gray-700">
                  <svg class="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                  <span class="font-medium">{{ activite.prix }}€</span>
                </div>

                <div *ngIf="activite.capacite_max" class="flex items-center gap-2 text-sm text-gray-700">
                  <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <span class="font-medium">Max {{ activite.capacite_max }} enfants</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  class="flex-1 bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                  (click)="editActivite(activite)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Modifier
                </button>
                
                <button
                  class="bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                  (click)="confirmDelete(activite)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div *ngIf="!loading() && activites().length > 0 && meta()" class="card mt-8">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-600">
              Affichage {{ ((meta()!.current_page - 1) * meta()!.per_page) + 1 }} à 
              {{ getDisplayedCount() }} 
              sur {{ meta()!.total }} activités
            </div>
            
            <div class="flex items-center gap-2">
              <button
                [disabled]="meta()!.current_page <= 1"
                (click)="changePage(meta()!.current_page - 1)"
                class="px-4 py-2 rounded-xl border-2 border-gray-200 hover:border-teal-400 hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
              >
                Précédent
              </button>
              
              <span class="px-4 py-2 bg-teal-100 text-teal-800 rounded-xl font-bold">
                {{ meta()!.current_page }} / {{ meta()!.last_page }}
              </span>
              
              <button
                [disabled]="meta()!.current_page >= meta()!.last_page"
                (click)="changePage(meta()!.current_page + 1)"
                class="px-4 py-2 rounded-xl border-2 border-gray-200 hover:border-teal-400 hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>

        <!-- Modal de confirmation de suppression -->
        <div *ngIf="showDeleteModal()" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div class="text-center">
              <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">Confirmer la suppression</h3>
              <p class="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer l'activité <strong>{{ activiteToDelete()?.nom }}</strong> ? 
                Cette action est irréversible.
              </p>
              
              <div class="flex gap-4">
                <button
                  class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-2xl font-bold transition-colors"
                  (click)="cancelDelete()"
                >
                  Annuler
                </button>
                <button
                  class="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-bold transition-colors"
                  (click)="deleteActivite()"
                  [disabled]="deleting()"
                >
                  {{ deleting() ? 'Suppression...' : 'Supprimer' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      @apply bg-white rounded-3xl shadow-lg border border-gray-200 p-6;
    }
    
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ActivitesListComponent implements OnInit {
  private api = inject(ActivitesApiService);
  private router = inject(Router);

  // Signals pour l'état
  activites = signal<Activite[]>([]);
  meta = signal<any>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  types = signal<string[]>(['musique', 'peinture', 'sport', 'lecture', 'sortie', 'autre']);
  
  // Modal de suppression
  showDeleteModal = signal(false);
  activiteToDelete = signal<Activite | null>(null);
  deleting = signal(false);

  // Filtres
  filters: ActiviteFilters = {
    search: '',
    type: '',
    statut: '',
    date_debut: '',
    per_page: 12
  };

  private filterTimeout: any;
  private currentPage = 1;

  ngOnInit() {
    this.loadActivites();
    this.loadTypes();
  }

  private loadActivites() {
    this.loading.set(true);
    this.error.set(null);

    const params = { ...this.filters, page: this.currentPage };
    
    this.api.getAll(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.activites.set(response.data);
          this.meta.set(response.meta);
        } else {
          this.error.set(response.message || 'Erreur lors du chargement des activités');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur API:', err);
        this.error.set('Erreur lors du chargement des activités');
        this.loading.set(false);
      }
    });
  }

  private loadTypes() {
    this.api.getTypes().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.types.set(response.data);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des types:', err);
      }
    });
  }

  onFilterChange() {
    // Debounce pour éviter trop de requêtes
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
    
    this.filterTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadActivites();
    }, 300);
  }

  clearFilters() {
    this.filters = {
      search: '',
      type: '',
      statut: '',
      date_debut: '',
      per_page: 12
    };
    this.currentPage = 1;
    this.loadActivites();
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadActivites();
  }

  trackByActivite(index: number, activite: Activite): number {
    return activite.id;
  }

  editActivite(activite: Activite) {
    this.router.navigate(['/admin/activites', activite.id, 'edit']);
  }

  confirmDelete(activite: Activite) {
    this.activiteToDelete.set(activite);
    this.showDeleteModal.set(true);
  }

  cancelDelete() {
    this.showDeleteModal.set(false);
    this.activiteToDelete.set(null);
  }

  deleteActivite() {
    const activite = this.activiteToDelete();
    if (!activite) return;

    this.deleting.set(true);
    this.error.set(null);

    this.api.delete(activite.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage.set(`L'activité "${activite.nom}" a été supprimée avec succès`);
          this.loadActivites();
          
          // Effacer le message après 3 secondes
          setTimeout(() => this.successMessage.set(null), 3000);
        } else {
          this.error.set(response.message || 'Erreur lors de la suppression');
        }
        
        this.deleting.set(false);
        this.showDeleteModal.set(false);
        this.activiteToDelete.set(null);
      },
      error: (err) => {
        console.error('Erreur de suppression:', err);
        this.error.set('Erreur lors de la suppression de l\'activité');
        this.deleting.set(false);
      }
    });
  }

  // Utilitaires pour l'affichage
  getImageUrl(imagePath: string): string {
    return `http://localhost:8000/storage/${imagePath}`;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getTypeName(type: string): string {
    const typeNames: { [key: string]: string } = {
      'musique': 'Musique',
      'peinture': 'Peinture',
      'sport': 'Sport',
      'lecture': 'Lecture',
      'sortie': 'Sortie',
      'autre': 'Autre'
    };
    return typeNames[type] || type;
  }

  getStatutName(statut: string): string {
    const statutNames: { [key: string]: string } = {
      'planifiee': 'Planifiée',
      'en_cours': 'En cours',
      'terminee': 'Terminée',
      'annulee': 'Annulée'
    };
    return statutNames[statut] || statut;
  }

  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'planifiee': 'bg-blue-100 text-blue-800',
      'en_cours': 'bg-green-100 text-green-800',
      'terminee': 'bg-gray-100 text-gray-800',
      'annulee': 'bg-red-100 text-red-800'
    };
    return classes[statut] || 'bg-gray-100 text-gray-800';
  }

  getDisplayedCount(): number {
    const meta = this.meta();
    if (!meta) return 0;
    return Math.min(meta.current_page * meta.per_page, meta.total);
  }


}