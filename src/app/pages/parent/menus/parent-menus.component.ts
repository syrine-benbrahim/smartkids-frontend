// src/app/pages/parent/menus/parent-menus.component.ts
import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MenuParentService, MenuSemaine } from '../../../services/menu-parent.service';

@Component({
  selector: 'app-parent-menus',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div class="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-3xl p-8 lg:p-12 text-white shadow-2xl">
        <div class="max-w-4xl">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <svg class="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </div>
            <div>
              <h1 class="text-4xl lg:text-5xl font-black tracking-tight">🍽️ Menus de la Semaine</h1>
              <p class="text-orange-100 text-lg mt-2">Découvrez les repas préparés pour vos enfants</p>
            </div>
          </div>
          
          <!-- Filter Tabs -->
          <div class="flex gap-3 mt-6 flex-wrap">
            <button 
              (click)="setFilter('both')"
              [class.bg-white]="filterType() === 'both'"
              [class.text-orange-600]="filterType() === 'both'"
              [class.bg-white/20]="filterType() !== 'both'"
              [class.text-white]="filterType() !== 'both'"
              class="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105">
              📅 Tout Voir
            </button>
            <button 
              (click)="setFilter('lunch')"
              [class.bg-white]="filterType() === 'lunch'"
              [class.text-orange-600]="filterType() === 'lunch'"
              [class.bg-white/20]="filterType() !== 'lunch'"
              [class.text-white]="filterType() !== 'lunch'"
              class="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105">
              🍱 Déjeuners
            </button>
            <button 
              (click)="setFilter('snack')"
              [class.bg-white]="filterType() === 'snack'"
              [class.text-orange-600]="filterType() === 'snack'"
              [class.bg-white/20]="filterType() !== 'snack'"
              [class.text-white]="filterType() !== 'snack'"
              class="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105">
              🍪 Goûters
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="relative w-24 h-24 mx-auto mb-6">
            <div class="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-orange-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p class="text-gray-600 font-medium text-lg">Chargement des menus...</p>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-3xl p-8">
        <div class="flex items-start gap-6">
          <div class="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-2xl font-bold text-red-900 mb-2">Erreur</h3>
            <p class="text-red-700 mb-4">{{ error() }}</p>
            <button 
              (click)="loadMenus()"
              class="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
              Réessayer
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && !error() && filteredMenus().length === 0" 
           class="text-center py-20 bg-gradient-to-br from-gray-50 to-orange-50 rounded-3xl border-2 border-dashed border-gray-300">
        <div class="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-3">Aucun menu disponible</h3>
        <p class="text-gray-600 text-lg">Les menus de cette semaine ne sont pas encore publiés</p>
      </div>

      <!-- Menus Grid -->
      <div *ngIf="!loading() && !error() && filteredMenus().length > 0" class="grid gap-6">
        <div *ngFor="let menu of filteredMenus(); let i = index" 
             class="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100"
             [style.animation-delay]="i * 0.1 + 's'">
          
          <!-- Date Header -->
          <div class="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <span class="text-3xl">{{ getDayEmoji(menu.date_menu) }}</span>
                </div>
                <div>
                  <h3 class="text-2xl font-black text-white">{{ formatDate(menu.date_menu) }}</h3>
                  <p class="text-orange-100 font-medium">{{ getDayName(menu.date_menu) }}</p>
                </div>
              </div>
              <div class="hidden sm:flex gap-2">
                <span *ngIf="menu.lunch && shouldShowLunch()" class="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl text-sm font-bold">
                  🍱 Déjeuner
                </span>
                <span *ngIf="menu.snack && shouldShowSnack()" class="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl text-sm font-bold">
                  🍪 Goûter
                </span>
              </div>
            </div>
          </div>

          <!-- Menus Content -->
          <div class="p-8">
            <div class="grid md:grid-cols-2 gap-8">
              
              <!-- Déjeuner -->
              <div *ngIf="menu.lunch && shouldShowLunch()" 
                   class="space-y-4">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                    <span class="text-2xl">🍱</span>
                  </div>
                  <h4 class="text-2xl font-black text-gray-900">Déjeuner</h4>
                </div>
                
                <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6">
                  <h5 class="text-sm font-bold text-blue-900 uppercase tracking-wide mb-3">Description</h5>
                  <p class="text-gray-800 text-lg leading-relaxed">{{ menu.lunch.description }}</p>
                </div>

                <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                  <h5 class="text-sm font-bold text-green-900 uppercase tracking-wide mb-3">Ingrédients</h5>
                  <p class="text-gray-800 leading-relaxed">{{ menu.lunch.ingredients }}</p>
                </div>
              </div>

              <!-- Goûter -->
              <div *ngIf="menu.snack && shouldShowSnack()" 
                   class="space-y-4">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <span class="text-2xl">🍪</span>
                  </div>
                  <h4 class="text-2xl font-black text-gray-900">Goûter</h4>
                </div>
                
                <div class="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-6">
                  <h5 class="text-sm font-bold text-orange-900 uppercase tracking-wide mb-3">Description</h5>
                  <p class="text-gray-800 text-lg leading-relaxed">{{ menu.snack.description }}</p>
                </div>

                <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                  <h5 class="text-sm font-bold text-purple-900 uppercase tracking-wide mb-3">Ingrédients</h5>
                  <p class="text-gray-800 leading-relaxed">{{ menu.snack.ingredients }}</p>
                </div>
              </div>

              <!-- Empty State pour un type non disponible -->
              <div *ngIf="!menu.lunch && shouldShowLunch()" 
                   class="flex items-center justify-center p-8 bg-gray-50 rounded-2xl">
                <p class="text-gray-500 font-medium">Aucun déjeuner prévu</p>
              </div>

              <div *ngIf="!menu.snack && shouldShowSnack()" 
                   class="flex items-center justify-center p-8 bg-gray-50 rounded-2xl">
                <p class="text-gray-500 font-medium">Aucun goûter prévu</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Card -->
      <div class="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-3xl p-8">
        <div class="flex items-start gap-6">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-2xl font-bold text-blue-900 mb-3">À propos des menus</h3>
            <div class="space-y-2 text-blue-800">
              <p>• Les menus sont préparés avec soin par notre équipe de cuisine</p>
              <p>• Tous les repas sont équilibrés et adaptés aux besoins nutritionnels des enfants</p>
              <p>• En cas d'allergie alimentaire, merci de nous contacter</p>
              <p>• Les menus peuvent être modifiés selon les disponibilités des produits</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .grid > div {
      animation: fadeInUp 0.6s ease-out forwards;
      opacity: 0;
    }
  `]
})
export class ParentMenusComponent implements OnInit {
  private menuService = inject(MenuParentService);

  menus = signal<MenuSemaine[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  filterType = signal<'both' | 'lunch' | 'snack'>('both');

  // Computed signal pour filtrer les menus
  filteredMenus = signal<MenuSemaine[]>([]);

  constructor() {
    // Utiliser effect pour réagir aux changements de filtre
    effect(() => {
      const filter = this.filterType();
      this.applyFilter();
    });
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
      // Filtrer les menus qui ont au moins le type demandé
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

    // Toujours charger les deux types
    this.menuService.getCurrentWeekMenu().subscribe({
      next: (response) => {
        if (response.success) {
          this.menus.set(response.data);
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
    const emojis = ['😴', '💪', '🔥', '🌟', '🎯', '🎉', '😴']; // Dimanche -> Samedi
    return emojis[day];
  }
}