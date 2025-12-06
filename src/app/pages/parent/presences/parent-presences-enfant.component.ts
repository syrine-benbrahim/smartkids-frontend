// src/app/pages/parent/presences/parent-presences-enfant.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ParentPresencesApiService, PresencesResponse, Presence } from '../../../services/presences-parent.service';

@Component({
  selector: 'app-parent-presences-enfant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Back Button -->
      <button (click)="goBack()" 
              class="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Retour à la liste des enfants
      </button>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <p class="text-sm text-red-700">{{ error }}</p>
      </div>

      <!-- Content -->
      <div *ngIf="!loading && !error && data">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">
                {{ data.enfant.nom_complet }}
              </h1>
              <p class="text-gray-600" *ngIf="data.enfant.classe">
                {{ data.enfant.classe.nom }} - {{ data.enfant.classe.niveau }}
              </p>
            </div>
            <button (click)="goToCalendrier()" 
                    class="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Voir le calendrier
            </button>
          </div>
        </div>

        <!-- Filtres de période -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Filtrer par période</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
              <input type="date" 
                     [(ngModel)]="dateDebut"
                     class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
              <input type="date" 
                     [(ngModel)]="dateFin"
                     class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            <div class="flex items-end">
              <button (click)="applyFilters()" 
                      class="w-full bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Appliquer
              </button>
            </div>
          </div>
          
          <!-- Boutons période rapide -->
          <div class="flex flex-wrap gap-2 mt-4">
            <button (click)="setQuickPeriod('7j')" 
                    class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
              7 derniers jours
            </button>
            <button (click)="setQuickPeriod('30j')" 
                    class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
              30 derniers jours
            </button>
            <button (click)="setQuickPeriod('mois')" 
                    class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
              Ce mois
            </button>
          </div>
        </div>

        <!-- Statistiques -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Total de jours</p>
                <p class="text-2xl font-bold text-gray-900">{{ data.statistiques.total_jours }}</p>
              </div>
              <div class="bg-blue-100 rounded-full p-3">
                <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Jours présents</p>
                <p class="text-2xl font-bold text-green-600">{{ data.statistiques.jours_presents }}</p>
              </div>
              <div class="bg-green-100 rounded-full p-3">
                <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Jours absents</p>
                <p class="text-2xl font-bold text-red-600">{{ data.statistiques.jours_absents }}</p>
              </div>
              <div class="bg-red-100 rounded-full p-3">
                <svg class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Taux de présence</p>
                <p class="text-2xl font-bold" [ngClass]="getPresenceColorClass(data.statistiques.taux_presence)">
                  {{ data.statistiques.taux_presence }}%
                </p>
              </div>
              <div class="rounded-full p-3" [ngClass]="getPresenceBgClass(data.statistiques.taux_presence)">
                <svg class="w-6 h-6" [ngClass]="getPresenceColorClass(data.statistiques.taux_presence)" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Liste des présences -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">
              Historique des présences
            </h2>
            <p class="text-sm text-gray-600 mt-1">
              Du {{ formatDate(data.periode.debut) }} au {{ formatDate(data.periode.fin) }}
            </p>
          </div>

          <!-- Liste -->
          <div *ngIf="data.presences.length > 0" class="divide-y divide-gray-200">
            <div *ngFor="let presence of data.presences" 
                 class="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{{ presence.date_libelle }}</p>
                  <p class="text-sm text-gray-500 mt-1">
                    Enregistré par {{ presence.educateur_nom }}
                  </p>
                  <p *ngIf="presence.remarque" class="text-sm text-gray-600 mt-2 italic">
                    {{ presence.remarque }}
                  </p>
                </div>
                <div class="ml-4">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        [ngClass]="presence.statut === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ presence.statut === 'present' ? '✓ Présent' : '✗ Absent' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Aucune présence -->
          <div *ngIf="data.presences.length === 0" class="px-6 py-12 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune présence</h3>
            <p class="mt-1 text-sm text-gray-500">
              Aucune présence enregistrée pour cette période.
            </p>
          </div>

          <!-- Pagination -->
          <div *ngIf="pagination && pagination.last_page > 1" 
               class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Page {{ pagination.current_page }} sur {{ pagination.last_page }}
              <span class="ml-2 text-gray-500">
                ({{ pagination.total }} résultats)
              </span>
            </div>
            <div class="flex gap-2">
              <button (click)="previousPage()" 
                      [disabled]="pagination.current_page === 1"
                      [class.opacity-50]="pagination.current_page === 1"
                      [class.cursor-not-allowed]="pagination.current_page === 1"
                      class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Précédent
              </button>
              <button (click)="nextPage()" 
                      [disabled]="pagination.current_page === pagination.last_page"
                      [class.opacity-50]="pagination.current_page === pagination.last_page"
                      [class.cursor-not-allowed]="pagination.current_page === pagination.last_page"
                      class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ParentPresencesEnfantComponent implements OnInit {
  enfantId!: number;
  data: PresencesResponse | null = null;
  pagination: any = null;
  loading = true;
  error: string | null = null;

  dateDebut: string;
  dateFin: string;
  currentPage = 1;
  perPage = 15;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private presencesService: ParentPresencesApiService
  ) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    this.dateDebut = this.formatDateForInput(thirtyDaysAgo);
    this.dateFin = this.formatDateForInput(now);
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.enfantId = +params['enfantId'];
      this.loadPresences();
    });
  }

  loadPresences(): void {
    this.loading = true;
    this.error = null;

    this.presencesService.getPresencesEnfant(
      this.enfantId,
      this.dateDebut,
      this.dateFin,
      this.perPage
    ).subscribe({
      next: (response) => {
        this.data = response.data;
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des présences:', err);
        this.error = 'Impossible de charger les présences';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadPresences();
  }

  setQuickPeriod(period: string): void {
    const now = new Date();
    this.dateFin = this.formatDateForInput(now);

    switch (period) {
      case '7j':
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        this.dateDebut = this.formatDateForInput(sevenDaysAgo);
        break;
      case '30j':
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        this.dateDebut = this.formatDateForInput(thirtyDaysAgo);
        break;
      case 'mois':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        this.dateDebut = this.formatDateForInput(startOfMonth);
        break;
    }

    this.applyFilters();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPresences();
    }
  }

  nextPage(): void {
    if (this.pagination && this.currentPage < this.pagination.last_page) {
      this.currentPage++;
      this.loadPresences();
    }
  }

  goBack(): void {
    this.router.navigate(['/parent/enfants']);
  }

  goToCalendrier(): void {
    this.router.navigate(['/parent/enfants', this.enfantId, 'presences', 'calendrier']);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getPresenceColorClass(taux: number): string {
    if (taux >= 90) return 'text-green-600';
    if (taux >= 75) return 'text-blue-600';
    if (taux >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  getPresenceBgClass(taux: number): string {
    if (taux >= 90) return 'bg-green-100';
    if (taux >= 75) return 'bg-blue-100';
    if (taux >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  }
}