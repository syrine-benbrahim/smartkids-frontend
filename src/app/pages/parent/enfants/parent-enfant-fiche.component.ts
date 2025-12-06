// src/app/pages/parent/enfants/parent-enfant-fiche.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EnfantFicheService, FicheEnfant } from '../../../services/enfant-fiche.service';

@Component({
  selector: 'app-parent-enfant-fiche',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      
      <!-- Loading State -->
      <div *ngIf="loading()" class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <div class="relative w-24 h-24 mx-auto mb-6">
            <div class="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p class="text-gray-600 font-medium text-lg">Chargement de la fiche...</p>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="max-w-7xl mx-auto p-6">
        <div class="bg-white rounded-3xl shadow-xl p-8 border-2 border-red-200">
          <div class="flex items-start gap-6">
            <div class="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-2xl font-bold text-red-900 mb-2">Erreur de chargement</h3>
              <p class="text-red-700 mb-4">{{ error() }}</p>
              <button 
                (click)="loadFiche()"
                class="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105">
                🔄 Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div *ngIf="!loading() && !error() && fiche()" class="max-w-7xl mx-auto p-4 lg:p-8 space-y-6">
        
        <!-- Header avec Navigation -->
        <div class="bg-white rounded-3xl shadow-xl p-6 border-2 border-purple-100">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <button 
              (click)="goBack()"
              class="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700 transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Retour
            </button>
            
            <div class="flex items-center gap-3">
              <button 
                (click)="router.navigate(['/parent/enfants', enfantId(), 'presences'])"
                class="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg transition flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                Présences
              </button>
              
              <button 
                class="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                Emploi
              </button>
            </div>
          </div>
        </div>

        <!-- Section 1: Informations Principales avec Photo -->
        <div class="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-purple-100">
          <div class="relative h-48 bg-gradient-to-r" [class]="getGradientClass(fiche()!.sexe)">
            <div class="absolute inset-0 opacity-20">
              <div class="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div class="absolute bottom-10 right-10 w-40 h-40 bg-yellow-300 rounded-full blur-3xl animate-pulse"></div>
            </div>
          </div>

          <div class="relative px-8 pb-8 -mt-20">
            <div class="flex flex-col md:flex-row items-start md:items-end gap-6">
              <!-- Avatar/Photo -->
              <div class="relative group">
                <div class="w-40 h-40 rounded-3xl bg-white shadow-2xl overflow-hidden border-4 border-white">
                  <img 
                    *ngIf="fiche()!.photo" 
                    [src]="fiche()!.photo" 
                    [alt]="fiche()!.nom_complet"
                    class="w-full h-full object-cover">
                  <div 
                    *ngIf="!fiche()!.photo"
                    [class]="getAvatarClass(fiche()!.sexe)"
                    class="w-full h-full flex items-center justify-center">
                    <span class="text-5xl font-black text-white">
                      {{ getInitials(fiche()!.nom_complet) }}
                    </span>
                  </div>
                </div>
                
                <!-- Upload Photo Button -->
                <label class="absolute bottom-2 right-2 w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <input 
                    type="file" 
                    accept="image/*" 
                    (change)="onPhotoSelect($event)" 
                    class="hidden">
                </label>
              </div>

              <!-- Infos Principales -->
              <div class="flex-1 mt-6 md:mt-0">
                <h1 class="text-4xl font-black text-gray-900 mb-2">
                  {{ fiche()!.nom_complet }}
                </h1>
                
                <div class="flex flex-wrap items-center gap-3 mb-4">
                  <span class="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-xl font-bold">
                    {{ fiche()!.age }} ans
                  </span>
                  
                  <span class="px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 rounded-xl font-bold">
                    {{ fiche()!.sexe === 'M' || fiche()!.sexe === 'garçon' ? '👦 Garçon' : '👧 Fille' }}
                  </span>
                  
                  <span class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold">
                    📅 {{ formatDate(fiche()!.date_naissance) }}
                  </span>
                </div>

                <!-- Classe Info -->
                <div *ngIf="fiche()!.classe" class="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                  <div>
                    <div class="text-sm font-medium opacity-90">Classe</div>
                    <div class="text-lg font-black">{{ fiche()!.classe?.nom }} - {{ fiche()!.classe?.niveau }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: Statistiques Rapides -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Taux de Présence -->
          <div class="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100 hover:shadow-xl transition">
            <div class="flex items-center justify-between mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span class="text-3xl font-black" [class]="getTauxClass(fiche()!.statistiques_presence.taux_presence)">
                {{ fiche()!.statistiques_presence.taux_presence }}%
              </span>
            </div>
            <h3 class="text-sm font-bold text-gray-600 mb-2">Taux de Présence</h3>
            <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                [class]="getProgressClass(fiche()!.statistiques_presence.taux_presence)"
                [style.width.%]="fiche()!.statistiques_presence.taux_presence"
                class="h-full transition-all duration-500">
              </div>
            </div>
          </div>

          <!-- Activités -->
          <div class="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-100 hover:shadow-xl transition">
            <div class="flex items-center justify-between mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"/>
                </svg>
              </div>
              <span class="text-3xl font-black text-orange-600">
                {{ fiche()!.statistiques_activites.total_activites }}
              </span>
            </div>
            <h3 class="text-sm font-bold text-gray-600 mb-2">Activités Totales</h3>
            <p class="text-xs text-gray-500">
              {{ fiche()!.statistiques_activites.taux_participation }}% de participation
            </p>
          </div>

          <!-- Moyenne Générale -->
          <div class="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100 hover:shadow-xl transition">
            <div class="flex items-center justify-between mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <span class="text-3xl font-black" [class]="getMoyenneClass(fiche()!.moyennes.moyenne_generale)">
                {{ fiche()!.moyennes.moyenne_generale || 'N/A' }}
              </span>
            </div>
            <h3 class="text-sm font-bold text-gray-600 mb-2">Moyenne Générale</h3>
            <p class="text-xs text-gray-500">
              Année {{ fiche()!.moyennes.annee_scolaire }}
            </p>
          </div>

          <!-- Présences ce Mois -->
          <div class="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100 hover:shadow-xl transition">
            <div class="flex items-center justify-between mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <span class="text-3xl font-black text-purple-600">
                {{ fiche()!.statistiques_presence.mois_en_cours.presents }}/{{ fiche()!.statistiques_presence.mois_en_cours.total }}
              </span>
            </div>
            <h3 class="text-sm font-bold text-gray-600 mb-2">Ce Mois-ci</h3>
            <p class="text-xs text-gray-500">
              {{ fiche()!.statistiques_presence.mois_en_cours.taux }}% de présence
            </p>
          </div>
        </div>

        <!-- Section 3: Classe et Éducateurs -->
        <div *ngIf="fiche()!.classe" class="bg-white rounded-3xl shadow-xl p-8 border-2 border-indigo-100">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <h2 class="text-2xl font-black text-gray-900">Classe & Éducateurs</h2>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Infos Classe -->
            <div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Informations de la classe</h3>
              
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-indigo-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                  <div>
                    <p class="text-sm text-gray-600">Nom de la classe</p>
                    <p class="font-bold text-gray-900">{{ fiche()!.classe?.nom }}</p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-indigo-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                  <div>
                    <p class="text-sm text-gray-600">Niveau</p>
                    <p class="font-bold text-gray-900">{{ fiche()!.classe?.niveau }}</p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-indigo-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <div>
                    <p class="text-sm text-gray-600">Capacité</p>
                    <p class="font-bold text-gray-900">{{ fiche()!.classe?.capacite_max }} élèves</p>
                  </div>
                </div>

                <div *ngIf="fiche()!.classe?.salle" class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-indigo-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  <div>
                    <p class="text-sm text-gray-600">Salle</p>
                    <p class="font-bold text-gray-900">{{ fiche()!.classe!.salle!.nom }} ({{ fiche()!.classe!.salle!.code }})</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Éducateurs -->
            <div>
              <h3 class="text-lg font-bold text-gray-900 mb-4">Éducateurs de la classe</h3>
              
              <div class="space-y-3">
                <div 
                  *ngFor="let educateur of fiche()!.classe?.educateurs || []"
                  class="bg-white rounded-2xl p-4 shadow-md border-2 border-gray-100 hover:border-indigo-200 transition">
                  
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span class="text-lg font-bold text-white">
                        {{ getInitials(educateur.nom_complet) }}
                      </span>
                    </div>
                    
                    <div class="flex-1 min-w-0">
                      <h4 class="font-bold text-gray-900 truncate">{{ educateur.nom_complet }}</h4>
                      
                      <div class="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div *ngIf="educateur.email" class="flex items-center gap-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                          </svg>
                          <span class="truncate">{{ educateur.email }}</span>
                        </div>
                        
                        <div *ngIf="educateur.telephone" class="flex items-center gap-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                          </svg>
                          <span>{{ educateur.telephone }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 4: Grid avec Présences Récentes, Activités, Notes -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Présences Récentes -->
          <div class="bg-white rounded-3xl shadow-xl p-6 border-2 border-green-100">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <h2 class="text-xl font-black text-gray-900">Présences Récentes</h2>
              </div>
              
              <button 
                (click)="router.navigate(['/parent/enfants', enfantId(), 'presences'])"
                class="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1">
                Voir tout
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            <div class="space-y-3">
              <div 
                *ngFor="let presence of fiche()!.presences_recentes"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                
                <div class="flex items-center gap-3 flex-1">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                       [class]="presence.statut === 'present' ? 'bg-green-100' : 'bg-red-100'">
                    <span class="text-xl">{{ presence.statut === 'present' ? '✅' : '❌' }}</span>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-gray-900">{{ formatDate(presence.date) }}</p>
                    <p class="text-sm text-gray-600 truncate">{{ presence.educateur }}</p>
                  </div>
                </div>
                
                <span 
                  class="px-3 py-1 rounded-lg text-xs font-bold"
                  [class]="presence.statut === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  {{ presence.statut === 'present' ? 'Présent' : 'Absent' }}
                </span>
              </div>

              <div *ngIf="fiche()!.presences_recentes.length === 0" 
                   class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <p class="font-medium">Aucune présence enregistrée</p>
              </div>
            </div>
          </div>

          <!-- Activités Récentes -->
          <div class="bg-white rounded-3xl shadow-xl p-6 border-2 border-orange-100">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"/>
                  </svg>
                </div>
                <h2 class="text-xl font-black text-gray-900">Activités Récentes</h2>
              </div>
              
              <button 
                (click)="router.navigate(['/parent/activites/enfant', enfantId(), 'historique'])"
                class="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
                Voir tout
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            <div class="space-y-3">
              <div 
                *ngFor="let activite of fiche()!.activites_recentes"
                class="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
                
                <div class="flex items-start justify-between mb-2">
                  <h3 class="font-bold text-gray-900 flex-1">{{ activite.titre }}</h3>
                  <span class="px-2 py-1 bg-orange-200 text-orange-800 rounded-lg text-xs font-bold">
                    {{ activite.type }}
                  </span>
                </div>
                
                <div class="flex items-center justify-between">
                  <p class="text-sm text-gray-600">{{ formatDate(activite.date_activite) }}</p>
                  <span 
                    *ngIf="activite.statut"
                    class="px-2 py-1 rounded-lg text-xs font-bold"
                    [class]="activite.statut === 'present' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'">
                    {{ activite.statut === 'present' ? '✅ Présent' : activite.statut }}
                  </span>
                </div>
              </div>

              <div *ngIf="fiche()!.activites_recentes.length === 0" 
                   class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"/>
                </svg>
                <p class="font-medium">Aucune activité enregistrée</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 5: Notes et Moyennes -->
        <div class="bg-white rounded-3xl shadow-xl p-8 border-2 border-blue-100">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h2 class="text-2xl font-black text-gray-900">Notes et Bulletin</h2>
          </div>

          <!-- Moyennes par Trimestre -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4">
              <p class="text-sm font-bold text-gray-600 mb-2">Trimestre 1</p>
              <p class="text-3xl font-black" [class]="getMoyenneClass(fiche()!.moyennes.trimestre_1)">
                {{ fiche()!.moyennes.trimestre_1 || 'N/A' }}
              </p>
            </div>

            <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4">
              <p class="text-sm font-bold text-gray-600 mb-2">Trimestre 2</p>
              <p class="text-3xl font-black" [class]="getMoyenneClass(fiche()!.moyennes.trimestre_2)">
                {{ fiche()!.moyennes.trimestre_2 || 'N/A' }}
              </p>
            </div>

            <div class="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4">
              <p class="text-sm font-bold text-gray-600 mb-2">Trimestre 3</p>
              <p class="text-3xl font-black" [class]="getMoyenneClass(fiche()!.moyennes.trimestre_3)">
                {{ fiche()!.moyennes.trimestre_3 || 'N/A' }}
              </p>
            </div>

            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4">
              <p class="text-sm font-bold text-gray-600 mb-2">Moyenne Générale</p>
              <p class="text-3xl font-black" [class]="getMoyenneClass(fiche()!.moyennes.moyenne_generale)">
                {{ fiche()!.moyennes.moyenne_generale || 'N/A' }}
              </p>
            </div>
          </div>

          <!-- Notes Récentes -->
          <div>
            <h3 class="text-lg font-bold text-gray-900 mb-4">Notes récentes</h3>
            
            <div class="space-y-3">
              <div 
                *ngFor="let note of fiche()!.notes_recentes"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-1">
                    <h4 class="font-bold text-gray-900">{{ note.matiere }}</h4>
                    <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">
                      {{ note.type_evaluation }}
                    </span>
                  </div>
                  
                  <div class="flex items-center gap-4 text-sm text-gray-600">
                    <span>📅 {{ formatDate(note.date_evaluation) }}</span>
                    <span>👨‍🏫 {{ note.educateur }}</span>
                    <span *ngIf="note.trimestre" class="px-2 py-0.5 bg-gray-200 rounded text-xs font-bold">
                      T{{ note.trimestre }}
                    </span>
                  </div>
                  
                  <p *ngIf="note.commentaire" class="text-sm text-gray-600 mt-2 italic">
                    "{{ note.commentaire }}"
                  </p>
                </div>
                
                <div class="ml-4 text-right flex-shrink-0">
                  <p class="text-4xl font-black" [class]="getMoyenneClass(note.note)">
                    {{ note.note }}
                  </p>
                  <p class="text-xs text-gray-500">/20</p>
                </div>
              </div>

              <div *ngIf="fiche()!.notes_recentes.length === 0" 
                   class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p class="font-medium">Aucune note enregistrée</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 6: Informations Médicales -->
        <div *ngIf="fiche()!.infos_medicales.allergies || fiche()!.infos_medicales.remarques_medicales" 
             class="bg-white rounded-3xl shadow-xl p-8 border-2 border-red-100">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h2 class="text-2xl font-black text-gray-900">Informations Médicales</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div *ngIf="fiche()!.infos_medicales.allergies" 
                 class="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
              <div class="flex items-center gap-2 mb-3">
                <span class="text-2xl">⚠️</span>
                <h3 class="text-lg font-bold text-red-900">Allergies</h3>
              </div>
              <p class="text-gray-700">{{ fiche()!.infos_medicales.allergies }}</p>
            </div>

            <div *ngIf="fiche()!.infos_medicales.remarques_medicales" 
                 class="bg-orange-50 rounded-2xl p-6 border-2 border-orange-200">
              <div class="flex items-center gap-2 mb-3">
                <span class="text-2xl">🏥</span>
                <h3 class="text-lg font-bold text-orange-900">Remarques Médicales</h3>
              </div>
              <p class="text-gray-700">{{ fiche()!.infos_medicales.remarques_medicales }}</p>
            </div>
          </div>
        </div>

        <!-- Section 7: Parents/Tuteurs -->
        <div class="bg-white rounded-3xl shadow-xl p-8 border-2 border-purple-100">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <h2 class="text-2xl font-black text-gray-900">Parents / Tuteurs</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              *ngFor="let parent of fiche()!.parents"
              class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100">
              
              <div class="flex items-center gap-4 mb-4">
                <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                  <span class="text-xl font-bold text-white">
                    {{ getInitials(parent.nom_complet) }}
                  </span>
                </div>
                
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-gray-900 text-lg">{{ parent.nom_complet }}</h3>
                  <p *ngIf="parent.profession" class="text-sm text-gray-600">{{ parent.profession }}</p>
                </div>
              </div>

              <div class="space-y-2">
                <div *ngIf="parent.email" class="flex items-center gap-2 text-sm text-gray-700">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <span class="truncate">{{ parent.email }}</span>
                </div>

                <div class="flex items-center gap-2 text-sm text-gray-700">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <span>{{ parent.telephone }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .space-y-6 > * {
      animation: fadeIn 0.5s ease-out;
    }
  `]
})
export class ParentEnfantFicheComponent implements OnInit {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private ficheService = inject(EnfantFicheService);

  fiche = signal<FicheEnfant | null>(null);
  enfantId = signal<number>(0);
  loading = signal(false);
  error = signal<string | null>(null);
  uploadingPhoto = signal(false);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = parseInt(params['id']);
      this.enfantId.set(id);
      this.loadFiche();
    });
  }

  loadFiche() {
    this.loading.set(true);
    this.error.set(null);

    this.ficheService.getFicheEnfant(this.enfantId()).subscribe({
      next: (response) => {
        if (response.success) {
          this.fiche.set(response.data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement de la fiche');
        this.loading.set(false);
        console.error('Error loading fiche:', err);
      }
    });
  }

  onPhotoSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    
    // Validation
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('La taille de l\'image ne doit pas dépasser 2MB');
      return;
    }

    this.uploadingPhoto.set(true);

    this.ficheService.uploadPhoto(this.enfantId(), file).subscribe({
      next: (response) => {
        if (response.success && this.fiche()) {
          // Mettre à jour la photo dans la fiche
          const currentFiche = this.fiche()!;
          this.fiche.set({
            ...currentFiche,
            photo: response.data.photo_url
          });
        }
        this.uploadingPhoto.set(false);
      },
      error: (err) => {
        alert('Erreur lors de l\'upload de la photo');
        this.uploadingPhoto.set(false);
        console.error('Error uploading photo:', err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/parent/enfants']);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getGradientClass(sexe: string): string {
    if (sexe === 'M' || sexe === 'garçon') {
      return 'from-blue-400 via-blue-500 to-indigo-600';
    }
    return 'from-pink-400 via-pink-500 to-purple-600';
  }

  getAvatarClass(sexe: string): string {
    if (sexe === 'M' || sexe === 'garçon') {
      return 'bg-gradient-to-br from-blue-500 to-indigo-600';
    }
    return 'bg-gradient-to-br from-pink-500 to-purple-600';
  }

  getTauxClass(taux: number): string {
    return this.ficheService.getTauxPresenceClass(taux);
  }

  getProgressClass(taux: number): string {
    return this.ficheService.getProgressBarClass(taux);
  }

  getMoyenneClass(moyenne: number | null): string {
    if (!moyenne) return 'text-gray-400';
    return this.ficheService.getMentionColor(moyenne);
  }

  formatDate(dateString: string): string {
    return this.ficheService.formatDate(dateString);
  }
}