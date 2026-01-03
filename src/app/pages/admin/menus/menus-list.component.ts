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
    <div class="p-4 sm:p-8 space-y-12 animate-fade-in text-slate-800 dark:text-slate-100">
      
      <!-- Premium Header -->
      <div class="relative group">
        <div class="absolute -inset-1 bg-gradient-to-r from-sea via-tangerine to-blush rounded-[3rem] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
        <div class="relative flex flex-col lg:flex-row items-center justify-between gap-8 p-10 glass dark:bg-slate-800/40 rounded-[3rem] overflow-hidden">
          <div class="flex items-center gap-8 relative z-10">
            <div class="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-orange-500/30 text-3xl font-black text-white transform group-hover:scale-110 transition-transform">
              🍽️
            </div>
            <div>
              <h2 class="text-3xl sm:text-4xl font-black tracking-tight mb-2">Menus de la Semaine</h2>
              <p class="text-lg text-slate-500 dark:text-slate-400 font-medium">Planification nutritionnelle hebdomadaire.</p>
            </div>
          </div>
          
          <div class="flex gap-4 relative z-10">
             <button routerLink="/admin/menus/create"
                    class="px-8 py-4 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
              <span class="text-xl">➕</span>
              Nouveau Menu
            </button>
          </div>
        </div>
      </div>

      <!-- Week Navigation -->
      <div class="flex justify-center">
        <div class="glass dark:bg-slate-800/40 p-4 rounded-3xl flex items-center gap-8 shadow-2xl border-white/60">
          <button (click)="previousWeek()"
                  class="w-14 h-14 rounded-2xl glass hover:bg-sea hover:text-white text-sea font-black text-2xl transition-all transform hover:scale-110 active:scale-90 flex items-center justify-center">
            ‹
          </button>
          
          <div class="text-center min-w-[200px]">
            <h3 class="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-1">
              {{ getCurrentWeekText() }}
            </h3>
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
              {{ currentWeekStart }} — {{ currentWeekEnd }}
            </p>
          </div>
          
          <button (click)="nextWeek()"
                  class="w-14 h-14 rounded-2xl glass hover:bg-sea hover:text-white text-sea font-black text-2xl transition-all transform hover:scale-110 active:scale-90 flex items-center justify-center">
            ›
          </button>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-20 space-y-4">
          <div class="relative w-16 h-16">
            <div class="absolute inset-0 border-4 border-sea/20 rounded-full animate-ping"></div>
            <div class="absolute inset-2 border-4 border-sea rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Chargement des menus...</p>
        </div>
      } @else {
        <!-- Main Content -->
        <div class="glass dark:bg-slate-800/40 rounded-[3.5rem] border-white/60 overflow-hidden shadow-2xl animate-scale-up">
          <div class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50/50 dark:bg-slate-900/50">
                  <th class="p-10 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">Jour</th>
                  <th class="p-10 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 text-center">🥘 Déjeuner</th>
                  <th class="p-10 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 text-center">🧁 Goûter</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                @for (day of weekDays; track day.dateKey; let i = $index) {
                  <tr class="group hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all">
                    <td class="p-10 border-r border-slate-100 dark:border-slate-700">
                      <div class="flex items-center gap-6">
                        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-sea to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-sea/20 transform group-hover:scale-110 transition-transform">
                          {{ day.dayNumber }}
                        </div>
                        <div>
                          <div class="text-xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-sea transition-colors">{{ day.name }}</div>
                          <div class="text-xs font-black text-slate-400 uppercase tracking-widest italic leading-tight">{{ day.date }}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td class="p-6 border-r border-slate-100 dark:border-slate-700">
                      @if (weeklyMenu()[day.dateKey]?.lunch; as lunch) {
                        <div (click)="openEditModal(lunch)" 
                             class="group/item relative p-6 glass bg-white/40 dark:bg-slate-800/20 rounded-[2rem] border-white/60 hover:bg-white dark:hover:bg-slate-700/50 hover:border-matcha/30 cursor-pointer transition-all h-full min-h-[140px] flex flex-col justify-center gap-3">
                          <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/item:opacity-100 transition-all translate-x-2 group-hover/item:translate-x-0">
                            <button class="w-8 h-8 rounded-lg bg-sea/10 text-sea hover:bg-sea hover:text-white transition-all flex items-center justify-center">✏️</button>
                            <button (click)="deleteMenu(lunch, $event)" 
                                    class="w-8 h-8 rounded-lg bg-blush/10 text-blush hover:bg-blush hover:text-white transition-all flex items-center justify-center">🗑️</button>
                          </div>
                          
                          <p class="text-lg font-black text-slate-800 dark:text-white leading-tight line-clamp-2">{{ lunch.description }}</p>
                          <div class="flex items-center gap-2">
                             <span class="px-3 py-1 bg-matcha/10 text-matcha rounded-lg text-[9px] font-black uppercase tracking-widest border border-matcha/20">
                               {{ lunch.ingredients }}
                             </span>
                          </div>
                        </div>
                      } @else {
                        <div (click)="openCreateModal('lunch', day.dateKey)"
                             class="h-full min-h-[140px] border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-4 hover:border-sea/50 hover:bg-sea/5 dark:hover:bg-sea/10 cursor-pointer transition-all group/add">
                          <span class="text-4xl filter grayscale group-hover/add:grayscale-0 transition-all scale-75 group-hover/add:scale-110">🥗</span>
                          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/add:text-see">Ajouter Déjeuner</span>
                        </div>
                      }
                    </td>

                    <td class="p-6">
                      @if (weeklyMenu()[day.dateKey]?.snack; as snack) {
                        <div (click)="openEditModal(snack)" 
                             class="group/item relative p-6 glass bg-white/40 dark:bg-slate-800/20 rounded-[2rem] border-white/60 hover:bg-white dark:hover:bg-slate-700/50 hover:border-tangerine/30 cursor-pointer transition-all h-full min-h-[140px] flex flex-col justify-center gap-3">
                          <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/item:opacity-100 transition-all translate-x-2 group-hover/item:translate-x-0">
                            <button class="w-8 h-8 rounded-lg bg-sea/10 text-sea hover:bg-sea hover:text-white transition-all flex items-center justify-center">✏️</button>
                            <button (click)="deleteMenu(snack, $event)" 
                                    class="w-8 h-8 rounded-lg bg-blush/10 text-blush hover:bg-blush hover:text-white transition-all flex items-center justify-center">🗑️</button>
                          </div>
                          
                          <p class="text-lg font-black text-slate-800 dark:text-white leading-tight line-clamp-2">{{ snack.description }}</p>
                          <div class="flex items-center gap-2">
                             <span class="px-3 py-1 bg-tangerine/10 text-tangerine rounded-lg text-[9px] font-black uppercase tracking-widest border border-tangerine/20">
                               {{ snack.ingredients }}
                             </span>
                          </div>
                        </div>
                      } @else {
                        <div (click)="openCreateModal('snack', day.dateKey)"
                             class="h-full min-h-[140px] border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-4 hover:border-tangerine/50 hover:bg-tangerine/5 dark:hover:bg-tangerine/10 cursor-pointer transition-all group/add">
                          <span class="text-4xl filter grayscale group-hover/add:grayscale-0 transition-all scale-75 group-hover/add:scale-110">🧁</span>
                          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/add:text-tangerine">Ajouter Goûter</span>
                        </div>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Menu Modal -->
      @if (showModal) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10 animate-fade-in">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" (click)="closeModal()"></div>
          <div class="relative glass bg-white/95 dark:bg-slate-800/95 p-10 sm:p-12 rounded-[4rem] border-white/60 shadow-2xl max-w-2xl w-full transform animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div class="flex items-center gap-8 mb-12">
              <div class="w-24 h-24 rounded-[2rem] bg-gradient-to-br flex items-center justify-center text-4xl shadow-xl shadow-sea/10"
                   [class]="modalForm.type_repas === 'lunch' ? 'from-sea to-indigo-500' : 'from-tangerine to-orange-500'">
                {{ modalForm.type_repas === 'lunch' ? '🥘' : '🧁' }}
              </div>
              <div>
                <h3 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {{ isEditMode ? 'Modifier' : 'Nouveau' }} 
                  {{ modalForm.type_repas === 'lunch' ? 'Déjeuner' : 'Goûter' }}
                </h3>
                <p class="text-lg text-slate-500 font-medium italic">{{ formatDate(modalForm.date_menu) }}</p>
              </div>
            </div>

            <form (ngSubmit)="saveMenu()" #menuForm="ngForm" class="space-y-8">
              <div class="space-y-3">
                <label class="px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Description du menu *</label>
                <div class="relative group">
                  <div class="absolute -inset-1 bg-gradient-to-r from-sea to-indigo-500 rounded-3xl blur opacity-0 group-focus-within:opacity-10 transition duration-500"></div>
                  <textarea [(ngModel)]="modalForm.description" name="description" required
                         class="relative w-full px-8 py-6 bg-white/50 dark:bg-slate-700/50 border-2 border-white/60 focus:border-sea/50 rounded-3xl text-lg font-black placeholder-slate-400 outline-none transition-all resize-none min-h-[120px]"
                         placeholder="Ex: Pâtes à la bolognaise fraîche et fruits de saison..."></textarea>
                </div>
              </div>

              <div class="space-y-3">
                <label class="px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Ingrédients *</label>
                <div class="relative group">
                   <div class="absolute -inset-1 bg-gradient-to-r from-matcha to-emerald-500 rounded-3xl blur opacity-0 group-focus-within:opacity-10 transition duration-500"></div>
                  <textarea [(ngModel)]="modalForm.ingredients" name="ingredients" required
                         class="relative w-full px-8 py-6 bg-white/50 dark:bg-slate-700/50 border-2 border-white/60 focus:border-matcha/50 rounded-3xl text-sm font-black placeholder-slate-400 outline-none transition-all resize-none min-h-[100px]"
                         placeholder="Ex: Pâtes, Viande hachée, Tomates, Oignons, Pommes..."></textarea>
                </div>
              </div>

              @if (errorMessage()) {
                <div class="p-6 bg-blush/10 text-blush rounded-3xl border border-blush/20 text-xs font-black uppercase tracking-widest flex items-center gap-4 animate-shake">
                  <span class="text-2xl">⚠️</span>
                  {{ errorMessage() }}
                </div>
              }

              <div class="flex flex-col sm:flex-row gap-4 pt-4">
                <button type="button" (click)="closeModal()"
                        class="flex-1 px-8 py-5 glass hover:bg-white dark:hover:bg-slate-700 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 transition-all">
                  Annuler
                </button>
                <button type="submit" [disabled]="!menuForm.form.valid || saving()"
                        class="flex-1 px-8 py-5 bg-sea text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-sea/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                  @if (saving()) {
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Enregistrement...</span>
                  } @else {
                    <span>{{ isEditMode ? 'Mettre à jour' : 'Créer le menu' }}</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
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