import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClassesApiService, ClasseListItem } from '../../../services/classes-api.service';

@Component({
  selector: 'app-classes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="p-4 sm:p-8 space-y-12 animate-fade-in text-slate-800 dark:text-slate-100">
    
    <!-- Premium Header Section -->
    <div class="relative group">
      <div class="absolute -inset-1 bg-gradient-to-r from-sea via-tangerine to-blush rounded-[3rem] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
      <div class="relative flex flex-col lg:flex-row items-center justify-between gap-8 p-10 glass dark:bg-slate-800/40 rounded-[3rem] overflow-hidden">
        <div class="flex items-center gap-8 relative z-10">
          <div class="w-20 h-20 bg-gradient-to-br from-sea to-blue-600 rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-sea/30 text-3xl font-black text-white transform group-hover:scale-110 transition-transform">
            🏫
          </div>
          <div>
            <h2 class="text-3xl sm:text-4xl font-black tracking-tight mb-2">Gestion des Classes</h2>
            <p class="text-lg text-slate-500 dark:text-slate-400 font-medium">Configurez et supervisez les groupes d'apprentissage.</p>
          </div>
        </div>
        
        <button (click)="create()"
                class="relative z-10 px-8 py-4 bg-sea text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-sea/30 flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"/>
          </svg>
          Nouvelle Classe
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="glass dark:bg-slate-800/40 p-8 rounded-[2.5rem] border-white/60">
      <div class="flex flex-col lg:flex-row items-stretch lg:items-center gap-6">
        <!-- Search -->
        <div class="flex-1 relative">
          <div class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-sea/10 rounded-xl flex items-center justify-center text-sea">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input [(ngModel)]="search" (ngModelChange)="reload()"
                 class="w-full pl-16 pr-6 py-4 bg-white/40 dark:bg-slate-700/40 border-2 border-white/60 focus:border-sea/50 focus:ring-4 focus:ring-sea/10 rounded-2xl text-sm font-black placeholder-slate-400 transition-all outline-none"
                 placeholder="Rechercher une classe..." />
        </div>

        <div class="flex flex-col sm:flex-row items-center gap-4">
          <!-- Level Filter -->
          <select [(ngModel)]="niveauFilter" (change)="reload()"
                  class="w-full sm:w-48 px-6 py-4 bg-white/40 dark:bg-slate-700/40 border-2 border-white/60 focus:border-sea/50 rounded-2xl text-xs font-black uppercase tracking-widest outline-none transition-all cursor-pointer">
            <option value="">Tous les Niveaux</option>
            <option value="1">Petite Section</option>
            <option value="2">Moyenne Section</option>
            <option value="3">Grande Section</option>
            <option value="4">CP</option>
            <option value="5">CE1</option>
            <option value="6">CE2</option>
            <option value="7">CM1</option>
            <option value="8">CM2</option>
          </select>

          <!-- Per Page -->
          <select [(ngModel)]="perPage" (change)="reload()"
                  class="w-full sm:w-40 px-6 py-4 bg-white/40 dark:bg-slate-700/40 border-2 border-white/60 focus:border-sea/50 rounded-2xl text-xs font-black uppercase tracking-widest outline-none transition-all cursor-pointer">
            <option [ngValue]="10">10 / page</option>
            <option [ngValue]="15">15 / page</option>
            <option [ngValue]="25">25 / page</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Main Table Section -->
    <div class="space-y-6">
      <div class="overflow-x-auto custom-scrollbar">
        <table class="w-full text-left border-separate border-spacing-y-4">
          <thead>
            <tr>
              <th class="px-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Classe / Niveau</th>
              <th class="px-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacité</th>
              <th class="px-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Occupation</th>
              <th class="px-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
              <th class="px-8 pb-4 text-right"></th>
            </tr>
          </thead>
          <tbody>
            @for (c of items(); track c.id) {
              <tr class="group cursor-pointer">
                <!-- Name & Level -->
                <td class="px-8 py-6 glass bg-white/40 dark:bg-slate-800/20 rounded-l-[2.5rem] border-y border-l border-white/60 group-hover:bg-white dark:group-hover:bg-slate-700/50 transition-all">
                  <div class="flex items-center gap-6">
                    <div class="w-14 h-14 bg-gradient-to-br from-sea to-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-sea/20 group-hover:scale-110 transition-transform">
                      {{ c.niveau }}
                    </div>
                    <div>
                      <p class="font-black text-slate-900 dark:text-white text-lg leading-tight mb-1 group-hover:text-sea transition-colors">
                        {{ c.nom }}
                      </p>
                      <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ getNiveauLabel(c.niveau) }}</p>
                    </div>
                  </div>
                </td>

                <!-- Capacity Info -->
                <td class="px-8 py-6 glass bg-white/40 dark:bg-slate-800/20 border-y border-white/60 group-hover:bg-white dark:group-hover:bg-slate-700/50 transition-all">
                  <div class="flex items-center gap-6">
                    <div class="flex flex-col">
                      <span class="text-xl font-black text-slate-900 dark:text-white">{{ c.nombre_enfants }}</span>
                      <span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Élèves</span>
                    </div>
                    <div class="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                    <div class="flex flex-col">
                      <span class="text-xl font-black text-slate-900 dark:text-white text-opacity-50 group-hover:text-opacity-100 transition-all">{{ c.capacite_max }}</span>
                      <span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Places</span>
                    </div>
                  </div>
                </td>

                <!-- Occupation Bar -->
                <td class="px-8 py-6 glass bg-white/40 dark:bg-slate-800/20 border-y border-white/60 group-hover:bg-white dark:group-hover:bg-slate-700/50 transition-all">
                  <div class="max-w-[120px] mx-auto space-y-2">
                    <div class="flex justify-between items-center px-1">
                      <span class="text-[10px] font-black text-slate-500">{{ c.taux_occupation }}%</span>
                    </div>
                    <div class="h-2 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden p-0">
                      <div class="h-full rounded-full transition-all duration-1000 shadow-sm"
                           [class]="getTauxOccupationClass(c.taux_occupation)"
                           [style.width.%]="c.taux_occupation"></div>
                    </div>
                  </div>
                </td>

                <!-- Status Badge -->
                <td class="px-8 py-6 glass bg-white/40 dark:bg-slate-800/20 border-y border-white/60 group-hover:bg-white dark:group-hover:bg-slate-700/50 transition-all">
                  <span class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-current transition-all"
                        [class.text-matcha]="getStatutLabel(c) === 'Available'"
                        [class.bg-matcha/5]="getStatutLabel(c) === 'Available'"
                        [class.text-tangerine]="getStatutLabel(c) === 'Busy' || getStatutLabel(c) === 'Almost Full'"
                        [class.bg-tangerine/5]="getStatutLabel(c) === 'Busy' || getStatutLabel(c) === 'Almost Full'"
                        [class.text-blush]="getStatutLabel(c) === 'Full'"
                        [class.bg-blush/5]="getStatutLabel(c) === 'Full'"
                        [class.text-slate-400]="getStatutLabel(c) === 'Empty'"
                        [class.bg-slate-50]="getStatutLabel(c) === 'Empty'">
                    {{ getStatutLabel(c) }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-8 py-6 glass bg-white/40 dark:bg-slate-800/20 rounded-r-[2.5rem] border-y border-r border-white/60 group-hover:bg-white dark:group-hover:bg-slate-700/50 transition-all text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <button (click)="view(c.id)"
                            class="w-10 h-10 rounded-xl bg-sea/10 text-sea hover:bg-sea hover:text-white transition-all transform hover:scale-110 flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>
                    <button (click)="edit(c.id)"
                            class="w-10 h-10 rounded-xl bg-matcha/10 text-matcha hover:bg-matcha hover:text-white transition-all transform hover:scale-110 flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button (click)="remove(c.id, c.nom, c.nombre_enfants)"
                            class="w-10 h-10 rounded-xl bg-blush/10 text-blush hover:bg-blush hover:text-white transition-all transform hover:scale-110 flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      @if (items().length === 0) {
        <div class="glass dark:bg-slate-800/40 p-20 rounded-[3rem] text-center opacity-30">
          <div class="text-8xl mb-6">📚</div>
          <p class="text-xl font-black uppercase tracking-widest italic">Aucune classe trouvée</p>
        </div>
      }

      <!-- Pagination -->
      <div class="glass bg-white/40 dark:bg-slate-800/40 p-6 rounded-[2.5rem] border-white/60">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div class="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Total : <span class="text-sea">{{ items().length }}</span> classes affichées
          </div>
          <div class="flex items-center gap-4">
            <button [disabled]="page() <= 1" (click)="prev()"
                    class="px-6 py-3 glass hover:bg-white dark:hover:bg-slate-700/50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"/>
              </svg>
              Précédent
            </button>
            <div class="px-6 py-3 bg-sea text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-sea/20">
              Page {{ page() }}
            </div>
            <button [disabled]="items().length < perPage" (click)="next()"
                    class="px-6 py-3 glass hover:bg-white dark:hover:bg-slate-700/50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed">
              Suivant
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class ClassesListComponent {
  private api = inject(ClassesApiService);
  private router = inject(Router);

  search = '';
  niveauFilter = '';
  perPage = 15;
  page = signal(1);
  items = signal<ClasseListItem[]>([]);

  ngOnInit() {
    this.reload();
  }

  reload() {
    const params: any = {
      page: this.page(),
      per_page: this.perPage
    };

    if (this.search) params.search = this.search;
    if (this.niveauFilter) params.niveau = this.niveauFilter;

    this.api.list(params).subscribe(r => {
      this.items.set(r.data?.data ?? []);
    });
  }

  next() {
    this.page.update(p => p + 1);
    this.reload();
  }

  prev() {
    this.page.update(p => Math.max(1, p - 1));
    this.reload();
  }

  view(id: number) {
    this.router.navigate(['/admin/classes', id]);
  }

  edit(id: number) {
    this.router.navigate(['/admin/classes', id, 'edit']);
  }

  create() {
    this.router.navigate(['/admin/classes/create']);
  }

  remove(id: number, nom: string, nombreEnfants: number) {
    if (nombreEnfants > 0) {
      alert(`Cannot delete class "${nom}". It contains ${nombreEnfants} enrolled student(s).`);
      return;
    }

    if (!confirm(`Delete class "${nom}"?`)) return;

    this.api.delete(id).subscribe(() => {
      this.reload();
    });
  }

  back() {
    this.router.navigate(['/admin']);
  }

  getNiveauLabel(niveau: number): string {
    return ClassesApiService.getNiveauLabel(niveau);
  }

  getTauxOccupationClass(taux: number): string {
    if (taux >= 100) return 'bg-gradient-to-r from-red-500 to-red-600';
    if (taux >= 90) return 'bg-gradient-to-r from-orange-500 to-orange-600';
    if (taux >= 70) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    return 'bg-gradient-to-r from-green-500 to-green-600';
  }

  getStatutClass(classe: ClasseListItem): string {
    if (classe.est_complete) return 'bg-red-100 text-red-800 border-red-300';
    if (classe.taux_occupation >= 90) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (classe.taux_occupation >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (classe.nombre_enfants === 0) return 'bg-gray-100 text-gray-800 border-gray-300';
    return 'bg-green-100 text-green-800 border-green-300';
  }

  getStatutLabel(classe: ClasseListItem): string {
    if (classe.est_complete) return 'Full';
    if (classe.taux_occupation >= 90) return 'Almost Full';
    if (classe.taux_occupation >= 70) return 'Busy';
    if (classe.nombre_enfants === 0) return 'Empty';
    return 'Available';
  }
}