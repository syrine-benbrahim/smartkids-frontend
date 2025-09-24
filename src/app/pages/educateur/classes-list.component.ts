import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PresenceService } from '../../services/presence.service';

@Component({
  selector: 'app-educateur-classes-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div class="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 p-4 sm:p-6">
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="relative mb-8">
      <div class="absolute -top-4 -left-4 w-16 h-16 bg-green-300 rounded-full opacity-60 animate-bounce"></div>
      <div class="absolute -top-2 right-10 w-12 h-12 bg-blue-300 rounded-full opacity-60 animate-bounce" style="animation-delay: 0.5s;"></div>
      
      <div class="card relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10"></div>
        <div class="relative flex flex-col lg:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-black text-gray-800 tracking-tight">
                Mes Classes 📚
              </h1>
              <p class="text-gray-600 font-medium">
                Gérer les présences de vos {{ classes().length }} classe(s)
              </p>
            </div>
          </div>
          <button
            class="btn-primary bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-purple-200 hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
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

    <!-- Liste des classes -->
    <div *ngIf="!loading() && !error() && classes().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        *ngFor="let classe of classes()" 
        class="group relative bg-white/90 backdrop-blur rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer"
        (click)="selectClasse(classe.id)"
      >
        <!-- Fond décoratif -->
        <div class="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <!-- Contenu -->
        <div class="relative p-6">
          <!-- En-tête de la carte -->
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <div class="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>

          <!-- Informations de la classe -->
          <div class="space-y-3">
            <div>
              <h3 class="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                {{ classe.nom }}
              </h3>
              <p class="text-sm text-gray-600 font-medium">{{ classe.niveau }}</p>
            </div>

            <!-- Statistiques -->
            <div class="flex items-center justify-between pt-3 border-t border-gray-200">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Enfants</p>
                  <p class="text-sm font-bold text-gray-800">{{ classe.nombre_enfants }}</p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Capacité max</p>
                  <p class="text-sm font-bold text-gray-800">{{ classe.capacite_max }}</p>
                </div>
              </div>
            </div>

            <!-- Barre de progression de remplissage -->
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-600">Remplissage</span>
                <span class="text-xs font-semibold text-gray-800">
                  {{ getPercentageRemplissage(classe) }}%
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="h-2 rounded-full transition-all duration-300"
                  [class]="getProgressBarColor(classe)"
                  [style.width.%]="getPercentageRemplissage(classe)"
                ></div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-4 pt-4 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              class="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white py-2 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
              (click)="selectClasse(classe.id); $event.stopPropagation()"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Gérer les présences
            </button>
          </div>
        </div>

        <!-- Coin décoratif -->
        <div class="absolute top-0 right-0 w-16 h-16 overflow-hidden">
          <div class="absolute top-2 right-2 w-4 h-4 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full opacity-60 group-hover:scale-125 transition-transform duration-200"></div>
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
      <p class="text-gray-600">Vous n'avez pas encore de classes assignées. Contactez l'administrateur.</p>
    </div>

    <!-- État de chargement -->
    <div *ngIf="loading()" class="flex justify-center items-center py-16">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      <span class="ml-4 text-gray-600 font-medium">Chargement de vos classes...</span>
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
          <p class="text-red-700 font-bold">Erreur de chargement</p>
          <p class="text-red-600 text-sm">{{ error() }}</p>
        </div>
      </div>
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