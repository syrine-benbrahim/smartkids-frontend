// src/app/pages/admin/inscriptions/liste-attente.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InscriptionsApiService } from '../../../services/inscriptions-api.service';

@Component({
  selector: 'app-liste-attente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-4 sm:p-6">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="card bg-gradient-to-r from-purple-500 to-blue-600 text-white mb-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
              </div>
              <div>
                <h1 class="text-3xl font-black">Liste d'attente</h1>
                <p class="text-blue-100" *ngIf="classe()">
                  Classe {{ classe()?.nom }} - {{ classe()?.niveau }}
                </p>
              </div>
            </div>
            
            <button
              class="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-2xl font-bold transition-all duration-200"
              (click)="back()"
            >
              ← Retour
            </button>
          </div>
        </div>

        <!-- Statistics and Mode Toggle -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <!-- Statistics -->
          <div class="card">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800">Statistiques</h3>
            </div>

            <div class="grid grid-cols-2 gap-4" *ngIf="statistiques()">
              <div class="text-center p-3 bg-green-50 rounded-2xl">
                <div class="text-2xl font-black text-green-600">
                  {{ statistiques()?.places_occupees }}/{{ statistiques()?.capacite_max }}
                </div>
                <div class="text-sm font-medium text-green-800">Places occupées</div>
              </div>

              <div class="text-center p-3 bg-blue-50 rounded-2xl">
                <div class="text-2xl font-black text-blue-600">{{ statistiques()?.places_disponibles }}</div>
                <div class="text-sm font-medium text-blue-800">Places libres</div>
              </div>

              <div class="text-center p-3 bg-orange-50 rounded-2xl">
                <div class="text-2xl font-black text-orange-600">{{ candidats().length }}</div>
                <div class="text-sm font-medium text-orange-800">En attente</div>
              </div>

              <div class="text-center p-3 bg-purple-50 rounded-2xl">
                <div class="text-2xl font-black text-purple-600">{{ statistiques()?.en_attente_traitement || 0 }}</div>
                <div class="text-sm font-medium text-purple-800">À traiter</div>
              </div>
            </div>
          </div>

          <!-- Mode Toggle -->
          <div class="card">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800">Mode de gestion</h3>
            </div>

            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div>
                  <div class="font-bold text-gray-900">Mode automatique FIFO</div>
                  <div class="text-sm text-gray-600">
                    Traitement automatique dans l'ordre d'arrivée
                  </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    class="sr-only peer"
                    [checked]="modeAutomatique()"
                    (change)="toggleModeAutomatique()"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div class="text-xs text-gray-500 p-3 bg-blue-50 rounded-xl">
                <strong>Mode automatique :</strong> Les candidats sont traités automatiquement dans l'ordre FIFO quand une place se libère.<br>
                <strong>Mode manuel :</strong> Vous choisissez manuellement quel candidat accepter depuis la liste.
              </div>
            </div>
          </div>
        </div>

        <!-- Candidates List -->
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800">Candidats en liste d'attente</h3>
            </div>
            
            <div class="text-sm text-gray-600">
              {{ candidats().length }} candidat(s) en attente
            </div>
          </div>

          <!-- Loading -->
          <div *ngIf="loading()" class="text-center py-12">
            <div class="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-600">Chargement de la liste d'attente...</p>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading() && candidats().length === 0" class="text-center py-12">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
            </svg>
            <p class="text-gray-500 text-lg font-medium">Aucun candidat en liste d'attente</p>
            <p class="text-gray-400">Toutes les places sont libres ou toutes les inscriptions ont été traitées</p>
          </div>

          <!-- Candidates Table -->
          <div *ngIf="!loading() && candidats().length > 0" class="space-y-4">
            <div 
              *ngFor="let candidat of candidats(); let i = index; trackBy: trackByCandidat"
              class="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200"
              [class.border-blue-300]="i === 0"
              [class.bg-blue-50]="i === 0"
            >
              <div class="flex items-center justify-between">
                <!-- Candidate Info -->
                <div class="flex items-center gap-4">
                  <!-- Position Badge -->
                  <div class="flex-shrink-0">
                    <div 
                      class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg"
                      [class]="getPositionBadgeClass(candidat.position)"
                    >
                      #{{ candidat.position }}
                    </div>
                  </div>

                  <!-- Child Info -->
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center">
                      <span class="text-white font-bold">
                        {{ getInitials(candidat.enfant?.prenom, candidat.enfant?.nom) }}
                      </span>
                    </div>
                    <div>
                      <div class="text-lg font-bold text-gray-900">
                        {{ candidat.enfant?.prenom }} {{ candidat.enfant?.nom }}
                      </div>
                      <div class="text-sm text-gray-600">
                        {{ candidat.enfant?.age }} ans • Inscrit le {{ formatDate(candidat.date_inscription) }}
                      </div>
                      <div class="text-xs text-gray-500 mt-1">
                        {{ candidat.anciennete_attente }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2">
                  <button
                    *ngIf="statistiques()?.places_disponibles > 0"
                    class="px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2"
                    (click)="choisirCandidat(candidat)"
                    title="Accepter directement ce candidat"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    Choisir
                  </button>

                  <button
                    class="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2"
                    (click)="remettreEnTraitement(candidat)"
                    title="Remettre en traitement pour validation manuelle"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Traiter
                  </button>

                  <button
                    class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Voir détails"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Remarks -->
              <div *ngIf="candidat.remarques" class="mt-4 p-3 bg-gray-50 rounded-xl">
                <div class="text-xs font-bold text-gray-700 mb-1">Remarques :</div>
                <div class="text-sm text-gray-600">{{ candidat.remarques }}</div>
              </div>

              <!-- Next in line indicator -->
              <div *ngIf="i === 0 && !modeAutomatique()" class="mt-4 p-3 bg-blue-100 border border-blue-200 rounded-xl">
                <div class="flex items-center gap-2 text-blue-700">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  <span class="text-sm font-bold">Prochain dans la file d'attente</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Confirmation Modal -->
        <div *ngIf="showModal()" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-3xl p-8 max-w-md w-full mx-4">
            <div class="text-center mb-6">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                   [class]="modalAction() === 'choisir' ? 'bg-green-100' : 'bg-blue-100'">
                <svg class="w-8 h-8" 
                     [class]="modalAction() === 'choisir' ? 'text-green-600' : 'text-blue-600'"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path *ngIf="modalAction() === 'choisir'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  <path *ngIf="modalAction() === 'traiter'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">
                {{ modalAction() === 'choisir' ? 'Choisir ce candidat' : 'Remettre en traitement' }}
              </h3>
              <p class="text-gray-600">
                {{ getModalMessage() }}
              </p>
            </div>

            <div class="flex gap-4">
              <button
                class="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-2xl font-bold transition-colors"
                (click)="cancelModal()"
              >
                Annuler
              </button>
              <button
                class="flex-1 text-white px-6 py-3 rounded-2xl font-bold transition-colors"
                [class]="modalAction() === 'choisir' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'"
                (click)="confirmModal()"
              >
                Confirmer
              </button>
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
export class ListeAttenteComponent {
  private api = inject(InscriptionsApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(true);
  classe = signal<any>(null);
  candidats = signal<any[]>([]);
  statistiques = signal<any>(null);
  modeAutomatique = signal(false);
  
  showModal = signal(false);
  modalAction = signal<'choisir' | 'traiter'>('choisir');
  selectedCandidat = signal<any>(null);

  classeId!: number;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.classeId = +params['id'];
      this.loadData();
    });
  }

  private loadData() {
    this.loading.set(true);
    
    this.api.getListeAttente(this.classeId).subscribe({
      next: (response) => {
        const data = response.data || response;
        this.classe.set(data.classe);
        this.candidats.set(data.candidats || []);
        this.statistiques.set(data.statistiques);
        this.modeAutomatique.set(data.mode_automatique || false);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading waiting list:', err);
        this.loading.set(false);
      }
    });
  }

  toggleModeAutomatique() {
    const newMode = !this.modeAutomatique();
    
    this.api.toggleModeAutomatique(this.classeId, newMode).subscribe({
      next: () => {
        this.modeAutomatique.set(newMode);
      },
      error: (err) => {
        console.error('Error toggling auto mode:', err);
      }
    });
  }

  choisirCandidat(candidat: any) {
    this.selectedCandidat.set(candidat);
    this.modalAction.set('choisir');
    this.showModal.set(true);
  }

  remettreEnTraitement(candidat: any) {
    this.selectedCandidat.set(candidat);
    this.modalAction.set('traiter');
    this.showModal.set(true);
  }

  confirmModal() {
    const candidat = this.selectedCandidat();
    const action = this.modalAction();
    
    if (!candidat) return;

    if (action === 'choisir') {
      this.api.choisirCandidat(this.classeId, candidat.id).subscribe({
        next: () => {
          this.showModal.set(false);
          this.loadData();
        },
        error: (err) => console.error('Error choosing candidate:', err)
      });
    } else {
      this.api.remettreEnTraitement(this.classeId, candidat.id).subscribe({
        next: () => {
          this.showModal.set(false);
          this.loadData();
        },
        error: (err) => console.error('Error putting back in treatment:', err)
      });
    }
  }

  cancelModal() {
    this.showModal.set(false);
    this.selectedCandidat.set(null);
  }

  getModalMessage(): string {
    const candidat = this.selectedCandidat();
    if (!candidat) return '';
    
    const name = `${candidat.enfant?.prenom} ${candidat.enfant?.nom}`;
    const action = this.modalAction();
    
    if (action === 'choisir') {
      return `Êtes-vous sûr de vouloir accepter directement ${name} ? Cette action libérera sa place dans la liste d'attente.`;
    } else {
      return `Êtes-vous sûr de vouloir remettre ${name} en traitement ? Il sera retiré de la liste d'attente et vous pourrez le traiter manuellement.`;
    }
  }

  getPositionBadgeClass(position: number): string {
    if (position === 1) {
      return 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white';
    } else if (position <= 3) {
      return 'bg-gradient-to-br from-blue-400 to-blue-600 text-white';
    } else {
      return 'bg-gradient-to-br from-gray-400 to-gray-600 text-white';
    }
  }

  getInitials(prenom: string = '', nom: string = ''): string {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  trackByCandidat(index: number, candidat: any): number {
    return candidat.id;
  }

  back() {
    this.router.navigate(['/admin/inscriptions']);
  }
}