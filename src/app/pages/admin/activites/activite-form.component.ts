import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivitesApiService, Activite } from '../../../services/activites-api.service';
import { EducateursApiService } from '../../../services/educateurs-api.service';

@Component({
  selector: 'app-activite-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4 sm:p-6">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="relative mb-8">
          <div class="card relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-purple-500/10"></div>
            <div class="relative flex flex-col lg:flex-row items-center justify-between gap-6">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" *ngIf="isEdit()"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" *ngIf="!isEdit()"/>
                  </svg>
                </div>
                <div>
                  <h1 class="text-3xl font-black text-gray-800 tracking-tight">
                    {{ isEdit() ? 'Modifier l\'activité' : 'Nouvelle activité' }}
                  </h1>
                  <p class="text-gray-600 font-medium">
                    {{ isEdit() ? 'Mettre à jour les informations' : 'Créer une nouvelle activité pédagogique' }}
                  </p>
                </div>
              </div>
              
              <button
                class="btn-primary bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-purple-200 hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                type="button"
                (click)="back()"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Retour
              </button>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div class="card relative overflow-hidden bg-white/95 backdrop-blur border border-white/60 shadow-2xl">
          <div class="absolute inset-0 bg-gradient-to-br from-teal-50/80 via-blue-50/80 to-purple-50/80"></div>
          <div class="relative p-8">
            
            <!-- Messages d'erreur -->
            <div *ngIf="error()" class="p-4 bg-red-50 border-2 border-red-200 rounded-2xl mb-6">
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </div>
                <div>
                  <p class="text-red-700 font-medium">{{ error() }}</p>
                  <div *ngIf="validationErrors().length > 0" class="mt-2 space-y-1">
                    <p *ngFor="let err of validationErrors()" class="text-red-600 text-sm">• {{ err }}</p>
                  </div>
                </div>
              </div>
            </div>

            <form (ngSubmit)="submit()" #formRef="ngForm" class="space-y-8">
              
              <!-- Section Informations générales -->
              <div class="space-y-6">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold text-gray-800">Informations générales</h3>
                </div>

                <!-- Nom de l'activité -->
                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <div class="w-2 h-2 bg-teal-400 rounded-full"></div>
                    Nom de l'activité <span class="text-red-500">*</span>
                  </label>
                  <input
                    class="w-full px-4 py-3 rounded-2xl border-2 border-teal-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 bg-white/90 backdrop-blur placeholder-gray-400 font-medium transition-all duration-200"
                    [(ngModel)]="form.nom"
                    name="nom"
                    required
                    maxlength="255"
                    placeholder="Ex: Atelier peinture créative"
                  />
                </div>

                <!-- Description -->
                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
                    Description
                  </label>
                  <textarea
                    class="w-full px-4 py-3 rounded-2xl border-2 border-blue-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 bg-white/90 backdrop-blur placeholder-gray-400 font-medium transition-all duration-200 resize-none"
                    [(ngModel)]="form.description"
                    name="description"
                    rows="3"
                    maxlength="1000"
                    placeholder="Description de l'activité..."
                  ></textarea>
                </div>

                <!-- Type et Statut -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <div class="w-2 h-2 bg-purple-400 rounded-full"></div>
                      Type d'activité
                    </label>
                    <select
                      class="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 bg-white/90 backdrop-blur font-medium transition-all duration-200"
                      [(ngModel)]="form.type"
                      name="type"
                    >
                      <option value="">Sélectionner un type</option>
                      <option value="musique">Musique</option>
                      <option value="peinture">Peinture</option>
                      <option value="sport">Sport</option>
                      <option value="lecture">Lecture</option>
                      <option value="sortie">Sortie</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>

                  <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <div class="w-2 h-2 bg-pink-400 rounded-full"></div>
                      Statut
                    </label>
                    <select
                      class="w-full px-4 py-3 rounded-2xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 bg-white/90 backdrop-blur font-medium transition-all duration-200"
                      [(ngModel)]="form.statut"
                      name="statut"
                    >
                      <option value="planifiee">Planifiée</option>
                      <option value="en_cours">En cours</option>
                      <option value="terminee">Terminée</option>
                      <option value="annulee">Annulée</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Section Date et horaires -->
              <div class="space-y-6">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold text-gray-800">Date et horaires</h3>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <!-- Date -->
                  <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                      Date <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      class="w-full px-4 py-3 rounded-2xl border-2 border-green-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 bg-white/90 backdrop-blur font-medium transition-all duration-200"
                      [(ngModel)]="form.date_activite"
                      name="date_activite"
                      required
                      [min]="getTodayDate()"
                    />
                  </div>

                  <!-- Heure début -->
                  <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <div class="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      Heure début <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      class="w-full px-4 py-3 rounded-2xl border-2 border-yellow-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 bg-white/90 backdrop-blur font-medium transition-all duration-200"
                      [(ngModel)]="form.heure_debut"
                      name="heure_debut"
                      required
                    />
                  </div>

                  <!-- Heure fin -->
                  <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <div class="w-2 h-2 bg-orange-400 rounded-full"></div>
                      Heure fin <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      class="w-full px-4 py-3 rounded-2xl border-2 border-orange-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 bg-white/90 backdrop-blur font-medium transition-all duration-200"
                      [(ngModel)]="form.heure_fin"
                      name="heure_fin"
                      required
                    />
                  </div>
                </div>
              </div>

              <!-- Section Détails supplémentaires -->
              <div class="space-y-6">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold text-gray-800">Détails supplémentaires</h3>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Prix -->
                  <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <div class="w-2 h-2 bg-indigo-400 rounded-full"></div>
                      Prix (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="999.99"
                      class="w-full px-4 py-3 rounded-2xl border-2 border-indigo-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 bg-white/90 backdrop-blur font-medium transition-all duration-200"
                      [(ngModel)]="form.prix"
                      name="prix"
                      placeholder="0.00"
                    />
                  </div>

                  <!-- Capacité maximum -->
                  <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <div class="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      Capacité maximum
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      class="w-full px-4 py-3 rounded-2xl border-2 border-cyan-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 bg-white/90 backdrop-blur font-medium transition-all duration-200"
                      [(ngModel)]="form.capacite_max"
                      name="capacite_max"
                      placeholder="Nombre d'enfants max"
                    />
                  </div>
                </div>

                <!-- Matériel requis -->
                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <div class="w-2 h-2 bg-red-400 rounded-full"></div>
                    Matériel requis
                  </label>
                  <textarea
                    class="w-full px-4 py-3 rounded-2xl border-2 border-red-200 focus:border-red-400 focus:ring-4 focus:ring-red-100 bg-white/90 backdrop-blur placeholder-gray-400 font-medium transition-all duration-200 resize-none"
                    [(ngModel)]="form.materiel_requis"
                    name="materiel_requis"
                    rows="2"
                    maxlength="500"
                    placeholder="Liste du matériel nécessaire..."
                  ></textarea>
                </div>

                <!-- Consignes -->
                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <div class="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    Consignes particulières
                  </label>
                  <textarea
                    class="w-full px-4 py-3 rounded-2xl border-2 border-emerald-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 bg-white/90 backdrop-blur placeholder-gray-400 font-medium transition-all duration-200 resize-none"
                    [(ngModel)]="form.consignes"
                    name="consignes"
                    rows="3"
                    maxlength="1000"
                    placeholder="Consignes de sécurité, règles particulières..."
                  ></textarea>
                </div>
              </div>

              <!-- Section Image -->
              <div class="space-y-6">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold text-gray-800">Image de l'activité</h3>
                </div>

                <!-- Image actuelle (en mode édition) -->
                <div *ngIf="isEdit() && form.current_image" class="space-y-2">
                  <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <div class="w-2 h-2 bg-pink-400 rounded-full"></div>
                    Image actuelle
                  </label>
                  <div class="relative inline-block">
                    <img 
                      [src]="getImageUrl(form.current_image)"
                      [alt]="form.nom"
                      class="w-32 h-32 object-cover rounded-2xl shadow-lg"
                    >
                    <button
                      type="button"
                      (click)="removeCurrentImage()"
                      class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <!-- Upload nouvelle image -->
                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <div class="w-2 h-2 bg-pink-400 rounded-full"></div>
                    <span *ngIf="isEdit() && form.current_image">Changer l'image</span>
                    <span *ngIf="!isEdit() || !form.current_image">Image de l'activité</span>
                  </label>
                  <div class="relative">
                    <input
                      type="file"
                      accept="image/jpg,image/jpeg,image/png,image/webp,image/avif"
                      (change)="onImageSelected($event)"
                      class="hidden"
                      #fileInput
                    >
                    <div 
                      class="w-full p-6 border-2 border-dashed border-pink-300 rounded-2xl bg-pink-50/50 hover:bg-pink-100/50 transition-colors cursor-pointer"
                      (click)="fileInput.click()"
                    >
                      <div class="text-center">
                        <svg class="w-8 h-8 text-pink-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        <p class="text-sm font-medium text-pink-700">
                          {{ selectedImageName() || 'Cliquez pour sélectionner une image' }}
                        </p>
                        <p class="text-xs text-pink-600 mt-1">
                          JPG, PNG, WebP, AVIF - Max 4MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Aperçu nouvelle image -->
                <div *ngIf="imagePreview()" class="space-y-2">
                  <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <div class="w-2 h-2 bg-pink-400 rounded-full"></div>
                    Aperçu
                  </label>
                  <div class="relative inline-block">
                    <img 
                      [src]="imagePreview()!"
                      alt="Aperçu"
                      class="w-32 h-32 object-cover rounded-2xl shadow-lg"
                    >
                    <button
                      type="button"
                      (click)="removeImagePreview()"
                      class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>

              <!-- Section Éducateurs -->
              <div class="space-y-6">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold text-gray-800">Éducateurs assignés</h3>
                </div>

                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <div class="w-2 h-2 bg-amber-400 rounded-full"></div>
                    Sélectionner les éducateurs
                  </label>
                  
                  <div *ngIf="educateurs().length === 0" class="p-4 bg-gray-50 rounded-2xl">
                    <p class="text-gray-600 text-center">Chargement des éducateurs...</p>
                  </div>

                  <div *ngIf="educateurs().length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label *ngFor="let educateur of educateurs(); trackBy: trackByEducateur" 
                           class="flex items-center gap-3 p-3 bg-white border-2 border-amber-200 rounded-xl hover:border-amber-400 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        [value]="educateur.id"
                        [checked]="isEducateurSelected(educateur.id)"
                        (change)="toggleEducateur(educateur.id, $event)"
                        class="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                      >
                      <div class="flex-1">
                        <div class="font-medium text-gray-800">{{ educateur.user?.name || educateur.name }}</div>
                        <div class="text-sm text-gray-600">{{ educateur.diplome }}</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  class="flex-1 bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-teal-200 hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  type="submit"
                  [disabled]="!isFormValid() || submitting()"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  {{ submitting() ? 'Enregistrement...' : (isEdit() ? 'Mettre à jour' : 'Créer l\'activité') }}
                </button>

                <button
                  class="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-gray-200 hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
                  type="button"
                  (click)="cancel()"
                  [disabled]="submitting()"
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
      </div>
    </div>
  `,
  styles: [`
    .card {
      @apply bg-white rounded-3xl shadow-lg border border-gray-200 p-6;
    }
  `]
})
export class ActiviteFormComponent implements OnInit {
  private api = inject(ActivitesApiService);
  private educateursApi = inject(EducateursApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Signals
  isEdit = signal(false);
  error = signal<string | null>(null);
  validationErrors = signal<string[]>([]);
  submitting = signal(false);
  educateurs = signal<any[]>([]);
  selectedImageName = signal<string | null>(null);
  imagePreview = signal<string | null>(null);

  // Form data
  form: any = {
    nom: '',
    description: '',
    type: '',
    date_activite: '',
    heure_debut: '',
    heure_fin: '',
    prix: null,
    statut: 'planifiee',
    capacite_max: null,
    materiel_requis: '',
    consignes: '',
    educateur_ids: [],
    current_image: null
  };

  private activiteId: number | null = null;
  private selectedImageFile: File | null = null;

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.activiteId = +idParam;
      this.isEdit.set(true);
      this.loadActivite();
    }
    
    this.loadEducateurs();
  }

  private loadActivite() {
    if (!this.activiteId) return;

    this.api.get(this.activiteId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const activite = response.data;
          this.form = {
            nom: activite.nom || '',
            description: activite.description || '',
            type: activite.type || '',
            date_activite: activite.date_activite ? activite.date_activite.substring(0, 10) : '',
            heure_debut: activite.heure_debut || '',
            heure_fin: activite.heure_fin || '',
            prix: activite.prix,
            statut: activite.statut || 'planifiee',
            capacite_max: activite.capacite_max,
            materiel_requis: activite.materiel_requis || '',
            consignes: activite.consignes || '',
            educateur_ids: activite.educateurs ? activite.educateurs.map((e: any) => e.id) : [],
            current_image: activite.image
          };
        } else {
          this.error.set(response.message || 'Erreur lors du chargement de l\'activité');
        }
      },
      error: (err) => {
        console.error('Erreur de chargement:', err);
        this.error.set('Erreur lors du chargement de l\'activité');
      }
    });
  }

  private loadEducateurs() {
    this.educateursApi.list({ per_page: 1000 }).subscribe({
      next: (response: any) => {
        if (response.data) {
          this.educateurs.set(response.data);
        }
      },
      error: (err: any) => {
        console.error('Erreur chargement éducateurs:', err);
      }
    });
  }

  submit() {
    this.error.set(null);
    this.validationErrors.set([]);

    console.log('=== DÉBUT SOUMISSION FORMULAIRE ===');
    console.log('Données du formulaire:', this.form);
    console.log('Image sélectionnée:', this.selectedImageFile);

    // Validation côté client
    const validationErrors: string[] = [];

    if (!this.form.nom || !this.form.nom.trim()) {
      validationErrors.push('Le nom de l\'activité est obligatoire');
    }

    if (!this.form.date_activite) {
      validationErrors.push('La date de l\'activité est obligatoire');
    }

    if (!this.form.heure_debut) {
      validationErrors.push('L\'heure de début est obligatoire');
    }

    if (!this.form.heure_fin) {
      validationErrors.push('L\'heure de fin est obligatoire');
    }

    if (this.form.heure_debut && this.form.heure_fin && this.form.heure_fin <= this.form.heure_debut) {
      validationErrors.push('L\'heure de fin doit être après l\'heure de début');
    }

    // Validation de la date (seulement pour création)
    if (!this.isEdit() && this.form.date_activite) {
      const today = new Date();
      const selectedDate = new Date(this.form.date_activite);
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        validationErrors.push('La date de l\'activité doit être aujourd\'hui ou dans le futur');
      }
    }

    if (validationErrors.length > 0) {
      this.validationErrors.set(validationErrors);
      this.error.set('Veuillez corriger les erreurs suivantes :');
      return;
    }

    this.submitting.set(true);

    // Utiliser la nouvelle API qui gère automatiquement JSON vs FormData
    const request = this.isEdit() && this.activiteId 
      ? this.api.update(this.activiteId, this.form, this.selectedImageFile || undefined)
      : this.api.create(this.form, this.selectedImageFile || undefined);

    request.subscribe({
      next: (response) => {
        console.log('=== RÉPONSE SERVEUR ===');
        console.log('Succès:', response);
        
        if (response.success) {
          this.router.navigate(['/admin/activites']);
        } else {
          this.error.set(response.message || 'Erreur lors de l\'enregistrement');
        }
        this.submitting.set(false);
      },
      error: (err) => {
        console.error('=== ERREUR SERVEUR ===');
        console.error('Erreur complète:', err);
        
        this.submitting.set(false);
        
        if (err.status === 422 && err.error?.errors) {
          // Erreurs de validation Laravel
          const errors: string[] = [];
          Object.entries(err.error.errors).forEach(([field, fieldErrors]: [string, any]) => {
            if (Array.isArray(fieldErrors)) {
              errors.push(...fieldErrors);
            } else {
              errors.push(fieldErrors.toString());
            }
          });
          this.validationErrors.set(errors);
          this.error.set(err.error.message || 'Erreurs de validation détectées');
        } else if (err.error?.message) {
          this.error.set(err.error.message);
        } else {
          this.error.set(`Erreur ${err.status}: ${err.statusText || 'Erreur de communication avec le serveur'}`);
        }
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/activites']);
  }

  back() {
    this.router.navigate(['/admin/activites']);
  }

  // Gestion des images
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validation du fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      this.error.set('Format d\'image non supporté. Utilisez JPG, PNG, WebP ou AVIF.');
      return;
    }

    if (file.size > 4 * 1024 * 1024) { // 4MB
      this.error.set('L\'image ne doit pas dépasser 4MB.');
      return;
    }

    this.selectedImageFile = file;
    this.selectedImageName.set(file.name);

    // Créer aperçu
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    this.error.set(null);
  }

  removeImagePreview() {
    this.selectedImageFile = null;
    this.selectedImageName.set(null);
    this.imagePreview.set(null);
  }

  removeCurrentImage() {
    this.form.current_image = null;
  }

  getImageUrl(imagePath: string): string {
    return `http://localhost:8000/storage/${imagePath}`;
  }

  // Gestion des éducateurs
  trackByEducateur(index: number, educateur: any): number {
    return educateur.id;
  }

  isEducateurSelected(id: number): boolean {
    return this.form.educateur_ids.includes(id);
  }

  toggleEducateur(id: number, event: any) {
    if (event.target.checked) {
      if (!this.form.educateur_ids.includes(id)) {
        this.form.educateur_ids.push(id);
      }
    } else {
      this.form.educateur_ids = this.form.educateur_ids.filter((eid: number) => eid !== id);
    }
  }

  // Utilitaires
  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  isFormValid(): boolean {
    return !!(
      this.form.nom && 
      this.form.nom.trim() && 
      this.form.date_activite &&
      this.form.heure_debut &&
      this.form.heure_fin &&
      this.form.heure_fin > this.form.heure_debut
    );
  }
}