import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface DashboardStats {
    children: {
        total: number;
        active: number;
        new_this_month: number;
        by_age_group: { age_range: string; count: number }[];
    };
    staff: {
        total_educators: number;
        total_classes: number;
        active_today: number;
        by_role: { role: string; count: number }[];
    };
    attendance: {
        today: { present: number; absent: number; rate: number };
        this_week: { average_rate: number; total_absences: number };
        this_month: { average_rate: number; trend: string };
    };
    payments: {
        total_this_month: number;
        pending: number;
        pending_amount: number;
        overdue: number;
        overdue_amount: number;
        currency: string;
    };
}

export interface RecentActivity {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    icon: string;
}

export interface RecentPayment {
    id: number;
    family_name: string;
    amount: number;
    status: string;
    date: string;
    method: string;
}

export interface UpcomingEvent {
    id: number;
    title: string;
    date: string;
    time: string;
    participants_expected: number;
}

export interface DashboardNotification {
    id: number;
    type: string;
    priority: string;
    title: string;
    message: string;
    action_url: string;
    created_at: string;
}

export interface ChartsData {
    attendance_trend: { date: string; rate: number }[];
    enrollments_by_month: { month: string; count: number }[];
}

export interface DashboardResponse {
    success: boolean;
    data: {
        statistics: DashboardStats;
        recent_activities: RecentActivity[];
        recent_payments: RecentPayment[];
        upcoming_events: UpcomingEvent[];
        notifications: DashboardNotification[];
        charts_data: ChartsData;
    };
    timestamp: string;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardApiService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/admin/dashboard`;

    getDashboardData(): Observable<DashboardResponse> {
        return this.http.get<DashboardResponse>(this.baseUrl);
    }

    getDetailedStatistics(type: string): Observable<any> {
        return this.http.get(`${this.baseUrl}/statistics`, { params: { type } });
    }

    getActivities(limit: number = 20): Observable<any> {
        return this.http.get(`${this.baseUrl}/activities`, { params: { limit } });
    }

    exportData(): Observable<any> {
        return this.http.post(`${this.baseUrl}/export`, {});
    }
}
