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
    <div class="p-4 sm:p-8 space-y-12 animate-fade-in text-slate-800 dark:text-slate-100">
      
      <!-- Premium Header -->
      <div class="relative group">
        <div class="absolute -inset-1 bg-gradient-to-r from-sea via-tangerine to-blush rounded-[3rem] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
        <div class="relative flex flex-col lg:flex-row items-center justify-between gap-8 p-10 glass dark:bg-slate-800/40 rounded-[3rem] overflow-hidden">
          <div class="flex items-center gap-8 relative z-10">
            <div class="w-20 h-20 bg-gradient-to-br from-teal-400 to-blue-500 rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-teal-500/30 text-3xl font-black text-white transform group-hover:scale-110 transition-transform">
              🎭
            </div>
            <div>
              <h2 class="text-3xl sm:text-4xl font-black tracking-tight mb-2">Gestion des Activités</h2>
              <p class="text-lg text-slate-500 dark:text-slate-400 font-medium">Planifiez et organisez les activités pédagogiques.</p>
            </div>
          </div>
          
          <div class="flex gap-4 relative z-10">
            <button routerLink="/admin/activites/create"
                    class="px-8 py-4 bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"/>
              </svg>
              Nouvelle Activité
            </button>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="glass dark:bg-slate-800/40 p-8 rounded-[2.5rem] border-white/60">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          
          <div class="space-y-3">
            <label class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recherche</label>
            <div class="relative">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-sea/10 rounded-xl flex items-center justify-center text-sea">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <input type="text" [(ngModel)]="filters.search" (input)="onFilterChange()"
                     placeholder="Nom d'activité..."
                     class="w-full pl-16 pr-6 py-4 bg-white/40 dark:bg-slate-700/40 border-2 border-white/60 focus:border-sea/50 rounded-2xl text-sm font-black placeholder-slate-400 outline-none transition-all" />
            </div>
          </div>

          <div class="space-y-3">
            <label class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
            <select [(ngModel)]="filters.type" (change)="onFilterChange()"
                    class="w-full px-6 py-4 bg-white/40 dark:bg-slate-700/40 border-2 border-white/60 focus:border-sea/50 rounded-2xl text-xs font-black uppercase tracking-widest outline-none transition-all cursor-pointer">
              <option value="">Tous les types</option>
              @for (type of types(); track type) {
                <option [value]="type">{{ getTypeName(type) }}</option>
              }
            </select>
          </div>

          <div class="space-y-3">
            <label class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</label>
            <select [(ngModel)]="filters.statut" (change)="onFilterChange()"
                    class="w-full px-6 py-4 bg-white/40 dark:bg-slate-700/40 border-2 border-white/60 focus:border-sea/50 rounded-2xl text-xs font-black uppercase tracking-widest outline-none transition-all cursor-pointer">
              <option value="">Tous les statuts</option>
              <option value="planifiee">Planifiée</option>
              <option value="en_cours">En cours</option>
              <option value="terminee">Terminée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>

          <div class="space-y-3">
            <label class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date de début</label>
            <input type="date" [(ngModel)]="filters.date_debut" (change)="onFilterChange()"
                   class="w-full px-6 py-4 bg-white/40 dark:bg-slate-700/40 border-2 border-white/60 focus:border-sea/50 rounded-2xl text-xs font-black uppercase tracking-widest outline-none transition-all" />
          </div>
        </div>

        <div class="flex items-center justify-between mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
          <button (click)="clearFilters()" class="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-sea transition-colors flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Réinitialiser les filtres
          </button>
          <div class="px-6 py-2 bg-sea/5 text-sea rounded-xl text-[10px] font-black uppercase tracking-widest border border-sea/10">
            {{ meta()?.total || 0 }} Activités trouvées
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-20 space-y-4">
          <div class="relative w-16 h-16">
            <div class="absolute inset-0 border-4 border-sea/20 rounded-full animate-ping"></div>
            <div class="absolute inset-2 border-4 border-sea rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Chargement des activités...</p>
        </div>
      } @else if (activites().length === 0) {
        <div class="glass dark:bg-slate-800/40 p-20 rounded-[4rem] text-center max-w-2xl mx-auto shadow-2xl">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 opacity-30">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a4 4 0 014 4v1a2 2 0 002 2 2 2 0 002-2v-1a4 4 0 014-4h1m-1-4a2 2 0 012 2v3a2 2 0 01-2 2h-1a4 4 0 00-4 4v1a2 2 0 01-2 2 2 2 0 01-2-2v-1a4 4 0 00-4-4H6a2 2 0 01-2-2V7a2 2 0 012-2 2 2 0 012 2v1a4 4 0 004 4z"/>
            </svg>
          </div>
          <h3 class="text-xl font-black uppercase tracking-tight mb-2">Aucune activité trouvée</h3>
          <p class="text-slate-500 font-medium mb-8">Ajustez vos filtres ou créez une nouvelle activité.</p>
        </div>
      } @else {
        <!-- Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (activite of activites(); track activite.id) {
            <div class="group relative">
              <div class="absolute -inset-1 bg-gradient-to-r from-sea via-tangerine to-blush rounded-[2.5rem] blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
              <div class="relative glass dark:bg-slate-800/40 rounded-[2.5rem] border-white/60 overflow-hidden flex flex-col h-full hover:border-sea/30 transition-all">
                
                <!-- Media Section -->
                <div class="relative h-56 overflow-hidden">
                  @if (activite.image) {
                    <img [src]="getImageUrl(activite.image)" [alt]="activite.nom" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                  } @else {
                    <div class="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center opacity-40">
                      <svg class="w-20 h-20 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a4 4 0 014 4v1a2 2 0 002 2 2 2 0 002-2v-1a4 4 0 014-4h1m-1-4a2 2 0 012 2v3a2 2 0 01-2 2h-1a4 4 0 00-4 4v1a2 2 0 01-2 2 2 2 0 01-2-2v-1a4 4 0 00-4-4H6a2 2 0 01-2-2V7a2 2 0 012-2 2 2 0 012 2v1a4 4 0 004 4z"/>
                      </svg>
                    </div>
                  }
                  <div class="absolute top-6 left-6 px-4 py-2 glass bg-white/90 dark:bg-slate-800/90 rounded-2xl text-[10px] font-black uppercase tracking-widest text-sea border border-white/40">
                    {{ getTypeName(activite.type || 'autre') }}
                  </div>
                  <div class="absolute top-6 right-6 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/40 shadow-xl"
                       [class]="getStatutClass(activite.statut)">
                    {{ getStatutName(activite.statut) }}
                  </div>
                </div>

                <!-- Content -->
                <div class="p-8 flex-1 flex flex-col gap-6">
                  <div>
                    <h3 class="text-xl font-black text-slate-900 dark:text-white group-hover:text-sea transition-colors mb-2 line-clamp-1">{{ activite.nom }}</h3>
                    <p class="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed">
                      {{ activite.description || 'Aucune description disponible pour cette activité.' }}
                    </p>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-sea/5 text-sea flex items-center justify-center text-sm">📅</div>
                      <div>
                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Date</p>
                        <p class="text-[11px] font-black text-slate-700 dark:text-slate-200">{{ formatDate(activite.date_activite) }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-tangerine/5 text-tangerine flex items-center justify-center text-sm">🕒</div>
                      <div>
                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Horaire</p>
                        <p class="text-[11px] font-black text-slate-700 dark:text-slate-200">{{ activite.heure_debut }} - {{ activite.heure_fin }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-blush/5 text-blush flex items-center justify-center text-sm">💰</div>
                      <div>
                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Tarif</p>
                        <p class="text-[11px] font-black text-slate-700 dark:text-slate-200">{{ activite.prix || 0 }}€</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-matcha/5 text-matcha flex items-center justify-center text-sm">👥</div>
                      <div>
                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Capacité</p>
                        <p class="text-[11px] font-black text-slate-700 dark:text-slate-200">Max {{ activite.capacite_max }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="mt-auto pt-8 border-t border-slate-100 dark:border-slate-700 flex gap-4">
                    <button (click)="editActivite(activite)"
                            class="flex-1 px-4 py-3 bg-sea text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-sea/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                      Modifier
                    </button>
                    <button (click)="confirmDelete(activite)"
                            class="w-12 h-12 glass hover:bg-blush hover:text-white rounded-xl text-blush flex items-center justify-center transition-all group/del">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (meta()) {
          <div class="glass dark:bg-slate-800/40 p-8 rounded-[2.5rem] mt-12 border-white/60">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-8">
              <div class="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Affichage de <span class="text-sea font-black text-lg ml-2">{{ ((meta()!.current_page - 1) * meta()!.per_page) + 1 }} - {{ getDisplayedCount() }}</span> sur <span class="font-black italic">{{ meta()!.total }}</span>
              </div>
              
              <div class="flex items-center gap-4">
                <button [disabled]="meta()!.current_page <= 1" (click)="changePage(meta()!.current_page - 1)"
                        class="px-8 py-4 glass hover:bg-white dark:hover:bg-slate-700/50 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed group">
                  <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"/>
                  </svg>
                  Précédent
                </button>
                
                <div class="px-6 py-4 bg-sea/5 text-sea rounded-2xl text-[10px] font-black uppercase tracking-widest border border-sea/10 shadow-inner">
                  Page {{ meta()!.current_page }} / {{ meta()!.last_page }}
                </div>
                
                <button [disabled]="meta()!.current_page >= meta()!.last_page" (click)="changePage(meta()!.current_page + 1)"
                        class="px-8 py-4 glass hover:bg-white dark:hover:bg-slate-700/50 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed group">
                  Suivant
                  <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        }
      }

      <!-- Delete Modal -->
      @if (showDeleteModal()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10 animate-fade-in">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" (click)="cancelDelete()"></div>
          <div class="relative glass bg-white/95 dark:bg-slate-800/95 p-10 sm:p-12 rounded-[3.5rem] border-white/60 shadow-2xl max-w-xl w-full transform animate-scale-up">
            <div class="text-center space-y-8">
              <div class="w-24 h-24 bg-blush/10 rounded-[2rem] flex items-center justify-center text-4xl mx-auto shadow-inner animate-bounce-slow">
                🗑️
              </div>
              
              <div>
                <h3 class="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Supprimer l'activité ?</h3>
                <p class="text-slate-500 font-medium leading-relaxed">
                  Êtes-vous sûr de vouloir supprimer <span class="text-blush font-black">"{{ activiteToDelete()?.nom }}"</span> ? Cette action est irréversible et affectera toutes les inscriptions associées.
                </p>
              </div>
              
              <div class="flex flex-col sm:flex-row gap-4">
                <button (click)="cancelDelete()"
                        class="flex-1 px-8 py-5 glass hover:bg-white dark:hover:bg-slate-700 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 transition-all">
                  Annuler
                </button>
                <button (click)="deleteActivite()" [disabled]="deleting()"
                        class="flex-1 px-8 py-5 bg-blush text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blush/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                  {{ deleting() ? 'Suppression...' : 'Confirmer la suppression' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
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