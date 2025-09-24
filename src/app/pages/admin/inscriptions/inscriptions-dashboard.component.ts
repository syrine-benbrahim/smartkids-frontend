import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InscriptionsApiService } from '../../../services/inscriptions-api.service';

@Component({
  selector: 'app-inscriptions-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 sm:p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="card bg-gradient-to-r from-indigo-600 to-purple-700 text-white mb-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <div>
                <h1 class="text-3xl font-black">Tableau de Bord Inscriptions</h1>
                <p class="text-indigo-100">Vue d'ensemble de toutes les inscriptions</p>
              </div>
            </div>
            <button
              routerLink="/admin/inscriptions"
              class="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-2xl font-bold transition-all duration-200 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              Gérer les inscriptions
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading()" class="card text-center py-12">
          <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600">Chargement des données...</p>
        </div>

        <div *ngIf="!loading()">
          <!-- Main Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="card bg-gradient-to-br from-yellow-50 to-orange-100 text-center relative overflow-hidden">
              <div class="absolute -top-4 -right-4 w-16 h-16 bg-orange-300/30 rounded-full"></div>
              <div class="relative">
                <div class="text-4xl font-black text-orange-600 mb-2">{{ stats()?.en_attente || 0 }}</div>
                <div class="text-sm font-bold text-orange-800 mb-2">En attente</div>
                <div class="w-full bg-orange-200 rounded-full h-2">
                  <div 
                    class="bg-orange-500 h-2 rounded-full transition-all duration-500" 
                    [style.width.%]="getPercentage('en_attente')"
                  ></div>
                </div>
              </div>
            </div>

            <div class="card bg-gradient-to-br from-green-50 to-emerald-100 text-center relative overflow-hidden">
              <div class="absolute -top-4 -right-4 w-16 h-16 bg-green-300/30 rounded-full"></div>
              <div class="relative">
                <div class="text-4xl font-black text-green-600 mb-2">{{ stats()?.acceptees || 0 }}</div>
                <div class="text-sm font-bold text-green-800 mb-2">Acceptées</div>
                <div class="w-full bg-green-200 rounded-full h-2">
                  <div 
                    class="bg-green-500 h-2 rounded-full transition-all duration-500" 
                    [style.width.%]="getPercentage('acceptees')"
                  ></div>
                </div>
              </div>
            </div>

            <div class="card bg-gradient-to-br from-blue-50 to-blue-100 text-center relative overflow-hidden">
              <div class="absolute -top-4 -right-4 w-16 h-16 bg-blue-300/30 rounded-full"></div>
              <div class="relative">
                <div class="text-4xl font-black text-blue-600 mb-2">{{ stats()?.en_liste_attente || 0 }}</div>
                <div class="text-sm font-bold text-blue-800 mb-2">Liste d'attente</div>
                <div class="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    class="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                    [style.width.%]="getPercentage('en_liste_attente')"
                  ></div>
                </div>
              </div>
            </div>

            <div class="card bg-gradient-to-br from-red-50 to-red-100 text-center relative overflow-hidden">
              <div class="absolute -top-4 -right-4 w-16 h-16 bg-red-300/30 rounded-full"></div>
              <div class="relative">
                <div class="text-4xl font-black text-red-600 mb-2">{{ stats()?.refusees || 0 }}</div>
                <div class="text-sm font-bold text-red-800 mb-2">Refusées</div>
                <div class="w-full bg-red-200 rounded-full h-2">
                  <div 
                    class="bg-red-500 h-2 rounded-full transition-all duration-500" 
                    [style.width.%]="getPercentage('refusees')"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button
              routerLink="/admin/inscriptions"
              [queryParams]="{statut: 'en_attente'}"
              class="card hover:shadow-xl transition-all duration-300 text-left group bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 hover:border-orange-300"
            >
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-800">Traiter les demandes</h3>
                  <p class="text-gray-600">{{ stats()?.en_attente || 0 }} demandes en attente</p>
                </div>
              </div>
              <div class="text-orange-600 font-semibold group-hover:text-orange-700 transition-colors">
                Accéder aux demandes en attente →
              </div>
            </button>

            <button
              routerLink="/admin/inscriptions"
              [queryParams]="{statut: 'liste_attente'}"
              class="card hover:shadow-xl transition-all duration-300 text-left group bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-300"
            >
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-800">Listes d'attente</h3>
                  <p class="text-gray-600">{{ stats()?.en_liste_attente || 0 }} candidats en attente</p>
                </div>
              </div>
              <div class="text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                Gérer les listes d'attente →
              </div>
            </button>

            <button
              routerLink="/admin/inscriptions"
              [queryParams]="{statut: 'accepte'}"
              class="card hover:shadow-xl transition-all duration-300 text-left group bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-300"
            >
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-800">Inscriptions validées</h3>
                  <p class="text-gray-600">{{ stats()?.acceptees || 0 }} enfants inscrits</p>
                </div>
              </div>
              <div class="text-green-600 font-semibold group-hover:text-green-700 transition-colors">
                Voir les inscriptions acceptées →
              </div>
            </button>
          </div>

          <!-- Recent Inscriptions -->
          <div class="card">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-800">Inscriptions récentes</h3>
              </div>
              <button
                routerLink="/admin/inscriptions"
                class="text-purple-600 hover:text-purple-700 font-semibold text-sm"
              >
                Voir tout →
              </button>
            </div>

            <div *ngIf="inscriptionsRecentes().length === 0" class="text-center py-8">
              <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <p class="text-gray-500">Aucune inscription récente</p>
            </div>

            <div class="space-y-4" *ngIf="inscriptionsRecentes().length > 0">
              <div 
                *ngFor="let inscription of inscriptionsRecentes(); trackBy: trackByInscription"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
                [routerLink]="['/admin/inscriptions', inscription.id]"
              >
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center">
                    <span class="text-white font-bold text-sm">
                      {{ getInitials(inscription.enfant?.prenom, inscription.enfant?.nom) }}
                    </span>
                  </div>
                  <div>
                    <div class="text-lg font-bold text-gray-900">
                      {{ inscription.enfant?.prenom }} {{ inscription.enfant?.nom }}
                    </div>
                    <div class="text-sm text-gray-600">
                      {{ inscription.classe?.nom }} • {{ formatDate(inscription.date_inscription) }}
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center gap-3">
                  <span [class]="getStatutBadgeClass(inscription.statut)">
                    {{ getStatutLabel(inscription.statut) }}
                  </span>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary Charts -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <!-- Status Distribution -->
            <div class="card">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-800">Répartition des statuts</h3>
              </div>

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span class="text-sm font-medium">En attente</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-24 bg-gray-200 rounded-full h-2">
                      <div class="bg-orange-500 h-2 rounded-full" [style.width.%]="getPercentage('en_attente')"></div>
                    </div>
                    <span class="text-sm font-bold text-gray-700 w-12 text-right">{{ stats()?.en_attente || 0 }}</span>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span class="text-sm font-medium">Acceptées</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-24 bg-gray-200 rounded-full h-2">
                      <div class="bg-green-500 h-2 rounded-full" [style.width.%]="getPercentage('acceptees')"></div>
                    </div>
                    <span class="text-sm font-bold text-gray-700 w-12 text-right">{{ stats()?.acceptees || 0 }}</span>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span class="text-sm font-medium">Liste d'attente</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-24 bg-gray-200 rounded-full h-2">
                      <div class="bg-blue-500 h-2 rounded-full" [style.width.%]="getPercentage('en_liste_attente')"></div>
                    </div>
                    <span class="text-sm font-bold text-gray-700 w-12 text-right">{{ stats()?.en_liste_attente || 0 }}</span>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span class="text-sm font-medium">Refusées</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-24 bg-gray-200 rounded-full h-2">
                      <div class="bg-red-500 h-2 rounded-full" [style.width.%]="getPercentage('refusees')"></div>
                    </div>
                    <span class="text-sm font-bold text-gray-700 w-12 text-right">{{ stats()?.refusees || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions Needed -->
            <div class="card">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-800">Actions requises</h3>
              </div>

              <div class="space-y-4">
                <div 
                  *ngIf="stats()?.en_attente > 0"
                  class="p-4 bg-orange-50 border border-orange-200 rounded-2xl cursor-pointer hover:bg-orange-100 transition-colors"
                  routerLink="/admin/inscriptions"
                  [queryParams]="{statut: 'en_attente'}"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <span class="text-white font-bold text-sm">{{ stats()?.en_attente }}</span>
                      </div>
                      <div>
                        <div class="font-bold text-gray-900">Demandes à traiter</div>
                        <div class="text-sm text-gray-600">Accepter, refuser ou mettre en attente</div>
                      </div>
                    </div>
                    <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>

                <div 
                  *ngIf="stats()?.en_liste_attente > 0"
                  class="p-4 bg-blue-50 border border-blue-200 rounded-2xl cursor-pointer hover:bg-blue-100 transition-colors"
                  routerLink="/admin/inscriptions"
                  [queryParams]="{statut: 'liste_attente'}"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span class="text-white font-bold text-sm">{{ stats()?.en_liste_attente }}</span>
                      </div>
                      <div>
                        <div class="font-bold text-gray-900">Listes d'attente à gérer</div>
                        <div class="text-sm text-gray-600">Candidats en attente d'une place</div>
                      </div>
                    </div>
                    <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>

                <div 
                  *ngIf="(stats()?.en_attente || 0) === 0 && (stats()?.en_liste_attente || 0) === 0"
                  class="text-center py-6"
                >
                  <svg class="w-12 h-12 text-green-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <p class="text-green-600 font-medium">Toutes les inscriptions sont traitées !</p>
                  <p class="text-gray-500 text-sm">Aucune action requise pour le moment</p>
                </div>
              </div>
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
export class InscriptionsDashboardComponent implements OnInit {
  private api = inject(InscriptionsApiService);

  loading = signal(true);
  stats = signal<any>({});
  inscriptionsRecentes = signal<any[]>([]);

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.loading.set(true);
    
    this.api.getDashboard().subscribe({
      next: (response) => {
        const data = response.data || response;
        this.stats.set(data.stats || {});
        this.inscriptionsRecentes.set(data.inscriptions_recentes || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        this.loading.set(false);
      }
    });
  }

  getPercentage(type: string): number {
    const stats = this.stats();
    const total = (stats?.en_attente || 0) + (stats?.acceptees || 0) + (stats?.en_liste_attente || 0) + (stats?.refusees || 0);
    if (total === 0) return 0;
    return Math.round(((stats?.[type] || 0) / total) * 100);
  }

  getStatutBadgeClass(statut: string): string {
    const baseClass = 'px-3 py-1 rounded-full text-xs font-bold';
    switch (statut) {
      case 'en_attente': return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'accepte': return `${baseClass} bg-green-100 text-green-800`;
      case 'refuse': return `${baseClass} bg-red-100 text-red-800`;
      case 'liste_attente': return `${baseClass} bg-blue-100 text-blue-800`;
      default: return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'accepte': return 'Acceptée';
      case 'refuse': return 'Refusée';
      case 'liste_attente': return 'Liste d\'attente';
      default: return statut;
    }
  }

  getInitials(prenom: string = '', nom: string = ''): string {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  trackByInscription(index: number, inscription: any): number {
    return inscription.id;
  }
}