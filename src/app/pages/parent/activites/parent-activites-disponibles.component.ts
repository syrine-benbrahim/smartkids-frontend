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
    <div class="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4 sm:p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="relative mb-8">
          <div class="card relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-purple-500/10"></div>
            
            <div class="relative flex flex-col lg:flex-row items-center justify-between gap-6">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a4 4 0 014 4v1a2 2 0 002 2 2 2 0 002-2v-1a4 4 0 014-4h1m-1-4a2 2 0 012 2v3a2 2 0 01-2 2h-1a4 4 0 00-4 4v1a2 2 0 01-2 2 2 2 0 01-2-2v-1a4 4 0 00-4-4H6a2 2 0 01-2-2V7a2 2 0 012-2 2 2 0 012 2v1a4 4 0 004 4z"/>
                  </svg>
                </div>
                <div>
                  <h1 class="text-3xl font-black text-gray-800 tracking-tight">
                    Activités disponibles
                  </h1>
                  <p class="text-gray-600 font-medium">
                    Inscrivez vos enfants aux activités
                  </p>
                </div>
              </div>
              
              <button 
                class="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-orange-200 hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                (click)="showPaiements()">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
                Paiements en attente
                @if (paiementsCount() > 0) {
                  <span class="bg-white text-orange-600 px-3 py-1 rounded-full text-sm font-bold">{{ paiementsCount() }}</span>
                }
              </button>
            </div>
          </div>
        </div>

        <!-- Filtres -->
        <div class="card mb-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800">Filtres et recherche</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Recherche -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Recherche</label>
              <input
                class="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                [(ngModel)]="filters.search"
                placeholder="Nom d'activité..."
                (input)="onFilterChange()"
              />
            </div>

            <!-- Type -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Type</label>
              <select
                class="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                [(ngModel)]="filters.type"
                (change)="onFilterChange()"
              >
                <option value="">Tous les types</option>
                <option value="sport">Sport</option>
                <option value="musique">Musique</option>
                <option value="theatre">Théâtre</option>
                <option value="artistique">Artistique</option>
                <option value="educative">Éducative</option>
                <option value="ludique">Ludique</option>
              </select>
            </div>

            <!-- Date -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Date début</label>
              <input
                type="date"
                class="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                [(ngModel)]="filters.date_debut"
                (change)="onFilterChange()"
              />
            </div>

            <!-- Places disponibles -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">&nbsp;</label>
              <div class="flex items-center h-10 px-4 rounded-xl border-2 border-gray-200 bg-white">
                <input 
                  type="checkbox" 
                  id="placesDisponibles"
                  [(ngModel)]="filters.places_disponibles"
                  (ngModelChange)="onFilterChange()"
                  class="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500">
                <label class="ml-2 text-sm text-gray-700 font-medium" for="placesDisponibles">
                  Places disponibles uniquement
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading -->
        @if (loading()) {
          <div class="text-center py-12">
            <div class="inline-flex items-center gap-3">
              <div class="w-6 h-6 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin"></div>
              <span class="text-gray-600 font-medium">Chargement des activités...</span>
            </div>
          </div>
        }

        <!-- Error Alert -->
        @if (loadError()) {
          <div class="card bg-red-50 border-red-200 mb-6">
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
              <p class="text-red-700 font-medium flex-1">{{ loadError() }}</p>
              <button class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors" (click)="loadActivites()">Réessayer</button>
            </div>
          </div>
        }

        <!-- Liste des activités -->
        @if (!loading() && activites().length > 0) {
          <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            @for (activite of activites(); track activite.id) {
              <div class="card hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
                
                <!-- Image ou placeholder -->
                <div class="h-48 overflow-hidden rounded-2xl mb-4 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <img *ngIf="activite.image_url" 
                       [src]="activite.image_url" 
                       [alt]="activite.nom"
                       class="w-full h-full object-cover">
                  <div *ngIf="!activite.image_url" class="text-center">
                    <svg class="w-12 h-12 text-pink-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a4 4 0 014 4v1a2 2 0 002 2 2 2 0 002-2v-1a4 4 0 014-4h1m-1-4a2 2 0 012 2v3a2 2 0 01-2 2h-1a4 4 0 00-4 4v1a2 2 0 01-2 2 2 2 0 01-2-2v-1a4 4 0 00-4-4H6a2 2 0 01-2-2V7a2 2 0 012-2 2 2 0 012 2v1a4 4 0 004 4z"/>
                    </svg>
                    <p class="text-pink-600 font-medium">{{ activite.type || 'Activité' }}</p>
                  </div>
                </div>

                <!-- Contenu -->
                <div class="space-y-4">
                  <!-- Titre et type -->
                  <div class="flex items-start justify-between gap-2">
                    <h3 class="text-xl font-bold text-gray-800 leading-tight">{{ activite.nom }}</h3>
                    @if (activite.type) {
                      <span class="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 whitespace-nowrap">
                        {{ activite.type }}
                      </span>
                    }
                  </div>

                  <!-- Description -->
                  <p *ngIf="activite.description" class="text-gray-600 text-sm line-clamp-2">
                    {{ activite.description }}
                  </p>

                  <!-- Détails -->
                  <div class="space-y-2">
                    <div class="flex items-center gap-2 text-sm text-gray-700">
                      <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <span class="font-medium">{{ formatDate(activite.date_activite) }}</span>
                    </div>
                    
                    <div class="flex items-center gap-2 text-sm text-gray-700">
                      <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span class="font-medium">{{ activite.heure_debut }} - {{ activite.heure_fin }}</span>
                    </div>

                    @if (activite.capacite_max) {
                      <div class="flex items-center gap-2 text-sm text-gray-700">
                        <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                        <span class="font-medium">{{ activite.participants_count || 0 }} / {{ activite.capacite_max }} participants</span>
                        <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            [class.bg-green-500]="!activite.est_complet"
                            [class.bg-red-500]="activite.est_complet"
                            [style.width.%]="getCapacitePercent(activite)"
                            class="h-full transition-all">
                          </div>
                        </div>
                      </div>
                    }

                    @if (activite.prix && activite.prix > 0) {
                      <div class="flex items-center gap-2 text-sm text-gray-700">
                        <svg class="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                        </svg>
                        <span class="font-medium">{{ activite.prix }} DT</span>
                      </div>
                    } @else {
                      <div class="flex items-center gap-2 text-sm text-green-600">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        <span class="font-medium">Gratuit</span>
                      </div>
                    }

                    @if (activite.educateurs && activite.educateurs.length > 0) {
                      <div class="flex items-center gap-2 text-sm text-gray-700">
                        <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        <span class="font-medium">{{ getEducateursNames(activite.educateurs) }}</span>
                      </div>
                    }
                  </div>

                  <!-- Actions -->
                  <div class="pt-4 border-t border-gray-200">
                    @if (activite.est_complet) {
                      <button class="w-full bg-gray-300 text-gray-600 px-4 py-3 rounded-xl font-bold text-sm cursor-not-allowed" disabled>
                        🚫 Complet
                      </button>
                    } @else {
                      <button 
                        class="w-full bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                        (click)="openInscriptionModal(activite)">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                        Inscrire un enfant
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Empty state -->
        @if (!loading() && activites().length === 0) {
          <div class="card text-center py-12">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a4 4 0 014 4v1a2 2 0 002 2 2 2 0 002-2v-1a4 4 0 014-4h1m-1-4a2 2 0 012 2v3a2 2 0 01-2 2h-1a4 4 0 00-4 4v1a2 2 0 01-2 2 2 2 0 01-2-2v-1a4 4 0 00-4-4H6a2 2 0 01-2-2V7a2 2 0 012-2 2 2 0 012 2v1a4 4 0 004 4z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">Aucune activité disponible</h3>
            <p class="text-gray-600">Essayez de modifier vos filtres</p>
          </div>
        }

        <!-- Modal d'inscription -->
        @if (showModal()) {
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-2xl font-bold text-gray-800">Inscrire un enfant</h3>
                <button type="button" class="text-gray-400 hover:text-gray-600" (click)="closeModal()">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div class="space-y-4">
                @if (selectedActivite()) {
                  <div class="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 border-2 border-pink-200">
                    <strong class="text-lg font-bold text-gray-800">{{ selectedActivite()!.nom }}</strong>
                    <p class="text-sm text-gray-600 mt-1">
                      {{ formatDate(selectedActivite()!.date_activite) }} • 
                      {{ selectedActivite()!.heure_debut }} - {{ selectedActivite()!.heure_fin }}
                    </p>
                  </div>
                }

                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Enfant sélectionné</label>
                  <div class="px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 flex items-center justify-between">
                    <span class="font-bold text-gray-800">
                      {{ childState.selectedChild()?.prenom }} {{ childState.selectedChild()?.nom }}
                    </span>
                    <span class="text-xs font-bold px-2 py-1 rounded bg-pink-100 text-pink-700">
                      {{ childState.selectedChild()?.classe?.nom || 'Sans classe' }}
                    </span>
                  </div>
                  <p *ngIf="!childState.selectedChild()" class="text-sm text-red-500 mt-1">
                    Veuillez sélectionner un enfant dans la barre de navigation.
                  </p>
                </div>

                <!-- Loading Quote -->
                @if (quoteLoading()) {
                  <div class="flex items-center gap-3 text-pink-600 font-medium animate-pulse">
                     <span class="inline-block w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></span>
                     Calcul du montant...
                  </div>
                }

                <!-- Quote Error -->
                @if (quoteError()) {
                  <div class="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                     <p class="text-red-700 font-medium">{{ quoteError() }}</p>
                  </div>
                }

                <!-- Quote Display & Payment Method -->
                @if (quote()) {
                  <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                    <div class="flex justify-between items-center mb-2">
                       <span class="text-green-800 font-bold">Montant à payer</span>
                       <span class="text-2xl font-black text-green-600">{{ quote()!.amount_due }} {{ quote()!.currency }}</span>
                    </div>
                    <p class="text-sm text-green-700">
                      Pour : {{ quote()!.details.activite_nom }}
                    </p>
                  </div>

                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">Méthode de paiement *</label>
                    <select class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100" [(ngModel)]="inscriptionData.methode_paiement" required>
                      <option value="en_ligne">🌐 Paiement en ligne (Immédiat)</option>
                      <option value="cash">💵 Espèces (Sur place)</option>
                      <option value="carte">💳 Carte bancaire (Sur place)</option>
                    </select>
                  </div>
                } @else if (selectedActivite()?.prix && (selectedActivite()?.prix ?? 0) > 0 && !quoteLoading() && !quoteError() && inscriptionData.enfant_id) {
                   <!-- Fallback if quote not loaded yet but child selected -->
                   <div class="text-sm text-gray-500">
                     Veuillez sélectionner un enfant pour voir le montant.
                   </div>
                }

                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Remarques (optionnel)</label>
                  <textarea 
                    class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                    rows="3"
                    [(ngModel)]="inscriptionData.remarques"
                    placeholder="Allergies, besoins spéciaux..."></textarea>
                </div>

                @if (errorMessage()) {
                  <div class="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <p class="text-red-700 font-medium">{{ errorMessage() }}</p>
                  </div>
                }

                <div class="flex gap-4 pt-4">
                  <button class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-2xl font-bold transition-colors" (click)="closeModal()">Annuler</button>
                  <button 
                    class="flex-1 bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl"
                     [disabled]="!inscriptionData.enfant_id || submitting() || ((selectedActivite()?.prix ?? 0) > 0 && !quote())"
                    (click)="confirmerInscription()">
                    @if (submitting()) {
                      <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    }
                    {{ (selectedActivite()?.prix ?? 0) > 0 ? 'Confirmer et Payer' : 'Confirmer l\'inscription' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Modal paiements -->
        @if (showPaiementsModal()) {
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                  Paiements en attente
                </h3>
                <button type="button" class="text-gray-400 hover:text-gray-600" (click)="closePaiementsModal()">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div class="space-y-4">
                @if (paiements().length === 0) {
                  <div class="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
                    <svg class="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-green-700 font-medium text-lg">Aucun paiement en attente</p>
                  </div>
                } @else {
                  @for (paiement of paiements(); track paiement.id) {
                    <div class="card border-2 border-orange-200">
                      <div class="flex justify-between items-start mb-4">
                        <div>
                          <h6 class="text-lg font-bold text-gray-800 mb-1">{{ paiement.activite.nom }}</h6>
                          <p class="text-sm text-gray-600">
                            Enfant: {{ paiement.enfant.prenom }} {{ paiement.enfant.nom }}
                          </p>
                        </div>
                        <span class="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-4 py-2 rounded-xl font-bold text-lg">
                          {{ paiement.montant }} DT
                        </span>
                      </div>
                      <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div>
                          <p class="text-xs text-gray-500 mb-1">Échéance</p>
                          <p class="font-bold text-gray-800">{{ formatDate(paiement.date_echeance) }}</p>
                        </div>
                        <div>
                          <p class="text-xs text-gray-500 mb-1">Jours restants</p>
                          <p [class.text-red-600]="paiement.jours_restants < 3" [class.text-gray-800]="paiement.jours_restants >= 3" class="font-bold">
                            {{ paiement.jours_restants }} jours
                          </p>
                        </div>
                      </div>
                    </div>
                  }
                  <div class="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6">
                    <div class="flex justify-between items-center">
                      <span class="text-lg font-bold text-gray-800">Total à payer:</span>
                      <span class="text-2xl font-black text-blue-600">{{ getTotalPaiements() }} DT</span>
                    </div>
                  </div>
                }
              </div>
              <div class="pt-6">
                <button class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-2xl font-bold transition-colors" (click)="closePaiementsModal()">Fermer</button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .card {
      @apply bg-white rounded-3xl shadow-lg border border-gray-200 p-6;
    }
    
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
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

  // Payment specifics
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
          this.activites.set(res.data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement activités:', err);
        let backendError = 'Erreur technique inconnue';

        if (err.error instanceof ProgressEvent) {
          backendError = 'Erreur de connexion au serveur';
        } else if (typeof err.error === 'string') {
          // Si c'est du HTML (page d'erreur Laravel), on essaie d'extraire le message d'exception
          if (err.error.includes('class="exception_message"')) { // Laravel ignition
            const match = err.error.match(/<span class="exception_message"[^>]*>(.*?)<\/span>/);
            backendError = match ? match[1] : 'Erreur interne serveur (voir logs)';
          } else if (err.error.includes('trace-message')) { // Older Laravel
            const match = err.error.match(/<div class="trace-message">(.*?)<\/div>/);
            backendError = match ? match[1] : 'Erreur interne serveur';
          } else {
            backendError = err.error.substring(0, 200) + '...'; // Affiche le début du HTML
          }
        } else if (err.error && typeof err.error === 'object') {
          backendError = err.error.message || err.error.error || JSON.stringify(err.error);
        }

        this.loadError.set(backendError);
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

  openInscriptionModal(activite: ActiviteDisponible) {
    this.selectedActivite.set(activite);
    this.showModal.set(true);
    this.errorMessage.set('');

    // Use global selected child
    const selectedChild = this.childState.selectedChild();
    this.inscriptionData = {
      enfant_id: selectedChild ? selectedChild.id : null,
      remarques: '',
      methode_paiement: 'cash'
    };

    this.quote.set(null);
    this.quoteError.set('');

    // Auto-load quote if child is selected
    if (selectedChild) {
      this.onEnfantSelected();
    }
  }

  onEnfantSelected() {
    this.quote.set(null);
    this.quoteError.set('');

    if (!this.selectedActivite() || !this.inscriptionData.enfant_id) return;

    // Si l'activité est payante, on charge le devis
    if ((this.selectedActivite()?.prix ?? 0) > 0) {
      this.loadQuote();
    }
  }

  loadQuote() {
    if (!this.selectedActivite() || !this.inscriptionData.enfant_id) return;

    this.quoteLoading.set(true);
    this.quoteError.set('');

    this.api.getQuote(this.selectedActivite()!.id, this.inscriptionData.enfant_id).subscribe({
      next: (res) => {
        if (res.success) {
          this.quote.set(res);
          // Si c'est payant, on force 'en_ligne' par défaut ou on laisse le choix
          this.inscriptionData.methode_paiement = 'en_ligne';
        }
        this.quoteLoading.set(false);
      },
      error: (err) => {
        this.quoteError.set(err.error?.message || 'Erreur lors du chargement du devis');
        this.quoteLoading.set(false);
      }
    });
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedActivite.set(null);
  }

  confirmerInscription() {
    if (!this.inscriptionData.enfant_id || !this.selectedActivite()) return;

    this.submitting.set(true);
    this.errorMessage.set('');

    if ((this.selectedActivite()?.prix ?? 0) > 0) {
      // Flow paiement
      this.api.confirmPayment(this.selectedActivite()!.id, {
        enfant_id: this.inscriptionData.enfant_id!,
        methode: this.inscriptionData.methode_paiement,
        remarques: this.inscriptionData.remarques,
        reference: 'MANUAL-' + Date.now() // Ou vide si géré ailleurs
      }).subscribe({
        next: (res) => {
          if (res.success) {
            alert('✅ Inscription et paiement validés !');
            this.closeModal();
            this.loadActivites();
            this.loadPaiementsEnAttente();
          }
          this.submitting.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Erreur paiement');
          this.submitting.set(false);
        }
      });
      return;
    }

    // Flow gratuit standard
    this.api.participerActivite(this.selectedActivite()!.id, {
      ...this.inscriptionData,
      enfant_id: this.inscriptionData.enfant_id!
    }).subscribe({
      next: (res) => {
        if (res.success) {
          alert('✅ ' + res.message);
          this.closeModal();
          this.loadActivites();
          this.loadPaiementsEnAttente();
        }
        this.submitting.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Erreur lors de l\'inscription');
        this.submitting.set(false);
      }
    });
  }

  showPaiements() {
    this.showPaiementsModal.set(true);
  }

  closePaiementsModal() {
    this.showPaiementsModal.set(false);
  }

  getTotalPaiements(): number {
    return this.paiements().reduce((sum, p) => sum + p.montant, 0);
  }

  getTypeBadgeColor(type: string): string {
    const colors: Record<string, string> = {
      'sport': 'success',
      'musique': 'info',
      'theatre': 'warning',
      'artistique': 'danger',
      'educative': 'primary',
      'ludique': 'secondary'
    };
    return colors[type] || 'secondary';
  }

  getCapacitePercent(activite: ActiviteDisponible): number {
    if (!activite.capacite_max) return 0;
    return ((activite.participants_count || 0) / activite.capacite_max) * 100;
  }

  getEducateursNames(educateurs: any[]): string {
    if (!educateurs) return '';
    return educateurs.map(e => e.user?.name || '').filter(Boolean).join(', ');
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}