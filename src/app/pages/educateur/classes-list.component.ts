import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PresenceService } from '../../services/presence.service';

@Component({
  selector: 'app-educateur-classes-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div class="p-4 sm:p-8 space-y-10 animate-fade-in text-slate-800 dark:text-slate-100">
  <!-- Header -->
  <div class="relative group">
    <div class="absolute -inset-1 bg-gradient-to-r from-sea via-matcha to-tangerine rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
    <div class="relative flex flex-col lg:flex-row items-center justify-between gap-8 p-10 card-fancy overflow-hidden">
      <div class="flex items-center gap-8 relative z-10">
        <div class="w-20 h-20 bg-gradient-to-br from-sea to-matcha rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-sea/30 transform group-hover:rotate-6 transition-transform text-white">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
        </div>
        <div>
          <h1 class="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            Mes Classes <span class="inline-block animate-bounce">📚</span>
          </h1>
          <p class="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-lg">
            Gérez vos {{ classes().length }} classe(s) assignées.
          </p>
        </div>
      </div>

      <button
        class="relative z-10 px-8 py-4 glass dark:bg-slate-800/60 rounded-2xl font-black text-slate-600 dark:text-slate-300 hover:bg-sea hover:text-white transition-all transform hover:scale-105 active:scale-95 border-white/40 group flex items-center gap-3 overflow-hidden"
        (click)="back()"
      >
        <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Dashboard
      </button>
    </div>
  </div>

  <!-- Liste des classes -->
  <div *ngIf="!loading() && !error() && classes().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
    <div 
      *ngFor="let classe of classes()" 
      class="group relative"
      (click)="selectClasse(classe.id)"
    >
      <div class="absolute -inset-0.5 bg-gradient-to-r from-sea/50 to-tangerine/50 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
      <div class="relative p-8 glass dark:bg-slate-800/40 rounded-[2.5rem] border-white/60 hover:border-white/80 transition-all cursor-pointer">
        <!-- Icon & Header -->
        <div class="flex items-center gap-4 mb-8">
           <div class="w-14 h-14 bg-slate-100 dark:bg-slate-700/50 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
             🏫
           </div>
           <div>
             <h3 class="text-xl font-black group-hover:text-sea transition-colors">{{ classe.nom }}</h3>
             <p class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ classe.niveau }}</p>
           </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-2 gap-4 mb-8">
           <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700">
             <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Enfants</div>
             <div class="text-xl font-black text-sea">{{ classe.nombre_enfants }}</div>
           </div>
           <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700">
             <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Capacité</div>
             <div class="text-xl font-black text-slate-600 dark:text-slate-300">{{ classe.capacite_max }}</div>
           </div>
        </div>

        <!-- Remplissage Bar -->
        <div class="space-y-3 mb-8">
           <div class="flex justify-between text-[10px] font-black uppercase tracking-widest">
             <span>Remplissage</span>
             <span [class]="getPercentageRemplissage(classe) > 90 ? 'text-blush' : 'text-matcha'">
               {{ getPercentageRemplissage(classe) }}%
             </span>
           </div>
           <div class="h-2 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
             <div class="h-full rounded-full transition-all duration-1000"
                  [class]="getProgressBarColor(classe)"
                  [style.width.%]="getPercentageRemplissage(classe)">
             </div>
           </div>
        </div>

        <!-- Action -->
        <button
          class="w-full bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group-hover:shadow-2xl"
          (click)="selectClasse(classe.id); $event.stopPropagation()"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Gérer Présences
        </button>
      </div>
    </div>
  </div>

  <!-- État vide -->
  <div *ngIf="!loading() && !error() && classes().length === 0" class="text-center py-20 card-fancy border-dashed border-2 border-white/20">
    <div class="text-6xl mb-6">🏜️</div>
    <h3 class="text-2xl font-black mb-2">Aucune classe</h3>
    <p class="text-slate-500 font-medium">Vous n'avez pas encore été assigné à une classe.</p>
  </div>

  <!-- État de chargement -->
  <div *ngIf="loading()" class="flex flex-col justify-center items-center py-20 space-y-4">
    <div class="animate-spin rounded-full h-16 w-16 border-4 border-t-sea border-slate-200"></div>
    <span class="text-slate-500 font-black text-xs uppercase tracking-widest animate-pulse">Chargement en cours...</span>
  </div>

  <!-- État d'erreur -->
  <div *ngIf="error()" class="p-8 glass bg-blush/5 border-blush/20 rounded-[2.5rem] flex items-center gap-6 text-blush">
    <div class="w-16 h-16 bg-blush/10 rounded-2xl flex items-center justify-center text-3xl">⚠️</div>
    <div>
      <h4 class="font-black uppercase tracking-wider text-xs mb-1">Oups !</h4>
      <p class="font-bold">{{ error() }}</p>
    </div>
  </div>
</div>
  `
})
export class EducateurClassesListComponent implements OnInit {
  private presenceService = inject(PresenceService);
  private router = inject(Router);

  classes = signal<any[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadClasses();
  }

  private loadClasses() {
    this.loading.set(true);
    this.error.set(null);

    this.presenceService.getClassesEducateur().subscribe({
      next: (response) => {
        this.classes.set(response.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement classes:', err);
        this.error.set('Impossible de charger vos classes');
        this.loading.set(false);
      }
    });
  }

  selectClasse(classeId: number) {
    this.router.navigate(['/educateur/classes', classeId, 'presences']);
  }

  getPercentageRemplissage(classe: any): number {
    if (!classe.capacite_max || classe.capacite_max === 0) return 0;
    return Math.round((classe.nombre_enfants / classe.capacite_max) * 100);
  }

  getProgressBarColor(classe: any): string {
    const percentage = this.getPercentageRemplissage(classe);
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  back() {
    this.router.navigate(['/educateur']);
  }
}