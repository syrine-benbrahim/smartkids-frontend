// src/app/pages/parent/parent-dashboard.component.ts
import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ParentPresencesApiService, EnfantWithStats } from '../../services/presences-parent.service';

interface ParentProfile {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  profession: string | null;
  nom_complet?: string;
  user?: {
    name?: string;
    email?: string;
  };
}

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8">
      
      <!-- Welcome Hero Section -->
      <div class="relative overflow-hidden bg-gradient-to-br from-pink-500 via-orange-500 to-purple-600 rounded-[2rem] p-8 lg:p-12 text-white shadow-2xl">
        <!-- Animated Background Elements -->
        <div class="absolute inset-0 opacity-20">
          <div class="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div class="absolute bottom-10 right-10 w-40 h-40 bg-yellow-300 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
          <div class="absolute top-1/2 left-1/3 w-24 h-24 bg-purple-300 rounded-full blur-2xl animate-pulse" style="animation-delay: 2s;"></div>
        </div>
        
        <div class="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div class="flex-1">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
              <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span class="text-sm font-medium">En ligne</span>
            </div>
            <h1 class="text-4xl lg:text-5xl font-black mb-3 tracking-tight">
              Hello, {{ profile()?.prenom || 'Parent' }}! 👋
            </h1>
            <p class="text-lg lg:text-xl text-white/90 mb-6 max-w-2xl">
              Bienvenue dans votre espace parent. Suivez l'évolution de vos enfants en temps réel.
            </p>
            <div class="flex flex-wrap gap-3">
              <a routerLink="/parent/enfants" 
                 class="px-6 py-3 bg-white text-pink-600 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg hover:shadow-xl">
                Voir mes enfants
              </a>
              <a routerLink="/chat" 
                 class="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/30 transition-all border border-white/30">
                💬 Messages
              </a>
            </div>
          </div>
          
          <!-- Decorative Illustration -->
          <div class="hidden lg:block relative">
            <div class="w-64 h-64 relative">
              <!-- Animated Circles -->
              <div class="absolute inset-0 bg-white/10 rounded-full animate-spin-slow"></div>
              <div class="absolute inset-4 bg-white/20 rounded-full animate-spin-slower"></div>
              <div class="absolute inset-8 bg-white/30 rounded-full flex items-center justify-center">
                <svg class="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Overview with Glassmorphism -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Enfants -->
        <div class="group relative overflow-hidden bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-pink-100">Total</p>
              </div>
            </div>
            <h3 class="text-5xl font-black text-white mb-2">{{ enfants().length }}</h3>
            <p class="text-pink-100 font-medium">Enfant{{ enfants().length > 1 ? 's' : '' }} inscrit{{ enfants().length > 1 ? 's' : '' }}</p>
          </div>
        </div>

        <!-- Taux de Présence -->
        <div class="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-green-100">Moyen</p>
              </div>
            </div>
            <h3 class="text-5xl font-black text-white mb-2">{{ calculateAveragePresence() }}%</h3>
            <p class="text-green-100 font-medium">Taux de présence</p>
          </div>
        </div>

        <!-- Activités -->
        <div class="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
             (click)="router.navigate(['/parent/activites'])">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"/>
                </svg>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-orange-100">Cette semaine</p>
              </div>
            </div>
            <h3 class="text-5xl font-black text-white mb-2">12</h3>
            <p class="text-orange-100 font-medium">Activités programmées</p>
          </div>
        </div>

        <!-- Messages -->
        <div class="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
             (click)="router.navigate(['/chat'])">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
              <div class="px-2 py-1 bg-white/30 backdrop-blur-sm rounded-full">
                <span class="text-xs font-bold text-white">3 nouveaux</span>
              </div>
            </div>
            <h3 class="text-5xl font-black text-white mb-2">8</h3>
            <p class="text-purple-100 font-medium">Messages non lus</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="relative w-24 h-24 mx-auto mb-6">
            <div class="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p class="text-gray-600 font-medium text-lg">Chargement de vos enfants...</p>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-3xl p-8">
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
              (click)="loadData()"
              class="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105">
              🔄 Réessayer
            </button>
          </div>
        </div>
      </div>

      <!-- Mes Enfants Section -->
      <div *ngIf="!loading() && !error()">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-3xl font-black text-gray-900 mb-2">Mes Enfants</h2>
            <p class="text-gray-600">Suivez l'évolution de chaque enfant</p>
          </div>
          <a 
            routerLink="/parent/enfants"
            class="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105">
            Voir tout
            <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </a>
        </div>

        <!-- Empty State -->
        <div *ngIf="enfants().length === 0" class="text-center py-20 bg-gradient-to-br from-gray-50 to-purple-50 rounded-3xl border-2 border-dashed border-gray-300">
          <div class="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg class="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">Aucun enfant inscrit</h3>
          <p class="text-gray-600 text-lg">Aucun enfant n'est associé à votre compte pour le moment.</p>
        </div>

        <!-- Enfants Cards -->
        <div *ngIf="enfants().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let enfant of enfants(); let i = index" 
               class="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border-2 border-gray-100"
               (click)="viewEnfant(enfant.id)"
               [style.animation-delay]="i * 0.1 + 's'">
            
            <!-- Gradient Header -->
            <div class="relative h-36 bg-gradient-to-br overflow-hidden"
                 [class]="getGradientClass(enfant.sexe)">
              <!-- Animated Background Pattern -->
              <div class="absolute inset-0 opacity-20">
                <div class="absolute top-4 right-4 w-20 h-20 bg-white rounded-full blur-2xl animate-pulse"></div>
                <div class="absolute bottom-4 left-4 w-16 h-16 bg-white rounded-full blur-xl animate-pulse" style="animation-delay: 0.5s;"></div>
              </div>
              
              <!-- Avatar -->
              <div class="absolute -bottom-12 left-6 z-10">
                <div class="relative">
                  <div class="w-24 h-24 rounded-2xl bg-white shadow-xl flex items-center justify-center border-4 border-white group-hover:scale-110 transition-transform duration-300">
                    <div [class]="getAvatarClass(enfant.sexe)" class="w-full h-full rounded-xl flex items-center justify-center">
                      <span class="text-3xl font-black text-white">
                        {{ getInitials(enfant.nom_complet) }}
                      </span>
                    </div>
                  </div>
                  <!-- Status Indicator -->
                  <div class="absolute -bottom-1 -right-1 w-7 h-7 bg-green-400 border-4 border-white rounded-full shadow-lg"></div>
                </div>
              </div>
            </div>

            <!-- Content -->
            <div class="pt-16 px-6 pb-6">
              <!-- Name & Info -->
              <div class="mb-6">
                <h3 class="text-2xl font-black text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {{ enfant.nom_complet }}
                </h3>
                <div class="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                  <span class="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-lg font-medium">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    {{ enfant.age }} ans
                  </span>
                  <span *ngIf="enfant.classe" class="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-xs font-bold shadow-md">
                    {{ enfant.classe.nom }}
                  </span>
                </div>
              </div>

              <!-- Progress Section -->
              <div class="mb-6 p-4 bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-bold text-gray-700">Taux de présence</span>
                  <span class="text-2xl font-black" [class]="getProgressTextClass(enfant.statistiques_presence.taux_presence)">
                    {{ enfant.statistiques_presence.taux_presence }}%
                  </span>
                </div>
                
                <!-- Progress Bar -->
                <div class="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div 
                    [class]="getProgressBarClass(enfant.statistiques_presence.taux_presence)"
                    [style.width.%]="enfant.statistiques_presence.taux_presence"
                    class="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden">
                    <!-- Shine Effect -->
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>
                  </div>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-3 gap-2 mt-4">
                  <div class="text-center p-2 bg-white rounded-xl">
                    <p class="text-xs text-gray-600 mb-1">Total</p>
                    <p class="text-lg font-black text-gray-900">{{ enfant.statistiques_presence.total_jours }}</p>
                  </div>
                  <div class="text-center p-2 bg-white rounded-xl">
                    <p class="text-xs text-gray-600 mb-1">Présent</p>
                    <p class="text-lg font-black text-green-600">{{ enfant.statistiques_presence.jours_presents }}</p>
                  </div>
                  <div class="text-center p-2 bg-white rounded-xl">
                    <p class="text-xs text-gray-600 mb-1">Absent</p>
                    <p class="text-lg font-black text-red-600">{{ enfant.statistiques_presence.jours_absents }}</p>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="grid grid-cols-2 gap-3">
                <button 
                  (click)="viewPresences($event, enfant.id)"
                  class="group px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  Présences
                </button>
                <button 
                  (click)="viewCalendar($event, enfant.id)"
                  class="group px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Calendrier
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Access Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
  <!-- Emploi du temps (NOUVEAU) -->
  <a routerLink="/parent/emploi" 
     class="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-indigo-100">
    <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
    <div class="relative z-10">
      <div class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
        <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </div>
      <h3 class="text-xl font-black text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">Emploi du temps</h3>
      <p class="text-gray-600 font-medium">Consulter les cours</p>
    </div>
  </a>

  <a routerLink="/parent/activites" 
     class="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-green-100">
    <div class="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
    <div class="relative z-10">
      <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
        <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"/>
        </svg>
      </div>
      <h3 class="text-xl font-black text-gray-900 mb-2 group-hover:text-green-600 transition-colors">Activités</h3>
      <p class="text-gray-600 font-medium">Activités pédagogiques</p>
    </div>
  </a>

  <a routerLink="/parent/menus" 
     class="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-orange-100">
    <div class="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
    <div class="relative z-10">
      <div class="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
        <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
      </div>
      <h3 class="text-xl font-black text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">Menus</h3>
      <p class="text-gray-600 font-medium">Repas de la semaine</p>
    </div>
  </a>

  <a routerLink="/chat" 
     class="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-blue-100">
    <div class="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
    <div class="relative z-10">
      <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform relative">
        <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        <div class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
          <span class="text-xs font-black text-white">3</span>
        </div>
      </div>
      <h3 class="text-xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Messages</h3>
      <p class="text-gray-600 font-medium">Contacter l'école</p>
    </div>
  </a>
</div>
  `,
  styles: [`
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes spin-slower {
      from { transform: rotate(0deg); }
      to { transform: rotate(-360deg); }
    }

    @keyframes shine {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .animate-spin-slow {
      animation: spin-slow 20s linear infinite;
    }

    .animate-spin-slower {
      animation: spin-slower 30s linear infinite;
    }

    .animate-shine {
      animation: shine 2s infinite;
    }

    /* Card enter animation */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .group {
      animation: fadeInUp 0.6s ease-out forwards;
      opacity: 0;
    }
  `]
})
export class ParentDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private apiService = inject(ParentPresencesApiService);
  router = inject(Router);

  enfants = signal<EnfantWithStats[]>([]);
  profile = signal<ParentProfile | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);

    // Load profile first
    this.http.get<{ success: boolean; data: ParentProfile }>('/api/parent/profile')
      .subscribe({
        next: (response) => {
          console.log('Profile response:', response); // Debug log
          if (response.success && response.data) {
            this.profile.set(response.data);
            console.log('Profile loaded:', this.profile()); // Debug log
          }
        },
        error: (err) => {
          console.error('Error loading profile:', err);
        }
      });

    // Load enfants using the correct service
    this.apiService.getEnfants().subscribe({
      next: (response) => {
        console.log('Enfants response:', response); // Debug log
        if (response.success) {
          this.enfants.set(response.data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des données');
        this.loading.set(false);
        console.error('Error loading enfants:', err);
      }
    });
  }

  calculateAveragePresence(): number {
    const enfants = this.enfants();
    if (enfants.length === 0) return 0;

    const sum = enfants.reduce((acc, e) => acc + e.statistiques_presence.taux_presence, 0);
    return Math.round(sum / enfants.length);
  }

  viewEnfant(enfantId: number) {
    this.router.navigate(['/parent/enfants', enfantId, 'presences']);
  }

  viewPresences(event: Event, enfantId: number) {
    event.stopPropagation();
    this.router.navigate(['/parent/enfants', enfantId, 'presences']);
  }

  viewCalendar(event: Event, enfantId: number) {
    event.stopPropagation();
    this.router.navigate(['/parent/enfants', enfantId, 'presences', 'calendrier']);
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

  getProgressBarClass(taux: number): string {
    if (taux >= 90) return 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600';
    if (taux >= 75) return 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600';
    if (taux >= 60) return 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600';
    return 'bg-gradient-to-r from-red-500 via-rose-500 to-red-600';
  }

  getProgressTextClass(taux: number): string {
    if (taux >= 90) return 'text-green-600';
    if (taux >= 75) return 'text-blue-600';
    if (taux >= 60) return 'text-orange-600';
    return 'text-red-600';
  }
}