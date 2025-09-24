// src/app/pages/admin/educateurs/educateurs-list.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EducateursApiService, EducateurListItem } from '../../../services/educateurs-api.service';

@Component({
  selector: 'app-educateurs-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4 sm:p-6">
    <!-- Floating Header with Playful Design -->
    <div class="max-w-7xl mx-auto">
      <div class="relative mb-8">
        <!-- Background decorative elements -->
        <div class="absolute -top-4 -left-4 w-16 h-16 bg-yellow-300 rounded-full opacity-60 animate-bounce" style="animation-delay: 0s;"></div>
        <div class="absolute -top-2 right-10 w-12 h-12 bg-pink-300 rounded-full opacity-60 animate-bounce" style="animation-delay: 0.5s;"></div>
        <div class="absolute top-2 right-32 w-8 h-8 bg-green-300 rounded-full opacity-60 animate-bounce" style="animation-delay: 1s;"></div>
        
        <div class="card relative overflow-hidden">
          <!-- Header gradient -->
          <div class="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10"></div>
          
          <div class="relative flex flex-col lg:flex-row items-center justify-between gap-6">
            <div class="flex items-center gap-4">
              <!-- Cute teacher icon -->
              <div class="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-400 rounded-2xl flex items-center justify-center shadow-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div>
                <h1 class="text-3xl font-black text-gray-800 tracking-tight">
                  Nos Éducateurs 
                  <span class="text-2xl">🌟</span>
                </h1>
                <p class="text-gray-600 font-medium">Équipe pédagogique de notre jardin d'enfants</p>
              </div>
            </div>

            <!-- Search and Controls -->
            <div class="flex flex-wrap items-center gap-3">
              <!-- Search Input -->
              <div class="relative">
                <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  class="input pl-10 pr-4 py-3 w-64 rounded-2xl border-2 border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 bg-white/90 backdrop-blur placeholder-gray-400 font-medium"
                  placeholder="Rechercher un éducateur..."
                  [(ngModel)]="search"
                  (ngModelChange)="reload()"
                />
              </div>

              <!-- Items Per Page -->
              <select 
                class="input px-4 py-3 rounded-2xl border-2 border-blue-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 bg-white/90 backdrop-blur font-medium text-gray-700" 
                [(ngModel)]="perPage" 
                (change)="reload()"
              >
                <option [ngValue]="10">10 par page</option>
                <option [ngValue]="15">15 par page</option>
                <option [ngValue]="25">25 par page</option>
              </select>

              <!-- Add New Button -->
              <button
                class="btn-primary bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-green-200 hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                (click)="create()"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Nouvel éducateur
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modern Card-Based Layout -->
      <div class="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div 
          *ngFor="let e of items(); let i = index" 
          class="group relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur border border-white/60 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          [class]="getCardColor(i)"
        >
          <!-- Card Header with Avatar -->
          <div class="relative p-6 pb-4">
            <div class="flex items-center gap-4">
              <!-- Avatar with initials -->
              <div 
                class="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                [class]="getAvatarColor(i)"
              >
                {{ getInitials(e.name) }}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-lg text-gray-800 truncate">{{ e.name }}</h3>
                <p class="text-sm text-gray-600 font-medium">{{ e.email }}</p>
              </div>
            </div>
          </div>

          <!-- Card Content -->
          <div class="px-6 pb-6 space-y-3">
            <!-- Info Row -->
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-sm">
                <div class="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span class="text-gray-600 font-medium">Diplôme:</span>
                <span class="text-gray-800 font-semibold">{{ e.diplome || 'Non spécifié' }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <div class="w-2 h-2 bg-pink-400 rounded-full"></div>
                <span class="text-gray-600 font-medium">Embauché le:</span>
                <span class="text-gray-800 font-semibold">{{ e.date_embauche || 'Non spécifié' }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2 pt-2">
              <!-- View Button -->
              <button
                class="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 font-medium hover:scale-105"
                (click)="view(e.id)"
                title="Voir le profil"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <span class="text-xs">Voir</span>
              </button>

              <!-- Edit Button -->
              <button
                class="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-xl transition-all duration-200 font-medium hover:scale-105"
                (click)="edit(e.id)"
                title="Modifier"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                <span class="text-xs">Modifier</span>
              </button>

              <!-- Delete Button -->
              <button
                class="flex items-center justify-center gap-1 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 font-medium hover:scale-105"
                (click)="remove(e.id)"
                title="Supprimer"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Decorative corner -->
          <div class="absolute top-0 right-0 w-16 h-16 overflow-hidden">
            <div class="absolute top-2 right-2 w-4 h-4 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full opacity-60"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="items().length === 0" class="text-center py-12">
        <div class="max-w-sm mx-auto">
          <div class="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">Aucun éducateur trouvé</h3>
          <p class="text-gray-600 mb-6">Commencez par ajouter votre premier éducateur à l'équipe.</p>
          <button
            class="btn-primary bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
            (click)="create()"
          >
            Ajouter un éducateur
          </button>
        </div>
      </div>

      <!-- Playful Pagination -->
      <div class="flex items-center justify-center gap-4 mt-12 mb-8">
        <button
          class="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/90 hover:bg-white shadow-lg hover:shadow-xl text-gray-700 font-bold transition-all duration-200 transform hover:scale-105 border-2 border-purple-200 hover:border-purple-300"
          [disabled]="page() <= 1"
          [class.opacity-50]="page() <= 1"
          [class.cursor-not-allowed]="page() <= 1"
          (click)="prev()"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Précédent
        </button>

        <div class="flex items-center gap-3">
          <div class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold shadow-lg">
            Page {{ page() }}
          </div>
        </div>

        <button
          class="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/90 hover:bg-white shadow-lg hover:shadow-xl text-gray-700 font-bold transition-all duration-200 transform hover:scale-105 border-2 border-purple-200 hover:border-purple-300"
          [disabled]="items().length < perPage"
          [class.opacity-50]="items().length < perPage"
          [class.cursor-not-allowed]="items().length < perPage"
          (click)="next()"
        >
          Suivant
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
  `
})
export class EducateursListComponent {
  private api = inject(EducateursApiService);
  private router = inject(Router);

  search = '';
  perPage = 15;
  page = signal(1);
  items = signal<EducateurListItem[]>([]);

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.api.list({ page: this.page(), per_page: this.perPage, search: this.search || undefined })
      .subscribe(res => this.items.set((res as any).data ?? []));
  }

  next() { this.page.update(p => p + 1); this.reload(); }
  prev() { this.page.update(p => Math.max(1, p - 1)); this.reload(); }

  view(id: number) { this.router.navigate(['/admin/educateurs', id]); }
  edit(id: number) { this.router.navigate(['/admin/educateurs', id, 'edit']); }
  create() { this.router.navigate(['/admin/educateurs/create']); }

  remove(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet éducateur ? Cette action est irréversible.')) return;
    this.api.delete(id).subscribe(() => this.reload());
  }

  // Helper methods for dynamic styling
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getCardColor(index: number): string {
    const colors = [
      'hover:shadow-purple-200/50',
      'hover:shadow-pink-200/50',
      'hover:shadow-blue-200/50',
      'hover:shadow-green-200/50',
      'hover:shadow-yellow-200/50',
      'hover:shadow-orange-200/50'
    ];
    return colors[index % colors.length];
  }

  getCardBackground(index: number): string {
    const backgrounds = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    ];
    return backgrounds[index % backgrounds.length];
  }

  getCardBorder(index: number): string {
    const borders = [
      'hover:border-purple-300',
      'hover:border-pink-300',
      'hover:border-blue-300',
      'hover:border-green-300',
      'hover:border-yellow-300',
      'hover:border-orange-300'
    ];
    return borders[index % borders.length];
  }

  getCardAccent(index: number): string {
    const accents = [
      'from-purple-400 via-purple-500 to-purple-600',
      'from-pink-400 via-pink-500 to-rose-600',
      'from-blue-400 via-blue-500 to-cyan-600',
      'from-green-400 via-emerald-500 to-teal-600',
      'from-yellow-400 via-orange-500 to-red-600',
      'from-orange-400 via-pink-500 to-purple-600'
    ];
    return accents[index % accents.length];
  }

  getAvatarColor(index: number): string {
    const colors = [
      'bg-gradient-to-br from-purple-600 to-purple-800 shadow-purple-300',
      'bg-gradient-to-br from-pink-600 to-rose-800 shadow-pink-300',
      'bg-gradient-to-br from-blue-600 to-blue-800 shadow-blue-300',
      'bg-gradient-to-br from-green-600 to-emerald-800 shadow-green-300',
      'bg-gradient-to-br from-yellow-500 to-orange-700 shadow-yellow-300',
      'bg-gradient-to-br from-orange-600 to-red-800 shadow-orange-300'
    ];
    return colors[index % colors.length];
  }
}