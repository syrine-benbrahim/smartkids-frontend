import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ParentActivitesApiService, ParticipationActivite } from '../../../services/parent-activites-api.service';

@Component({
  selector: 'app-parent-enfant-historique',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
      <div class="max-w-5xl mx-auto">
        <!-- Header -->
        <div class="card bg-gradient-to-r from-blue-600 to-indigo-600 text-white mb-8">
          <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div class="flex items-center gap-4">
              <button 
                routerLink="/parent/activites/enfants"
                class="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h1 class="text-3xl font-black">Historique des Activités</h1>
                <p class="text-blue-100" *ngIf="enfantNom()">{{ enfantNom() }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading()" class="card text-center py-12">
          <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600">Chargement de l'historique...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading() && activites().length === 0" class="card text-center py-12">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-gray-500 text-lg font-medium mb-2">Aucune activité dans l'historique</p>
          <p class="text-gray-400">Votre enfant n'a pas encore participé à des activités</p>
        </div>

        <!-- Timeline -->
        <div *ngIf="!loading() && activites().length > 0" class="space-y-6">
          <div 
            *ngFor="let activite of activites(); let first = first; trackBy: trackByActivite"
            class="card hover:shadow-xl transition-all duration-300 relative"
            [class]="getActiviteCardClass(activite.pivot.statut_participation)"
          >
            <!-- Timeline indicator -->
            <div class="absolute -left-3 top-8 w-6 h-6 rounded-full border-4 border-white shadow-lg"
                 [class]="getTimelineIndicatorClass(activite.pivot.statut_participation)">
            </div>

            <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <!-- Activity Info -->
              <div class="flex-1">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ activite.nom }}</h3>
                    <div class="flex items-center gap-4 text-sm text-gray-600">
                      <div class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        {{ formatDate(activite.date_activite) }}
                      </div>
                      <div class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {{ activite.heure_debut }} - {{ activite.heure_fin }}
                      </div>
                      <div *ngIf="activite.type" [class]="getTypeBadgeClass(activite.type)">
                        {{ getTypeLabel(activite.type) }}
                      </div>
                    </div>
                  </div>

                  <!-- Status Badge -->
                  <span [class]="getStatutBadgeClass(activite.pivot.statut_participation)">
                    {{ getStatutLabel(activite.pivot.statut_participation) }}
                  </span>
                </div>

                <!-- Participation Details -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- Date inscription -->
                  <div class="bg-blue-50 rounded-xl p-4">
                    <div class="text-sm font-semibold text-blue-800 mb-1">Date d'inscription</div>
                    <div class="text-blue-700">{{ formatDate(activite.pivot.date_inscription) }}</div>
                  </div>

                  <!-- Date présence -->
                  <div *ngIf="activite.pivot.date_presence" class="bg-green-50 rounded-xl p-4">
                    <div class="text-sm font-semibold text-green-800 mb-1">Date de présence</div>
                    <div class="text-green-700">{{ formatDate(activite.pivot.date_presence) }}</div>
                  </div>

                  <!-- Note évaluation -->
                  <div *ngIf="activite.pivot.note_evaluation" class="bg-purple-50 rounded-xl p-4">
                    <div class="text-sm font-semibold text-purple-800 mb-1">Évaluation</div>
                    <div class="flex items-center gap-2">
                      <div class="text-2xl font-black text-purple-700">{{ activite.pivot.note_evaluation }}/20</div>
                      <div class="flex gap-1">
                        <svg 
                          *ngFor="let star of getStars(activite.pivot.note_evaluation)"
                          class="w-4 h-4"
                          [class]="star ? 'text-yellow-400 fill-current' : 'text-gray-300'"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Remarques -->
                <div *ngIf="activite.pivot.remarques" class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                    </svg>
                    <div>
                      <div class="text-sm font-semibold text-yellow-800 mb-1">Remarques</div>
                      <div class="text-yellow-700">{{ activite.pivot.remarques }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="flex lg:flex-col gap-2">
                <button
                  (click)="viewDetails(activite)"
                  class="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-semibold transition-colors text-sm"
                >
                  Détails
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div *ngIf="pagination() && pagination()!.last_page > 1" class="card mt-8">
          <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div class="text-sm text-gray-600">
              Page {{ pagination()!.current_page }} sur {{ pagination()!.last_page }}
              ({{ pagination()!.total }} activités au total)
            </div>
            
            <div class="flex gap-2">
              <button
                [disabled]="pagination()!.current_page === 1"
                (click)="goToPage(pagination()!.current_page - 1)"
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
              >
                Précédent
              </button>
              
              <button
                [disabled]="pagination()!.current_page === pagination()!.last_page"
                (click)="goToPage(pagination()!.current_page + 1)"
                class="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>

        <!-- Summary Stats -->
        <div *ngIf="!loading() && activites().length > 0" class="card mt-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <h3 class="text-xl font-bold text-gray-900 mb-4 text-center">Résumé de la participation</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-white/60 rounded-2xl">
              <div class="text-2xl font-black text-green-600 mb-1">{{ getPresenceCount() }}</div>
              <div class="text-sm font-medium text-green-800">Présences</div>
            </div>
            
            <div class="text-center p-4 bg-white/60 rounded-2xl">
              <div class="text-2xl font-black text-red-600 mb-1">{{ getAbsenceCount() }}</div>
              <div class="text-sm font-medium text-red-800">Absences</div>
            </div>
            
            <div class="text-center p-4 bg-white/60 rounded-2xl">
              <div class="text-2xl font-black text-purple-600 mb-1">{{ getAverageNote() }}</div>
              <div class="text-sm font-medium text-purple-800">Note moyenne</div>
            </div>
            
            <div class="text-center p-4 bg-white/60 rounded-2xl">
              <div class="text-2xl font-black text-blue-600 mb-1">{{ getPresenceRate() }}%</div>
              <div class="text-sm font-medium text-blue-800">Taux présence</div>
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
export class ParentEnfantHistoriqueComponent implements OnInit {
  private api = inject(ParentActivitesApiService);
  private route = inject(ActivatedRoute);

  loading = signal(true);
  activites = signal<ParticipationActivite[]>([]);
  pagination = signal<any>(null);
  enfantId = signal<number>(0);
  enfantNom = signal<string>('');
  currentPage = signal(1);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.enfantId.set(parseInt(id));
      this.loadHistorique(1);
    }
  }

  private loadHistorique(page: number = 1) {
    this.loading.set(true);
    this.currentPage.set(page);
    
    this.api.getHistoriqueEnfant(this.enfantId(), page).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.activites.set(response.data.data || []);
          this.pagination.set(response.data);
          
          // Set enfant name from first activity if available
          if (response.data.data && response.data.data.length > 0) {
            // Assuming enfant info is available somewhere in the response
            // You might need to adjust this based on your API response structure
          }
        }
        this.loading.set(false);
      },
      error: () => {
        this.activites.set([]);
        this.pagination.set(null);
        this.loading.set(false);
      }
    });
  }

  goToPage(page: number) {
    this.loadHistorique(page);
  }

  viewDetails(activite: ParticipationActivite) {
    // Navigate to detailed view or show modal
    console.log('Voir détails activité:', activite);
  }

  // Helper methods for styling
  getActiviteCardClass(statut: string): string {
    switch (statut) {
      case 'present': return 'border-l-4 border-green-500 bg-green-50/30';
      case 'absent': return 'border-l-4 border-red-500 bg-red-50/30';
      case 'excuse': return 'border-l-4 border-yellow-500 bg-yellow-50/30';
      case 'en_attente': return 'border-l-4 border-blue-500 bg-blue-50/30';
      default: return 'border-l-4 border-gray-300';
    }
  }

  getTimelineIndicatorClass(statut: string): string {
    switch (statut) {
      case 'present': return 'bg-green-500';
      case 'absent': return 'bg-red-500';
      case 'excuse': return 'bg-yellow-500';
      case 'en_attente': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  }

  getStatutBadgeClass(statut: string): string {
    const baseClass = 'px-4 py-2 rounded-full text-sm font-bold';
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

  getTypeBadgeClass(type: string): string {
    const baseClass = 'px-3 py-1 rounded-full text-xs font-bold';
    switch (type) {
      case 'sport': return `${baseClass} bg-red-100 text-red-800`;
      case 'art': return `${baseClass} bg-purple-100 text-purple-800`;
      case 'musique': return `${baseClass} bg-blue-100 text-blue-800`;
      case 'science': return `${baseClass} bg-green-100 text-green-800`;
      case 'lecture': return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'sortie': return `${baseClass} bg-orange-100 text-orange-800`;
      default: return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'sport': return 'Sport';
      case 'art': return 'Art';
      case 'musique': return 'Musique';
      case 'science': return 'Science';
      case 'lecture': return 'Lecture';
      case 'sortie': return 'Sortie';
      default: return type;
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStars(note: number): boolean[] {
    const fullStars = Math.floor(note / 4); // 20/4 = 5 stars max
    return Array.from({ length: 5 }, (_, i) => i < fullStars);
  }

  // Summary statistics
  getPresenceCount(): number {
    return this.activites().filter(a => a.pivot.statut_participation === 'present').length;
  }

  getAbsenceCount(): number {
    return this.activites().filter(a => a.pivot.statut_participation === 'absent').length;
  }

  getAverageNote(): string {
    const notedActivites = this.activites().filter(a => a.pivot.note_evaluation);
    if (notedActivites.length === 0) return 'N/A';
    
    const total = notedActivites.reduce((sum, a) => sum + a.pivot.note_evaluation!, 0);
    return (total / notedActivites.length).toFixed(1);
  }

  getPresenceRate(): number {
    const finishedActivites = this.activites().filter(a => 
      a.pivot.statut_participation === 'present' || a.pivot.statut_participation === 'absent'
    );
    if (finishedActivites.length === 0) return 0;
    
    const presences = this.getPresenceCount();
    return Math.round((presences / finishedActivites.length) * 100);
  }

  trackByActivite(index: number, activite: ParticipationActivite): number {
    return activite.id;
  }
}