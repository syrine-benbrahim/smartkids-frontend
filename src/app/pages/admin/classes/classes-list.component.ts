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
  <div class="space-y-6">
    
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-3xl p-6 shadow-xl border-4 border-purple-200">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
        </div>
        <div>
          <h2 class="text-3xl font-black text-white">Classes</h2>
          <p class="text-white/80 text-sm font-medium">Manage student classes and groups</p>
        </div>
      </div>
      <button 
        class="bg-white/20 hover:bg-white/30 backdrop-blur border-2 border-white/30 hover:border-white/50 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
        (click)="create()">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
        </svg>
        <span>New Class</span>
      </button>
    </div>

    <!-- Filters Section -->
    <div class="bg-white rounded-3xl p-6 shadow-sm border-4 border-purple-100">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <!-- Search -->
        <div class="flex-1 w-full sm:w-auto">
          <div class="relative">
            <div class="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input 
              class="w-full pl-12 pr-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 rounded-2xl text-sm font-medium placeholder-gray-500 transition-all"
              placeholder="Search by name or level..." 
              [(ngModel)]="search" 
              (ngModelChange)="reload()" />
          </div>
        </div>

        <!-- Level Filter -->
        <select 
          class="px-4 py-3 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 rounded-2xl text-sm font-bold transition-all"
          [(ngModel)]="niveauFilter" 
          (change)="reload()">
          <option value="">All Levels</option>
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
        <select 
          class="px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-2xl text-sm font-bold transition-all"
          [(ngModel)]="perPage" 
          (change)="reload()">
          <option [ngValue]="10">10 per page</option>
          <option [ngValue]="15">15 per page</option>
          <option [ngValue]="25">25 per page</option>
        </select>
      </div>
    </div>

    <!-- Classes Grid/List -->
    <div class="bg-white rounded-3xl shadow-sm border-4 border-purple-100 overflow-hidden">
      
      <!-- Table Header -->
      <div class="bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-4 border-b-4 border-purple-200">
        <div class="grid grid-cols-12 gap-4 text-sm font-black text-purple-900 uppercase tracking-wide">
          <div class="col-span-2">Class Name</div>
          <div class="col-span-2">Level</div>
          <div class="col-span-1">Capacity</div>
          <div class="col-span-2">Students</div>
          <div class="col-span-1">Teachers</div>
          <div class="col-span-2">Occupancy</div>
          <div class="col-span-1">Status</div>
          <div class="col-span-1">Actions</div>
        </div>
      </div>

      <!-- Table Body -->
      <div class="divide-y divide-gray-100">
        <div *ngFor="let c of items(); let i = index" 
             class="px-6 py-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all group">
          <div class="grid grid-cols-12 gap-4 items-center">
            
            <!-- Class Name -->
            <div class="col-span-2">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg group-hover:scale-110 transition-transform">
                  {{ c.niveau }}
                </div>
                <div>
                  <p class="font-black text-gray-800 group-hover:text-purple-600 transition-colors">{{ c.nom }}</p>
                  <p class="text-xs text-gray-500">Class {{ c.id }}</p>
                </div>
              </div>
            </div>

            <!-- Level -->
            <div class="col-span-2">
              <span class="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-bold border-2 border-purple-200">
                {{ getNiveauLabel(c.niveau) }}
              </span>
            </div>

            <!-- Capacity -->
            <div class="col-span-1">
              <p class="text-2xl font-black text-gray-800">{{ c.capacite_max }}</p>
            </div>

            <!-- Students -->
            <div class="col-span-2">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                <span class="text-lg font-black text-gray-800">{{ c.nombre_enfants }}</span>
                <span class="text-sm text-gray-500 font-medium">/{{ c.capacite_max }}</span>
              </div>
            </div>

            <!-- Teachers -->
            <div class="col-span-1">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <span class="text-lg font-black text-gray-800">{{ c.nombre_educateurs || 0 }}</span>
              </div>
            </div>

            <!-- Occupancy -->
            <div class="col-span-2">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-gray-600">{{ c.taux_occupation }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    class="h-3 rounded-full transition-all duration-500 shadow-md"
                    [class]="getTauxOccupationClass(c.taux_occupation)"
                    [style.width.%]="c.taux_occupation">
                  </div>
                </div>
              </div>
            </div>

            <!-- Status -->
            <div class="col-span-1">
              <span 
                class="px-3 py-1 text-xs font-bold rounded-full border-2 whitespace-nowrap inline-block"
                [class]="getStatutClass(c)">
                {{ getStatutLabel(c) }}
              </span>
            </div>

            <!-- Actions -->
            <div class="col-span-1">
              <div class="flex items-center gap-2">
                <button 
                  class="p-2 hover:bg-blue-100 rounded-xl transition-colors group/btn"
                  (click)="view(c.id)"
                  title="View">
                  <svg class="w-5 h-5 text-blue-600 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
                
                <button 
                  class="p-2 hover:bg-green-100 rounded-xl transition-colors group/btn"
                  (click)="edit(c.id)"
                  title="Edit">
                  <svg class="w-5 h-5 text-green-600 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                
                <button 
                  class="p-2 hover:bg-red-100 rounded-xl transition-colors group/btn"
                  (click)="remove(c.id, c.nom, c.nombre_enfants)"
                  title="Delete">
                  <svg class="w-5 h-5 text-red-600 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="items().length === 0" class="text-center py-16">
        <div class="text-8xl mb-4">📚</div>
        <p class="text-xl font-black text-gray-800 mb-2">No Classes Found</p>
        <p class="text-gray-600">Try adjusting your filters or create a new class</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="bg-white rounded-3xl p-6 shadow-sm border-4 border-purple-100">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-sm font-bold text-gray-700">
          Showing <span class="text-purple-600">{{ items().length }}</span> class(es)
        </div>
        <div class="flex items-center gap-3">
          <button 
            class="px-5 py-2.5 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2 text-sm"
            [disabled]="page()<=1" 
            (click)="prev()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
            </svg>
            Previous
          </button>
          
          <div class="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-black shadow-md">
            Page {{ page() }}
          </div>
          
          <button 
            class="px-5 py-2.5 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2 text-sm"
            [disabled]="items().length < perPage" 
            (click)="next()">
            Next
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
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