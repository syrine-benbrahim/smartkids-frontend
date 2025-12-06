// src/app/shared/layout/app-layout.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';

interface NavItem {
  title: string;
  subtitle?: string;
  route: string;
  icon: string;
  badge?: string | number;
  roles: string[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-purple-50">
      
      <!-- Fixed Top Navigation -->
      <nav class="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl shadow-lg z-50 border-b border-pink-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-20">
            
            <!-- Logo & Menu Toggle -->
            <div class="flex items-center space-x-4">
              <!-- Mobile Menu Button -->
              <button 
                (click)="toggleSidebar()" 
                class="lg:hidden p-2 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:shadow-lg transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        [attr.d]="sidebarOpen() ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'"/>
                </svg>
              </button>

              <!-- Logo -->
              <a routerLink="/home" class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition">
                  <span class="text-white text-2xl font-bold">SK</span>
                </div>
                <div class="hidden sm:block">
                  <h1 class="text-2xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                    SmartKids
                  </h1>
                  <p class="text-xs text-gray-600">Kindergarten</p>
                </div>
              </a>
            </div>

            <!-- Desktop Quick Actions -->
            <div class="hidden md:flex items-center space-x-2">
              <a *ngFor="let item of topNavItems()" 
                 [routerLink]="item.route"
                 routerLinkActive="bg-gradient-to-r from-pink-100 to-orange-100 text-pink-700"
                 class="px-4 py-2 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition flex items-center space-x-2">
                <span [innerHTML]="item.icon"></span>
                <span>{{ item.title }}</span>
                <span *ngIf="item.badge" 
                      class="ml-2 px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                  {{ item.badge }}
                </span>
              </a>
            </div>

            <!-- User Menu -->
            <div class="flex items-center space-x-4">
              <!-- Notifications -->
              <button class="relative p-2 rounded-xl hover:bg-pink-100 transition">
                <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118.6 14.6V11a6 6 0 10-12 0v3.6c0 .53-.214 1.04-.595 1.395L4 17h5m6 0v1a3 3 0 11-6 0v-1"/>
                </svg>
                <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  3
                </span>
              </button>

              <!-- User Avatar & Info -->
              <div class="flex items-center space-x-3">
                <div class="hidden sm:block text-right">
                  <p class="text-sm font-semibold text-gray-800">{{ getUserName() }}</p>
                  <p class="text-xs text-gray-600 capitalize">{{ getUserRole() }}</p>
                </div>
                <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                  <span class="text-white font-bold">{{ getUserInitials() }}</span>
                </div>
              </div>

              <!-- Logout -->
              <button 
                (click)="logout()"
                class="p-2 rounded-xl hover:bg-red-100 text-gray-700 hover:text-red-600 transition"
                title="Se déconnecter">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M17 16l4-4m0 0l-4-4m4 4H7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div class="flex pt-20">
        
        <!-- Sidebar -->
        <aside class="fixed left-0 top-20 bottom-0 z-40 transition-all duration-300"
               [ngClass]="sidebarOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
               [style.width]="sidebarCollapsed() ? '80px' : '320px'">
          
          <!-- Sidebar Content -->
          <div class="h-full bg-white/90 backdrop-blur-xl shadow-2xl border-r border-pink-100 overflow-hidden">
            
            <!-- Collapse Toggle -->
            <div class="p-4 border-b border-pink-100 flex justify-end">
              <button 
                (click)="toggleCollapse()"
                class="p-2 rounded-xl hover:bg-pink-100 transition">
                <svg class="w-5 h-5 text-gray-700 transform transition-transform" 
                     [class.rotate-180]="sidebarCollapsed()"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
            </div>

            <!-- Navigation Items -->
            <nav class="p-4 space-y-2 overflow-y-auto h-[calc(100vh-180px)]">
              <a *ngFor="let item of sidebarItems()"
                 [routerLink]="item.route"
                 routerLinkActive="bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg"
                 [routerLinkActiveOptions]="{ exact: item.route === getDashboardRoute() }"
                 class="flex items-center space-x-3 p-3 rounded-2xl hover:bg-pink-100 transition group"
                 [class.justify-center]="sidebarCollapsed()"
                 [title]="sidebarCollapsed() ? item.title : ''">
                
                <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-orange-400 group-hover:scale-110 transition flex-shrink-0"
                     [class.bg-white]="isActive(item.route)"
                     [class.from-pink-600]="isActive(item.route)"
                     [class.to-orange-600]="isActive(item.route)">
                  <span [innerHTML]="item.icon" 
                        class="w-5 h-5"
                        [class.text-white]="!isActive(item.route)"
                        [class.text-pink-600]="isActive(item.route)"></span>
                </div>

                <div *ngIf="!sidebarCollapsed()" class="flex-1">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-semibold">{{ item.title }}</p>
                      <p *ngIf="item.subtitle" class="text-xs opacity-80">{{ item.subtitle }}</p>
                    </div>
                    <span *ngIf="item.badge" 
                          class="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                      {{ item.badge }}
                    </span>
                  </div>
                </div>
              </a>
            </nav>

            <!-- Profile Section -->
            <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-pink-100 bg-white/50">
              <div class="flex items-center space-x-3 p-3 rounded-2xl bg-gradient-to-r from-purple-100 to-pink-100"
                   [class.justify-center]="sidebarCollapsed()">
                <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <div *ngIf="!sidebarCollapsed()" class="flex-1">
                  <p class="font-semibold text-gray-800">{{ getUserName() }}</p>
                  <p class="text-xs text-gray-600 capitalize">{{ getUserRole() }}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Mobile Overlay -->
        <div *ngIf="sidebarOpen() && isMobile()" 
             (click)="toggleSidebar()"
             class="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"></div>

        <!-- Main Content Area -->
        <main class="flex-1 transition-all duration-300 min-h-screen"
              [ngClass]="sidebarCollapsed() ? 'lg:ml-20' : 'lg:ml-80'">
          <div class="p-6 lg:p-8">
            <!-- Page Header Card -->
            <div class="mb-6 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl p-6">
              <div class="flex items-center justify-between">
                <div>
                  <h1 class="text-3xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent mb-2">
                    {{ getPageTitle() }}
                  </h1>
                  <p class="text-gray-600">{{ getPageSubtitle() }}</p>
                </div>
                <div class="hidden md:flex items-center space-x-3">
                  <div class="text-right">
                    <p class="text-sm text-gray-600">{{ getCurrentDate() }}</p>
                    <div class="flex items-center justify-end gap-2 mt-1">
                      <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span class="text-xs text-green-600 font-medium">En ligne</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Router Outlet - Content goes here -->
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    /* Smooth scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: rgba(255, 192, 203, 0.1);
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #ec4899 0%, #f97316 100%);
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #db2777 0%, #ea580c 100%);
    }

    /* Background clip text support */
    .bg-clip-text {
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `]
})
export class AppLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  sidebarOpen = signal(false);
  sidebarCollapsed = signal(false);

  // Navigation items based on role
  private allNavItems: NavItem[] = [
    {
      title: 'Dashboard',
      subtitle: 'Vue d\'ensemble',
      route: '/admin',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
      roles: ['admin', 'educateur', 'parent']
    },
    {
      title: 'Menus',
      subtitle: 'Planification repas',
      route: '/admin/menus',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
      roles: ['admin']
    },
    {
      title: 'Activités',
      subtitle: 'Activités pédagogiques',
      route: '/admin/activites',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      roles: ['admin', 'parent']
    },
    {
      title: 'Emplois du temps',
      subtitle: 'Gestion des horaires',
      route: '/admin/emplois',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
      roles: ['admin', 'educateur']
    },
    {
      title: 'Chat Classes',
      subtitle: 'Communication',
      route: '/chat',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>',
      badge: 3,
      roles: ['admin', 'educateur', 'parent']
    },
    {
      title: 'Classes',
      subtitle: 'Gestion des classes',
      route: '/admin/classes',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>',
      roles: ['admin', 'educateur']
    },
    {
      title: 'Éducateurs',
      subtitle: 'Équipe pédagogique',
      route: '/admin/educateurs',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
      roles: ['admin']
    },
    {
      title: 'Inscriptions',
      subtitle: 'Demandes d\'inscription',
      route: '/admin/inscriptions',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
      roles: ['admin']
    },
    {
      title: 'Mes Enfants',
      subtitle: 'Suivi des enfants',
      route: '/parent/activites/enfants',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>',
      roles: ['parent']
    }
  ];

  // Computed navigation items based on user role
  sidebarItems = computed(() => {
    const role = this.getUserRole();
    return this.allNavItems.filter(item => item.roles.includes(role));
  });

  topNavItems = computed(() => {
    const role = this.getUserRole();
    return [
      { title: 'Chat', route: '/chat', icon: '💬', badge: 3, roles: ['admin', 'educateur', 'parent'] },
      { title: 'Dashboard', route: this.getDashboardRoute(), icon: '🏠', roles: ['admin', 'educateur', 'parent'] }
    ].filter(item => item.roles.includes(role));
  });

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  toggleCollapse() {
    this.sidebarCollapsed.update(v => !v);
  }

  isMobile(): boolean {
    return typeof window !== 'undefined' ? window.innerWidth < 1024 : false;
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  getUserName(): string {
    return localStorage.getItem('sk_user_name') || 'Utilisateur';
  }

  getUserRole(): string {
    return this.auth.getRole() || 'guest';
  }

  getUserInitials(): string {
    const name = this.getUserName();
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getDashboardRoute(): string {
    const role = this.getUserRole();
    return role === 'admin' ? '/admin' : role === 'educateur' ? '/educateur' : '/parent';
  }

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('/menus')) return 'Gestion des Menus';
    if (url.includes('/activites')) return 'Activités Pédagogiques';
    if (url.includes('/emplois')) return 'Emplois du Temps';
    if (url.includes('/classes')) return 'Gestion des Classes';
    if (url.includes('/educateurs')) return 'Équipe Pédagogique';
    if (url.includes('/inscriptions')) return 'Inscriptions';
    if (url.includes('/chat')) return 'Communication';
    if (url.includes('/admin')) return 'Tableau de Bord Admin';
    if (url.includes('/educateur')) return 'Tableau de Bord Éducateur';
    if (url.includes('/parent')) return 'Espace Parent';
    return 'Dashboard';
  }

  getPageSubtitle(): string {
    const url = this.router.url;
    if (url.includes('/menus')) return 'Planification et gestion des repas';
    if (url.includes('/activites')) return 'Planification des activités';
    if (url.includes('/emplois')) return 'Organisation des horaires';
    if (url.includes('/classes')) return 'Configuration des classes';
    if (url.includes('/educateurs')) return 'Gestion de l\'équipe';
    if (url.includes('/inscriptions')) return 'Traitement des demandes';
    if (url.includes('/chat')) return 'Messagerie instantanée';
    return 'Bienvenue sur SmartKids';
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}