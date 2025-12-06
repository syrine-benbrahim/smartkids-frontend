// admin-dashboard.component.ts - Updated version
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChatWidgetComponent } from '../../shared/chat-widget/chat-widget.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ChatWidgetComponent],
  template: `
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      
      <!-- Menus Card -->
      <div class="stats-card group">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-orange-600 font-semibold text-sm mb-1">Menus</p>
            <p class="text-4xl font-bold text-gray-900 mb-2">{{ stats().menus }}</p>
            <p class="text-orange-600/80 text-xs">Cette semaine</p>
          </div>
          <div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
        </div>
        <div class="mt-4 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
      </div>

      <!-- Activities Card -->
      <div class="stats-card group">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-teal-600 font-semibold text-sm mb-1">Activités</p>
            <p class="text-4xl font-bold text-gray-900 mb-2">{{ stats().activities }}</p>
            <p class="text-teal-600/80 text-xs">Planifiées</p>
          </div>
          <div class="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
        <div class="mt-4 h-1 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
      </div>

      <!-- Classes Card -->
      <div class="stats-card group">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-600 font-semibold text-sm mb-1">Classes</p>
            <p class="text-4xl font-bold text-gray-900 mb-2">{{ stats().classes }}</p>
            <p class="text-blue-600/80 text-xs">Actives</p>
          </div>
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
        </div>
        <div class="mt-4 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
      </div>

      <!-- Students Card -->
      <div class="stats-card group">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-purple-600 font-semibold text-sm mb-1">Élèves</p>
            <p class="text-4xl font-bold text-gray-900 mb-2">{{ stats().students }}</p>
            <p class="text-purple-600/80 text-xs">Inscrits</p>
          </div>
          <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </div>
        </div>
        <div class="mt-4 h-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <a routerLink="/admin/menus/create" 
         class="quick-action-card group">
        <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Nouveau Menu</h3>
        <p class="text-sm text-gray-600">Créer un menu de la semaine</p>
      </a>

      <a routerLink="/admin/activites/create" 
         class="quick-action-card group">
        <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-400 to-blue-500 rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Nouvelle Activité</h3>
        <p class="text-sm text-gray-600">Planifier une activité</p>
      </a>

      <a routerLink="/admin/classes/create" 
         class="quick-action-card group">
        <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Nouvelle Classe</h3>
        <p class="text-sm text-gray-600">Ajouter une classe</p>
      </a>

      <a routerLink="/admin/educateurs/create" 
         class="quick-action-card group">
        <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Nouvel Éducateur</h3>
        <p class="text-sm text-gray-600">Ajouter un membre</p>
      </a>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      
      <!-- Chat Widget -->
      <div class="lg:col-span-2">
        <div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-2xl font-bold text-gray-900 mb-1">Assistant IA</h3>
              <p class="text-sm text-gray-600">Posez vos questions sur la gestion</p>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span class="text-sm text-green-600 font-medium">En ligne</span>
            </div>
          </div>
          <app-chat-widget></app-chat-widget>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl p-6">
        <h3 class="text-2xl font-bold text-gray-900 mb-6">Activité Récente</h3>
        <div class="space-y-4">
          
          <div class="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl hover:shadow-lg transition group">
            <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-900 text-sm mb-1">Nouveau menu créé</p>
              <p class="text-xs text-gray-600">Menu de la semaine prochaine ajouté</p>
              <p class="text-xs text-green-600 font-medium mt-1">Il y a 2 heures</p>
            </div>
          </div>

          <div class="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl hover:shadow-lg transition group">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-900 text-sm mb-1">Éducateur ajouté</p>
              <p class="text-xs text-gray-600">Nouveau membre de l'équipe</p>
              <p class="text-xs text-blue-600 font-medium mt-1">Il y a 4 heures</p>
            </div>
          </div>

          <div class="flex items-start gap-4 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl hover:shadow-lg transition group">
            <div class="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-900 text-sm mb-1">Activité planifiée</p>
              <p class="text-xs text-gray-600">Sortie au parc demain matin</p>
              <p class="text-xs text-teal-600 font-medium mt-1">Hier</p>
            </div>
          </div>

          <div class="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl hover:shadow-lg transition group">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-900 text-sm mb-1">Nouvelle classe</p>
              <p class="text-xs text-gray-600">Classe moyenne section créée</p>
              <p class="text-xs text-purple-600 font-medium mt-1">Il y a 2 jours</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar Preview -->
    <div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-2xl font-bold text-gray-900 mb-1">Calendrier de la Semaine</h3>
          <p class="text-sm text-gray-600">Aperçu des événements à venir</p>
        </div>
        <a routerLink="/admin/emplois" 
           class="text-pink-600 hover:text-pink-700 font-semibold text-sm hover:bg-pink-50 px-4 py-2 rounded-xl transition flex items-center gap-2">
          Voir tout
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <!-- Monday -->
        <div class="text-center p-4 bg-gradient-to-br from-pink-50 to-orange-50 rounded-2xl border border-pink-100 hover:shadow-lg transition group">
          <p class="font-bold text-gray-800 mb-2 text-sm">LUN</p>
          <p class="text-3xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent mb-2">06</p>
          <div class="space-y-1">
            <div class="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-lg font-medium">3 menus</div>
            <div class="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-lg font-medium">2 activités</div>
          </div>
        </div>

        <!-- Tuesday -->
        <div class="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border border-orange-100 hover:shadow-lg transition">
          <p class="font-bold text-gray-800 mb-2 text-sm">MAR</p>
          <p class="text-3xl font-bold text-orange-600 mb-2">07</p>
          <div class="space-y-1">
            <div class="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-lg font-medium">2 menus</div>
            <div class="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-lg font-medium">3 activités</div>
          </div>
        </div>

        <!-- Wednesday -->
        <div class="text-center p-4 bg-gradient-to-br from-yellow-50 to-green-50 rounded-2xl border border-yellow-100 hover:shadow-lg transition">
          <p class="font-bold text-gray-800 mb-2 text-sm">MER</p>
          <p class="text-3xl font-bold text-green-600 mb-2">08</p>
          <div class="space-y-1">
            <div class="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-lg font-medium">3 menus</div>
            <div class="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-lg font-medium">1 activité</div>
          </div>
        </div>

        <!-- Thursday -->
        <div class="text-center p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl border border-green-100 hover:shadow-lg transition">
          <p class="font-bold text-gray-800 mb-2 text-sm">JEU</p>
          <p class="text-3xl font-bold text-teal-600 mb-2">09</p>
          <div class="space-y-1">
            <div class="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-lg font-medium">2 menus</div>
            <div class="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-lg font-medium">4 activités</div>
          </div>
        </div>

        <!-- Friday -->
        <div class="text-center p-4 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl border border-teal-100 hover:shadow-lg transition">
          <p class="font-bold text-gray-800 mb-2 text-sm">VEN</p>
          <p class="text-3xl font-bold text-blue-600 mb-2">10</p>
          <div class="space-y-1">
            <div class="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-lg font-medium">3 menus</div>
            <div class="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-lg font-medium">2 activités</div>
          </div>
        </div>

        <!-- Saturday -->
        <div class="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 opacity-50">
          <p class="font-bold text-gray-600 mb-2 text-sm">SAM</p>
          <p class="text-3xl font-bold text-gray-400 mb-2">11</p>
          <div class="text-xs text-gray-500">Fermé</div>
        </div>

        <!-- Sunday -->
        <div class="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 opacity-50">
          <p class="font-bold text-gray-600 mb-2 text-sm">DIM</p>
          <p class="text-3xl font-bold text-gray-400 mb-2">12</p>
          <div class="text-xs text-gray-500">Fermé</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-card {
      @apply bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl p-6 
             hover:shadow-2xl transition-all duration-300 hover:-translate-y-1;
    }

    .quick-action-card {
      @apply bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl p-6 
             hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-center cursor-pointer;
    }

    .bg-clip-text {
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `]
})
export class AdminDashboardComponent {
  stats = signal({
    menus: 7,
    activities: 12,
    classes: 8,
    teachers: 24,
    students: 156
  });
}