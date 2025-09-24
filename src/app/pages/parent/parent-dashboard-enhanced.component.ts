import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { InscriptionsApiService } from '../../services/inscriptions-api.service';

@Component({
  selector: 'app-parent-dashboard-enhanced',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 p-4 sm:p-6">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="card bg-gradient-to-r from-pink-500 to-purple-600 text-white mb-8">
          <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </div>
              <div>
                <h1 class="text-3xl font-black">Espace Parent</h1>
                <p class="text-pink-100">Gérez les inscriptions de vos enfants</p>
              </div>
            </div>
            
            <button 
              class="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-2xl font-bold transition-all duration-200 flex items-center gap-2"
              (click)="logout()"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Se déconnecter
            </button>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            routerLink="/parent/inscriptions/create"
            class="card hover:shadow-xl transition-all duration-300 text-left group bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-300"
          >
            <div class="flex items-center gap-4 mb-4">
              <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-800">Nouvelle Inscription</h3>
                <p class="text-green-600 font-medium">Inscrire votre enfant</p>
              </div>
            </div>
            <p class="text-gray-700 mb-4">Démarrer une nouvelle demande d'inscription pour une classe disponible</p>
            <div class="flex items-center justify-between">
              <span class="text-green-600 font-bold group-hover:text-green-700 transition-colors">
                Commencer l'inscription →
              </span>
              <div class="flex gap-2">
                <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse" style="animation-delay: 0.5s;"></div>
                <div class="w-2 h-2 bg-green-600 rounded-full animate-pulse" style="animation-delay: 1s;"></div>
              </div>
            </div>
          </button>

          <button
            routerLink="/parent/inscriptions"
            class="card hover:shadow-xl transition-all duration-300 text-left group bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-300"
          >
            <div class="flex items-center gap-4 mb-4">
              <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-800">Mes Inscriptions</h3>
                <p class="text-blue-600 font-medium">{{ mesInscriptions().length }} inscription(s)</p>
              </div>
            </div>
            <p class="text-gray-700 mb-4">Suivre le statut de toutes vos demandes d'inscription</p>
            <div class="flex items-center justify-between">
              <span class="text-blue-600 font-bold">
                Voir mes inscriptions →
              </span>
              <div class="text-right">
                <div class="text-sm text-gray-500">Dernière mise à jour</div>
                <div class="text-xs text-gray-400">{{ getLastUpdate() }}</div>
              </div>
            </div>
          </button>
        </div>

        <!-- Loading -->
        <div *ngIf="loading()" class="card text-center py-12">
          <div class="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600">Chargement de vos inscriptions...</p>
        </div>

        <!-- Inscriptions Overview -->
        <div *ngIf="!loading()" class="space-y-8">
          <!-- Status Summary -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="card bg-gradient-to-br from-yellow-50 to-orange-100 text-center">
              <div class="text-3xl font-black text-orange-600 mb-2">{{ getStatCount('en_attente') }}</div>
              <div class="text-sm font-bold text-orange-800">En attente</div>
            </div>

            <div class="card bg-gradient-to-br from-green-50 to-emerald-100 text-center">
              <div class="text-3xl font-black text-green-600 mb-2">{{ getStatCount('accepte') }}</div>
              <div class="text-sm font-bold text-green-800">Acceptées</div>
            </div>

            <div class="card bg-gradient-to-br from-blue-50 to-blue-100 text-center">
              <div class="text-3xl font-black text-blue-600 mb-2">{{ getStatCount('liste_attente') }}</div>
              <div class="text-sm font-bold text-blue-800">En liste d'attente</div>
            </div>

            <div class="card bg-gradient-to-br from-red-50 to-red-100 text-center">
              <div class="text-3xl font-black text-red-600 mb-2">{{ getStatCount('refuse') }}</div>
              <div class="text-sm font-bold text-red-800">Refusées</div>
            </div>
          </div>

          <!-- Inscriptions List -->
          <div class="card">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-800">Toutes mes inscriptions</h3>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="mesInscriptions().length === 0" class="text-center py-12">
              <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <p class="text-gray-500 text-lg font-medium mb-2">Aucune inscription pour le moment</p>
              <p class="text-gray-400 mb-6">Créez votre première demande d'inscription</p>
              <button
                routerLink="/parent/inscriptions/create"
                class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-3 mx-auto"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Nouvelle inscription
              </button>
            </div>

            <!-- Inscriptions Cards -->
            <div *ngIf="mesInscriptions().length > 0" class="space-y-4">
              <div 
                *ngFor="let inscription of mesInscriptions(); trackBy: trackByInscription"
                class="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
                [class]="getInscriptionCardClass(inscription.statut)"
                (click)="viewInscription(inscription)"
              >
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <!-- Inscription Info -->
                  <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-3xl flex items-center justify-center shadow-lg">
                      <span class="text-white font-bold text-lg">
                        {{ getInitials(inscription.enfant?.prenom, inscription.enfant?.nom) }}
                      </span>
                    </div>
                    <div>
                      <div class="text-xl font-bold text-gray-900">
                        {{ inscription.enfant?.prenom }} {{ inscription.enfant?.nom }}
                      </div>
                      <div class="text-gray-600">
                        {{ inscription.classe?.nom }} - {{ inscription.classe?.niveau }}
                      </div>
                      <div class="text-sm text-gray-500 mt-1">
                        Inscrit le {{ formatDate(inscription.date_inscription) }}
                      </div>
                    </div>
                  </div>

                  <!-- Status and Details -->
                  <div class="flex flex-col items-end gap-3">
                    <span [class]="getStatutBadgeClass(inscription.statut)">
                      {{ getStatutLabel(inscription.statut) }}
                    </span>
                    
                    <!-- Position for waiting list -->
                    <div *ngIf="inscription.position_attente" class="text-right">
                      <div class="text-sm font-bold text-blue-600">
                        Position #{{ inscription.position_attente }}
                      </div>
                      <div class="text-xs text-gray-500">dans la liste d'attente</div>
                    </div>

                    <!-- Processing date -->
                    <div *ngIf="inscription.date_traitement" class="text-right">
                      <div class="text-xs text-gray-500">
                        Traité le {{ formatDate(inscription.date_traitement) }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Progress indicator for waiting list -->
                <div *ngIf="inscription.statut === 'liste_attente'" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-blue-700 font-medium">
                      Votre enfant est en liste d'attente
                    </span>
                    <span class="text-blue-600">
                      Position {{ inscription.position_attente }}
                    </span>
                  </div>
                  <div class="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div 
                      class="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      [style.width.%]="getWaitingListProgress(inscription.position_attente)"
                    ></div>
                  </div>
                  <div class="mt-2 text-xs text-blue-600">
                    Vous serez notifié dès qu'une place se libère
                  </div>
                </div>

                <!-- Action buttons -->
                <div class="mt-4 flex justify-end">
                  <button
                    class="text-purple-600 hover:text-purple-700 font-semibold text-sm flex items-center gap-2"
                    (click)="viewInscription(inscription); $event.stopPropagation()"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    Voir détails
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Help Section -->
          <div class="card bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h4 class="text-lg font-bold text-gray-800 mb-2">Comment ça marche ?</h4>
                <div class="space-y-2 text-gray-600">
                  <p class="flex items-start gap-2">
                    <span class="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>En attente :</strong> Votre demande est en cours de traitement par l'administration</span>
                  </p>
                  <p class="flex items-start gap-2">
                    <span class="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Acceptée :</strong> Félicitations ! Votre enfant est inscrit dans la classe</span>
                  </p>
                  <p class="flex items-start gap-2">
                    <span class="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Liste d'attente :</strong> Pas de place actuellement, mais vous êtes prioritaire si une place se libère</span>
                  </p>
                  <p class="flex items-start gap-2">
                    <span class="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Refusée :</strong> La demande n'a pas pu être acceptée (voir les détails pour les raisons)</span>
                  </p>
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
export class ParentDashboardEnhancedComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private api = inject(InscriptionsApiService);

  loading = signal(true);
  mesInscriptions = signal<any[]>([]);

  ngOnInit() {
    this.loadInscriptions();
  }

  private loadInscriptions() {
    this.api.getInscriptions().subscribe({
      next: (response: any) => {
        this.mesInscriptions.set(response.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.mesInscriptions.set([]);
        this.loading.set(false);
      }
    });
  }

  getStatCount(statut: string): number {
    return this.mesInscriptions().filter(i => i.statut === statut).length;
  }

  getLastUpdate(): string {
    return new Date().toLocaleDateString('fr-FR');
  }

  getInscriptionCardClass(statut: string): string {
    switch (statut) {
      case 'en_attente': return 'border-orange-200 bg-orange-50/50';
      case 'accepte': return 'border-green-200 bg-green-50/50';
      case 'refuse': return 'border-red-200 bg-red-50/50';
      case 'liste_attente': return 'border-blue-200 bg-blue-50/50';
      default: return '';
    }
  }

  getStatutBadgeClass(statut: string): string {
    const baseClass = 'px-4 py-2 rounded-full text-sm font-bold';
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
      case 'en_attente': return 'En cours de traitement';
      case 'accepte': return 'Inscription acceptée';
      case 'refuse': return 'Demande refusée';
      case 'liste_attente': return 'En liste d\'attente';
      default: return statut;
    }
  }

  getInitials(prenom: string = '', nom: string = ''): string {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  getWaitingListProgress(position: number): number {
    return Math.max(10, 100 - (position * 10));
  }

  viewInscription(inscription: any) {
    this.router.navigate(['/parent/inscriptions', inscription.id]);
  }

  trackByInscription(index: number, inscription: any): number {
    return inscription.id;
  }

  logout() {
    this.auth.logout().subscribe(() => this.router.navigate(['/login']));
  }
}