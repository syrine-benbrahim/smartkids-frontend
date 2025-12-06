import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ParentActivitesApiService, StatistiquesEnfant } from '../../../services/parent-activites-api.service';

interface EnfantWithStats {
  id: number;
  prenom: string;
  nom: string;
  date_naissance: string;
  photo?: string;
  statistiques?: StatistiquesEnfant;
}

@Component({
  selector: 'app-parent-enfants-activites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4 sm:p-6">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="card bg-gradient-to-r from-green-600 to-blue-600 text-white mb-8">
          <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div>
                <h1 class="text-3xl font-black">Suivi des Activités</h1>
                <p class="text-green-100">Activités de vos enfants</p>
              </div>
            </div>
            <button 
              routerLink="/parent/activites"
              class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl font-bold transition-all duration-200 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
              Activités disponibles
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading()" class="card text-center py-12">
          <div class="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600">Chargement des données...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading() && enfants().length === 0" class="card text-center py-12">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          <p class="text-gray-500 text-lg font-medium mb-2">Aucun enfant inscrit</p>
          <p class="text-gray-400 mb-6">Vous devez d'abord inscrire vos enfants</p>
          <button
            routerLink="/parent/inscriptions/create"
            class="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-3 mx-auto"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Nouvelle inscription
          </button>
        </div>

        <!-- Enfants Grid -->
        <div *ngIf="!loading() && enfants().length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div 
            *ngFor="let enfant of enfants(); trackBy: trackByEnfant"
            class="card hover:shadow-xl transition-all duration-300 group"
          >
            <!-- Enfant Header -->
            <div class="flex items-center gap-4 mb-6">
              <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl flex items-center justify-center shadow-lg">
                <img 
                  *ngIf="enfant.photo" 
                  [src]="enfant.photo" 
                  [alt]="enfant.prenom"
                  class="w-full h-full object-cover rounded-3xl"
                >
                <span *ngIf="!enfant.photo" class="text-white font-bold text-lg">
                  {{ getInitials(enfant.prenom, enfant.nom) }}
                </span>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900">{{ enfant.prenom }} {{ enfant.nom }}</h3>
                <p class="text-gray-600">{{ calculateAge(enfant.date_naissance) }} ans</p>
              </div>
            </div>

            <!-- Quick Stats -->
            <div *ngIf="enfant.statistiques" class="grid grid-cols-2 gap-4 mb-6">
              <div class="bg-blue-50 rounded-2xl p-4 text-center">
                <div class="text-2xl font-black text-blue-600 mb-1">{{ enfant.statistiques.total_activites }}</div>
                <div class="text-sm font-medium text-blue-800">Total activités</div>
              </div>
              
              <div class="bg-green-50 rounded-2xl p-4 text-center">
                <div class="text-2xl font-black text-green-600 mb-1">{{ enfant.statistiques.taux_presence }}%</div>
                <div class="text-sm font-medium text-green-800">Taux présence</div>
              </div>

              <div class="bg-purple-50 rounded-2xl p-4 text-center">
                <div class="text-2xl font-black text-purple-600 mb-1">{{ enfant.statistiques.activites_a_venir }}</div>
                <div class="text-sm font-medium text-purple-800">À venir</div>
              </div>

              <div class="bg-orange-50 rounded-2xl p-4 text-center">
                <div class="text-2xl font-black text-orange-600 mb-1">
                  {{ enfant.statistiques.note_moyenne ? enfant.statistiques.note_moyenne.toFixed(1) : 'N/A' }}
                </div>
                <div class="text-sm font-medium text-orange-800">Note moyenne</div>
              </div>
            </div>

            <!-- Répartition par type -->
            <div *ngIf="enfant.statistiques && enfant.statistiques.par_type.length > 0" class="mb-6">
              <h4 class="text-lg font-bold text-gray-800 mb-3">Activités par type</h4>
              <div class="space-y-2">
                <div *ngFor="let type of enfant.statistiques.par_type" class="flex items-center justify-between">
                  <span class="text-gray-700 capitalize">{{ type.type }}</span>
                  <div class="flex items-center gap-2">
                    <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        class="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-500"
                        [style.width.%]="(type.count / enfant.statistiques!.total_activites) * 100"
                      ></div>
                    </div>
                    <span class="text-sm font-bold text-gray-600 min-w-[2rem]">{{ type.count }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Dernières activités -->
            <div *ngIf="enfant.statistiques && enfant.statistiques.dernieres_activites.length > 0" class="mb-6">
              <h4 class="text-lg font-bold text-gray-800 mb-3">Dernières activités</h4>
              <div class="space-y-2">
                <div 
                  *ngFor="let activite of enfant.statistiques.dernieres_activites" 
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div>
                    <div class="font-medium text-gray-900">{{ activite.nom }}</div>
                    <div class="text-sm text-gray-500">{{ formatDate(activite.date_activite) }}</div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span [class]="getStatutBadgeClass(activite.pivot.statut_participation)">
                      {{ getStatutLabel(activite.pivot.statut_participation) }}
                    </span>
                    <span *ngIf="activite.pivot.note_evaluation" class="text-sm font-bold text-gray-600">
                      {{ activite.pivot.note_evaluation }}/20
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <button
                (click)="viewHistorique(enfant)"
                class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Historique
              </button>
              
              <button
                (click)="viewCalendrier(enfant)"
                class="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                Calendrier
              </button>
            </div>
          </div>
        </div>

        <!-- Global Statistics -->
        <div *ngIf="!loading() && enfants().length > 0" class="card mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
          <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">Résumé Famille</h3>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-white/60 rounded-2xl">
              <div class="text-3xl font-black text-indigo-600 mb-2">{{ getTotalActivites() }}</div>
              <div class="text-sm font-bold text-indigo-800">Total activités</div>
            </div>
            
            <div class="text-center p-4 bg-white/60 rounded-2xl">
              <div class="text-3xl font-black text-green-600 mb-2">{{ getAveragePresence() }}%</div>
              <div class="text-sm font-bold text-green-800">Présence moyenne</div>
            </div>
            
            <div class="text-center p-4 bg-white/60 rounded-2xl">
              <div class="text-3xl font-black text-purple-600 mb-2">{{ getActivitesAVenir() }}</div>
              <div class="text-sm font-bold text-purple-800">Prochaines activités</div>
            </div>
            
            <div class="text-center p-4 bg-white/60 rounded-2xl">
              <div class="text-3xl font-black text-orange-600 mb-2">{{ getAverageNote() }}</div>
              <div class="text-sm font-bold text-orange-800">Note famille</div>
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
export class ParentEnfantsActivitesComponent implements OnInit {
  private api = inject(ParentActivitesApiService);
  private router = inject(Router);

  loading = signal(true);
  enfants = signal<EnfantWithStats[]>([]);

  // Données mockées pour les enfants
  private mockEnfants: EnfantWithStats[] = [
    {
      id: 1,
      prenom: 'Emma',
      nom: 'Dupont',
      date_naissance: '2018-03-15',
      photo: undefined
    },
    {
      id: 2,
      prenom: 'Lucas',
      nom: 'Dupont', 
      date_naissance: '2020-07-22',
      photo: undefined
    },
    {
      id: 3,
      prenom: 'Sofia',
      nom: 'Dupont',
      date_naissance: '2017-11-08',
      photo: undefined
    }
  ];

  ngOnInit() {
    this.loadEnfantsWithStats();
  }

  private loadEnfantsWithStats() {
    this.loading.set(true);
    
    // Simuler un délai de chargement
    setTimeout(() => {
      const enfantsWithStatsPromises = this.mockEnfants.map((enfant: EnfantWithStats) => 
        new Promise<EnfantWithStats>((resolve) => {
          this.api.getStatistiquesEnfant(enfant.id).subscribe({
            next: (statsResponse: any) => {
              resolve({
                ...enfant,
                statistiques: statsResponse.success ? statsResponse.data : this.getMockStats(enfant.id)
              });
            },
            error: () => {
              resolve({ 
                ...enfant, 
                statistiques: this.getMockStats(enfant.id)
              });
            }
          });
        })
      );

      Promise.all(enfantsWithStatsPromises).then((enfantsWithStats) => {
        this.enfants.set(enfantsWithStats);
        this.loading.set(false);
      });
    }, 800);
  }

  private getMockStats(enfantId: number): StatistiquesEnfant {
    const baseStats = {
      1: {
        total_activites: 12,
        activites_terminees: 8,
        activites_a_venir: 4,
        presences: 7,
        absences: 1,
        note_moyenne: 16.5,
        taux_presence: 87.5,
        par_type: [
          { type: 'sport', count: 4 },
          { type: 'art', count: 3 },
          { type: 'musique', count: 3 },
          { type: 'science', count: 2 }
        ],
        dernieres_activites: [
          {
            id: 1,
            nom: 'Football',
            type: 'sport',
            date_activite: '2024-03-10',
            heure_debut: '14:00',
            heure_fin: '15:30',
            pivot: {
              statut_participation: 'present' as const,
              note_evaluation: 18,
              remarques: 'Très bonne participation',
              date_inscription: '2024-03-01',
              date_presence: '2024-03-10'
            }
          },
          {
            id: 2,
            nom: 'Peinture',
            type: 'art',
            date_activite: '2024-03-08',
            heure_debut: '10:00',
            heure_fin: '11:30',
            pivot: {
              statut_participation: 'present' as const,
              note_evaluation: 15,
              remarques: 'Créativité développée',
              date_inscription: '2024-02-28',
              date_presence: '2024-03-08'
            }
          }
        ]
      },
      2: {
        total_activites: 8,
        activites_terminees: 5,
        activites_a_venir: 3,
        presences: 4,
        absences: 1,
        note_moyenne: 14.2,
        taux_presence: 80.0,
        par_type: [
          { type: 'sport', count: 3 },
          { type: 'musique', count: 2 },
          { type: 'science', count: 3 }
        ],
        dernieres_activites: [
          {
            id: 3,
            nom: 'Basketball',
            type: 'sport',
            date_activite: '2024-03-09',
            heure_debut: '16:00',
            heure_fin: '17:00',
            pivot: {
              statut_participation: 'present' as const,
              note_evaluation: 16,
              remarques: 'Bon esprit d\'équipe',
              date_inscription: '2024-02-25',
              date_presence: '2024-03-09'
            }
          }
        ]
      },
      3: {
        total_activites: 15,
        activites_terminees: 10,
        activites_a_venir: 5,
        presences: 9,
        absences: 1,
        note_moyenne: 17.8,
        taux_presence: 90.0,
        par_type: [
          { type: 'art', count: 5 },
          { type: 'musique', count: 4 },
          { type: 'lecture', count: 3 },
          { type: 'science', count: 3 }
        ],
        dernieres_activites: [
          {
            id: 4,
            nom: 'Piano',
            type: 'musique',
            date_activite: '2024-03-11',
            heure_debut: '15:00',
            heure_fin: '16:00',
            pivot: {
              statut_participation: 'present' as const,
              note_evaluation: 19,
              remarques: 'Excellente progression',
              date_inscription: '2024-02-20',
              date_presence: '2024-03-11'
            }
          }
        ]
      }
    };

    return baseStats[enfantId as keyof typeof baseStats] || {
      total_activites: 0,
      activites_terminees: 0,
      activites_a_venir: 0,
      presences: 0,
      absences: 0,
      note_moyenne: 0,
      taux_presence: 0,
      par_type: [],
      dernieres_activites: []
    };
  }

  viewHistorique(enfant: EnfantWithStats) {
    this.router.navigate(['/parent/activites/enfant', enfant.id, 'historique']);
  }

  viewCalendrier(enfant: EnfantWithStats) {
    this.router.navigate(['/parent/activites/enfant', enfant.id, 'calendrier']);
  }

  getInitials(prenom: string, nom: string): string {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }

  calculateAge(dateNaissance: string): number {
    const birth = new Date(dateNaissance);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  }

  getStatutBadgeClass(statut: string): string {
    const baseClass = 'px-2 py-1 rounded-full text-xs font-bold';
    switch (statut) {
      case 'present': return `${baseClass} bg-green-100 text-green-800`;
      case 'absent': return `${baseClass} bg-red-100 text-red-800`;
      case 'excuse': return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'en_attente': return `${baseClass} bg-blue-100 text-blue-800`;
      default: return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'present': return 'Présent';
      case 'absent': return 'Absent';
      case 'excuse': return 'Excusé';
      case 'en_attente': return 'En attente';
      default: return statut;
    }
  }

  getTotalActivites(): number {
    return this.enfants().reduce((total, enfant) => 
      total + (enfant.statistiques?.total_activites || 0), 0
    );
  }

  getAveragePresence(): number {
    const enfantsWithStats = this.enfants().filter(e => e.statistiques);
    if (enfantsWithStats.length === 0) return 0;
    
    const totalPresence = enfantsWithStats.reduce((total, enfant) => 
      total + enfant.statistiques!.taux_presence, 0
    );
    return Math.round(totalPresence / enfantsWithStats.length);
  }

  getActivitesAVenir(): number {
    return this.enfants().reduce((total, enfant) => 
      total + (enfant.statistiques?.activites_a_venir || 0), 0
    );
  }

  getAverageNote(): string {
    const enfantsWithNotes = this.enfants().filter(e => 
      e.statistiques?.note_moyenne && e.statistiques.note_moyenne > 0
    );
    
    if (enfantsWithNotes.length === 0) return 'N/A';
    
    const totalNote = enfantsWithNotes.reduce((total, enfant) => 
      total + enfant.statistiques!.note_moyenne!, 0
    );
    return (totalNote / enfantsWithNotes.length).toFixed(1);
  }

  trackByEnfant(index: number, enfant: EnfantWithStats): number {
    return enfant.id;
  }
}