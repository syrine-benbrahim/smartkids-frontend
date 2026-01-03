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
    <div class="p-4 sm:p-8 space-y-12 animate-fade-in text-slate-800 dark:text-slate-100">
      
      <!-- Premium Header -->
      <div class="relative group">
        <div class="absolute -inset-1 bg-gradient-to-r from-sea via-tangerine to-blush rounded-[3rem] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
        <div class="relative flex flex-col lg:flex-row items-center justify-between gap-8 p-10 glass dark:bg-slate-800/40 rounded-[3rem] overflow-hidden">
          <div class="flex items-center gap-8 relative z-10">
            <div class="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-indigo-600/30 text-3xl font-black text-white transform group-hover:scale-110 transition-transform">
              📝
            </div>
            <div>
              <h2 class="text-3xl sm:text-4xl font-black tracking-tight mb-2">Gestion des Inscriptions</h2>
              <p class="text-lg text-slate-500 dark:text-slate-400 font-medium">Suivi et validation des dossiers d'admission.</p>
            </div>
          </div>
          
          <div class="flex gap-4 relative z-10">
            <div class="glass dark:bg-slate-700/40 px-8 py-4 rounded-2xl border-white/60 text-center">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">En attente</p>
              <p class="text-3xl font-black text-tangerine">{{ stats().pending }}</p>
            </div>
            <div class="glass dark:bg-slate-700/40 px-8 py-4 rounded-2xl border-white/60 text-center">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
              <p class="text-3xl font-black text-sea">{{ stats().total }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="glass dark:bg-slate-800/40 p-8 rounded-[2.5rem] border-white/60">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          
          <div class="md:col-span-2 space-y-3">
            <label class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recherche</label>
            <div class="relative">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-sea/10 rounded-xl flex items-center justify-center text-sea">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <input type="text" [(ngModel)]="searchQuery" (input)="onSearch()"
                     placeholder="Nom parent ou enfant..."
                     class="w-full pl-16 pr-6 py-4 bg-white/40 dark:bg-slate-700/40 border-2 border-white/60 focus:border-sea/50 rounded-2xl text-sm font-black placeholder-slate-400 outline-none transition-all" />
            </div>
          </div>

          <div class="space-y-3">
            <label class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</label>
            <select [(ngModel)]="filters.statut" (change)="applyFilters()"
                    class="w-full px-6 py-4 bg-white/40 dark:bg-slate-700/40 border-2 border-white/60 focus:border-sea/50 rounded-2xl text-xs font-black uppercase tracking-widest outline-none transition-all cursor-pointer">
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="accepted">Acceptées</option>
              <option value="rejected">Refusées</option>
              <option value="waiting">Liste d'attente</option>
            </select>
          </div>

          <div class="space-y-3">
            <label class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Niveau</label>
            <select [(ngModel)]="filters.niveau" (change)="applyFilters()"
                    class="w-full px-6 py-4 bg-white/40 dark:bg-slate-700/40 border-2 border-white/60 focus:border-sea/50 rounded-2xl text-xs font-black uppercase tracking-widest outline-none transition-all cursor-pointer">
              <option value="">Tous les niveaux</option>
              @for (n of niveaux; track n.value) {
                <option [value]="n.value">{{ n.label }}</option>
              }
            </select>
          </div>
        </div>

        <div class="flex items-center justify-between mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
          <button (click)="resetFilters()"
                  class="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-sea transition-all">
            Réinitialiser les filtres
          </button>
          
          <button (click)="loadInscriptions()" [disabled]="loading()"
                  class="px-8 py-3 bg-sea text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-sea/20 flex items-center gap-3 disabled:opacity-50">
            @if (loading()) {
              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Chargement...
            } @else {
              Actualiser la liste
            }
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="space-y-6">
        @if (loading() && !inscriptions().length) {
          <div class="glass dark:bg-slate-800/40 p-20 rounded-[3rem] text-center">
            <div class="animate-spin w-16 h-16 border-4 border-sea border-t-transparent rounded-full mx-auto mb-6"></div>
            <p class="text-xl font-black uppercase tracking-widest opacity-40">Récupération des dossiers...</p>
          </div>
        } @else if (inscriptions().length === 0) {
          <div class="glass dark:bg-slate-800/40 p-20 rounded-[3rem] text-center opacity-30">
            <div class="text-8xl mb-6">📁</div>
            <p class="text-xl font-black uppercase tracking-widest italic">Aucune inscription trouvée</p>
          </div>
        } @else {
          <!-- Liste des inscriptions en cards -->
          <div class="space-y-4">
            @for (inscription of filteredInscriptions(); track inscription.id) {
              <div (click)="viewDetails(inscription)" 
                   class="group cursor-pointer glass bg-white/40 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-700/50 rounded-[2.5rem] border-2 border-white/60 p-6 transition-all">
                
                <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  <!-- ENFANT / DOSSIER (3 colonnes) -->
                  <div class="md:col-span-3 flex items-center gap-4">
                    <div class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
                      {{ inscription.enfant.prenom.charAt(0) }}{{ inscription.enfant.nom.charAt(0) }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-black text-slate-900 dark:text-white text-base leading-tight mb-1 group-hover:text-sea transition-colors truncate">
                        {{ inscription.enfant.prenom }} {{ inscription.enfant.nom }}
                      </p>
                      <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ formatAge(inscription.enfant.date_naissance) }}</p>
                    </div>
                  </div>

                  <!-- PARENT / CONTACT (3 colonnes) -->
                  <div class="md:col-span-3 min-w-0">
                    <p class="font-black text-slate-800 dark:text-white text-sm leading-tight mb-1 truncate">
                      {{ inscription.parent.prenom }} {{ inscription.parent.nom }}
                    </p>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                      {{ inscription.parent.telephone }}
                    </p>
                  </div>

                  <!-- NIVEAU (2 colonnes) -->
                  <div class="md:col-span-2 flex justify-center">
                    <span class="inline-block px-4 py-2 bg-indigo-500/10 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 whitespace-nowrap">
                      {{ getNiveauLabel(inscription.niveau_souhaite) }}
                    </span>
                  </div>

                  <!-- DATE (2 colonnes) -->
                  <div class="md:col-span-2 text-center">
                    <p class="text-xs font-black text-slate-600 dark:text-slate-300">
                      {{ formatDate(inscription.date_inscription) }}
                    </p>
                  </div>

                  <!-- STATUT + ACTIONS (2 colonnes) -->
                  <div class="md:col-span-2 flex items-center justify-end gap-3">
                    <span class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-current transition-all whitespace-nowrap"
                          [class.text-tangerine]="inscription.statut === 'pending'"
                          [class.bg-tangerine/5]="inscription.statut === 'pending'"
                          [class.text-matcha]="inscription.statut === 'accepted'"
                          [class.bg-matcha/5]="inscription.statut === 'accepted'"
                          [class.text-blush]="inscription.statut === 'rejected'"
                          [class.bg-blush/5]="inscription.statut === 'rejected'"
                          [class.text-indigo-400]="inscription.statut === 'waiting'"
                          [class.bg-indigo-50]="inscription.statut === 'waiting'">
                      {{ getStatutLabel(inscription.statut) }}
                    </span>

                    <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                      <button (click)="viewDetails(inscription); $event.stopPropagation()"
                              class="w-10 h-10 rounded-xl bg-sea/10 text-sea hover:bg-sea hover:text-white transition-all transform hover:scale-110 flex items-center justify-center flex-shrink-0">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </button>
                      @if (inscription.statut === 'pending') {
                        <button (click)="openAcceptModal(inscription); $event.stopPropagation()"
                                class="w-10 h-10 rounded-xl bg-matcha/10 text-matcha hover:bg-matcha hover:text-white transition-all transform hover:scale-110 flex items-center justify-center flex-shrink-0">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                          </svg>
                        </button>
                      }
                    </div>
                  </div>

                </div>
              </div>
            }
          </div>

          <!-- Pagination -->
          <div class="glass bg-white/40 dark:bg-slate-800/40 p-6 rounded-[2.5rem] border-white/60">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div class="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Affichage de <span class="text-indigo-500 font-black">{{ (pagination().current_page - 1) * pagination().per_page + 1 }}</span>
                à <span class="text-indigo-500 font-black">{{ Math.min(pagination().current_page * pagination().per_page, pagination().total) }}</span>
                sur <span class="font-black text-slate-600 tracking-normal">{{ pagination().total }}</span> dossiers
              </div>

              <div class="flex items-center gap-4">
                <button [disabled]="pagination().current_page === 1" (click)="goToPage(pagination().current_page - 1)"
                        class="px-6 py-3 glass hover:bg-white dark:hover:bg-slate-700/50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"/>
                  </svg>
                  Précédent
                </button>
                
                <div class="flex items-center gap-2">
                  @for (page of visiblePages(); track page) {
                    <button (click)="goToPage(page)"
                            class="w-10 h-10 rounded-xl text-[10px] font-black transition-all flex items-center justify-center"
                            [class.bg-indigo-500]="page === pagination().current_page"
                            [class.text-white]="page === pagination().current_page"
                            [class.shadow-lg]="page === pagination().current_page"
                            [class.shadow-indigo-500/20]="page === pagination().current_page"
                            [class.glass]="page !== pagination().current_page"
                            [class.hover:bg-white]="page !== pagination().current_page">
                      {{ page }}
                    </button>
                  }
                </div>
                
                <button [disabled]="pagination().current_page === pagination().last_page" (click)="goToPage(pagination().current_page + 1)"
                        class="px-6 py-3 glass hover:bg-white dark:hover:bg-slate-700/50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed">
                  Suivant
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        }
      </div>


      <!-- Modal Détails - Compact Version -->
      @if (showDetailsModal()) {
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" (click)="closeDetailsModal()">
          <div class="glass bg-white/95 dark:bg-slate-800/95 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden border-2 border-white/60" (click)="$event.stopPropagation()">
            
            <!-- Compact Header -->
            <div class="relative px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-black text-white">Dossier #{{ selectedInscription()?.id }}</h2>
                  <p class="text-white/60 text-[9px] font-bold uppercase tracking-wider">{{ selectedInscription()?.enfant?.prenom }} {{ selectedInscription()?.enfant?.nom }}</p>
                </div>
                <button (click)="closeDetailsModal()" class="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl text-white flex items-center justify-center transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Compact Content -->
            <div class="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
              <div class="space-y-5">
                
                <!-- Enfant & Parent - Side by Side -->
                <div class="grid grid-cols-2 gap-4">
                  <!-- Enfant -->
                  <div class="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                    <div class="flex items-center gap-2 mb-3">
                      <div class="text-lg">👦</div>
                      <h3 class="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">L'Enfant</h3>
                    </div>
                    <p class="font-black text-slate-900 dark:text-white mb-2">{{ selectedInscription()?.enfant?.prenom }} {{ selectedInscription()?.enfant?.nom }}</p>
                    <div class="space-y-1 text-xs">
                      <p class="text-slate-600 dark:text-slate-300"><span class="font-bold">Né(e) le:</span> {{ formatDate(selectedInscription()?.enfant?.date_naissance!) }}</p>
                      <p class="text-slate-600 dark:text-slate-300"><span class="font-bold">Genre:</span> {{ selectedInscription()?.enfant?.genre === 'M' ? 'Garçon' : 'Fille' }}</p>
                      <p class="text-slate-600 dark:text-slate-300"><span class="font-bold">Âge:</span> {{ formatAge(selectedInscription()?.enfant?.date_naissance!) }}</p>
                    </div>
                    @if (selectedInscription()?.enfant?.allergies?.length) {
                      <div class="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-700">
                        <p class="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">Allergies</p>
                        <div class="flex flex-wrap gap-1">
                          @for (allergie of selectedInscription()?.enfant?.allergies; track allergie) {
                            <span class="px-2 py-0.5 bg-blush/20 text-blush rounded text-[9px] font-bold">{{ allergie }}</span>
                          }
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Parent -->
                  <div class="p-4 bg-sea/5 dark:bg-sea/10 rounded-2xl border border-sea/20">
                    <div class="flex items-center gap-2 mb-3">
                      <div class="text-lg">👨‍👩‍👧</div>
                      <h3 class="text-[9px] font-black uppercase tracking-wider text-sea">Le Parent</h3>
                    </div>
                    <p class="font-black text-slate-900 dark:text-white mb-2">{{ selectedInscription()?.parent?.prenom }} {{ selectedInscription()?.parent?.nom }}</p>
                    <div class="space-y-1 text-xs">
                      <p class="text-slate-600 dark:text-slate-300 truncate"><span class="font-bold">Email:</span> {{ selectedInscription()?.parent?.email }}</p>
                      <p class="text-sea font-bold">📞 {{ selectedInscription()?.parent?.telephone }}</p>
                      @if (selectedInscription()?.parent?.profession) {
                        <p class="text-slate-600 dark:text-slate-300"><span class="font-bold">Profession:</span> {{ selectedInscription()?.parent?.profession }}</p>
                      }
                    </div>
                  </div>
                </div>

                <!-- Détails de la demande - Compact Grid -->
                <div class="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-200 dark:border-slate-600">
                  <div class="flex items-center gap-2 mb-3">
                    <div class="text-lg">📄</div>
                    <h3 class="text-[9px] font-black uppercase tracking-wider text-tangerine">Détails de la demande</h3>
                  </div>
                  <div class="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p class="text-slate-400 font-bold text-[9px] uppercase tracking-wider mb-1">Année Scolaire</p>
                      <p class="font-black text-slate-900 dark:text-white">{{ selectedInscription()?.annee_scolaire }}</p>
                    </div>
                    <div>
                      <p class="text-slate-400 font-bold text-[9px] uppercase tracking-wider mb-1">Niveau</p>
                      <p class="font-black text-sea">{{ getNiveauLabel(selectedInscription()?.niveau_souhaite!) }}</p>
                    </div>
                    <div>
                      <p class="text-slate-400 font-bold text-[9px] uppercase tracking-wider mb-1">Date de Dépôt</p>
                      <p class="font-black text-slate-900 dark:text-white">{{ formatDate(selectedInscription()?.date_inscription!) }}</p>
                    </div>
                    <div>
                      <p class="text-slate-400 font-bold text-[9px] uppercase tracking-wider mb-1">Statut</p>
                      <span class="inline-block px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider border border-current"
                            [class.text-tangerine]="selectedInscription()?.statut === 'pending'"
                            [class.bg-tangerine/10]="selectedInscription()?.statut === 'pending'"
                            [class.text-matcha]="selectedInscription()?.statut === 'accepted'"
                            [class.bg-matcha/10]="selectedInscription()?.statut === 'accepted'"
                            [class.text-blush]="selectedInscription()?.statut === 'rejected'"
                            [class.bg-blush/10]="selectedInscription()?.statut === 'rejected'">
                        {{ getStatutLabel(selectedInscription()?.statut!) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Remarques si présentes -->
                @if (selectedInscription()?.remarques) {
                  <div class="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800">
                    <p class="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">📝 Notes & Remarques</p>
                    <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">"{{ selectedInscription()?.remarques }}"</p>
                  </div>
                }
              </div>
            </div>

            <!-- Compact Footer -->
            <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <button (click)="closeDetailsModal()"
                      class="px-6 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border border-slate-200 dark:border-slate-600">
                Fermer
              </button>
              
              @if (selectedInscription()?.statut === 'pending') {
                <button (click)="openAcceptModalFromDetails()"
                        class="px-6 py-2.5 bg-matcha text-white rounded-xl font-black text-[9px] uppercase tracking-wider shadow-lg shadow-matcha/30 hover:scale-105 active:scale-95 transition-all">
                  Traiter le dossier
                </button>
              }
            </div>
          </div>
        </div>
      }

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