import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PresenceService } from '../../services/presence.service';

interface Enfant {
  id: number;
  nom: string;
  prenom: string;
  nom_complet: string;
  age: number;
  statut: 'present' | 'absent';
  presence_id: number | null;
  deja_enregistre: boolean;
  updated_at: string | null;
}

interface ClasseData {
  id: number;
  nom: string;
  niveau: string;
  capacite_max: number;
}

interface Resume {
  total_enfants: number;
  presents: number;
  absents: number;
  taux_presence: number;
  peut_modifier: boolean;
}

@Component({
  selector: 'app-presence-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="min-h-screen bg-gradient-to-br from-blue-100 via-green-50 to-purple-100 p-4 sm:p-6">
  <div class="max-w-6xl mx-auto">
    <!-- Header avec informations de la classe -->
    <div class="relative mb-8">
      <div class="absolute -top-4 -left-4 w-16 h-16 bg-blue-300 rounded-full opacity-60 animate-bounce"></div>
      <div class="absolute -top-2 right-10 w-12 h-12 bg-green-300 rounded-full opacity-60 animate-bounce" style="animation-delay: 0.5s;"></div>
      
      <div class="card relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-green-500/10 to-purple-500/10"></div>
        <div class="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-black text-gray-800 tracking-tight">
                Présences - {{ classe()?.nom }}
              </h1>
              <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <p class="text-gray-600 font-medium">{{ classe()?.niveau }}</p>
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span class="text-sm text-gray-600">{{ dateLibelle() }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <!-- Sélecteur de date -->
            <div class="flex items-center gap-2">
              <label class="text-sm font-medium text-gray-700">Date:</label>
              <input
                type="date"
                [(ngModel)]="selectedDate"
                (change)="onDateChange()"
                class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <button
              class="btn-primary bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-2 rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              (click)="back()"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Retour
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Résumé statistiques -->
    <div *ngIf="resume()" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <!-- Total enfants -->
      <div class="bg-white/90 backdrop-blur rounded-xl border border-white/60 shadow-lg p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-600">Total</p>
            <p class="text-2xl font-bold text-gray-800">{{ resume()?.total_enfants }}</p>
          </div>
        </div>
      </div>

      <!-- Présents -->
      <div class="bg-white/90 backdrop-blur rounded-xl border border-white/60 shadow-lg p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-600">Présents</p>
            <p class="text-2xl font-bold text-green-600">{{ resume()?.presents }}</p>
          </div>
        </div>
      </div>

      <!-- Absents -->
      <div class="bg-white/90 backdrop-blur rounded-xl border border-white/60 shadow-lg p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-600">Absents</p>
            <p class="text-2xl font-bold text-red-600">{{ resume()?.absents }}</p>
          </div>
        </div>
      </div>

      <!-- Taux de présence -->
      <div class="bg-white/90 backdrop-blur rounded-xl border border-white/60 shadow-lg p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-600">Taux</p>
            <p class="text-2xl font-bold text-purple-600">{{ resume()?.taux_presence }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions rapides -->
    <div *ngIf="enfants().length > 0 && resume()?.peut_modifier" class="mb-6">
      <div class="bg-white/90 backdrop-blur rounded-xl border border-white/60 shadow-lg p-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 class="text-lg font-bold text-gray-800">Actions rapides</h3>
            <p class="text-sm text-gray-600">Marquer tous les enfants en une fois</p>
          </div>
          <div class="flex gap-3">
            <button
              class="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2"
              (click)="marquerTous('present')"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Tous présents
            </button>
            <button
              class="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2"
              (click)="marquerTous('absent')"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Tous absents
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Liste des enfants -->
  <div *ngIf="!loading() && !error() && enfants().length > 0" class="space-y-4">
    <div 
      *ngFor="let enfant of enfants(); trackBy: trackByEnfantId" 
      class="bg-white/90 backdrop-blur rounded-xl border border-white/60 shadow-lg hover:shadow-xl transition-all duration-200"
    >
      <div class="p-4">
        <div class="flex items-center justify-between">
          <!-- Informations enfant -->
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <span class="text-white font-bold text-sm">{{ enfant.prenom.charAt(0) }}{{ enfant.nom.charAt(0) }}</span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800">{{ enfant.nom_complet }}</h3>
              <div class="flex items-center gap-4 text-sm text-gray-600">
                <span>{{ enfant.age }} ans</span>
                <span *ngIf="enfant.updated_at" class="flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Modifié à {{ enfant.updated_at }}
                </span>
              </div>
            </div>
          </div>

          <!-- Contrôles de présence -->
          <div class="flex items-center gap-3">
            <!-- Badge statut -->
            <div class="px-3 py-1 rounded-full text-sm font-medium"
                 [class]="enfant.statut === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
              {{ enfant.statut === 'present' ? 'Présent' : 'Absent' }}
            </div>

            <!-- Boutons de contrôle -->
            <div *ngIf="resume()?.peut_modifier" class="flex rounded-lg overflow-hidden border border-gray-300">
              <button
                class="px-4 py-2 text-sm font-medium transition-all duration-200"
                [class]="enfant.statut === 'present' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-green-50'"
                (click)="togglePresence(enfant, 'present')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </button>
              <button
                class="px-4 py-2 text-sm font-medium transition-all duration-200"
                [class]="enfant.statut === 'absent' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-red-50'"
                (click)="togglePresence(enfant, 'absent')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bouton de sauvegarde -->
  <div *ngIf="hasChanges() && resume()?.peut_modifier" class="sticky bottom-4 mt-8">
    <div class="bg-white/95 backdrop-blur rounded-2xl border border-white/60 shadow-2xl p-4">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p class="font-bold text-gray-800">{{ getChangesCount() }} modification(s) en attente</p>
          <p class="text-sm text-gray-600">Cliquez sur "Enregistrer" pour valider les présences</p>
        </div>
        <div class="flex gap-3">
          <button
            class="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            (click)="resetChanges()"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Annuler
          </button>
          <button
            class="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            (click)="savePresences()"
            [disabled]="saving()"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" *ngIf="!saving()">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
            </svg>
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white" *ngIf="saving()"></div>
            {{ saving() ? 'Enregistrement...' : 'Enregistrer les présences' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- État vide -->
  <div *ngIf="!loading() && !error() && enfants().length === 0" class="text-center py-16">
    <div class="w-24 h-24 mx-auto bg-gradient-to-br from-gray-300 to-gray-400 rounded-3xl flex items-center justify-center mb-6">
      <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
      </svg>
    </div>
    <h3 class="text-xl font-bold text-gray-800 mb-2">Aucun enfant dans cette classe</h3>
    <p class="text-gray-600">Cette classe ne contient pas encore d'enfants.</p>
  </div>

  <!-- État de chargement -->
  <div *ngIf="loading()" class="flex justify-center items-center py-16">
    <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
    <span class="ml-4 text-gray-600 font-medium">Chargement des présences...</span>
  </div>

  <!-- État d'erreur -->
  <div *ngIf="error()" class="p-6 bg-red-50 border-2 border-red-200 rounded-2xl">
    <div class="flex items-center gap-3">
      <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </div>
      <div>
        <p class="text-red-700 font-bold">Erreur</p>
        <p class="text-red-600 text-sm">{{ error() }}</p>
      </div>
    </div>
  </div>

  <!-- Message de succès -->
  <div *ngIf="successMessage()" class="fixed top-4 right-4 z-50 p-4 bg-green-50 border-2 border-green-200 rounded-2xl shadow-lg">
    <div class="flex items-center gap-3">
      <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <p class="text-green-700 font-medium">{{ successMessage() }}</p>
    </div>
  </div>
</div>
  `
})
export class PresenceManagementComponent implements OnInit {
  private presenceService = inject(PresenceService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  classeId = signal<number>(0);
  classe = signal<ClasseData | null>(null);
  enfants = signal<Enfant[]>([]);
  resume = signal<Resume | null>(null);
  dateLibelle = signal<string>('');
  selectedDate = signal<string>('');

  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // États pour les modifications
  originalEnfants: Enfant[] = [];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('classeId');
    if (id) {
      this.classeId.set(+id);
      this.selectedDate.set(this.getTodayDate());
      this.loadPresences();
    }
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private loadPresences() {
    this.loading.set(true);
    this.error.set(null);

    this.presenceService.getEnfantsClasse(this.classeId(), this.selectedDate()).subscribe({
      next: (response) => {
        const data = response.data;
        this.classe.set(data.classe);
        this.enfants.set(data.enfants || []);
        this.resume.set(data.resume);
        this.dateLibelle.set(data.date_libelle);
        
        // Sauvegarder l'état original
        this.originalEnfants = JSON.parse(JSON.stringify(data.enfants || []));
        
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement présences:', err);
        this.error.set('Impossible de charger les présences');
        this.loading.set(false);
      }
    });
  }

  onDateChange() {
    this.loadPresences();
  }

  togglePresence(enfant: Enfant, newStatut: 'present' | 'absent') {
    if (!this.resume()?.peut_modifier) return;

    // Mise à jour locale
    const enfantsUpdated = this.enfants().map(e => 
      e.id === enfant.id ? { ...e, statut: newStatut } : e
    );
    this.enfants.set(enfantsUpdated);
    
    // Recalculer le résumé
    this.updateResume();
  }

  marquerTous(statut: 'present' | 'absent') {
    if (!this.resume()?.peut_modifier) return;

    const enfantsUpdated = this.enfants().map(e => ({ ...e, statut }));
    this.enfants.set(enfantsUpdated);
    this.updateResume();
  }

  private updateResume() {
    const enfants = this.enfants();
    const presents = enfants.filter(e => e.statut === 'present').length;
    const absents = enfants.length - presents;
    const tauxPresence = enfants.length > 0 ? Math.round((presents / enfants.length) * 100) : 0;

    this.resume.update(resume => resume ? {
      ...resume,
      presents,
      absents,
      taux_presence: tauxPresence
    } : null);
  }

  hasChanges(): boolean {
    const current = this.enfants();
    const original = this.originalEnfants;
    
    return current.some(enfant => {
      const originalEnfant = original.find(e => e.id === enfant.id);
      return originalEnfant && originalEnfant.statut !== enfant.statut;
    });
  }

  getChangesCount(): number {
    const current = this.enfants();
    const original = this.originalEnfants;
    
    return current.filter(enfant => {
      const originalEnfant = original.find(e => e.id === enfant.id);
      return originalEnfant && originalEnfant.statut !== enfant.statut;
    }).length;
  }

  resetChanges() {
    this.enfants.set(JSON.parse(JSON.stringify(this.originalEnfants)));
    this.updateResume();
  }

  savePresences() {
    if (!this.hasChanges()) return;

    this.saving.set(true);
    this.error.set(null);

    const presences = this.enfants().map(enfant => ({
      enfant_id: enfant.id,
      statut: enfant.statut
    }));

    const payload = {
      date_presence: this.selectedDate(),
      presences
    };

    this.presenceService.marquerPresences(this.classeId(), payload).subscribe({
      next: (response) => {
        this.saving.set(false);
        this.successMessage.set('Présences enregistrées avec succès');
        
        // Actualiser les données
        this.loadPresences();
        
        // Masquer le message de succès après 3 secondes
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        console.error('Erreur sauvegarde:', err);
        this.error.set('Erreur lors de l\'enregistrement des présences');
        this.saving.set(false);
      }
    });
  }

  trackByEnfantId(index: number, enfant: Enfant): number {
    return enfant.id;
  }

  back() {
    this.router.navigate(['/educateur/classes']);
  }
}