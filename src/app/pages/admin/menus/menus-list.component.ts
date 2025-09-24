// src/app/pages/admin/menus/menus-list.component.ts
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MenusApiService, MenuItem, MenuResponse } from '../../../services/menu-api.service';

interface WeeklyMenu {
  [key: string]: {
    lunch?: MenuItem;
    snack?: MenuItem;
  };
}

interface WeekDay {
  name: string;
  date: string;
  dateKey: string;
  dayNumber: number;
}

interface ModalForm {
  id: number | null;
  description: string;
  ingredients: string;
  date_menu: string;
  type_repas: 'lunch' | 'snack';
}

@Component({
  selector: 'app-menus-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-red-100 p-4 sm:p-6">
      <!-- Floating Header with Food Theme -->
      <div class="max-w-7xl mx-auto">
        <div class="relative mb-8">
          <!-- Floating food icons -->
          <div class="absolute -top-6 -left-6 text-4xl animate-bounce opacity-70" style="animation-delay: 0s;">🍎</div>
          <div class="absolute -top-4 right-20 text-3xl animate-bounce opacity-70" style="animation-delay: 0.5s;">🥕</div>
          <div class="absolute top-2 right-40 text-2xl animate-bounce opacity-70" style="animation-delay: 1s;">🧀</div>
          <div class="absolute -top-2 right-60 text-3xl animate-bounce opacity-70" style="animation-delay: 1.5s;">🍌</div>

          <div class="card relative overflow-hidden bg-white/95 backdrop-blur border border-orange-200">
            <div class="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-red-500/10"></div>
            
            <div class="relative flex flex-col lg:flex-row items-center justify-between gap-6">
              <div class="flex items-center gap-4">
                <div class="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-400 rounded-3xl flex items-center justify-center shadow-xl">
                  <span class="text-4xl">🍽️</span>
                </div>
                <div>
                  <h1 class="text-4xl font-black text-gray-800 tracking-tight">
                    Menu de la Semaine
                  </h1>
                  <p class="text-gray-600 font-medium text-lg">
                    Planification nutritionnelle hebdomadaire
                  </p>
                </div>
              </div>
              
              <div class="flex gap-3">
                <button 
                  class="btn-primary bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                  routerLink="/admin/menus/create"
                >
                  <span class="text-xl">➕</span>
                  Nouveau Menu
                </button>
                <button 
                  class="btn-secondary bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                  routerLink="/admin"
                >
                  <span class="text-xl">⬅️</span>
                  Retour
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Week Navigation -->
        <div class="mb-8 flex justify-center">
          <div class="card bg-white/90 backdrop-blur border border-orange-200 flex items-center gap-4">
            <button 
              class="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-400 to-red-400 text-white font-bold text-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              (click)="previousWeek()"
            >
              ‹
            </button>
            
            <div class="text-center">
              <h3 class="text-xl font-bold text-gray-800">
                {{ getCurrentWeekText() }}
              </h3>
              <p class="text-sm text-gray-600">{{ currentWeekStart }} - {{ currentWeekEnd }}</p>
            </div>
            
            <button 
              class="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-400 to-red-400 text-white font-bold text-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              (click)="nextWeek()"
            >
              ›
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading()" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
          <p class="mt-4 text-gray-600 font-medium">Chargement des menus...</p>
        </div>

        <!-- Weekly Menu Grid -->
        <div *ngIf="!loading()" class="relative">
          <!-- Decorative food elements -->
          <div class="absolute -top-4 -left-8 text-6xl opacity-20 rotate-12">🥗</div>
          <div class="absolute -bottom-8 -right-8 text-6xl opacity-20 -rotate-12">🍰</div>

          <div class="card bg-white/95 backdrop-blur border border-orange-200 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-yellow-50/80 to-red-50/80"></div>
            
            <div class="relative overflow-x-auto">
              <table class="w-full">
                <!-- Header -->
                <thead>
                  <tr class="border-b-2 border-orange-200">
                    <th class="p-6 text-left">
                      <div class="flex items-center gap-3">
                        <span class="text-2xl">📅</span>
                        <span class="text-xl font-black text-gray-800">Jour</span>
                      </div>
                    </th>
                    <th class="p-6 text-center border-l border-orange-200">
                      <div class="flex items-center justify-center gap-3">
                        <span class="text-2xl">🍽️</span>
                        <span class="text-xl font-black text-gray-800">Déjeuner</span>
                      </div>
                    </th>
                    <th class="p-6 text-center border-l border-orange-200">
                      <div class="flex items-center justify-center gap-3">
                        <span class="text-2xl">🧁</span>
                        <span class="text-xl font-black text-gray-800">Goûter</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                
                <!-- Body -->
                <tbody>
                  <tr *ngFor="let day of weekDays; let i = index" 
                      class="border-b border-orange-100 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-yellow-50/50 transition-all duration-200">
                    
                    <!-- Day Column -->
                    <td class="p-6 border-r border-orange-200">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {{ day.dayNumber }}
                        </div>
                        <div>
                          <div class="text-lg font-bold text-gray-800">{{ day.name }}</div>
                          <div class="text-sm text-gray-600">{{ day.date }}</div>
                        </div>
                      </div>
                    </td>
                    
                    <!-- Lunch Column -->
                    <td class="p-4 border-r border-orange-200 max-w-md">
                      <div *ngIf="weeklyMenu()[day.dateKey]?.lunch; else noLunchMenu" 
                           class="group cursor-pointer"
                           (click)="openEditModal(weeklyMenu()[day.dateKey]!.lunch!)">
                        <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                          <div class="flex items-start justify-between mb-3">
                            <h4 class="font-bold text-green-800 text-sm flex items-center gap-2">
                              <span class="text-lg">🥘</span>
                              Menu du Déjeuner
                            </h4>
                            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button class="w-6 h-6 rounded-lg bg-blue-500 text-white text-xs hover:bg-blue-600">✏️</button>
                              <button class="w-6 h-6 rounded-lg bg-red-500 text-white text-xs hover:bg-red-600"
                                      (click)="deleteMenu(weeklyMenu()[day.dateKey]!.lunch!, $event)">🗑️</button>
                            </div>
                          </div>
                          <p class="text-green-700 font-medium text-sm mb-2 line-clamp-2">
                            {{ weeklyMenu()[day.dateKey]!.lunch!.description }}
                          </p>
                          <p class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-lg line-clamp-1">
                            <strong>Ingrédients:</strong> {{ weeklyMenu()[day.dateKey]!.lunch!.ingredients }}
                          </p>
                        </div>
                      </div>
                      
                      <ng-template #noLunchMenu>
                        <div class="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-green-400 hover:bg-green-50/50 cursor-pointer transition-all duration-200"
                             (click)="openCreateModal('lunch', day.dateKey)">
                          <div class="text-4xl mb-2 opacity-50">🍽️</div>
                          <p class="text-gray-500 font-medium">Ajouter un déjeuner</p>
                          <div class="mt-2 text-2xl">➕</div>
                        </div>
                      </ng-template>
                    </td>
                    
                    <!-- Snack Column -->
                    <td class="p-4 max-w-md">
                      <div *ngIf="weeklyMenu()[day.dateKey]?.snack; else noSnackMenu" 
                           class="group cursor-pointer"
                           (click)="openEditModal(weeklyMenu()[day.dateKey]!.snack!)">
                        <div class="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-2xl p-4 hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                          <div class="flex items-start justify-between mb-3">
                            <h4 class="font-bold text-pink-800 text-sm flex items-center gap-2">
                              <span class="text-lg">🧁</span>
                              Menu du Goûter
                            </h4>
                            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button class="w-6 h-6 rounded-lg bg-blue-500 text-white text-xs hover:bg-blue-600">✏️</button>
                              <button class="w-6 h-6 rounded-lg bg-red-500 text-white text-xs hover:bg-red-600"
                                      (click)="deleteMenu(weeklyMenu()[day.dateKey]!.snack!, $event)">🗑️</button>
                            </div>
                          </div>
                          <p class="text-pink-700 font-medium text-sm mb-2 line-clamp-2">
                            {{ weeklyMenu()[day.dateKey]!.snack!.description }}
                          </p>
                          <p class="text-xs text-pink-600 bg-pink-100 px-2 py-1 rounded-lg line-clamp-1">
                            <strong>Ingrédients:</strong> {{ weeklyMenu()[day.dateKey]!.snack!.ingredients }}
                          </p>
                        </div>
                      </div>
                      
                      <ng-template #noSnackMenu>
                        <div class="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-pink-400 hover:bg-pink-50/50 cursor-pointer transition-all duration-200"
                             (click)="openCreateModal('snack', day.dateKey)">
                          <div class="text-4xl mb-2 opacity-50">🧁</div>
                          <p class="text-gray-500 font-medium">Ajouter un goûter</p>
                          <div class="mt-2 text-2xl">➕</div>
                        </div>
                      </ng-template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Modal for Create/Edit Menu -->
        <div *ngIf="showModal" 
             class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             (click)="closeModal()">
          <div class="card max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white relative"
               (click)="$event.stopPropagation()">
            
            <!-- Decorative header -->
            <div class="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-400 via-yellow-400 to-red-400"></div>
            
            <div class="p-6">
              <div class="flex items-center gap-4 mb-6">
                <div class="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-400 rounded-2xl flex items-center justify-center">
                  <span class="text-2xl">{{ modalForm.type_repas === 'lunch' ? '🍽️' : '🧁' }}</span>
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-gray-800">
                    {{ isEditMode ? 'Modifier' : 'Nouveau' }} 
                    {{ modalForm.type_repas === 'lunch' ? 'Déjeuner' : 'Goûter' }}
                  </h2>
                  <p class="text-gray-600">{{ formatDate(modalForm.date_menu) }}</p>
                </div>
              </div>

              <form (ngSubmit)="saveMenu()" #menuForm="ngForm" class="space-y-6">
                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <span class="text-lg">📝</span>
                    Description du menu <span class="text-red-500">*</span>
                  </label>
                  <textarea
                    class="w-full px-4 py-3 rounded-2xl border-2 border-orange-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 bg-white placeholder-gray-400 font-medium transition-all duration-200 resize-none"
                    rows="3"
                    [(ngModel)]="modalForm.description"
                    name="description"
                    required
                    placeholder="Décrivez le menu du jour..."
                  ></textarea>
                </div>

                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <span class="text-lg">🥕</span>
                    Ingrédients <span class="text-red-500">*</span>
                  </label>
                  <textarea
                    class="w-full px-4 py-3 rounded-2xl border-2 border-green-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 bg-white placeholder-gray-400 font-medium transition-all duration-200 resize-none"
                    rows="3"
                    [(ngModel)]="modalForm.ingredients"
                    name="ingredients"
                    required
                    placeholder="Liste des ingrédients..."
                  ></textarea>
                </div>

                <div *ngIf="errorMessage()" class="p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">⚠️</span>
                    <p class="text-red-700 font-medium">{{ errorMessage() }}</p>
                  </div>
                </div>

                <div class="flex gap-4 pt-4">
                  <button
                    type="submit"
                    [disabled]="!menuForm.form.valid || saving()"
                    class="flex-1 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span *ngIf="saving()" class="animate-spin">⏳</span>
                    <span *ngIf="!saving()" class="text-xl">💾</span>
                    {{ saving() ? 'Enregistrement...' : (isEditMode ? 'Mettre à jour' : 'Créer') }}
                  </button>
                  
                  <button
                    type="button"
                    (click)="closeModal()"
                    class="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span class="text-xl">❌</span>
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-1 { 
      overflow: hidden; 
      display: -webkit-box; 
      -webkit-box-orient: vertical; 
      -webkit-line-clamp: 1; 
    }
    .line-clamp-2 { 
      overflow: hidden; 
      display: -webkit-box; 
      -webkit-box-orient: vertical; 
      -webkit-line-clamp: 2; 
    }
    .card {
      @apply bg-white rounded-3xl shadow-lg border border-gray-200 p-6;
    }
  `]
})
export class MenusListComponent implements OnInit {
  private menusApi = inject(MenusApiService);
  private router = inject(Router);

  // Signals with proper typing
  weeklyMenu = signal<WeeklyMenu>({});
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  errorMessage = signal<string>('');

  // State with proper typing
  currentDate: Date = new Date();
  weekDays: WeekDay[] = [];
  currentWeekStart: string = '';
  currentWeekEnd: string = '';

  showModal: boolean = false;
  isEditMode: boolean = false;

  modalForm: ModalForm = {
    id: null,
    description: '',
    ingredients: '',
    date_menu: '',
    type_repas: 'lunch'
  };

  ngOnInit(): void {
    this.generateWeekDays();
    this.loadWeeklyMenu();
  }

  generateWeekDays(): void {
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay() + 1); // Monday

    this.weekDays = [];
    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      this.weekDays.push({
        name: dayNames[i],
        date: date.toLocaleDateString('fr-FR'),
        dateKey: date.toISOString().split('T')[0],
        dayNumber: date.getDate()
      });
    }

    this.currentWeekStart = this.weekDays[0].date;
    this.currentWeekEnd = this.weekDays[4].date;
  }

  getCurrentWeekText(): string {
    const now = new Date();
    const currentWeekStart = new Date(this.currentDate);
    currentWeekStart.setDate(this.currentDate.getDate() - this.currentDate.getDay() + 1);
    
    const isCurrentWeek = now >= currentWeekStart && now <= new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    if (isCurrentWeek) return 'Semaine Actuelle';
    if (currentWeekStart > now) return 'Semaine Prochaine';
    return 'Semaine Passée';
  }

  previousWeek(): void {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.generateWeekDays();
    this.loadWeeklyMenu();
  }

  nextWeek(): void {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.generateWeekDays();
    this.loadWeeklyMenu();
  }

  loadWeeklyMenu(): void {
    this.loading.set(true);
    const startDate = this.weekDays[0].dateKey;
    const endDate = this.weekDays[4].dateKey;
    
    // Charger tous les menus de la semaine
    this.menusApi.getAll({
      date_start: startDate,
      date_end: endDate
    }).subscribe({
      next: (response: MenuResponse) => {
        const weekMenu: WeeklyMenu = {};
        
        if (response.data && Array.isArray(response.data)) {
          response.data.forEach((menu: MenuItem) => {
            const dateKey = menu.date_menu.split('T')[0];
            if (!weekMenu[dateKey]) weekMenu[dateKey] = {};
            
            if (menu.type_repas === 'lunch') {
              weekMenu[dateKey].lunch = menu;
            } else if (menu.type_repas === 'snack') {
              weekMenu[dateKey].snack = menu;
            }
          });
        }
        
        this.weeklyMenu.set(weekMenu);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading weekly menu:', err);
        this.loading.set(false);
      }
    });
  }

  openCreateModal(type: 'lunch' | 'snack' = 'lunch', dateKey?: string): void {
    this.isEditMode = false;
    this.modalForm = {
      id: null,
      description: '',
      ingredients: '',
      date_menu: dateKey || this.weekDays[0].dateKey,
      type_repas: type
    };
    this.showModal = true;
    this.errorMessage.set('');
  }

  openEditModal(menu: MenuItem): void {
    this.isEditMode = true;
    this.modalForm = {
      id: menu.id || null,
      description: menu.description,
      ingredients: menu.ingredients,
      date_menu: menu.date_menu.split('T')[0],
      type_repas: menu.type_repas
    };
    this.showModal = true;
    this.errorMessage.set('');
  }

  closeModal(): void {
    this.showModal = false;
    this.errorMessage.set('');
  }

  saveMenu(): void {
    this.errorMessage.set('');
    this.saving.set(true);

    if (!this.modalForm.description.trim() || !this.modalForm.ingredients.trim()) {
      this.errorMessage.set('Tous les champs sont obligatoires');
      this.saving.set(false);
      return;
    }

    if (this.isEditMode && this.modalForm.id) {
      // Update existing menu
      const updatePayload = {
        description: this.modalForm.description.trim(),
        ingredients: this.modalForm.ingredients.trim(),
        date_menu: this.modalForm.date_menu,
        type_repas: this.modalForm.type_repas
      };

      this.menusApi.update(this.modalForm.id, updatePayload).subscribe({
        next: (response: MenuResponse) => {
          this.saving.set(false);
          this.closeModal();
          this.loadWeeklyMenu();
        },
        error: (err: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(this.getErrorMessage(err));
        }
      });
    } else {
      // CORRECTION: Respecter la structure attendue par le backend
      const createPayload = {
        date_menu: this.modalForm.date_menu,
        type: this.modalForm.type_repas, // 'type' au lieu de 'type_repas'
        [this.modalForm.type_repas]: { // Imbriquer dans l'objet correspondant au type
          description: this.modalForm.description.trim(),
          ingredients: this.modalForm.ingredients.trim()
        }
      };

      console.log('Payload créé:', createPayload); // Pour debug

      this.menusApi.createDaily(createPayload).subscribe({
        next: (response: MenuResponse) => {
          this.saving.set(false);
          this.closeModal();
          this.loadWeeklyMenu();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error creating menu:', err);
          this.saving.set(false);
          this.errorMessage.set(this.getErrorMessage(err));
        }
      });
    }
  }

  deleteMenu(menu: MenuItem, event: Event): void {
    event.stopPropagation();
    
    if (!menu.id || !confirm('Êtes-vous sûr de vouloir supprimer ce menu ?')) {
      return;
    }

    this.menusApi.delete(menu.id).subscribe({
      next: (response: MenuResponse) => {
        this.loadWeeklyMenu();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error deleting menu:', err);
        alert('Erreur lors de la suppression');
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

  private getErrorMessage(err: HttpErrorResponse): string {
    if (err.error && typeof err.error === 'object') {
      if ('message' in err.error) {
        return err.error.message as string;
      }
      if ('errors' in err.error) {
        const errors = err.error.errors;
        const firstError = Object.values(errors)[0];
        if (Array.isArray(firstError)) {
          return firstError[0] as string;
        }
        return firstError as string;
      }
    }
    return 'Une erreur est survenue';
  }
}