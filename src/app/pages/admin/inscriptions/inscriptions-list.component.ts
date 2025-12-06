// src/app/pages/admin/inscriptions/inscriptions-list.component.ts
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InscriptionAcceptModalComponent } from './inscription-accept-modal.component';
import { 
  InscriptionAdminService,
  Inscription,
  InscriptionStatut
} from '../../../services/inscription-admin.service';

@Component({
  selector: 'app-inscriptions-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, InscriptionAcceptModalComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Gestion des Inscriptions
            </h1>
            <p class="text-gray-600 mt-1">Traitement des demandes d'inscription</p>
          </div>
          
          <!-- Stats rapides -->
          <div class="flex gap-4">
            <div class="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg px-6 py-3">
              <p class="text-sm text-gray-600 font-medium">En attente</p>
              <p class="text-2xl font-bold text-yellow-600">{{ stats().pending }}</p>
            </div>
            <div class="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg px-6 py-3">
              <p class="text-sm text-gray-600 font-medium">Total</p>
              <p class="text-2xl font-bold text-indigo-600">{{ stats().total }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="bg-white/40 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <!-- Filtre Statut -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Statut</label>
            <select 
              [(ngModel)]="filters.statut"
              (change)="applyFilters()"
              class="w-full px-4 py-2.5 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="accepted">Acceptées</option>
              <option value="rejected">Refusées</option>
              <option value="waiting">Liste d'attente</option>
            </select>
          </div>

          <!-- Filtre Niveau -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Niveau</label>
            <select 
              [(ngModel)]="filters.niveau"
              (change)="applyFilters()"
              class="w-full px-4 py-2.5 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
              <option value="">Tous les niveaux</option>
              <option *ngFor="let n of niveaux" [value]="n.value">{{ n.label }}</option>
            </select>
          </div>

          <!-- Recherche -->
          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Recherche</label>
            <div class="relative">
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                (input)="onSearch()"
                placeholder="Nom parent ou enfant..."
                class="w-full px-4 py-2.5 pl-10 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
              <svg class="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Actions groupées -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
          <button 
            (click)="resetFilters()"
            class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-xl transition-all">
            Réinitialiser les filtres
          </button>
          
          <button 
            (click)="loadInscriptions()"
            [disabled]="loading()"
            class="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
            <span *ngIf="!loading()">Actualiser</span>
            <span *ngIf="loading()" class="flex items-center gap-2">
              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Chargement...
            </span>
          </button>
        </div>
      </div>

      <!-- Loading state -->
      <div *ngIf="loading() && !inscriptions().length" class="flex items-center justify-center py-12">
        <div class="text-center">
          <svg class="animate-spin w-12 h-12 text-indigo-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600 font-medium">Chargement des inscriptions...</p>
        </div>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading() && !inscriptions().length" class="bg-white/40 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl p-12 text-center">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
        </svg>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Aucune inscription trouvée</h3>
        <p class="text-gray-600">Aucune demande d'inscription ne correspond à vos critères de recherche.</p>
      </div>

      <!-- Table des inscriptions -->
      <div *ngIf="!loading() && inscriptions().length > 0" class="bg-white/40 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl overflow-hidden">
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-white/20">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Enfant</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Parent</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Niveau</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Statut</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/20">
              <tr *ngFor="let inscription of filteredInscriptions()" 
                  class="hover:bg-white/30 transition-colors cursor-pointer"
                  (click)="viewDetails(inscription)">
                
                <!-- Enfant -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {{ inscription.enfant.prenom.charAt(0) }}{{ inscription.enfant.nom.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-semibold text-gray-800">{{ inscription.enfant.prenom }} {{ inscription.enfant.nom }}</p>
                      <p class="text-sm text-gray-600">{{ formatAge(inscription.enfant.date_naissance) }}</p>
                    </div>
                  </div>
                </td>

                <!-- Parent -->
                <td class="px-6 py-4">
                  <p class="font-medium text-gray-800">{{ inscription.parent.prenom }} {{ inscription.parent.nom }}</p>
                  <p class="text-sm text-gray-600">{{ inscription.parent.telephone }}</p>
                </td>

                <!-- Niveau -->
                <td class="px-6 py-4">
                  <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {{ getNiveauLabel(inscription.niveau_souhaite) }}
                  </span>
                </td>

                <!-- Date -->
                <td class="px-6 py-4">
                  <p class="text-sm text-gray-700">{{ formatDate(inscription.date_inscription) }}</p>
                </td>

                <!-- Statut -->
                <td class="px-6 py-4">
                  <span [ngClass]="getStatutClass(inscription.statut)" 
                        class="px-3 py-1 rounded-full text-sm font-semibold border">
                    {{ getStatutLabel(inscription.statut) }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <button 
                      (click)="viewDetails(inscription); $event.stopPropagation()"
                      class="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
                      title="Voir détails">
                      <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>
                    
                    <button 
                      *ngIf="inscription.statut === 'pending'"
                      (click)="openAcceptModal(inscription); $event.stopPropagation()"
                      class="p-2 hover:bg-green-100 rounded-lg transition-colors"
                      title="Traiter">
                      <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-white/20 flex items-center justify-between">
          <div class="text-sm text-gray-600">
            Affichage de <span class="font-semibold">{{ (pagination().current_page - 1) * pagination().per_page + 1 }}</span>
            à <span class="font-semibold">{{ Math.min(pagination().current_page * pagination().per_page, pagination().total) }}</span>
            sur <span class="font-semibold">{{ pagination().total }}</span> inscriptions
          </div>

          <div class="flex gap-2">
            <button 
              [disabled]="pagination().current_page === 1"
              (click)="goToPage(pagination().current_page - 1)"
              class="px-4 py-2 bg-white/50 hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all">
              Précédent
            </button>
            
            <button 
              *ngFor="let page of visiblePages()"
              [class.bg-indigo-600]="page === pagination().current_page"
              [class.text-white]="page === pagination().current_page"
              [class.bg-white/50]="page !== pagination().current_page"
              (click)="goToPage(page)"
              class="px-4 py-2 rounded-lg hover:bg-indigo-100 transition-all">
              {{ page }}
            </button>
            
            <button 
              [disabled]="pagination().current_page === pagination().last_page"
              (click)="goToPage(pagination().current_page + 1)"
              class="px-4 py-2 bg-white/50 hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all">
              Suivant
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Détails -->
      <div *ngIf="showDetailsModal()" 
           class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
           (click)="closeDetailsModal()">
        <div class="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" 
             (click)="$event.stopPropagation()">
          
          <!-- Header modal -->
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
            <h2 class="text-xl font-bold text-white">Détail de l'inscription</h2>
            <button (click)="closeDetailsModal()" class="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Contenu modal -->
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div *ngIf="selectedInscription()" class="space-y-6">
              
              <!-- Infos générales -->
              <div class="bg-gray-50 rounded-2xl p-6">
                <h3 class="font-bold text-lg mb-4">Informations générales</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-600">Statut</p>
                    <span [ngClass]="getStatutClass(selectedInscription()!.statut)" 
                          class="inline-block px-3 py-1 rounded-full text-sm font-semibold border mt-1">
                      {{ getStatutLabel(selectedInscription()!.statut) }}
                    </span>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Année scolaire</p>
                    <p class="font-semibold">{{ selectedInscription()!.annee_scolaire }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Niveau souhaité</p>
                    <p class="font-semibold">{{ getNiveauLabel(selectedInscription()!.niveau_souhaite) }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Date d'inscription</p>
                    <p class="font-semibold">{{ formatDate(selectedInscription()!.date_inscription) }}</p>
                  </div>
                </div>
              </div>

              <!-- Infos enfant -->
              <div class="bg-blue-50 rounded-2xl p-6">
                <h3 class="font-bold text-lg mb-4">Informations de l'enfant</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-600">Nom complet</p>
                    <p class="font-semibold">{{ selectedInscription()!.enfant.prenom }} {{ selectedInscription()!.enfant.nom }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Date de naissance</p>
                    <p class="font-semibold">{{ formatDate(selectedInscription()!.enfant.date_naissance) }} ({{ formatAge(selectedInscription()!.enfant.date_naissance) }})</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Genre</p>
                    <p class="font-semibold">{{ selectedInscription()!.enfant.genre === 'M' ? 'Garçon' : 'Fille' }}</p>
                  </div>
                  <div *ngIf="selectedInscription()!.enfant.allergies?.length">
                    <p class="text-sm text-gray-600">Allergies</p>
                    <div class="flex flex-wrap gap-1 mt-1">
                      <span *ngFor="let allergie of selectedInscription()!.enfant.allergies" 
                            class="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">
                        {{ allergie }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Infos parent -->
              <div class="bg-green-50 rounded-2xl p-6">
                <h3 class="font-bold text-lg mb-4">Informations du parent</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-600">Nom complet</p>
                    <p class="font-semibold">{{ selectedInscription()!.parent.prenom }} {{ selectedInscription()!.parent.nom }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Email</p>
                    <p class="font-semibold">{{ selectedInscription()!.parent.email }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Téléphone</p>
                    <p class="font-semibold">{{ selectedInscription()!.parent.telephone }}</p>
                  </div>
                  <div *ngIf="selectedInscription()!.parent.profession">
                    <p class="text-sm text-gray-600">Profession</p>
                    <p class="font-semibold">{{ selectedInscription()!.parent.profession }}</p>
                  </div>
                </div>
              </div>

              <!-- Remarques -->
              <div *ngIf="selectedInscription()!.remarques" class="bg-purple-50 rounded-2xl p-6">
                <h3 class="font-bold text-lg mb-2">Remarques du parent</h3>
                <p class="text-gray-700">{{ selectedInscription()!.remarques }}</p>
              </div>
            </div>
          </div>

          <!-- Actions du modal -->
          <div class="px-6 py-4 bg-gray-50 border-t flex items-center justify-end gap-3">
            <button 
              (click)="closeDetailsModal()"
              class="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all">
              Fermer
            </button>
            
            <button 
              *ngIf="selectedInscription()?.statut === 'pending'"
              (click)="openAcceptModalFromDetails()"
              class="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
              Traiter l'inscription
            </button>
          </div>
        </div>
      </div>

      <!-- Modal d'acceptation/traitement -->
      <app-inscription-accept-modal
        [show]="showAcceptModal()"
        [inscriptionData]="inscriptionToAccept()"
        (closed)="closeAcceptModal()"
        (success)="onInscriptionProcessed($event)">
      </app-inscription-accept-modal>

    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class InscriptionsListComponent implements OnInit {
  private service = inject(InscriptionAdminService);
  
  inscriptions = signal<Inscription[]>([]);
  loading = signal(false);
  searchQuery = signal('');
  selectedInscription = signal<Inscription | null>(null);
  showDetailsModal = signal(false);
  showAcceptModal = signal(false);
  inscriptionToAccept = signal<Inscription | null>(null);
  
  filters = {
    statut: '',
    niveau: '',
    page: 1,
    per_page: 20
  };

  pagination = signal({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  });

  stats = signal({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    waiting: 0
  });

  niveaux = InscriptionAdminService.getNiveauxDisponibles();
  Math = Math;

  filteredInscriptions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.inscriptions();

    return this.inscriptions().filter(i => {
      const parentName = `${i.parent.prenom} ${i.parent.nom}`.toLowerCase();
      const enfantName = `${i.enfant.prenom} ${i.enfant.nom}`.toLowerCase();
      return parentName.includes(query) || enfantName.includes(query);
    });
  });

  ngOnInit() {
    this.loadInscriptions();
  }

  loadInscriptions() {
    this.loading.set(true);
    
    this.service.getInscriptions(this.filters).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.inscriptions.set(response.data.data);
          this.pagination.set({
            current_page: response.data.current_page,
            last_page: response.data.last_page,
            per_page: response.data.per_page,
            total: response.data.total
          });
          this.updateStats(response.data.data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement inscriptions:', err);
        this.loading.set(false);
      }
    });
  }

  updateStats(inscriptions: Inscription[]) {
    const stats = {
      total: inscriptions.length,
      pending: inscriptions.filter(i => i.statut === 'pending').length,
      accepted: inscriptions.filter(i => i.statut === 'accepted').length,
      rejected: inscriptions.filter(i => i.statut === 'rejected').length,
      waiting: inscriptions.filter(i => i.statut === 'waiting').length
    };
    this.stats.set(stats);
  }

  applyFilters() {
    this.filters.page = 1;
    this.loadInscriptions();
  }

  resetFilters() {
    this.filters = {
      statut: '',
      niveau: '',
      page: 1,
      per_page: 20
    };
    this.searchQuery.set('');
    this.loadInscriptions();
  }

  onSearch() {
    // La recherche est gérée par le computed filteredInscriptions
  }

  goToPage(page: number) {
    this.filters.page = page;
    this.loadInscriptions();
  }

  visiblePages(): number[] {
    const current = this.pagination().current_page;
    const last = this.pagination().last_page;
    const pages: number[] = [];
    
    const start = Math.max(1, current - 2);
    const end = Math.min(last, current + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  viewDetails(inscription: Inscription) {
    this.selectedInscription.set(inscription);
    this.showDetailsModal.set(true);
  }

  closeDetailsModal() {
    this.showDetailsModal.set(false);
    this.selectedInscription.set(null);
  }

  openAcceptModal(inscription: Inscription) {
    this.inscriptionToAccept.set(inscription);
    this.showAcceptModal.set(true);
  }

  // 🆕 MÉTHODE CORRIGÉE pour ouvrir la modal depuis le modal de détails
    openAcceptModalFromDetails() {
    const insc = this.selectedInscription();
    if (insc) {
      this.closeDetailsModal(); // Fermer d'abord la modal de détails
      setTimeout(() => {
        this.openAcceptModal(insc); // Puis ouvrir la modal d'acceptation
      }, 150); // Petit délai pour éviter conflits d'animation
    }
  }

  closeAcceptModal() {
    this.showAcceptModal.set(false);
    this.inscriptionToAccept.set(null);
  }

  onInscriptionProcessed(data: any) {
    // Recharger la liste après traitement
    this.loadInscriptions();
  }

  // Helpers
  formatAge(dateNaissance: string): string {
    return InscriptionAdminService.formatAge(dateNaissance);
  }

  formatDate(dateString: string): string {
    return InscriptionAdminService.formatDate(dateString);
  }

  getStatutLabel(statut: InscriptionStatut): string {
    return InscriptionAdminService.getStatutLabel(statut);
  }

  getStatutClass(statut: InscriptionStatut): string {
    return InscriptionAdminService.getStatutClass(statut);
  }

  getNiveauLabel(niveau: string | number): string {
    return InscriptionAdminService.getNiveauLabelShort(niveau);
  }
}