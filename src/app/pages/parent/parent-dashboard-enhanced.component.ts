// src/app/pages/parent/parent-dashboard.component.ts
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Enfant {
  id: number;
  nom: string;
  prenom: string;
  age: number;
  classe: string;
  niveau: string;
  photoUrl?: string;
}

interface PresenceStats {
  totalJours: number;
  joursPresents: number;
  joursAbsents: number;
  tauxPresence: number;
}

interface ActiviteStats {
  totalActivites: number;
  activitesTerminees: number;
  activitesAVenir: number;
  tauxParticipation: number;
  noteMoyenne: number;
}

interface PaiementEnAttente {
  id: number;
  montant: number;
  type: string;
  enfant: string;
  dateEcheance: string;
  description: string;
}

interface ActiviteProchaine {
  id: number;
  titre: string;
  date: string;
  heure: string;
  type: string;
  enfant: string;
}

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      
      <!-- Welcome Banner -->
      <div class="relative overflow-hidden bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-3xl p-8 text-white shadow-2xl">
        <div class="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 left-0 -mb-4 -ml-4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-4xl font-bold mb-2">Bienvenue, {{ getParentName() }}! 👋</h2>
              <p class="text-white/90 text-lg">Suivez la vie scolaire de vos enfants en temps réel</p>
            </div>
            <div class="hidden md:flex items-center space-x-6">
              <div class="text-center">
                <p class="text-5xl font-bold">{{ enfants().length }}</p>
                <p class="text-white/80 text-sm mt-1">Enfants</p>
              </div>
              <div class="w-px h-16 bg-white/30"></div>
              <div class="text-center">
                <p class="text-5xl font-bold">{{ getTotalActivites() }}</p>
                <p class="text-white/80 text-sm mt-1">Activités</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <!-- Présences -->
        <div class="stats-card group bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div class="flex items-center justify-between mb-4">
            <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span class="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">Ce mois</span>
          </div>
          <h3 class="text-3xl font-bold text-gray-900 mb-1">{{ globalStats().presences }}%</h3>
          <p class="text-sm text-gray-600 font-medium">Taux de présence</p>
          <div class="mt-4 flex items-center gap-2 text-xs text-green-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            <span>+5% vs mois dernier</span>
          </div>
        </div>

        <!-- Activités -->
        <div class="stats-card group bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div class="flex items-center justify-between mb-4">
            <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span class="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">Active</span>
          </div>
          <h3 class="text-3xl font-bold text-gray-900 mb-1">{{ globalStats().activites }}</h3>
          <p class="text-sm text-gray-600 font-medium">Activités en cours</p>
          <div class="mt-4 flex items-center gap-2 text-xs text-blue-600">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
            <span>{{ globalStats().prochaines }} à venir</span>
          </div>
        </div>

        <!-- Paiements -->
        <div class="stats-card group bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <div class="flex items-center justify-between mb-4">
            <div class="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <span class="text-xs font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">En attente</span>
          </div>
          <h3 class="text-3xl font-bold text-gray-900 mb-1">{{ globalStats().paiementsEnAttente }}</h3>
          <p class="text-sm text-gray-600 font-medium">Paiements à régler</p>
          <div class="mt-4">
            <a routerLink="/parent/paiements" class="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1">
              Voir les détails
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Notes -->
        <div class="stats-card group bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <div class="flex items-center justify-between mb-4">
            <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
              </svg>
            </div>
            <span class="text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">Moyenne</span>
          </div>
          <h3 class="text-3xl font-bold text-gray-900 mb-1">{{ globalStats().noteMoyenne }}/20</h3>
          <p class="text-sm text-gray-600 font-medium">Note générale</p>
          <div class="mt-4 flex items-center gap-2 text-xs text-purple-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            <span>Excellent travail!</span>
          </div>
        </div>
      </div>

      <!-- Mes Enfants Section -->
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 mb-1">Mes Enfants</h2>
            <p class="text-sm text-gray-600">Suivi individuel de chaque enfant</p>
          </div>
          <a routerLink="/parent/activites/enfants" 
             class="text-pink-600 hover:text-pink-700 font-semibold text-sm hover:bg-pink-50 px-4 py-2 rounded-xl transition flex items-center gap-2">
            Voir détails
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let enfant of enfants()" class="enfant-card group">
            <div class="flex items-start gap-4 mb-4">
              <div class="relative">
                <div class="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span class="text-white text-2xl font-bold">{{ getInitials(enfant) }}</span>
                </div>
                <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900 mb-1">{{ enfant.prenom }} {{ enfant.nom }}</h3>
                <div class="flex items-center gap-2 text-xs text-gray-600">
                  <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium">{{ enfant.classe }}</span>
                  <span>{{ enfant.age }} ans</span>
                </div>
              </div>
            </div>

            <!-- Stats rapides -->
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="text-center p-3 bg-green-50 rounded-xl">
                <p class="text-2xl font-bold text-green-600">95%</p>
                <p class="text-xs text-gray-600 mt-1">Présence</p>
              </div>
              <div class="text-center p-3 bg-purple-50 rounded-xl">
                <p class="text-2xl font-bold text-purple-600">15.5</p>
                <p class="text-xs text-gray-600 mt-1">Moyenne</p>
              </div>
            </div>

            <!-- Actions rapides -->
            <div class="flex gap-2">
              <a [routerLink]="['/parent/enfants', enfant.id, 'presences']" 
                 class="flex-1 text-center px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-xs font-semibold hover:shadow-lg transition">
                📅 Présences
              </a>
              <a [routerLink]="['/parent/activites/enfant', enfant.id, 'calendrier']" 
                 class="flex-1 text-center px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-xs font-semibold hover:shadow-lg transition">
                🎨 Activités
              </a>
              <a [routerLink]="['/parent/enfants', enfant.id, 'bulletin']" 
                 class="flex-1 text-center px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl text-xs font-semibold hover:shadow-lg transition">
                📊 Bulletin
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Activités Prochaines -->
        <div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-1">Activités Prochaines</h2>
              <p class="text-sm text-gray-600">Cette semaine</p>
            </div>
            <a routerLink="/parent/activites" 
               class="text-blue-600 hover:text-blue-700 font-semibold text-sm hover:bg-blue-50 px-4 py-2 rounded-xl transition">
              Voir tout
            </a>
          </div>

          <div class="space-y-3">
            <div *ngFor="let activite of activitesProchaines()" 
                 class="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl hover:shadow-lg transition group">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <span class="text-2xl">{{ getActivityIcon(activite.type) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-gray-900 mb-1 truncate">{{ activite.titre }}</h4>
                <div class="flex items-center gap-2 text-xs text-gray-600 mb-2">
                  <span class="px-2 py-1 bg-white rounded-lg font-medium">{{ activite.enfant }}</span>
                  <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium">{{ activite.type }}</span>
                </div>
                <div class="flex items-center gap-3 text-xs text-gray-600">
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>{{ activite.date }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>{{ activite.heure }}</span>
                  </div>
                </div>
              </div>
            </div>

            <a routerLink="/parent/activites" 
               class="block w-full text-center py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold hover:shadow-lg transition">
              🔍 Découvrir plus d'activités
            </a>
          </div>
        </div>

        <!-- Paiements en Attente -->
        <div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-1">Paiements en Attente</h2>
              <p class="text-sm text-gray-600">{{ paiementsEnAttente().length }} paiement(s) à régler</p>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-orange-600">{{ getTotalPaiements() }} DT</p>
              <p class="text-xs text-gray-600">Total</p>
            </div>
          </div>

          <div class="space-y-3">
            <div *ngFor="let paiement of paiementsEnAttente()" 
                 class="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl hover:shadow-lg transition group">
              <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <h4 class="font-bold text-gray-900">{{ paiement.montant }} DT</h4>
                  <span class="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-lg">
                    {{ paiement.type }}
                  </span>
                </div>
                <p class="text-sm text-gray-700 mb-2">{{ paiement.description }}</p>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-600">Pour: <span class="font-semibold">{{ paiement.enfant }}</span></span>
                  <span class="text-red-600 font-medium">Échéance: {{ paiement.dateEcheance }}</span>
                </div>
              </div>
            </div>

            <button class="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
              Payer maintenant
            </button>
          </div>
        </div>
      </div>

      <!-- Calendrier de la Semaine -->
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 mb-1">Calendrier de la Semaine</h2>
            <p class="text-sm text-gray-600">Activités et événements programmés</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="p-2 hover:bg-gray-100 rounded-xl transition">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <span class="text-sm font-semibold text-gray-700">6 - 12 Jan 2025</span>
            <button class="p-2 hover:bg-gray-100 rounded-xl transition">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div *ngFor="let jour of calendrierSemaine()" 
               [class]="getCalendarDayClass(jour)">
            <p class="font-bold text-gray-800 mb-2 text-sm">{{ jour.nom }}</p>
            <p [class]="jour.actif ? 'text-3xl font-bold mb-3' : 'text-3xl font-bold text-gray-400 mb-3'">
              {{ jour.numero }}
            </p>
            <div *ngIf="jour.actif" class="space-y-1">
              <div *ngFor="let event of jour.events" 
                   [class]="'text-xs px-2 py-1 rounded-lg font-medium ' + event.class">
                {{ event.label }}
              </div>
            </div>
            <div *ngIf="!jour.actif" class="text-xs text-gray-500">Fermé</div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .stats-card {
      @apply bg-white/80 backdrop-blur-xl rounded-3xl border-2 shadow-xl p-6 
             hover:shadow-2xl transition-all duration-300 hover:-translate-y-1;
    }

    .enfant-card {
      @apply bg-gradient-to-br from-white to-pink-50 backdrop-blur-xl rounded-3xl 
             border border-pink-100 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1;
    }

    .bg-clip-text {
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `]
})
export class ParentDashboardComponent implements OnInit {
  private http = inject(HttpClient);

  // Mock data - À remplacer par des appels API réels
  enfants = signal<Enfant[]>([
    {
      id: 1,
      nom: 'Dupont',
      prenom: 'Emma',
      age: 5,
      classe: 'Moyenne Section',
      niveau: 'MS'
    },
    {
      id: 2,
      nom: 'Dupont',
      prenom: 'Lucas',
      age: 4,
      classe: 'Petite Section',
      niveau: 'PS'
    }
  ]);

  globalStats = signal({
    presences: 94,
    activites: 8,
    prochaines: 3,
    paiementsEnAttente: 2,
    noteMoyenne: 15.8
  });

  activitesProchaines = signal<ActiviteProchaine[]>([
    {
      id: 1,
      titre: 'Atelier Peinture',
      date: 'Lun 06 Jan',
      heure: '10:00',
      type: 'Art',
      enfant: 'Emma'
    },
    {
      id: 2,
      titre: 'Cours de Musique',
      date: 'Mar 07 Jan',
      heure: '14:30',
      type: 'Musique',
      enfant: 'Lucas'
    },
    {
      id: 3,
      titre: 'Sport & Jeux',
      date: 'Mer 08 Jan',
      heure: '11:00',
      type: 'Sport',
      enfant: 'Emma'
    },
    {
      id: 4,
      titre: 'Sortie Nature',
      date: 'Jeu 09 Jan',
      heure: '09:30',
      type: 'Découverte',
      enfant: 'Lucas'
    }
  ]);

  paiementsEnAttente = signal<PaiementEnAttente[]>([
    {
      id: 1,
      montant: 250,
      type: 'Inscription',
      enfant: 'Emma Dupont',
      dateEcheance: '15 Jan 2025',
      description: 'Frais d\'inscription activités du mois'
    },
    {
      id: 2,
      montant: 180,
      type: 'Activité',
      enfant: 'Lucas Dupont',
      dateEcheance: '20 Jan 2025',
      description: 'Cours de musique - Trimestre 2'
    }
  ]);

  calendrierSemaine = signal([
    {
      nom: 'LUN',
      numero: '06',
      actif: true,
      events: [
        { label: '2 activités', class: 'bg-blue-100 text-blue-700' },
        { label: '1 paiement', class: 'bg-orange-100 text-orange-700' }
      ]
    },
    {
      nom: 'MAR',
      numero: '07',
      actif: true,
      events: [
        { label: '3 activités', class: 'bg-blue-100 text-blue-700' },
        { label: 'Bulletin', class: 'bg-purple-100 text-purple-700' }
      ]
    },
    {
      nom: 'MER',
      numero: '08',
      actif: true,
      events: [
        { label: '1 activité', class: 'bg-blue-100 text-blue-700' },
        { label: 'Sortie', class: 'bg-green-100 text-green-700' }
      ]
    },
    {
      nom: 'JEU',
      numero: '09',
      actif: true,
      events: [
        { label: '2 activités', class: 'bg-blue-100 text-blue-700' }
      ]
    },
    {
      nom: 'VEN',
      numero: '10',
      actif: true,
      events: [
        { label: '3 activités', class: 'bg-blue-100 text-blue-700' },
        { label: 'Réunion', class: 'bg-pink-100 text-pink-700' }
      ]
    },
    {
      nom: 'SAM',
      numero: '11',
      actif: false,
      events: []
    },
    {
      nom: 'DIM',
      numero: '12',
      actif: false,
      events: []
    }
  ]);

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // TODO: Implémenter les appels API réels
    // this.http.get('/api/parent/enfants').subscribe(...)
    // this.http.get('/api/parent/activites/prochaines').subscribe(...)
    // this.http.get('/api/parent/paiements/en-attente').subscribe(...)
  }

  getParentName(): string {
    return localStorage.getItem('sk_user_name') || 'Parent';
  }

  getTotalActivites(): number {
    return this.globalStats().activites + this.globalStats().prochaines;
  }

  getInitials(enfant: Enfant): string {
    return (enfant.prenom[0] + enfant.nom[0]).toUpperCase();
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'Art': '🎨',
      'Musique': '🎵',
      'Sport': '⚽',
      'Découverte': '🔬',
      'Lecture': '📚',
      'Danse': '💃'
    };
    return icons[type] || '🎯';
  }

  getTotalPaiements(): number {
    return this.paiementsEnAttente().reduce((sum, p) => sum + p.montant, 0);
  }

  getCalendarDayClass(jour: any): string {
    if (!jour.actif) {
      return 'text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 opacity-50';
    }
    
    const colors = [
      'from-pink-50 to-orange-50 border-pink-200',
      'from-orange-50 to-yellow-50 border-orange-200',
      'from-yellow-50 to-green-50 border-yellow-200',
      'from-green-50 to-teal-50 border-green-200',
      'from-teal-50 to-blue-50 border-teal-200'
    ];
    
    const colorIndex = parseInt(jour.numero) % colors.length;
    return `text-center p-4 bg-gradient-to-br ${colors[colorIndex]} rounded-2xl border hover:shadow-lg transition group`;
  }
}