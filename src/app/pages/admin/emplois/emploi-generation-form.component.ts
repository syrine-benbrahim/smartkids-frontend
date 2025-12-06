// src/app/pages/admin/emplois/emploi-generation-form.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EmploiService, GenerationRequest } from '../../../services/emploi.service';
import { ClassesApiService, ClasseListItem } from '../../../services/classes-api.service';

@Component({
  selector: 'app-emploi-generation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
      <div class="max-w-4xl mx-auto">
        
        <!-- Header -->
        <div class="card mb-8">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-8 0h10m-8 0V9a1 1 0 001 1h6a1 1 0 001-1V7m0 0v10a2 2 0 01-2 2H10a2 2 0 01-2-2V7"/>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Génération d'Emplois du Temps</h1>
              <p class="text-gray-600">Créer automatiquement les plannings scolaires</p>
            </div>
          </div>

          <!-- Mode Selection -->
          <div class="flex gap-4 mb-6">
            <button
              type="button"
              class="flex-1 p-4 rounded-xl border-2 transition-all duration-200"
              [ngClass]="generationMode === 'single' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'"
              (click)="setGenerationMode('single')"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                     [ngClass]="generationMode === 'single' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div class="text-left">
                  <div class="font-semibold">Classe Unique</div>
                  <div class="text-sm opacity-75">Générer pour une classe spécifique</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              class="flex-1 p-4 rounded-xl border-2 transition-all duration-200"
              [ngClass]="generationMode === 'batch' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300'"
              (click)="setGenerationMode('batch')"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                     [ngClass]="generationMode === 'batch' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>
                </div>
                <div class="text-left">
                  <div class="font-semibold">Génération en Lot</div>
                  <div class="text-sm opacity-75">Générer pour plusieurs classes</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Form -->
        <form [formGroup]="generationForm" (ngSubmit)="onSubmit()" class="card">
          
          <!-- Sélection des classes -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-3">
              {{ generationMode === 'single' ? 'Classe' : 'Classes à générer' }}
            </label>
            
            <div *ngIf="generationMode === 'single'" class="space-y-2">
              <select 
                formControlName="classe_id" 
                class="input-field"
                [class.border-red-300]="generationForm.get('classe_id')?.invalid && generationForm.get('classe_id')?.touched"
              >
                <option value="">Sélectionner une classe...</option>
                <option *ngFor="let classe of classes" [value]="classe.id">
                  {{ classe.nom }} ({{ getNiveauLabel(classe.niveau) }}) - {{ classe.nombre_enfants }}/{{ classe.capacite_max }} élèves
                </option>
              </select>
            </div>

            <div *ngIf="generationMode === 'batch'" class="space-y-3">
              <div class="flex items-center gap-3 mb-3">
                <button
                  type="button"
                  class="btn-secondary text-sm py-2 px-4"
                  (click)="selectAllClasses()"
                >
                  Tout sélectionner
                </button>
                <button
                  type="button"
                  class="btn-secondary text-sm py-2 px-4"
                  (click)="clearClassSelection()"
                >
                  Tout désélectionner
                </button>
                <span class="text-sm text-gray-600">
                  {{ selectedClasses.length }} classe(s) sélectionnée(s)
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                <div 
                  *ngFor="let classe of classes" 
                  class="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  [class.bg-blue-50]="selectedClasses.includes(classe.id)"
                  [class.border-blue-300]="selectedClasses.includes(classe.id)"
                  (click)="toggleClassSelection(classe.id)"
                >
                  <input 
                    type="checkbox" 
                    [checked]="selectedClasses.includes(classe.id)"
                    class="rounded text-blue-600 focus:ring-blue-500"
                    (click)="$event.stopPropagation()"
                    (change)="toggleClassSelection(classe.id)"
                  >
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-gray-900 truncate">{{ classe.nom }}</div>
                    <div class="text-sm text-gray-500">{{ getNiveauLabel(classe.niveau) }} • {{ classe.nombre_enfants }}/{{ classe.capacite_max }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Période -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Début de période
              </label>
              <input
                type="date"
                formControlName="period_start"
                class="input-field"
                [class.border-red-300]="generationForm.get('period_start')?.invalid && generationForm.get('period_start')?.touched"
              >
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Fin de période
              </label>
              <input
                type="date"
                formControlName="period_end"
                class="input-field"
                [class.border-red-300]="generationForm.get('period_end')?.invalid && generationForm.get('period_end')?.touched"
              >
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Effective à partir du
              </label>
              <input
                type="date"
                formControlName="effective_from"
                class="input-field"
                [class.border-red-300]="generationForm.get('effective_from')?.invalid && generationForm.get('effective_from')?.touched"
              >
            </div>
          </div>

          <!-- Prévisualisation des paramètres -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6" *ngIf="generationForm.valid && canSubmit()">
            <h4 class="font-semibold text-blue-800 mb-2">Résumé de la génération :</h4>
            <ul class="text-sm text-blue-700 space-y-1">
              <li *ngIf="generationMode === 'single'">
                • Classe : {{ getSelectedClassName() }}
              </li>
              <li *ngIf="generationMode === 'batch'">
                • {{ selectedClasses.length }} classe(s) sélectionnée(s)
              </li>
              <li>• Période : du {{ generationForm.get('period_start')?.value | date:'dd/MM/yyyy' }} au {{ generationForm.get('period_end')?.value | date:'dd/MM/yyyy' }}</li>
              <li>• Effective à partir du : {{ generationForm.get('effective_from')?.value | date:'dd/MM/yyyy' }}</li>
            </ul>
          </div>

          <!-- Actions -->
          <div class="flex justify-between items-center">
            <button
              type="button"
              class="btn-secondary"
              (click)="goBack()"
            >
              Annuler
            </button>

            <button
              type="submit"
              class="btn-primary flex items-center gap-2"
              [disabled]="!canSubmit() || isLoading"
            >
              <div *ngIf="isLoading" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              <svg *ngIf="!isLoading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              {{ isLoading ? 'Génération en cours...' : 'Générer les Emplois' }}
            </button>
          </div>
        </form>

        <!-- Résultats de génération -->
        <div *ngIf="generationResult" class="card mt-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Résultats de la génération</h3>
          
          <div *ngIf="generationMode === 'single' && singleResult" class="space-y-3">
            <div class="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <div class="font-semibold text-green-800">Emploi généré avec succès</div>
                <div class="text-sm text-green-600">{{ singleResult.slots?.length || 0 }} créneaux planifiés</div>
              </div>
              <button 
                class="btn-primary text-sm"
                (click)="viewTemplate(singleResult.id)"
              >
                Voir l'emploi
              </button>
            </div>
          </div>

          <div *ngIf="generationMode === 'batch' && batchResult" class="space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                *ngFor="let result of batchResult.templates" 
                class="p-4 border rounded-lg"
                [class.bg-green-50]="result.unplaced === 0"
                [class.border-green-200]="result.unplaced === 0"
                [class.bg-yellow-50]="result.unplaced > 0"
                [class.border-yellow-200]="result.unplaced > 0"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="font-semibold text-gray-800">
                    {{ getClasseNameById(result.classe_id) }}
                  </div>
                  <div class="text-xs px-2 py-1 rounded-full"
                       [class.bg-green-200]="result.unplaced === 0"
                       [class.text-green-800]="result.unplaced === 0"
                       [class.bg-yellow-200]="result.unplaced > 0"
                       [class.text-yellow-800]="result.unplaced > 0">
                    {{ result.unplaced === 0 ? 'Complet' : result.unplaced + ' non placé(s)' }}
                  </div>
                </div>
                <div class="text-sm text-gray-600 mb-3">
                  {{ result.slots }} créneaux générés
                </div>
                <button 
                  class="btn-secondary text-xs w-full"
                  (click)="viewTemplate(result.template_id)"
                >
                  Voir l'emploi
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .card {
      @apply bg-white rounded-2xl shadow-lg border border-gray-200 p-6;
    }
    .input-field {
      @apply w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors;
    }
    .btn-primary {
      @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
    }
    .btn-secondary {
      @apply bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-colors;
    }
  `]
})
export class EmploiGenerationFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private emploiService = inject(EmploiService);
  private classeService = inject(ClassesApiService);

  generationForm: FormGroup;
  generationMode: 'single' | 'batch' = 'single';
  classes: ClasseListItem[] = []; // CORRECTION: Utiliser ClasseListItem
  selectedClasses: number[] = [];
  isLoading = false;
  generationResult: any = null;
  singleResult: any = null;
  batchResult: any = null;

  constructor() {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.generationForm = this.fb.group({
      classe_id: [''],
      period_start: [nextMonth.toISOString().split('T')[0], Validators.required],
      period_end: [endOfMonth.toISOString().split('T')[0], Validators.required],
      effective_from: [nextMonth.toISOString().split('T')[0], Validators.required]
    });
  }

  ngOnInit() {
    this.loadClasses();
  }

  loadClasses() {
    // CORRECTION: Utiliser list() au lieu de getClasses()
    this.classeService.list().subscribe({
      next: (response) => {
        this.classes = response.data.data || [];
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des classes:', error);
      }
    });
  }

  setGenerationMode(mode: 'single' | 'batch') {
    this.generationMode = mode;
    this.selectedClasses = [];
    
    if (mode === 'single') {
      this.generationForm.get('classe_id')?.setValidators([Validators.required]);
    } else {
      this.generationForm.get('classe_id')?.clearValidators();
    }
    this.generationForm.get('classe_id')?.updateValueAndValidity();
  }

  toggleClassSelection(classeId: number) {
    const index = this.selectedClasses.indexOf(classeId);
    if (index > -1) {
      this.selectedClasses.splice(index, 1);
    } else {
      this.selectedClasses.push(classeId);
    }
  }

  selectAllClasses() {
    this.selectedClasses = [...this.classes.map(c => c.id)];
  }

  clearClassSelection() {
    this.selectedClasses = [];
  }

  canSubmit(): boolean {
    const formValid = this.generationForm.valid;
    const classSelection = this.generationMode === 'single' ? 
      !!this.generationForm.get('classe_id')?.value :
      this.selectedClasses.length > 0;
    
    return formValid && classSelection;
  }

onSubmit() {
  if (!this.canSubmit() || this.isLoading) return;

  this.isLoading = true;
  this.generationResult = null;
  this.singleResult = null;
  this.batchResult = null;

  const formData = this.generationForm.value;
  const request: GenerationRequest = {
    period_start: formData.period_start,
    period_end: formData.period_end,
    effective_from: formData.effective_from
  };

  if (this.generationMode === 'single') {
    request.classe_id = Number(formData.classe_id);

    this.emploiService.generateEmploi(request).subscribe({
      next: (response: any) => {
        this.singleResult = response.data;
        this.generationResult = response;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors de la génération (SINGLE):', error);
        console.error('Détails backend:', error.error);
        this.isLoading = false;
      }
    });

  } else {
    request.classe_ids = this.selectedClasses.map(id => Number(id)); // ✅ assure que ce sont des numbers

    // 👇 DEBUG : on vérifie ce qu'on envoie au backend
    console.log('Payload envoyé au backend (BATCH):', request);

    this.emploiService.generateAllEmplois(request).subscribe({
      next: (response: any) => {
        this.batchResult = response;
        this.generationResult = response;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors de la génération (BATCH):', error);
        console.error('Détails backend:', error.error); // ✅ affiche le message Laravel
        this.isLoading = false;
      }
    });
  }
}


  // CORRECTION: Méthode helper pour obtenir le label du niveau
  getNiveauLabel(niveau: number): string {
    return ClassesApiService.getNiveauLabel(niveau);
  }

  getSelectedClassName(): string {
    const classeId = this.generationForm.get('classe_id')?.value;
    if (!classeId) return '';
    
    const classe = this.classes.find(c => c.id == classeId);
    if (!classe) return '';
    
    const niveauLabel = this.getNiveauLabel(classe.niveau);
    return `${classe.nom} (${niveauLabel})`;
  }

  getClasseNameById(id: number): string {
    const classe = this.classes.find(c => c.id === id);
    if (!classe) return `Classe ${id}`;
    
    const niveauLabel = this.getNiveauLabel(classe.niveau);
    return `${classe.nom} (${niveauLabel})`;
  }

  viewTemplate(templateId: number) {
    this.router.navigate(['/admin/emplois/template', templateId]);
  }

  goBack() {
    this.router.navigate(['/admin/emplois']);
  }
}