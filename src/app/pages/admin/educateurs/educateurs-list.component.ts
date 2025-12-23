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
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-pink-100">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
          <span class="text-3xl">👩‍🏫</span>
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-800">Our Amazing Teachers</h2>
          <p class="text-sm text-gray-600 font-medium">{{ items().length }} talented educators</p>
        </div>
      </div>

      <!-- Controls -->
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
            class="pl-10 pr-4 py-2.5 w-56 rounded-xl border-2 border-green-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 bg-white transition-all placeholder-gray-400 font-medium text-sm"
            placeholder="Search teachers..."
            [(ngModel)]="search"
            (ngModelChange)="reload()"
          />
        </div>

        <!-- Items Per Page -->
        <select 
          class="px-4 py-2.5 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 bg-white font-medium text-gray-700 text-sm" 
          [(ngModel)]="perPage" 
          (change)="reload()"
        >
          <option [ngValue]="10">10 per page</option>
          <option [ngValue]="15">15 per page</option>
          <option [ngValue]="25">25 per page</option>
        </select>

        <!-- Add New Button -->
        <button
          class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 text-sm"
          (click)="create()"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
          </svg>
          Add Teacher
        </button>
      </div>
    </div>

    <!-- Teachers Grid -->
    <div class="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div 
        *ngFor="let e of items(); let i = index" 
        class="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border-3 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        [class]="getCardBorder(i)"
      >
        <!-- Decorative Top Bar -->
        <div class="h-2 bg-gradient-to-r" [class]="getCardAccent(i)"></div>

        <!-- Card Content -->
        <div class="p-5">
          <!-- Avatar Section -->
          <div class="flex items-center gap-3 mb-4">
            <div 
              class="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-110 transition-transform"
              [class]="getAvatarColor(i)"
            >
              {{ getInitials(e.name) }}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-black text-base text-gray-800 truncate">{{ e.name }}</h3>
              <p class="text-xs text-gray-600 font-medium truncate">{{ e.email }}</p>
            </div>
          </div>

          <!-- Info Section -->
          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-2 text-xs">
              <div class="w-2 h-2 rounded-full" [class]="getDotColor(i, 0)"></div>
              <span class="text-gray-600 font-medium">Degree:</span>
              <span class="text-gray-800 font-bold truncate flex-1">{{ e.diplome || 'Not specified' }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <div class="w-2 h-2 rounded-full" [class]="getDotColor(i, 1)"></div>
              <span class="text-gray-600 font-medium">Hired:</span>
              <span class="text-gray-800 font-bold">{{ formatDate(e.date_embauche) }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2">
            <button
              class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 font-bold hover:scale-105 text-xs"
              (click)="view(e.id)"
              title="View profile"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              View
            </button>

            <button
              class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-all duration-200 font-bold hover:scale-105 text-xs"
              (click)="edit(e.id)"
              title="Edit"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Edit
            </button>

            <button
              class="flex items-center justify-center px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200 font-bold hover:scale-105"
              (click)="remove(e.id)"
              title="Delete"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Corner Emoji Decoration -->
        <div class="absolute top-4 right-4 text-2xl opacity-30 group-hover:opacity-60 group-hover:scale-125 transition-all">
          {{ getCornerEmoji(i) }}
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div *ngIf="items().length === 0" class="text-center py-16 bg-white/70 backdrop-blur-sm rounded-2xl border-2 border-gray-200">
      <div class="max-w-sm mx-auto">
        <div class="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
          <span class="text-5xl">👩‍🏫</span>
        </div>
        <h3 class="text-2xl font-black text-gray-800 mb-2">No Teachers Found</h3>
        <p class="text-gray-600 font-medium mb-6">Start by adding your first amazing teacher!</p>
        <button
          class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
          (click)="create()"
        >
          Add First Teacher
        </button>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-center gap-4 mt-8">
      <button
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/80 hover:bg-white shadow-md hover:shadow-lg text-gray-700 font-bold transition-all duration-200 transform hover:scale-105 border-2 border-green-200 hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        [disabled]="page() <= 1"
        (click)="prev()"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
        </svg>
        Previous
      </button>

      <div class="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-black shadow-lg">
        Page {{ page() }}
      </div>

      <button
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/80 hover:bg-white shadow-md hover:shadow-lg text-gray-700 font-bold transition-all duration-200 transform hover:scale-105 border-2 border-green-200 hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        [disabled]="items().length < perPage"
        (click)="next()"
      >
        Next
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
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
    if (!confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) return;
    this.api.delete(id).subscribe(() => this.reload());
  }

  formatDate(date: string | null): string {
    if (!date) return 'Not specified';
    try {
      return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Not specified';
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getCardBorder(index: number): string {
    const borders = [
      'border-purple-200 hover:border-purple-300',
      'border-pink-200 hover:border-pink-300',
      'border-blue-200 hover:border-blue-300',
      'border-green-200 hover:border-green-300',
      'border-yellow-200 hover:border-yellow-300',
      'border-orange-200 hover:border-orange-300'
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
      'bg-gradient-to-br from-purple-500 to-purple-700',
      'bg-gradient-to-br from-pink-500 to-rose-700',
      'bg-gradient-to-br from-blue-500 to-blue-700',
      'bg-gradient-to-br from-green-500 to-emerald-700',
      'bg-gradient-to-br from-yellow-500 to-orange-700',
      'bg-gradient-to-br from-orange-500 to-red-700'
    ];
    return colors[index % colors.length];
  }

  getDotColor(index: number, dotIndex: number): string {
    const colors = [
      ['bg-purple-400', 'bg-purple-500'],
      ['bg-pink-400', 'bg-pink-500'],
      ['bg-blue-400', 'bg-blue-500'],
      ['bg-green-400', 'bg-green-500'],
      ['bg-yellow-400', 'bg-yellow-500'],
      ['bg-orange-400', 'bg-orange-500']
    ];
    return colors[index % colors.length][dotIndex % 2];
  }

  getCornerEmoji(index: number): string {
    const emojis = ['⭐', '✨', '🌟', '💫', '🎨', '📚'];
    return emojis[index % emojis.length];
  }
}