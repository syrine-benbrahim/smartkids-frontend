// educateur-emploi.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmploiService, EmploiSlot } from '../../services/emploi.service';
import { AuthService } from '../../core/auth.service';

interface DaySchedule {
  jour: number;
  slots: EmploiSlot[];
  totalHours: number;
}

interface WeekSchedule {
  weekStart: string;
  weekEnd: string;
  days: DaySchedule[];
  totalWeekHours: number;
}

@Component({
  selector: 'app-educateur-emploi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 p-4 sm:p-6">
      <div class="max-w-6xl mx-auto">
        
        <!-- Header -->
        <div class="card mb-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Mon Emploi du Temps</h1>
                <p class="text-gray-600">Consultez votre planning hebdomadaire</p>
              </div>
            </div>

            <!-- Navigation semaine -->
            <div class="flex items-center gap-3">
              <button 
                class="btn-secondary p-2"
                (click)="previousWeek()"
                [disabled]="isLoading"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              
              <div class="text-center min-w-[200px]">
                <div class="font-semibold text-gray-900">{{ currentWeekLabel }}</div>
                <div class="text-sm text-gray-600">{{ getCurrentWeekRange() }}</div>
              </div>
              
              <button 
                class="btn-secondary p-2"
                (click)="nextWeek()"
                [disabled]="isLoading"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>

              <button 
                class="btn-primary text-sm"
                (click)="goToCurrentWeek()"
                [disabled]="isCurrentWeek()"
              >
                Aujourd'hui
              </button>
            </div>
          </div>
        </div>

        <!-- Vue d'ensemble de la semaine -->
        <div class="card mb-6" *ngIf="weekSchedule">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-900">Résumé de la semaine</h2>
            <div class="text-sm text-gray-600">
              Total: {{ weekSchedule.totalWeekHours }}h cette semaine
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div 
              *ngFor="let day of weekSchedule.days" 
              class="text-center p-3 rounded-lg"
              [ngClass]="getDayCardClass(day)"
            >
              <div class="font-semibold text-sm mb-2">{{ getJourName(day.jour) }}</div>
              <div class="text-2xl font-bold mb-1">{{ day.slots.length }}</div>
              <div class="text-xs opacity-75">
                {{ day.slots.length === 1 ? 'cours' : 'cours' }}
              </div>
              <div class="text-xs mt-1">{{ day.totalHours }}h</div>
            </div>
          </div>
        </div>

        <!-- Planning détaillé -->
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold text-gray-900">Planning détaillé</h2>
            
            <!-- Vue switch -->
            <div class="flex bg-gray-100 rounded-lg p-1">
              <button 
                class="px-3 py-1 text-sm font-medium rounded-md transition-colors"
                [ngClass]="viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
                (click)="viewMode = 'grid'"
              >
                Grille
              </button>
              <button 
                class="px-3 py-1 text-sm font-medium rounded-md transition-colors"
                [ngClass]="viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
                (click)="viewMode = 'list'"
              >
                Liste
              </button>
            </div>
          </div>

          <!-- Vue grille -->
          <div *ngIf="viewMode === 'grid'" class="overflow-x-auto">
            <table class="w-full min-w-[800px]">
              <thead>
                <tr class="bg-gradient-to-r from-gray-50 to-blue-50">
                  <th class="text-left py-3 px-4 font-semibold text-gray-700 min-w-[100px]">Horaires</th>
                  <th *ngFor="let day of weekSchedule?.days" class="text-center py-3 px-3 font-semibold text-gray-700 min-w-[180px]">
                    <div>{{ getJourName(day.jour) }}</div>
                    <div class="text-xs text-gray-500 font-normal mt-1">{{ day.slots.length }} cours</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let timeSlot of timeSlots; let i = index" class="border-t hover:bg-gray-50">
                  <td class="py-3 px-4 font-medium text-gray-700 bg-gray-50 border-r">
                    {{ timeSlot.time }}
                  </td>
                  <td *ngFor="let day of weekSchedule?.days" class="p-2 border-l border-gray-100">
                    <div 
                      *ngIf="getSlotForDayAndTime(day.jour, timeSlot.time); let slot"
                      class="cours-card p-3 rounded-lg border-l-4 border-green-400 bg-gradient-to-br from-green-50 to-teal-50 hover:shadow-md transition-all cursor-pointer"
                      (click)="selectSlot(slot)"
                    >
                      <div class="font-semibold text-sm text-green-800 mb-1">{{ slot.matiere_nom }}</div>
                      <div class="text-xs text-green-700 mb-1">{{ slot.classe_nom }}</div>
                      <div class="text-xs text-green-600">{{ slot.salle_code }}</div>
                      <div class="text-xs text-gray-500 mt-1">{{ formatTime(slot.debut) }} - {{ formatTime(slot.fin) }}</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Vue liste -->
          <div *ngIf="viewMode === 'list'" class="space-y-6">
            <div *ngFor="let day of weekSchedule?.days">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                     [ngClass]="getDayIconClass(day.jour)">
                  <span class="text-white text-sm font-bold">{{ getJourShort(day.jour) }}</span>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ getJourName(day.jour) }}</h3>
                  <div class="text-sm text-gray-600">{{ day.slots.length }} cours • {{ day.totalHours }}h</div>
                </div>
              </div>

              <div *ngIf="day.slots.length === 0" class="text-center py-8 text-gray-500">
                <svg class="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7"/>
                </svg>
                Aucun cours programmé
              </div>

              <div class="space-y-2">
                <div 
                  *ngFor="let slot of day.slots" 
                  class="cours-card p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
                  (click)="selectSlot(slot)"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <h4 class="font-semibold text-gray-900">{{ slot.matiere_nom }}</h4>
                        <span class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          {{ slot.classe_nom }}
                        </span>
                      </div>
                      <div class="flex items-center gap-4 text-sm text-gray-600">
                        <span class="flex items-center gap-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          {{ formatTime(slot.debut) }} - {{ formatTime(slot.fin) }}
                        </span>
                        <span class="flex items-center gap-1" *ngIf="slot.salle_code">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-7 0h2m-3 0h2M7 3h2m3 0h2m6 0v1a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                          </svg>
                          {{ slot.salle_code }}
                        </span>
                      </div>
                    </div>
                    
                    <div class="text-xs px-2 py-1 rounded-full"
                         [ngClass]="getStatusColor(slot.status)">
                      {{ getStatusLabel(slot.status) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Détails du cours sélectionné -->
        <div 
          *ngIf="selectedSlot" 
          class="card mt-6 border-l-4 border-green-400"
        >
          <div class="flex items-start justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900">Détails du cours</h3>
            <button 
              class="text-gray-400 hover:text-gray-600"
              (click)="selectedSlot = null"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 class="font-semibold text-gray-700 mb-3">Informations du cours</h4>
              <div class="space-y-2 text-sm">
                <div><span class="font-medium">Matière:</span> {{ selectedSlot.matiere_nom }}</div>
                <div><span class="font-medium">Classe:</span> {{ selectedSlot.classe_nom }}</div>
                <div><span class="font-medium">Jour:</span> {{ getJourName(selectedSlot.jour_semaine) }}</div>
                <div><span class="font-medium">Horaires:</span> {{ formatTime(selectedSlot.debut) }} - {{ formatTime(selectedSlot.fin) }}</div>
              </div>
            </div>

            <div>
              <h4 class="font-semibold text-gray-700 mb-3">Lieu</h4>
              <div class="space-y-2 text-sm">
                <div><span class="font-medium">Salle:</span> {{ selectedSlot.salle_code || 'Non assignée' }}</div>
                <div *ngIf="selectedSlot.salle_nom"><span class="font-medium">Nom:</span> {{ selectedSlot.salle_nom }}</div>
              </div>
            </div>

            <div>
              <h4 class="font-semibold text-gray-700 mb-3">Statut</h4>
              <div class="space-y-2">
                <div 
                  class="text-xs px-3 py-2 rounded-full inline-block"
                  [ngClass]="getStatusColor(selectedSlot.status)"
                >
                  {{ getStatusLabel(selectedSlot.status) }}
                </div>
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
    .btn-primary {
      @apply bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50;
    }
    .btn-secondary {
      @apply bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50;
    }
    .cours-card:hover {
      transform: translateY(-1px);
    }
  `]
})
export class EducateurEmploiComponent implements OnInit {
  private emploiService = inject(EmploiService);
  private authService = inject(AuthService);

  currentWeek = new Date();
  currentWeekLabel = 'Semaine actuelle';
  weekSchedule: WeekSchedule | null = null;
  selectedSlot: EmploiSlot | null = null;
  timeSlots: {time: string}[] = [];
  viewMode: 'grid' | 'list' = 'grid';
  isLoading = false;

  ngOnInit() {
    this.loadCurrentWeek();
  }

  loadCurrentWeek() {
    this.isLoading = true;
    const weekStart = this.getWeekStart(this.currentWeek);
    
    // Simuler le chargement des données - à remplacer par un appel API réel
    setTimeout(() => {
      this.buildWeekSchedule(weekStart);
      this.isLoading = false;
    }, 500);
  }

  buildWeekSchedule(weekStart: Date) {
    // Simulation de données - à remplacer par un appel API réel
    const mockSlots: EmploiSlot[] = [
      {
        id: 1, emploi_template_id: 1, jour_semaine: 1, debut: '09:00', fin: '10:00',
        matiere_id: 1, educateur_id: 1, salle_id: 1, status: 'planned',
        matiere_nom: 'Mathématiques', educateur_nom: 'Moi', salle_code: 'A101',
        salle_nom: 'Salle A101', classe_niveau: 'GS', classe_nom: 'GS-A',
        created_at: '', updated_at: ''
      },
      {
        id: 2, emploi_template_id: 1, jour_semaine: 1, debut: '10:30', fin: '11:30',
        matiere_id: 2, educateur_id: 1, salle_id: 2, status: 'planned',
        matiere_nom: 'Français', educateur_nom: 'Moi', salle_code: 'B102',
        salle_nom: 'Salle B102', classe_niveau: 'MS', classe_nom: 'MS-B',
        created_at: '', updated_at: ''
      }
    ];

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const days: DaySchedule[] = [1,2,3,4,5,6].map(jour => {
      const daySlots = mockSlots.filter(s => s.jour_semaine === jour);
      return {
        jour,
        slots: daySlots,
        totalHours: this.calculateDayHours(daySlots)
      };
    });

    this.weekSchedule = {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      days,
      totalWeekHours: days.reduce((total, day) => total + day.totalHours, 0)
    };

    this.buildTimeSlots();
  }

  buildTimeSlots() {
    const times = new Set<string>();
    this.weekSchedule?.days.forEach(day => {
      day.slots.forEach(slot => times.add(slot.debut));
    });

    this.timeSlots = Array.from(times).sort().map(time => ({time}));
  }

  calculateDayHours(slots: EmploiSlot[]): number {
    return slots.reduce((total, slot) => {
      const start = new Date(`2000-01-01T${slot.debut}`);
      const end = new Date(`2000-01-01T${slot.fin}`);
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);
  }

  getSlotForDayAndTime(jour: number, time: string): EmploiSlot | null {
    const day = this.weekSchedule?.days.find(d => d.jour === jour);
    return day?.slots.find(s => s.debut === time) || null;
  }

  selectSlot(slot: EmploiSlot) {
    this.selectedSlot = this.selectedSlot?.id === slot.id ? null : slot;
  }

  previousWeek() {
    this.currentWeek.setDate(this.currentWeek.getDate() - 7);
    this.updateWeekLabel();
    this.loadCurrentWeek();
  }

  nextWeek() {
    this.currentWeek.setDate(this.currentWeek.getDate() + 7);
    this.updateWeekLabel();
    this.loadCurrentWeek();
  }

  goToCurrentWeek() {
    this.currentWeek = new Date();
    this.updateWeekLabel();
    this.loadCurrentWeek();
  }

  updateWeekLabel() {
    const now = new Date();
    const weekStart = this.getWeekStart(this.currentWeek);
    const currentWeekStart = this.getWeekStart(now);
    
    if (weekStart.getTime() === currentWeekStart.getTime()) {
      this.currentWeekLabel = 'Semaine actuelle';
    } else {
      const diff = Math.round((weekStart.getTime() - currentWeekStart.getTime()) / (1000 * 60 * 60 * 24 * 7));
      if (diff === 1) {
        this.currentWeekLabel = 'Semaine prochaine';
      } else if (diff === -1) {
        this.currentWeekLabel = 'Semaine dernière';
      } else if (diff > 0) {
        this.currentWeekLabel = `Dans ${diff} semaines`;
      } else {
        this.currentWeekLabel = `Il y a ${Math.abs(diff)} semaines`;
      }
    }
  }

  isCurrentWeek(): boolean {
    const now = new Date();
    const weekStart = this.getWeekStart(this.currentWeek);
    const currentWeekStart = this.getWeekStart(now);
    return weekStart.getTime() === currentWeekStart.getTime();
  }

  getCurrentWeekRange(): string {
    const start = this.getWeekStart(this.currentWeek);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    
    return `${start.toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'})} - ${end.toLocaleDateString('fr-FR', {day: 'numeric', month: 'short', year: 'numeric'})}`;
  }

  getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi = début de semaine
    return new Date(d.setDate(diff));
  }

  getDayCardClass(day: DaySchedule): string {
    if (day.slots.length === 0) return 'bg-gray-100 text-gray-600';
    if (day.slots.length <= 2) return 'bg-green-100 text-green-800';
    if (day.slots.length <= 4) return 'bg-blue-100 text-blue-800';
    return 'bg-orange-100 text-orange-800';
  }

  getDayIconClass(jour: number): string {
    const colors = ['', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    return colors[jour] || 'bg-gray-500';
  }

  getJourName(jour: number): string {
    return this.emploiService.getJourName(jour);
  }

  getJourShort(jour: number): string {
    const shorts = ['', 'L', 'M', 'M', 'J', 'V', 'S'];
    return shorts[jour] || '';
  }

  formatTime(time: string): string {
    return this.emploiService.formatTime(time);
  }

  getStatusLabel(status: string): string {
    return this.emploiService.getStatusLabel(status);
  }

  getStatusColor(status: string): string {
    return this.emploiService.getStatusColor(status);
  }
}