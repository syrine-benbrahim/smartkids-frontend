import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ParentActivitesApiService, HistoriqueActivite } from '../../../services/parent-activites-api.service';

@Component({
  selector: 'app-parent-enfant-historique',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 sm:p-8 space-y-12 animate-fade-in text-slate-800 dark:text-slate-100">
      
      <!-- Premium Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div class="flex items-center gap-6">
          <button (click)="goBack()" 
                  class="w-12 h-12 glass dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 hover:text-sea hover:scale-110 transition-all border-white/40 border">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 class="text-3xl sm:text-4xl font-black tracking-tight mb-2">Historique d'Activités</h1>
            <div class="flex items-center gap-3">
              <div class="w-1.5 h-1.5 bg-tangerine rounded-full animate-pulse"></div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]" *ngIf="enfant()">
                Archives de : {{ enfant()!.prenom }} {{ enfant()!.nom }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Matrix -->
      <div *ngIf="stats()" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div class="group relative card-fancy p-8 hover:translate-y-[-4px] transition-all border-white/40 overflow-hidden">
          <div class="absolute -right-4 -top-4 w-24 h-24 bg-sea/5 rounded-full blur-2xl group-hover:bg-sea/10 transition-colors"></div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Programmées</p>
          <div class="flex items-end gap-3">
            <span class="text-4xl font-black leading-none">{{ stats()!.total_activites }}</span>
            <span class="text-sea text-sm mb-1">📅</span>
          </div>
        </div>

        <div class="group relative card-fancy p-8 hover:translate-y-[-4px] transition-all border-white/40 overflow-hidden">
          <div class="absolute -right-4 -top-4 w-24 h-24 bg-matcha/5 rounded-full blur-2xl group-hover:bg-matcha/10 transition-colors"></div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Présences Validées</p>
          <div class="flex items-end gap-3">
            <span class="text-4xl font-black leading-none">{{ stats()!.presences }}</span>
            <span class="text-matcha text-sm mb-1">✅</span>
          </div>
        </div>

        <div class="group relative card-fancy p-8 hover:translate-y-[-4px] transition-all border-white/40 overflow-hidden">
          <div class="absolute -right-4 -top-4 w-24 h-24 bg-blush/5 rounded-full blur-2xl group-hover:bg-blush/10 transition-colors"></div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Absences Notées</p>
          <div class="flex items-end gap-3">
            <span class="text-4xl font-black leading-none">{{ stats()!.absences }}</span>
            <span class="text-blush text-sm mb-1">❌</span>
          </div>
        </div>

        <div class="group relative card-fancy p-8 hover:translate-y-[-4px] transition-all border-white/40 overflow-hidden">
          <div class="absolute -right-4 -top-4 w-24 h-24 bg-butter/5 rounded-full blur-2xl group-hover:bg-butter/10 transition-colors"></div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Taux Engagement</p>
          <div class="flex items-end gap-3">
            <span class="text-4xl font-black leading-none">{{ stats()!.taux_participation }}%</span>
            <span class="text-butter text-sm mb-1">📈</span>
          </div>
        </div>
      </div>

      <!-- Loading Tracker -->
      <div *ngIf="loading()" class="flex flex-col justify-center items-center py-20 animate-pulse">
        <div class="w-16 h-16 border-4 border-t-sea border-slate-200 rounded-full animate-spin mb-4"></div>
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Extraction des archives...</span>
      </div>

      <!-- Participation List -->
      <div *ngIf="!loading() && participations().length > 0" class="space-y-8">
        <div class="flex items-center gap-4">
          <div class="w-1.5 h-6 bg-sea rounded-full"></div>
          <h2 class="text-xl font-black uppercase tracking-widest">Liste des Sessions</h2>
        </div>

        <div class="glass dark:bg-slate-800/40 rounded-[3rem] border-white/60 shadow-xl overflow-hidden overflow-x-auto border-none">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-100 dark:border-slate-700/50">
                <th class="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Détails Activité</th>
                <th class="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporel</th>
                <th class="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Catégorie</th>
                <th class="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Statut</th>
                <th class="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Encadrement / Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
              <tr *ngFor="let item of participations()" class="group hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-all">
                <td class="px-10 py-8">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-100 dark:border-slate-600">
                      {{ getStatutEmoji(item.participation.statut) }}
                    </div>
                    <div>
                      <h4 class="font-black text-slate-900 dark:text-white group-hover:text-sea transition-colors leading-tight">{{ item.activite.nom }}</h4>
                      <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ID-REF : {{ item.activite.id }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-8">
                  <div class="flex flex-col">
                    <span class="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">{{ formatDate(item.activite.date) }}</span>
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ item.activite.heure_debut }} - {{ item.activite.heure_fin }}</span>
                  </div>
                </td>
                <td class="px-6 py-8">
                  <span *ngIf="item.activite.type" 
                        [class]="getTypeBadgeClass(item.activite.type)"
                        class="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20">
                    {{ item.activite.type }}
                  </span>
                </td>
                <td class="px-6 py-8 text-center">
                  <span [class]="getStatutBadgeClass(item.participation.statut)"
                        class="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {{ getStatutLabel(item.participation.statut) }}
                  </span>
                </td>
                <td class="px-10 py-8">
                  <div class="flex items-center justify-end gap-6 text-right">
                    <div class="flex items-center gap-3">
                       <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ getEducateursNames(item.educateurs) }}</span>
                       <div *ngIf="item.educateurs && item.educateurs.length > 0" class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-[10px]">
                         {{ item.educateurs[0].nom.charAt(0) }}
                       </div>
                    </div>
                    <button *ngIf="canAnnuler(item)" 
                            (click)="annulerParticipation(item)"
                            class="p-2 text-slate-300 hover:text-blush hover:bg-blush/10 rounded-xl transition-all active:scale-90"
                            title="Annuler l'inscription">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && participations().length === 0" class="text-center py-20 card-fancy border-dashed border-2 border-white/20 opacity-40">
        <div class="text-6xl mb-6 grayscale">📃</div>
        <h3 class="text-xl font-black mb-2 uppercase tracking-widest">Historique Vierge</h3>
        <p class="text-sm font-medium">Votre enfant n'a pas encore de parcours d'activités enregistré.</p>
        <button (click)="goBack()" class="mt-8 px-8 py-4 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
          Découvrir le catalogue
        </button>
      </div>

    </div>
  `,
  styles: [`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeInUp 0.8s ease-out forwards;
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
    this.api.getEnfants().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const enf = res.data.find(e => e.id === this.enfantId());
          this.enfant.set(enf);
        }
      }
    });

    this.api.getParticipationsEnfant(this.enfantId()).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.participations.set(res.data);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

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
    if (!confirm(`Souhaitez-vous vraiment annuler la participation de votre enfant à l'activité "${item.activite.nom}" ?`)) return;

    this.api.annulerParticipation(item.activite.id, this.enfantId()).subscribe({
      next: (res) => {
        if (res.success) this.loadData();
      },
      error: (err) => {
        alert("Échec de l'annulation : " + (err.error?.message || "Erreur technique"));
      }
    });
  }

  getTypeBadgeClass(type: string): string {
    const colors: Record<string, string> = {
      'sport': 'bg-matcha/10 text-matcha',
      'musique': 'bg-sea/10 text-sea',
      'theatre': 'bg-blush/10 text-blush',
      'artistique': 'bg-tangerine/10 text-tangerine',
      'educative': 'bg-slate-100 text-slate-500',
    };
    return colors[type] || 'bg-slate-100 text-slate-500';
  }

  getStatutBadgeClass(statut: string): string {
    const colors: Record<string, string> = {
      'present': 'bg-matcha text-white',
      'absent': 'bg-blush text-white',
      'inscrit': 'bg-butter text-slate-900 font-black'
    };
    return colors[statut] || 'bg-slate-100 text-slate-500';
  }

  getStatutEmoji(statut: string): string {
    const emojis: Record<string, string> = {
      'present': '✅', 'absent': '❌', 'inscrit': '⏳'
    };
    return emojis[statut] || '📄';
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'present': 'Présent', 'absent': 'Absent', 'inscrit': 'En attente'
    };
    return labels[statut] || statut;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  getEducateursNames(educateurs: Array<{ id: number; nom: string }> | undefined): string {
    if (!educateurs || educateurs.length === 0) return 'Non assigné';
    return educateurs.map(e => e.nom).join(', ');
  }

  goBack() {
    this.router.navigate(['/parent/activites/enfants']);
  }
}