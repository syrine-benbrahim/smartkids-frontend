import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ParentActivitesApiService, CalendrierActivite } from '../../../services/parent-activites-api.service';

@Component({
  selector: 'app-parent-enfant-calendrier',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="card bg-gradient-to-r from-purple-600 to-pink-600 text-white mb-8">
          <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div class="flex items-center gap-4">
              <button 
                routerLink="/parent/activites/enfants"
                class="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <h1 class="text-3xl font-black">Calendrier des Activités</h1>
                <p class="text-purple-100" *ngIf="enfantNom()">{{ enfantNom() }}</p>
              </div>
            </div>

            <!-- Month Navigator -->
            <div class="flex items-center gap-4 bg-white/20 rounded-2xl p-2">
              <button
                (click)="previousMonth()"
                class="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              
              <div class="text-center min-w-[150px]">
                <div class="text-lg font-bold">{{ getMonthName(currentMonth()) }}</div>
                <div class="text-sm opacity-80">{{ currentYear() }}</div>
              </div>
              
              <button
                (click)="nextMonth()"
                class="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading()" class="card text-center py-12">
          <div class="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600">Chargement du calendrier...</p>
        </div>

        <!-- Calendar -->
        <div *ngIf="!loading()" class="card">
          <!-- Calendar Header -->
          <div class="grid grid-cols-7 gap-2 mb-4">
            <div 
              *ngFor="let day of dayNames" 
              class="text-center text-sm font-bold text-gray-600 py-3"
            >
              {{ day }}
            </div>
          </div>

          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 gap-2">
            <!-- Empty cells for days before month start -->
            <div 
              *ngFor="let empty of emptyStartDays()" 
              class="h-24 bg-gray-50 rounded-xl opacity-50"
            ></div>

            <!-- Days of the month -->
            <div 
              *ngFor="let day of daysInMonth(); trackBy: trackByDay"
              class="relative h-24 bg-white border-2 rounded-xl transition-all duration-200 cursor-pointer group"
              [class]="getDayClass(day)"
              (click)="selectDay(day)"
            >
              <!-- Day number -->
              <div class="absolute top-2 left-2 text-sm font-bold"
                   [class]="getDayNumberClass(day)">
                {{ day }}
              </div>

              <!-- Today indicator -->
              <div *ngIf="isToday(day)" 
                   class="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full">
              </div>

              <!-- Activities for this day -->
              <div class="absolute bottom-1 left-1 right-1 space-y-1">
                <div 
                  *ngFor="let activite of getActivitesForDay(day); let i = index"
                  class="text-xs px-2 py-1 rounded-md truncate transition-all duration-200 group-hover:scale-105"
                  [class]="getActiviteClass(activite.statut_participation)"
                  [title]="activite.nom + ' (' + activite.heure_debut + ')'"
                >
                  {{ activite.nom }}
                </div>
                
                <!-- More activities indicator -->
                <div 
                  *ngIf="getActivitesForDay(day).length > 2"
                  class="text-xs text-gray-500 font-bold text-center"
                >
                  +{{ getActivitesForDay(day).length - 2 }} autres
                </div>
              </div>
            </div>

            <!-- Empty cells for days after month end -->
            <div 
              *ngFor="let empty of emptyEndDays()" 
              class="h-24 bg-gray-50 rounded-xl opacity-50"
            ></div>
          </div>
        </div>

        <!-- Selected Day Details -->
        <div *ngIf="selectedDay() && getActivitesForDay(selectedDay()!).length > 0" class="card mt-8">
          <h3 class="text-2xl font-bold text-gray-900 mb-6">
            Activités du {{ selectedDay() }} {{ getMonthName(currentMonth()) }}
          </h3>
          
          <div class="space-y-4">
            <div 
              *ngFor="let activite of getActivitesForDay(selectedDay()!); trackBy: trackByActivite"
              class="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200"
              [class]="getSelectedDayActiviteClass(activite.statut_participation)"
            >
              <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center"
                       [class]="getActiviteIconClass(activite.statut_participation)">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-lg font-bold text-gray-900">{{ activite.nom }}</h4>
                    <div class="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>{{ activite.heure_debut }} - {{ activite.heure_fin }}</span>
                      <span *ngIf="activite.type" [class]="getTypeBadgeClass(activite.type)">
                        {{ getTypeLabel(activite.type) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <!-- Note -->
                  <div *ngIf="activite.note_evaluation" class="text-right">
                    <div class="text-lg font-bold text-purple-600">{{ activite.note_evaluation }}/20</div>
                    <div class="text-xs text-gray-500">Note</div>
                  </div>

                  <!-- Status -->
                  <span [class]="getStatutBadgeClass(activite.statut_participation)">
                    {{ getStatutLabel(activite.statut_participation) }}
                  </span>

                  <!-- Action button -->
                  <button
                    (click)="viewActiviteDetails(activite)"
                    class="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl font-semibold transition-colors"
                  >
                    Détails
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Monthly Summary -->
        <div *ngIf="!loading() && activitesOfMonth().length > 0" class="card mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
          <h3 class="text-xl font-bold text-gray-900 mb-4 text-center">
            Résumé de {{ getMonthName(currentMonth()) }} {{ currentYear() }}
          </h3>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-white/60 rounded-2xl">
              <div class="text-2xl font-black text-blue-600 mb-1">{{ activitesOfMonth().length }}</div>
              <div class="text-sm font-medium text-blue-800">Total activités</div>
            </div>
            
            <div class="text-center p-4 bg-white/60 rounded-2xl">
              <div class="text-2xl font-black text-green-600 mb-1">{{ getMonthPresences() }}</div>
              <div class="text-sm font-medium text-green-800">Présences</div>
            </div>
            
            <div class="text-center p-4 bg-white/60 rounded-2xl">
              <div class="text-2xl font-black text-red-600 mb-1">{{ getMonthAbsences() }}</div>
              <div class="text-sm font-medium text-red-800">Absences</div>
            </div>
            
            <div class="text-center p-4 bg-white/60 rounded-2xl">
              <div class="text-2xl font-black text-purple-600 mb-1">{{ getMonthAverageNote() }}</div>
              <div class="text-sm font-medium text-purple-800">Note moyenne</div>
            </div>
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
export class ParentEnfantCalendrierComponent implements OnInit {
  private api = inject(ParentActivitesApiService);
  private route = inject(ActivatedRoute);

  loading = signal(true);
  activitesOfMonth = signal<CalendrierActivite[]>([]);
  enfantId = signal<number>(0);
  enfantNom = signal<string>('');
  currentMonth = signal<number>(new Date().getMonth() + 1);
  currentYear = signal<number>(new Date().getFullYear());
  selectedDay = signal<number | null>(null);

  dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.enfantId.set(parseInt(id));
      this.loadCalendrier();
    }
  }

  private loadCalendrier() {
    this.loading.set(true);
    
    this.api.getCalendrierEnfant(
      this.enfantId(), 
      this.currentMonth(), 
      this.currentYear()
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.activitesOfMonth.set(response.data.activites || []);
        }
        this.loading.set(false);
      },
      error: () => {
        this.activitesOfMonth.set([]);
        this.loading.set(false);
      }
    });
  }

  // Calendar navigation
  previousMonth() {
    if (this.currentMonth() === 1) {
      this.currentMonth.set(12);
      this.currentYear.set(this.currentYear() - 1);
    } else {
      this.currentMonth.set(this.currentMonth() - 1);
    }
    this.selectedDay.set(null);
    this.loadCalendrier();
  }

  nextMonth() {
    if (this.currentMonth() === 12) {
      this.currentMonth.set(1);
      this.currentYear.set(this.currentYear() + 1);
    } else {
      this.currentMonth.set(this.currentMonth() + 1);
    }
    this.selectedDay.set(null);
    this.loadCalendrier();
  }

  // Calendar helpers
  daysInMonth(): number[] {
    const daysCount = new Date(this.currentYear(), this.currentMonth(), 0).getDate();
    return Array.from({ length: daysCount }, (_, i) => i + 1);
  }

  emptyStartDays(): number[] {
    const firstDay = new Date(this.currentYear(), this.currentMonth() - 1, 1).getDay();
    return Array(firstDay).fill(0);
  }

  emptyEndDays(): number[] {
    const lastDay = new Date(this.currentYear(), this.currentMonth(), 0).getDay();
    const emptyCount = lastDay === 6 ? 0 : 6 - lastDay;
    return Array(emptyCount).fill(0);
  }

  isToday(day: number): boolean {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() + 1 === this.currentMonth() && 
           today.getFullYear() === this.currentYear();
  }

  selectDay(day: number) {
    this.selectedDay.set(day);
  }

  getActivitesForDay(day: number): CalendrierActivite[] {
    return this.activitesOfMonth().filter(activite => {
      const activiteDay = new Date(activite.date).getDate();
      return activiteDay === day;
    });
  }

  // Styling helpers
  getDayClass(day: number): string {
    const hasActivites = this.getActivitesForDay(day).length > 0;
    const isSelected = this.selectedDay() === day;
    const today = this.isToday(day);
    
    let classes = 'hover:border-purple-300 hover:shadow-lg';
    
    if (today) classes += ' border-blue-400 bg-blue-50';
    else if (isSelected) classes += ' border-purple-400 bg-purple-50';
    else if (hasActivites) classes += ' border-gray-300 bg-gray-50';
    else classes += ' border-gray-200';
    
    return classes;
  }

  getDayNumberClass(day: number): string {
    if (this.isToday(day)) return 'text-blue-700';
    if (this.selectedDay() === day) return 'text-purple-700';
    return 'text-gray-700';
  }

  getActiviteClass(statut: string): string {
    switch (statut) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'excuse': return 'bg-yellow-100 text-yellow-800';
      case 'en_attente': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getSelectedDayActiviteClass(statut: string): string {
    switch (statut) {
      case 'present': return 'border-green-200 bg-green-50/50';
      case 'absent': return 'border-red-200 bg-red-50/50';
      case 'excuse': return 'border-yellow-200 bg-yellow-50/50';
      case 'en_attente': return 'border-blue-200 bg-blue-50/50';
      default: return '';
    }
  }

  getActiviteIconClass(statut: string): string {
    switch (statut) {
      case 'present': return 'bg-green-100 text-green-600';
      case 'absent': return 'bg-red-100 text-red-600';
      case 'excuse': return 'bg-yellow-100 text-yellow-600';
      case 'en_attente': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  getStatutBadgeClass(statut: string): string {
    const baseClass = 'px-3 py-1 rounded-full text-sm font-bold';
    switch (statut) {
      case 'present': return `${baseClass} bg-green-100 text-green-800`;
      case 'absent': return `${baseClass} bg-red-100 text-red-800`;
      case 'excuse': return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'en_attente': return `${baseClass} bg-blue-100 text-blue-800`;
      default: return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'present': return 'Présent';
      case 'absent': return 'Absent';
      case 'excuse': return 'Excusé';
      case 'en_attente': return 'En attente';
      default: return statut;
    }
  }

  getTypeBadgeClass(type: string): string {
    const baseClass = 'px-2 py-1 rounded-full text-xs font-bold';
    switch (type) {
      case 'sport': return `${baseClass} bg-red-100 text-red-800`;
      case 'art': return `${baseClass} bg-purple-100 text-purple-800`;
      case 'musique': return `${baseClass} bg-blue-100 text-blue-800`;
      case 'science': return `${baseClass} bg-green-100 text-green-800`;
      case 'lecture': return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'sortie': return `${baseClass} bg-orange-100 text-orange-800`;
      default: return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'sport': return 'Sport';
      case 'art': return 'Art';
      case 'musique': return 'Musique';
      case 'science': return 'Science';
      case 'lecture': return 'Lecture';
      case 'sortie': return 'Sortie';
      default: return type;
    }
  }

  getMonthName(month: number): string {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[month - 1];
  }

  // Monthly statistics
  getMonthPresences(): number {
    return this.activitesOfMonth().filter(a => a.statut_participation === 'present').length;
  }

  getMonthAbsences(): number {
    return this.activitesOfMonth().filter(a => a.statut_participation === 'absent').length;
  }

  getMonthAverageNote(): string {
    const notedActivites = this.activitesOfMonth().filter(a => a.note_evaluation);
    if (notedActivites.length === 0) return 'N/A';
    
    const total = notedActivites.reduce((sum, a) => sum + a.note_evaluation!, 0);
    return (total / notedActivites.length).toFixed(1);
  }

  viewActiviteDetails(activite: CalendrierActivite) {
    console.log('Voir détails activité:', activite);
  }

  trackByDay(index: number, day: number): number {
    return day;
  }

  trackByActivite(index: number, activite: CalendrierActivite): number {
    return activite.id;
  }
}