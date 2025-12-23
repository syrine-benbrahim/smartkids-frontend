import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { interval, switchMap, tap, startWith, filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export type NotificationType =
    // Presence & School Life
    | 'PRESENCE_CHECKIN' | 'ABSENCE_INATTENDUE' | 'VALIDATION_ABSENCE' | 'RAPPORT_JOURNEE'
    // Activities & Events
    | 'ACTIVITY_NEW' | 'ACTIVITY_REMINDER' | 'ACTIVITY_CANCELLED' | 'INVOICE_NEW' | 'paiement'
    // Health & Menus
    | 'MENU_UPDATE' | 'ALERTE_ALLERGENE'
    // Chat & Admin
    | 'CHAT_MESSAGE' | 'DOCUMENT_PARTAGE' | 'URGENCY';

export interface AppNotification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string; // ISO date
    data?: {
        url?: string;
        enfant_id?: number | string;
        room_id?: string;
        [key: string]: any;
    };
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private http = inject(HttpClient);
    private router = inject(Router);

    // State
    private _unreadCount = signal(0);
    private _latestUnread = signal<AppNotification[]>([]);
    private _allNotifications = signal<AppNotification[]>([]);

    // Public Signals
    readonly unreadCount = computed(() => this._unreadCount());
    readonly latestUnread = computed(() => this._latestUnread());
    readonly allNotifications = computed(() => this._allNotifications());

    constructor() {
        // Start polling for count every 60s
        interval(60000).pipe(
            startWith(0),
            takeUntilDestroyed(),
            switchMap(() => this.fetchCount())
        ).subscribe();

        // Initial fetch of unread
        this.refreshUnread();
    }

    // --- API ---

    fetchCount() {
        return this.http.get<{ count: number }>(`${environment.apiUrl}/notifications/count`).pipe(
            tap(res => this._unreadCount.set(res.count))
        );
    }

    private mapBackendNotification(n: any): AppNotification {
        return {
            id: n.id,
            type: n.type,
            title: n.titre, // Map 'titre' to 'title'
            message: n.message,
            is_read: n.lu, // Map 'lu' to 'is_read'
            created_at: n.created_at,
            data: n.data
        };
    }

    fetchUnread() {
        return this.http.get<{ data: { data: any[] } }>(`${environment.apiUrl}/notifications/non-lues`).pipe(
            tap(res => {
                // Handle pagination structure: res.data.data
                const rawData = res?.data?.data || (Array.isArray(res?.data) ? res.data : []);
                const mappedData = Array.isArray(rawData) ? rawData.map(n => this.mapBackendNotification(n)) : [];
                this._latestUnread.set(mappedData);
            })
        );
    }

    fetchAll() {
        return this.http.get<{ data: { data: any[] } }>(`${environment.apiUrl}/notifications`).pipe(
            tap(res => {
                // Handle pagination structure: res.data.data
                const rawData = res?.data?.data || (Array.isArray(res?.data) ? res.data : []);
                const mappedData = Array.isArray(rawData) ? rawData.map(n => this.mapBackendNotification(n)) : [];
                this._allNotifications.set(mappedData);
            })
        );
    }

    markAsRead(id: string) {
        // Optimistic update
        this._unreadCount.update(c => Math.max(0, c - 1));
        this._latestUnread.update(list => list.filter(n => n.id !== id));
        this._allNotifications.update(list => list.map(n => n.id === id ? { ...n, is_read: true } : n));

        return this.http.post(`${environment.apiUrl}/notifications/${id}/lire`, {}).subscribe({
            error: () => {
                // Revert on error (simplified)
                this.fetchCount().subscribe();
                this.refreshUnread();
            }
        });
    }

    markAllAsRead() {
        this._unreadCount.set(0);
        this._latestUnread.set([]);
        this._allNotifications.update(list => list.map(n => ({ ...n, is_read: true })));

        return this.http.post(`${environment.apiUrl}/notifications/mark-all-read`, {}).subscribe(); // Assumed endpoint
    }

    refreshUnread() {
        this.fetchCount().subscribe();
        this.fetchUnread().subscribe();
    }

    // --- Redirect Logic ---

    handleClick(notification: AppNotification) {
        if (!notification.is_read) {
            this.markAsRead(notification.id);
        }
        this.handleRedirect(notification);
    }

    handleRedirect(notification: AppNotification) {
        // User Provided URL
        if (notification.data?.url) {
            this.router.navigateByUrl(notification.data.url);
            return;
        }

        // Type-based routing
        switch (notification.type) {
            // A. Presence
            case 'PRESENCE_CHECKIN':
                this.router.navigate(['/parent/presence']);
                break;
            case 'ABSENCE_INATTENDUE':
                // Potentially open modal check or redirect
                this.router.navigate(['/parent/presence']);
                break;
            case 'VALIDATION_ABSENCE':
                this.router.navigate(['/parent/presence/historique']);
                break;
            case 'RAPPORT_JOURNEE':
                if (notification.data?.enfant_id) {
                    this.router.navigate(['/parent/enfants', notification.data.enfant_id, 'rapports']);
                } else {
                    this.router.navigate(['/parent']); // Fallback
                }
                break;

            // B. Activities
            case 'ACTIVITY_NEW':
                this.router.navigate(['/parent/activites/disponibles']);
                break;
            case 'ACTIVITY_REMINDER':
            case 'ACTIVITY_CANCELLED':
                this.router.navigate(['/parent/activites/mes-activites']);
                break;
            case 'INVOICE_NEW':
            case 'paiement':
                this.router.navigate(['/parent/paiements']); // or /parent/activites/historique
                break;

            // C. Health
            case 'MENU_UPDATE':
                this.router.navigate(['/parent/menus']);
                break;
            case 'ALERTE_ALLERGENE':
                this.router.navigate(['/parent/menus']);
                break;

            // D. Chat & Admin
            case 'CHAT_MESSAGE':
                if (notification.data?.room_id) {
                    this.router.navigate(['/parent/chat/room', notification.data.room_id]);
                } else {
                    this.router.navigate(['/parent/chat']);
                }
                break;
            case 'DOCUMENT_PARTAGE':
                this.router.navigate(['/parent/documents']);
                break;
            case 'URGENCY':
                // Logic for modal alert would go here, maybe triggering a separate layout signal
                alert(`URGENCE: ${notification.title}\n${notification.message}`);
                break;

            default:
                console.warn('Unknown notification type:', notification.type);
                // Default to home or notifications list
                this.router.navigate(['/parent/notifications']);
        }
    }

    // --- Visuals Helpers ---
    getIcon(type: NotificationType): string {
        // Returns basic icon name (FontAwesome or custom SVG identifier)
        // The component will map this to actual SVG
        switch (type) {
            case 'PRESENCE_CHECKIN': return 'user-check';
            case 'ABSENCE_INATTENDUE': return 'alert-triangle';
            case 'VALIDATION_ABSENCE': return 'check-circle';
            case 'RAPPORT_JOURNEE': return 'file-text';
            case 'ACTIVITY_NEW': return 'star';
            case 'ACTIVITY_REMINDER': return 'clock';
            case 'ACTIVITY_CANCELLED': return 'x-circle';
            case 'INVOICE_NEW':
            case 'paiement': return 'credit-card';
            case 'MENU_UPDATE': return 'utensils';
            case 'ALERTE_ALLERGENE': return 'alert-octagon';
            case 'CHAT_MESSAGE': return 'message-circle';
            case 'DOCUMENT_PARTAGE': return 'file';
            case 'URGENCY': return 'bell-ringing';
            default: return 'bell';
        }
    }

    getColorClass(type: NotificationType): string {
        switch (type) {
            case 'PRESENCE_CHECKIN': return 'text-green-500 bg-green-100';
            case 'ABSENCE_INATTENDUE': // Red
            case 'ACTIVITY_CANCELLED':
            case 'ALERTE_ALLERGENE':
            case 'URGENCY':
                return 'text-red-500 bg-red-100';

            case 'VALIDATION_ABSENCE': // Blue
            case 'CHAT_MESSAGE':
                return 'text-blue-500 bg-blue-100';

            case 'RAPPORT_JOURNEE': return 'text-indigo-500 bg-indigo-100';

            case 'ACTIVITY_NEW': return 'text-amber-500 bg-amber-100';
            case 'ACTIVITY_REMINDER': return 'text-orange-500 bg-orange-100';

            case 'INVOICE_NEW':
            case 'paiement': return 'text-emerald-500 bg-emerald-100';

            case 'MENU_UPDATE': return 'text-teal-500 bg-teal-100';

            case 'DOCUMENT_PARTAGE': return 'text-gray-500 bg-gray-100';

            default: return 'text-gray-500 bg-gray-100';
        }
    }
}
