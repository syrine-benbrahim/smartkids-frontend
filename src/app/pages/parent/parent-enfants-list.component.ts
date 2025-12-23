import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  ParentPresencesApiService,
  EnfantWithStats
} from '../../services/presences-parent.service';
import { ChildStateService } from '../../services/child-state.service';

@Component({
  selector: 'app-parent-enfants-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 sm:p-8 space-y-12 animate-fade-in text-slate-800 dark:text-slate-100">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-4xl font-black tracking-tight mb-3">Mes Enfants</h1>
          <div class="h-1.5 w-24 bg-gradient-to-r from-sea to-tangerine rounded-full mb-4"></div>
          <p class="text-slate-500 dark:text-slate-400 font-medium max-w-lg leading-relaxed">
            Consultez les fiches détaillées et le suivi de progression de vos enfants.
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex flex-col justify-center items-center py-20 space-y-4">
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-t-tangerine border-slate-200"></div>
        <span class="text-slate-500 font-black text-xs uppercase tracking-widest animate-pulse">Chargement en cours...</span>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="p-8 glass bg-blush/5 border-blush/20 rounded-[2.5rem] flex items-center gap-6">
        <div class="w-16 h-16 bg-blush/10 rounded-2xl flex items-center justify-center text-3xl">⚠️</div>
        <div>
          <h3 class="text-lg font-black text-blush uppercase tracking-wider mb-1">Erreur de chargement</h3>
          <p class="text-blush/80 font-bold mb-4">{{ error() }}</p>
          <button 
            (click)="loadEnfants()"
            class="px-6 py-3 bg-blush text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blush/30">
            Réessayer
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && !error() && enfants().length === 0" class="text-center py-20 card-fancy border-dashed border-2 border-white/20">
        <div class="text-6xl mb-6 opacity-40">🎒</div>
        <h3 class="text-2xl font-black mb-2">Aucun enfant trouvé</h3>
        <p class="text-slate-500 font-medium">Aucun enfant n'est actuellement rattaché à votre compte parent.</p>
      </div>

      <!-- Enfants Cards -->
      <div *ngIf="!loading() && !error() && enfants().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          *ngFor="let enfant of enfants()" 
          (click)="viewFiche(enfant.id)"
          class="group relative transition-all duration-500"
          [class.z-10]="childState.selectedChild()?.id === enfant.id"
          [class.scale-105]="childState.selectedChild()?.id === enfant.id">
          <div class="absolute -inset-0.5 bg-gradient-to-r [class]='getGradientBorder(enfant.sexe)' rounded-[2.5rem] blur transition duration-500"
               [class.opacity-100]="childState.selectedChild()?.id === enfant.id"
               [class.opacity-0]="childState.selectedChild()?.id !== enfant.id"
               [class.group-hover:opacity-100]="true"></div>
          <div class="relative glass dark:bg-slate-800/40 rounded-[2.5rem] border-white/60 hover:border-white/80 transition-all cursor-pointer overflow-hidden p-8"
               [class.ring-4]="childState.selectedChild()?.id === enfant.id"
               [class.ring-tangerine/30]="childState.selectedChild()?.id === enfant.id && (enfant.sexe === 'M' || enfant.sexe === 'garçon')"
               [class.ring-blush/30]="childState.selectedChild()?.id === enfant.id && (enfant.sexe === 'F' || enfant.sexe === 'fille')">
            
            <!-- Active Indicator Badge -->
            <div *ngIf="childState.selectedChild()?.id === enfant.id" 
                 class="absolute top-6 right-6 px-4 py-1.5 bg-tangerine text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-tangerine/30 animate-pulse">
              Enfant Actif
            </div>
            
            <!-- Avatar & Basic Info -->
            <div class="flex items-center gap-6 mb-8">
              <div [class]="getAvatarClass(enfant.sexe)" class="w-20 h-20 rounded-[1.4rem] flex items-center justify-center text-3xl font-black text-white shadow-2xl group-hover:scale-110 transition-transform">
                {{ getInitials(enfant.nom_complet) }}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-2xl font-black group-hover:text-sea transition-colors leading-tight mb-2 truncate">{{ enfant.nom_complet }}</h3>
                <div class="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
                  <span class="px-2 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-500 rounded-lg" *ngIf="enfant.age">{{ enfant.age }} ans</span>
                  <span class="px-2 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-500 rounded-lg" *ngIf="enfant.sexe">
                    {{ enfant.sexe === 'M' || enfant.sexe === 'garçon' ? 'Garçon' : 'Fille' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Classe Info -->
            <div *ngIf="enfant.classe" class="mb-8 p-4 glass bg-sea/5 dark:bg-sea/10 border-sea/10 rounded-2xl flex items-center gap-3">
              <div class="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                <svg class="w-5 h-5 text-sea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Classe actuelle</div>
                <div class="font-black text-sm text-sea uppercase tracking-wider">{{ enfant.classe.nom }} - {{ enfant.classe.niveau }}</div>
              </div>
            </div>

            <!-- Detailed Stats -->
            <div class="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-700/50">
              <div class="space-y-3">
                <div class="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span>Assiduité globale</span>
                  <span [class]="getTauxClass(enfant.statistiques_presence.taux_presence)">{{ enfant.statistiques_presence.taux_presence }}%</span>
                </div>
                <div class="h-3 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div class="h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                       [class]="getProgressClass(enfant.statistiques_presence.taux_presence)"
                       [style.width.%]="enfant.statistiques_presence.taux_presence">
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div class="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-2xl text-center border border-slate-100/50 dark:border-slate-600/30">
                  <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</div>
                  <div class="font-black text-lg">{{ enfant.statistiques_presence.total_jours }}</div>
                </div>
                <div class="p-3 bg-matcha/5 dark:bg-matcha/10 rounded-2xl text-center border border-matcha/10">
                  <div class="text-[10px] font-black text-matcha uppercase tracking-widest mb-1">Présent</div>
                  <div class="font-black text-lg text-matcha">{{ enfant.statistiques_presence.jours_presents }}</div>
                </div>
                <div class="p-3 bg-blush/5 dark:bg-blush/10 rounded-2xl text-center border border-blush/10">
                  <div class="text-[10px] font-black text-blush uppercase tracking-widest mb-1">Absent</div>
                  <div class="font-black text-lg text-blush">{{ enfant.statistiques_presence.jours_absents }}</div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-2 gap-4 mt-8 pt-4">
              <button 
                (click)="viewFiche(enfant.id); $event.stopPropagation()"
                class="py-4 glass dark:bg-slate-800/60 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                Voir Profil
              </button>
              
              <button 
                (click)="viewPresences(enfant.id); $event.stopPropagation()"
                class="py-4 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
                Suivi Présence
              </button>
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
export class ParentEnfantsListComponent implements OnInit {
  private apiService = inject(ParentPresencesApiService);
  childState = inject(ChildStateService);
  private router = inject(Router);

  enfants = signal<EnfantWithStats[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadEnfants();
  }

  loadEnfants() {
    this.loading.set(true);
    this.error.set(null);

    this.apiService.getEnfants().subscribe({
      next: (response) => {
        if (response.success) {
          this.enfants.set(response.data || []);
        }
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Erreur lors du chargement des enfants');
        this.loading.set(false);
        console.error('Error loading enfants:', err);
      }
    });
  }

  viewFiche(enfantId: number) {
    this.router.navigate(['/parent/enfants', enfantId]);
  }

  viewPresences(enfantId: number) {
    this.router.navigate(['/parent/enfants', enfantId, 'presences']);
  }

  getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getAvatarClass(sexe: string): string {
    if (sexe === 'M' || sexe === 'garçon') {
      return 'bg-gradient-to-br from-sea to-blue-600 shadow-sea/30';
    }
    return 'bg-gradient-to-br from-blush to-purple-600 shadow-blush/30';
  }

  getGradientBorder(sexe: string): string {
    if (sexe === 'M' || sexe === 'garçon') {
      return 'from-sea/50 via-blue-400/30 to-transparent';
    }
    return 'from-blush/50 via-purple-400/30 to-transparent';
  }

  getTauxClass(taux: number): string {
    if (taux >= 90) return 'text-matcha';
    if (taux >= 75) return 'text-sea';
    if (taux >= 60) return 'text-tangerine';
    return 'text-blush';
  }

  getProgressClass(taux: number): string {
    if (taux >= 90) return 'bg-gradient-to-r from-matcha to-emerald-500';
    if (taux >= 75) return 'bg-gradient-to-r from-sea to-blue-500';
    if (taux >= 60) return 'bg-gradient-to-r from-tangerine to-orange-500';
    return 'bg-gradient-to-r from-blush to-red-500';
  }
}