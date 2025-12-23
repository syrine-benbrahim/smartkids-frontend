import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  ParentPresencesApiService,
  JourCalendrier,
  CalendrierResponse
} from '../../../services/presences-parent.service';

@Component({
  selector: 'app-parent-presences-calendrier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 sm:p-8 space-y-12 animate-fade-in text-slate-800 dark:text-slate-100">
      
      <!-- Premium Header & Nav -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div class="flex items-center gap-6">
          <button (click)="goBack()" 
                  class="w-12 h-12 glass dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 hover:text-matcha hover:scale-110 transition-all border-white/40 border">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 class="text-3xl sm:text-4xl font-black tracking-tight mb-2">Calendrier de Présence</h1>
            <div class="flex items-center gap-3">
              <div class="w-1.5 h-1.5 bg-matcha rounded-full animate-pulse"></div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]" *ngIf="moisLibelle()">
                Période : {{ moisLibelle() }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-white/20 shadow-sm">
          <button (click)="previousMonth()" 
                  class="p-4 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500 hover:text-matcha active:scale-95">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div class="px-6 relative group">
            <input type="month" [(ngModel)]="currentMonth" (change)="loadCalendrier()"
                   class="bg-transparent font-black text-sm uppercase tracking-widest text-center cursor-pointer focus:outline-none hover:text-matcha transition-colors">
            <div class="absolute inset-x-0 -bottom-1 h-0.5 bg-matcha/40 scale-x-0 group-hover:scale-x-100 transition-transform"></div>
          </div>

          <button (click)="nextMonth()" 
                  class="p-4 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500 hover:text-matcha active:scale-95">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading Tracker -->
      <div *ngIf="loading()" class="flex flex-col justify-center items-center py-24 animate-pulse">
        <div class="w-16 h-16 border-4 border-t-matcha border-slate-200 rounded-full animate-spin mb-4"></div>
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analyse du registre temporel...</span>
      </div>

      <!-- Stats Matrix -->
      <div *ngIf="!loading() && !error() && statistiques()" class="grid grid-cols-2 lg:grid-cols-4 gap-8">
        <div class="group relative card-fancy p-8 hover:translate-y-[-4px] transition-all border-white/40 overflow-hidden">
          <div class="absolute -right-4 -top-4 w-24 h-24 bg-sea/5 rounded-full blur-2xl group-hover:bg-sea/10 transition-colors"></div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Jours d'école</p>
          <div class="flex items-end gap-3">
            <span class="text-4xl font-black leading-none">{{ statistiques()?.total_jours_ecole || 0 }}</span>
            <span class="text-sea text-sm mb-1">📅</span>
          </div>
        </div>

        <div class="group relative card-fancy p-8 hover:translate-y-[-4px] transition-all border-white/40 overflow-hidden text-matcha">
          <div class="absolute -right-4 -top-4 w-24 h-24 bg-matcha/5 rounded-full blur-2xl group-hover:bg-matcha/10 transition-colors"></div>
          <p class="text-[10px] font-black opacity-60 uppercase tracking-widest mb-4">Presents</p>
          <div class="flex items-end gap-3">
            <span class="text-4xl font-black leading-none">{{ statistiques()?.jours_presents || 0 }}</span>
            <span class="text-sm mb-1">✅</span>
          </div>
        </div>

        <div class="group relative card-fancy p-8 hover:translate-y-[-4px] transition-all border-white/40 overflow-hidden text-blush">
          <div class="absolute -right-4 -top-4 w-24 h-24 bg-blush/5 rounded-full blur-2xl group-hover:bg-blush/10 transition-colors"></div>
          <p class="text-[10px] font-black opacity-60 uppercase tracking-widest mb-4">Absents</p>
          <div class="flex items-end gap-3">
            <span class="text-4xl font-black leading-none">{{ statistiques()?.jours_absents || 0 }}</span>
            <span class="text-sm mb-1">❌</span>
          </div>
        </div>

        <div class="group relative card-fancy p-8 hover:translate-y-[-4px] transition-all border-white/40 overflow-hidden text-butter">
          <div class="absolute -right-4 -top-4 w-24 h-24 bg-butter/5 rounded-full blur-2xl group-hover:bg-butter/10 transition-colors"></div>
          <p class="text-[10px] font-black opacity-60 uppercase tracking-widest mb-4">Assiduité</p>
          <div class="flex items-end gap-3">
            <span class="text-4xl font-black leading-none">{{ statistiques()?.taux_presence || 0 }}%</span>
            <span class="text-sm mb-1">📈</span>
          </div>
        </div>
      </div>

      <!-- Main Calendar Grid -->
      <div *ngIf="!loading() && !error()" class="space-y-12">
        <div class="glass dark:bg-slate-800/40 rounded-[3rem] p-4 sm:p-8 border-white/60 shadow-xl overflow-hidden relative">
          <div class="absolute top-0 right-0 w-64 h-64 bg-matcha/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div class="grid grid-cols-7 gap-3 sm:gap-6 relative z-10">
            <!-- Day Headers -->
            <div *ngFor="let day of ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']" 
                 class="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
              {{ day }}
            </div>
            
            <!-- Calendar Days -->
            <div *ngFor="let jour of calendrier()" 
                 [class]="getDayCardClass(jour)"
                 class="aspect-square rounded-3xl border transition-all duration-300 group hover:scale-105 active:scale-95 relative cursor-default flex flex-col items-center justify-center gap-2 p-2">
              
              <span class="text-sm sm:text-lg font-black group-hover:scale-110 transition-transform"
                    [class]="jour.est_weekend ? 'text-slate-300' : (jour.a_presence ? 'text-slate-900 dark:text-white' : 'text-slate-400')">
                {{ jour.jour }}
              </span>

              <div *ngIf="jour.a_presence" class="w-8 h-8 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform"
                   [class]="jour.statut === 'present' ? 'bg-matcha text-white' : 'bg-blush text-white'">
                   <svg *ngIf="jour.statut === 'present'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                   <svg *ngIf="jour.statut === 'absent'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
              </div>

              <!-- Tooltip on Hover -->
              <div class="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-3xl flex items-center justify-center p-2 pointer-events-none text-center">
                 <p class="text-[8px] font-black uppercase tracking-widest" [class]="jour.statut === 'present' ? 'text-matcha' : 'text-blush'">
                   {{ jour.statut === 'present' ? 'Présent' : (jour.statut === 'absent' ? 'Absent' : '') }}
                 </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Legend Deck -->
        <div class="flex flex-wrap items-center gap-8 px-10">
           <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-matcha rounded-xl"></div>
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Présence validée</span>
           </div>
           <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-blush rounded-xl"></div>
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Absence notée</span>
           </div>
           <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-slate-100 dark:bg-slate-700/50 rounded-xl border border-dashed border-slate-300"></div>
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Weekend / Récupération</span>
           </div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="p-20 text-center card-fancy border-blush/20 space-y-6">
        <div class="text-6xl text-blush">🚫</div>
        <h3 class="text-2xl font-black uppercase tracking-tight text-blush">Erreur de Registre</h3>
        <p class="text-slate-500 font-medium">{{ error() }}</p>
        <button (click)="loadCalendrier()" class="px-8 py-4 bg-blush text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Réactualiser</button>
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
export class ParentPresencesCalendrierComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ParentPresencesApiService);

  enfantId = signal<number>(0);
  calendrier = signal<JourCalendrier[]>([]);
  statistiques = signal<any>(null);
  moisLibelle = signal<string>('');
  loading = signal(false);
  error = signal<string | null>(null);

  currentMonth: string;

  constructor() {
    const today = new Date();
    this.currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.enfantId.set(+params['enfantId']);
      this.loadCalendrier();
    });
  }

  loadCalendrier() {
    this.loading.set(true);
    this.error.set(null);
    this.apiService.getCalendrierEnfant(this.enfantId(), this.currentMonth).subscribe({
      next: (response) => {
        if (response.success) {
          this.calendrier.set(response.data.calendrier);
          this.statistiques.set(response.data.statistiques_mois);
          this.moisLibelle.set(response.data.mois_libelle);
        }
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Impossible de synchroniser les données du mois sélectionné.');
        this.loading.set(false);
      }
    });
  }

  previousMonth() {
    const [year, month] = this.currentMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    this.currentMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    this.loadCalendrier();
  }

  nextMonth() {
    const [year, month] = this.currentMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    this.currentMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    this.loadCalendrier();
  }

  goBack() {
    this.router.navigate(['/parent/enfants', this.enfantId(), 'presences']);
  }

  getDayCardClass(jour: JourCalendrier): string {
    if (jour.est_weekend) return 'bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-700/50 opacity-40';
    if (!jour.a_presence) return 'bg-white/40 dark:bg-slate-700/30 border-white/60 dark:border-white/10';
    if (jour.statut === 'present') return 'bg-matcha/5 border-matcha/30 shadow-inner';
    if (jour.statut === 'absent') return 'bg-blush/5 border-blush/30 shadow-inner';
    return 'bg-white/40 border-white/60';
  }
}