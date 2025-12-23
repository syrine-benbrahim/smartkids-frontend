import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PresenceService } from '../../services/presence.service';

@Component({
  selector: 'app-presences-jour',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div class="p-4 sm:p-8 space-y-10 animate-fade-in text-slate-800 dark:text-slate-100">
  <!-- Header -->
  <div class="relative group">
    <div class="absolute -inset-1 bg-gradient-to-r from-tangerine via-blush to-sea rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
    <div class="relative flex flex-col lg:flex-row items-center justify-between gap-8 p-10 card-fancy overflow-hidden">
      <div class="flex items-center gap-8 relative z-10">
        <div class="w-20 h-20 bg-gradient-to-br from-tangerine to-blush rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-tangerine/30 transform group-hover:rotate-6 transition-transform">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <h1 class="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            Présences du Jour <span class="inline-block animate-pulse">☀️</span>
          </h1>
          <p class="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-lg">
            {{ getCurrentDate() }} — Vue d'ensemble rapide.
          </p>
        </div>
      </div>

      <button
        class="relative z-10 px-8 py-4 glass dark:bg-slate-800/60 rounded-2xl font-black text-slate-600 dark:text-slate-300 hover:bg-tangerine hover:text-white transition-all transform hover:scale-105 active:scale-95 border-white/40 group flex items-center gap-3 overflow-hidden"
        (click)="back()"
      >
        <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Dashboard
      </button>
    </div>
  </div>

  <!-- Vue d'ensemble toutes classes -->
  <div *ngIf="!loading() && !error() && classes().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    <div 
      *ngFor="let classe of classes()" 
      class="group relative"
      (click)="goToClasse(classe.id)"
    >
      <div class="absolute -inset-0.5 bg-gradient-to-r from-sea/50 to-matcha/50 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
      <div class="relative p-8 glass dark:bg-slate-800/40 rounded-[2.5rem] border-white/60 hover:border-white/80 transition-all cursor-pointer">
        <!-- Badge Status -->
        <div class="absolute top-6 right-6">
           <span [class]="getPresenceStatus(classe) === 'complete' ? 'bg-matcha/10 text-matcha' : 
                          getPresenceStatus(classe) === 'partial' ? 'bg-tangerine/10 text-tangerine' : 
                          'bg-slate-100 text-slate-400'"
                 class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20">
             {{ getPresenceStatusText(classe) }}
           </span>
        </div>

        <div class="flex items-center gap-4 mb-6">
           <div class="w-14 h-14 bg-slate-100 dark:bg-slate-700/50 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
             {{ getPresenceStatus(classe) === 'complete' ? '✅' : '📝' }}
           </div>
           <div>
             <h3 class="text-xl font-black group-hover:text-sea transition-colors">{{ classe.nom }}</h3>
             <p class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ classe.niveau }}</p>
           </div>
        </div>

        <!-- Stats -->
        <div class="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
          <div class="flex justify-between items-end">
            <div>
              <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Enfants</div>
              <div class="text-2xl font-black">{{ classe.nombre_enfants }}</div>
            </div>
            <div class="text-right">
              <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Marqués</div>
              <div class="text-2xl font-black text-sea">{{ classe.presences_prises || 0 }}</div>
            </div>
          </div>

          <!-- Progress -->
          <div class="space-y-3">
            <div class="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span>Progression</span>
              <span class="text-sea">{{ getProgressPercentage(classe) }}%</span>
            </div>
            <div class="h-3 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden p-0.5">
              <div class="h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(102,152,204,0.3)]"
                   [class]="getProgressBarColor(classe)"
                   [style.width.%]="getProgressPercentage(classe)">
              </div>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <button
          class="w-full mt-8 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all group-hover:shadow-2xl"
          (click)="goToClasse(classe.id); $event.stopPropagation()"
        >
          {{ getProgressPercentage(classe) === 100 ? 'Voir Détails' : 'Marquer Présences' }}
        </button>
      </div>
    </div>
  </div>

  <!-- État vide -->
  <div *ngIf="!loading() && !error() && classes().length === 0" class="text-center py-20 card-fancy border-dashed border-2 border-white/20">
    <div class="text-6xl mb-6">📭</div>
    <h3 class="text-2xl font-black mb-2">Aucune classe assignée</h3>
    <p class="text-slate-500 font-medium">Vous n'avez pas encore de classes sous votre responsabilité.</p>
  </div>

  <!-- État de chargement -->
  <div *ngIf="loading()" class="flex flex-col justify-center items-center py-20 space-y-4">
    <div class="animate-spin rounded-full h-16 w-16 border-4 border-t-tangerine border-slate-200"></div>
    <span class="text-slate-500 font-black text-xs uppercase tracking-widest animate-pulse">Synchronisation...</span>
  </div>

  <!-- État d'erreur -->
  <div *ngIf="error()" class="p-8 glass bg-blush/5 border-blush/20 rounded-[2.5rem] flex items-center gap-6">
    <div class="w-16 h-16 bg-blush/10 rounded-2xl flex items-center justify-center text-3xl">⚠️</div>
    <div>
      <h4 class="font-black text-blush uppercase tracking-wider text-xs mb-1">Une erreur est survenue</h4>
      <p class="text-blush font-bold">{{ error() }}</p>
    </div>
  </div>
</div>
  `
})
export class PresencesJourComponent implements OnInit {
  private presenceService = inject(PresenceService);
  private router = inject(Router);

  classes = signal<any[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadClassesWithPresencesToday();
  }

  private loadClassesWithPresencesToday() {
    this.loading.set(true);
    this.error.set(null);

    // Charger les classes et pour chaque classe, vérifier les présences du jour
    this.presenceService.getClassesEducateur().subscribe({
      next: (response) => {
        const classes = response.data || [];

        // Pour chaque classe, charger les présences du jour
        const promises = classes.map((classe: any) =>
          this.presenceService.getEnfantsClasse(classe.id, this.getTodayDate()).toPromise()
            .then((presenceResponse: any) => {
              const data = presenceResponse.data;
              return {
                ...classe,
                presences_prises: data.enfants?.filter((e: any) => e.deja_enregistre).length || 0,
                total_presents: data.resume?.presents || 0,
                total_absents: data.resume?.absents || 0,
                taux_presence: data.resume?.taux_presence || 0
              };
            })
            .catch(() => ({
              ...classe,
              presences_prises: 0,
              total_presents: 0,
              total_absents: 0,
              taux_presence: 0
            }))
        );

        Promise.all(promises).then(classesWithPresences => {
          this.classes.set(classesWithPresences);
          this.loading.set(false);
        });
      },
      error: (err) => {
        console.error('Erreur chargement classes:', err);
        this.error.set('Impossible de charger les données');
        this.loading.set(false);
      }
    });
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getPresenceStatus(classe: any): 'complete' | 'partial' | 'none' {
    if (classe.presences_prises === classe.nombre_enfants) return 'complete';
    if (classe.presences_prises > 0) return 'partial';
    return 'none';
  }

  getPresenceStatusText(classe: any): string {
    const status = this.getPresenceStatus(classe);
    switch (status) {
      case 'complete': return 'Terminé';
      case 'partial': return 'En cours';
      case 'none': return 'Non commencé';
    }
  }

  getProgressPercentage(classe: any): number {
    if (classe.nombre_enfants === 0) return 0;
    return Math.round((classe.presences_prises / classe.nombre_enfants) * 100);
  }

  getProgressBarColor(classe: any): string {
    const percentage = this.getProgressPercentage(classe);
    if (percentage === 100) return 'bg-green-500';
    if (percentage > 0) return 'bg-yellow-500';
    return 'bg-gray-400';
  }

  goToClasse(classeId: number) {
    this.router.navigate(['/educateur/classes', classeId, 'presences']);
  }

  back() {
    this.router.navigate(['/educateur']);
  }
}