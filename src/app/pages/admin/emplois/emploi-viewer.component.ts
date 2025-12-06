// emploi-viewer.component.ts
import { Component, inject, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EmploiService, EmploiTemplate, EmploiSlot } from '../../../services/emploi.service';

interface WeekView {
  [jour: number]: EmploiSlot[];
}

interface TimeSlot {
  time: string;
  slots: { [jour: number]: EmploiSlot | null };
}

@Component({
  selector: 'app-emploi-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
      <div class="max-w-7xl mx-auto">
        
        <!-- Header avec navigation -->
        <div class="card mb-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <button 
                class="btn-secondary text-sm py-2 px-4"
                (click)="goBack()"
              >
                ← Retour
              </button>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <h1 class="text-xl font-bold text-gray-900">
                    {{ template ? template.classe_nom || 'Emploi du temps' : 'Chargement...' }}
                  </h1>
                  <p class="text-gray-600 text-sm">
                    <span *ngIf="template">
                      Période: {{ template.period_start | date:'dd/MM/yyyy' }} - {{ template.period_end | date:'dd/MM/yyyy' }}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3" *ngIf="template">
              <!-- Bouton Télécharger PDF -->
              <button 
                class="btn-info text-sm py-2 px-4"
                (click)="downloadPDF()"
                [disabled]="isDownloading"
              >
                <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <span *ngIf="isDownloading" class="animate-pulse">Téléchargement...</span>
                <span *ngIf="!isDownloading">Télécharger PDF</span>
              </button>

              <!-- Badge de statut -->
              <div class="text-xs px-3 py-1.5 rounded-full font-medium"
                   [ngClass]="getStatusBadgeClass(template.status)">
                {{ getStatusLabel(template.status) }}
              </div>
              
              <!-- Bouton Publier -->
              <button 
                *ngIf="template.status === 'draft' && isAdmin"
                class="btn-success text-sm py-2 px-4"
                (click)="publishTemplate()"
                [disabled]="isPublishing"
              >
                <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <div *ngIf="isPublishing" class="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-2 inline-block"></div>
                {{ isPublishing ? 'Publication...' : 'Publier' }}
              </button>

              <!-- Bouton Archiver/Réactiver -->
              <button 
                *ngIf="isAdmin && template.status === 'published'"
                class="btn-warning text-sm py-2 px-4"
                (click)="archiveTemplate()"
                [disabled]="isArchiving"
              >
                <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                </svg>
                {{ isArchiving ? 'Archivage...' : 'Archiver' }}
              </button>

              <div class="flex items-center gap-2 text-sm text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
                Version {{ template.version }}
              </div>
            </div>
          </div>
        </div>

        <!-- Planning en grille -->
        <div class="card overflow-hidden" id="emploi-grid">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[800px]">
              
              <!-- En-tête des jours -->
              <thead>
                <tr class="bg-gradient-to-r from-slate-50 to-blue-50">
                  <th class="text-left py-4 px-4 font-semibold text-gray-700 min-w-[100px]">
                    Horaires
                  </th>
                  <th *ngFor="let jour of jours" class="text-center py-4 px-3 font-semibold text-gray-700 min-w-[200px]">
                    <div class="flex flex-col items-center">
                      <span class="text-base">{{ getJourName(jour) }}</span>
                      <span class="text-xs text-gray-500 mt-1">{{ getCoursCount(jour) }} cours</span>
                    </div>
                  </th>
                </tr>
              </thead>

              <!-- Corps du planning -->
              <tbody>
                <tr 
                  *ngFor="let timeSlot of timeSlots; let i = index" 
                  class="border-t hover:bg-gray-50 transition-colors"
                  [class.bg-blue-25]="i % 2 === 1"
                >
                  <!-- Colonne horaire -->
                  <td class="py-4 px-4 font-medium text-gray-700 bg-gray-50 border-r">
                    {{ timeSlot.time }}
                  </td>

                  <!-- Colonnes des jours -->
                  <td *ngFor="let jour of jours" class="p-2 border-l border-gray-100">
                    <div 
                      *ngIf="timeSlot.slots[jour]; let slot" 
                      class="cours-slot p-3 rounded-lg border-l-4 h-full min-h-[80px] flex flex-col justify-between transition-all duration-200 hover:shadow-md cursor-pointer"
                      [ngClass]="getSlotClasses(slot)"
                      (click)="selectSlot(slot)"
                      [class.ring-2]="selectedSlot?.id === slot.id"
                      [class.ring-blue-400]="selectedSlot?.id === slot.id"
                    >
                      <div>
                        <div class="font-semibold text-sm truncate mb-1" [title]="slot.matiere_nom">
                          {{ slot.matiere_nom }}
                        </div>
                        <div class="text-xs text-gray-600 mb-1" [title]="slot.educateur_nom">
                          <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                          {{ slot.educateur_nom }}
                        </div>
                        <div class="text-xs text-gray-500" *ngIf="slot.salle_code" [title]="slot.salle_nom">
                          <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-7 0h2m-3 0h2M7 3h2m3 0h2m6 0v1a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                          </svg>
                          {{ slot.salle_code }}
                        </div>
                      </div>
                      
                      <div class="flex items-center justify-between mt-2">
                        <div class="text-xs font-medium text-gray-500">
                          {{ formatTime(slot.debut) }} - {{ formatTime(slot.fin) }}
                        </div>
                        <div 
                          class="text-xs px-2 py-0.5 rounded-full font-medium"
                          [ngClass]="getStatusColor(slot.status)"
                        >
                          {{ getStatusShort(slot.status) }}
                        </div>
                      </div>
                    </div>

                    <!-- Créneau vide -->
                    <div 
                      *ngIf="!timeSlot.slots[jour]" 
                      class="h-20 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm hover:border-gray-300 transition-colors cursor-pointer"
                      (click)="addSlot(jour, timeSlot.time)"
                      [class.hidden]="!isAdmin || template?.status !== 'draft'"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                      </svg>
                      Ajouter
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Panel de détails du cours sélectionné -->
        <div 
          *ngIf="selectedSlot" 
          class="card mt-6 border-l-4"
          [ngClass]="getSlotBorderClass(selectedSlot)"
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

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Informations principales -->
            <div class="space-y-3">
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Matière</label>
                <div class="text-sm font-medium text-gray-900 mt-1">{{ selectedSlot.matiere_nom }}</div>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Jour</label>
                <div class="text-sm font-medium text-gray-900 mt-1">{{ getJourName(selectedSlot.jour_semaine) }}</div>
              </div>
            </div>

            <div class="space-y-3">
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Éducateur</label>
                <div class="text-sm font-medium text-gray-900 mt-1">{{ selectedSlot.educateur_nom }}</div>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Horaires</label>
                <div class="text-sm font-medium text-gray-900 mt-1">
                  {{ formatTime(selectedSlot.debut) }} - {{ formatTime(selectedSlot.fin) }}
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Salle</label>
                <div class="text-sm font-medium text-gray-900 mt-1">
                  {{ selectedSlot.salle_code || 'Non assignée' }}
                  <span *ngIf="selectedSlot.salle_nom" class="text-gray-500">
                    ({{ selectedSlot.salle_nom }})
                  </span>
                </div>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</label>
                <div class="mt-1">
                  <span 
                    class="text-xs px-2 py-1 rounded-full font-medium"
                    [ngClass]="getStatusColor(selectedSlot.status)"
                  >
                    {{ getStatusLabel(selectedSlot.status) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="space-y-2" *ngIf="isAdmin && template?.status === 'draft'">
              <button 
                class="btn-secondary text-xs w-full"
                (click)="editSlot(selectedSlot)"
              >
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Modifier
              </button>
              
              <button 
                *ngIf="selectedSlot.status !== 'locked'"
                class="btn-warning text-xs w-full"
                (click)="lockSlot(selectedSlot)"
                [disabled]="isLocking"
              >
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                {{ isLocking ? 'Verrouillage...' : 'Verrouiller' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Statistiques du planning -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6" *ngIf="template">
          <div class="card text-center">
            <div class="text-2xl font-bold text-blue-600 mb-1">{{ getTotalSlots() }}</div>
            <div class="text-sm text-gray-600">Créneaux total</div>
          </div>
          <div class="card text-center">
            <div class="text-2xl font-bold text-green-600 mb-1">{{ getSlotsByStatus('planned').length }}</div>
            <div class="text-sm text-gray-600">Planifiés</div>
          </div>
          <div class="card text-center">
            <div class="text-2xl font-bold text-orange-600 mb-1">{{ getSlotsByStatus('locked').length }}</div>
            <div class="text-sm text-gray-600">Verrouillés</div>
          </div>
          <div class="card text-center">
            <div class="text-2xl font-bold text-red-600 mb-1">{{ getSlotsByStatus('cancelled').length }}</div>
            <div class="text-sm text-gray-600">Annulés</div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .card {
      @apply bg-white rounded-2xl shadow-lg border border-gray-200 p-6;
    }
    .btn-secondary {
      @apply bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-colors;
    }
    .btn-success {
      @apply bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50;
    }
    .btn-warning {
      @apply bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50;
    }
    .btn-info {
      @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50;
    }
    .cours-slot {
      border-left-color: #3b82f6;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }
    .cours-slot:hover {
      background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%);
    }
    .cours-slot.status-locked {
      border-left-color: #f59e0b;
      background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 20%);
    }
    .cours-slot.status-cancelled {
      border-left-color: #ef4444;
      background: linear-gradient(135deg, #fee2e2 0%, #fca5a5 20%);
      opacity: 0.7;
    }
    .cours-slot.status-planned {
      border-left-color: #10b981;
      background: linear-gradient(135deg, #d1fae5 0%, #6ee7b7 20%);
    }
  `]
})
export class EmploiViewerComponent implements OnInit {
  @Input() templateId?: number;
  @Input() classeId?: number;
  @Input() weekStart?: string;
  @Input() isAdmin: boolean = true;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private emploiService = inject(EmploiService);

  template: EmploiTemplate | null = null;
  slots: EmploiSlot[] = [];
  timeSlots: TimeSlot[] = [];
  selectedSlot: EmploiSlot | null = null;
  isLoading = true;
  isPublishing = false;
  isLocking = false;
  isDownloading = false;
  isArchiving = false;

  jours = [1, 2, 3, 4, 5, 6]; // Lundi à Samedi
  heures = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  ngOnInit() {
    // Prioriser les paramètres d'entrée, sinon utiliser la route
    const tId = this.templateId || +this.route.snapshot.params['id'];
    const cId = this.classeId || +this.route.snapshot.params['classeId'];

    if (tId) {
      this.loadTemplate(tId);
    } else if (cId) {
      this.loadEmploiByClasse(cId);
    }
  }

  loadTemplate(templateId: number) {
    this.isLoading = true;
    this.emploiService.getTemplate(templateId).subscribe({
      next: (response) => {
        this.template = response.data;
        this.slots = response.data.slots || [];
        this.buildTimeSlots();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du template:', error);
        this.isLoading = false;
      }
    });
  }

  loadEmploiByClasse(classeId: number) {
    this.isLoading = true;
    this.emploiService.getEmploiByClasse(classeId, this.weekStart).subscribe({
      next: (response) => {
        this.slots = response.data || [];
        this.buildTimeSlots();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'emploi:', error);
        this.isLoading = false;
      }
    });
  }

  buildTimeSlots() {
    this.timeSlots = [];
    
    // Extraire tous les créneaux horaires uniques
    const allTimes = new Set<string>();
    this.slots.forEach(slot => {
      allTimes.add(slot.debut);
    });
    
    // Si aucun slot, utiliser les heures par défaut
    if (allTimes.size === 0) {
      this.heures.forEach(h => allTimes.add(h));
    }
    
    // Trier les heures
    const sortedTimes = Array.from(allTimes).sort();
    
    // Construire la grille
    sortedTimes.forEach(time => {
      const timeSlot: TimeSlot = {
        time: this.formatTime(time),
        slots: {}
      };
      
      // Pour chaque jour, trouver le slot correspondant
      this.jours.forEach(jour => {
        const slot = this.slots.find(s => 
          s.jour_semaine === jour && s.debut === time
        );
        timeSlot.slots[jour] = slot || null;
      });
      
      this.timeSlots.push(timeSlot);
    });
  }

  selectSlot(slot: EmploiSlot) {
    this.selectedSlot = this.selectedSlot?.id === slot.id ? null : slot;
  }

  publishTemplate() {
    if (!this.template) return;
    
    this.isPublishing = true;
    this.emploiService.publishTemplate(this.template.id).subscribe({
      next: () => {
        if (this.template) {
          this.template.status = 'published';
        }
        this.isPublishing = false;
        alert('✅ Emploi du temps publié avec succès!');
      },
      error: (error) => {
        console.error('Erreur lors de la publication:', error);
        this.isPublishing = false;
        alert('❌ Erreur lors de la publication');
      }
    });
  }

  archiveTemplate() {
    if (!this.template) return;
    
    const confirmed = confirm('Êtes-vous sûr de vouloir archiver cet emploi du temps?');
    if (!confirmed) return;

    this.isArchiving = true;
    // Vous devrez créer cette méthode dans le service
    this.emploiService.archiveTemplate(this.template.id).subscribe({
      next: () => {
        if (this.template) {
          this.template.status = 'draft';
        }
        this.isArchiving = false;
        alert('✅ Emploi du temps archivé avec succès!');
      },
      error: (error) => {
        console.error('Erreur lors de l\'archivage:', error);
        this.isArchiving = false;
        alert('❌ Erreur lors de l\'archivage');
      }
    });
  }

  downloadPDF() {
    if (!this.template) return;

    this.isDownloading = true;

    // Utiliser html2canvas et jspdf pour générer le PDF
    import('html2canvas').then(html2canvas => {
      import('jspdf').then(jsPDF => {
        const element = document.getElementById('emploi-grid');
        if (!element) {
          this.isDownloading = false;
          return;
        }

        html2canvas.default(element, {
          scale: 2,
          useCORS: true,
          logging: false
        }).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF.default('l', 'mm', 'a4');
          
          const imgWidth = 297; // A4 landscape width
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
          
          const filename = `emploi-${this.template?.classe_nom || 'classe'}-${new Date().toISOString().split('T')[0]}.pdf`;
          pdf.save(filename);
          
          this.isDownloading = false;
          alert('✅ PDF téléchargé avec succès!');
        }).catch(error => {
          console.error('Erreur lors de la génération du PDF:', error);
          this.isDownloading = false;
          alert('❌ Erreur lors de la génération du PDF');
        });
      });
    });
  }

  lockSlot(slot: EmploiSlot) {
    if (!this.template) return;
    
    this.isLocking = true;
    this.emploiService.lockSlot(this.template.id, slot.id).subscribe({
      next: () => {
        slot.status = 'locked';
        this.isLocking = false;
      },
      error: (error) => {
        console.error('Erreur lors du verrouillage:', error);
        this.isLocking = false;
      }
    });
  }

  editSlot(slot: EmploiSlot) {
    // Ouvrir un modal ou naviguer vers une page d'édition
    console.log('Éditer le slot:', slot);
  }

  addSlot(jour: number, time: string) {
    console.log('Ajouter un slot:', jour, time);
  }

  // Utilitaires
  getJourName(jour: number): string {
    return this.emploiService.getJourName(jour);
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

  getStatusBadgeClass(status: string): string {
    return status === 'published' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  }

  getSlotClasses(slot: EmploiSlot): string {
    return `status-${slot.status}`;
  }

  getSlotBorderClass(slot: EmploiSlot): string {
    const colors = {
      'planned': 'border-green-400',
      'locked': 'border-orange-400',
      'cancelled': 'border-red-400'
    };
    return colors[slot.status as keyof typeof colors] || 'border-blue-400';
  }

  getCoursCount(jour: number): number {
    return this.slots.filter(s => s.jour_semaine === jour).length;
  }

  getTotalSlots(): number {
    return this.slots.length;
  }

  getSlotsByStatus(status: string): EmploiSlot[] {
    return this.slots.filter(s => s.status === status);
  }

  goBack() {
    this.router.navigate(['/admin/emplois']);
  }
}