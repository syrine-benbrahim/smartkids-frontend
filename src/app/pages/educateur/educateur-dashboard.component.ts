import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { PresenceService } from '../../services/presence.service';
import { EducateursApiService } from '../../services/educateurs-api.service';
import { ChatWidgetComponent } from '../../shared/chat-widget/chat-widget.component';

interface EducateurProfile {
  id: number;
  name: string;
  email: string;
  diplome: string;
  date_embauche: string;
  salaire: number;
}

@Component({
  selector: 'app-educateur-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ChatWidgetComponent],
  template: `
<div class="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-4 sm:p-6">
  <!-- Header avec informations utilisateur -->
  <div class="max-w-6xl mx-auto">
    <div class="relative mb-8">
      <!-- Éléments décoratifs -->
      <div class="absolute -top-4 -left-4 w-16 h-16 bg-blue-300 rounded-full opacity-60 animate-bounce" style="animation-delay: 0s;"></div>
      <div class="absolute -top-2 right-10 w-12 h-12 bg-purple-300 rounded-full opacity-60 animate-bounce" style="animation-delay: 0.5s;"></div>
      <div class="absolute top-2 right-32 w-8 h-8 bg-pink-300 rounded-full opacity-60 animate-bounce" style="animation-delay: 1s;"></div>

      <div class="card relative overflow-hidden bg-white/95 backdrop-blur border border-white/60 shadow-2xl">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
        <div class="relative flex flex-col lg:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <!-- Icône éducateur -->
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-black text-gray-800 tracking-tight">
                Dashboard Éducateur 🎓
              </h1>
              <p class="text-gray-600 font-medium">
                Gérer les présences et communiquer avec les parents
              </p>
            </div>
          </div>
          
          <!-- Header Buttons -->
          <div class="flex items-center gap-3">
            <!-- Profile Button -->
            <button
              class="btn-secondary bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl border border-gray-300 font-medium shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2"
              (click)="showProfile = !showProfile"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              {{ showProfile ? 'Fermer' : 'Profil' }}
            </button>
            
            <!-- Bouton déconnexion -->
            <button
              class="btn-primary bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-red-200 hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              (click)="logout()"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Section -->
    <div *ngIf="showProfile" class="mb-8">
      <div class="card relative overflow-hidden bg-white/95 backdrop-blur border border-white/60 shadow-2xl">
        <div class="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10"></div>
        <div class="relative p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800">Mon Profil</h3>
            </div>
            <button
              *ngIf="!editMode"
              class="bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl font-medium shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              (click)="toggleEditMode()"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Modifier
            </button>
          </div>

          <!-- Profile Display Mode -->
          <div *ngIf="!editMode && profile()" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Nom complet
                </label>
                <div class="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p class="font-medium text-gray-800">{{ profile()?.name }}</p>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                  Email
                </label>
                <div class="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p class="font-medium text-gray-800">{{ profile()?.email }}</p>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <div class="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Diplôme
                </label>
                <div class="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p class="font-medium text-gray-800">{{ profile()?.diplome }}</p>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <div class="w-2 h-2 bg-orange-400 rounded-full"></div>
                  Date d'embauche
                </label>
                <div class="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p class="font-medium text-gray-800">{{ formatDate(profile()?.date_embauche) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Profile Edit Mode -->
          <div *ngIf="editMode" class="space-y-6">
            <form (ngSubmit)="saveProfile()" #profileForm="ngForm">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
                    Nom complet <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="editForm.name"
                    name="name"
                    required
                    class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 bg-white font-medium transition-all duration-200"
                    placeholder="Votre nom complet"
                  />
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    Email <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    [(ngModel)]="editForm.email"
                    name="email"
                    required
                    class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 bg-white font-medium transition-all duration-200"
                    placeholder="votre.email@jardin.com"
                  />
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div class="w-2 h-2 bg-purple-400 rounded-full"></div>
                    Diplôme <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="editForm.diplome"
                    name="diplome"
                    required
                    class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 bg-white font-medium transition-all duration-200"
                    placeholder="Votre diplôme"
                  />
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div class="w-2 h-2 bg-red-400 rounded-full"></div>
                    Nouveau mot de passe (optionnel)
                  </label>
                  <input
                    type="password"
                    [(ngModel)]="editForm.password"
                    name="password"
                    class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-400 focus:ring-4 focus:ring-red-100 bg-white font-medium transition-all duration-200"
                    placeholder="Laisser vide pour ne pas changer"
                  />
                  <p class="text-xs text-gray-500">Laisser vide pour conserver le mot de passe actuel</p>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div class="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    Mot de passe actuel <span class="text-red-500" *ngIf="editForm.password">*</span>
                  </label>
                  <input
                    type="password"
                    [(ngModel)]="editForm.current_password"
                    name="current_password"
                    [required]="editForm.password"
                    class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 bg-white font-medium transition-all duration-200"
                    placeholder="Mot de passe actuel"
                  />
                </div>
              </div>

              <!-- Error Message -->
              <div *ngIf="profileError()" class="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <div class="flex items-center gap-3">
                  <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </div>
                  <p class="text-red-700 font-medium">{{ profileError() }}</p>
                </div>
              </div>

              <!-- Success Message -->
              <div *ngIf="profileSuccess()" class="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                <div class="flex items-center gap-3">
                  <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <p class="text-green-700 font-medium">{{ profileSuccess() }}</p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  [disabled]="profileLoading() || !profileForm.form.valid"
                  class="flex-1 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <svg *ngIf="profileLoading()" class="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  <svg *ngIf="!profileLoading()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  {{ profileLoading() ? 'Sauvegarde...' : 'Sauvegarder' }}
                </button>
                <button
                  type="button"
                  (click)="cancelEdit()"
                  class="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                  Annuler
                </button>
              </div>
            </form>
          </div>

          <!-- Loading State -->
          <div *ngIf="profileLoading() && !editMode" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Row: Chat Widget + Quick Access -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Chat Widget -->
      <app-chat-widget></app-chat-widget>
      
      <!-- Actions Rapides -->
      <div class="bg-white/95 backdrop-blur rounded-3xl shadow-lg border border-gray-200 p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          Actions Rapides
        </h3>
        
        <div class="space-y-3">
          <button 
            class="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors text-left group"
            (click)="navigateTo('/educateur/presences-jour')"
          >
            <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <div class="font-semibold text-green-800">Présences du Jour</div>
              <div class="text-xs text-green-600">Marquer rapidement</div>
            </div>
            <svg class="w-4 h-4 text-green-600 ml-auto group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>

          <button 
            class="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-left group"
            (click)="navigateTo('/chat')"
          >
            <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <div>
              <div class="font-semibold text-blue-800">Discussions</div>
              <div class="text-xs text-blue-600">Communiquer avec parents</div>
            </div>
            <svg class="w-4 h-4 text-blue-600 ml-auto group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Menu de navigation principal -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
      <!-- Bouton Mes Classes -->
      <button 
        class="group p-6 bg-white/90 backdrop-blur rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left"
        (click)="navigateTo('/educateur/classes')"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-gray-800">Mes Classes</h3>
            <p class="text-sm text-gray-600">Gérer les présences</p>
          </div>
        </div>
      </button>

      <!-- Bouton Chat/Discussion -->
      <button 
        class="group p-6 bg-white/90 backdrop-blur rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left"
        (click)="navigateTo('/chat')"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-gray-800">Discussion</h3>
            <p class="text-sm text-gray-600">Chat avec parents</p>
          </div>
        </div>
      </button>

      <!-- Bouton Présences du jour -->
      <button 
        class="group p-6 bg-white/90 backdrop-blur rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left"
        (click)="navigateTo('/educateur/presences-jour')"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-gray-800">Présences du jour</h3>
            <p class="text-sm text-gray-600">Marquer rapidement</p>
          </div>
        </div>
      </button>

      <!-- Bouton Statistiques -->
      <button 
        class="group p-6 bg-white/90 backdrop-blur rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left"
        (click)="navigateTo('/educateur/statistiques')"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-gray-800">Statistiques</h3>
            <p class="text-sm text-gray-600">Voir les rapports</p>
          </div>
        </div>
      </button>
    </div>

    <!-- Résumé des classes (si disponible) -->
    <div *ngIf="classes().length > 0" class="relative">
      <div class="absolute -top-6 -right-6 w-20 h-20 bg-yellow-200 rounded-full opacity-40 animate-pulse"></div>
      <div class="card relative overflow-hidden bg-white/95 backdrop-blur border border-white/60 shadow-2xl">
        <div class="absolute inset-0 bg-gradient-to-br from-green-50/80 via-blue-50/80 to-purple-50/80"></div>
        <div class="relative p-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800">Vos classes ({{ classes().length }})</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div *ngFor="let classe of classes()" 
                 class="p-4 bg-white/80 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                 (click)="navigateTo('/educateur/classes/' + classe.id + '/presences')">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{{ classe.nom }}</h4>
                  <p class="text-sm text-gray-600">{{ classe.niveau }}</p>
                  <p class="text-xs text-gray-500">{{ classe.nombre_enfants }} enfant(s)</p>
                </div>
                <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message de chargement -->
    <div *ngIf="loading()" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <!-- Message d'erreur -->
    <div *ngIf="error()" class="p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
      <div class="flex items-center gap-3">
        <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </div>
        <p class="text-red-700 font-medium">{{ error() }}</p>
      </div>
    </div>
  </div>
</div>
  `
})
export class EducateurDashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private presenceService = inject(PresenceService);
  private educateursApi = inject(EducateursApiService);

  classes = signal<any[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Profile related signals
  showProfile = false;
  editMode = false;
  profile = signal<EducateurProfile | null>(null);
  profileLoading = signal(false);
  profileError = signal<string | null>(null);
  profileSuccess = signal<string | null>(null);

  editForm: any = {
    name: '',
    email: '',
    diplome: '',
    password: '',
    current_password: ''
  };

  ngOnInit() {
    this.loadClasses();
  }

  private loadClasses() {
    this.loading.set(true);
    this.error.set(null);

    this.presenceService.getClassesEducateur().subscribe({
      next: (response) => {
        this.classes.set(response.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement classes:', err);
        this.error.set('Impossible de charger vos classes');
        this.loading.set(false);
      }
    });
  }

  private loadProfile() {
    this.profileLoading.set(true);
    this.profileError.set(null);

    // Use the new profile endpoint
    this.educateursApi.getMyProfile().subscribe({
      next: (response) => {
        const data = response.data;
        this.profile.set({
          id: data.id,
          name: data.name || data.user?.name || '',
          email: data.email || data.user?.email || '',
          diplome: data.diplome || '',
          date_embauche: data.date_embauche || '',
          salaire: data.salaire || 0
        });
        this.profileLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement profil:', err);
        this.profileError.set('Impossible de charger votre profil');
        this.profileLoading.set(false);
      }
    });
  }

  toggleEditMode() {
    if (!this.profile()) {
      this.loadProfile();
    }
    
    this.editMode = !this.editMode;
    if (this.editMode && this.profile()) {
      // Initialize edit form with current profile data
      const p = this.profile()!;
      this.editForm = {
        name: p.name,
        email: p.email,
        diplome: p.diplome,
        password: '',
        current_password: ''
      };
    }
    this.profileError.set(null);
    this.profileSuccess.set(null);
  }

  cancelEdit() {
    this.editMode = false;
    this.editForm = {
      name: '',
      email: '',
      diplome: '',
      password: '',
      current_password: ''
    };
    this.profileError.set(null);
    this.profileSuccess.set(null);
  }

  saveProfile() {
    this.profileLoading.set(true);
    this.profileError.set(null);
    this.profileSuccess.set(null);

    // Basic validation
    if (!this.editForm.name.trim()) {
      this.profileError.set('Le nom est obligatoire');
      this.profileLoading.set(false);
      return;
    }

    if (!this.editForm.email.trim()) {
      this.profileError.set('L\'email est obligatoire');
      this.profileLoading.set(false);
      return;
    }

    if (!this.editForm.diplome.trim()) {
      this.profileError.set('Le diplôme est obligatoire');
      this.profileLoading.set(false);
      return;
    }

    if (this.editForm.password && !this.editForm.current_password) {
      this.profileError.set('Le mot de passe actuel est requis pour changer le mot de passe');
      this.profileLoading.set(false);
      return;
    }

    const payload: any = {
      name: this.editForm.name.trim(),
      email: this.editForm.email.trim(),
      diplome: this.editForm.diplome.trim()
    };

    // Add password fields if password is being changed
    if (this.editForm.password) {
      payload.password = this.editForm.password;
      payload.current_password = this.editForm.current_password;
    }

    // Use the profile update method
    this.educateursApi.updateMyProfile(payload).subscribe({
      next: (response) => {
        const data = response.data;
        
        // Update the profile signal with new data
        this.profile.set({
          id: data.id,
          name: data.name || data.user?.name || payload.name,
          email: data.email || data.user?.email || payload.email,
          diplome: data.diplome || payload.diplome,
          date_embauche: data.date_embauche || this.profile()?.date_embauche || '',
          salaire: data.salaire || this.profile()?.salaire || 0
        });

        this.profileSuccess.set('Profil mis à jour avec succès');
        this.profileLoading.set(false);
        this.editMode = false;
        
        // Clear the form
        this.editForm = {
          name: '',
          email: '',
          diplome: '',
          password: '',
          current_password: ''
        };

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.profileSuccess.set(null);
        }, 3000);
      },
      error: (err) => {
        console.error('Erreur mise à jour profil:', err);
        this.profileError.set(err?.error?.message || 'Erreur lors de la mise à jour du profil');
        this.profileLoading.set(false);
      }
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Non renseigné';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Date invalide';
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }}