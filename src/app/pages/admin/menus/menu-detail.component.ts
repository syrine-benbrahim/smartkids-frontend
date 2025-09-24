// src/app/pages/admin/menus/menu-detail.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MenusApiService, MenuItem } from '../../../services/menu-api.service';

@Component({
  selector: 'app-menu-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-red-100 p-4 sm:p-6">
      <div class="max-w-4xl mx-auto">
        
        <!-- Loading -->
        <div *ngIf="loading()" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
          <p class="mt-4 text-gray-600 font-medium text-lg">Chargement du menu...</p>
        </div>

        <!-- Error -->
        <div *ngIf="error()" class="card bg-red-50 border-2 border-red-200">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <span class="text-2xl text-white">⚠️</span>
            </div>
            <div>
              <h2 class="text-xl font-bold text-red-800">Erreur</h2>
              <p class="text-red-600">{{ error() }}</p>
            </div>
          </div>
          <div class="mt-6">
            <button 
              class="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              routerLink="/admin/menus"
            >
              Retour aux menus
            </button>
          </div>
        </div>

        <!-- Menu Detail -->
        <div *ngIf="!loading() && !error() && menu()">
          <!-- Header -->
          <div class="relative mb-8">
            <!-- Decorative elements -->
            <div class="absolute -top-4 -left-4 text-4xl animate-bounce opacity-60" style="animation-delay: 0s;">🍽️</div>
            <div class="absolute -top-2 right-10 text-3xl animate-bounce opacity-60" style="animation-delay: 0.5s;">🥕</div>
            <div class="absolute top-2 right-32 text-2xl animate-bounce opacity-60" style="animation-delay: 1s;">🧁</div>

            <div class="card relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-red-500/10"></div>
              <div class="relative flex flex-col lg:flex-row items-center justify-between gap-6">
                <div class="flex items-center gap-4">
                  <div class="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-400 rounded-3xl flex items-center justify-center shadow-xl">
                    <span class="text-4xl">{{ menu()!.type_repas === 'lunch' ? '🍽️' : '🧁' }}</span>
                  </div>
                  <div>
                    <h1 class="text-4xl font-black text-gray-800 tracking-tight">
                      {{ menu()!.type_repas === 'lunch' ? 'Menu Déjeuner' : 'Menu Goûter' }}
                    </h1>
                    <p class="text-gray-600 font-medium text-lg">
                      {{ formatDate(menu()!.date_menu) }}
                    </p>
                  </div>
                </div>
                
                <div class="flex gap-3">
                  <button 
                    class="btn-primary bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                    [routerLink]="['/admin/menus', menu()!.id, 'edit']"
                  >
                    <span class="text-xl">✏️</span>
                    Modifier
                  </button>
                  <button 
                    class="btn-secondary bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                    routerLink="/admin/menus"
                  >
                    <span class="text-xl">⬅️</span>
                    Retour
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Menu Content -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Main Menu Card -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Description Card -->
              <div class="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                    <span class="text-2xl text-white">📝</span>
                  </div>
                  <h3 class="text-2xl font-bold text-green-800">Description du Menu</h3>
                </div>
                <div class="bg-white/60 backdrop-blur rounded-2xl p-6 border border-green-200">
                  <p class="text-green-700 font-medium text-lg leading-relaxed">
                    {{ menu()!.description }}
                  </p>
                </div>
              </div>

              <!-- Ingredients Card -->
              <div class="card bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                    <span class="text-2xl text-white">🥕</span>
                  </div>
                  <h3 class="text-2xl font-bold text-blue-800">Ingrédients</h3>
                </div>
                <div class="bg-white/60 backdrop-blur rounded-2xl p-6 border border-blue-200">
                  <p class="text-blue-700 font-medium text-lg leading-relaxed">
                    {{ menu()!.ingredients }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
              
              <!-- Menu Info Card -->
              <div class="card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                <div class="text-center mb-6">
                  <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <span class="text-3xl text-white">ℹ️</span>
                  </div>
                  <h3 class="text-xl font-bold text-purple-800">Informations</h3>
                </div>

                <div class="space-y-4">
                  <div class="flex items-center justify-between p-3 bg-white/60 backdrop-blur rounded-xl border border-purple-200">
                    <span class="text-purple-700 font-medium">Type:</span>
                    <div class="flex items-center gap-2">
                      <span class="text-xl">{{ menu()!.type_repas === 'lunch' ? '🍽️' : '🧁' }}</span>
                      <span class="font-bold text-purple-800">
                        {{ menu()!.type_repas === 'lunch' ? 'Déjeuner' : 'Goûter' }}
                      </span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between p-3 bg-white/60 backdrop-blur rounded-xl border border-purple-200">
                    <span class="text-purple-700 font-medium">Date:</span>
                    <span class="font-bold text-purple-800">{{ formatShortDate(menu()!.date_menu) }}</span>
                  </div>

                  <div class="flex items-center justify-between p-3 bg-white/60 backdrop-blur rounded-xl border border-purple-200">
                    <span class="text-purple-700 font-medium">Jour:</span>
                    <span class="font-bold text-purple-800">{{ getDayName(menu()!.date_menu) }}</span>
                  </div>

                  <div *ngIf="menu()!.created_at" class="flex items-center justify-between p-3 bg-white/60 backdrop-blur rounded-xl border border-purple-200">
                    <span class="text-purple-700 font-medium">Créé le:</span>
                    <span class="text-purple-800 text-sm">{{ formatDateTime(menu()!.created_at!) }}</span>
                  </div>

                  <div *ngIf="menu()!.updated_at && menu()!.updated_at !== menu()!.created_at" class="flex items-center justify-between p-3 bg-white/60 backdrop-blur rounded-xl border border-purple-200">
                    <span class="text-purple-700 font-medium">Modifié le:</span>
                    <span class="text-purple-800 text-sm">{{ formatDateTime(menu()!.updated_at!) }}</span>
                  </div>
                </div>
              </div>

              <!-- Actions Card -->
              <div class="card bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200">
                <div class="text-center mb-6">
                  <div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <span class="text-3xl text-white">⚡</span>
                  </div>
                  <h3 class="text-xl font-bold text-orange-800">Actions</h3>
                </div>

                <div class="space-y-3">
                  <button
                    class="w-full bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white px-4 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                    [routerLink]="['/admin/menus', menu()!.id, 'edit']"
                  >
                    <span class="text-lg">✏️</span>
                    Modifier ce menu
                  </button>

                  <button
                    class="w-full bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white px-4 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                    (click)="deleteMenu()"
                  >
                    <span class="text-lg">🗑️</span>
                    Supprimer
                  </button>

                  <button
                    class="w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white px-4 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                    (click)="duplicateMenu()"
                  >
                    <span class="text-lg">📋</span>
                    Dupliquer
                  </button>

                  <hr class="border-orange-200 my-4">

                  <button
                    class="w-full bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white px-4 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                    routerLink="/admin/menus"
                  >
                    <span class="text-lg">📋</span>
                    Voir tous les menus
                  </button>
                </div>
              </div>
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
export class MenuDetailComponent implements OnInit {
  private menusApi = inject(MenusApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  menu = signal<MenuItem | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMenu(+id);
    } else {
      this.error.set('ID du menu manquant');
      this.loading.set(false);
    }
  }

  private loadMenu(id: number) {
    this.loading.set(true);
    this.error.set(null);

    this.menusApi.getById(id).subscribe({
      next: (response) => {
        const menuData = Array.isArray(response.data) ? response.data[0] : response.data;
        if (menuData) {
          this.menu.set(menuData);
        } else {
          this.error.set('Menu non trouvé');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading menu:', err);
        this.error.set('Erreur lors du chargement du menu');
        this.loading.set(false);
      }
    });
  }

  deleteMenu() {
    const currentMenu = this.menu();
    if (!currentMenu?.id) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer ce menu ? Cette action est irréversible.')) {
      this.menusApi.delete(currentMenu.id).subscribe({
        next: () => {
          this.router.navigate(['/admin/menus']);
        },
        error: (err) => {
          console.error('Error deleting menu:', err);
          alert('Erreur lors de la suppression du menu');
        }
      });
    }
  }

duplicateMenu() {
  const currentMenu = this.menu();
  if (!currentMenu) return;

  this.router.navigate(['/admin/menus/create'], {
    queryParams: {
      description: currentMenu.description,
      ingredients: currentMenu.ingredients,
      type_repas: currentMenu.type_repas,
      date_menu: currentMenu.date_menu ? currentMenu.date_menu.substring(0, 10) : ''
    }
  });
}

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatShortDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDayName(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { weekday: 'long' });
  }
}