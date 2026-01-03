// src/app/shared/layout/app-layout.component.ts
import { Component, inject, signal, computed, ViewChild, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ChildStateService } from '../../services/child-state.service';
import { NotificationService, AppNotification } from '../../services/notification.service';
import { FormsModule } from '@angular/forms';
import { ProfileApiService } from '../../services/profile-api.service';
import { finalize } from 'rxjs';
import { ThemeService } from '../../core/theme.service';

interface NavItem {
  title: string;
  subtitle?: string;
  route: string;
  icon: string;
  badge?: string | number;
  roles: string[];
  emoji: string;
  color: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 relative overflow-hidden">
      
      <!-- Mesh Gradient Background Extras -->
      <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-tangerine/10 rounded-full blur-[120px] dark:bg-tangerine/5"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sea/10 rounded-full blur-[120px] dark:bg-sea/5"></div>
        <div class="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blush/10 rounded-full blur-[100px] dark:bg-blush/5"></div>
      </div>

      <!-- Modern Glass Navbar -->
      <nav class="fixed top-0 left-0 right-0 glass z-[60] h-20 transition-all duration-300">
        <div class="max-w-[1600px] mx-auto px-6 h-full flex justify-between items-center">
          
          <!-- Left: Brand & Search -->
          <div class="flex items-center space-x-10 flex-1">
            <a routerLink="/home" class="flex items-center space-x-3 group">
              <div class="relative w-12 h-12 bg-tangerine rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-tangerine/30">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <div>
                <h1 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">SmartKids</h1>
                <p class="text-[10px] font-bold text-tangerine uppercase tracking-[0.2em]">Kindergarten</p>
              </div>
            </a>

            <!-- Refined Search -->
            <div class="hidden lg:flex items-center flex-1 max-w-sm relative group">
              <div class="absolute left-4 text-slate-400 group-focus-within:text-tangerine transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <input type="text" placeholder="Rechercher..."
                     class="w-full pl-12 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-tangerine/50 rounded-2xl text-sm font-medium transition-all outline-none text-slate-700 dark:text-slate-200">
            </div>
          </div>

          <!-- Right: Tools -->
          <div class="flex items-center space-x-4">
            <!-- Theme Toggle -->
            <button (click)="themeService.toggleTheme()" 
                    class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-tangerine">
              <svg *ngIf="!themeService.darkMode()" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
              <svg *ngIf="themeService.darkMode()" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </button>

            <!-- Child Selector (Parent Only) -->
            <div *ngIf="userRole() === 'parent' && childState.children().length > 0" class="relative">
              <button (click)="toggleChildDropdown($event)"
                      class="px-5 h-12 glass hover:bg-white/60 dark:hover:bg-slate-800 transition-all rounded-2xl flex items-center space-x-3 group border border-white/40 shadow-sm active:scale-95">
                <div [class]="getAvatarClass(childState.selectedChild()?.sexe || 'M')"
                     class="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                  {{ childState.selectedChild()?.prenom?.substring(0,1) }}{{ childState.selectedChild()?.nom?.substring(0,1) }}
                </div>
                <div class="text-left hidden md:block">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Enfant Actif</p>
                  <p class="text-[13px] font-black text-slate-700 dark:text-slate-200 leading-none">
                    {{ childState.selectedChild()?.prenom }}
                  </p>
                </div>
                <svg class="w-4 h-4 text-slate-400 group-hover:text-tangerine transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Child Dropdown -->
              <div *ngIf="showChildDropdown" 
                   class="absolute top-full right-0 mt-3 w-64 glass rounded-[2rem] overflow-hidden z-[70] shadow-2xl animate-fade-in-down border border-white/20">
                <div class="p-4 border-b border-slate-200/50 dark:border-slate-700/50">
                  <span class="text-[10px] font-black text-slate-400 capitalize tracking-widest">Changer d'enfant</span>
                </div>
                <div class="max-h-60 overflow-y-auto custom-scrollbar">
                  <button *ngFor="let enfant of childState.children()" 
                          (click)="selectChild(enfant.id)"
                          class="w-full p-4 flex items-center space-x-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <div [class]="getAvatarClass(enfant.sexe)" 
                         class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white group-hover:scale-110 transition-transform shadow-md">
                      {{ enfant.prenom?.substring(0,1) }}{{ enfant.nom?.substring(0,1) }}
                    </div>
                    <div class="text-left">
                      <p class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ enfant.prenom }} {{ enfant.nom }}</p>
                      <p class="text-[10px] font-medium text-slate-400">{{ enfant.classe?.nom || 'Sans classe' }}</p>
                    </div>
                    <div *ngIf="childState.selectedChild()?.id === enfant.id" class="ml-auto">
                      <div class="w-2 h-2 rounded-full bg-tangerine shadow-[0_0_8px_#F08C21]"></div>
                    </div>
                  </button>
                </div>
                <div class="p-4 bg-slate-50/50 dark:bg-slate-800/50 text-center">
                  <a routerLink="/parent/enfants" (click)="showChildDropdown = false" class="text-[10px] font-black text-tangerine uppercase tracking-widest hover:underline">Voir tous mes enfants</a>
                </div>
              </div>
            </div>

            <!-- Notifications -->
            <div class="relative">
              <button class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-blush relative"
                      (click)="toggleNotifications($event)">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                <span *ngIf="notificationService.unreadCount() > 0" 
                      class="absolute top-2 right-2 w-2.5 h-2.5 bg-blush rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
              </button>

              <!-- Notifications Dropdown -->
              <div *ngIf="showNotifications" 
                   class="absolute top-full right-0 mt-3 w-80 glass rounded-3xl overflow-hidden z-[70] animate-in fade-in slide-in-from-top-2 duration-300">
                <div class="p-4 border-b border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center">
                  <span class="font-bold text-slate-800 dark:text-white">Notifications</span>
                  <button class="text-xs text-tangerine font-bold hover:underline" (click)="markAllRead($event)">Marquer lu</button>
                </div>
                <div class="max-h-96 overflow-y-auto custom-scrollbar">
                  <div *ngIf="notificationService.latestUnread().length === 0" class="p-8 text-center text-slate-400">
                    <p class="text-sm font-medium">Tout est en ordre ! ✨</p>
                  </div>
                  <div *ngFor="let notif of notificationService.latestUnread()" 
                       (click)="handleNotificationClick(notif, $event)"
                       class="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-100/50 dark:border-slate-700/30 transition-colors flex gap-3">
                    <div [class]="notificationService.getColorClass(notif.type)" class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm text-white">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getIconPath(notificationService.getIcon(notif.type))" />
                      </svg>
                    </div>
                    <div class="flex-1">
                      <p class="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{{ notif.title }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{{ notif.message }}</p>
                      <p class="text-[10px] text-slate-400 mt-1.5 font-medium">{{ getTimeAgo(notif.created_at) }}</p>
                    </div>
                  </div>
                </div>
                <button (click)="goToNotifications()" class="w-full p-4 text-center text-sm font-bold text-slate-500 hover:text-tangerine bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                  Voir tout
                </button>
              </div>
            </div>

            <!-- Profile & Logout -->
            <div class="flex items-center pl-4 border-l border-slate-200 dark:border-slate-700 space-x-3">
              <div class="relative group cursor-pointer" (click)="openProfileModal()">
                <img [src]="'https://ui-avatars.com/api/?name=' + getUserName() + '&background=F08C21&color=fff&bold=true'" 
                     class="w-10 h-10 rounded-xl border-2 border-white dark:border-slate-700 shadow-md group-hover:scale-110 transition-transform">
                <div class="absolute -top-1 -right-1 w-3 h-3 bg-matcha rounded-full border-2 border-white dark:border-slate-800"></div>
              </div>
              <button (click)="logout()" class="p-2.5 rounded-xl text-slate-400 hover:text-blush hover:bg-blush/10 transition-all">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Sidebar + Main Content -->
      <div class="pt-24 h-screen flex">
        
        <!-- Modern Floating Sidebar -->
        <aside class="w-80 h-[calc(100vh-8rem)] sticky top-24 ml-6 hidden lg:block z-50">
          <div class="h-full glass rounded-[2.5rem] p-6 flex flex-col shadow-2xl relative overflow-hidden">
            <!-- Gradient background effect -->
            <div class="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-tangerine/10 to-transparent pointer-events-none"></div>

            <div class="relative z-10 flex flex-col h-full">
              <div class="mb-10 px-4">
                <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Menu principal</p>
                <div class="space-y-1.5">
                  <a *ngFor="let item of sidebarItems()" 
                     [routerLink]="item.route"
                     routerLinkActive="active-link"
                     class="flex items-center space-x-4 px-5 py-3 rounded-2xl transition-all duration-300 group relative">
                    <div [class]="getModernIconClass(item.color)" 
                         class="w-10 h-10 rounded-xl flex items-center justify-center text-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      {{ item.emoji }}
                    </div>
                    <div class="flex-1">
                      <p class="font-bold text-[15px] text-slate-700 dark:text-slate-200">{{ item.title }}</p>
                      <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500">{{ item.subtitle }}</p>
                    </div>
                    <!-- Indicator -->
                    <div class="w-1.5 h-1.5 rounded-full bg-tangerine opacity-0 transition-opacity active-indicator"></div>
                  </a>
                </div>
              </div>

              <!-- Premium Support Sidebar Widget -->
              <div class="mt-auto p-6 bg-slate-900 dark:bg-slate-800 rounded-[2rem] text-white relative overflow-hidden group">
                <div class="absolute -right-4 -top-4 w-24 h-24 bg-tangerine rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700"></div>
                <div class="relative z-10">
                  <p class="text-xs font-bold text-tangerine mb-2">Support 24/7</p>
                  <h4 class="font-black text-lg leading-tight mb-4">Besoin d'aide ?</h4>
                  <button class="w-full py-2.5 bg-tangerine rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-tangerine/30">
                    Contacter nous
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Workspace -->
        <main class="flex-1 px-6 pb-6 overflow-y-auto relative z-10">
          <div class="min-h-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-[3rem] p-10 border border-white/20 dark:border-slate-800/50 shadow-sm relative overflow-hidden">
            
            <!-- Context Header -->
            <header class="mb-12 flex items-end justify-between">
              <div class="space-y-2">
                <div class="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  <span class="hover:text-tangerine cursor-pointer transition-colors">{{ userRole() }}</span>
                  <span>/</span>
                  <span class="text-tangerine">{{ getPageTitle() }}</span>
                </div>
                <div class="flex items-center gap-4">
                  <h2 class="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">
                    {{ getPageTitle() }}
                  </h2>
                  <span class="text-4xl animate-bounce-slow drop-shadow-lg">{{ getPageEmoji() }}</span>
                </div>
                <p class="text-slate-500 dark:text-slate-400 text-lg font-medium">{{ getPageSubtitle() }}</p>
              </div>

              <div class="hidden xl:flex items-center gap-4">
                 <div class="h-14 glass rounded-2xl flex items-center px-6 gap-3">
                    <div class="w-3 h-3 rounded-full bg-matcha shadow-[0_0_10px_#B4B534]"></div>
                    <span class="text-sm font-black text-slate-700 dark:text-slate-300">{{ getCurrentDay() }}</span>
                 </div>
              </div>
            </header>

            <router-outlet></router-outlet>
          </div>
        </main>
      </div>

      <!-- Profile Modern Modal -->
      <div *ngIf="showProfileModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-md animate-fade-in" (click)="closeProfileModal()"></div>
        
        <!-- Modal Content -->
        <div class="relative w-full max-w-2xl glass rounded-[3rem] shadow-2xl overflow-hidden animate-zoom-in border border-white/20">
          <!-- Modal Header -->
          <div class="bg-tangerine p-10 text-white relative overflow-hidden">
            <div class="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
            <div class="relative z-10 flex items-center space-x-8">
              <div class="relative group">
                <img [src]="'https://ui-avatars.com/api/?name=' + (userRole() === 'parent' ? profileData.prenom + ' ' + profileData.nom : profileData.name) + '&background=white&color=F08C21&bold=true&size=128'" 
                     class="w-28 h-28 rounded-[2rem] border-4 border-white/30 shadow-2xl group-hover:scale-105 transition-transform" [alt]="profileData.name">
                <div class="absolute -bottom-2 -right-2 w-10 h-10 bg-matcha rounded-2xl border-4 border-white dark:border-slate-800 flex items-center justify-center shadow-lg">
                  <div class="w-3 h-3 rounded-full bg-white animate-pulse"></div>
                </div>
              </div>
              <div>
                <h3 class="text-4xl font-black tracking-tight">
                  {{ userRole() === 'parent' ? (profileData.prenom + ' ' + profileData.nom) : profileData.name }}
                </h3>
                <div class="flex items-center gap-2 mt-2">
                  <span class="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest">{{ userRole() }}</span>
                </div>
              </div>
            </div>
            <button (click)="closeProfileModal()" class="absolute top-8 right-8 p-3 hover:bg-white/20 rounded-2xl transition-all">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-10 max-h-[60vh] overflow-y-auto custom-scrollbar bg-white/50 dark:bg-slate-900/50">
            <div class="space-y-8">
              <!-- Info Alert for Admin -->
              <div *ngIf="userRole() === 'admin'" class="bg-sea/10 border-2 border-sea/20 rounded-3xl p-6 flex items-center space-x-5">
                <div class="w-12 h-12 bg-sea rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-sea/30">ℹ️</div>
                <p class="text-sea font-bold text-sm">Les informations de profil administrateur ne sont pas éditables.</p>
              </div>

              <!-- General Fields (Name, Email) - Hidden/Adjusted for Parent -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8" *ngIf="userRole() !== 'parent'">
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Nom complet</label>
                  <input type="text" [(ngModel)]="profileData.name" [readonly]="userRole() === 'admin'"
                         class="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-tangerine rounded-[1.5rem] transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm"
                         [class.opacity-50]="userRole() === 'admin'">
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Email</label>
                  <input type="email" [(ngModel)]="profileData.email" [readonly]="userRole() === 'admin'"
                         class="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-tangerine rounded-[1.5rem] transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm"
                         [class.opacity-50]="userRole() === 'admin'">
                </div>
              </div>

              <!-- General Section for Parents -->
              <div class="grid grid-cols-1 gap-8" *ngIf="userRole() === 'parent'">
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Email (Lecture seule)</label>
                  <input type="email" [value]="profileData.email" readonly
                         class="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent rounded-[1.5rem] font-bold text-slate-500 dark:text-slate-400 outline-none opacity-50 cursor-not-allowed shadow-sm">
                </div>
              </div>

              <!-- Parent Specific Fields -->
              <div *ngIf="userRole() === 'parent'" class="space-y-8 animate-fade-in">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Prénom</label>
                    <input type="text" [(ngModel)]="profileData.prenom"
                           class="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-tangerine rounded-[1.5rem] transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm">
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Nom</label>
                    <input type="text" [(ngModel)]="profileData.nom"
                           class="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-tangerine rounded-[1.5rem] transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm">
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Téléphone</label>
                    <input type="text" [(ngModel)]="profileData.telephone"
                           class="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-tangerine rounded-[1.5rem] transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm">
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Profession</label>
                    <input type="text" [(ngModel)]="profileData.profession"
                           class="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-tangerine rounded-[1.5rem] transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm">
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Adresse</label>
                  <textarea [(ngModel)]="profileData.adresse" rows="2"
                         class="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-tangerine rounded-[1.5rem] transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm"></textarea>
                </div>
                <!-- Emergency Contact -->
                <div class="p-8 bg-blush/5 border-2 border-blush/10 rounded-[2rem] space-y-6">
                  <h4 class="text-sm font-black text-blush uppercase tracking-widest flex items-center gap-2">
                    <span>🆘</span> Contact d'urgence
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="space-y-2">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Nom du contact</label>
                      <input type="text" [(ngModel)]="profileData.contact_urgence_nom"
                             class="w-full px-6 py-4 bg-white dark:bg-slate-800 border-2 border-transparent focus:border-blush rounded-[1.5rem] transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm">
                    </div>
                    <div class="space-y-2">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Téléphone d'urgence</label>
                      <input type="text" [(ngModel)]="profileData.contact_urgence_telephone"
                             class="w-full px-6 py-4 bg-white dark:bg-slate-800 border-2 border-transparent focus:border-blush rounded-[1.5rem] transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm">
                    </div>
                  </div>
                </div>
              </div>

              <!-- Educateur Specific Fields -->
              <div *ngIf="userRole() === 'educateur'" class="space-y-8 animate-fade-in">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Téléphone</label>
                    <input type="text" [(ngModel)]="profileData.telephone"
                           class="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-tangerine rounded-[1.5rem] transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm">
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Diplôme</label>
                    <input type="text" [(ngModel)]="profileData.diplome"
                           class="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-tangerine rounded-[1.5rem] transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm">
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-butter/10 rounded-[2rem] border-2 border-butter/20">
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Date d'embauche</label>
                    <input type="text" [value]="profileData.date_embauche" readonly
                           class="w-full px-6 py-4 bg-white/50 dark:bg-slate-800/50 border-2 border-transparent rounded-[1.5rem] font-bold text-slate-500 dark:text-slate-400 outline-none opacity-70">
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Salaire</label>
                    <input type="text" [value]="profileData.salaire + ' DT'" readonly
                           class="w-full px-6 py-4 bg-white/50 dark:bg-slate-800/50 border-2 border-transparent rounded-[1.5rem] font-bold text-slate-500 dark:text-slate-400 outline-none opacity-70">
                  </div>
                </div>
              </div>

              <!-- Password Change Section -->
              <div *ngIf="userRole() !== 'admin'" class="space-y-6 pt-8 border-t border-slate-100 dark:border-slate-800">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">🔒</div>
                  <h4 class="font-black text-slate-800 dark:text-white uppercase tracking-tight">Sécurité</h4>
                </div>
                <div class="space-y-6">
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Mot de passe actuel</label>
                    <input type="password" [(ngModel)]="profileData.current_password" placeholder="Requis pour tout changement"
                           class="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-tangerine rounded-[1.5rem] transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm">
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="space-y-2">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Nouveau mot de passe</label>
                      <input type="password" [(ngModel)]="profileData.password"
                             class="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-tangerine rounded-[1.5rem] transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm">
                    </div>
                    <div *ngIf="userRole() === 'parent'" class="space-y-2">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Confirmer mot de passe</label>
                      <input type="password" [(ngModel)]="profileData.password_confirmation"
                             class="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-tangerine rounded-[1.5rem] transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-10 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex justify-end space-x-5">
            <button (click)="closeProfileModal()" 
                    class="px-8 py-4 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-2xl font-black hover:bg-slate-100 dark:hover:bg-slate-600 transition-all border border-slate-200 dark:border-slate-600">
              Annuler
            </button>
            <button *ngIf="userRole() !== 'admin'"
                    (click)="saveProfile()"
                    [disabled]="isSaving"
                    class="relative px-12 py-4 btn-tangerine disabled:opacity-50 overflow-hidden group">
               <span [class.opacity-0]="isSaving">Enregistrer</span>
               <div *ngIf="isSaving" class="absolute inset-0 flex items-center justify-center">
                  <svg class="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
               </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .animate-zoom-in {
      animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes zoomIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #ec4899 0%, #f97316 100%);
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #db2777 0%, #ea580c 100%);
    }

    .active-nav-item {
      box-shadow: 0 4px 15px -3px rgba(0, 0, 0, 0.15);
    }

    @keyframes blob {
      0%, 100% { transform: translate(0, 0) scale(1); }
      25% { transform: translate(20px, -30px) scale(1.1); }
      50% { transform: translate(-20px, 20px) scale(0.9); }
      75% { transform: translate(30px, 10px) scale(1.05); }
    }

    .animate-blob {
      animation: blob 7s infinite;
    }

    .animation-delay-2000 {
      animation-delay: 2s;
    }

    .animation-delay-4000 {
      animation-delay: 4s;
    }

    @keyframes bounce-slow {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .animate-bounce-slow {
      animation: bounce-slow 3s ease-in-out infinite;
    }
    
    .animate-fade-in-down {
        animation: fadeInDown 0.2s ease-out;
    }
    
    @keyframes fadeInDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
  `]
})
export class AppLayoutComponent implements OnInit {
  auth = inject(AuthService);
  childState = inject(ChildStateService);
  themeService = inject(ThemeService);
  sidebarOpen = signal(false);
  showChildDropdown = false;
  showNotifications = false;
  showProfileModal = false;
  isSaving = false;

  userRole = signal<string>('');
  userName = signal<string>('');

  profileData: any = {
    name: '',
    email: '',
    nom: '',
    prenom: '',
    profession: '',
    telephone: '',
    adresse: '',
    contact_urgence_nom: '',
    contact_urgence_telephone: '',
    diplome: '',
    date_embauche: '',
    salaire: 0,
    photo: '',
    current_password: '',
    password: '',
    password_confirmation: ''
  };

  notificationService = inject(NotificationService);
  private profileService = inject(ProfileApiService);
  private router = inject(Router);

  private allNavItems: NavItem[] = [
    {
      title: 'Dashboard',
      subtitle: 'Overview',
      route: '/admin',
      icon: '<svg></svg>',
      emoji: '🏠',
      color: 'blue',
      roles: ['admin', 'educateur', 'parent']
    },
    {
      title: 'Éducateurs',
      subtitle: 'Staff management',
      route: '/admin/educateurs',
      icon: '<svg></svg>',
      emoji: '👩‍🏫',
      color: 'green',
      roles: ['admin']
    },
    {
      title: 'Inscriptions',
      subtitle: 'Kids & classes',
      route: '/admin/classes',
      icon: '<svg></svg>',
      emoji: '👶',
      color: 'purple',
      roles: ['admin', 'educateur']
    },
    {
      title: 'Affectations',
      subtitle: 'Assign students',
      route: '/admin/affectations',
      icon: '<svg></svg>',
      emoji: '📋',
      color: 'indigo',
      roles: ['admin']
    },
    {
      title: 'Parents',
      subtitle: 'Family info',
      route: '/admin/inscriptions',
      icon: '<svg></svg>',
      emoji: '👨‍👩‍👧',
      color: 'pink',
      roles: ['admin']
    },
    {
      title: 'Activities',
      subtitle: 'Browse & Enroll',
      route: '/parent/activites',
      icon: '<svg></svg>',
      emoji: '🎨',
      color: 'orange',
      roles: ['parent']
    },
    {
      title: 'Subjects',
      subtitle: 'Curriculum & Levels',
      route: '/admin/matieres/par-niveau',
      icon: '<svg></svg>',
      emoji: '📚',
      color: 'blue',
      roles: ['admin']
    },
    {
      title: 'Activities',
      subtitle: 'Manage activities',
      route: '/admin/activites',
      icon: '<svg></svg>',
      emoji: '🎨',
      color: 'orange',
      roles: ['admin']
    },
    {
      title: 'Calendrier',
      subtitle: 'Schedule',
      route: '/admin/emplois',
      icon: '<svg></svg>',
      emoji: '📅',
      color: 'yellow',
      roles: ['admin', 'educateur']
    },
    {
      title: 'Menus',
      subtitle: 'Food planning',
      route: '/admin/menus',
      icon: '<svg></svg>',
      emoji: '🍎',
      color: 'red',
      roles: ['admin']
    },
    {
      title: 'Holidays',
      subtitle: 'Days off',
      route: '/admin/holidays',
      icon: '<svg></svg>',
      emoji: '🎉',
      color: 'teal',
      roles: ['admin', 'educateur']
    },
    {
      title: 'Events',
      subtitle: 'Special days',
      route: '/admin/events',
      icon: '<svg></svg>',
      emoji: '⭐',
      color: 'indigo',
      roles: ['admin', 'educateur', 'parent']
    }
  ];

  sidebarItems = computed(() => {
    const role = this.getUserRole();
    const dashboardRoute = this.getDashboardRoute();

    return this.allNavItems.map(item => {
      if (item.title === 'Dashboard') {
        return { ...item, route: dashboardRoute };
      }
      return item;
    }).filter(item => item.roles.includes(role));
  });

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.relative')) {
      this.showChildDropdown = false;
      this.showNotifications = false;
    }
  }

  ngOnInit() {
    this.userRole.set(this.auth.getRole() || '');
    this.userName.set(this.getUserName());

    // Set initial data for modal if already available
    this.profileData.name = this.userName();
    this.profileData.email = localStorage.getItem('sk_user_email') || '';
  }

  openProfileModal() {
    this.showProfileModal = true;
    const role = this.userRole();

    if (role === 'admin') {
      this.profileService.getAdminProfile().subscribe(res => {
        this.profileData = { ...this.profileData, ...res.user };
      });
    } else if (role === 'educateur') {
      this.profileService.getEducateurProfile().subscribe(res => {
        // According to EducateurController.php getProfile()
        const data = res.data;
        this.profileData = {
          ...this.profileData,
          ...data,
          name: data.name,
          email: data.email,
          diplome: data.diplome,
          date_embauche: data.date_embauche,
          salaire: data.salaire,
          telephone: data.telephone,
          photo: data.photo
        };
      });
    } else if (role === 'parent') {
      this.profileService.getParentProfile().subscribe(res => {
        // According to ParentController.php profile()
        const data = res.data;
        this.profileData = {
          ...this.profileData,
          ...data,
          name: data.user?.name,
          email: data.user?.email,
          nom: data.nom,
          prenom: data.prenom,
          profession: data.profession,
          telephone: data.telephone,
          adresse: data.adresse,
          contact_urgence_nom: data.contact_urgence_nom,
          contact_urgence_telephone: data.contact_urgence_telephone
        };
      });
    }
  }

  closeProfileModal() {
    this.showProfileModal = false;
  }

  saveProfile() {
    this.isSaving = true;
    const role = this.userRole();

    // Construct clean payload to avoid 422 errors and unwanted field updates
    const payload: any = {};

    if (role === 'educateur') {
      payload.name = this.profileData.name;
      payload.email = this.profileData.email;
      payload.diplome = this.profileData.diplome;
      payload.telephone = this.profileData.telephone;
      payload.photo = this.profileData.photo;

      if (this.profileData.password && this.profileData.password.trim() !== '') {
        payload.password = this.profileData.password;
        payload.current_password = this.profileData.current_password;
      }
    } else if (role === 'parent') {
      payload.nom = this.profileData.nom;
      payload.prenom = this.profileData.prenom;
      payload.profession = this.profileData.profession;
      payload.telephone = this.profileData.telephone;
      payload.adresse = this.profileData.adresse;
      payload.contact_urgence_nom = this.profileData.contact_urgence_nom;
      payload.contact_urgence_telephone = this.profileData.contact_urgence_telephone;

      if (this.profileData.password && this.profileData.password.trim() !== '') {
        payload.password = this.profileData.password;
        payload.password_confirmation = this.profileData.password_confirmation;
        payload.current_password = this.profileData.current_password;
      }
    }

    let obs$;
    if (role === 'educateur') {
      obs$ = this.profileService.updateEducateurProfile(payload);
    } else if (role === 'parent') {
      obs$ = this.profileService.updateParentProfile(payload);
    }

    if (obs$) {
      obs$.pipe(finalize(() => this.isSaving = false))
        .subscribe({
          next: () => {
            // Update local storage if name changed
            const nameToUpdate = role === 'parent'
              ? `${this.profileData.prenom} ${this.profileData.nom}`.trim()
              : this.profileData.name;

            if (nameToUpdate !== this.userName()) {
              localStorage.setItem('sk_user_name', nameToUpdate);
              this.userName.set(nameToUpdate);
            }
            this.closeProfileModal();
            // Clear passwords
            this.profileData.current_password = '';
            this.profileData.password = '';
            this.profileData.password_confirmation = '';
          },
          error: (err) => {
            console.error('Error updating profile:', err);
            // Optional: display error message to user
          }
        });
    } else {
      this.isSaving = false;
      this.closeProfileModal();
    }
  }

  toggleChildDropdown(event: Event) {
    event.stopPropagation();
    this.showChildDropdown = !this.showChildDropdown;
  }

  selectChild(id: number) {
    this.childState.selectChild(id);
    this.showChildDropdown = false;

    // Synchronize URL if on a child-specific page
    const url = this.router.url;
    const childIdPatterns = [
      { regex: /(\/parent\/enfants\/)\d+/, replacement: `$1${id}` },
      { regex: /(\/parent\/activites\/enfant\/)\d+/, replacement: `$1${id}` }
    ];

    for (const pattern of childIdPatterns) {
      if (pattern.regex.test(url)) {
        const newUrl = url.replace(pattern.regex, pattern.replacement);
        if (newUrl !== url) {
          this.router.navigateByUrl(newUrl);
        }
        break;
      }
    }
  }

  getChildInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getAvatarClass(sexe: string): string {
    if (sexe === 'M' || sexe === 'garçon') {
      return 'bg-gradient-to-br from-sea to-blue-600';
    }
    return 'bg-gradient-to-br from-blush to-purple-600';
  }

  getModernIconClass(color: string): string {
    const isActive = this.isActive(this.allNavItems.find(item => item.color === color)?.route || '');
    if (isActive) {
      return this.getIconBgClass(color) + ' text-white shadow-lg';
    }
    const colorMap: Record<string, string> = {
      blue: 'bg-sea/10 text-sea',
      green: 'bg-matcha/10 text-matcha',
      purple: 'bg-indigo-100 text-indigo-500',
      pink: 'bg-blush/10 text-blush',
      orange: 'bg-tangerine/10 text-tangerine',
      yellow: 'bg-butter/20 text-tangerine',
      red: 'bg-red-50 text-red-500',
      teal: 'bg-teal-50 text-teal-600',
      indigo: 'bg-indigo-50 text-indigo-600'
    };
    return colorMap[color] || colorMap['blue'];
  }

  getIconBgClass(color: string): string {
    const classes: Record<string, string> = {
      blue: 'bg-sea',
      green: 'bg-matcha',
      purple: 'bg-indigo-500',
      pink: 'bg-blush',
      orange: 'bg-tangerine',
      yellow: 'bg-tangerine',
      red: 'bg-red-500',
      teal: 'bg-teal-500',
      indigo: 'bg-indigo-500'
    };
    return classes[color] || classes['blue'];
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  getUserName(): string {
    return localStorage.getItem('sk_user_name') || 'Admin';
  }

  getUserRole(): string {
    return this.auth.getRole() || 'admin';
  }

  getDashboardRoute(): string {
    const role = this.getUserRole();
    return role === 'admin' ? '/admin' : role === 'educateur' ? '/educateur' : '/parent';
  }

  getCurrentDay(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'short' });
  }

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('/menus')) return 'Menus';
    if (url.includes('/activites')) return 'Activities';
    if (url.includes('/emplois')) return 'Calendrier';
    if (url.includes('/classes')) return 'Inscriptions';
    if (url.includes('/educateurs')) return 'Éducateurs';
    if (url.includes('/inscriptions')) return 'Parents';
    if (url.includes('/holidays')) return 'Holidays';
    if (url.includes('/events')) return 'Events';
    if (url.includes('/chat')) return 'Chat';
    return 'Dashboard';
  }

  getPageSubtitle(): string {
    const url = this.router.url;
    if (url.includes('/menus')) return 'Plan healthy meals for our kids';
    if (url.includes('/activites')) return 'Fun learning activities';
    if (url.includes('/emplois')) return 'Schedule and timetables';
    if (url.includes('/classes')) return 'Manage students and classes';
    if (url.includes('/educateurs')) return 'Teacher management';
    if (url.includes('/inscriptions')) return 'Parent information';
    if (url.includes('/holidays')) return 'Holiday calendar';
    if (url.includes('/events')) return 'Special events';
    return 'Welcome to your admin panel';
  }

  getPageEmoji(): string {
    const url = this.router.url;
    if (url.includes('/menus')) return '🍎';
    if (url.includes('/activites')) return '🎨';
    if (url.includes('/emplois')) return '📅';
    if (url.includes('/classes')) return '👶';
    if (url.includes('/educateurs')) return '👩‍🏫';
    if (url.includes('/inscriptions')) return '👨‍👩‍👧';
    if (url.includes('/holidays')) return '🎉';
    if (url.includes('/events')) return '⭐';
    return '🏠';
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.childState.clear();
      this.router.navigate(['/login']);
    });
  }

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    // Close other dropdowns
    this.showChildDropdown = false;

    if (this.showNotifications) {
      this.notificationService.refreshUnread();
    }
  }

  handleNotificationClick(notif: AppNotification, event: Event) {
    event.stopPropagation();
    this.showNotifications = false;
    this.notificationService.handleClick(notif);
  }

  markAllRead(event: Event) {
    event.stopPropagation();
    this.notificationService.markAllAsRead();
  }

  goToNotifications() {
    this.showNotifications = false;
    this.router.navigate(['/parent/notifications']);
  }

  getTimeAgo(date: string): string {
    const diff = new Date().getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return 'À l\'instant';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Il y a ${days} j`;

    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  getIconPath(iconName: string): string {
    const icons: Record<string, string> = {
      'user-check': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'alert-triangle': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      'check-circle': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'file-text': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'star': 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      'clock': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      'x-circle': 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      'credit-card': 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      'utensils': 'M12 4v16m8-8H4',
      'alert-octagon': 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'message-circle': 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
      'file': 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
      'bell-ringing': 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      'bell': 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
    };
    return icons[iconName] || icons['bell'];
  }
}