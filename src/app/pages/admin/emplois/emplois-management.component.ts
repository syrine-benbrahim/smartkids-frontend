// emplois-management.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // ADDED: For ngModel
import { EmploiService, EmploiTemplate } from '../../../services/emploi.service'; // FIXED: Path
import { ClassesApiService, ClasseListItem } from '../../../services/classes-api.service'; // FIXED: Using correct service

interface EmploiSummary {
  classe: ClasseListItem;
  template: EmploiTemplate | null;
  hasActive: boolean;
  slotsCount: number;
  lastGenerated?: string;
}

@Component({
  selector: 'app-emplois-management',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // ADDED: FormsModule
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 p-4 sm:p-6">
      <div class="max-w-7xl mx-auto">
        
        <!-- Header -->
        <div class="card mb-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-8 0h10m-8 0V9a1 1 0 001 1h6a1 1 0 001-1V7m0 0v10a2 2 0 01-2 2H10a2 2 0 01-2-2V7"/>
                </svg>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Gestion des Emplois du Temps</h1>
                <p class="text-gray-600">Planifiez et gérez les emplois du temps des classes</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button 
                class="btn-primary flex items-center gap-2"
                routerLink="/admin/emplois/generate"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Générer des Emplois
              </button>
            </div>
          </div>
        </div>

        <!-- Statistiques rapides -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="stat-card bg-blue-50 border-blue-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-7 0h2m-3 0h2M7 3h2m3 0h2m6 0v1a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                </svg>
              </div>
              <span class="text-sm font-medium text-blue-800">Classes Total</span>
            </div>
            <div class="text-2xl font-bold text-blue-900 mb-1">{{ getTotalClasses() }}</div>
            <div class="text-xs text-blue-600">{{ getActiveClasses() }} avec emploi actif</div>
          </div>

          <div class="stat-card bg-green-50 border-green-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span class="text-sm font-medium text-green-800">Emplois Publiés</span>
            </div>
            <div class="text-2xl font-bold text-green-900 mb-1">{{ getPublishedCount() }}</div>
            <div class="text-xs text-green-600">Prêts pour utilisation</div>
          </div>

          <div class="stat-card bg-orange-50 border-orange-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </div>
              <span class="text-sm font-medium text-orange-800">Brouillons</span>
            </div>
            <div class="text-2xl font-bold text-orange-900 mb-1">{{ getDraftCount() }}</div>
            <div class="text-xs text-orange-600">En cours de modification</div>
          </div>

          <div class="stat-card bg-purple-50 border-purple-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span class="text-sm font-medium text-purple-800">Créneaux Total</span>
            </div>
            <div class="text-2xl font-bold text-purple-900 mb-1">{{ getTotalSlots() }}</div>
            <div class="text-xs text-purple-600">Cours planifiés cette semaine</div>
          </div>
        </div>

        <!-- Filtres et recherche -->
        <div class="card mb-6">
          <div class="flex flex-col lg:flex-row gap-4">
            <div class="flex-1">
              <input
                type="text"
                placeholder="Rechercher une classe..."
                class="input-field"
                [(ngModel)]="searchTerm"
                (ngModelChange)="filterClasses()"
              >
            </div>
            <div class="flex gap-3">
              <select class="input-field" [(ngModel)]="statusFilter" (ngModelChange)="filterClasses()">
                <option value="">Tous les statuts</option>
                <option value="published">Publiés</option>
                <option value="draft">Brouillons</option>
                <option value="none">Sans emploi</option>
              </select>
              <select class="input-field" [(ngModel)]="niveauFilter" (ngModelChange)="filterClasses()">
                <option value="">Tous les niveaux</option>
                <option *ngFor="let niveau of niveaux" [value]="niveau">{{ getNiveauLabel(niveau) }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Liste des emplois par classe -->
        <div class="space-y-4">
          <div 
            *ngFor="let summary of filteredSummaries; trackBy: trackByClasseId" 
            class="card hover:shadow-xl transition-all duration-200"
            [class.border-l-4]="summary.hasActive"
            [class.border-green-400]="summary.hasActive && summary.template?.status === 'published'"
            [class.border-orange-400]="summary.hasActive && summary.template?.status === 'draft'"
          >
            <div class="flex items-center justify-between">
              
              <!-- Informations de la classe -->
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center"
                     [ngClass]="getClasseIconBg(summary.classe.niveau)">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-7 0h2m-3 0h2M7 3h2m3 0h2m6 0v1a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                  </svg>
                </div>
                
                <div>
                  <h3 class="text-lg font-bold text-gray-900">{{ summary.classe.nom }}</h3>
                  <div class="flex items-center gap-4 text-sm text-gray-600">
                    <span class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 010-2h4z"/>
                      </svg>
                      {{ getNiveauLabel(summary.classe.niveau) }}
                    </span>
                    <span class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                      {{ summary.classe.nombre_enfants }}/{{ summary.classe.capacite_max }} élèves
                    </span>
                    <span *ngIf="summary.slotsCount > 0" class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {{ summary.slotsCount }} créneaux
                    </span>
                  </div>
                </div>
              </div>

              <!-- Statut et actions -->
              <div class="flex items-center gap-4">
                
                <!-- Badge de statut -->
                <div *ngIf="summary.template" class="text-center">
                  <div 
                    class="text-xs px-3 py-1.5 rounded-full font-medium mb-1"
                    [ngClass]="getStatusBadgeClass(summary.template.status)"
                  >
                    {{ getStatusLabel(summary.template.status) }}
                  </div>
                  <div class="text-xs text-gray-500">
                    v{{ summary.template.version }}
                  </div>
                </div>

                <div *ngIf="!summary.template" class="text-center">
                  <div class="text-xs px-3 py-1.5 rounded-full font-medium bg-gray-100 text-gray-600 mb-1">
                    Aucun emploi
                  </div>
                  <div class="text-xs text-gray-400">
                    Non généré
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2">
                  
                  <!-- Voir l'emploi -->
                  <button 
                    *ngIf="summary.hasActive"
                    class="btn-secondary text-sm py-2 px-4"
                    [routerLink]="['/admin/emplois/view', summary.template?.id || summary.classe.id]"
                  >
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    Voir
                  </button>

                  <!-- Générer -->
                  <button 
                    *ngIf="!summary.hasActive"
                    class="btn-primary text-sm py-2 px-4"
                    (click)="generateSingle(summary.classe.id)"
                  >
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    Générer
                  </button>

                  <!-- Publier (si brouillon) -->
                  <button 
                    *ngIf="summary.template?.status === 'draft'"
                    class="btn-success text-sm py-2 px-4"
                    (click)="publishTemplate(summary.template!)"
                    [disabled]="isPublishing"
                  >
                    <div *ngIf="isPublishing" class="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1 inline-block"></div>
                    {{ isPublishing ? 'Publication...' : 'Publier' }}
                  </button>

                  <!-- Menu d'actions -->
                  <div class="relative" *ngIf="summary.hasActive">
                    <button 
                      class="btn-secondary p-2"
                      (click)="toggleActionMenu(summary.classe.id)"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                      </svg>
                    </button>

                    <!-- Menu déroulant -->
                    <div 
                      *ngIf="activeActionMenu === summary.classe.id"
                      class="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                    >
                      <button 
                        class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                        [routerLink]="['/admin/emplois/view', summary.template?.id]"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                        Modifier
                      </button>
                      
                      <button 
                        class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                        (click)="duplicateTemplate(summary.template!)"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                        Dupliquer
                      </button>

                      <hr class="my-1">
                      
                      <button 
                        class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                        (click)="confirmDelete(summary.template!)"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Dernière mise à jour -->
            <div *ngIf="summary.lastGenerated" class="mt-3 pt-3 border-t border-gray-100">
              <div class="text-xs text-gray-500 flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Dernière mise à jour: {{ summary.lastGenerated | date:'dd/MM/yyyy à HH:mm' }}
              </div>
            </div>
          </div>
        </div>

        <!-- État vide -->
        <div *ngIf="filteredSummaries.length === 0" class="card text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucun emploi trouvé</h3>
          <p class="text-gray-600 mb-6">Aucune classe ne correspond à vos critères de recherche.</p>
          <button class="btn-primary" routerLink="/admin/emplois/generate">
            Générer des emplois du temps
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .card {
      @apply bg-white rounded-2xl shadow-lg border border-gray-200 p-6;
    }
    .stat-card {
      @apply bg-white rounded-2xl shadow-lg border p-4;
    }
    .input-field {
      @apply w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors;
    }
    .btn-primary {
      @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50;
    }
    .btn-secondary {
      @apply bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-colors;
    }
    .btn-success {
      @apply bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50;
    }
  `]
})
export class EmploisManagementComponent implements OnInit {
  private router = inject(Router);
  private emploiService = inject(EmploiService);
  private classeService = inject(ClassesApiService); // FIXED: Using correct service

  classes: ClasseListItem[] = [];
  summaries: EmploiSummary[] = [];
  filteredSummaries: EmploiSummary[] = [];
  
  searchTerm = '';
  statusFilter = '';
  niveauFilter: number | '' = ''; // FIXED: Type to match niveau
  niveaux: number[] = []; // FIXED: Array of numbers
  
  activeActionMenu: number | null = null;
  isLoading = true;
  isPublishing = false;

  ngOnInit() {
    this.loadData();
    this.setupClickOutside();
  }

  loadData() {
    this.isLoading = true;
    
    // Charger les classes avec le bon service
    this.classeService.list().subscribe({
      next: (response) => {
        this.classes = response.data.data; // FIXED: Access nested data
        this.extractNiveaux();
        this.buildSummaries();
        this.isLoading = false;
      },
      error: (error: unknown) => {
        console.error('Erreur lors du chargement des classes:', error);
        this.isLoading = false;
      }
    });
  }

  extractNiveaux() {
    this.niveaux = [...new Set(this.classes.map(c => c.niveau))].sort((a, b) => a - b);
  }

  buildSummaries() {
    this.summaries = this.classes.map(classe => {
      // Pour simplifier, on assume qu'on n'a pas encore les templates chargés
      // Dans un vrai cas, il faudrait faire un appel API pour récupérer les templates actifs
      return {
        classe,
        template: null,
        hasActive: false,
        slotsCount: 0,
        lastGenerated: undefined
      };
    });
    
    this.filteredSummaries = [...this.summaries];
  }

  filterClasses() {
    this.filteredSummaries = this.summaries.filter(summary => {
      const matchesSearch = !this.searchTerm || 
        summary.classe.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getNiveauLabel(summary.classe.niveau).toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || 
        (this.statusFilter === 'none' && !summary.hasActive) ||
        (summary.template?.status === this.statusFilter);
      
      const matchesNiveau = !this.niveauFilter || summary.classe.niveau === this.niveauFilter;
      
      return matchesSearch && matchesStatus && matchesNiveau;
    });
  }

  generateSingle(classeId: number) {
    this.router.navigate(['/admin/emplois/generate'], { 
      queryParams: { classe_id: classeId, mode: 'single' }
    });
  }

  publishTemplate(template: EmploiTemplate) {
    this.isPublishing = true;
    this.emploiService.publishTemplate(template.id).subscribe({
      next: () => {
        template.status = 'published';
        this.isPublishing = false;
      },
      error: (error: unknown) => {
        console.error('Erreur lors de la publication:', error);
        this.isPublishing = false;
      }
    });
  }

  duplicateTemplate(template: EmploiTemplate) {
    console.log('Dupliquer le template:', template);
    // Implémenter la duplication
  }

  confirmDelete(template: EmploiTemplate) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet emploi du temps ?')) {
      console.log('Supprimer le template:', template);
      // Implémenter la suppression
    }
  }

  toggleActionMenu(classeId: number) {
    this.activeActionMenu = this.activeActionMenu === classeId ? null : classeId;
  }

  setupClickOutside() {
    document.addEventListener('click', (event) => {
      if (this.activeActionMenu !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest('.relative')) {
          this.activeActionMenu = null;
        }
      }
    });
  }

  // Utilitaires
  trackByClasseId(index: number, item: EmploiSummary): number {
    return item.classe.id;
  }

  getClasseIconBg(niveau: number): string {
    const colors: Record<number, string> = {
      1: 'bg-pink-500',    // Petite Section
      2: 'bg-blue-500',    // Moyenne Section
      3: 'bg-green-500',   // Grande Section
      4: 'bg-purple-500',  // CP
      5: 'bg-indigo-500',  // CE1
      6: 'bg-yellow-500',  // CE2
      7: 'bg-red-500',     // CM1
      8: 'bg-orange-500'   // CM2
    };
    return colors[niveau] || 'bg-gray-500';
  }

  getNiveauLabel(niveau: number): string {
    return ClassesApiService.getNiveauLabel(niveau);
  }

  getStatusLabel(status: string): string {
    return this.emploiService.getStatusLabel(status);
  }

  getStatusBadgeClass(status: string): string {
    return status === 'published' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  }

  // Statistiques
  getTotalClasses(): number {
    return this.classes.length;
  }

  getActiveClasses(): number {
    return this.summaries.filter(s => s.hasActive).length;
  }

  getPublishedCount(): number {
    return this.summaries.filter(s => s.template?.status === 'published').length;
  }

  getDraftCount(): number {
    return this.summaries.filter(s => s.template?.status === 'draft').length;
  }

  getTotalSlots(): number {
    return this.summaries.reduce((total, s) => total + s.slotsCount, 0);
  }
}