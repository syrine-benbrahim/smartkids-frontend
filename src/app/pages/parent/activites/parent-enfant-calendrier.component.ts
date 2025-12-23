import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ParentActivitesApiService } from '../../../services/parent-activites-api.service';

@Component({
  selector: 'app-parent-enfant-calendrier',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="d-flex align-items-center mb-4">
        <button class="btn btn-outline-secondary me-3" (click)="goBack()">
          ← Retour
        </button>
        <div class="flex-grow-1">
          <h2 class="mb-1">📅 Calendrier des activités</h2>
          @if (enfant()) {
            <p class="text-muted mb-0">
              {{ enfant()!.prenom }} {{ enfant()!.nom }}
            </p>
          }
        </div>
        <div class="btn-group">
          <button class="btn btn-outline-primary" (click)="previousMonth()">
            ← Mois précédent
          </button>
          <button class="btn btn-outline-primary" (click)="nextMonth()">
            Mois suivant →
          </button>
        </div>
      </div>

      <!-- Mois actuel -->
      <div class="card mb-4">
        <div class="card-body text-center">
          <h3>{{ getMoisLabel() }} {{ annee() }}</h3>
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>
      }

      <!-- Calendrier -->
      @if (!loading()) {
        <div class="calendar-grid mb-4">
          @for (day of ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']; track day) {
            <div class="calendar-header">{{ day }}</div>
          }
          
          @for (blank of blanks(); track blank) {
            <div class="calendar-day blank"></div>
          }
          
          @for (day of days(); track day) {
            <div 
              class="calendar-day"
              [class.today]="isToday(day)"
              [class.has-activity]="hasActivity(day)">
              <div class="day-number">{{ day }}</div>
              @if (hasActivity(day)) {
                <div class="activity-indicator">
                  <small>{{ getActivitiesCount(day) }} activité(s)</small>
                </div>
              }
            </div>
          }
        </div>

        <!-- Liste des activités du mois -->
        @if (activites().length > 0) {
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Activités du mois</h5>
            </div>
            <div class="card-body">
              @for (activite of activites(); track activite.id) {
                <div class="activity-item mb-3 p-3 border rounded">
                  <div class="row align-items-center">
                    <div class="col-md-3">
                      <strong>{{ formatDate(activite.date) }}</strong><br>
                      <small class="text-muted">
                        {{ activite.heure_debut }} - {{ activite.heure_fin }}
                      </small>
                    </div>
                    <div class="col-md-5">
                      <h6 class="mb-1">{{ activite.nom }}</h6>
                      @if (activite.type) {
                        <span [class]="'badge bg-' + getTypeBadgeColor(activite.type)">
                          {{ activite.type }}
                        </span>
                      }
                    </div>
                    <div class="col-md-2">
                      <span [class]="'badge bg-' + getStatutBadgeColor(activite.statut_participation)">
                        {{ getStatutLabel(activite.statut_participation) }}
                      </span>
                    </div>
                    <div class="col-md-2 text-end">
                      @if (activite.note_evaluation) {
                        <div class="text-warning">
                          ⭐ {{ activite.note_evaluation }}/10
                        </div>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        } @else {
          <div class="alert alert-info text-center">
            Aucune activité ce mois-ci
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }
    .calendar-header {
      background: #007bff;
      color: white;
      padding: 10px;
      text-align: center;
      font-weight: bold;
      border-radius: 5px;
    }
    .calendar-day {
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 10px;
      min-height: 80px;
      position: relative;
      transition: all 0.3s;
    }
    .calendar-day.blank {
      background: #f8f9fa;
    }
    .calendar-day.today {
      border: 2px solid #007bff;
      background: #e7f3ff;
    }
    .calendar-day.has-activity {
      background: #fff3cd;
      border-color: #ffc107;
    }
    .day-number {
      font-weight: bold;
      font-size: 16px;
    }
    .activity-indicator {
      margin-top: 5px;
      font-size: 11px;
      color: #856404;
    }
    .activity-item {
      background: #f8f9fa;
      transition: all 0.2s;
    }
    .activity-item:hover {
      background: #e9ecef;
      transform: translateX(5px);
    }
  `]
})
export class ParentEnfantCalendrierComponent implements OnInit {
  private api = inject(ParentActivitesApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  enfantId = signal(0);
  enfant = signal<any>(null);
  mois = signal(new Date().getMonth() + 1);
  annee = signal(new Date().getFullYear());
  activites = signal<any[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.enfantId.set(Number(this.route.snapshot.paramMap.get('id')));
    this.loadEnfant();
    this.loadCalendrier();
  }

  loadEnfant() {
    this.api.getEnfants().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const enf = res.data.find(e => e.id === this.enfantId());
          this.enfant.set(enf);
        }
      }
    });
  }

  loadCalendrier() {
    this.loading.set(true);
    // Note: Cette méthode n'existe pas encore dans le service
    // On va utiliser getParticipationsEnfant() et filtrer par mois
    this.api.getParticipationsEnfant(this.enfantId()).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // Filtrer par mois/année
          const filtered = res.data
            .filter((item: any) => {
              const date = new Date(item.activite.date);
              return date.getMonth() + 1 === this.mois() && 
                     date.getFullYear() === this.annee();
            })
            .map((item: any) => ({
              id: item.activite.id,
              nom: item.activite.nom,
              date: item.activite.date,
              heure_debut: item.activite.heure_debut,
              heure_fin: item.activite.heure_fin,
              type: item.activite.type,
              statut_participation: item.participation.statut,
              note_evaluation: item.participation.note_evaluation
            }));

          this.activites.set(filtered);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  previousMonth() {
    if (this.mois() === 1) {
      this.mois.set(12);
      this.annee.update(a => a - 1);
    } else {
      this.mois.update(m => m - 1);
    }
    this.loadCalendrier();
  }

  nextMonth() {
    if (this.mois() === 12) {
      this.mois.set(1);
      this.annee.update(a => a + 1);
    } else {
      this.mois.update(m => m + 1);
    }
    this.loadCalendrier();
  }

  getMoisLabel(): string {
    const mois = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return mois[this.mois() - 1];
  }

  blanks(): number[] {
    const firstDay = new Date(this.annee(), this.mois() - 1, 1).getDay();
    const blankCount = firstDay === 0 ? 6 : firstDay - 1;
    return Array(blankCount).fill(0);
  }

  days(): number[] {
    const daysInMonth = new Date(this.annee(), this.mois(), 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  isToday(day: number): boolean {
    const today = new Date();
    return today.getDate() === day &&
           today.getMonth() + 1 === this.mois() &&
           today.getFullYear() === this.annee();
  }

  hasActivity(day: number): boolean {
    return this.activites().some(a => {
      const date = new Date(a.date);
      return date.getDate() === day;
    });
  }

  getActivitiesCount(day: number): number {
    return this.activites().filter(a => {
      const date = new Date(a.date);
      return date.getDate() === day;
    }).length;
  }

  getTypeBadgeColor(type: string): string {
    const colors: Record<string, string> = {
      'sport': 'success', 'musique': 'info', 'theatre': 'warning',
      'artistique': 'danger', 'educative': 'primary', 'ludique': 'secondary'
    };
    return colors[type] || 'secondary';
  }

  getStatutBadgeColor(statut: string): string {
    const colors: Record<string, string> = {
      'present': 'success', 'absent': 'danger', 'inscrit': 'warning'
    };
    return colors[statut] || 'secondary';
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'present': 'Présent', 'absent': 'Absent', 'inscrit': 'Inscrit'
    };
    return labels[statut] || statut;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  goBack() {
    this.router.navigate(['/parent/activites/enfants']);
  }
}