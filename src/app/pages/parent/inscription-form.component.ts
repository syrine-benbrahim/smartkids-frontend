// src/app/pages/parent/inscription-form.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InscriptionsApiService } from '../../services/inscriptions-api.service';

@Component({
  selector: 'app-parent-inscription-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-4 sm:p-6">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="card bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-8">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-black">Nouvelle Inscription</h1>
              <p class="text-blue-100">Inscrire votre enfant dans une classe</p>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading()" class="card text-center py-12">
          <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600">Chargement des classes disponibles...</p>
        </div>

        <!-- Form -->
        <form *ngIf="!loading()" (ngSubmit)="submit()" #formRef="ngForm" class="space-y-8">
          <!-- Sélection de l'enfant -->
          <div class="card">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800">Sélection de l'enfant</h3>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-bold text-gray-700">
                Enfant à inscrire <span class="text-red-500">*</span>
              </label>
              <select 
                class="w-full px-4 py-3 rounded-2xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 bg-white font-medium"
                [(ngModel)]="form.enfant_id"
                name="enfant_id"
                required
              >
                <option value="">Sélectionner un enfant</option>
                <option *ngFor="let enfant of enfants()" [value]="enfant.id">
                  {{ enfant.prenom }} {{ enfant.nom }} ({{ enfant.age }} ans)
                </option>
              </select>
            </div>
          </div>

          <!-- Sélection de la classe -->
          <div class="card">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M7 21h2m3 0h2M7 3h2m3 0h2"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800">Choix de la classe</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                *ngFor="let classe of classes()"
                class="border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200"
                [class]="getClasseCardClass(classe)"
                (click)="selectClasse(classe)"
              >
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-bold text-lg">{{ classe.nom }}</h4>
                  <div 
                    class="w-4 h-4 rounded-full border-2"
                    [class]="form.classe_id === classe.id ? 'bg-blue-500 border-blue-500' : 'border-gray-300'"
                  ></div>
                </div>
                
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Niveau:</span>
                    <span class="font-medium">{{ classe.niveau }}</span>
                  </div>
                  
                  <div class="flex justify-between">
                    <span class="text-gray-600">Places:</span>
                    <span class="font-medium">
                      {{ classe.places_occupees }}/{{ classe.capacite_max }}
                    </span>
                  </div>
                  
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="h-2 rounded-full transition-all duration-300"
                      [class]="getProgressBarClass(classe)"
                      [style.width.%]="(classe.places_occupees / classe.capacite_max) * 100"
                    ></div>
                  </div>
                  
                  <div class="text-xs font-medium mt-2">
                    <span *ngIf="classe.places_disponibles > 0" class="text-green-600">
                      {{ classe.places_disponibles }} places disponibles
                    </span>
                    <span *ngIf="classe.places_disponibles === 0" class="text-orange-600">
                      Liste d'attente uniquement
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Informations complémentaires -->
          <div class="card">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800">Informations complémentaires</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-sm font-bold text-gray-700">
                  Année scolaire
                </label>
                <input
                  type="text"
                  class="w-full px-4 py-3 rounded-2xl border-2 border-green-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 bg-white font-medium"
                  [(ngModel)]="form.annee_scolaire"
                  name="annee_scolaire"
                  placeholder="2024-2025"
                  readonly
                />
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-bold text-gray-700">
                  Frais d'inscription (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full px-4 py-3 rounded-2xl border-2 border-green-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 bg-white font-medium"
                  [(ngModel)]="form.frais_inscription"
                  name="frais_inscription"
                  placeholder="0.00"
                />
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-bold text-gray-700">
                  Frais mensuel (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full px-4 py-3 rounded-2xl border-2 border-green-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 bg-white font-medium"
                  [(ngModel)]="form.frais_mensuel"
                  name="frais_mensuel"
                  placeholder="0.00"
                />
              </div>
            </div>

            <!-- Documents -->
            <div class="mt-6">
              <label class="block text-sm font-bold text-gray-700 mb-3">
                Documents à fournir (optionnel)
              </label>
              <div class="space-y-2">
                <div *ngFor="let doc of form.documents_fournis; let i = index" class="flex gap-2">
                  <input
                    type="text"
                    class="flex-1 px-4 py-2 rounded-xl border-2 border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-100"
                    [(ngModel)]="form.documents_fournis[i]"
                    [name]="'doc_' + i"
                    placeholder="Nom du document"
                  />
                  <button
                    type="button"
                    class="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                    (click)="removeDocument(i)"
                  >
                    ✕
                  </button>
                </div>
                <button
                  type="button"
                  class="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center gap-2"
                  (click)="addDocument()"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  Ajouter un document
                </button>
              </div>
            </div>

            <!-- Remarques -->
            <div class="mt-6">
              <label class="block text-sm font-bold text-gray-700 mb-3">
                Remarques ou demandes particulières
              </label>
              <textarea
                rows="4"
                class="w-full px-4 py-3 rounded-2xl border-2 border-green-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 bg-white font-medium resize-none"
                [(ngModel)]="form.remarques"
                name="remarques"
                placeholder="Allergies, besoins spéciaux, informations importantes..."
              ></textarea>
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="error()" class="card bg-red-50 border-2 border-red-200">
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
              <p class="text-red-700 font-medium">{{ error() }}</p>
            </div>
          </div>

          <!-- Success Message -->
          <div *ngIf="success()" class="card bg-green-50 border-2 border-green-200">
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p class="text-green-700 font-medium">{{ success() }}</p>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              class="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              [disabled]="!formRef.form.valid || submitting()"
            >
              <svg *ngIf="!submitting()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <div *ngIf="submitting()" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {{ submitting() ? 'Inscription en cours...' : 'Créer l\'inscription' }}
            </button>

            <button
              type="button"
              class="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-2xl font-bold transition-colors flex items-center justify-center gap-3"
              (click)="cancel()"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .card {
      @apply bg-white rounded-3xl shadow-lg border border-gray-200 p-6;
    }
  `]
})
export class ParentInscriptionFormComponent {
  private api = inject(InscriptionsApiService);
  private router = inject(Router);

  loading = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  classes = signal<any[]>([]);
  enfants = signal<any[]>([]);

  form = {
    enfant_id: 0,
    classe_id: 0,
    annee_scolaire: this.getCurrentSchoolYear(),
    frais_inscription: 0,
    frais_mensuel: 0,
    documents_fournis: [] as string[],
    remarques: ''
  };

  ngOnInit() {
    this.loadData();
  }

  private getCurrentSchoolYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    // Si on est entre septembre et décembre, l'année scolaire commence cette année
    // Sinon elle a commencé l'année précédente
    const startYear = now.getMonth() >= 8 ? year : year - 1;
    return `${startYear}-${startYear + 1}`;
  }

  private loadData() {
    this.api.getClassesDisponibles().subscribe({
      next: (response) => {
        const data = response.data || response;
        this.classes.set(data.classes || []);
        this.enfants.set(data.enfants || []); // Assuming the API returns enfants too
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.error.set('Erreur lors du chargement des données');
        this.loading.set(false);
      }
    });
  }

  selectClasse(classe: any) {
    this.form.classe_id = classe.id;
    this.error.set(null);
  }

  getClasseCardClass(classe: any): string {
    const baseClass = 'hover:shadow-lg transition-all duration-200';
    if (this.form.classe_id === classe.id) {
      return `${baseClass} border-blue-500 bg-blue-50`;
    }
    if (classe.places_disponibles === 0) {
      return `${baseClass} border-orange-300 bg-orange-50`;
    }
    return `${baseClass} border-gray-200 hover:border-blue-300`;
  }

  getProgressBarClass(classe: any): string {
    const ratio = classe.places_occupees / classe.capacite_max;
    if (ratio >= 1) return 'bg-red-500';
    if (ratio >= 0.8) return 'bg-orange-500';
    return 'bg-green-500';
  }

  addDocument() {
    this.form.documents_fournis.push('');
  }

  removeDocument(index: number) {
    this.form.documents_fournis.splice(index, 1);
  }

  submit() {
    this.error.set(null);
    this.success.set(null);
    this.submitting.set(true);

    // Validation
    if (!this.form.enfant_id) {
      this.error.set('Veuillez sélectionner un enfant');
      this.submitting.set(false);
      return;
    }

    if (!this.form.classe_id) {
      this.error.set('Veuillez sélectionner une classe');
      this.submitting.set(false);
      return;
    }

    // Clean documents array
    const cleanDocuments = this.form.documents_fournis.filter(doc => doc.trim() !== '');

    const inscriptionData = {
      ...this.form,
      documents_fournis: cleanDocuments
    };

    this.api.creerInscription(inscriptionData).subscribe({
      next: (response) => {
        this.success.set('Inscription créée avec succès ! Vous recevrez une notification du statut de traitement.');
        this.submitting.set(false);
        
        // Redirect after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/parent']);
        }, 3000);
      },
      error: (err) => {
        console.error('Error creating inscription:', err);
        this.error.set(err.error?.message || 'Erreur lors de la création de l\'inscription');
        this.submitting.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/parent']);
  }
}