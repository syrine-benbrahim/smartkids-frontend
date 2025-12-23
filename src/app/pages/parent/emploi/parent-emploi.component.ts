import { Component, inject, signal, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EmploiService, EmploiSlot } from '../../../services/emploi.service';
import { ParentPresencesApiService, EnfantWithStats } from '../../../services/presences-parent.service';
import { ChildStateService } from '../../../services/child-state.service';

interface GroupedSlots {
  [jourSemaine: number]: EmploiSlot[];
}

interface EmploiData {
  enfantId: number;
  enfantNom: string;
  classeId: number;
  classeNom: string;
  slots: EmploiSlot[];
  weekStart: string;
}

@Component({
  selector: 'app-parent-emploi',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-4 sm:p-8 space-y-12 animate-fade-in text-slate-800 dark:text-slate-100">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-4xl font-black tracking-tight mb-3">📅 Emploi du Temps</h1>
          <div class="h-1.5 w-24 bg-gradient-to-r from-sea to-tangerine rounded-full mb-4"></div>
          <p class="text-slate-500 dark:text-slate-400 font-medium max-w-lg leading-relaxed">
            Consultez l'emploi du temps de vos enfants pour organiser leur semaine en toute sérénité.
          </p>
        </div>
        <button (click)="router.navigate(['/parent'])"
                class="group flex items-center text-xs font-black uppercase tracking-widest text-slate-400 hover:text-sea transition-colors">
          <svg class="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour au tableau de bord
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex flex-col justify-center items-center py-20 space-y-4">
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-t-sea border-slate-200"></div>
        <span class="text-slate-500 font-black text-xs uppercase tracking-widest animate-pulse">Synchronisation des données...</span>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="p-8 glass bg-blush/5 border-blush/20 rounded-[2.5rem] flex items-center gap-6">
        <div class="w-16 h-16 bg-blush/10 rounded-2xl flex items-center justify-center text-3xl">⚠️</div>
        <div>
          <h3 class="text-lg font-black text-blush uppercase tracking-wider mb-1">Erreur de chargement</h3>
          <p class="text-blush/80 font-bold mb-4">{{ error() }}</p>
          <button (click)="loadData()"
                  class="px-6 py-3 bg-blush text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blush/30">
            Réessayer
          </button>
        </div>
      </div>

      <!-- Enfants Selection Grid -->
      <div *ngIf="!loading() && !error()" class="space-y-6">
        <div class="flex items-center gap-4">
          <div class="w-1.5 h-6 bg-tangerine rounded-full"></div>
          <h2 class="text-lg font-black uppercase tracking-widest">Choisir un profil</h2>
        </div>
        
        <div *ngIf="enfants().length === 0" class="text-center py-20 card-fancy border-dashed border-2 border-white/20">
          <div class="text-6xl mb-6 opacity-40">🎒</div>
          <h3 class="text-2xl font-black mb-2">Aucun enfant trouvé</h3>
          <p class="text-slate-500 font-medium">L'accès à l'emploi du temps nécessite un enfant inscrit associé à votre compte.</p>
        </div>

        <div *ngIf="enfants().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button *ngFor="let enfant of enfants()"
                  (click)="selectEnfant(enfant)"
                  [class.ring-2]="selectedEnfant()?.id === enfant.id"
                  [class.ring-sea]="selectedEnfant()?.id === enfant.id"
                  class="group relative glass dark:bg-slate-800/40 rounded-[2rem] p-6 border-white/60 hover:border-sea transition-all shadow-sm flex items-center gap-5 text-left">
            <div [class]="getAvatarClass(enfant.sexe)" 
                 class="w-16 h-16 rounded-[1.2rem] flex items-center justify-center flex-shrink-0 text-2xl font-black text-white shadow-lg group-hover:scale-110 transition-transform">
              {{ getInitials(enfant.nom_complet) }}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-xl font-black truncate group-hover:text-sea transition-colors leading-tight mb-1">{{ enfant.nom_complet }}</h3>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest" *ngIf="enfant.classe">{{ enfant.classe.nom }}</p>
            </div>
            <div *ngIf="selectedEnfant()?.id === enfant.id" class="w-8 h-8 bg-sea rounded-full flex items-center justify-center shadow-lg animate-fade-in shadow-sea/30">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </button>
        </div>
      </div>

      <!-- Main Schedule Viewer -->
      <div *ngIf="selectedEnfant() && !loading() && !error()" class="space-y-10">
        
        <!-- Week Navigation -->
        <div class="glass dark:bg-slate-800/40 rounded-[2.5rem] p-8 border-white/60">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-8">
            <button (click)="previousWeek()"
                    class="order-2 sm:order-1 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-sea transition-colors group">
              <svg class="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
              </svg>
              Sém. Précédente
            </button>

            <div class="order-1 sm:order-2 text-center">
              <div class="text-[10px] font-black text-sea uppercase tracking-[0.3em] mb-2 leading-none">Perspective Hebdomadaire</div>
              <div class="text-2xl font-black tracking-tight">{{ formatWeekRange() }}</div>
            </div>

            <button (click)="nextWeek()"
                    class="order-3 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-sea transition-colors group text-right">
              Sém. Suivante
              <svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Schedule Grid -->
        <div *ngIf="emploiLoading()" class="flex flex-col justify-center items-center py-20 space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-t-sea border-slate-200"></div>
          <span class="text-slate-500 font-black text-[10px] uppercase tracking-widest">Génération du planning...</span>
        </div>

        <div *ngIf="!emploiLoading() && currentEmploi()" class="space-y-8 animate-fade-in">
          
          <!-- Schedule Actions -->
          <div class="flex justify-between items-center px-4">
             <div class="flex items-center gap-4">
              <div class="w-1.5 h-6 bg-sea rounded-full"></div>
              <h2 class="text-lg font-black uppercase tracking-widest">{{ currentEmploi()!.classeNom }}</h2>
            </div>
            <button (click)="printEmploi()"
                    class="px-6 py-3 glass dark:bg-slate-700/50 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
              Version Imprimable
            </button>
          </div>

          <!-- Empty Emploi -->
          <div *ngIf="currentEmploi()!.slots.length === 0" class="p-20 text-center card-fancy border-dashed border-2 border-white/20">
            <div class="text-6xl mb-6 opacity-30">🗓️</div>
            <h3 class="text-xl font-black mb-1">Aucun cours trouvé pour cette période</h3>
            <p class="text-slate-500 font-medium">L'emploi du temps n'a pas encore été configuré pour cette semaine.</p>
          </div>

          <div *ngIf="currentEmploi()!.slots.length > 0" class="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div *ngFor="let jour of jours" class="space-y-6">
              <!-- Day Header -->
              <div class="px-6 py-4 card-fancy border-white/40 text-center shadow-lg">
                <h3 class="text-xs font-black uppercase tracking-[0.2em] text-sea">{{ jour.nom }}</h3>
              </div>

              <div class="space-y-4">
                <div *ngFor="let slot of getSlotsByJour(jour.value)" 
                     class="group relative glass dark:bg-slate-800/40 rounded-[2rem] p-6 border-white/60 hover:border-sea transition-all shadow-sm">
                  
                  <!-- Subject Icon/Image -->
                  <div class="mb-5 relative">
                    <div class="w-14 h-14 bg-gradient-to-br from-sea to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl overflow-hidden group-hover:scale-110 transition-transform">
                      <img *ngIf="slot.matiere_photo" [src]="slot.matiere_photo" class="w-full h-full object-cover">
                      <svg *ngIf="!slot.matiere_photo" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                      </svg>
                    </div>
                    <div class="absolute -bottom-1 -right-1 px-3 py-1 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl">
                      {{ slot.debut.substring(0, 5) }}
                    </div>
                  </div>

                  <h4 class="font-black text-slate-900 dark:text-white text-lg mb-1 leading-tight group-hover:text-sea transition-colors">{{ slot.matiere_nom }}</h4>
                  <div class="space-y-2">
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <svg class="w-3 h-3 text-sea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      {{ slot.educateur_nom }}
                    </p>
                    <p *ngIf="slot.salle_nom" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <svg class="w-3 h-3 text-matcha" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      </svg>
                      {{ slot.salle_nom }}
                    </p>
                  </div>
                </div>

                <!-- Empty Day Placeholder -->
                <div *ngIf="getSlotsByJour(jour.value).length === 0" class="card-fancy p-10 flex flex-col items-center gap-3 border-dashed border-2 border-white/20 opacity-40">
                  <div class="w-10 h-10 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                    </svg>
                  </div>
                  <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Aucun cours</p>
                </div>
              </div>
            </div>
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
    @media print {
      button, .p-8.glass, .flex.items-end, .space-y-6 {
        display: none !important;
      }
      .max-w-7xl { max-width: 100% !important; }
      .grid { display: block !important; }
      .space-y-12 { space-y: 4 !important; }
      .card-fancy, .glass { border: 1px solid #eee !important; box-shadow: none !important; }
    }
  `]
})
export class ParentEmploiComponent implements OnInit {
  private http = inject(HttpClient);
  private emploiService = inject(EmploiService);
  private parentService = inject(ParentPresencesApiService);
  private childState = inject(ChildStateService);
  router = inject(Router);

  enfants = signal<EnfantWithStats[]>([]);
  selectedEnfant = signal<EnfantWithStats | null>(null);
  currentEmploi = signal<EmploiData | null>(null);
  currentWeekStart = signal<Date>(this.getMonday(new Date()));

  loading = signal(false);
  emploiLoading = signal(false);
  error = signal<string | null>(null);

  jours = [
    { nom: 'Lundi', value: 1 },
    { nom: 'Mardi', value: 2 },
    { nom: 'Mercredi', value: 3 },
    { nom: 'Jeudi', value: 4 },
    { nom: 'Vendredi', value: 5 }
  ];

  constructor() {
    // React to global child selection changes
    effect(() => {
      const selected = this.childState.selectedChild();
      if (selected) {
        this.selectEnfant(selected);
      }
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);

    this.parentService.getEnfants().subscribe({
      next: (response) => {
        if (response.success) {
          this.enfants.set(response.data || []);
          if (response.data?.length === 1) {
            this.selectEnfant(response.data[0]);
          }
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des données');
        this.loading.set(false);
        console.error('Error loading enfants:', err);
      }
    });
  }

  selectEnfant(enfant: EnfantWithStats) {
    this.selectedEnfant.set(enfant);
    if (enfant.classe?.id) {
      this.loadEmploi(enfant.classe.id, enfant);
    } else {
      this.currentEmploi.set(null);
      this.error.set('Cet enfant n\'a pas de classe assignée');
    }
  }

  loadEmploi(classeId: number, enfant: EnfantWithStats) {
    this.emploiLoading.set(true);
    const weekStart = this.formatDate(this.currentWeekStart());

    this.emploiService.getEmploiByClasse(classeId, weekStart).subscribe({
      next: (response) => {
        if (response.success) {
          this.currentEmploi.set({
            enfantId: enfant.id,
            enfantNom: enfant.nom_complet,
            classeId: classeId,
            classeNom: enfant.classe?.nom || 'Classe inconnue',
            slots: response.data || [],
            weekStart: weekStart
          });
        }
        this.emploiLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement de l\'emploi du temps');
        this.emploiLoading.set(false);
        console.error('Error loading emploi:', err);
      }
    });
  }

  getSlotsByJour(jour: number): EmploiSlot[] {
    const emploi = this.currentEmploi();
    if (!emploi) return [];
    return emploi.slots
      .filter(slot => slot.jour_semaine === jour)
      .sort((a, b) => a.debut.localeCompare(b.debut));
  }

  previousWeek() {
    const current = this.currentWeekStart();
    const previous = new Date(current);
    previous.setDate(previous.getDate() - 7);
    this.currentWeekStart.set(previous);
    const enfant = this.selectedEnfant();
    if (enfant?.classe?.id) this.loadEmploi(enfant.classe.id, enfant);
  }

  nextWeek() {
    const current = this.currentWeekStart();
    const next = new Date(current);
    next.setDate(next.getDate() + 7);
    this.currentWeekStart.set(next);
    const enfant = this.selectedEnfant();
    if (enfant?.classe?.id) this.loadEmploi(enfant.classe.id, enfant);
  }

  formatWeekRange(): string {
    const start = this.currentWeekStart();
    const end = new Date(start);
    end.setDate(end.getDate() + 4); // Mon to Fri
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return `${start.toLocaleDateString('fr-FR', options)} — ${end.toLocaleDateString('fr-FR', options)}`;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getAvatarClass(sexe: string): string {
    if (sexe === 'M' || sexe === 'garçon') return 'bg-gradient-to-br from-sea to-blue-600';
    return 'bg-gradient-to-br from-blush to-purple-600';
  }

  printEmploi() {
    window.print();
  }
}