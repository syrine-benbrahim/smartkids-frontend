import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PresenceService } from '../../services/presence.service';

@Component({
  selector: 'app-presences-jour',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div class="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-red-100 p-4 sm:p-6">
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="relative mb-8">
      <div class="absolute -top-4 -left-4 w-16 h-16 bg-orange-300 rounded-full opacity-60 animate-bounce"></div>
      <div class="absolute -top-2 right-10 w-12 h-12 bg-yellow-300 rounded-full opacity-60 animate-bounce" style="animation-delay: 0.5s;"></div>
      
      <div class="card relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-red-500/10"></div>
        <div class="relative flex flex-col lg:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-black text-gray-800 tracking-tight">
                Présences du Jour ☀️
              </h1>
              <p class="text-gray-600 font-medium">
                Vue d'ensemble rapide - {{ getCurrentDate() }}
              </p>
            </div>
          </div>
          <button
            class="btn-primary bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            (click)="back()"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Retour
          </button>
        </div>
      </div>
    </div>

    <!-- Vue d'ensemble toutes classes -->
    <div *ngIf="!loading() && !error() && classes().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        *ngFor="let classe of classes()" 
        class="group bg-white/90 backdrop-blur rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer"
        (click)="goToClasse(classe.id)"
      >
        <!-- Header de la carte -->
        <div class="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                {{ classe.nom }}
              </h3>
              <p class="text-sm text-gray-600">{{ classe.niveau }}</p>
            </div>
            <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Stats présences du jour -->
        <div class="p-4 space-y-4">
          <!-- État des présences -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Présences prises</span>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full"
                   [class]="getPresenceStatus(classe) === 'complete' ? 'bg-green-500' : 
                           getPresenceStatus(classe) === 'partial' ? 'bg-yellow-500' : 'bg-gray-400'">
              </div>
              <span class="text-sm font-medium" 
                    [class]="getPresenceStatus(classe) === 'complete' ? 'text-green-600' : 
                            getPresenceStatus(classe) === 'partial' ? 'text-yellow-600' : 'text-gray-600'">
                {{ getPresenceStatusText(classe) }}
              </span>
            </div>
          </div>

          <!-- Statistiques -->
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Total enfants</span>
              <span class="font-medium">{{ classe.nombre_enfants }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Présences marquées</span>
              <span class="font-medium">{{ classe.presences_prises || 0 }}</span>
            </div>
          </div>

          <!-- Barre de progression -->
          <div class="space-y-1">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="h-2 rounded-full transition-all duration-300"
                [class]="getProgressBarColor(classe)"
                [style.width.%]="getProgressPercentage(classe)"
              ></div>
            </div>
            <div class="text-xs text-center text-gray-600">
              {{ getProgressPercentage(classe) }}% complété
            </div>
          </div>

          <!-- Action -->
          <button
            class="w-full mt-4 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
            (click)="goToClasse(classe.id); $event.stopPropagation()"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            {{ getProgressPercentage(classe) === 100 ? 'Voir détails' : 'Marquer présences' }}
          </button>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div *ngIf="!loading() && !error() && classes().length === 0" class="text-center py-16">
      <div class="w-24 h-24 mx-auto bg-gradient-to-br from-gray-300 to-gray-400 rounded-3xl flex items-center justify-center mb-6">
        <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
      </div>
      <h3 class="text-xl font-bold text-gray-800 mb-2">Aucune classe assignée</h3>
      <p class="text-gray-600">Vous n'avez pas encore de classes assignées.</p>
    </div>

    <!-- État de chargement -->
    <div *ngIf="loading()" class="flex justify-center items-center py-16">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
      <span class="ml-4 text-gray-600 font-medium">Chargement des présences du jour...</span>
    </div>

    <!-- État d'erreur -->
    <div *ngIf="error()" class="p-6 bg-red-50 border-2 border-red-200 rounded-2xl">
      <div class="flex items-center gap-3">
        <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </div>
        <div>
          <p class="text-red-700 font-bold">Erreur</p>
          <p class="text-red-600 text-sm">{{ error() }}</p>
        </div>
      </div>
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