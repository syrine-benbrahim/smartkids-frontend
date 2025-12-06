// src/app/pages/parent/presences/parent-presences-calendrier.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  ParentPresencesApiService, 
  JourCalendrier, 
  CalendrierResponse 
} from '../../../services/presences-parent.service';

@Component({
  selector: 'app-parent-presences-calendrier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Header with back button -->
      <div class="flex items-center gap-4">
        <button 
          (click)="goBack()"
          class="p-2 hover:bg-gray-100 rounded-xl transition">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="flex-1">
          <h1 class="text-3xl font-bold text-gray-900">Calendrier des Présences</h1>
          <p *ngIf="moisLibelle()" class="text-gray-600 mt-1">{{ moisLibelle() }}</p>
        </div>
      </div>

      <!-- Month Navigation -->
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl p-6">
        <div class="flex items-center justify-between gap-4">
          <button 
            (click)="previousMonth()"
            class="p-3 hover:bg-gray-100 rounded-xl transition">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          
          <div class="flex-1 text-center">
            <input 
              type="month" 
              [(ngModel)]="currentMonth"
              (change)="loadCalendrier()"
              class="px-4 py-3 rounded-xl border border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition">
          </div>
          
          <button 
            (click)="nextMonth()"
            class="p-3 hover:bg-gray-100 rounded-xl transition">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-4"></div>
          <p class="text-gray-600">Chargement du calendrier...</p>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-red-900 mb-1">Erreur</h3>
            <p class="text-red-700">{{ error() }}</p>
            <button 
              (click)="loadCalendrier()"
              class="mt-3 px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition">
              Réessayer
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div *ngIf="!loading() && !error() && statistiques()" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-6">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-3">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ statistiques()?.total_jours_ecole || 0 }}</h3>
          <p class="text-sm text-gray-600 font-medium">Jours d'école</p>
        </div>

        <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-6">
          <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-3">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ statistiques()?.jours_presents || 0 }}</h3>
          <p class="text-sm text-gray-600 font-medium">Présent</p>
        </div>

        <div class="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-3xl p-6">
          <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-3">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ statistiques()?.jours_absents || 0 }}</h3>
          <p class="text-sm text-gray-600 font-medium">Absent</p>
        </div>

        <div class="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-3xl p-6">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-3">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ statistiques()?.taux_presence || 0 }}%</h3>
          <p class="text-sm text-gray-600 font-medium">Taux</p>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div *ngIf="!loading() && !error()" class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl overflow-hidden">
        <div class="p-6">
          <!-- Days of Week Header -->
          <div class="grid grid-cols-7 gap-2 mb-4">
            <div *ngFor="let day of ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']" 
                 class="text-center text-sm font-bold text-gray-700 py-2">
              {{ day }}
            </div>
          </div>

          <!-- Calendar Days -->
          <div class="grid grid-cols-7 gap-2">
            <div *ngFor="let jour of calendrier()" 
                 [class]="getDayClass(jour)"
                 class="aspect-square p-2 rounded-xl transition-all duration-200 cursor-pointer hover:shadow-md">
              <div class="flex flex-col items-center justify-center h-full">
                <span class="text-sm font-bold mb-1">{{ jour.jour }}</span>
                <div *ngIf="jour.a_presence" class="w-6 h-6">
                  <svg *ngIf="jour.statut === 'present'" class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <svg *ngIf="jour.statut === 'absent'" class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div *ngIf="!loading() && !error()" class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Légende</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-green-100 border-2 border-green-500 rounded-lg"></div>
            <span class="text-sm text-gray-700">Présent</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-red-100 border-2 border-red-500 rounded-lg"></div>
            <span class="text-sm text-gray-700">Absent</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-gray-100 border-2 border-gray-300 rounded-lg"></div>
            <span class="text-sm text-gray-700">Weekend</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-white border-2 border-gray-200 rounded-lg"></div>
            <span class="text-sm text-gray-700">Pas de données</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ParentPresencesCalendrierComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ParentPresencesApiService);

  enfantId = signal<number>(0);
  calendrier = signal<JourCalendrier[]>([]);
  statistiques = signal<any>(null);
  moisLibelle = signal<string>('');
  loading = signal(false);
  error = signal<string | null>(null);

  currentMonth: string;

  constructor() {
    const today = new Date();
    this.currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.enfantId.set(+params['enfantId']);
      this.loadCalendrier();
    });
  }

  loadCalendrier() {
    this.loading.set(true);
    this.error.set(null);

    this.apiService.getCalendrierEnfant(
      this.enfantId(),
      this.currentMonth
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.calendrier.set(response.data.calendrier);
          this.statistiques.set(response.data.statistiques_mois);
          this.moisLibelle.set(response.data.mois_libelle);
        }
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Erreur lors du chargement du calendrier');
        this.loading.set(false);
        console.error('Error loading calendar:', err);
      }
    });
  }

  previousMonth() {
    const [year, month] = this.currentMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    this.currentMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    this.loadCalendrier();
  }

  nextMonth() {
    const [year, month] = this.currentMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    this.currentMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    this.loadCalendrier();
  }

  goBack() {
    this.router.navigate(['/parent/enfants', this.enfantId(), 'presences']);
  }

  getDayClass(jour: JourCalendrier): string {
    const baseClass = 'border-2 ';
    
    if (jour.est_weekend) {
      return baseClass + 'bg-gray-100 border-gray-300 opacity-50';
    }
    
    if (!jour.a_presence) {
      return baseClass + 'bg-white border-gray-200 hover:border-gray-300';
    }
    
    if (jour.statut === 'present') {
      return baseClass + 'bg-green-50 border-green-500 hover:bg-green-100';
    }
    
    if (jour.statut === 'absent') {
      return baseClass + 'bg-red-50 border-red-500 hover:bg-red-100';
    }
    
    return baseClass + 'bg-white border-gray-200';
  }
}