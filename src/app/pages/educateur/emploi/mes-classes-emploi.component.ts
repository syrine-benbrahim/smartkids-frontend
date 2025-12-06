import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmploiService, EmploiSlot } from '../../../services/emploi.service';

interface ClasseEmploi {
  id: number;
  nom: string;
  niveau: string;
  capacite: number;
  effectif: number;
  totalSlots: number;
  weeklyHours: number;
  nextSlot?: EmploiSlot;
  todaySlots: EmploiSlot[];
  hasActiveSchedule: boolean;
  lastUpdate?: string;
}

@Component({
  selector: 'app-mes-classes-emploi',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4 sm:p-6">
      <div class="max-w-6xl mx-auto">
        
        <!-- Header -->
        <div class="card mb-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-7 0h2m-3 0h2M7 3h2m3 0h2m6 0v1a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                </svg>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Mes Classes</h1>
                <p class="text-gray-600">Emplois du temps de vos classes assignées</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button 
                class="btn-secondary text-sm flex items-center gap-2"
                routerLink="/educateur/emploi/jour"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                Vue Jour
              </button>
              
              <button 
                class="btn-primary text-sm flex items-center gap-2"
                routerLink="/educateur/emploi/semaine"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-8 0h10m-8 0V9a1 1 0 001 1h6a1 1 0 001-1V7m0 0v10a2 2 0 01-2 2H10a2 2 0 01-2-2V7"/>
                </svg>
                Vue Semaine
              </button>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="isLoading" class="card text-center py-12">
          <div class="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600">Chargement des classes...</p>
        </div>

        <!-- Statistiques rapides -->
        <div *ngIf="!isLoading && classes.length > 0" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="stat-card bg-teal-50 border-teal-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-7 0h2m-3 0h2M7 3h2m3 0h2m6 0v1a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                </svg>
              </div>
              <span class="text-sm font-medium text-teal-800">Mes Classes</span>
            </div>
            <div class="text-2xl font-bold text-teal-900 mb-1">{{ getTotalClasses() }}</div>
            <div class="text-xs text-teal-600">Classes assignées</div>
          </div>

          <div class="stat-card bg-blue-50 border-blue-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span class="text-sm font-medium text-blue-800">Cours Aujourd'hui</span>
            </div>
            <div class="text-2xl font-bold text-blue-900 mb-1">{{ getTodaySlots() }}</div>
            <div class="text-xs text-blue-600">Créneaux programmés</div>
          </div>

          <div class="stat-card bg-green-50 border-green-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"/>
                </svg>
              </div>
              <span class="text-sm font-medium text-green-800">Heures/Semaine</span>
            </div>
            <div class="text-2xl font-bold text-green-900 mb-1">{{ getTotalWeeklyHours() }}h</div>
            <div class="text-xs text-green-600">Charge hebdomadaire</div>
          </div>

          <div class="stat-card bg-purple-50 border-purple-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <span class="text-sm font-medium text-purple-800">Élèves Total</span>
            </div>
            <div class="text-2xl font-bold text-purple-900 mb-1">{{ getTotalStudents() }}</div>
            <div class="text-xs text-purple-600">Dans mes classes</div>
          </div>
        </div>

        <!-- Prochains cours -->
        <div *ngIf="!isLoading && getUpcomingSlots().length > 0" class="card mb-8">
          <div class="flex items-center gap-3 mb-4">
            <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h2 class="text-lg font-bold text-gray-900">Prochains cours</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              *ngFor="let slot of getUpcomingSlots().slice(0, 3)" 
              class="p-4 rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-100"
            >
              <div class="flex items-start justify-between mb-2">
                <h3 class="font-semibold text-amber-900">{{ slot.matiere_nom }}</h3>
                <span class="text-xs px-2 py-1 bg-amber-200 text-amber-800 rounded-full">
                  {{ getJourName(slot.jour_semaine) }}
                </span>
              </div>
              <div class="text-sm text-amber-800 mb-1">{{ slot.classe_nom }}</div>
              <div class="text-sm text-amber-700">{{ formatTime(slot.debut) }} - {{ formatTime(slot.fin) }}</div>
              <div class="text-xs text-amber-600 mt-2" *ngIf="slot.salle_code">
                Salle {{ slot.salle_code }}
              </div>
            </div>
          </div>
        </div>

        <!-- Liste des classes -->
        <div *ngIf="!isLoading && classes.length > 0" class="space-y-6">
          <h2 class="text-xl font-bold text-gray-900">Détail par classe</h2>
          
          <div 
            *ngFor="let classe of classes" 
            class="card hover:shadow-xl transition-all duration-200"
            [class.border-l-4]="classe.hasActiveSchedule"
            [class.border-teal-400]="classe.hasActiveSchedule"
          >
            <div class="flex items-start justify-between">
              
              <!-- Informations de la classe -->
              <div class="flex items-start gap-4 flex-1">
                <div class="w-14 h-14 rounded-xl flex items-center justify-center"
                     [ngClass]="getClasseIconBg(classe.niveau)">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-7 0h2m-3 0h2M7 3h2m3 0h2m6 0v1a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                  </svg>
                </div>
                
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-900 mb-2">{{ classe.nom }}</h3>
                  
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <!-- Infos générales -->
                    <div>
                      <h4 class="font-semibold text-gray-700 text-sm mb-2">Informations</h4>
                      <div class="space-y-1 text-sm text-gray-600">
                        <div class="flex items-center gap-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                          </svg>
                          <span>{{ classe.niveau }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                          </svg>
                          <span>{{ classe.effectif }}/{{ classe.capacite }} élèves</span>
                        </div>
                      </div>
                    </div>

                    <!-- Emploi du temps -->
                    <div>
                      <h4 class="font-semibold text-gray-700 text-sm mb-2">Emploi du temps</h4>
                      <div class="space-y-1 text-sm text-gray-600">
                        <div class="flex items-center gap-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          <span>{{ classe.totalSlots }} créneaux/semaine</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"/>
                          </svg>
                          <span>{{ classe.weeklyHours }}h/semaine</span>
                        </div>
                      </div>
                    </div>

                    <!-- Prochain cours -->
                    <div>
                      <h4 class="font-semibold text-gray-700 text-sm mb-2">Prochain cours</h4>
                      <div class="text-sm text-gray-600" *ngIf="classe.nextSlot; else noNextSlot">
                        <div class="flex items-center gap-2 mb-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          <span class="font-medium">{{ classe.nextSlot.matiere_nom }}</span>
                        </div>
                        <div class="text-xs text-gray-500">
                          {{ getJourName(classe.nextSlot.jour_semaine) }} {{ formatTime(classe.nextSlot.debut) }}
                        </div>
                      </div>
                      <ng-template #noNextSlot>
                        <div class="text-sm text-gray-400">
                          Aucun cours programmé
                        </div>
                      </ng-template>
                    </div>
                  </div>

                  <!-- Cours d'aujourd'hui -->
                  <div *ngIf="classe.todaySlots.length > 0" class="mb-4">
                    <h4 class="font-semibold text-gray-700 text-sm mb-2">Aujourd'hui ({{ classe.todaySlots.length }} cours)</h4>
                    <div class="flex flex-wrap gap-2">
                      <div 
                        *ngFor="let slot of classe.todaySlots" 
                        class="text-xs px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full flex items-center gap-1"
                      >
                        <span class="font-medium">{{ slot.matiere_nom }}</span>
                        <span class="text-blue-600">{{ formatTime(slot.debut) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Dernière mise à jour -->
                  <div *ngIf="classe.lastUpdate" class="text-xs text-gray-500 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Dernière mise à jour: {{ classe.lastUpdate | date:'dd/MM/yyyy à HH:mm' }}
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex flex-col gap-2 ml-4">
                <button 
                  class="btn-primary text-sm px-4 py-2 flex items-center gap-2"
                  [routerLink]="['/educateur/classes', classe.id, 'presences']"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Présences
                </button>

                <button 
                  class="btn-secondary text-sm px-4 py-2 flex items-center gap-2"
                  (click)="viewClassSchedule(classe)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-8 0h10m-8 0V9a1 1 0 001 1h6a1 1 0 001-1V7m0 0v10a2 2 0 01-2 2H10a2 2 0 01-2-2V7"/>
                  </svg>
                  Emploi
                </button>

                <!-- Menu d'actions -->
                <div class="relative">
                  <button 
                    class="btn-secondary p-2 w-full"
                    (click)="toggleActionMenu(classe.id)"
                  >
                    <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                    </svg>
                  </button>

                  <!-- Menu déroulant -->
                  <div 
                    *ngIf="activeActionMenu === classe.id"
                    class="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                  >
                    <button 
                      class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                      (click)="viewDetails(classe)"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                      Voir détails
                    </button>

                    <button 
                      class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                      (click)="viewGrades(classe)"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"/>
                      </svg>
                      Notes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- État vide -->
        <div *ngIf="!isLoading && classes.length === 0" class="card text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-7 0h2m-3 0h2M7 3h2m3 0h2m6 0v1a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucune classe assignée</h3>
          <p class="text-gray-600 mb-6">Vous n'avez pas encore de classes assignées dans le système.</p>
          <button class="btn-primary" routerLink="/educateur">
            Retour au tableau de bord
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
    .btn-primary {
      @apply bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50;
    }
    .btn-secondary {
      @apply bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50;
    }
  `]
})
export class MesClassesEmploiComponent implements OnInit {
  private emploiService = inject(EmploiService);

  classes: ClasseEmploi[] = [];
  activeActionMenu: number | null = null;
  isLoading = true;

  ngOnInit() {
    this.loadClasses();
    this.setupClickOutside();
  }

  loadClasses() {
    this.isLoading = true;
    
    setTimeout(() => {
      this.buildMockClasses();
      this.isLoading = false;
    }, 500);
  }

  buildMockClasses() {
    const today = new Date();
    const todayDayOfWeek = today.getDay() === 0 ? 7 : today.getDay();

    this.classes = [
      {
        id: 1,
        nom: 'Grande Section A',
        niveau: 'GS',
        capacite: 25,
        effectif: 23,
        totalSlots: 12,
        weeklyHours: 18,
        hasActiveSchedule: true,
        lastUpdate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        nextSlot: {
          id: 1, emploi_template_id: 1, jour_semaine: todayDayOfWeek <= 5 ? todayDayOfWeek + 1 : 1, 
          debut: '09:00', fin: '10:00', matiere_id: 1, educateur_id: 1, salle_id: 1, status: 'planned',
          matiere_nom: 'Mathématiques', educateur_nom: 'Moi', salle_code: 'A101',
          salle_nom: 'Salle A101', classe_niveau: 'GS', classe_nom: 'GS-A',
          created_at: '', updated_at: ''
        },
        todaySlots: todayDayOfWeek <= 5 ? [
          {
            id: 10, emploi_template_id: 1, jour_semaine: todayDayOfWeek, debut: '09:00', fin: '10:00',
            matiere_id: 1, educateur_id: 1, salle_id: 1, status: 'planned',
            matiere_nom: 'Mathématiques', educateur_nom: 'Moi', salle_code: 'A101',
            salle_nom: 'Salle A101', classe_niveau: 'GS', classe_nom: 'GS-A',
            created_at: '', updated_at: ''
          },
          {
            id: 11, emploi_template_id: 1, jour_semaine: todayDayOfWeek, debut: '14:00', fin: '15:00',
            matiere_id: 2, educateur_id: 1, salle_id: 1, status: 'planned',
            matiere_nom: 'Arts plastiques', educateur_nom: 'Moi', salle_code: 'A101',
            salle_nom: 'Salle A101', classe_niveau: 'GS', classe_nom: 'GS-A',
            created_at: '', updated_at: ''
          }
        ] : []
      },
      {
        id: 2,
        nom: 'Moyenne Section B',
        niveau: 'MS',
        capacite: 22,
        effectif: 20,
        totalSlots: 10,
        weeklyHours: 15,
        hasActiveSchedule: true,
        lastUpdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        nextSlot: {
          id: 2, emploi_template_id: 2, jour_semaine: todayDayOfWeek <= 4 ? todayDayOfWeek + 2 : 1,
          debut: '10:30', fin: '11:30', matiere_id: 2, educateur_id: 1, salle_id: 2, status: 'planned',
          matiere_nom: 'Français', educateur_nom: 'Moi', salle_code: 'B102',
          salle_nom: 'Salle B102', classe_niveau: 'MS', classe_nom: 'MS-B',
          created_at: '', updated_at: ''
        },
        todaySlots: todayDayOfWeek <= 5 && todayDayOfWeek >= 2 ? [
          {
            id: 20, emploi_template_id: 2, jour_semaine: todayDayOfWeek, debut: '10:30', fin: '11:30',
            matiere_id: 2, educateur_id: 1, salle_id: 2, status: 'planned',
            matiere_nom: 'Français', educateur_nom: 'Moi', salle_code: 'B102',
            salle_nom: 'Salle B102', classe_niveau: 'MS', classe_nom: 'MS-B',
            created_at: '', updated_at: ''
          }
        ] : []
      }
    ];
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

  viewClassSchedule(classe: ClasseEmploi) {
    console.log('Voir emploi de la classe:', classe);
  }

  viewDetails(classe: ClasseEmploi) {
    console.log('Voir détails de la classe:', classe);
    this.activeActionMenu = null;
  }

  viewGrades(classe: ClasseEmploi) {
    console.log('Voir notes de la classe:', classe);
    this.activeActionMenu = null;
  }

  getUpcomingSlots(): EmploiSlot[] {
    return this.classes
      .filter(c => c.nextSlot)
      .map(c => c.nextSlot!)
      .sort((a, b) => {
        const dayDiff = a.jour_semaine - b.jour_semaine;
        if (dayDiff !== 0) return dayDiff;
        return a.debut.localeCompare(b.debut);
      });
  }

  getTotalClasses(): number {
    return this.classes.length;
  }

  getTodaySlots(): number {
    return this.classes.reduce((total, c) => total + c.todaySlots.length, 0);
  }

  getTotalWeeklyHours(): number {
    return this.classes.reduce((total, c) => total + c.weeklyHours, 0);
  }

  getTotalStudents(): number {
    return this.classes.reduce((total, c) => total + c.effectif, 0);
  }

  getClasseIconBg(niveau: string): string {
    const colors = {
      'PS': 'bg-pink-500',
      'MS': 'bg-blue-500',
      'GS': 'bg-green-500'
    };
    return colors[niveau as keyof typeof colors] || 'bg-gray-500';
  }

  getJourName(jour: number): string {
    return this.emploiService.getJourName(jour);
  }

  formatTime(time: string): string {
    return this.emploiService.formatTime(time);
  }
}