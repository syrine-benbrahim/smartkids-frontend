// src/app/shared/layout/app-layout.component.ts
import { Component, inject, signal, computed, ViewChild, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ChildStateService } from '../../services/child-state.service';
import { NotificationService, AppNotification } from '../../services/notification.service';
import { FormsModule } from '@angular/forms';

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
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 relative overflow-hidden">
      
      <!-- Playful Background Decorations -->
      <div class="fixed inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-20 right-20 w-32 h-32 bg-pink-200 rounded-full opacity-20 animate-blob"></div>
        <div class="absolute top-40 left-20 w-40 h-40 bg-yellow-200 rounded-full opacity-20 animate-blob animation-delay-2000"></div>
        <div class="absolute bottom-20 right-40 w-36 h-36 bg-blue-200 rounded-full opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <!-- Enhanced Top Navigation -->
      <nav class="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-lg z-50 border-b-4 border-gradient-to-r from-pink-300 via-orange-300 to-yellow-300">
        <div class="px-6">
          <div class="flex justify-between items-center h-20">
            
            <!-- Left side - Logo & Search -->
            <div class="flex items-center space-x-6 flex-1">
              <!-- Playful Logo -->
              <a routerLink="/home" class="flex items-center space-x-3 group">
                <div class="relative w-14 h-14 bg-gradient-to-br from-pink-500 via-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                  <div class="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-xs">✨</div>
                </div>
                <div>
                  <h1 class="text-2xl font-black bg-gradient-to-r from-pink-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">SmartKids</h1>
                  <p class="text-xs font-bold text-gray-600">Kindergarten Magic ✨</p>
                </div>
              </a>

              <!-- Playful Search Bar -->
              <div class="hidden md:flex items-center flex-1 max-w-md">
                <div class="relative w-full group">
                  <input 
                    type="text" 
                    placeholder="Search for anything..."
                    class="w-full pl-12 pr-4 py-3 bg-gradient-to-r from-pink-50 to-orange-50 border-3 border-pink-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-400 transition-all placeholder-gray-500">
                  <div class="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right side - Actions & User -->
            <div class="flex items-center space-x-3">
              <!-- Child Selector for Parents -->
              <div *ngIf="userRole() === 'parent' && childState.children().length > 0" class="relative hidden md:block">
                <div class="flex items-center bg-pink-50 rounded-2xl px-3 py-1.5 border-2 border-pink-100 hover:border-pink-300 transition-colors cursor-pointer"
                     (click)="toggleChildDropdown($event)">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm mr-2 shadow-sm">
                    {{ getChildInitials(childState.selectedChild()?.nom_complet || '') }}
                  </div>
                  <div class="flex flex-col mr-2">
                    <span class="text-xs text-pink-400 font-bold uppercase tracking-wider">Enfant</span>
                    <span class="text-sm font-bold text-gray-700 leading-none">
                      {{ childState.selectedChild()?.nom_complet?.split(' ')?.[0] || 'Sélectionner' }}
                    </span>
                  </div>
                  <svg class="w-4 h-4 text-pink-400 transform transition-transform" 
                       [class.rotate-180]="showChildDropdown"
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>

                <!-- Dropdown -->
                <div *ngIf="showChildDropdown" 
                     class="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border-2 border-pink-100 overflow-hidden z-50 animate-fade-in-down">
                  <div class="p-2 space-y-1">
                    <button *ngFor="let child of childState.children()"
                            (click)="selectChild(child.id)"
                            class="w-full flex items-center p-2 rounded-xl hover:bg-pink-50 transition-colors group"
                            [class.bg-pink-50]="child.id === childState.selectedChild()?.id">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 shadow-sm transition-transform group-hover:scale-110"
                           [ngClass]="child.sexe === 'M' || child.sexe === 'garçon' ? 'bg-gradient-to-br from-blue-400 to-indigo-500' : 'bg-gradient-to-br from-pink-400 to-purple-500'">
                        {{ getChildInitials(child.nom_complet) }}
                      </div>
                      <div class="text-left flex-1">
                        <p class="text-sm font-bold text-gray-800">{{ child.nom_complet }}</p>
                        <p class="text-xs text-gray-500">{{ child.classe?.nom || 'Sans classe' }}</p>
                      </div>
                      <div *ngIf="child.id === childState.selectedChild()?.id" class="w-2 h-2 rounded-full bg-pink-500"></div>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Notifications -->
              <div class="relative hidden sm:block">
                <button class="relative p-3 hover:bg-pink-100 rounded-2xl transition-all group" (click)="toggleNotifications($event)">
                  <svg class="w-6 h-6 text-gray-700 group-hover:text-pink-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                  </svg>
                  <span *ngIf="notificationService.unreadCount() > 0" class="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                </button>

                <!-- Dropdown -->
                <div *ngIf="showNotifications" class="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border-2 border-pink-100 overflow-hidden z-50 animate-fade-in-down transform origin-top-right">
                   <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <h3 class="font-bold text-gray-800">Notifications</h3>
                      <button class="text-xs text-pink-500 font-bold hover:underline" (click)="markAllRead($event)">Tout marquer comme lu</button>
                   </div>
                   
                   <div class="max-h-96 overflow-y-auto custom-scrollbar">
                      <div *ngIf="notificationService.latestUnread().length === 0" class="p-8 text-center flex flex-col items-center">
                         <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                            </svg>
                         </div>
                         <p class="text-gray-500 text-sm font-medium">Aucune nouvelle notification.</p>
                      </div>

                      <div *ngFor="let notif of notificationService.latestUnread()" 
                           (click)="handleNotificationClick(notif, $event)"
                           class="p-3 hover:bg-pink-50 cursor-pointer border-b border-gray-50 transition-colors flex gap-3 items-start relative group">
                           
                           <div [class]="'w-2 h-2 rounded-full absolute top-4 right-2 bg-pink-500 transition-opacity'" *ngIf="!notif.is_read"></div>
                           
                           <!-- Icon Box -->
                           <div [class]="notificationService.getColorClass(notif.type) + ' w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm'">
                               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getIconPath(notificationService.getIcon(notif.type))" />
                               </svg>
                           </div>
                           
                           <div class="flex-1 pr-3">
                              <p class="text-sm font-bold text-gray-800 leading-snug group-hover:text-pink-600 transition-colors">{{ notif.title }}</p>
                              <p class="text-xs text-gray-600 line-clamp-2 mt-0.5">{{ notif.message }}</p>
                              <p class="text-[10px] text-gray-400 font-medium mt-1">{{ getTimeAgo(notif.created_at) }}</p>
                           </div>
                      </div>
                   </div>
                   
                   <div class="p-3 bg-gray-50 border-t border-gray-100 text-center hover:bg-gray-100 transition-colors cursor-pointer" (click)="goToNotifications()">
                      <span class="text-xs font-bold text-gray-600 hover:text-pink-600 flex items-center justify-center gap-1">
                        Voir toutes les notifications
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                      </span>
                   </div>
                </div>
              </div>

              <!-- Messages -->
              <button class="relative p-3 hover:bg-blue-100 rounded-2xl transition-all group">
                <svg class="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
                <span class="absolute top-2 right-2 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">3</span>
              </button>

              <!-- User Menu -->
              <div class="flex items-center space-x-3 pl-4 border-l-2 border-gray-200">
                <div class="relative">
                  <img [src]="'https://ui-avatars.com/api/?name=' + getUserName() + '&background=random&color=fff&bold=true'" 
                       class="w-12 h-12 rounded-2xl border-3 border-gradient-to-br from-pink-400 to-orange-400 shadow-lg hover:scale-110 transition-transform cursor-pointer" 
                       [alt]="getUserName()">
                  <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <!-- Logout Button (Icon only for mobile, text for desktop) -->
                <button (click)="logout()" class="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Déconnexion">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                   </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Layout -->
      <div class="pt-24 flex min-h-screen">
        
        <!-- Sidebar -->
        <aside class="w-72 fixed h-[calc(100vh-6rem)] left-0 top-24 m-4 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50 hidden lg:block transition-all hover:bg-white/90 z-40">
          <div class="h-full overflow-y-auto custom-scrollbar p-6">
            
            <div class="mb-8 px-4">
              <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Menu Principal</h3>
              <div class="space-y-2">
                <a *ngFor="let item of sidebarItems()" 
                   [routerLink]="item.route"
                   [class]="getNavItemClass(item.color)"
                   class="flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden">
                   
                  <!-- Active Indicator -->
                  <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                       [class]="getIconBgClass(item.color) + ' opacity-10'"></div>
                  
                  <div [class]="getIconBgClass(item.color)" 
                       class="relative w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-md group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    {{ item.emoji }}
                  </div>
                  
                  <div class="flex-1 relative">
                    <p class="font-bold text-base tracking-wide">{{ item.title }}</p>
                    <p class="text-xs font-medium opacity-70">{{ item.subtitle }}</p>
                  </div>

                  <!-- Active Dot -->
                  <div *ngIf="isActive(item.route)" 
                       class="w-2 h-2 rounded-full bg-current shadow-[0_0_10px_currentColor]"></div>
                </a>
              </div>
            </div>

            <!-- Promotion Card -->
            <div class="mt-auto bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl group cursor-pointer hover:scale-105 transition-transform duration-300">
              <div class="absolute top-0 right-0 w-32 h-32 bg-white rounded-full opacity-10 -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-pink-500 rounded-full opacity-20 -ml-12 -mb-12 animate-pulse"></div>
              
              <div class="relative z-10">
                <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:rotate-12 transition-transform">
                  🚀
                </div>
                <h4 class="font-black text-lg mb-1">Pass Premium</h4>
                <p class="text-indigo-100 text-sm mb-4">Accédez à plus de fonctionnalités !</p>
                <button class="w-full py-2 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg">
                  Découvrir
                </button>
              </div>
            </div>

          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 lg:ml-80 mr-4 mb-4 bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/50 p-8 min-h-[calc(100vh-8rem)] relative overflow-hidden">
          
          <!-- Content Background -->
          <div class="absolute inset-0 pointer-events-none overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 opacity-30"></div>
          </div>

          <!-- Breadcrumb & Header -->
          <header class="mb-8 flex items-end justify-between relative z-10">
            <div>
              <div class="flex items-center space-x-2 text-sm font-medium text-gray-500 mb-2">
                <span class="bg-white/50 px-2 py-1 rounded-lg">Admin</span>
                <span class="text-gray-300">/</span>
                <span class="bg-white/50 px-2 py-1 rounded-lg text-pink-600">{{ getPageTitle() }}</span>
              </div>
              <h2 class="text-4xl font-black text-gray-800 tracking-tight flex items-center gap-3">
                <span class="bg-gradient-to-br from-pink-500 to-orange-500 bg-clip-text text-transparent">
                  {{ getPageTitle() }}
                </span>
                <span class="text-3xl animate-bounce-slow">{{ getPageEmoji() }}</span>
              </h2>
              <p class="text-gray-500 font-medium mt-1">{{ getPageSubtitle() }}</p>
            </div>
            
            <div class="hidden xl:flex items-center space-x-4">
              <div class="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span class="text-sm font-bold text-gray-600">Système opérationnel</span>
              </div>
              <div class="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-gray-100 font-mono text-sm font-bold text-indigo-600">
                {{ getCurrentDay() }}
              </div>
            </div>
          </header>

          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
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
  auth = inject(AuthService); // Public for template
  childState = inject(ChildStateService);
  notificationService = inject(NotificationService);
  private router = inject(Router);

  sidebarOpen = signal(false);
  showChildDropdown = false;
  showNotifications = false;

  userRole = signal<string>('');
  userName = signal<string>('');

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
      title: 'Teachers',
      subtitle: 'Staff management',
      route: '/admin/educateurs',
      icon: '<svg></svg>',
      emoji: '👩‍🏫',
      color: 'green',
      roles: ['admin']
    },
    {
      title: 'Students',
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
      title: 'Activities',
      subtitle: 'Manage activities',
      route: '/admin/activites',
      icon: '<svg></svg>',
      emoji: '🎨',
      color: 'orange',
      roles: ['admin']
    },
    {
      title: 'Calendar',
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
    return this.allNavItems.filter(item => item.roles.includes(role));
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
  }

  toggleChildDropdown(event: Event) {
    event.stopPropagation();
    this.showChildDropdown = !this.showChildDropdown;
  }

  selectChild(id: number) {
    this.childState.selectChild(id);
    this.showChildDropdown = false;
  }

  getChildInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getNavItemClass(color: string): string {
    const isActive = this.isActive(this.allNavItems.find(item => item.color === color)?.route || '');
    if (isActive) {
      return this.getActiveClass(color);
    }
    return this.getHoverClass(color);
  }

  getHoverClass(color: string): string {
    const classes: Record<string, string> = {
      blue: 'hover:from-blue-100 hover:to-blue-200 text-gray-700',
      green: 'hover:from-green-100 hover:to-green-200 text-gray-700',
      purple: 'hover:from-purple-100 hover:to-purple-200 text-gray-700',
      pink: 'hover:from-pink-100 hover:to-pink-200 text-gray-700',
      orange: 'hover:from-orange-100 hover:to-orange-200 text-gray-700',
      yellow: 'hover:from-yellow-100 hover:to-yellow-200 text-gray-700',
      red: 'hover:from-red-100 hover:to-red-200 text-gray-700',
      teal: 'hover:from-teal-100 hover:to-teal-200 text-gray-700',
      indigo: 'hover:from-indigo-100 hover:to-indigo-200 text-gray-700'
    };
    return classes[color] || classes['blue'];
  }

  getActiveClass(color: string): string {
    const classes: Record<string, string> = {
      blue: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
      green: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
      purple: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
      pink: 'bg-gradient-to-r from-pink-500 to-pink-600 text-white',
      orange: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
      yellow: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
      red: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
      teal: 'bg-gradient-to-r from-teal-500 to-teal-600 text-white',
      indigo: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'
    };
    return classes[color] || classes['blue'];
  }

  getIconBgClass(color: string): string {
    const classes: Record<string, string> = {
      blue: 'bg-gradient-to-br from-blue-400 to-blue-600',
      green: 'bg-gradient-to-br from-green-400 to-green-600',
      purple: 'bg-gradient-to-br from-purple-400 to-purple-600',
      pink: 'bg-gradient-to-br from-pink-400 to-pink-600',
      orange: 'bg-gradient-to-br from-orange-400 to-orange-600',
      yellow: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      red: 'bg-gradient-to-br from-red-400 to-red-600',
      teal: 'bg-gradient-to-br from-teal-400 to-teal-600',
      indigo: 'bg-gradient-to-br from-indigo-400 to-indigo-600'
    };
    return classes[color] || classes['blue'];
  }

  getGlowClass(color: string): string {
    const classes: Record<string, string> = {
      blue: 'from-blue-400 to-blue-600',
      green: 'from-green-400 to-green-600',
      purple: 'from-purple-400 to-purple-600',
      pink: 'from-pink-400 to-pink-600',
      orange: 'from-orange-400 to-orange-600',
      yellow: 'from-yellow-400 to-yellow-600',
      red: 'from-red-400 to-red-600',
      teal: 'from-teal-400 to-teal-600',
      indigo: 'from-indigo-400 to-indigo-600'
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
    if (url.includes('/emplois')) return 'Calendar';
    if (url.includes('/classes')) return 'Students';
    if (url.includes('/educateurs')) return 'Teachers';
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