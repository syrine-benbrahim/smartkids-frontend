import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNotification, NotificationService } from '../../../services/notification.service';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-notifications-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="card p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-black text-gray-800 tracking-tight">Notifications</h1>
            <p class="text-gray-600 font-medium">Restez informé de la vie de vos enfants</p>
          </div>
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto">
          <div class="flex bg-gray-100 p-1 rounded-xl">
            <button 
              (click)="filter.set('all')"
              class="px-4 py-2 rounded-lg text-sm font-bold transition-all"
              [class]="filter() === 'all' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'">
              Toutes
            </button>
            <button 
              (click)="filter.set('unread')"
              class="px-4 py-2 rounded-lg text-sm font-bold transition-all"
              [class]="filter() === 'unread' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'">
              Non lues
            </button>
          </div>
          
          <button 
            (click)="markAllRead()"
            class="flex items-center gap-2 px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-xl font-bold text-sm transition-colors whitespace-nowrap">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            Tout lire
          </button>
        </div>
      </div>

      <!-- List -->
      <div class="card overflow-hidden">
        @if (filteredNotifications().length === 0) {
          <div class="p-12 text-center">
            <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-600 mb-1">Aucune notification</h3>
            <p class="text-gray-400 text-sm">Vous êtes à jour !</p>
          </div>
        } @else {
          <div class="divide-y divide-gray-100">
            @for (notif of filteredNotifications(); track notif.id) {
              <div 
                (click)="handleClick(notif)"
                class="p-4 hover:bg-pink-50/50 transition-colors cursor-pointer group flex gap-4 items-start relative">
                
                <!-- Unread Indicator -->
                <div *ngIf="!notif.is_read" class="absolute left-0 top-0 bottom-0 w-1 bg-pink-500"></div>

                <!-- Icon -->
                <div [class]="notificationService.getColorClass(notif.type) + ' w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform'">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getIconPath(notificationService.getIcon(notif.type))" />
                   </svg>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start mb-1">
                    <h3 class="font-bold text-gray-800 text-base group-hover:text-pink-600 transition-colors truncate pr-4">
                      {{ notif.title }}
                    </h3>
                    <span class="text-xs font-medium text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-1 rounded-lg">
                      {{ getTimeAgo(notif.created_at) }}
                    </span>
                  </div>
                  <p class="text-gray-600 text-sm leading-relaxed mb-2">
                    {{ notif.message }}
                  </p>
                  
                  @if (!notif.is_read) {
                     <span class="inline-flex items-center text-xs font-bold text-pink-500 mt-1">
                        <span class="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                        Non lue
                     </span>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
    styles: [`
    .card {
      @apply bg-white rounded-3xl shadow-lg border border-gray-200;
      /* removed p-6 from general card class to allow flush lists */
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

        if (seconds < 60) return 'À l\'instant';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `Il y a ${minutes} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Il y a ${hours} h`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `Il y a ${days} j`;

        return new Date(date).toLocaleDateString();
    }

    getIconPath(iconName: string): string {
        // Reusing the same paths (could be extracted to a shared util, but duplication is fine for now)
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
