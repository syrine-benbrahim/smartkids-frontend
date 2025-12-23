import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MenuParentService, MenuSemaine } from '../../../services/menu-parent.service';

@Component({
  selector: 'app-parent-menus',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-4 sm:p-8 space-y-12 animate-fade-in text-slate-800 dark:text-slate-100">
      
      <!-- Header Section -->
      <div class="relative group">
        <div class="absolute -inset-1 bg-gradient-to-r from-tangerine via-butter to-tangerine rounded-[3rem] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
        <div class="relative flex flex-col lg:flex-row items-center justify-between gap-8 p-10 card-fancy overflow-hidden">
          <div class="flex items-center gap-8 relative z-10">
            <div class="w-20 h-20 bg-gradient-to-br from-tangerine to-butter rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-tangerine/30 text-3xl font-black text-white">
              🍱
            </div>
            <div>
              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
                Menus de la Semaine
              </h1>
              <p class="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-lg leading-relaxed">
                Découvrez les repas équilibrés et savoureux préparés pour l'épanouissement de vos enfants.
              </p>
            </div>
          </div>

          <!-- Filter Controls -->
          <div class="flex bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl relative z-10">
            <button (click)="setFilter('both')"
                    [class]="filterType() === 'both' ? 'bg-white dark:bg-slate-700 shadow-md text-tangerine' : 'text-slate-500 hover:text-slate-700'"
                    class="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
              Tout
            </button>
            <button (click)="setFilter('lunch')"
                    [class]="filterType() === 'lunch' ? 'bg-white dark:bg-slate-700 shadow-md text-tangerine' : 'text-slate-500 hover:text-slate-700'"
                    class="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
              Déjeuners
            </button>
            <button (click)="setFilter('snack')"
                    [class]="filterType() === 'snack' ? 'bg-white dark:bg-slate-700 shadow-md text-tangerine' : 'text-slate-500 hover:text-slate-700'"
                    class="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
              Goûters
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex flex-col justify-center items-center py-20 space-y-4">
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-t-tangerine border-slate-200"></div>
        <span class="text-slate-500 font-black text-xs uppercase tracking-widest animate-pulse">Préparation du menu...</span>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="p-8 glass bg-blush/5 border-blush/20 rounded-[2.5rem] flex items-center gap-6">
        <div class="w-16 h-16 bg-blush/10 rounded-2xl flex items-center justify-center text-3xl">⚠️</div>
        <div>
          <h3 class="text-lg font-black text-blush uppercase tracking-wider mb-1">Erreur de chargement</h3>
          <p class="text-blush/80 font-bold mb-4">{{ error() }}</p>
          <button (click)="loadMenus()"
                  class="px-6 py-3 bg-blush text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blush/30">
            Réessayer
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && !error() && filteredMenus().length === 0" 
           class="text-center py-20 card-fancy border-dashed border-2 border-white/20">
        <div class="text-6xl mb-6 opacity-30">🥣</div>
        <h3 class="text-2xl font-black mb-2">Menus non disponibles</h3>
        <p class="text-slate-500 font-medium">Les menus pour cette période ne sont pas encore publiés.</p>
      </div>

      <!-- Calendrier des Menus -->
      <div *ngIf="!loading() && !error() && filteredMenus().length > 0" class="space-y-12">
        <div *ngFor="let menu of filteredMenus(); let i = index" 
             class="group relative animate-fade-in"
             [style.animation-delay]="i * 0.1 + 's'">
          
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 bg-tangerine/10 rounded-2xl flex items-center justify-center text-2xl">
              {{ getDayEmoji(menu.date_menu) }}
            </div>
            <div>
              <h2 class="text-2xl font-black tracking-tight leading-none group-hover:text-tangerine transition-colors">{{ getDayName(menu.date_menu) }}</h2>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{{ formatDate(menu.date_menu) }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Déjeuner -->
            <div *ngIf="menu.lunch && shouldShowLunch()" 
                 class="relative glass dark:bg-slate-800/40 rounded-[2.5rem] border-white/60 p-8 hover:border-sea transition-all shadow-sm">
              <div class="flex items-center gap-4 mb-6">
                <div class="w-10 h-10 bg-sea/10 rounded-xl flex items-center justify-center text-sea">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.703 2.703 0 01-3 0 2.703 2.703 0 01-3 0 2.703 2.703 0 01-3 0 2.704 2.704 0 01-1.5-.454V6.454a2.704 2.704 0 011.5-.454 2.703 2.703 0 013 0 2.703 2.703 0 013 0 2.703 2.703 0 013 0 2.703 2.703 0 013 0 2.704 2.704 0 011.5.454v9.092z"/>
                  </svg>
                </div>
                <h4 class="text-lg font-black uppercase tracking-widest text-slate-900 dark:text-white">Déjeuner</h4>
              </div>
              
              <div class="space-y-6">
                <div class="p-6 bg-sea/5 dark:bg-sea/10 rounded-2xl border border-sea/10">
                  <h5 class="text-[9px] font-black text-sea uppercase tracking-widest mb-2 leading-none">Menu du jour</h5>
                  <p class="text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed">{{ menu.lunch.description }}</p>
                </div>
                <div class="flex items-start gap-4">
                  <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest pt-1">Allergènes</div>
                  <p class="text-xs font-medium text-slate-500 dark:text-slate-400 italic">Contient : {{ menu.lunch.ingredients }}</p>
                </div>
              </div>
            </div>

            <!-- Goûter -->
            <div *ngIf="menu.snack && shouldShowSnack()" 
                 class="relative glass dark:bg-slate-800/40 rounded-[2.5rem] border-white/60 p-8 hover:border-tangerine transition-all shadow-sm">
              <div class="flex items-center gap-4 mb-6">
                <div class="w-10 h-10 bg-tangerine/10 rounded-xl flex items-center justify-center text-tangerine">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v13m0-13V6a2 2 0 114 0v2m-4 0a2 2 0 10-4 0v2m4-2h4m-4 0H8m4 0v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h4 class="text-lg font-black uppercase tracking-widest text-slate-900 dark:text-white">Goûter</h4>
              </div>
              
              <div class="space-y-6">
                <div class="p-6 bg-tangerine/5 dark:bg-tangerine/10 rounded-2xl border border-tangerine/10">
                  <h5 class="text-[9px] font-black text-tangerine uppercase tracking-widest mb-2 leading-none">Douceur de l'après-midi</h5>
                  <p class="text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed">{{ menu.snack.description }}</p>
                </div>
                <div class="flex items-start gap-4">
                  <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest pt-1">Allergènes</div>
                  <p class="text-xs font-medium text-slate-500 dark:text-slate-400 italic">Contient : {{ menu.snack.ingredients }}</p>
                </div>
              </div>
            </div>

            <!-- Fallback empty states -->
            <div *ngIf="!menu.lunch && shouldShowLunch()" class="card-fancy p-8 flex items-center justify-center border-dashed border-2 border-white/20 opacity-40">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aucun déjeuner programmé</p>
            </div>
            <div *ngIf="!menu.snack && shouldShowSnack()" class="card-fancy p-8 flex items-center justify-center border-dashed border-2 border-white/20 opacity-40">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aucun goûter programmé</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Info -->
      <div class="card-fancy p-8 border-white/40 shadow-xl overflow-hidden relative">
        <div class="absolute top-0 right-0 w-64 h-64 bg-sea/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div class="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div class="w-16 h-16 bg-sea/10 rounded-2xl flex items-center justify-center text-sea">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="flex-1 text-center md:text-left">
            <h3 class="text-xl font-black mb-2">Engagement Qualité</h3>
            <p class="text-slate-500 dark:text-slate-400 font-medium">Nos repas sont élaborés par des nutritionnistes pour garantir un équilibre parfait. Produits frais et locaux privilégiés.</p>
          </div>
          <div class="flex flex-col gap-2 min-w-[200px]">
            <div class="flex items-center gap-2 text-[10px] font-black uppercase text-matcha">
              <div class="w-1.5 h-1.5 bg-matcha rounded-full animate-pulse"></div>
              Produits Frais
            </div>
            <div class="flex items-center gap-2 text-[10px] font-black uppercase text-sea">
              <div class="w-1.5 h-1.5 bg-sea rounded-full animate-pulse"></div>
              Équilibre Nutri
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
  `]
})
export class ParentMenusComponent implements OnInit {
  private menuService = inject(MenuParentService);

  menus = signal<MenuSemaine[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  filterType = signal<'both' | 'lunch' | 'snack'>('both');

  filteredMenus = signal<MenuSemaine[]>([]);

  constructor() {
    effect(() => {
      this.applyFilter();
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.loadMenus();
  }

  setFilter(type: 'both' | 'lunch' | 'snack') {
    this.filterType.set(type);
  }

  applyFilter() {
    const allMenus = this.menus();
    const filter = this.filterType();

    if (filter === 'both') {
      this.filteredMenus.set(allMenus);
    } else {
      const filtered = allMenus.filter(menu => {
        if (filter === 'lunch') return menu.lunch !== null;
        if (filter === 'snack') return menu.snack !== null;
        return true;
      });
      this.filteredMenus.set(filtered);
    }
  }

  loadMenus() {
    this.loading.set(true);
    this.error.set(null);

    this.menuService.getCurrentWeekMenu().subscribe({
      next: (response) => {
        if (response.success) {
          this.menus.set(response.data || []);
          this.applyFilter();
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement menus:', err);
        this.error.set('Impossible de charger les menus. Veuillez réessayer.');
        this.loading.set(false);
      }
    });
  }

  shouldShowLunch(): boolean {
    return this.filterType() === 'both' || this.filterType() === 'lunch';
  }

  shouldShowSnack(): boolean {
    return this.filterType() === 'both' || this.filterType() === 'snack';
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  getDayName(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { weekday: 'long' });
  }

  getDayEmoji(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDay();
    const emojis = ['😴', '🥐', '🍲', '🥦', '🥘', '🐟', '🥞']; // Sun -> Sat
    return emojis[day];
  }
}