import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNotification, NotificationService } from '../../../services/notification.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-4 sm:p-8 space-y-12 animate-fade-in text-slate-800 dark:text-slate-100">
      
      <!-- Premium Header -->
      <div class="relative group">
        <div class="absolute -inset-1 bg-gradient-to-r from-blush via-tangerine to-blush rounded-[3rem] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
        <div class="relative flex flex-col lg:flex-row items-center justify-between gap-8 p-10 card-fancy overflow-hidden">
          <div class="flex items-center gap-8 relative z-10">
            <div class="w-20 h-20 bg-gradient-to-br from-blush to-tangerine rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-blush/30 text-3xl font-black text-white transform group-hover:scale-110 transition-transform">
              🔔
            </div>
            <div>
              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
                Notifications
              </h1>
              <p class="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-lg leading-relaxed">
                Restez connecté aux étapes clés de la vie scolaire de vos enfants.
              </p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full lg:w-auto">
            <div class="flex bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl w-full sm:w-auto">
              <button (click)="filter.set('all')"
                      [class]="filter() === 'all' ? 'bg-white dark:bg-slate-700 shadow-md text-blush' : 'text-slate-500 hover:text-slate-700'"
                      class="flex-1 sm:flex-none px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                Toutes
              </button>
              <button (click)="filter.set('unread')"
                      [class]="filter() === 'unread' ? 'bg-white dark:bg-slate-700 shadow-md text-blush' : 'text-slate-500 hover:text-slate-700'"
                      class="flex-1 sm:flex-none px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                Non lues
              </button>
            </div>
            
            <button (click)="markAllRead()"
                    class="w-full sm:w-auto px-8 py-4 glass dark:bg-slate-800/60 rounded-2xl font-black text-[10px] uppercase tracking-widest text-blush hover:bg-white transition-all border-white/40 border flex items-center justify-center gap-3">
              <svg class="w-5 h-5 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
              </svg>
              Tout marquer lu
            </button>
          </div>
        </div>
      </div>

      <!-- Feed Container -->
      <div class="space-y-6">
        <div *ngIf="filteredNotifications().length === 0" class="text-center py-24 card-fancy border-dashed border-2 border-white/20">
          <div class="text-6xl mb-6 opacity-30 group-hover:scale-110 transition-transform duration-500">📭</div>
          <h3 class="text-2xl font-black mb-2 uppercase tracking-widest">Boîte de réception vide</h3>
          <p class="text-slate-500 font-medium italic">Aucune notification à afficher pour le moment.</p>
        </div>

        <div *ngIf="filteredNotifications().length > 0" class="space-y-4">
          @for (notif of filteredNotifications(); track notif.id) {
            <div (click)="handleClick(notif)"
                 [class.border-l-blush]="!notif.is_read"
                 class="group relative glass dark:bg-slate-800/40 rounded-[2.5rem] border-white/60 p-8 hover:border-blush transition-all shadow-sm cursor-pointer flex flex-col md:flex-row gap-8 items-start md:items-center">
              
              <div [class]="notificationService.getColorClass(notif.type)"
                   class="w-16 h-16 rounded-[1.2rem] flex items-center justify-center flex-shrink-0 text-2xl shadow-xl group-hover:scale-110 transition-transform">
                 <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" [attr.d]="getIconPath(notificationService.getIcon(notif.type))" />
                 </svg>
              </div>

              <div class="flex-1 space-y-2 min-w-0">
                 <div class="flex flex-wrap items-center justify-between gap-4">
                    <h3 class="text-xl font-black tracking-tight group-hover:text-blush transition-colors flex items-center gap-3">
                       {{ notif.title }}
                       <div *ngIf="!notif.is_read" class="w-2 h-2 bg-blush rounded-full animate-pulse"></div>
                    </h3>
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-600">
                       {{ getTimeAgo(notif.created_at) }}
                    </span>
                 </div>
                 <p class="text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-4xl">
                    {{ notif.message }}
                 </p>
              </div>

              <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div class="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-blush transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                 </div>
              </div>
            </div>
          }
        </div>
      </div>

    </div>
  `,
  styles: [`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeInUp 0.8s ease-out forwards;
    }
  `]
})
export class NotificationsListComponent {
  notificationService = inject(NotificationService);

  filter = signal<'all' | 'unread'>('all');

  filteredNotifications = computed(() => {
    const all = this.notificationService.allNotifications();
    if (this.filter() === 'unread') {
      return all.filter(n => !n.is_read);
    }
    return all;
  });

  constructor() {
    this.notificationService.fetchAll().subscribe();
  }

  markAllRead() {
    this.notificationService.markAllAsRead();
  }

  handleClick(notif: AppNotification) {
    this.notificationService.handleClick(notif);
  }

  getTimeAgo(date: string): string {
    const diff = new Date().getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return "À l'instant";
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
      'star': 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
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
