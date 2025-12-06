// src/app/pages/parent/emploi/parent-emploi.component.ts
import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EmploiService, EmploiSlot } from '../../../services/emploi.service';
import { ParentPresencesApiService, EnfantWithStats } from '../../../services/presences-parent.service';

interface GroupedSlots {
  [jourSemaine: number]: EmploiSlot[];
}

interface EmploiData {
  enfantId: number;
  enfantNom: string;
  classeId: number;
  classeNom: string;
  slots: EmploiSlot[];
  weekStart: string;
}

@Component({
  selector: 'app-parent-emploi',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 lg:p-8">
      <div class="max-w-7xl mx-auto space-y-8">
        
        <!-- Header -->
        <div class="bg-white rounded-3xl shadow-xl p-6 lg:p-8 border-2 border-purple-100">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 class="text-3xl lg:text-4xl font-black text-gray-900 mb-2">
                📅 Emploi du temps
              </h1>
              <p class="text-gray-600 text-lg">
                Consultez l'emploi du temps de vos enfants
              </p>
            </div>
            <button 
              (click)="router.navigate(['/parent'])"
              class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Retour
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading()" class="bg-white rounded-3xl shadow-xl p-12">
          <div class="text-center">
            <div class="relative w-24 h-24 mx-auto mb-6">
              <div class="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
              <div class="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p class="text-gray-600 font-medium text-lg">Chargement des données...</p>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error()" class="bg-white rounded-3xl shadow-xl p-8 border-2 border-red-200">
          <div class="flex items-start gap-6">
            <div class="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-2xl font-bold text-red-900 mb-2">Erreur de chargement</h3>
              <p class="text-red-700 mb-4">{{ error() }}</p>
              <button 
                (click)="loadData()"
                class="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105">
                🔄 Réessayer
              </button>
            </div>
          </div>
        </div>

        <!-- Enfants Selection -->
        <div *ngIf="!loading() && !error()" class="bg-white rounded-3xl shadow-xl p-6 lg:p-8 border-2 border-purple-100">
          <h2 class="text-2xl font-black text-gray-900 mb-6">Sélectionnez un enfant</h2>
          
          <!-- Empty State -->
          <div *ngIf="enfants().length === 0" class="text-center py-12 bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl border-2 border-dashed border-gray-300">
            <div class="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg class="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Aucun enfant trouvé</h3>
            <p class="text-gray-600">Aucun enfant n'est associé à votre compte.</p>
          </div>

          <!-- Enfants Grid -->
          <div *ngIf="enfants().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button 
              *ngFor="let enfant of enfants()"
              (click)="selectEnfant(enfant)"
              [class.ring-4]="selectedEnfant()?.id === enfant.id"
              [class.ring-purple-400]="selectedEnfant()?.id === enfant.id"
              class="group relative bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-purple-100 text-left">
              
              <div class="flex items-start gap-4">
                <!-- Avatar -->
                <div [class]="getAvatarClass(enfant.sexe)" 
                     class="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <span class="text-2xl font-black text-white">
                    {{ getInitials(enfant.nom_complet) }}
                  </span>
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-xl font-black text-gray-900 mb-2 group-hover:text-purple-600 transition-colors truncate">
                    {{ enfant.nom_complet }}
                  </h3>
                  <div class="space-y-2">
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <span class="font-medium">{{ enfant.age }} ans</span>
                    </div>
                    <div *ngIf="enfant.classe" class="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-xs font-bold shadow-md">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                      </svg>
                      {{ enfant.classe.nom }}
                    </div>
                  </div>
                </div>

                <!-- Selected Indicator -->
                <div *ngIf="selectedEnfant()?.id === enfant.id" 
                     class="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Week Navigation -->
        <div *ngIf="selectedEnfant() && !loading() && !error()" 
             class="bg-white rounded-3xl shadow-xl p-6 border-2 border-purple-100">
          <div class="flex items-center justify-between gap-4 flex-wrap">
            <button 
              (click)="previousWeek()"
              class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Semaine précédente
            </button>

            <div class="text-center">
              <div class="text-sm font-bold text-purple-600 mb-1">SEMAINE DU</div>
              <div class="text-2xl font-black text-gray-900">{{ formatWeekRange() }}</div>
            </div>

            <button 
              (click)="nextWeek()"
              class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2">
              Semaine suivante
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Emploi Loading -->
        <div *ngIf="emploiLoading()" class="bg-white rounded-3xl shadow-xl p-12">
          <div class="text-center">
            <div class="relative w-20 h-20 mx-auto mb-4">
              <div class="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div class="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p class="text-gray-600 font-medium">Chargement de l'emploi du temps...</p>
          </div>
        </div>

        <!-- Emploi Display -->
        <div *ngIf="selectedEnfant() && !loading() && !error() && !emploiLoading() && currentEmploi()" 
             class="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-purple-100">
          
          <!-- Header -->
          <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
            <div class="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 class="text-2xl font-black mb-1">
                  📚 {{ currentEmploi()!.enfantNom }}
                </h2>
                <p class="text-purple-100 font-medium">
                  Classe: {{ currentEmploi()!.classeNom }}
                </p>
              </div>
              <button 
                (click)="printEmploi()"
                class="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2 border border-white/30">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                </svg>
                Imprimer
              </button>
            </div>
          </div>

          <!-- Empty Emploi -->
          <div *ngIf="currentEmploi()!.slots.length === 0" 
               class="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50">
            <div class="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg class="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Aucun cours programmé</h3>
            <p class="text-gray-600 text-lg">Il n'y a pas de cours pour cette semaine.</p>
          </div>

          <!-- Emploi Grid -->
          <div *ngIf="currentEmploi()!.slots.length > 0" class="p-6">
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div *ngFor="let jour of jours" class="space-y-3">
                <!-- Day Header -->
                <div class="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 text-center shadow-lg">
                  <h3 class="text-xl font-black text-white">{{ jour.nom }}</h3>
                </div>

                <!-- Slots for this day -->
                <div class="space-y-3">
                  <div *ngFor="let slot of getSlotsByJour(jour.value)" 
                       class="group relative bg-gradient-to-br from-white to-blue-50 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-blue-100 hover:border-blue-300">
                    
                    <!-- Time Badge -->
                    <div class="flex items-center gap-2 mb-3">
                      <div class="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-xs font-bold shadow-md">
                        {{ slot.debut.substring(0, 5) }} - {{ slot.fin.substring(0, 5) }}
                      </div>
                    </div>

                    <!-- Matiere -->
                    <div class="flex items-center gap-3 mb-3">
                      <div *ngIf="slot.matiere_photo" 
                           class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
                        <img [src]="slot.matiere_photo" 
                             [alt]="slot.matiere_nom"
                             class="w-full h-full object-cover">
                      </div>
                      <div *ngIf="!slot.matiere_photo" 
                           class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                        </svg>
                      </div>
                      <h4 class="font-black text-gray-900 text-lg">{{ slot.matiere_nom }}</h4>
                    </div>

                    <!-- Teacher -->
                    <div class="flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <svg class="w-4 h-4 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      <span class="font-bold">{{ slot.educateur_nom }}</span>
                    </div>

                    <!-- Salle -->
                    <div *ngIf="slot.salle_nom" class="flex items-center gap-2 text-sm text-gray-700">
                      <svg class="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      </svg>
                      <span class="font-bold">{{ slot.salle_nom }}</span>
                    </div>
                  </div>

                  <!-- Empty Day -->
                  <div *ngIf="getSlotsByJour(jour.value).length === 0" 
                       class="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center">
                    <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                    </svg>
                    <p class="text-sm text-gray-500 font-medium">Pas de cours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .group {
      animation: fadeIn 0.5s ease-out;
    }

    @media print {
      button {
        display: none !important;
      }
    }
  `]
})
export class ParentEmploiComponent implements OnInit {
  private http = inject(HttpClient);
  private emploiService = inject(EmploiService);
  private parentService = inject(ParentPresencesApiService);
  router = inject(Router);

  enfants = signal<EnfantWithStats[]>([]);
  selectedEnfant = signal<EnfantWithStats | null>(null);
  currentEmploi = signal<EmploiData | null>(null);
  currentWeekStart = signal<Date>(this.getMonday(new Date()));
  
  loading = signal(false);
  emploiLoading = signal(false);
  error = signal<string | null>(null);

  jours = [
    { nom: 'Lundi', value: 1 },
    { nom: 'Mardi', value: 2 },
    { nom: 'Mercredi', value: 3 },
    { nom: 'Jeudi', value: 4 },
    { nom: 'Vendredi', value: 5 }
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);

    this.parentService.getEnfants().subscribe({
      next: (response) => {
        if (response.success) {
          this.enfants.set(response.data);
          
          // Auto-select first enfant if only one
          if (response.data.length === 1) {
            this.selectEnfant(response.data[0]);
          }
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des données');
        this.loading.set(false);
        console.error('Error loading enfants:', err);
      }
    });
  }

  selectEnfant(enfant: EnfantWithStats) {
    this.selectedEnfant.set(enfant);
    if (enfant.classe?.id) {
      this.loadEmploi(enfant.classe.id, enfant);
    } else {
      this.error.set('Cet enfant n\'a pas de classe assignée');
    }
  }

  loadEmploi(classeId: number, enfant: EnfantWithStats) {
    this.emploiLoading.set(true);
    
    const weekStart = this.formatDate(this.currentWeekStart());
    
    this.emploiService.getEmploiByClasse(classeId, weekStart).subscribe({
      next: (response) => {
        if (response.success) {
          this.currentEmploi.set({
            enfantId: enfant.id,
            enfantNom: enfant.nom_complet,
            classeId: classeId,
            classeNom: enfant.classe?.nom || 'Classe inconnue',
            slots: response.data,
            weekStart: weekStart
          });
        }
        this.emploiLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement de l\'emploi du temps');
        this.emploiLoading.set(false);
        console.error('Error loading emploi:', err);
      }
    });
  }

  getSlotsByJour(jour: number): EmploiSlot[] {
    if (!this.currentEmploi()) return [];
    
    return this.currentEmploi()!.slots
      .filter(slot => slot.jour_semaine === jour)
      .sort((a, b) => a.debut.localeCompare(b.debut));
  }

  previousWeek() {
    const current = this.currentWeekStart();
    const previous = new Date(current);
    previous.setDate(previous.getDate() - 7);
    this.currentWeekStart.set(previous);
    
    const enfant = this.selectedEnfant();
    if (enfant?.classe?.id) {
      this.loadEmploi(enfant.classe.id, enfant);
    }
  }

  nextWeek() {
    const current = this.currentWeekStart();
    const next = new Date(current);
    next.setDate(next.getDate() + 7);
    this.currentWeekStart.set(next);
    
    const enfant = this.selectedEnfant();
    if (enfant?.classe?.id) {
      this.loadEmploi(enfant.classe.id, enfant);
    }
  }

  formatWeekRange(): string {
    const start = this.currentWeekStart();
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return `${start.toLocaleDateString('fr-FR', options)} - ${end.toLocaleDateString('fr-FR', options)}`;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
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

  printEmploi() {
    window.print();
  }
}