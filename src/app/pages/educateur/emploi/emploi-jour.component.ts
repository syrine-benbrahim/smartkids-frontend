// emploi-jour.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmploiService, EmploiSlot } from '../../../services/emploi.service';
import { AuthService } from '../../../core/auth.service';

interface TodaySchedule {
  date: string;
  dayName: string;
  slots: EmploiSlot[];
  currentSlot?: EmploiSlot;
  nextSlot?: EmploiSlot;
  totalHours: number;
}

@Component({
  selector: 'app-emploi-jour',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 sm:p-6">
      <div class="max-w-4xl mx-auto">
        
        <!-- Header avec date du jour -->
        <div class="card mb-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Emploi du Jour</h1>
                <p class="text-gray-600" *ngIf="todaySchedule">
                  {{ todaySchedule.dayName }} {{ todaySchedule.date | date:'dd MMMM yyyy':'':'fr' }}
                </p>
              </div>
            </div>

            <!-- Navigation jours -->
            <div class="flex items-center gap-3">
              <button 
                class="btn-secondary p-2"
                (click)="previousDay()"
                [disabled]="isLoading"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              
              <button 
                class="btn-primary text-sm"
                (click)="goToToday()"
                [disabled]="isToday()"
              >
                Aujourd'hui
              </button>
              
              <button 
                class="btn-secondary p-2"
                (click)="nextDay()"
                [disabled]="isLoading"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Résumé du jour -->
        <div class="card mb-6" *ngIf="todaySchedule">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <!-- Nombre de cours -->
            <div class="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div class="text-3xl font-bold text-blue-600 mb-2">{{ todaySchedule.slots.length }}</div>
              <div class="text-sm font-medium text-blue-800">Cours aujourd'hui</div>
            </div>

            <!-- Total d'heures -->
            <div class="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div class="text-3xl font-bold text-green-600 mb-2">{{ todaySchedule.totalHours }}h</div>
              <div class="text-sm font-medium text-green-800">Temps total</div>
            </div>

            <!-- Cours actuel -->
            <div class="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <div class="text-xl font-bold text-orange-600 mb-2">
                {{ todaySchedule.currentSlot ? 'En cours' : 'Libre' }}
              </div>
              <div class="text-sm font-medium text-orange-800">
                {{ todaySchedule.currentSlot?.matiere_nom || 'Aucun cours' }}
              </div>
            </div>

            <!-- Prochain cours -->
            <div class="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div class="text-xl font-bold text-purple-600 mb-2">
                {{ todaySchedule.nextSlot ? 'À venir' : 'Terminé' }}
              </div>
<div *ngIf="todaySchedule" class="text-sm font-medium text-purple-800">
  {{ todaySchedule.nextSlot?.debut ? 'À ' + formatTime(todaySchedule.nextSlot?.debut ?? '') : 'Journée terminée' }}
</div>
            </div>
          </div>
        </div>

        <!-- Planning de la journée -->
        <div class="card" *ngIf="todaySchedule">
          
          <!-- Aucun cours -->
          <div *ngIf="todaySchedule.slots.length === 0" class="text-center py-12">
            <div class="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Journée libre</h3>
            <p class="text-gray-600">Aucun cours programmé pour aujourd'hui.</p>
          </div>

          <!-- Liste des cours -->
          <div *ngIf="todaySchedule.slots.length > 0" class="space-y-4">
            <h2 class="text-lg font-bold text-gray-900 mb-6">Planning de la journée</h2>
            
            <div 
              *ngFor="let slot of todaySchedule.slots; let i = index" 
              class="cours-card p-6 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md cursor-pointer"
              [ngClass]="getSlotCardClass(slot)"
              (click)="selectSlot(slot)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  
                  <!-- En-tête du cours -->
                  <div class="flex items-center gap-3 mb-3">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                           [ngClass]="getTimeIconClass(slot)">
                        <span class="text-xs font-bold text-white">{{ i + 1 }}</span>
                      </div>
                      <div>
                        <h3 class="text-xl font-bold text-gray-900">{{ slot.matiere_nom }}</h3>
                        <div class="text-sm text-gray-600">{{ slot.classe_nom }}</div>
                      </div>
                    </div>
                    
                    <!-- Statut temps réel -->
                    <div class="text-right">
                      <div 
                        class="text-xs px-3 py-1.5 rounded-full font-bold"
                        [ngClass]="getTimeStatusClass(slot)"
                      >
                        {{ getTimeStatusLabel(slot) }}
                      </div>
                      <div class="text-xs text-gray-500 mt-1">
                        {{ getTimeUntilSlot(slot) }}
                      </div>
                    </div>
                  </div>

                  <!-- Détails du cours -->
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    
                    <!-- Horaires -->
                    <div class="flex items-center gap-2 text-gray-700">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span class="font-medium">{{ formatTime(slot.debut) }} - {{ formatTime(slot.fin) }}</span>
                      <span class="text-gray-500">({{ getDuration(slot) }})</span>
                    </div>

                    <!-- Salle -->
                    <div class="flex items-center gap-2 text-gray-700" *ngIf="slot.salle_code">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-7 0h2m-3 0h2M7 3h2m3 0h2m6 0v1a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                      </svg>
                      <span>{{ slot.salle_code }}</span>
                      <span class="text-gray-500" *ngIf="slot.salle_nom">({{ slot.salle_nom }})</span>
                    </div>

                    <!-- Statut -->
                    <div class="flex items-center gap-2">
                      <div 
                        class="text-xs px-2 py-1 rounded-full"
                        [ngClass]="getStatusColor(slot.status)"
                      >
                        {{ getStatusLabel(slot.status) }}
                      </div>
                    </div>
                  </div>

                  <!-- Actions rapides -->
                  <div class="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button 
                      class="btn-outline text-xs flex items-center gap-1"
                      (click)="markPresences(slot); $event.stopPropagation()"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Présences
                    </button>

                    <button 
                      class="btn-outline text-xs flex items-center gap-1"
                      (click)="viewClassDetails(slot); $event.stopPropagation()"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                      Classe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Détails du cours sélectionné -->
        <div 
          *ngIf="selectedSlot" 
          class="card mt-6 border-l-4 border-emerald-400"
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

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="font-semibold text-gray-700 mb-3">Informations</h4>
              <div class="space-y-2 text-sm">
                <div><span class="font-medium">Matière:</span> {{ selectedSlot.matiere_nom }}</div>
                <div><span class="font-medium">Classe:</span> {{ selectedSlot.classe_nom }}</div>
                <div><span class="font-medium">Horaires:</span> {{ formatTime(selectedSlot.debut) }} - {{ formatTime(selectedSlot.fin) }}</div>
                <div><span class="font-medium">Durée:</span> {{ getDuration(selectedSlot) }}</div>
                <div *ngIf="selectedSlot.salle_code">
                  <span class="font-medium">Salle:</span> {{ selectedSlot.salle_code }}
                  <span *ngIf="selectedSlot.salle_nom" class="text-gray-500"> ({{ selectedSlot.salle_nom }})</span>
                </div>
              </div>
            </div>

            <div>
              <h4 class="font-semibold text-gray-700 mb-3">Actions</h4>
              <div class="space-y-2">
                <button class="btn-primary text-sm w-full" (click)="markPresences(selectedSlot)">
                  Gérer les présences
                </button>
                <button class="btn-secondary text-sm w-full" (click)="viewClassDetails(selectedSlot)">
                  Voir la classe
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
      @apply bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50;
    }
    .btn-secondary {
      @apply bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50;
    }
    .btn-outline {
      @apply border border-gray-300 hover:border-emerald-300 text-gray-700 hover:text-emerald-700 font-medium px-3 py-1.5 rounded-lg transition-colors;
    }
    .cours-card {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-left-color: #10b981;
    }
    .cours-card.current {
      background: linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 100%);
      border-left-color: #059669;
    }
    .cours-card.upcoming {
      background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%);
      border-left-color: #f59e0b;
    }
    .cours-card.past {
      background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%);
      border-left-color: #64748b;
      opacity: 0.8;
    }
  `]
})
export class EmploiJourComponent implements OnInit {
  private emploiService = inject(EmploiService);
  private authService = inject(AuthService);

  currentDate = new Date();
  todaySchedule: TodaySchedule | null = null;
  selectedSlot: EmploiSlot | null = null;
  isLoading = false;
  currentTime = new Date();

  ngOnInit() {
    this.loadDaySchedule();
    this.startTimeUpdater();
  }

  ngOnDestroy() {
    // Clear interval si nécessaire
  }

  startTimeUpdater() {
    setInterval(() => {
      this.currentTime = new Date();
      if (this.todaySchedule) {
        this.updateCurrentAndNextSlots();
      }
    }, 60000); // Update every minute
  }

  loadDaySchedule() {
    this.isLoading = true;
    
    // Simuler le chargement - remplacer par un vrai appel API
    setTimeout(() => {
      this.buildDaySchedule();
      this.isLoading = false;
    }, 300);
  }

  buildDaySchedule() {
    const dayOfWeek = this.currentDate.getDay() === 0 ? 7 : this.currentDate.getDay(); // Dimanche = 7
    
    // Simuler des données - remplacer par un appel API réel
    const mockSlots: EmploiSlot[] = dayOfWeek <= 6 ? [
      {
        id: 1, emploi_template_id: 1, jour_semaine: dayOfWeek, debut: '09:00', fin: '10:00',
        matiere_id: 1, educateur_id: 1, salle_id: 1, status: 'planned',
        matiere_nom: 'Mathématiques', educateur_nom: 'Moi', salle_code: 'A101',
        salle_nom: 'Salle A101', classe_niveau: 'GS', classe_nom: 'GS-A',
        created_at: '', updated_at: ''
      },
      {
        id: 2, emploi_template_id: 1, jour_semaine: dayOfWeek, debut: '10:30', fin: '11:30',
        matiere_id: 2, educateur_id: 1, salle_id: 2, status: 'planned',
        matiere_nom: 'Français', educateur_nom: 'Moi', salle_code: 'B102',
        salle_nom: 'Salle B102', classe_niveau: 'MS', classe_nom: 'MS-B',
        created_at: '', updated_at: ''
      },
      {
        id: 3, emploi_template_id: 1, jour_semaine: dayOfWeek, debut: '14:00', fin: '15:00',
        matiere_id: 3, educateur_id: 1, salle_id: 1, status: 'planned',
        matiere_nom: 'Arts plastiques', educateur_nom: 'Moi', salle_code: 'A101',
        salle_nom: 'Salle A101', classe_niveau: 'GS', classe_nom: 'GS-A',
        created_at: '', updated_at: ''
      }
    ] : [];

    const sortedSlots = mockSlots.sort((a, b) => a.debut.localeCompare(b.debut));
    
    this.todaySchedule = {
      date: this.currentDate.toISOString().split('T')[0],
      dayName: this.getDayName(),
      slots: sortedSlots,
      totalHours: this.calculateTotalHours(sortedSlots)
    };

    this.updateCurrentAndNextSlots();
  }

  updateCurrentAndNextSlots() {
    if (!this.todaySchedule) return;

    const now = this.currentTime;
    const currentTimeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Find current slot
    this.todaySchedule.currentSlot = this.todaySchedule.slots.find(slot => 
      slot.debut <= currentTimeString && slot.fin > currentTimeString
    );

    // Find next slot
    this.todaySchedule.nextSlot = this.todaySchedule.slots.find(slot => 
      slot.debut > currentTimeString
    );
  }

  calculateTotalHours(slots: EmploiSlot[]): number {
    return slots.reduce((total, slot) => {
      const start = new Date(`2000-01-01T${slot.debut}`);
      const end = new Date(`2000-01-01T${slot.fin}`);
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);
  }

  previousDay() {
    this.currentDate.setDate(this.currentDate.getDate() - 1);
    this.loadDaySchedule();
  }

  nextDay() {
    this.currentDate.setDate(this.currentDate.getDate() + 1);
    this.loadDaySchedule();
  }

  goToToday() {
    this.currentDate = new Date();
    this.loadDaySchedule();
  }

  isToday(): boolean {
    const today = new Date();
    return this.currentDate.toDateString() === today.toDateString();
  }

  getDayName(): string {
    return this.currentDate.toLocaleDateString('fr-FR', { weekday: 'long' });
  }

  selectSlot(slot: EmploiSlot) {
    this.selectedSlot = this.selectedSlot?.id === slot.id ? null : slot;
  }

  markPresences(slot: EmploiSlot) {
    // Navigation vers la page de présences
    console.log('Marquer les présences pour:', slot);
  }

  viewClassDetails(slot: EmploiSlot) {
    // Navigation vers les détails de la classe
    console.log('Voir les détails de la classe:', slot);
  }

  // Utilitaires visuels
  getSlotCardClass(slot: EmploiSlot): string {
    const now = this.currentTime;
    const currentTimeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (slot.debut <= currentTimeString && slot.fin > currentTimeString) {
      return 'current';
    } else if (slot.debut > currentTimeString) {
      return 'upcoming';
    } else {
      return 'past';
    }
  }

  getTimeIconClass(slot: EmploiSlot): string {
    const now = this.currentTime;
    const currentTimeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (slot.debut <= currentTimeString && slot.fin > currentTimeString) {
      return 'bg-emerald-500';
    } else if (slot.debut > currentTimeString) {
      return 'bg-amber-500';
    } else {
      return 'bg-gray-500';
    }
  }

  getTimeStatusClass(slot: EmploiSlot): string {
    const now = this.currentTime;
    const currentTimeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (slot.debut <= currentTimeString && slot.fin > currentTimeString) {
      return 'bg-emerald-100 text-emerald-800';
    } else if (slot.debut > currentTimeString) {
      return 'bg-amber-100 text-amber-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  }

  getTimeStatusLabel(slot: EmploiSlot): string {
    const now = this.currentTime;
    const currentTimeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (slot.debut <= currentTimeString && slot.fin > currentTimeString) {
      return 'EN COURS';
    } else if (slot.debut > currentTimeString) {
      return 'À VENIR';
    } else {
      return 'TERMINÉ';
    }
  }

  getTimeUntilSlot(slot: EmploiSlot): string {
    const now = this.currentTime;
    const currentTimeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (slot.debut <= currentTimeString && slot.fin > currentTimeString) {
      const endTime = new Date(`2000-01-01T${slot.fin}`);
      const currentTime = new Date(`2000-01-01T${currentTimeString}`);
      const diffMinutes = Math.round((endTime.getTime() - currentTime.getTime()) / (1000 * 60));
      return `Se termine dans ${diffMinutes}min`;
    } else if (slot.debut > currentTimeString) {
      const startTime = new Date(`2000-01-01T${slot.debut}`);
      const currentTime = new Date(`2000-01-01T${currentTimeString}`);
      const diffMinutes = Math.round((startTime.getTime() - currentTime.getTime()) / (1000 * 60));
      return `Dans ${diffMinutes}min`;
    } else {
      return 'Terminé';
    }
  }

  getDuration(slot: EmploiSlot): string {
    const start = new Date(`2000-01-01T${slot.debut}`);
    const end = new Date(`2000-01-01T${slot.fin}`);
    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    if (diffMinutes < 60) {
      return `${diffMinutes}min`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return minutes > 0 ? `${hours}h${minutes}min` : `${hours}h`;
    }
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