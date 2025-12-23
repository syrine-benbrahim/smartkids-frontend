import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ParentPresencesApiService, EnfantWithStats } from '../../services/presences-parent.service';
import { environment } from '../../../environments/environment';
import { ChildStateService } from '../../services/child-state.service';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div class="p-4 sm:p-8 space-y-12 animate-fade-in text-slate-800 dark:text-slate-100">
  
  <!-- Welcome Hero Section -->
  <div class="relative group">
    <div class="absolute -inset-1 bg-gradient-to-r from-tangerine via-blush to-sea rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
    <div class="relative flex flex-col lg:flex-row items-center justify-between gap-8 p-10 card-fancy overflow-hidden">
      <!-- Background Decorative Elements -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-tangerine/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse"></div>
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-sea/10 rounded-full blur-3xl -ml-24 -mb-24 animate-pulse" style="animation-delay: 2s;"></div>
      
      <div class="flex items-center gap-8 relative z-10">
        <div class="w-20 h-20 bg-gradient-to-br from-tangerine to-blush rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-tangerine/30 transform group-hover:rotate-6 transition-transform">
          <span class="text-4xl">👋</span>
        </div>
        <div>
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
             Hello, {{ getParentName() }}!
          </h1>
          <p class="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-lg mb-6 leading-relaxed">
            Bienvenue dans votre espace parent. Suivez l'évolution de vos enfants en temps réel avec sérénité.
          </p>
          <div class="flex flex-wrap gap-4">
            <a routerLink="/parent/enfants" 
               class="px-8 py-4 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
              Mes Enfants
            </a>
            <a routerLink="/chat" 
               class="px-8 py-4 glass dark:bg-slate-800/60 rounded-2xl font-black text-sm uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-white transition-all border-white/40 border">
              Messages
            </a>
          </div>
        </div>
      </div>

      <!-- Live Status Badge -->
      <div class="hidden lg:flex flex-col items-end gap-2 relative z-10">
        <div class="px-6 py-3 glass bg-matcha/10 border-matcha/20 rounded-2xl flex items-center gap-3">
          <div class="w-2.5 h-2.5 bg-matcha rounded-full animate-pulse shadow-[0_0_10px_#B4B534]"></div>
          <span class="text-xs font-black text-matcha uppercase tracking-widest font-mono">Système Opérationnel</span>
        </div>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mr-2">Dernière mise à jour : instantané</p>
      </div>
    </div>
  </div>

  <!-- Stats Overview -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
    <div class="group relative">
      <div class="absolute -inset-0.5 bg-gradient-to-r from-tangerine to-butter rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
      <div class="relative p-8 glass dark:bg-slate-800/40 rounded-[2.5rem] border-white/60 hover:border-white/80 transition-all">
        <div class="w-14 h-14 bg-tangerine/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <svg class="w-7 h-7 text-tangerine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
          </svg>
        </div>
        <div class="text-4xl font-black mb-1 text-slate-900 dark:text-white">{{ enfants().length }}</div>
        <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Enfant{{ enfants().length > 1 ? 's' : '' }} Inscrits</p>
      </div>
    </div>

    <div class="group relative">
      <div class="absolute -inset-0.5 bg-gradient-to-r from-matcha to-sea rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
      <div class="relative p-8 glass dark:bg-slate-800/40 rounded-[2.5rem] border-white/60 hover:border-white/80 transition-all">
        <div class="w-14 h-14 bg-matcha/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <svg class="w-7 h-7 text-matcha" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="text-4xl font-black mb-1 text-slate-900 dark:text-white">{{ calculateAveragePresence() }}%</div>
        <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Taux de Présence</p>
      </div>
    </div>

    <div class="group relative">
      <div class="absolute -inset-0.5 bg-gradient-to-r from-sea to-blush rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
      <div class="relative p-8 glass dark:bg-slate-800/40 rounded-[2.5rem] border-white/60 hover:border-white/80 transition-all">
        <div class="w-14 h-14 bg-sea/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <svg class="w-7 h-7 text-sea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
        <div class="text-4xl font-black mb-1 text-slate-900 dark:text-white">12</div>
        <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Activités Prévues</p>
      </div>
    </div>

    <div class="group relative">
      <div class="absolute -inset-0.5 bg-gradient-to-r from-blush to-tangerine rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
      <div class="relative p-8 glass dark:bg-slate-800/40 rounded-[2.5rem] border-white/60 hover:border-white/80 transition-all">
        <div class="w-14 h-14 bg-blush/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <svg class="w-7 h-7 text-blush" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
          </svg>
        </div>
        <div class="text-4xl font-black mb-1 text-slate-900 dark:text-white">3</div>
        <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Nouveaux Messages</p>
      </div>
    </div>
  </div>

  <!-- Mes Enfants Section -->
  <div *ngIf="!loading() && !error()">
    <div class="flex items-end justify-between mb-10">
      <div>
        <h2 class="text-3xl font-black tracking-tight mb-2">Mes Enfants</h2>
        <div class="h-1.5 w-20 bg-gradient-to-r from-sea to-tangerine rounded-full"></div>
      </div>
      <a routerLink="/parent/enfants" class="text-xs font-black text-sea uppercase tracking-[0.2em] hover:opacity-70 transition-opacity flex items-center gap-2 group">
        Voir Tout 
        <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
        </svg>
      </a>
    </div>

    <div *ngIf="enfants().length === 0" class="text-center py-20 card-fancy border-dashed border-2 border-white/20">
      <div class="text-6xl mb-6 opacity-40">🎒</div>
      <h3 class="text-2xl font-black mb-2">Aucun enfant listé</h3>
      <p class="text-slate-500 font-medium">Contactez l'administration pour lier vos enfants à votre compte.</p>
    </div>

    <div *ngIf="enfants().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div *ngFor="let enfant of enfants()" 
           class="group relative transition-all duration-500"
           [class.z-10]="childState.selectedChild()?.id === enfant.id"
           [class.scale-105]="childState.selectedChild()?.id === enfant.id"
           (click)="viewEnfant(enfant.id)">
        <div class="absolute -inset-0.5 bg-gradient-to-r [class]='getGradientBorder(enfant.sexe)' rounded-[2.5rem] blur transition duration-500"
             [class.opacity-100]="childState.selectedChild()?.id === enfant.id"
             [class.opacity-0]="childState.selectedChild()?.id !== enfant.id"
             [class.group-hover:opacity-100]="true"></div>
        <div class="relative glass dark:bg-slate-800/40 rounded-[2.5rem] border-white/60 hover:border-white/80 transition-all cursor-pointer overflow-hidden p-8"
             [class.ring-4]="childState.selectedChild()?.id === enfant.id"
             [class.ring-tangerine/30]="childState.selectedChild()?.id === enfant.id && (enfant.sexe === 'M' || enfant.sexe === 'garçon')"
             [class.ring-blush/30]="childState.selectedChild()?.id === enfant.id && (enfant.sexe === 'F' || enfant.sexe === 'fille')">
          
          <!-- Active Indicator Badge -->
          <div *ngIf="childState.selectedChild()?.id === enfant.id" 
               class="absolute top-6 right-6 px-4 py-1.5 bg-tangerine text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-tangerine/30 animate-pulse">
            Enfant Actif
          </div>
          <div class="flex items-center gap-6 mb-8">
            <div [class]="getAvatarClass(enfant.sexe)" class="w-20 h-20 rounded-[1.4rem] flex items-center justify-center text-3xl font-black text-white shadow-2xl group-hover:scale-110 transition-transform">
              {{ getInitials(enfant.nom_complet) }}
            </div>
            <div>
              <h3 class="text-2xl font-black group-hover:text-sea transition-colors leading-tight mb-1">{{ enfant.nom_complet }}</h3>
              <div class="flex flex-wrap gap-2">
                <span class="px-3 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500">{{ enfant.age }} ans</span>
                <span *ngIf="enfant.classe" class="px-3 py-1 bg-sea/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-sea">{{ enfant.classe.nom }}</span>
              </div>
            </div>
          </div>
          <div class="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-700/50">
            <div class="space-y-3">
              <div class="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span>Taux de Présence</span>
                <span [class]="getProgressTextClass(enfant.statistiques_presence.taux_presence)">{{ enfant.statistiques_presence.taux_presence }}%</span>
              </div>
              <div class="h-3 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden p-0.5">
                <div class="h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                     [class]="getProgressBarClass(enfant.statistiques_presence.taux_presence)"
                     [style.width.%]="enfant.statistiques_presence.taux_presence">
                </div>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div class="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-2xl text-center">
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</div>
                <div class="font-black text-lg">{{ enfant.statistiques_presence.total_jours }}</div>
              </div>
              <div class="p-3 bg-matcha/5 dark:bg-matcha/10 rounded-2xl text-center">
                <div class="text-[10px] font-black text-matcha uppercase tracking-widest mb-1">Présent</div>
                <div class="font-black text-lg text-matcha">{{ enfant.statistiques_presence.jours_presents }}</div>
              </div>
              <div class="p-3 bg-blush/5 dark:bg-blush/10 rounded-2xl text-center">
                <div class="text-[10px] font-black text-blush uppercase tracking-widest mb-1">Absent</div>
                <div class="font-black text-lg text-blush">{{ enfant.statistiques_presence.jours_absents }}</div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 mt-8">
            <button (click)="viewPresences($event, enfant.id)" 
                    class="py-4 glass dark:bg-slate-800/60 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-900 hover:text-white transition-all">
              Détails
            </button>
            <button (click)="viewCalendar($event, enfant.id)" 
                    class="py-4 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
              Calendrier
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Quick Access Grid -->
  <div class="space-y-10">
    <div class="flex items-end justify-between">
      <div>
        <h2 class="text-3xl font-black tracking-tight mb-2">Accès Rapide</h2>
        <div class="h-1.5 w-20 bg-gradient-to-r from-blush to-matcha rounded-full"></div>
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <a routerLink="/parent/emploi" class="group relative card-fancy p-8 flex flex-col items-center text-center hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/40">
        <div class="w-16 h-16 bg-sea/10 rounded-2xl flex items-center justify-center mb-6 text-sea group-hover:bg-sea group-hover:text-white transition-all transform group-hover:rotate-6 shadow-2xl shadow-sea/20">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
        <h3 class="font-black uppercase tracking-widest text-xs mb-2">Emploi du Temps</h3>
        <p class="text-xs text-slate-400 font-bold uppercase tracking-wider">Planning de la semaine</p>
      </a>
      <a routerLink="/parent/activites" class="group relative card-fancy p-8 flex flex-col items-center text-center hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/40">
        <div class="w-16 h-16 bg-matcha/10 rounded-2xl flex items-center justify-center mb-6 text-matcha group-hover:bg-matcha group-hover:text-white transition-all transform group-hover:-rotate-6 shadow-2xl shadow-matcha/20">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 class="font-black uppercase tracking-widest text-xs mb-2">Activités</h3>
        <p class="text-xs text-slate-400 font-bold uppercase tracking-wider">Ateliers & Loisirs</p>
      </a>
      <a routerLink="/parent/menus" class="group relative card-fancy p-8 flex flex-col items-center text-center hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/40">
        <div class="w-16 h-16 bg-tangerine/10 rounded-2xl flex items-center justify-center mb-6 text-tangerine group-hover:bg-tangerine group-hover:text-white transition-all transform group-hover:rotate-6 shadow-2xl shadow-tangerine/20">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <h3 class="font-black uppercase tracking-widest text-xs mb-2">Menus Cantine</h3>
        <p class="text-xs text-slate-400 font-bold uppercase tracking-wider">Repas de la semaine</p>
      </a>
      <a routerLink="/chat" class="group relative card-fancy p-8 flex flex-col items-center text-center hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/40">
        <div class="w-16 h-16 bg-blush/10 rounded-2xl flex items-center justify-center mb-6 text-blush group-hover:bg-blush group-hover:text-white transition-all transform group-hover:-rotate-6 shadow-2xl shadow-blush/20">
          <div class="relative">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <div class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce"></div>
          </div>
        </div>
        <h3 class="font-black uppercase tracking-widest text-xs mb-2">Messages</h3>
        <p class="text-xs text-slate-400 font-bold uppercase tracking-wider">Contacter l'école</p>
      </a>
    </div>
  </div>

  <div *ngIf="loading()" class="flex flex-col justify-center items-center py-20 space-y-4">
    <div class="animate-spin rounded-full h-16 w-16 border-4 border-t-tangerine border-slate-200"></div>
    <span class="text-slate-500 font-black text-xs uppercase tracking-widest animate-pulse">Synchronisation...</span>
  </div>

  <div *ngIf="error()" class="p-8 glass bg-blush/5 border-blush/20 rounded-[2.5rem] flex items-center gap-6">
    <div class="w-16 h-16 bg-blush/10 rounded-2xl flex items-center justify-center text-3xl">⚠️</div>
    <div>
      <h3 class="text-lg font-black text-blush uppercase tracking-wider mb-1">Erreur de chargement</h3>
      <p class="text-blush/80 font-bold mb-4">{{ error() }}</p>
      <button (click)="loadData()" class="px-6 py-3 bg-blush text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blush/30">
        Réessayer
      </button>
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
export class ParentDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private apiService = inject(ParentPresencesApiService);
  public childState = inject(ChildStateService);
  router = inject(Router);

  enfants = signal<EnfantWithStats[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);

    this.apiService.getEnfants().subscribe({
      next: (response) => {
        if (response.success) {
          this.enfants.set(response.data || []);
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

  calculateAveragePresence(): number {
    const enfants = this.enfants();
    if (enfants.length === 0) return 0;
    const sum = enfants.reduce((acc, e) => acc + e.statistiques_presence.taux_presence, 0);
    return Math.round(sum / enfants.length);
  }

  viewEnfant(enfantId: number) {
    this.childState.selectChild(enfantId);
    this.router.navigate(['/parent/enfants', enfantId, 'presences']);
  }

  viewPresences(event: Event, enfantId: number) {
    event.stopPropagation();
    this.childState.selectChild(enfantId);
    this.router.navigate(['/parent/enfants', enfantId, 'presences']);
  }

  viewCalendar(event: Event, enfantId: number) {
    event.stopPropagation();
    this.childState.selectChild(enfantId);
    this.router.navigate(['/parent/enfants', enfantId, 'presences', 'calendrier']);
  }

  getParentName(): string {
    return localStorage.getItem('sk_user_name') || 'Parent';
  }

  getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getAvatarClass(sexe: string): string {
    if (sexe === 'M' || sexe === 'garçon') {
      return 'bg-gradient-to-br from-sea to-blue-600';
    }
    return 'bg-gradient-to-br from-blush to-purple-600';
  }

  getGradientBorder(sexe: string): string {
    if (sexe === 'M' || sexe === 'garçon') {
      return 'from-sea/50 to-blue-500/50';
    }
    return 'from-blush/50 to-purple-500/50';
  }

  getProgressBarClass(taux: number): string {
    if (taux >= 90) return 'bg-gradient-to-r from-matcha to-emerald-500';
    if (taux >= 75) return 'bg-gradient-to-r from-sea to-blue-500';
    if (taux >= 60) return 'bg-gradient-to-r from-tangerine to-orange-500';
    return 'bg-gradient-to-r from-blush to-red-500';
  }

  getProgressTextClass(taux: number): string {
    if (taux >= 90) return 'text-matcha';
    if (taux >= 75) return 'text-sea';
    if (taux >= 60) return 'text-tangerine';
    return 'text-blush';
  }
}