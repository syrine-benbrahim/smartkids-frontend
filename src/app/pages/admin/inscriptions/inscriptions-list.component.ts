import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InscriptionsApiService } from '../../../services/inscriptions-api.service';
import { ClassesApiService } from '../../../services/classes-api.service';

@Component({
  selector: 'app-inscriptions-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 sm:p-6">
      <div class="max-w-7xl mx-auto">
        <div class="card mb-8">
          <div class="flex items-center justify-between">
            <h1 class="text-3xl font-black">Liste des inscriptions</h1>
            <button routerLink="/admin/inscriptions/create" class="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all duration-200">
              Nouvelle inscription
            </button>
          </div>
        </div>

        <div *ngIf="loading()" class="card text-center py-12">
          <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600">Chargement des inscriptions...</p>
        </div>

        <div *ngIf="!loading()">
          <div class="card mb-6">
            <div class="flex items-center gap-4">
              <label class="font-bold text-gray-700">Filtrer par classe :</label>
              <select [(ngModel)]="selectedClasseId" (change)="filterByClasse()" class="px-4 py-2 rounded-xl border border-gray-300">
                <option [ngValue]="null">Toutes les classes</option>
                <option *ngFor="let classe of classes()" [ngValue]="classe.id">{{ classe.nom }}</option>
              </select>
            </div>
          </div>

          <div class="card">
            <div *ngIf="inscriptions().length === 0" class="text-center py-8">
              <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <p class="text-gray-500">Aucune inscription trouvée</p>
            </div>

            <div *ngIf="inscriptions().length > 0" class="space-y-4">
              <div 
                *ngFor="let inscription of inscriptions(); trackBy: trackByInscription"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
                [routerLink]="['/admin/inscriptions', inscription.id]"
              >
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center">
                    <span class="text-white font-bold text-sm">
                      {{ getInitials(inscription.enfant?.prenom, inscription.enfant?.nom) }}
                    </span>
                  </div>
                  <div>
                    <div class="text-lg font-bold text-gray-900">
                      {{ inscription.enfant?.prenom }} {{ inscription.enfant?.nom }}
                    </div>
                    <div class="text-sm text-gray-600">
                      {{ inscription.classe?.nom }} • {{ formatDate(inscription.date_inscription) }}
                    </div>
                  </div>
                </div>
                <span [class]="getStatutBadgeClass(inscription.statut)">
                  {{ getStatutLabel(inscription.statut) }}
                </span>
              </div>
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
export class InscriptionsListComponent implements OnInit {
  private api = inject(InscriptionsApiService);
  private classesApi = inject(ClassesApiService);

  loading = signal(true);
  inscriptions = signal<any[]>([]);
  classes = signal<any[]>([]);
  selectedClasseId: number | null = null;

  ngOnInit() {
    this.loadInscriptions();
    this.loadClasses();
  }

  private loadInscriptions() {
    this.loading.set(true);
    this.api.getInscriptions().subscribe({
      next: (response: any) => {
        this.inscriptions.set(response.data || []);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Erreur chargement inscriptions:', err);
        this.inscriptions.set([]);
        this.loading.set(false);
      }
    });
  }

  private loadClasses() {
    this.classesApi.listSimple().subscribe({
      next: (response: any) => {
        this.classes.set(response.data || []);
      },
      error: (err: any) => {
        console.error('Erreur chargement classes:', err);
        this.classes.set([]);
      }
    });
  }

  filterByClasse() {
    if (!this.selectedClasseId) {
      this.loadInscriptions();
      return;
    }
    this.loading.set(true);
    this.api.getInscriptions({ classe_id: this.selectedClasseId }).subscribe({
      next: (response: any) => {
        this.inscriptions.set(response.data || []);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Erreur filtre classe:', err);
        this.inscriptions.set([]);
        this.loading.set(false);
      }
    });
  }

  getStatutBadgeClass(statut: string): string {
    const baseClass = 'px-3 py-1 rounded-full text-xs font-bold';
    switch (statut) {
      case 'en_attente': return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'accepte': return `${baseClass} bg-green-100 text-green-800`;
      case 'refuse': return `${baseClass} bg-red-100 text-red-800`;
      case 'liste_attente': return `${baseClass} bg-blue-100 text-blue-800`;
      default: return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'accepte': return 'Acceptée';
      case 'refuse': return 'Refusée';
      case 'liste_attente': return 'Liste d\'attente';
      default: return statut;
    }
  }

  getInitials(prenom: string = '', nom: string = ''): string {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  trackByInscription(index: number, inscription: any): number {
    return inscription.id;
  }
}