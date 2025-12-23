import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ParentActivitesApiService } from '../../../services/parent-activites-api.service';

@Component({
  selector: 'app-parent-enfants-activites',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 fade-in">
      <!-- Header -->
      <div>
        <h2 class="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-2">
          <span class="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">Mes Enfants</span>
          <span class="text-2xl">👶</span>
        </h2>
        <p class="text-gray-500 font-medium mt-1">Suivez les activités et la progression de vos enfants</p>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-20">
          <div class="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
          <p class="mt-4 text-gray-400 font-medium animate-pulse">Chargement des profils...</p>
        </div>
      }

      <!-- Children Grid -->
      @if (!loading() && enfants().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          @for (enfant of enfants(); track enfant.id) {
            <div class="bg-white rounded-[2.5rem] p-6 shadow-xl border border-gray-100 group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              
              <!-- Background Decorations -->
              <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full blur-2xl opacity-50 -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>

              <!-- Header -->
              <div class="relative flex items-center gap-4 mb-6">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-orange-400 p-0.5 shadow-lg transform group-hover:rotate-6 transition-transform">
                   <div class="w-full h-full bg-white rounded-2xl flex items-center justify-center text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-pink-500 to-orange-500">
                      {{ enfant.prenom.charAt(0) }}{{ enfant.nom.charAt(0) }}
                   </div>
                </div>
                <div>
                   <h3 class="text-xl font-bold text-gray-800 leading-tight">{{ enfant.prenom }} {{ enfant.nom }}</h3>
                   <p class="text-sm font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg inline-block mt-1">
                      {{ enfant.classe?.nom || 'Sans classe' }}
                   </p>
                </div>
              </div>

              <!-- Stats -->
              @if (getStatsForEnfant(enfant.id); as stats) {
                 <div class="grid grid-cols-2 gap-3 mb-6 relative">
                    <div class="bg-indigo-50 rounded-2xl p-3 text-center">
                       <div class="text-2xl font-black text-indigo-600">{{ stats.total_activites }}</div>
                       <div class="text-xs font-bold text-indigo-400 uppercase tracking-wide">Activités</div>
                    </div>
                    <div class="bg-emerald-50 rounded-2xl p-3 text-center">
                       <div class="text-2xl font-black text-emerald-600">{{ stats.presences }}</div>
                       <div class="text-xs font-bold text-emerald-400 uppercase tracking-wide">Présences</div>
                    </div>
                    <div class="bg-amber-50 rounded-2xl p-3 text-center">
                       <div class="text-2xl font-black text-amber-600">{{ stats.en_attente }}</div>
                       <div class="text-xs font-bold text-amber-400 uppercase tracking-wide">En attente</div>
                    </div>
                    <div class="bg-pink-50 rounded-2xl p-3 text-center">
                       <div class="text-2xl font-black text-pink-600">{{ stats.absences }}</div>
                       <div class="text-xs font-bold text-pink-400 uppercase tracking-wide">Absences</div>
                    </div>
                 </div>

                 <!-- Progress -->
                 <div class="space-y-2 mb-6 relative">
                    <div class="flex justify-between text-xs font-bold">
                       <span class="text-gray-400">Taux de participation</span>
                       <span class="text-gray-800">{{ stats.taux_participation }}%</span>
                    </div>
                    <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                       <div class="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-1000"
                            [style.width.%]="stats.taux_participation"></div>
                    </div>
                 </div>
              }

              <!-- Action -->
              <button (click)="goToHistorique(enfant.id)" 
                      class="relative w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 group/btn">
                 <span>Voir l'historique complet</span>
                 <svg class="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                 </svg>
              </button>

            </div>
          }
        </div>
      }

      <!-- Empty State -->
      @if (!loading() && enfants().length === 0) {
        <div class="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
          <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800">Aucun enfant trouvé</h3>
          <p class="text-gray-500 mt-2">Aucun enfant n'est actuellement associé à votre compte.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .fade-in {
      animation: fadeIn 0.4s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
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

          // Charger les stats pour chaque enfant
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
}