// src/app/pages/admin/menus/menu-form.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MenusApiService, MenuItem, MenuResponse, DailyMenuPayload } from '../../../services/menu-api.service';

// Define additional interfaces for form handling
interface MenuForm {
  description: string;
  date_menu: string;
  type_repas: string;
  ingredients: string;
}

interface UpdatePayload {
  description: string;
  date_menu: string;
  type_repas: 'lunch' | 'snack';
  ingredients: string;
}

@Component({
  selector: 'app-menu-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-red-100 p-4 sm:p-6">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="relative mb-8">
          <!-- Background decorative elements -->
          <div class="absolute -top-4 -left-4 w-16 h-16 bg-yellow-300 rounded-full opacity-60 animate-bounce" style="animation-delay: 0s;"></div>
          <div class="absolute -top-2 right-10 w-12 h-12 bg-pink-300 rounded-full opacity-60 animate-bounce" style="animation-delay: 0.5s;"></div>
          <div class="absolute top-2 right-32 w-8 h-8 bg-green-300 rounded-full opacity-60 animate-bounce" style="animation-delay: 1s;"></div>

          <div class="card relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-red-500/10"></div>
            <div class="relative flex flex-col lg:flex-row items-center justify-between gap-6">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <span class="text-3xl">{{ isEdit() ? '🍽️' : '🧑‍🍳' }}</span>
                </div>
                <div>
                  <h1 class="text-3xl font-black text-gray-800 tracking-tight">
                    {{ isEdit() ? 'Modifier' : 'Nouveau' }} Menu
                  </h1>
                  <p class="text-gray-600 font-medium">
                    {{ isEdit() ? 'Mettre à jour le menu existant' : 'Créer un nouveau menu pour les enfants' }}
                  </p>
                </div>
              </div>
              <button
                class="btn-primary bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                type="button"
                (click)="back()"
              >
                <span class="text-xl">⬅️</span>
                Retour
              </button>
            </div>
          </div>
        </div>

        <!-- Form Card -->
        <div class="relative">
          <!-- Decorative food elements -->
          <div class="absolute -top-6 -right-6 w-20 h-20 bg-red-200 rounded-full opacity-40 animate-pulse"></div>
          <div class="absolute -bottom-6 -left-6 w-16 h-16 bg-yellow-200 rounded-full opacity-40 animate-pulse" style="animation-delay: 1s;"></div>

          <div class="card relative overflow-hidden bg-white/95 backdrop-blur border border-orange-200 shadow-2xl">
            <div class="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-yellow-50/80 to-red-50/80"></div>
            <div class="relative p-8">
              <form (ngSubmit)="submit()" #formRef="ngForm" class="space-y-8">
                
                <!-- Basic Information Section -->
                <div class="space-y-6">
                  <div class="flex items-center gap-3 mb-6">
                    <div class="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <span class="text-lg">📋</span>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800">Informations du Menu</h3>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Date -->
                    <div class="space-y-2">
                      <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <span class="text-lg">📅</span>
                        Date du menu <span class="text-red-500">*</span>
                      </label>
                      <input
                        class="w-full px-4 py-3 rounded-2xl border-2 border-orange-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 bg-white/90 backdrop-blur font-medium transition-all duration-200"
                        type="date"
                        [(ngModel)]="form.date_menu"
                        name="date_menu"
                        required
                      />
                    </div>

                    <!-- Type -->
                    <div class="space-y-2">
                      <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <span class="text-lg">🍽️</span>
                        Type de repas <span class="text-red-500">*</span>
                      </label>
                      <select
                        class="w-full px-4 py-3 rounded-2xl border-2 border-orange-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 bg-white/90 backdrop-blur font-medium transition-all duration-200"
                        [(ngModel)]="form.type_repas"
                        name="type_repas"
                        required
                      >
                        <option value="">Sélectionner...</option>
                        <option value="lunch">🍽️ Déjeuner</option>
                        <option value="snack">🧁 Goûter</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Menu Details Section -->
                <div class="space-y-6">
                  <div class="flex items-center gap-3 mb-6">
                    <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <span class="text-lg">🥘</span>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800">Détails du Menu</h3>
                  </div>

                  <!-- Description -->
                  <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <span class="text-lg">📝</span>
                      Description du menu <span class="text-red-500">*</span>
                    </label>
                    <textarea
                      class="w-full px-4 py-3 rounded-2xl border-2 border-green-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 bg-white/90 backdrop-blur placeholder-gray-400 font-medium transition-all duration-200 resize-none"
                      rows="4"
                      [(ngModel)]="form.description"
                      name="description"
                      required
                      placeholder="Décrivez le menu de manière appétissante..."
                    ></textarea>
                  </div>

                  <!-- Ingredients -->
                  <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <span class="text-lg">🥕</span>
                      Ingrédients <span class="text-red-500">*</span>
                    </label>
                    <textarea
                      class="w-full px-4 py-3 rounded-2xl border-2 border-blue-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 bg-white/90 backdrop-blur placeholder-gray-400 font-medium transition-all duration-200 resize-none"
                      rows="4"
                      [(ngModel)]="form.ingredients"
                      name="ingredients"
                      required
                      placeholder="Liste détaillée des ingrédients..."
                    ></textarea>
                  </div>
                </div>

                <!-- Preview Section -->
                <div *ngIf="form.description || form.ingredients" class="space-y-6">
                  <div class="flex items-center gap-3 mb-6">
                    <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <span class="text-lg">👀</span>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800">Aperçu</h3>
                  </div>

                  <div class="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
                    <div class="flex items-center gap-3 mb-4">
                      <span class="text-2xl">{{ form.type_repas === 'lunch' ? '🍽️' : '🧁' }}</span>
                      <h4 class="text-lg font-bold text-purple-800">
                        {{ form.type_repas === 'lunch' ? 'Déjeuner' : form.type_repas === 'snack' ? 'Goûter' : 'Menu' }}
                        {{ form.date_menu ? '- ' + formatDate(form.date_menu) : '' }}
                      </h4>
                    </div>
                    
                    <div *ngIf="form.description" class="mb-3">
                      <p class="text-purple-700 font-medium">{{ form.description }}</p>
                    </div>
                    
                    <div *ngIf="form.ingredients" class="bg-purple-100 px-3 py-2 rounded-lg">
                      <p class="text-xs text-purple-600">
                        <strong>Ingrédients:</strong> {{ form.ingredients }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Error Message -->
                <div *ngIf="error()" class="p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                  <div class="flex items-center gap-3">
                    <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span class="text-white text-sm">⚠️</span>
                    </div>
                    <p class="text-red-700 font-medium">{{ error() }}</p>
                  </div>
                </div>

                <!-- Loading -->
                <div *ngIf="saving()" class="p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                  <div class="flex items-center gap-3">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <p class="text-blue-700 font-medium">Enregistrement en cours...</p>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    class="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-green-200 hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    type="submit"
                    [disabled]="!formRef.form.valid || saving()"
                  >
                    <span class="text-xl">💾</span>
                    {{ isEdit() ? 'Mettre à jour le menu' : 'Créer le menu' }}
                  </button>

                  <button
                    class="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-gray-200 hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
                    type="button"
                    (click)="cancel()"
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
    .card {
      @apply bg-white rounded-3xl shadow-lg border border-gray-200 p-6;
    }
  `]
})
export class MenuFormComponent implements OnInit {
  private menusApi = inject(MenusApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: number | null = null;
  isEdit = signal<boolean>(false);
  error = signal<string | null>(null);
  saving = signal<boolean>(false);

  form: MenuForm = {
    description: '',
    date_menu: '',
    type_repas: '',
    ingredients: ''
  };

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      this.isEdit.set(true);
      this.loadMenu();
    }

    // Check for query params (for duplication)
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams['description']) {
      this.form.description = queryParams['description'];
    }
    if (queryParams['ingredients']) {
      this.form.ingredients = queryParams['ingredients'];
    }
    if (queryParams['type_repas']) {
      this.form.type_repas = queryParams['type_repas'];
    }
    if (queryParams['date_menu']) {
      this.form.date_menu = queryParams['date_menu'];
    }
  }

  private loadMenu(): void {
    if (!this.id) return;
    
    this.menusApi.getById(this.id).subscribe({
      next: (response: MenuResponse) => {
        const menu = Array.isArray(response.data) ? response.data[0] : response.data;
        if (menu) {
          this.form = {
            description: menu.description || '',
            date_menu: menu.date_menu ? menu.date_menu.substring(0, 10) : '',
            type_repas: menu.type_repas || '',
            ingredients: menu.ingredients || ''
          };
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading menu:', err);
        this.error.set('Erreur lors du chargement des données');
      }
    });
  }

  submit(): void {
    this.error.set(null);
    this.saving.set(true);

    // Basic validation
    if (!this.form.description.trim()) {
      this.error.set('La description est obligatoire');
      this.saving.set(false);
      return;
    }

    if (!this.form.date_menu) {
      this.error.set('La date du menu est obligatoire');
      this.saving.set(false);
      return;
    }

    if (!this.form.type_repas) {
      this.error.set('Le type de repas est obligatoire');
      this.saving.set(false);
      return;
    }

    if (!this.form.ingredients.trim()) {
      this.error.set('Les ingrédients sont obligatoires');
      this.saving.set(false);
      return;
    }

    if (this.isEdit()) {
      this.updateMenu();
    } else {
      this.createMenu();
    }
  }

  private updateMenu(): void {
    if (!this.id) return;

    const payload: UpdatePayload = {
      description: this.form.description.trim(),
      date_menu: this.form.date_menu,
      type_repas: this.form.type_repas as 'lunch' | 'snack',
      ingredients: this.form.ingredients.trim()
    };

    this.menusApi.update(this.id, payload).subscribe({
      next: (response: MenuResponse) => {
        this.saving.set(false);
        this.router.navigate(['/admin/menus']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Update error:', err);
        this.saving.set(false);
        this.error.set(this.getErrorMessage(err));
      }
    });
  }

  private createMenu(): void {
    // CORRECTION PRINCIPALE: Respecter la structure attendue par le backend
    const payload: DailyMenuPayload = {
      date_menu: this.form.date_menu,
      type: this.form.type_repas as 'lunch' | 'snack', // 'type' au lieu de 'type_repas'
      [this.form.type_repas]: { // Imbriquer dans l'objet correspondant au type
        description: this.form.description.trim(),
        ingredients: this.form.ingredients.trim()
      }
    };

    console.log('Payload envoyé:', payload); // Pour debug

    this.menusApi.createDaily(payload).subscribe({
      next: (response: MenuResponse) => {
        this.saving.set(false);
        this.router.navigate(['/admin/menus']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Create error:', err);
        this.saving.set(false);
        this.error.set(this.getErrorMessage(err));
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/menus']);
  }

  back(): void {
    this.router.navigate(['/admin']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
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