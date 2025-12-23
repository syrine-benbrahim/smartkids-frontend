import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ParentActivitesApiService } from '../../../services/parent-activites-api.service';

@Component({
  selector: 'app-parent-enfants-activites',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 sm:p-8 space-y-12 animate-fade-in text-slate-800 dark:text-slate-100">
      
      <!-- Header Section -->
      <div class="relative group">
        <div class="absolute -inset-1 bg-gradient-to-r from-sea via-tangerine to-sea rounded-[3rem] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
        <div class="relative flex flex-col lg:flex-row items-center justify-between gap-8 p-10 card-fancy overflow-hidden">
          <div class="flex items-center gap-8 relative z-10">
            <div class="w-20 h-20 bg-gradient-to-br from-sea to-blue-600 rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-sea/30 text-3xl font-black text-white transform group-hover:scale-110 transition-transform">
              👶
            </div>
            <div>
              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
                Mes Petits Talents
              </h1>
              <p class="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-lg leading-relaxed">
                Suivez les activités, la progression et l'épanouissement de vos enfants au quotidien.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Tracker -->
      <div *ngIf="loading()" class="flex flex-col justify-center items-center py-20 animate-pulse">
        <div class="w-16 h-16 border-4 border-t-sea border-slate-200 rounded-full animate-spin mb-4"></div>
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Récupération des profils actifs...</span>
      </div>

      <!-- Children Selection Cards -->
      <div *ngIf="!loading() && enfants().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div *ngFor="let enfant of enfants()" 
             class="group relative card-fancy p-8 hover:translate-y-[-8px] transition-all duration-500 border-white/40 flex flex-col justify-between h-full bg-white dark:bg-slate-800/60 overflow-hidden">
          <div class="absolute top-0 right-0 w-48 h-48 bg-sea/5 rounded-full blur-3xl -mr-24 -mt-24 group-hover:bg-sea/10 transition-colors"></div>
          
          <div class="relative z-10 space-y-8">
            <!-- Child Header -->
            <div class="flex items-center gap-5">
              <div [class]="getAvatarClass(enfant.sexe)" 
                   class="w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-slate-200 dark:shadow-slate-900 group-hover:rotate-6 transition-transform">
                {{ enfant.prenom?.substring(0,1) }}{{ enfant.nom?.substring(0,1) }}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-2xl font-black truncate text-slate-900 dark:text-white">{{ enfant.prenom }} {{ enfant.nom }}</h3>
                <span class="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-black uppercase text-slate-500 tracking-widest mt-2 inline-block">
                  {{ enfant.classe?.nom || 'Formation Libérée' }}
                </span>
              </div>
            </div>

            <!-- Dashboard Stats -->
            <div *ngIf="getStatsForEnfant(enfant.id) as childStats" class="space-y-6">
              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 rounded-3xl bg-sea/10 border border-sea/10 text-center">
                   <p class="text-2xl font-black text-sea leading-none">{{ childStats.total_activites }}</p>
                   <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">Activités</p>
                </div>
                <div class="p-4 rounded-3xl bg-matcha/10 border border-matcha/10 text-center">
                   <p class="text-2xl font-black text-matcha leading-none">{{ childStats.presences }}</p>
                   <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">Présences</p>
                </div>
              </div>

              <!-- Participation Level -->
              <div class="space-y-3">
                 <div class="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <span>Performance Engagement</span>
                    <span class="text-slate-900 dark:text-white">{{ childStats.taux_participation }}%</span>
                 </div>
                 <div class="h-2 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-sea to-matcha rounded-full transition-all duration-1000"
                         [style.width.%]="childStats.taux_participation"></div>
                 </div>
              </div>
            </div>
          </div>

          <!-- Quick Access Action -->
          <div class="mt-10 relative z-10">
            <button (click)="goToHistorique(enfant.id)" 
                    class="w-full py-5 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:shadow-sea/20 transition-all flex items-center justify-center gap-3 active:scale-95 group/btn">
              <span>Parcours Complet</span>
              <svg class="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && enfants().length === 0" class="text-center py-20 card-fancy border-dashed border-2 border-white/20 opacity-40">
        <div class="text-6xl mb-6 grayscale">👨‍👩‍👧‍👦</div>
        <h3 class="text-xl font-black mb-2 uppercase tracking-widest">Aucun profil lié</h3>
        <p class="text-sm font-medium">Veuillez contacter l'administration pour lier vos enfants à votre accès parent.</p>
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
export class ParentEnfantsActivitesComponent implements OnInit {
  private api = inject(ParentActivitesApiService);
  private router = inject(Router);

  enfants = signal<any[]>([]);
  stats = signal<Map<number, any>>(new Map());
  loading = signal(false);

  ngOnInit() {
    this.loadEnfantsWithStats();
  }

  loadEnfantsWithStats() {
    this.loading.set(true);
    this.api.getEnfants().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.enfants.set(res.data);
          res.data.forEach(enfant => {
            this.api.getStatistiquesEnfant(enfant.id).subscribe({
              next: (statsRes) => {
                if (statsRes.success && statsRes.data) {
                  const currentStats = new Map(this.stats());
                  currentStats.set(enfant.id, statsRes.data);
                  this.stats.set(currentStats);
                }
              }
            });
          });
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading.set(false);
      }
    });
  }

  getStatsForEnfant(enfantId: number) {
    return this.stats().get(enfantId);
  }

  goToHistorique(enfantId: number) {
    this.router.navigate(['/parent/activites/enfant', enfantId, 'historique']);
  }

  getAvatarClass(sexe: string): string {
    if (sexe === 'M' || sexe === 'garçon') return 'bg-gradient-to-br from-sea to-blue-600';
    return 'bg-gradient-to-br from-blush to-purple-600';
  }
}