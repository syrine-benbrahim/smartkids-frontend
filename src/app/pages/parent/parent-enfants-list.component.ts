// src/app/pages/parent/parent-enfants-list.component.ts - VERSION MISE À JOUR
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  ParentPresencesApiService, 
  EnfantWithStats 
} from '../../services/presences-parent.service';

@Component({
  selector: 'app-parent-enfants-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Mes Enfants</h1>
          <p class="text-gray-600 mt-1">Consultez les fiches complètes de vos enfants</p>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-4"></div>
          <p class="text-gray-600">Chargement...</p>
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
              (click)="loadEnfants()"
              class="mt-3 px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition">
              Réessayer
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && !error() && enfants().length === 0" class="text-center py-12">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Aucun enfant</h3>
        <p class="text-gray-600">Aucun enfant enregistré pour le moment.</p>
      </div>

      <!-- Enfants Cards -->
      <div *ngIf="!loading() && !error() && enfants().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          *ngFor="let enfant of enfants()" 
          (click)="viewFiche(enfant.id)"
          class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
          
          <!-- Avatar & Basic Info -->
          <div class="flex items-start gap-4 mb-4">
            <div [class]="getAvatarClass(enfant.sexe)" class="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <span class="text-2xl font-bold text-white">{{ getInitials(enfant.nom_complet) }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-xl font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors">{{ enfant.nom_complet }}</h3>
              <p class="text-sm text-gray-600">
                <span *ngIf="enfant.age">{{ enfant.age }} ans</span>
                <span *ngIf="enfant.age && enfant.sexe"> • </span>
                <span *ngIf="enfant.sexe">{{ enfant.sexe === 'M' || enfant.sexe === 'garçon' ? 'Garçon' : 'Fille' }}</span>
              </p>
            </div>
          </div>

          <!-- Classe -->
          <div *ngIf="enfant.classe" class="mb-4">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
              <span class="text-sm font-semibold">{{ enfant.classe.nom }} - {{ enfant.classe.niveau }}</span>
            </div>
          </div>

          <!-- Statistics -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Taux de présence</span>
              <span class="text-lg font-bold" [class]="getTauxClass(enfant.statistiques_presence.taux_presence)">
                {{ enfant.statistiques_presence.taux_presence }}%
              </span>
            </div>
            
            <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-500"
                [class]="getProgressClass(enfant.statistiques_presence.taux_presence)"
                [style.width.%]="enfant.statistiques_presence.taux_presence">
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2 pt-2">
              <div class="text-center">
                <p class="text-xs text-gray-600">Total</p>
                <p class="text-lg font-bold text-gray-900">{{ enfant.statistiques_presence.total_jours }}</p>
              </div>
              <div class="text-center">
                <p class="text-xs text-gray-600">Présent</p>
                <p class="text-lg font-bold text-green-600">{{ enfant.statistiques_presence.jours_presents }}</p>
              </div>
              <div class="text-center">
                <p class="text-xs text-gray-600">Absent</p>
                <p class="text-lg font-bold text-red-600">{{ enfant.statistiques_presence.jours_absents }}</p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="grid grid-cols-2 gap-3 mt-4">
            <button 
              (click)="viewFiche(enfant.id); $event.stopPropagation()"
              class="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Voir Fiche
            </button>
            
            <button 
              (click)="viewPresences(enfant.id); $event.stopPropagation()"
              class="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              Présences
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ParentEnfantsListComponent implements OnInit {
  private apiService = inject(ParentPresencesApiService);
  private router = inject(Router);

  enfants = signal<EnfantWithStats[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadEnfants();
  }

  loadEnfants() {
    this.loading.set(true);
    this.error.set(null);

    this.apiService.getEnfants().subscribe({
      next: (response) => {
        if (response.success) {
          this.enfants.set(response.data);
        }
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Erreur lors du chargement des enfants');
        this.loading.set(false);
        console.error('Error loading enfants:', err);
      }
    });
  }

  viewFiche(enfantId: number) {
    this.router.navigate(['/parent/enfants', enfantId]);
  }

  viewPresences(enfantId: number) {
    this.router.navigate(['/parent/enfants', enfantId, 'presences']);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getAvatarClass(sexe: string): string {
    if (sexe === 'M' || sexe === 'garçon') {
      return 'bg-gradient-to-br from-blue-500 to-indigo-600';
    }
    return 'bg-gradient-to-br from-pink-500 to-purple-600';
  }

  getTauxClass(taux: number): string {
    if (taux >= 90) return 'text-green-600';
    if (taux >= 75) return 'text-blue-600';
    if (taux >= 60) return 'text-orange-600';
    return 'text-red-600';
  }

  getProgressClass(taux: number): string {
    if (taux >= 90) return 'bg-gradient-to-r from-green-500 to-emerald-600';
    if (taux >= 75) return 'bg-gradient-to-r from-blue-500 to-indigo-600';
    if (taux >= 60) return 'bg-gradient-to-r from-orange-500 to-yellow-600';
    return 'bg-gradient-to-r from-red-500 to-pink-600';
  }
}