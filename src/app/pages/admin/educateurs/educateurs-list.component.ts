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
    <div class="p-4 sm:p-8 space-y-12 animate-fade-in text-slate-800 dark:text-slate-100">
      
      <!-- Premium Header -->
      <div class="relative group">
        <div class="absolute -inset-1 bg-gradient-to-r from-sea via-tangerine to-blush rounded-[3rem] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
        <div class="relative flex flex-col lg:flex-row items-center justify-between gap-8 p-10 glass dark:bg-slate-800/40 rounded-[3rem] overflow-hidden">
          <div class="flex items-center gap-8 relative z-10">
            <div class="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-green-600/30 text-3xl font-black text-white transform group-hover:scale-110 transition-transform">
              👩‍🏫
            </div>
            <div>
              <h2 class="text-3xl sm:text-4xl font-black tracking-tight mb-2">Nos Éducateurs</h2>
              <p class="text-lg text-slate-500 dark:text-slate-400 font-medium">{{ items().length }} talents au service des enfants.</p>
            </div>
          </div>
          
          <div class="flex gap-4 relative z-10">
            <button (click)="create()"
                    class="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"/>
              </svg>
              Ajouter un éducateur
            </button>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="glass dark:bg-slate-800/40 p-8 rounded-[2.5rem] border-white/60">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          
          <div class="md:col-span-2 space-y-3">
            <label class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recherche</label>
            <div class="relative">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-sea/10 rounded-xl flex items-center justify-center text-sea">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <input type="text" [(ngModel)]="search" (ngModelChange)="reload()"
                     placeholder="Rechercher un enseignant..."
                     class="w-full pl-16 pr-6 py-4 bg-white/40 dark:bg-slate-700/40 border-2 border-white/60 focus:border-sea/50 rounded-2xl text-sm font-black placeholder-slate-400 outline-none transition-all" />
            </div>
          </div>

          <div class="space-y-3">
            <label class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Affichage</label>
            <select [(ngModel)]="perPage" (change)="reload()"
                    class="w-full px-6 py-4 bg-white/40 dark:bg-slate-700/40 border-2 border-white/60 focus:border-sea/50 rounded-2xl text-xs font-black uppercase tracking-widest outline-none transition-all cursor-pointer">
              <option [ngValue]="10">10 par page</option>
              <option [ngValue]="15">15 par page</option>
              <option [ngValue]="25">25 par page</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        @for (e of items(); track e.id; let i = $index) {
          <div class="group relative">
            <div class="absolute -inset-1 bg-gradient-to-r rounded-[2.5rem] blur opacity-0 group-hover:opacity-15 transition duration-500"
                 [class]="getAvatarColor(i)"></div>
            <div class="relative glass dark:bg-slate-800/40 p-8 rounded-[2.5rem] border-white/60 hover:border-sea/30 transition-all flex flex-col h-full">
              
              <!-- Avatar & Top Actions -->
              <div class="flex items-start justify-between mb-6">
                <div class="w-20 h-20 rounded-3xl flex items-center justify-center text-2xl font-black text-white shadow-2xl transform group-hover:scale-110 transition-transform duration-500"
                     [class]="getAvatarColor(i)">
                  {{ getInitials(e.name) }}
                </div>
                <div class="flex gap-2">
                  <button (click)="remove(e.id)" class="w-10 h-10 rounded-xl glass bg-blush/10 text-blush hover:bg-blush hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 space-y-4">
                <h3 class="text-xl font-black text-slate-900 dark:text-white group-hover:text-sea transition-colors line-clamp-1">
                  {{ e.name }}
                </h3>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest line-clamp-1 border-b border-slate-100 dark:border-slate-700 pb-4">
                  {{ e.email }}
                </p>

                <div class="space-y-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center">🎓</div>
                    <div>
                      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Diplôme</p>
                      <p class="text-sm font-black text-slate-700 dark:text-slate-200 line-clamp-1">{{ e.diplome || 'Non spécifié' }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-sea/10 text-sea flex items-center justify-center">📅</div>
                    <div>
                      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Embauche</p>
                      <p class="text-sm font-black text-slate-700 dark:text-slate-200">{{ formatDate(e.date_embauche) }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer Actions -->
              <div class="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                <button (click)="view(e.id)"
                        class="flex-1 px-4 py-3 glass hover:bg-white dark:hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-sea transition-all flex items-center justify-center gap-2 group/btn">
                  Détails
                  <svg class="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7-7 7"/>
                  </svg>
                </button>
                <button (click)="edit(e.id)"
                        class="w-12 h-12 glass hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-matcha flex items-center justify-center transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
              </div>

              <!-- Decorative Emoji -->
              <div class="absolute top-8 right-8 text-3xl opacity-5 transform rotate-12 group-hover:opacity-20 group-hover:scale-125 transition-all duration-500">
                {{ getCornerEmoji(i) }}
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Empty State -->
      @if (items().length === 0) {
        <div class="glass dark:bg-slate-800/40 p-20 rounded-[4rem] text-center max-w-2xl mx-auto shadow-2xl">
          <div class="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl animate-bounce-slow">
            <span class="text-5xl">👩‍🏫</span>
          </div>
          <h3 class="text-3xl font-black text-slate-900 dark:text-white mb-4">Aucun éducateur</h3>
          <p class="text-slate-500 font-medium text-lg mb-10">Commencez par ajouter votre premier enseignant talentueux !</p>
          <button (click)="create()"
                  class="px-12 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-green-600/30 hover:scale-105 active:scale-95 transition-all">
            Ajouter un enseignant
          </button>
        </div>
      }

      <!-- Pagination -->
      <div class="glass bg-white/40 dark:bg-slate-800/40 p-6 rounded-[2.5rem] border-white/60">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div class="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Page <span class="text-sea font-black text-lg ml-2">{{ page() }}</span>
          </div>

          <div class="flex items-center gap-4">
            <button [disabled]="page() <= 1" (click)="prev()"
                    class="px-8 py-4 glass hover:bg-white dark:hover:bg-slate-700/50 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed group">
              <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"/>
              </svg>
              Précédent
            </button>
            
            <button [disabled]="items().length < perPage" (click)="next()"
                    class="px-8 py-4 glass hover:bg-white dark:hover:bg-slate-700/50 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed group">
              Suivant
              <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
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