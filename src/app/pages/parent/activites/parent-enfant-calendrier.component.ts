import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ParentActivitesApiService } from '../../../services/parent-activites-api.service';

@Component({
  selector: 'app-parent-enfant-calendrier',
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
            <h1 class="text-3xl sm:text-4xl font-black tracking-tight mb-2">Calendrier d'Activités</h1>
            <div class="flex items-center gap-3">
              <div class="w-1.5 h-1.5 bg-sea rounded-full animate-pulse"></div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]" *ngIf="enfant()">
                Suivi pour : {{ enfant()!.prenom }} {{ enfant()!.nom }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-white/20 shadow-sm">
          <button (click)="previousMonth()" 
                  class="p-4 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500 hover:text-sea active:scale-95">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="px-8 min-w-[200px] text-center">
            <div class="text-[10px] font-black text-sea uppercase tracking-widest mb-1">{{ annee() }}</div>
            <div class="text-xl font-black tracking-tight">{{ getMoisLabel() }}</div>
          </div>
          <button (click)="nextMonth()" 
                  class="p-4 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500 hover:text-sea active:scale-95">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading Tracker -->
      <div *ngIf="loading()" class="flex flex-col justify-center items-center py-20 animate-pulse">
        <div class="w-16 h-16 border-4 border-t-sea border-slate-200 rounded-full animate-spin mb-4"></div>
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronisation temporelle...</span>
      </div>

      <!-- Main Calendar Grid -->
      <div *ngIf="!loading()" class="space-y-12">
        <div class="glass dark:bg-slate-800/40 rounded-[3rem] p-4 sm:p-8 border-white/60 shadow-xl overflow-hidden relative">
          <div class="absolute top-0 right-0 w-64 h-64 bg-sea/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div class="grid grid-cols-7 gap-3 sm:gap-6 relative z-10">
            <!-- Day Headers -->
            <div *ngFor="let day of ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']" 
                 class="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
              {{ day }}
            </div>
            
            <!-- Blank Padding -->
            <div *ngFor="let blank of blanks()" class="aspect-square opacity-20"></div>
            
            <!-- Calendar Days -->
            <div *ngFor="let day of days()" 
                 [class.bg-sea/10]="isToday(day)"
                 [class.border-sea/30]="isToday(day)"
                 [class.bg-white/40]="!isToday(day)"
                 [class.dark:bg-slate-700/40]="!isToday(day)"
                 class="aspect-square rounded-3xl border border-white/60 p-4 transition-all duration-300 group hover:border-sea hover:scale-105 active:scale-95 relative cursor-default">
              
              <div class="flex justify-between items-start">
                <span [class]="isToday(day) ? 'text-sea' : 'text-slate-400'" 
                      class="text-sm sm:text-lg font-black">{{ day }}</span>
                <div *ngIf="isToday(day)" class="w-1.5 h-1.5 bg-sea rounded-full animate-ping"></div>
              </div>

              <div *ngIf="hasActivity(day)" class="mt-2 space-y-1">
                 <div *ngFor="let act of getActivitiesForDay(day).slice(0, 2)"
                      [class]="getStatutTimelineClass(act.statut_participation)"
                      class="w-full h-1.5 rounded-full shadow-sm"></div>
                 <div *ngIf="getActivitiesCount(day) > 2" class="text-[8px] font-black text-slate-400 text-center uppercase tracking-tighter">
                   +{{ getActivitiesCount(day) - 2 }} plus
                 </div>
              </div>

              <!-- Hover Toolkit -->
              <div class="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-3xl pointer-events-none p-2">
                 <p class="text-[8px] font-black text-slate-900 dark:text-white uppercase tracking-widest text-center" *ngIf="hasActivity(day)">
                   {{ getActivitiesCount(day) }} Activités
                 </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Monthly Activity Feed -->
        <div class="space-y-8">
          <div class="flex items-center gap-4">
            <div class="w-1.5 h-6 bg-matcha rounded-full"></div>
            <h2 class="text-xl font-black uppercase tracking-widest">Activités du mois</h2>
          </div>

          <div *ngIf="activites().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div *ngFor="let activite of activites()" 
                 class="group relative card-fancy p-8 hover:translate-x-2 transition-all border-white/40 flex flex-col justify-between h-full">
              <div class="space-y-6">
                <div class="flex justify-between items-start">
                  <div class="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                    {{ getStatutEmoji(activite.statut_participation) }}
                  </div>
                  <span [class]="getStatutBadgeColor(activite.statut_participation)"
                        class="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">
                    {{ getStatutLabel(activite.statut_participation) }}
                  </span>
                </div>

                <div class="space-y-2">
                  <h3 class="text-xl font-black text-slate-900 dark:text-white group-hover:text-sea transition-colors leading-tight">
                    {{ activite.nom }}
                  </h3>
                  <div class="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span class="text-sea">{{ formatDate(activite.date) }}</span>
                    <span class="opacity-20">•</span>
                    <span>{{ activite.heure_debut }} - {{ activite.heure_fin }}</span>
                  </div>
                </div>

                <div class="flex flex-wrap gap-2">
                   <span *ngIf="activite.type" 
                         [class]="getTypeBadgeColor(activite.type)"
                         class="px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest">
                     {{ activite.type }}
                   </span>
                </div>
              </div>

              <div *ngIf="activite.note_evaluation" class="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                 <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Score Performance</span>
                 <div class="flex items-center gap-1">
                    <span class="text-xl font-black text-butter">★</span>
                    <span class="text-lg font-black text-slate-900 dark:text-white">{{ activite.note_evaluation }}</span>
                    <span class="text-xs font-black text-slate-400">/10</span>
                 </div>
              </div>
            </div>
          </div>

          <div *ngIf="activites().length === 0" class="p-20 text-center card-fancy border-dashed border-2 border-white/20 opacity-40">
            <div class="text-6xl mb-6 grayscale">🌫️</div>
            <p class="font-black text-xs uppercase tracking-widest">Sérénité temporelle : pas d'activités</p>
          </div>
        </div>
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
export class ParentEnfantCalendrierComponent implements OnInit {
  private api = inject(ParentActivitesApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  enfantId = signal(0);
  enfant = signal<any>(null);
  mois = signal(new Date().getMonth() + 1);
  annee = signal(new Date().getFullYear());
  activites = signal<any[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.enfantId.set(Number(this.route.snapshot.paramMap.get('id')));
    this.loadEnfant();
    this.loadCalendrier();
  }

  loadEnfant() {
    this.api.getEnfants().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const enf = res.data.find(e => e.id === this.enfantId());
          this.enfant.set(enf);
        }
      }
    });
  }

  loadCalendrier() {
    this.loading.set(true);
    this.api.getParticipationsEnfant(this.enfantId()).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const filtered = res.data
            .filter((item: any) => {
              const date = new Date(item.activite.date);
              return date.getMonth() + 1 === this.mois() &&
                date.getFullYear() === this.annee();
            })
            .map((item: any) => ({
              id: item.activite.id,
              nom: item.activite.nom,
              date: item.activite.date,
              heure_debut: item.activite.heure_debut,
              heure_fin: item.activite.heure_fin,
              type: item.activite.type,
              statut_participation: item.participation.statut,
              note_evaluation: item.participation.note_evaluation
            }));
          this.activites.set(filtered);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  previousMonth() {
    if (this.mois() === 1) {
      this.mois.set(12);
      this.annee.update(a => a - 1);
    } else {
      this.mois.update(m => m - 1);
    }
    this.loadCalendrier();
  }

  nextMonth() {
    if (this.mois() === 12) {
      this.mois.set(1);
      this.annee.update(a => a + 1);
    } else {
      this.mois.update(m => m + 1);
    }
    this.loadCalendrier();
  }

  getMoisLabel(): string {
    const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return mois[this.mois() - 1];
  }

  blanks(): number[] {
    const firstDay = new Date(this.annee(), this.mois() - 1, 1).getDay();
    const blankCount = firstDay === 0 ? 6 : firstDay - 1;
    return Array(blankCount).fill(0);
  }

  days(): number[] {
    const daysInMonth = new Date(this.annee(), this.mois(), 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  isToday(day: number): boolean {
    const today = new Date();
    return today.getDate() === day && today.getMonth() + 1 === this.mois() && today.getFullYear() === this.annee();
  }

  hasActivity(day: number): boolean {
    return this.activites().some(a => new Date(a.date).getDate() === day);
  }

  getActivitiesForDay(day: number): any[] {
    return this.activites().filter(a => new Date(a.date).getDate() === day);
  }

  getActivitiesCount(day: number): number {
    return this.getActivitiesForDay(day).length;
  }

  getTypeBadgeColor(type: string): string {
    const colors: Record<string, string> = {
      'sport': 'bg-matcha/10 text-matcha border border-matcha/20',
      'musique': 'bg-sea/10 text-sea border border-sea/20',
      'theatre': 'bg-blush/10 text-blush border border-blush/20',
      'artistique': 'bg-tangerine/10 text-tangerine border border-tangerine/20',
      'educative': 'bg-slate-100 text-slate-500',
    };
    return colors[type] || 'bg-slate-100 text-slate-500';
  }

  getStatutBadgeColor(statut: string): string {
    const colors: Record<string, string> = {
      'present': 'bg-matcha/20 text-matcha',
      'absent': 'bg-blush/20 text-blush',
      'inscrit': 'bg-butter/20 text-butter'
    };
    return colors[statut] || 'bg-slate-100 text-slate-500';
  }

  getStatutTimelineClass(statut: string): string {
    const colors: Record<string, string> = {
      'present': 'bg-matcha',
      'absent': 'bg-blush',
      'inscrit': 'bg-butter'
    };
    return colors[statut] || 'bg-slate-300';
  }

  getStatutEmoji(statut: string): string {
    const emojis: Record<string, string> = {
      'present': '✅', 'absent': '❌', 'inscrit': '📝'
    };
    return emojis[statut] || '🗓️';
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'present': 'Confirmé', 'absent': 'Manqué', 'inscrit': 'Programmé'
    };
    return labels[statut] || statut;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  goBack() {
    this.router.navigate(['/parent/activites/enfants']);
  }
}