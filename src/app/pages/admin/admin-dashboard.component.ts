import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4 sm:p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="relative mb-8">
          <div class="card relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10"></div>
            
            <div class="relative flex flex-col lg:flex-row items-center justify-between gap-6">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.414-5.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </div>
                <div>
                  <h1 class="text-3xl font-black text-gray-800 tracking-tight">
                    Tableau de bord Admin
                  </h1>
                  <p class="text-gray-600 font-medium">
                    Gestion complète du jardin d'enfants
                  </p>
                </div>
              </div>
              
              <button 
                class="btn-secondary bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                (click)="logout()"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Se déconnecter
              </button>
            </div>
          </div>
        </div>

        <!-- Cartes principales -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <!-- Gestion des Menus (FONCTIONNEL) -->
          <div class="card bg-gradient-to-br from-orange-50 to-red-100 border-orange-200 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
               routerLink="/admin/menus">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-orange-800">Menus</h3>
                <p class="text-orange-600 text-sm font-medium">FONCTIONNEL</p>
              </div>
            </div>
            <p class="text-orange-700 mb-6">Planification des repas hebdomadaires</p>
            <div class="flex items-center justify-between">
              <span class="text-orange-600 font-semibold text-sm">Accéder →</span>
              <div class="flex gap-2">
                <div class="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <div class="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style="animation-delay: 0.5s;"></div>
                <div class="w-2 h-2 bg-orange-600 rounded-full animate-pulse" style="animation-delay: 1s;"></div>
              </div>
            </div>
          </div>

          <!-- Activités (NOUVEAU - FONCTIONNEL) -->
          <div class="card bg-gradient-to-br from-teal-50 to-blue-100 border-teal-200 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
               routerLink="/admin/activites">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a4 4 0 014 4v1a2 2 0 002 2 2 2 0 002-2v-1a4 4 0 014-4h1m-1-4a2 2 0 012 2v3a2 2 0 01-2 2h-1a4 4 0 00-4 4v1a2 2 0 01-2 2 2 2 0 01-2-2v-1a4 4 0 00-4-4H6a2 2 0 01-2-2V7a2 2 0 012-2 2 2 0 012 2v1a4 4 0 004 4z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-teal-800">Activités</h3>
                <p class="text-teal-600 text-sm font-medium">NOUVEAU - FONCTIONNEL</p>
              </div>
            </div>
            <p class="text-teal-700 mb-6">Gérer les activités pédagogiques et ludiques</p>
            <div class="flex items-center justify-between">
              <span class="text-teal-600 font-semibold text-sm">Accéder →</span>
              <div class="flex gap-2">
                <div class="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                <div class="w-2 h-2 bg-teal-500 rounded-full animate-pulse" style="animation-delay: 0.5s;"></div>
                <div class="w-2 h-2 bg-teal-600 rounded-full animate-pulse" style="animation-delay: 1s;"></div>
              </div>
            </div>
          </div>

          <!-- Gestion des Classes -->
          <div class="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
               routerLink="/admin/classes">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M7 21h2m3 0h2M7 3h2m3 0h2"/>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-blue-800">Classes</h3>
                <p class="text-blue-600 text-sm font-medium">CRUD complet</p>
              </div>
            </div>
            <p class="text-blue-700 mb-6">Gérer les classes, niveaux et capacités</p>
            <div class="flex items-center justify-between">
              <span class="text-blue-600 font-semibold text-sm">Accéder →</span>
              <div class="flex gap-2">
                <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </div>

          <!-- Gestion des Éducateurs -->
          <div class="card bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
               routerLink="/admin/educateurs">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center shadow-lg">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-green-800">Éducateurs</h3>
                <p class="text-green-600 text-sm font-medium">CRUD complet</p>
              </div>
            </div>
            <p class="text-green-700 mb-6">Gérer l'équipe pédagogique</p>
            <div class="flex items-center justify-between">
              <span class="text-green-600 font-semibold text-sm">Accéder →</span>
              <div class="flex gap-2">
                <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <div class="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </div>

          <!-- Gestion des Affectations -->
          <div class="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
               routerLink="/admin/affectations">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-purple-800">Affectations</h3>
                <p class="text-purple-600 text-sm font-medium">Existant</p>
              </div>
            </div>
            <p class="text-purple-700 mb-6">Assigner les éducateurs aux classes</p>
            <div class="flex items-center justify-between">
              <span class="text-purple-600 font-semibold text-sm">Accéder →</span>
              <div class="flex gap-2">
                <div class="w-2 h-2 bg-purple-400 rounded-full"></div>
                <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div class="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          <!-- Parents -->
          <div class="card bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-700 rounded-2xl flex items-center justify-center shadow-lg">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-pink-800">Parents</h3>
                <p class="text-pink-600 text-sm font-medium">À connecter</p>
              </div>
            </div>
            <p class="text-pink-700 mb-6">Gérer les familles et contacts</p>
            <div class="flex items-center justify-between">
              <span class="text-pink-500 font-semibold text-sm opacity-60">Bientôt →</span>
              <div class="flex gap-2">
                <div class="w-2 h-2 bg-pink-300 rounded-full"></div>
                <div class="w-2 h-2 bg-pink-400 rounded-full"></div>
                <div class="w-2 h-2 bg-pink-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <!-- Enfants -->
          <div class="card bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-2xl flex items-center justify-center shadow-lg">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7c-.85.46-2.126.914-3.114 1.147A3.014 3.014 0 003 11.5v1.5a3.014 3.014 0 002.886 3.353L9 17m5-7h2.5a2.5 2.5 0 110 5H14"/>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-cyan-800">Enfants</h3>
                <p class="text-cyan-600 text-sm font-medium">À connecter</p>
              </div>
            </div>
            <p class="text-cyan-700 mb-6">Gérer les inscriptions enfants</p>
            <div class="flex items-center justify-between">
              <span class="text-cyan-500 font-semibold text-sm opacity-60">Bientôt →</span>
              <div class="flex gap-2">
                <div class="w-2 h-2 bg-cyan-300 rounded-full"></div>
                <div class="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <div class="w-2 h-2 bg-cyan-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions rapides -->
        <div class="mt-12">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Actions Rapides</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            
            <button class="card bg-white hover:bg-orange-50 border-2 border-transparent hover:border-orange-200 text-left transition-all duration-200"
                    routerLink="/admin/menus">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                </div>
                <span class="font-bold text-gray-800">Menu Semaine</span>
              </div>
              <p class="text-sm text-gray-600">Planifier les repas hebdomadaires</p>
            </button>

            <button class="card bg-white hover:bg-teal-50 border-2 border-transparent hover:border-teal-200 text-left transition-all duration-200"
                    routerLink="/admin/activites/create">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                </div>
                <span class="font-bold text-gray-800">Nouvelle Activité</span>
              </div>
              <p class="text-sm text-gray-600">Créer une activité pédagogique</p>
            </button>

            <button class="card bg-white hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 text-left transition-all duration-200"
                    routerLink="/admin/classes/create">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                </div>
                <span class="font-bold text-gray-800">Nouvelle Classe</span>
              </div>
              <p class="text-sm text-gray-600">Créer une nouvelle classe</p>
            </button>

            <button class="card bg-white hover:bg-green-50 border-2 border-transparent hover:border-green-200 text-left transition-all duration-200"
                    routerLink="/admin/educateurs/create">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                  </svg>
                </div>
                <span class="font-bold text-gray-800">Nouvel Éducateur</span>
              </div>
              <p class="text-sm text-gray-600">Ajouter un éducateur</p>
            </button>

            <button class="card bg-white hover:bg-purple-50 border-2 border-transparent hover:border-purple-200 text-left transition-all duration-200"
                    routerLink="/admin/affectations">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                  </svg>
                </div>
                <span class="font-bold text-gray-800">Assigner</span>
              </div>
              <p class="text-sm text-gray-600">Gérer les affectations</p>
            </button>
          </div>
        </div>

        <!-- Statistiques rapides -->
        <div class="mt-12">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Aperçu Rapide</h2>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            
            <div class="card bg-gradient-to-br from-orange-50 to-orange-100 text-center">
              <div class="text-3xl font-black text-orange-600 mb-2">--</div>
              <div class="text-sm font-medium text-orange-800">Menus cette semaine</div>
            </div>

            <div class="card bg-gradient-to-br from-teal-50 to-teal-100 text-center">
              <div class="text-3xl font-black text-teal-600 mb-2">--</div>
              <div class="text-sm font-medium text-teal-800">Activités planifiées</div>
            </div>

            <div class="card bg-gradient-to-br from-blue-50 to-blue-100 text-center">
              <div class="text-3xl font-black text-blue-600 mb-2">--</div>
              <div class="text-sm font-medium text-blue-800">Classes actives</div>
            </div>

            <div class="card bg-gradient-to-br from-green-50 to-green-100 text-center">
              <div class="text-3xl font-black text-green-600 mb-2">--</div>
              <div class="text-sm font-medium text-green-800">Éducateurs</div>
            </div>

            <div class="card bg-gradient-to-br from-purple-50 to-purple-100 text-center">
              <div class="text-3xl font-black text-purple-600 mb-2">--</div>
              <div class="text-sm font-medium text-purple-800">Affectations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      @apply bg-white rounded-3xl shadow-lg border border-gray-200 p-6;
    }
  `]
})
export class AdminDashboardComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.auth.logout().subscribe(() => this.router.navigate(['/login']));
  }
}