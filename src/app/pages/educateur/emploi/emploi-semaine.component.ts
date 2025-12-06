// emploi-semaine.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmploiService, EmploiSlot } from '../../../services/emploi.service';

interface WeekSchedule {
  weekStart: string;
  weekEnd: string;
  days: DaySchedule[];
  totalWeekHours: number;
  totalSlots: number;
}

interface DaySchedule {
  jour: number;
  date: string;
  slots: EmploiSlot[];
  totalHours: number;
  isToday: boolean;
}

interface TimeSlot {
  time: string;
  slots: { [jour: number]: EmploiSlot | null };
}

@Component({
  selector: 'app-emploi-semaine',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
      <div class="max-w-7xl mx-auto">
        
        <!-- Header -->
        <div class="card mb-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-8 0h10m-8 0V9a1 1 0 001 1h6a1 1 0 001-1V7m0 0v10a2 2 0 01-2 2H10a2 2 0 01-2-2V7"/>
                </svg>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Emploi de la Semaine</h1>
                <p class="text-gray-600">Vue d'ensemble hebdomadaire</p>
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
                Cette semaine
              </button>
            </div>
          </div>
        </div>

        <!-- Résumé de la semaine -->
        <div class="card mb-6" *ngIf="weekSchedule">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-900">Résumé hebdomadaire</h2>
            <div class="flex items-center gap-4 text-sm text-gray-600">
              <span>{{ weekSchedule.totalSlots }} cours total</span>
              <span>•</span>
              <span>{{ weekSchedule.totalWeekHours }}h cette semaine</span>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div 
              *ngFor="let day of weekSchedule.days" 
              class="text-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-md"
              [ngClass]="getDayCardClass(day)"
              (click)="selectDay(day)"
            >
              <div class="font-semibold text-sm mb-2">{{ getJourName(day.jour) }}</div>
              <div class="text-xs text-gray-500 mb-2">{{ day.date | date:'dd/MM' }}</div>
              <div class="text-2xl font-bold mb-1" [ngClass]="getDayTextClass(day)">{{ day.slots.length }}</div>
              <div class="text-xs mb-1" [ngClass]="getDayTextClass(day)">
                {{ day.slots.length === 0 ? 'Libre' : day.slots.length === 1 ? 'cours' : 'cours' }}
              </div>
              <div class="text-xs" [ngClass]="getDayTextClass(day)">{{ day.totalHours }}h</div>
              
              <!-- Indicateur aujourd'hui -->
              <div *ngIf="day.isToday" class="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>

        <!-- Vue switch -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-bold text-gray-900">Planning détaillé</h2>
          
          <div class="flex bg-gray-100 rounded-lg p-1">
            <button 
              class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
              [ngClass]="viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
              (click)="viewMode = 'grid'"
            >
              <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
              Grille
            </button>
            <button 
              class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
              [ngClass]="viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
              (click)="viewMode = 'list'"
            >
              <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
              </svg>
              Liste
            </button>
          </div>
        </div>

        <!-- Vue grille -->
        <div *ngIf="viewMode === 'grid'" class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[800px]">
              <thead>
                <tr class="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <th class="text-left py-4 px-4 font-semibold text-gray-700 min-w-[100px]">Horaires</th>
                  <th *ngFor="let day of weekSchedule?.days" class="text-center py-4 px-3 font-semibold text-gray-700 min-w-[160px]">
                    <div class="flex flex-col items-center">
                      <span class="text-base">{{ getJourName(day.jour) }}</span>
                      <span class="text-xs text-gray-500 mt-1">{{ day.date | date:'dd/MM' }}</span>
                      <span class="text-xs text-blue-600 font-medium">{{ day.slots.length }} cours</span>
                      <div *ngIf="day.isToday" class="w-2 h-1 bg-blue-500 rounded-full mt-1"></div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  *ngFor="let timeSlot of timeSlots; let i = index" 
                  class="border-t hover:bg-gray-50 transition-colors"
                  [class.bg-blue-25]="i % 2 === 1"
                >
                  <td class="py-4 px-4 font-medium text-gray-700 bg-gray-50 border-r">
                    {{ timeSlot.time }}
                  </td>
                  
                  <td *ngFor="let day of weekSchedule?.days" class="p-2 border-l border-gray-100">
                    <div 
                      *ngIf="timeSlot.slots[day.jour]; let slot" 
                      class="cours-slot p-3 rounded-lg border-l-4 min-h-[80px] flex flex-col justify-between transition-all duration-200 hover:shadow-md cursor-pointer"
                      [ngClass]="getSlotClasses(slot, day)"
                      (click)="selectSlot(slot)"
                      [class.ring-2]="selectedSlot?.id === slot.id"
                      [class.ring-blue-400]="selectedSlot?.id === slot.id"
                    >
                      <div>
                        <div class="font-semibold text-xs truncate mb-1" [title]="slot.matiere_nom">
                          {{ slot.matiere_nom }}
                        </div>
                        <div class="text-xs text-gray-600 truncate mb-1" [title]="slot.classe_nom">
                          {{ slot.classe_nom }}
                        </div>
                        <div class="text-xs text-gray-500 truncate" *ngIf="slot.salle_code">
                          {{ slot.salle_code }}
                        </div>
                      </div>
                      
                      <div class="flex items-center justify-between mt-2">
                        <div class="text-xs text-gray-500">
                          {{ formatTime(slot.debut) }}-{{ formatTime(slot.fin) }}
                        </div>
                        <div 
                          class="text-xs px-1.5 py-0.5 rounded-full"
                          [ngClass]="getStatusColor(slot.status)"
                        >
                          {{ getStatusShort(slot.status) }}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Vue liste -->
        <div *ngIf="viewMode === 'list'" class="space-y-6">
          <div *ngFor="let day of weekSchedule?.days" class="card">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                     [ngClass]="getDayIconClass(day.jour, day.isToday)">
                  <span class="text-white text-sm font-bold">{{ getJourShort(day.jour) }}</span>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 flex items-center gap-2">
                    {{ getJourName(day.jour) }}
                    <div *ngIf="day.isToday" class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </h3>
                  <div class="text-sm text-gray-600">{{ day.date | date:'dd MMMM yyyy':'':'fr' }}</div>
                </div>
              </div>
              <div class="text-right text-sm text-gray-600">
                <div>{{ day.slots.length }} cours</div>
                <div>{{ day.totalHours }}h</div>
              </div>
            </div>

            <div *ngIf="day.slots.length === 0" class="text-center py-8 text-gray-500">
              <svg class="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7"/>
              </svg>
              Journée libre
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div 
                *ngFor="let slot of day.slots" 
                class="cours-card p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer"
                [ngClass]="getSlotCardClass(slot, day)"
                (click)="selectSlot(slot)"
              >
                <div class="flex items-start justify-between mb-2">
                  <h4 class="font-semibold text-gray-900 text-sm">{{ slot.matiere_nom }}</h4>
                  <span class="text-xs px-2 py-1 rounded-full"
                        [ngClass]="getStatusColor(slot.status)">
                    {{ getStatusLabel(slot.status) }}
                  </span>
                </div>
                
                <div class="space-y-1 text-xs text-gray-600">
                  <div class="flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {{ formatTime(slot.debut) }} - {{ formatTime(slot.fin) }}
                  </div>
                  <div class="flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    {{ slot.classe_nom }}
                  </div>
                  <div class="flex items-center gap-1" *ngIf="slot.salle_code">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-7 0h2m-3 0h2M7 3h2m3 0h2m6 0v1a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                    </svg>
                    {{ slot.salle_code }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Détails du cours sélectionné -->
        <div 
          *ngIf="selectedSlot" 
          class="card mt-6 border-l-4 border-blue-400"
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
              <h4 class="font-semibold text-gray-700 mb-3">Cours</h4>
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
                <div *ngIf="selectedSlot.salle_nom">
                  <span class="font-medium">Nom:</span> {{ selectedSlot.salle_nom }}
                </div>
              </div>
            </div>

            <div>
              <h4 class="font-semibold text-gray-700 mb-3">Actions</h4>
              <div class="space-y-2">
                <button class="btn-primary text-sm w-full" (click)="goToPresences(selectedSlot)">
                  Gérer présences
                </button>
                <button class="btn-secondary text-sm w-full" (click)="goToClassDetails(selectedSlot)">
                  Détails classe
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
    .btn-primary {
      @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50;
    }
    .btn-secondary {
      @apply bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50;
    }
    .cours-slot {
      border-left-color: #3b82f6;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }
    .cours-slot.today {
      border-left-color: #10b981;
      background: linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 100%);
    }
    .cours-card {
      border-color: #e5e7eb;
    }
    .cours-card.today {
      border-color: #10b981;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    }
  `]
})
export class EmploiSemaineComponent implements OnInit {
  private emploiService = inject(EmploiService);

  currentWeek = new Date();
  currentWeekLabel = 'Semaine actuelle';
  weekSchedule: WeekSchedule | null = null;
  timeSlots: TimeSlot[] = [];
  selectedSlot: EmploiSlot | null = null;
  selectedDay: DaySchedule | null = null;
  viewMode: 'grid' | 'list' = 'grid';
  isLoading = false;

  ngOnInit() {
    this.loadWeekSchedule();
  }

  loadWeekSchedule() {
    this.isLoading = true;
    const weekStart = this.getWeekStart(this.currentWeek);
    
    setTimeout(() => {
      this.buildWeekSchedule(weekStart);
      this.isLoading = false;
    }, 300);
  }

  buildWeekSchedule(weekStart: Date) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    // Simuler des données
    const today = new Date();
    const todayDayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
    
    const days: DaySchedule[] = [1,2,3,4,5,6].map(jour => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(dayDate.getDate() + (jour - 1));
      
      const mockSlots: EmploiSlot[] = jour <= 5 ? [
        {
          id: jour * 10 + 1, emploi_template_id: 1, jour_semaine: jour, debut: '09:00', fin: '10:00',
          matiere_id: 1, educateur_id: 1, salle_id: 1, status: 'planned',
          matiere_nom: 'Mathématiques', educateur_nom: 'Moi', salle_code: 'A101',
          salle_nom: 'Salle A101', classe_niveau: 'GS', classe_nom: 'GS-A',
          created_at: '', updated_at: ''
        },
        {
          id: jour * 10 + 2, emploi_template_id: 1, jour_semaine: jour, debut: '10:30', fin: '11:30',
          matiere_id: 2, educateur_id: 1, salle_id: 2, status: 'planned',
          matiere_nom: 'Français', educateur_nom: 'Moi', salle_code: 'B102',
          salle_nom: 'Salle B102', classe_niveau: 'MS', classe_nom: 'MS-B',
          created_at: '', updated_at: ''
        }
      ] : [];

      return {
        jour,
        date: dayDate.toISOString().split('T')[0],
        slots: mockSlots.sort((a, b) => a.debut.localeCompare(b.debut)),
        totalHours: this.calculateDayHours(mockSlots),
        isToday: this.isSameWeek(weekStart, today) && jour === todayDayOfWeek
      };
    });

    this.weekSchedule = {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      days,
      totalWeekHours: days.reduce((total, day) => total + day.totalHours, 0),
      totalSlots: days.reduce((total, day) => total + day.slots.length, 0)
    };

    this.buildTimeSlots();
  }

  buildTimeSlots() {
    const times = new Set<string>();
    this.weekSchedule?.days.forEach(day => {
      day.slots.forEach(slot => times.add(slot.debut));
    });

    this.timeSlots = Array.from(times).sort().map(time => {
      const timeSlot: TimeSlot = {
        time: this.formatTime(time),
        slots: {}
      };
      
      this.weekSchedule?.days.forEach(day => {
        const slot = day.slots.find(s => s.debut === time);
        timeSlot.slots[day.jour] = slot || null;
      });
      
      return timeSlot;
    });
  }

  calculateDayHours(slots: EmploiSlot[]): number {
    return slots.reduce((total, slot) => {
      const start = new Date(`2000-01-01T${slot.debut}`);
      const end = new Date(`2000-01-01T${slot.fin}`);
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);
  }

  isSameWeek(date1: Date, date2: Date): boolean {
    const week1Start = this.getWeekStart(date1);
    const week2Start = this.getWeekStart(date2);
    return week1Start.getTime() === week2Start.getTime();
  }

  previousWeek() {
    this.currentWeek.setDate(this.currentWeek.getDate() - 7);
    this.updateWeekLabel();
    this.loadWeekSchedule();
  }

  nextWeek() {
    this.currentWeek.setDate(this.currentWeek.getDate() + 7);
    this.updateWeekLabel();
    this.loadWeekSchedule();
  }

  goToCurrentWeek() {
    this.currentWeek = new Date();
    this.updateWeekLabel();
    this.loadWeekSchedule();
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
    return this.isSameWeek(this.currentWeek, now);
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
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  selectSlot(slot: EmploiSlot) {
    this.selectedSlot = this.selectedSlot?.id === slot.id ? null : slot;
  }

  selectDay(day: DaySchedule) {
    this.selectedDay = this.selectedDay?.jour === day.jour ? null : day;
  }

  goToPresences(slot: EmploiSlot) {
    console.log('Navigation vers présences:', slot);
  }

  goToClassDetails(slot: EmploiSlot) {
    console.log('Navigation vers détails classe:', slot);
  }

  // Utilitaires visuels
  getDayCardClass(day: DaySchedule): string {
    if (day.isToday) {
      return 'border-blue-500 bg-blue-50';
    }
    if (day.slots.length === 0) {
      return 'border-gray-200 bg-gray-50';
    }
    return 'border-green-200 bg-green-50';
  }

  getDayTextClass(day: DaySchedule): string {
    if (day.isToday) {
      return 'text-blue-700';
    }
    if (day.slots.length === 0) {
      return 'text-gray-600';
    }
    return 'text-green-700';
  }

  getDayIconClass(jour: number, isToday: boolean): string {
    if (isToday) {
      return 'bg-blue-500';
    }
    const colors = ['', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    return colors[jour] || 'bg-gray-500';
  }

  getSlotClasses(slot: EmploiSlot, day: DaySchedule): string {
    return day.isToday ? 'today' : '';
  }

  getSlotCardClass(slot: EmploiSlot, day: DaySchedule): string {
    return day.isToday ? 'today' : '';
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

  getStatusShort(status: string): string {
    const shorts = {
      'planned': 'P',
      'locked': 'V',
      'cancelled': 'A'
    };
    return shorts[status as keyof typeof shorts] || status;
  }

  getStatusColor(status: string): string {
    return this.emploiService.getStatusColor(status);
  }
}