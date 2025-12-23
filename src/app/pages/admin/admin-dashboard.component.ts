// admin-dashboard.component.ts - Unified Design
import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardApiService, DashboardResponse } from '../../services/dashboard-api.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (isLoading()) {
      <div class="flex items-center justify-center min-h-[600px]">
        <div class="relative w-24 h-24">
          <div class="absolute inset-0 border-4 border-pink-200 rounded-full animate-ping"></div>
          <div class="absolute inset-2 border-4 border-pink-500 rounded-full animate-spin"></div>
          <div class="absolute inset-0 flex items-center justify-center text-2xl">🎨</div>
        </div>
      </div>
    } @else if (errorMessage()) {
      <div class="bg-red-50 border-4 border-red-200 rounded-3xl p-12 text-center max-w-2xl mx-auto my-12">
        <div class="text-6xl mb-4">😰</div>
        <h2 class="text-2xl font-black text-red-900 mb-2">Oops! Something went wrong</h2>
        <p class="text-red-700 mb-6 font-semibold">{{ errorMessage() }}</p>
        <button (click)="loadDashboardData()" 
                class="px-8 py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all shadow-lg hover:shadow-xl">
          🔄 Try Again
        </button>
      </div>
    } @else if (dashboardData(); as data) {
      <!-- Welcome Banner with Playful Design -->
      <div class="bg-gradient-to-br from-pink-500 via-orange-500 to-yellow-500 rounded-3xl p-8 mb-8 relative overflow-hidden shadow-xl">
        <!-- Decorative elements -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        
        <div class="relative z-10">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-black text-white mb-2">Welcome back, {{ getUserName() }}! 👋</h1>
              <p class="text-white/90 text-lg">Here's what's happening with your kindergarten today</p>
            </div>
            <div class="hidden lg:flex items-center space-x-3">
              <div class="text-right">
                <p class="text-white/90 text-sm">Today's Date</p>
                <p class="text-white text-lg font-bold">{{ getCurrentDate() }}</p>
              </div>
              <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Grid with Playful Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <!-- Students Card -->
        <div class="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-4 border-blue-100">
          <div class="flex items-center justify-between mb-4">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </div>
            <div class="text-blue-500 text-2xl animate-bounce-slow">👶</div>
          </div>
          <div>
            <p class="text-gray-600 text-sm font-bold mb-1 uppercase tracking-wide">Total Students</p>
            <p class="text-4xl font-black text-gray-900 mb-2">{{ data.data.statistics.children.total }}</p>
            <div class="flex items-center text-green-600 text-sm font-semibold">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
              </svg>
              +{{ data.data.statistics.children.new_this_month }} new this month
            </div>
          </div>
        </div>

        <!-- Teachers Card -->
        <div class="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-4 border-green-100">
          <div class="flex items-center justify-between mb-4">
            <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <div class="text-green-500 text-2xl animate-bounce-slow" style="animation-delay: 0.1s;">👩‍🏫</div>
          </div>
          <div>
            <p class="text-gray-600 text-sm font-bold mb-1 uppercase tracking-wide">Teachers</p>
            <p class="text-4xl font-black text-gray-900 mb-2">{{ data.data.statistics.staff.total_educators }}</p>
            <div class="flex items-center text-green-600 text-sm font-semibold">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
              </svg>
              {{ data.data.statistics.staff.total_classes }} active classes
            </div>
          </div>
        </div>

        <!-- Attendance Card -->
        <div class="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-4 border-purple-100">
          <div class="flex items-center justify-between mb-4">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
            <div class="text-purple-500 text-2xl animate-bounce-slow" style="animation-delay: 0.2s;">📊</div>
          </div>
          <div>
            <p class="text-gray-600 text-sm font-bold mb-1 uppercase tracking-wide">Attendance Today</p>
            <p class="text-4xl font-black text-gray-900 mb-2">{{ data.data.statistics.attendance.today.rate }}%</p>
            <div class="flex items-center text-purple-600 text-sm font-semibold">
              <span class="mr-1">👥</span>
              {{ data.data.statistics.attendance.today.present }} present / {{ data.data.statistics.attendance.today.absent }} absent
            </div>
          </div>
        </div>

        <!-- Payments Card -->
        <div class="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-4 border-yellow-100">
          <div class="flex items-center justify-between mb-4">
            <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="text-yellow-500 text-2xl animate-bounce-slow" style="animation-delay: 0.3s;">💰</div>
          </div>
          <div>
            <p class="text-gray-600 text-sm font-bold mb-1 uppercase tracking-wide">Pending Payments</p>
            <p class="text-4xl font-black text-gray-900 mb-2">{{ data.data.statistics.payments.pending }}</p>
            <div class="flex items-center text-yellow-600 text-sm font-semibold">
              <span class="mr-1">💶</span>
              {{ data.data.statistics.payments.pending_amount }} {{ data.data.statistics.payments.currency }}
            </div>
          </div>
        </div>
      </div>

      <!-- Charts & Tables Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Attendance Trend Chart -->
        <div class="bg-white rounded-3xl p-8 shadow-sm border-4 border-pink-100">
          <h3 class="text-xl font-black text-gray-900 mb-6 flex items-center">
            <span class="w-2 h-8 bg-gradient-to-b from-pink-500 to-orange-500 rounded-full mr-3"></span>
            Attendance Trend
          </h3>
          <div class="h-64 flex items-end justify-between gap-4">
            @for (day of data.data.charts_data.attendance_trend; track day.date) {
              <div class="flex-1 flex flex-col items-center gap-2 group">
                <div class="w-full relative">
                  <div [style.height.%]="day.rate" class="w-full bg-gradient-to-t from-pink-500 to-pink-400 rounded-t-2xl group-hover:scale-105 transition-all shadow-lg min-h-[4px]"></div>
                  <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-pink-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {{ day.rate }}%
                  </div>
                </div>
                <span class="text-[10px] font-bold text-gray-600 mt-2 rotate-45 lg:rotate-0">{{ day.date | date:'EEE' }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Upcoming Events / Today's Events -->
        <div class="bg-white rounded-3xl p-6 shadow-sm border-4 border-orange-100">
          <h3 class="text-xl font-black text-gray-900 mb-4 flex items-center">
            <span class="w-2 h-8 bg-gradient-to-b from-orange-500 to-yellow-500 rounded-full mr-3"></span>
            Upcoming Events
          </h3>
          <div class="space-y-4 max-h-[256px] overflow-y-auto pr-2 custom-scrollbar">
            @for (event of data.data.upcoming_events; track event.id) {
              <div class="flex items-start gap-3 p-3 bg-gradient-to-r from-pink-50 to-orange-50 rounded-2xl border-2 border-pink-200">
                <div class="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg text-xl">
                  📅
                </div>
                <div class="flex-1">
                  <p class="text-sm font-bold text-gray-900">{{ event.title }}</p>
                  <p class="text-xs text-gray-600">{{ event.date | date:'mediumDate' }} - {{ event.time }}</p>
                  <p class="text-[10px] font-semibold text-pink-600">{{ event.participants_expected }} participants expected</p>
                </div>
              </div>
            } @empty {
              <div class="text-center py-8">
                <p class="text-gray-500 font-bold italic">No upcoming events scheduled</p>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Recent Activities Table -->
      <div class="bg-white rounded-3xl p-8 shadow-sm border-4 border-blue-100 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-black text-gray-900 flex items-center">
            <span class="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></span>
            Recent Activities
          </h3>
          <a routerLink="/admin/inscriptions" class="text-blue-600 font-bold hover:underline">View All</a>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b-2 border-gray-100">
                <th class="text-left py-4 px-4 text-xs font-black text-gray-500 uppercase">Description</th>
                <th class="text-left py-4 px-4 text-xs font-black text-gray-500 uppercase">Type</th>
                <th class="text-left py-4 px-4 text-xs font-black text-gray-500 uppercase">Time</th>
              </tr>
            </thead>
            <tbody>
              @for (activity of data.data.recent_activities; track activity.id) {
                <tr class="border-b border-gray-50 hover:bg-blue-50/50 transition-colors">
                  <td class="py-4 px-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        <i [class]="'fas fa-' + activity.icon"></i>
                      </div>
                      <div>
                        <p class="font-bold text-gray-900 text-sm">{{ activity.title }}</p>
                        <p class="text-xs text-gray-500">{{ activity.description }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="py-4 px-4">
                    <span class="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-600 uppercase">
                      {{ activity.type }}
                    </span>
                  </td>
                  <td class="py-4 px-4 text-xs text-gray-500">
                    {{ activity.timestamp | date:'short' }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }

    @keyframes bounce-slow {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    .animate-bounce-slow {
      animation: bounce-slow 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-20px);
      }
    }

    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardApiService);

  dashboardData = signal<DashboardResponse | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading.set(true);
    this.dashboardService.getDashboardData()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.dashboardData.set(data);
          this.errorMessage.set(null);
        },
        error: (err) => {
          console.error('Error fetching dashboard data:', err);
          this.errorMessage.set('Failed to load dashboard data. Please try again later.');
        }
      });
  }

  getUserName(): string {
    return localStorage.getItem('sk_user_name') || 'Admin';
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}