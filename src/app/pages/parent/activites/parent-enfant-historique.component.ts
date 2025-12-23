import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ParentActivitesApiService, HistoriqueActivite } from '../../../services/parent-activites-api.service';

@Component({
  selector: 'app-parent-enfant-historique',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <button (click)="goBack()" 
                  class="group flex items-center justify-center w-10 h-10 rounded-2xl bg-white border border-gray-200 text-gray-500 hover:text-pink-600 hover:border-pink-200 hover:bg-pink-50 transition-all shadow-sm">
            <svg class="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h2 class="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-2">
              <span class="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">Historique</span>
              <span class="text-2xl">📋</span>
            </h2>
            @if (enfant()) {
              <p class="text-gray-500 font-medium">
                Activités de <span class="text-gray-800 font-bold">{{ enfant()!.prenom }} {{ enfant()!.nom }}</span>
              </p>
            }
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      @if (stats()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Total -->
          <div class="relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-lg border border-indigo-100 group hover:scale-[1.02] transition-transform">
            <div class="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform"></div>
            <div class="relative z-10">
              <div class="flex items-center gap-4 mb-3">
                <div class="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl">
                  🎨
                </div>
                <span class="font-bold text-indigo-900 opacity-70">Total</span>
              </div>
              <h3 class="text-4xl font-black text-gray-800">{{ stats()!.total_activites }}</h3>
              <p class="text-sm text-gray-400 font-medium mt-1">Activités inscrites</p>
            </div>
          </div>

          <!-- Présences -->
          <div class="relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-lg border border-emerald-100 group hover:scale-[1.02] transition-transform">
            <div class="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform"></div>
            <div class="relative z-10">
              <div class="flex items-center gap-4 mb-3">
                <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
                  ✅
                </div>
                <span class="font-bold text-emerald-900 opacity-70">Présences</span>
              </div>
              <h3 class="text-4xl font-black text-gray-800">{{ stats()!.presences }}</h3>
              <p class="text-sm text-gray-400 font-medium mt-1">Participations confirmées</p>
            </div>
          </div>

          <!-- Absences -->
          <div class="relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-lg border border-pink-100 group hover:scale-[1.02] transition-transform">
            <div class="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform"></div>
            <div class="relative z-10">
              <div class="flex items-center gap-4 mb-3">
                <div class="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center text-xl">
                  ❌
                </div>
                <span class="font-bold text-pink-900 opacity-70">Absences</span>
              </div>
              <h3 class="text-4xl font-black text-gray-800">{{ stats()!.absences }}</h3>
              <p class="text-sm text-gray-400 font-medium mt-1">Séances manquées</p>
            </div>
          </div>

          <!-- Taux -->
          <div class="relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-lg border border-amber-100 group hover:scale-[1.02] transition-transform">
            <div class="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform"></div>
            <div class="relative z-10">
              <div class="flex items-center gap-4 mb-3">
                <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl">
                  📈
                </div>
                <span class="font-bold text-amber-900 opacity-70">Participation</span>
              </div>
              <h3 class="text-4xl font-black text-gray-800">{{ stats()!.taux_participation }}%</h3>
              <p class="text-sm text-gray-400 font-medium mt-1">Taux de présence</p>
            </div>
          </div>
        </div>
      }

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-20">
          <div class="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
          <p class="mt-4 text-gray-400 font-medium animate-pulse">Chargement de l'historique...</p>
        </div>
      }

      <!-- Table Section -->
      @if (!loading() && participations().length > 0) {
        <div class="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50/50 border-b border-gray-100">
                  <th class="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Activité</th>
                  <th class="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Horaire</th>
                  <th class="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                  <th class="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Statut</th>
                  <th class="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Éducateur(s)</th>
                  <th class="px-6 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (item of participations(); track item.activite.id) {
                  <tr class="group hover:bg-gray-50/80 transition-colors">
                    <td class="px-8 py-4">
                      <div class="font-bold text-gray-800 text-base">{{ item.activite.nom }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-lg inline-block">
                        {{ formatDate(item.activite.date) }}
                      </div>
                    </td>
                    <td class="px-6 py-4 text-sm font-medium text-gray-600">
                      {{ item.activite.heure_debut }} - {{ item.activite.heure_fin }}
                    </td>
                    <td class="px-6 py-4">
                      @if (item.activite.type) {
                        <span [class]="getTypeBadgeClass(item.activite.type)">
                          {{ item.activite.type }}
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4">
                      <span [class]="getStatutBadgeClass(item.participation.statut)">
                        {{ getStatutLabel(item.participation.statut) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                       <div class="flex items-center gap-2">
                         @if (item.educateurs && item.educateurs.length > 0) {
                           <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                              {{ item.educateurs[0].nom.charAt(0) }}
                           </div>
                           <span class="font-medium">{{ getEducateursNames(item.educateurs) }}</span>
                         } @else {
                           <span class="text-gray-400">-</span>
                         }
                       </div>
                    </td>
                    <td class="px-6 py-4 text-right">
                      @if (canAnnuler(item)) {
                        <button 
                          (click)="annulerParticipation(item)"
                          class="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1 ml-auto">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                          Annuler
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Empty State -->
      @if (!loading() && participations().length === 0) {
        <div class="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
          <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800">Aucune activité trouvée</h3>
          <p class="text-gray-500 mt-2">Votre enfant n'a pas encore participé à des activités.</p>
          <button (click)="goBack()" class="mt-6 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-xl font-bold shadow-lg shadow-pink-200 hover:scale-105 transition-transform">
            Découvrir les activités
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .fade-in {
      animation: fadeIn 0.4s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ParentEnfantHistoriqueComponent implements OnInit {
  private api = inject(ParentActivitesApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  enfantId = signal(0);
  enfant = signal<any>(null);
  participations = signal<HistoriqueActivite[]>([]);
  stats = signal<any>(null);
  loading = signal(false);

  ngOnInit() {
    this.enfantId.set(Number(this.route.snapshot.paramMap.get('id')));
    this.loadData();
  }

  loadData() {
    this.loading.set(true);

    // Charger l'enfant
    this.api.getEnfants().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const enf = res.data.find(e => e.id === this.enfantId());
          this.enfant.set(enf);
        }
      }
    });

    // Charger les participations
    this.api.getParticipationsEnfant(this.enfantId()).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.participations.set(res.data);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    // Charger les stats
    this.api.getStatistiquesEnfant(this.enfantId()).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.stats.set(res.data);
        }
      }
    });
  }

  canAnnuler(item: HistoriqueActivite): boolean {
    const isInscrit = item.participation.statut === 'inscrit';
    const isFuture = new Date(item.activite.date) > new Date();
    return isInscrit && isFuture;
  }

  annulerParticipation(item: HistoriqueActivite) {
    if (!confirm(`Voulez-vous vraiment annuler la participation à "${item.activite.nom}" ?`)) {
      return;
    }

    this.api.annulerParticipation(item.activite.id, this.enfantId()).subscribe({
      next: (res) => {
        if (res.success) {
          // Success toast could be better, using alert for now
          this.loadData();
        }
      },
      error: (err) => {
        alert('❌ ' + (err.error?.message || 'Erreur lors de l\'annulation'));
      }
    });
  }

  getTypeBadgeClass(type: string): string {
    const base = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ";
    const classes: Record<string, string> = {
      'sport': 'bg-green-100 text-green-700',
      'musique': 'bg-purple-100 text-purple-700',
      'theatre': 'bg-pink-100 text-pink-700',
      'artistique': 'bg-orange-100 text-orange-700',
      'educative': 'bg-blue-100 text-blue-700',
      'ludique': 'bg-yellow-100 text-yellow-700'
    };
    return base + (classes[type] || 'bg-gray-100 text-gray-700');
  }

  getStatutBadgeClass(statut: string): string {
    const base = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ";
    const classes: Record<string, string> = {
      'present': 'bg-emerald-100 text-emerald-700',
      'absent': 'bg-red-100 text-red-700',
      'inscrit': 'bg-amber-100 text-amber-700'
    };
    return base + (classes[statut] || 'bg-gray-100 text-gray-700');
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'present': 'Présent', 'absent': 'Absent', 'inscrit': 'Inscrit'
    };
    return labels[statut] || statut;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' });
  }

  getEducateursNames(educateurs: Array<{ id: number; nom: string }>): string {
    if (!educateurs || educateurs.length === 0) return '-';
    return educateurs.map(e => e.nom).join(', ');
  }

  goBack() {
    this.router.navigate(['/parent/activites/enfants']);
  }
}