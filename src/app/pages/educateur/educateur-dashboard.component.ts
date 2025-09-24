import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { PresenceService } from '../../services/presence.service';

@Component({
  selector: 'app-educateur-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div class="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-4 sm:p-6">
  <!-- Header avec informations utilisateur -->
  <div class="max-w-6xl mx-auto">
    <div class="relative mb-8">
      <!-- Éléments décoratifs -->
      <div class="absolute -top-4 -left-4 w-16 h-16 bg-blue-300 rounded-full opacity-60 animate-bounce" style="animation-delay: 0s;"></div>
      <div class="absolute -top-2 right-10 w-12 h-12 bg-purple-300 rounded-full opacity-60 animate-bounce" style="animation-delay: 0.5s;"></div>
      <div class="absolute top-2 right-32 w-8 h-8 bg-pink-300 rounded-full opacity-60 animate-bounce" style="animation-delay: 1s;"></div>

      <div class="card relative overflow-hidden bg-white/95 backdrop-blur border border-white/60 shadow-2xl">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
        <div class="relative flex flex-col lg:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <!-- Icône éducateur -->
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-black text-gray-800 tracking-tight">
                Dashboard Éducateur 🎓
              </h1>
              <p class="text-gray-600 font-medium">
                Gérer les présences de vos classes
              </p>
            </div>
          </div>
          <!-- Bouton déconnexion -->
          <button
            class="btn-primary bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-red-200 hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            (click)="logout()"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Déconnexion
          </button>
        </div>
      </div>
    </div>

    <!-- Menu de navigation -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
      <!-- Bouton Mes Classes -->
      <button 
        class="group p-6 bg-white/90 backdrop-blur rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left"
        (click)="navigateTo('/educateur/classes')"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-gray-800">Mes Classes</h3>
            <p class="text-sm text-gray-600">Gérer les présences</p>
          </div>
        </div>
      </button>

      <!-- Bouton Présences du jour -->
      <button 
        class="group p-6 bg-white/90 backdrop-blur rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left"
        (click)="navigateTo('/educateur/presences-jour')"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-gray-800">Présences du jour</h3>
            <p class="text-sm text-gray-600">Marquer rapidement</p>
          </div>
        </div>
      </button>

      <!-- Bouton Statistiques -->
      <button 
        class="group p-6 bg-white/90 backdrop-blur rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left"
        (click)="navigateTo('/educateur/statistiques')"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-gray-800">Statistiques</h3>
            <p class="text-sm text-gray-600">Voir les rapports</p>
          </div>
        </div>
      </button>

      <!-- Bouton Historique -->
      <button 
        class="group p-6 bg-white/90 backdrop-blur rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left"
        (click)="navigateTo('/educateur/historique')"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-gray-800">Historique</h3>
            <p class="text-sm text-gray-600">Consulter l'historique</p>
          </div>
        </div>
      </button>
    </div>

    <!-- Résumé des classes (si disponible) -->
    <div *ngIf="classes().length > 0" class="relative">
      <div class="absolute -top-6 -right-6 w-20 h-20 bg-yellow-200 rounded-full opacity-40 animate-pulse"></div>
      <div class="card relative overflow-hidden bg-white/95 backdrop-blur border border-white/60 shadow-2xl">
        <div class="absolute inset-0 bg-gradient-to-br from-green-50/80 via-blue-50/80 to-purple-50/80"></div>
        <div class="relative p-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800">Vos classes ({{ classes().length }})</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div *ngFor="let classe of classes()" 
                 class="p-4 bg-white/80 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                 (click)="navigateTo('/educateur/classes/' + classe.id + '/presences')">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{{ classe.nom }}</h4>
                  <p class="text-sm text-gray-600">{{ classe.niveau }}</p>
                  <p class="text-xs text-gray-500">{{ classe.nombre_enfants }} enfant(s)</p>
                </div>
                <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message de chargement -->
    <div *ngIf="loading()" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <!-- Message d'erreur -->
    <div *ngIf="error()" class="p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
      <div class="flex items-center gap-3">
        <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </div>
        <p class="text-red-700 font-medium">{{ error() }}</p>
      </div>
    </div>
  </div>
</div>
  `
})
export class EducateurDashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private presenceService = inject(PresenceService);

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

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}