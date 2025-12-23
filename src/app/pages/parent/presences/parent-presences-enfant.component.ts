import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ParentPresencesApiService, PresencesResponse, Presence } from '../../../services/presences-parent.service';

@Component({
  selector: 'app-parent-presences-enfant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 sm:p-8 space-y-8 animate-fade-in text-slate-800 dark:text-slate-100">
      <!-- Back Button -->
      <button (click)="goBack()" 
              class="group flex items-center text-xs font-black uppercase tracking-widest text-slate-400 hover:text-sea transition-colors">
        <svg class="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Retour aux enfants
      </button>

      <!-- Loading -->
      <div *ngIf="loading" class="flex flex-col justify-center items-center py-20 space-y-4">
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-t-sea border-slate-200"></div>
        <span class="text-slate-500 font-black text-xs uppercase tracking-widest animate-pulse">Récupération des données...</span>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="p-8 glass bg-blush/5 border-blush/20 rounded-[2.5rem] flex items-center gap-6">
        <div class="w-16 h-16 bg-blush/10 rounded-2xl flex items-center justify-center text-3xl">⚠️</div>
        <div>
          <h3 class="text-lg font-black text-blush uppercase tracking-wider mb-1">Erreur</h3>
          <p class="text-blush/80 font-bold">{{ error }}</p>
        </div>
      </div>

      <!-- Content -->
      <div *ngIf="!loading && !error && data" class="space-y-8">
        <!-- Header Card -->
        <div class="relative group">
          <div class="absolute -inset-1 bg-gradient-to-r from-sea via-matcha to-sea rounded-[3rem] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
          <div class="relative flex flex-col lg:flex-row items-center justify-between gap-8 p-10 card-fancy overflow-hidden">
            <div class="flex items-center gap-8 relative z-10">
              <div class="w-20 h-20 bg-gradient-to-br from-sea to-blue-600 rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-sea/30 text-3xl font-black text-white">
                {{ getInitials(data.enfant.nom_complet) }}
              </div>
              <div>
                <h1 class="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                  {{ data.enfant.nom_complet }}
                </h1>
                <div class="flex items-center gap-3">
                  <span class="px-4 py-1.5 bg-sea/10 text-sea rounded-xl text-[10px] font-black uppercase tracking-widest" *ngIf="data.enfant.classe">
                    {{ data.enfant.classe.nom }} • {{ data.enfant.classe.niveau }}
                  </span>
                </div>
              </div>
            </div>
            
            <button (click)="goToCalendrier()" 
                    class="px-8 py-4 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Calendrier Interactif
            </button>
          </div>
        </div>

        <!-- Filters Section -->
        <div class="glass dark:bg-slate-800/40 rounded-[2.5rem] p-8 border-white/60">
          <div class="flex items-center gap-4 mb-8">
            <div class="w-1.5 h-6 bg-sea rounded-full"></div>
            <h2 class="text-lg font-black uppercase tracking-widest">Filtrer l'Historique</h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div class="md:col-span-4 space-y-2">
              <label class="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date de début</label>
              <input type="date" [(ngModel)]="dateDebut"
                     class="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-sea transition-all font-bold">
            </div>
            <div class="md:col-span-4 space-y-2">
              <label class="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date de fin</label>
              <input type="date" [(ngModel)]="dateFin"
                     class="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-sea transition-all font-bold">
            </div>
            <div class="md:col-span-4">
              <button (click)="applyFilters()" 
                      class="w-full py-4 bg-sea text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sea/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-sea/20">
                Mettre à jour
              </button>
            </div>
          </div>
          
          <div class="flex flex-wrap gap-2 mt-8">
            <button (click)="setQuickPeriod('7j')" 
                    class="px-6 py-3 glass dark:bg-slate-700/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-sea hover:text-white transition-all shadow-sm">
              7 jours
            </button>
            <button (click)="setQuickPeriod('30j')" 
                    class="px-6 py-3 glass dark:bg-slate-700/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-sea hover:text-white transition-all shadow-sm">
              30 jours
            </button>
            <button (click)="setQuickPeriod('mois')" 
                    class="px-6 py-3 glass dark:bg-slate-700/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-sea hover:text-white transition-all shadow-sm">
              Ce mois
            </button>
          </div>
        </div>

        <!-- Stats Matrix -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="glass dark:bg-slate-800/40 rounded-[2.5rem] p-8 border-white/60 group hover:border-sea transition-colors">
            <div class="flex justify-between items-start mb-6">
              <div class="w-12 h-12 bg-sea/10 rounded-2xl flex items-center justify-center text-sea">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
            </div>
            <div class="text-3xl font-black mb-1 leading-none">{{ data.statistiques.total_jours }}</div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jours Évalués</p>
          </div>

          <div class="glass dark:bg-slate-800/40 rounded-[2.5rem] p-8 border-white/60 group hover:border-matcha transition-colors">
            <div class="flex justify-between items-start mb-6">
              <div class="w-12 h-12 bg-matcha/10 rounded-2xl flex items-center justify-center text-matcha">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            </div>
            <div class="text-3xl font-black mb-1 leading-none text-matcha">{{ data.statistiques.jours_presents }}</div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Présences</p>
          </div>

          <div class="glass dark:bg-slate-800/40 rounded-[2.5rem] p-8 border-white/60 group hover:border-blush transition-colors">
            <div class="flex justify-between items-start mb-6">
              <div class="w-12 h-12 bg-blush/10 rounded-2xl flex items-center justify-center text-blush">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
            </div>
            <div class="text-3xl font-black mb-1 leading-none text-blush">{{ data.statistiques.jours_absents }}</div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Absences</p>
          </div>

          <div class="glass dark:bg-slate-800/40 rounded-[2.5rem] p-8 border-white/60 group hover:border-butter transition-colors">
            <div class="flex justify-between items-start mb-6">
              <div class="w-12 h-12 bg-butter/10 rounded-2xl flex items-center justify-center text-butter">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
            </div>
            <div class="text-3xl font-black mb-1 leading-none" [class]="getPresenceColorClass(data.statistiques.taux_presence)">
              {{ data.statistiques.taux_presence }}%
            </div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assiduité</p>
          </div>
        </div>

        <!-- History Section -->
        <div class="space-y-6">
          <div class="flex items-center gap-4">
            <div class="w-1.5 h-6 bg-matcha rounded-full"></div>
            <h2 class="text-lg font-black uppercase tracking-widest">Historique détaillé</h2>
          </div>

          <div class="card-fancy overflow-hidden border-white/40">
            <div *ngIf="data.presences.length > 0" class="divide-y divide-slate-100 dark:divide-slate-700/50">
              <div *ngFor="let presence of data.presences" 
                   class="p-8 hover:bg-white/40 dark:hover:bg-slate-700/20 transition-all group">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div class="space-y-2">
                    <p class="text-xl font-black text-slate-900 dark:text-white capitalize leading-none">{{ presence.date_libelle }}</p>
                    <div class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      {{ presence.educateur_nom }}
                    </div>
                    <p *ngIf="presence.remarque" class="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 italic mt-3">
                      "{{ presence.remarque }}"
                    </p>
                  </div>
                  <div class="flex items-center">
                    <span class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all group-hover:scale-105"
                          [ngClass]="presence.statut === 'present' ? 'bg-matcha/10 text-matcha border border-matcha/20' : 'bg-blush/10 text-blush border border-blush/20'">
                      <div class="w-2 h-2 rounded-full" [ngClass]="presence.statut === 'present' ? 'bg-matcha animate-pulse' : 'bg-blush'"></div>
                      {{ presence.statut === 'present' ? 'Présent' : 'Absent' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State History -->
            <div *ngIf="data.presences.length === 0" class="p-20 text-center space-y-4">
              <div class="text-5xl opacity-20">📅</div>
              <p class="text-slate-400 font-black text-xs uppercase tracking-widest">Aucune donnée pour cette période</p>
            </div>

            <!-- Pagination Modernized -->
            <div *ngIf="pagination && pagination.last_page > 1" 
                 class="p-8 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-6">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Page <span class="text-slate-900 dark:text-white">{{ pagination.current_page }}</span> sur <span class="text-slate-900 dark:text-white">{{ pagination.last_page }}</span>
                <span class="mx-2 opacity-50">•</span>
                {{ pagination.total }} Entrées
              </p>
              <div class="flex gap-4">
                <button (click)="previousPage()" [disabled]="pagination.current_page === 1"
                        class="px-8 py-3 glass dark:bg-slate-700/50 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-900 hover:text-white transition-all">
                  Précédent
                </button>
                <button (click)="nextPage()" [disabled]="pagination.current_page === pagination.last_page"
                        class="px-8 py-3 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-all">
                  Suivant
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeInUp 0.8s ease-out forwards;
    }
  `]
})
export class ParentPresencesEnfantComponent implements OnInit {
  enfantId!: number;
  data: PresencesResponse | null = null;
  pagination: any = null;
  loading = true;
  error: string | null = null;

  dateDebut: string;
  dateFin: string;
  currentPage = 1;
  perPage = 15;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private presencesService: ParentPresencesApiService
  ) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    this.dateDebut = this.formatDateForInput(thirtyDaysAgo);
    this.dateFin = this.formatDateForInput(now);
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.enfantId = +params['enfantId'];
      this.loadPresences();
    });
  }

  loadPresences(): void {
    this.loading = true;
    this.error = null;

    this.presencesService.getPresencesEnfant(
      this.enfantId,
      this.dateDebut,
      this.dateFin,
      this.perPage,
      this.currentPage
    ).subscribe({
      next: (response) => {
        this.data = response.data;
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des présences:', err);
        this.error = 'Impossible de charger les présences';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadPresences();
  }

  setQuickPeriod(period: string): void {
    const now = new Date();
    this.dateFin = this.formatDateForInput(now);

    switch (period) {
      case '7j':
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        this.dateDebut = this.formatDateForInput(sevenDaysAgo);
        break;
      case '30j':
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        this.dateDebut = this.formatDateForInput(thirtyDaysAgo);
        break;
      case 'mois':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        this.dateDebut = this.formatDateForInput(startOfMonth);
        break;
    }

    this.applyFilters();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPresences();
    }
  }

  nextPage(): void {
    if (this.pagination && this.currentPage < this.pagination.last_page) {
      this.currentPage++;
      this.loadPresences();
    }
  }

  goBack(): void {
    this.router.navigate(['/parent/enfants']);
  }

  goToCalendrier(): void {
    this.router.navigate(['/parent/enfants', this.enfantId, 'presences', 'calendrier']);
  }

  getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getPresenceColorClass(taux: number): string {
    if (taux >= 90) return 'text-matcha';
    if (taux >= 75) return 'text-sea';
    if (taux >= 60) return 'text-tangerine';
    return 'text-blush';
  }
}