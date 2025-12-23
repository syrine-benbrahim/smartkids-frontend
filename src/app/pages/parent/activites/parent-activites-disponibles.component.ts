import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChildStateService } from '../../../services/child-state.service';
import {
  ParentActivitesApiService,
  ActiviteDisponible,
  PaiementActivite,
  PaymentQuote
} from '../../../services/parent-activites-api.service';

@Component({
  selector: 'app-parent-activites-disponibles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 sm:p-8 space-y-12 animate-fade-in text-slate-800 dark:text-slate-100">
      
      <!-- Header Section -->
      <div class="relative group">
        <div class="absolute -inset-1 bg-gradient-to-r from-tangerine via-blush to-tangerine rounded-[3rem] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
        <div class="relative flex flex-col lg:flex-row items-center justify-between gap-8 p-10 card-fancy overflow-hidden">
          <div class="flex items-center gap-8 relative z-10">
            <div class="w-20 h-20 bg-gradient-to-br from-tangerine to-blush rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-tangerine/30 text-3xl font-black text-white transform group-hover:rotate-6 transition-transform">
              🎨
            </div>
            <div>
              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
                Activités Disponibles
              </h1>
              <p class="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-lg leading-relaxed">
                Explorez et inscrivez vos enfants aux activités parascolaires passionnantes.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-4 relative z-10">
            <button (click)="showPaiements()" 
                    class="group px-8 py-4 glass dark:bg-slate-800/60 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-white transition-all border-white/40 border flex items-center gap-3">
              <div class="relative">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
                <div *ngIf="paiementsCount() > 0" class="absolute -top-1 -right-1 w-3 h-3 bg-tangerine rounded-full animate-pulse border-2 border-white"></div>
              </div>
              Paiements en attente
              <span *ngIf="paiementsCount() > 0" class="bg-tangerine text-white px-3 py-1 rounded-lg text-[10px]">{{ paiementsCount() }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Filters & Discovery -->
      <div class="glass dark:bg-slate-800/40 rounded-[2.5rem] p-8 border-white/60">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-1.5 h-6 bg-sea rounded-full"></div>
          <h2 class="text-lg font-black uppercase tracking-widest">Rechercher une activité</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div class="md:col-span-4 space-y-2">
            <label class="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mots-clés</label>
            <div class="relative">
              <input type="text" [(ngModel)]="filters.search" (input)="onFilterChange()"
                     placeholder="Ex: Football, Piano..."
                     class="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-12 py-4 focus:ring-2 focus:ring-sea transition-all font-bold placeholder:text-slate-300">
              <svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>

          <div class="md:col-span-3 space-y-2">
            <label class="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thématique</label>
            <select [(ngModel)]="filters.type" (change)="onFilterChange()"
                    class="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-sea transition-all font-bold appearance-none">
              <option value="">Tous les types</option>
              <option value="sport">Sport</option>
              <option value="musique">Musique</option>
              <option value="theatre">Théâtre</option>
              <option value="artistique">Artistique</option>
              <option value="educative">Éducative</option>
              <option value="ludique">Ludique</option>
            </select>
          </div>

          <div class="md:col-span-3 space-y-2">
            <label class="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">À partir du</label>
            <input type="date" [(ngModel)]="filters.date_debut" (change)="onFilterChange()"
                   class="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-sea transition-all font-bold">
          </div>

          <div class="md:col-span-2">
             <div class="flex items-center gap-3 px-4 py-4 mb-1">
                <input type="checkbox" id="placesDisponibles"
                       [(ngModel)]="filters.places_disponibles" (ngModelChange)="onFilterChange()"
                       class="w-5 h-5 text-sea border-none bg-slate-100 rounded-lg focus:ring-sea">
                <label for="placesDisponibles" class="text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer select-none">
                  Dispo uniquement
                </label>
             </div>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="space-y-8">
        <!-- Status Messages -->
        <div *ngIf="loading()" class="flex flex-col justify-center items-center py-20 space-y-4">
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-t-tangerine border-slate-200"></div>
          <span class="text-slate-500 font-black text-xs uppercase tracking-widest animate-pulse">Chargement du catalogue...</span>
        </div>

        <div *ngIf="loadError()" class="p-8 glass bg-blush/5 border-blush/20 rounded-[2.5rem] flex items-center gap-6">
          <div class="w-16 h-16 bg-blush/10 rounded-2xl flex items-center justify-center text-3xl">⚠️</div>
          <div class="flex-1">
            <h3 class="text-lg font-black text-blush uppercase tracking-wider mb-1">Erreur technique</h3>
            <p class="text-blush/80 font-bold mb-4">{{ loadError() }}</p>
            <button (click)="loadActivites()" class="px-6 py-3 bg-blush text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blush/30">
              Réessayer la connexion
            </button>
          </div>
        </div>

        <!-- Result Grid -->
        <div *ngIf="!loading() && activites().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (activite of activites(); track activite.id) {
            <div class="group relative animate-fade-in transition-all">
              <div class="absolute -inset-0.5 bg-gradient-to-r from-sea via-blush to-tangerine rounded-[2.5rem] blur opacity-0 group-hover:opacity-10 scale-[0.98] transition duration-500"></div>
              <div class="relative glass dark:bg-slate-800/40 rounded-[2.5rem] border-white/60 hover:border-white transition-all overflow-hidden flex flex-col h-full">
                
                <!-- Cover Image Area -->
                <div class="relative h-56 overflow-hidden">
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10"></div>
                  <img *ngIf="activite.image_url" [src]="activite.image_url" [alt]="activite.nom"
                       class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                  <div *ngIf="!activite.image_url" class="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                    <span class="text-6xl grayscale opacity-20">🎨</span>
                  </div>

                  <!-- Floating Badges -->
                  <div class="absolute top-6 left-6 z-20 flex flex-col gap-2">
                    <span *ngIf="activite.type" 
                          [class]="getTypeBadgeClass(activite.type)"
                          class="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md">
                      {{ activite.type }}
                    </span>
                  </div>

                  <div class="absolute top-6 right-6 z-20">
                    <div class="bg-white/90 backdrop-blur-md dark:bg-slate-800/90 px-4 py-2 rounded-xl shadow-xl">
                      <span class="text-xl font-black text-tangerine">{{ activite.prix || 0 }}</span>
                      <span class="text-[10px] font-black text-slate-400 uppercase ml-1">DT</span>
                    </div>
                  </div>

                  <div class="absolute bottom-6 left-6 z-20">
                     <h3 class="text-xl font-black text-white group-hover:translate-x-1 transition-transform truncate max-w-[200px]">{{ activite.nom }}</h3>
                  </div>
                </div>

                <!-- Card Body -->
                <div class="p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div class="space-y-4">
                    <p class="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed italic">
                      {{ activite.description || 'Apprentissage, créativité et épanouissement garantis pour ce programme exceptionnel.' }}
                    </p>

                    <div class="grid grid-cols-2 gap-4">
                      <div class="space-y-1">
                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                        <div class="flex items-center gap-2 font-bold text-xs truncate">
                          <svg class="w-4 h-4 text-sea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                          {{ formatShortDate(activite.date_activite) }}
                        </div>
                      </div>
                      <div class="space-y-1">
                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Horaire</p>
                        <div class="flex items-center gap-2 font-bold text-xs">
                          <svg class="w-4 h-4 text-sea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          {{ activite.heure_debut }}
                        </div>
                      </div>
                    </div>

                    <!-- Participants Progress -->
                    <div class="space-y-2 pt-2">
                      <div class="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                         <span class="text-slate-400">Places : {{ activite.participants_count || 0 }} / {{ activite.capacite_max }}</span>
                         <span [class]="getCapaciteColorClass(activite)">{{ getCapacitePercent(activite) | number:'1.0-0' }}%</span>
                      </div>
                      <div class="h-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden p-0">
                        <div [class]="getCapaciteBgClass(activite)" 
                             [style.width.%]="getCapacitePercent(activite)"
                             class="h-full rounded-full transition-all duration-1000"></div>
                      </div>
                    </div>
                  </div>

                  <div class="pt-6 border-t border-slate-100 dark:border-slate-700/50 flex flex-col gap-4">
                    <div *ngIf="activite.educateurs && activite.educateurs.length > 0" class="flex items-center gap-3">
                      <div class="flex -space-x-3">
                        <div *ngFor="let ed of activite.educateurs.slice(0,3)" class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-black">
                          {{ ed.user?.name?.substring(0,1) }}
                        </div>
                      </div>
                      <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Encadré par {{ getEducateursNames(activite.educateurs) }}</span>
                    </div>

                    <button *ngIf="!activite.est_complet" 
                            (click)="openInscriptionModal(activite)"
                            class="w-full py-4 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl group">
                      <span class="group-hover:translate-x-1 inline-block transition-transform">S'inscrire Maintenant ➔</span>
                    </button>
                    
                    <button *ngIf="activite.est_complet" disabled
                            class="w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                      </svg>
                      Complet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading() && activites().length === 0" class="text-center py-20 card-fancy border-dashed border-2 border-white/20">
          <div class="text-6xl mb-6 opacity-30">🔍</div>
          <h3 class="text-2xl font-black mb-2">Aucun résultat</h3>
          <p class="text-slate-500 font-medium">Nous n'avons trouvé aucune activité correspondant à votre recherche.</p>
          <button (click)="resetFilters()" class="mt-8 px-8 py-3 bg-sea text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
            Réinitialiser
          </button>
        </div>
      </div>

      <!-- INSCRIPTION MODAL -->
      <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in group">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" (click)="closeModal()"></div>
        <div class="relative w-full max-w-xl glass dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border-none animate-scale-up">
          
          <div class="bg-gradient-to-r from-sea to-blue-600 p-8 text-white relative h-32 flex items-end">
             <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
             <h3 class="text-2xl font-black tracking-tight relative z-10">Inscription Activité</h3>
             <button (click)="closeModal()" class="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
               </svg>
             </button>
          </div>

          <div class="p-10 space-y-8">
            <div *ngIf="selectedActivite()" class="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-700/50">
              <div class="flex items-center gap-4 mb-3">
                 <span class="text-3xl">🎯</span>
                 <h4 class="text-xl font-black">{{ selectedActivite()!.nom }}</h4>
              </div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {{ formatDate(selectedActivite()!.date_activite) }} • {{ selectedActivite()!.heure_debut }}
              </p>
            </div>

            <div class="space-y-6">
              <div class="space-y-3">
                <label class="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Enfant à inscrire</label>
                <div class="p-6 bg-sea/5 dark:bg-sea/10 border-2 border-sea/20 rounded-3xl flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-sea text-white rounded-xl flex items-center justify-center font-black">
                      {{ childState.selectedChild()?.prenom?.substring(0,1) }}
                    </div>
                    <div>
                      <p class="font-black text-slate-900 dark:text-white">{{ childState.selectedChild()?.prenom }} {{ childState.selectedChild()?.nom }}</p>
                      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ childState.selectedChild()?.classe?.nom || 'Formation Libérée' }}</p>
                    </div>
                  </div>
                   <div *ngIf="!childState.selectedChild()" class="text-blush font-black text-xs animate-pulse">
                     ⚠️ Aucun enfant sélectionné
                   </div>
                </div>
              </div>

              <!-- Payment Flow -->
              <div *ngIf="quote()" class="space-y-4 animate-fade-in">
                 <div class="p-6 bg-matcha/5 dark:bg-matcha/10 border-2 border-matcha/20 rounded-3xl flex justify-between items-center text-matcha">
                    <div class="flex flex-col">
                      <span class="text-[9px] font-black uppercase tracking-widest">Montant à régler</span>
                      <span class="text-3xl font-black leading-none mt-1">{{ quote()!.amount_due }} <small class="text-sm">DT</small></span>
                    </div>
                    <div class="w-12 h-12 bg-matcha rounded-xl flex items-center justify-center text-white shadow-lg shadow-matcha/20 animate-bounce">
                      💰
                    </div>
                 </div>

                 <div class="space-y-3">
                    <label class="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode de paiement</label>
                    <select [(ngModel)]="inscriptionData.methode_paiement" 
                            class="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-6 py-5 focus:ring-2 focus:ring-sea transition-all font-bold appearance-none">
                      <option value="en_ligne">🌐 Paiement en ligne hautement sécurisé</option>
                      <option value="cash">💵 Espèces (Directement à l'accueil)</option>
                      <option value="carte">💳 Carte bancaire (Terminal sur place)</option>
                    </select>
                 </div>
              </div>

              <div class="space-y-3">
                <label class="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes particulières</label>
                <textarea rows="3" [(ngModel)]="inscriptionData.remarques"
                          placeholder="Besoins spécifiques, allergies..."
                          class="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-sea transition-all font-bold placeholder:text-slate-300"></textarea>
              </div>
            </div>

            <div *ngIf="errorMessage()" class="p-4 bg-blush/5 text-blush rounded-2xl border border-blush/20 text-xs font-bold animate-pulse text-center">
               {{ errorMessage() }}
            </div>

            <div class="flex gap-4 pt-4">
              <button (click)="closeModal()" class="flex-1 py-5 glass dark:bg-slate-800 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all">
                Fermer
              </button>
              <button (click)="confirmerInscription()" 
                      [disabled]="!inscriptionData.enfant_id || submitting() || ((selectedActivite()?.prix ?? 0) > 0 && !quote())"
                      class="flex-1 py-5 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-slate-900/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                <span *ngIf="!submitting()">{{ (selectedActivite()?.prix ?? 0) > 0 ? 'Payer & Finaliser' : 'Valider Inscription' }}</span>
                <span *ngIf="submitting()" class="flex items-center justify-center gap-2">
                   <div class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   Analyse...
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- PAIEMENTS MODAL -->
      <div *ngIf="showPaiementsModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in group">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" (click)="closePaiementsModal()"></div>
        <div class="relative w-full max-w-2xl glass dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden animate-scale-up">
           <div class="bg-gradient-to-r from-tangerine to-blush p-10 text-white flex items-end justify-between">
              <h3 class="text-3xl font-black tracking-tight">Finance / Activités</h3>
              <button (click)="closePaiementsModal()" class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all">
                 <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                 </svg>
              </button>
           </div>

           <div class="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div *ngIf="paiements().length === 0" class="text-center py-10 opacity-40">
                <p class="font-black text-xs uppercase tracking-widest">Tout est à jour !</p>
              </div>

              <div *ngFor="let p of paiements()" class="p-8 glass dark:bg-slate-800/40 rounded-3xl border-white/40 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div class="flex items-center gap-6">
                   <div class="w-14 h-14 bg-tangerine/10 rounded-2xl flex items-center justify-center text-2xl">🗳️</div>
                   <div>
                     <h4 class="font-black text-slate-900 dark:text-white text-lg">{{ p.activite.nom }}</h4>
                     <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ p.enfant.prenom }} • {{ formatDate(p.date_echeance) }}</p>
                   </div>
                </div>
                <div class="flex flex-col items-end">
                   <span class="text-2xl font-black text-tangerine">{{ p.montant }} DT</span>
                   <span [class.text-blush]="p.jours_restants < 3" class="text-[9px] font-black uppercase tracking-widest">{{ p.jours_restants }}j restants</span>
                </div>
              </div>
           </div>

           <div class="p-10 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap justify-between items-center gap-6">
              <div>
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Cumulé</p>
                <p class="text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{{ getTotalPaiements() }} <small class="text-sm font-black">DT</small></p>
              </div>
              <button (click)="closePaiementsModal()" class="px-10 py-5 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/20">
                Fermer l'espace financier
              </button>
           </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes scaleUp {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-fade-in { animation: fadeInUp 0.8s ease-out forwards; }
    .animate-scale-up { animation: scaleUp 0.4s ease-out forwards; }
    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
  `]
})
export class ParentActivitesDisponiblesComponent implements OnInit {
  private api = inject(ParentActivitesApiService);
  childState = inject(ChildStateService);
  private router = inject(Router);

  activites = signal<ActiviteDisponible[]>([]);
  paiements = signal<PaiementActivite[]>([]);
  paiementsCount = signal(0);
  loading = signal(false);
  submitting = signal(false);
  showModal = signal(false);
  showPaiementsModal = signal(false);
  selectedActivite = signal<ActiviteDisponible | null>(null);
  errorMessage = signal('');
  loadError = signal('');

  quoteLoading = signal(false);
  quote = signal<PaymentQuote | null>(null);
  quoteError = signal('');

  filters = {
    search: '',
    type: '',
    date_debut: '',
    places_disponibles: true
  };

  inscriptionData = {
    enfant_id: null as number | null,
    remarques: '',
    methode_paiement: 'cash' as 'cash' | 'carte' | 'en_ligne'
  };

  ngOnInit() {
    this.loadActivites();
    this.loadPaiementsEnAttente();
  }

  loadActivites() {
    this.loading.set(true);
    this.loadError.set('');
    this.api.getActivitesDisponibles(this.filters).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.activites.set(res.data || []);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement activités:', err);
        this.loadError.set(err.error?.message || 'Erreur de communication avec le serveur académique.');
        this.loading.set(false);
      }
    });
  }

  loadPaiementsEnAttente() {
    this.api.getPaiementsEnAttente().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.paiements.set(res.data);
          this.paiementsCount.set(res.data.length);
        }
      }
    });
  }

  onFilterChange() {
    this.loadActivites();
  }

  resetFilters() {
    this.filters = { search: '', type: '', date_debut: '', places_disponibles: true };
    this.loadActivites();
  }

  openInscriptionModal(activite: ActiviteDisponible) {
    this.selectedActivite.set(activite);
    this.showModal.set(true);
    this.errorMessage.set('');

    const selectedChild = this.childState.selectedChild();
    this.inscriptionData = {
      enfant_id: selectedChild ? selectedChild.id : null,
      remarques: '',
      methode_paiement: 'cash'
    };

    this.quote.set(null);
    this.quoteError.set('');
    if (selectedChild) this.onEnfantSelected();
  }

  onEnfantSelected() {
    this.quote.set(null);
    this.quoteError.set('');
    const activite = this.selectedActivite();
    const enfantId = this.inscriptionData.enfant_id;
    if (!activite || !enfantId) return;
    if ((activite.prix ?? 0) > 0) this.loadQuote();
  }

  loadQuote() {
    const activite = this.selectedActivite();
    const enfantId = this.inscriptionData.enfant_id;
    if (!activite || !enfantId) return;

    this.quoteLoading.set(true);
    this.quoteError.set('');

    this.api.getQuote(activite.id, enfantId).subscribe({
      next: (res) => {
        if (res.success) {
          this.quote.set(res);
          this.inscriptionData.methode_paiement = 'en_ligne';
        }
        this.quoteLoading.set(false);
      },
      error: (err) => {
        this.quoteError.set(err.error?.message || 'Transaction impossible pour le moment.');
        this.quoteLoading.set(false);
      }
    });
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedActivite.set(null);
  }

  confirmerInscription() {
    const activite = this.selectedActivite();
    const enfantId = this.inscriptionData.enfant_id;
    if (!enfantId || !activite) return;

    this.submitting.set(true);
    this.errorMessage.set('');

    if ((activite.prix ?? 0) > 0) {
      this.api.confirmPayment(activite.id, {
        enfant_id: enfantId,
        methode: this.inscriptionData.methode_paiement,
        remarques: this.inscriptionData.remarques,
        reference: 'SK-PAY-' + Date.now()
      }).subscribe({
        next: (res) => {
          if (res.success) {
            this.closeModal();
            this.loadActivites();
            this.loadPaiementsEnAttente();
          }
          this.submitting.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || "Le paiement n'a pu être traité.");
          this.submitting.set(false);
        }
      });
      return;
    }

    this.api.participerActivite(activite.id, {
      ...this.inscriptionData,
      enfant_id: enfantId
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.closeModal();
          this.loadActivites();
          this.loadPaiementsEnAttente();
        }
        this.submitting.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || "Échec de l'inscription.");
        this.submitting.set(false);
      }
    });
  }

  showPaiements() { this.showPaiementsModal.set(true); }
  closePaiementsModal() { this.showPaiementsModal.set(false); }
  getTotalPaiements(): number { return this.paiements().reduce((sum, p) => sum + p.montant, 0); }

  getTypeBadgeClass(type: string): string {
    const classes: Record<string, string> = {
      'sport': 'bg-matcha/20 text-matcha',
      'musique': 'bg-sea/20 text-sea',
      'theatre': 'bg-blush/20 text-blush',
      'artistique': 'bg-tangerine/20 text-tangerine',
      'educative': 'bg-slate-100 text-slate-500'
    };
    return classes[type] || 'bg-slate-100 text-slate-500';
  }

  getCapacitePercent(activite: ActiviteDisponible): number {
    if (!activite.capacite_max) return 0;
    return ((activite.participants_count || 0) / activite.capacite_max) * 100;
  }

  getCapaciteColorClass(activite: ActiviteDisponible): string {
    const p = this.getCapacitePercent(activite);
    return p > 90 ? 'text-blush' : p > 70 ? 'text-tangerine' : 'text-matcha';
  }

  getCapaciteBgClass(activite: ActiviteDisponible): string {
    const p = this.getCapacitePercent(activite);
    return p > 90 ? 'bg-blush' : p > 70 ? 'bg-tangerine' : 'bg-matcha';
  }

  getEducateursNames(educateurs: any[]): string {
    if (!educateurs) return '';
    return educateurs.map(e => e.user?.name || '').slice(0, 2).join(', ') + (educateurs.length > 2 ? '...' : '');
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  formatShortDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
}