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
    <div class="p-4 sm:p-8 space-y-12 animate-fade-in text-slate-800 dark:text-slate-100">
      @if (isLoading()) {
        <div class="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div class="relative w-20 h-20">
            <div class="absolute inset-0 border-4 border-sea/20 rounded-full animate-ping"></div>
            <div class="absolute inset-2 border-4 border-sea rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Chargement de la console...</p>
        </div>
      } @else if (errorMessage()) {
        <div class="p-12 glass bg-blush/5 border-blush/20 rounded-[3rem] text-center max-w-2xl mx-auto my-12">
          <div class="text-6xl mb-6">⚠️</div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Erreur de Synchronisation</h2>
          <p class="text-slate-500 font-medium mb-8">{{ errorMessage() }}</p>
          <button (click)="loadDashboardData()" 
                  class="px-10 py-4 bg-blush text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blush/30">
            Réessayer
          </button>
        </div>
      } @else if (dashboardData(); as data) {
        <!-- Premium Header Area -->
        <div class="relative group">
          <div class="absolute -inset-1 bg-gradient-to-r from-sea via-tangerine to-blush rounded-[3rem] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
          <div class="relative flex flex-col lg:flex-row items-center justify-between gap-8 p-10 glass dark:bg-slate-800/40 rounded-[3rem] overflow-hidden">
            <div class="flex items-center gap-8 relative z-10">
              <div class="w-20 h-20 bg-gradient-to-br from-sea to-blue-600 rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-sea/30 text-3xl font-black text-white transform group-hover:scale-110 transition-transform">
                👑
              </div>
              <div>
                <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
                  Bonjour, {{ getUserName() }} !
                </h1>
                <p class="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-lg leading-relaxed">
                  Voici l'état actuel de votre établissement pour la journée du <br><span class="text-sea font-black">{{ getCurrentDate() }}</span>.
                </p>
              </div>
            </div>

            <div class="hidden lg:flex flex-col items-end relative z-10">
              <div class="px-6 py-3 bg-white/50 dark:bg-slate-700/50 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm flex items-center gap-4">
                 <div class="w-3 h-3 bg-matcha rounded-full animate-pulse"></div>
                 <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Système Opérationnel</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Dynamic Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <!-- Children Stat -->
          <div class="group relative">
            <div class="absolute -inset-0.5 bg-gradient-to-r from-sea to-blue-400 rounded-[2.5rem] blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
            <div class="relative glass dark:bg-slate-800/40 p-8 rounded-[2.5rem] border-white/60 hover:border-sea/50 transition-all flex flex-col gap-6">
              <div class="flex items-center justify-between">
                <div class="w-14 h-14 bg-sea/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                  👶
                </div>
                <span class="text-[10px] font-black text-sea uppercase tracking-widest bg-sea/5 px-3 py-1.5 rounded-lg border border-sea/10">
                  Élèves
                </span>
              </div>
              <div>
                <p class="text-4xl font-black tracking-tighter mb-2">{{ data.data.statistics.children.total }}</p>
                <div class="flex items-center gap-2 text-matcha font-black text-[10px] uppercase tracking-widest">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                  </svg>
                  +{{ data.data.statistics.children.new_this_month }} ce mois
                </div>
              </div>
            </div>
          </div>

          <!-- Educators Stat -->
          <div class="group relative">
            <div class="absolute -inset-0.5 bg-gradient-to-r from-tangerine to-orange-400 rounded-[2.5rem] blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
            <div class="relative glass dark:bg-slate-800/40 p-8 rounded-[2.5rem] border-white/60 hover:border-tangerine/50 transition-all flex flex-col gap-6">
              <div class="flex items-center justify-between">
                <div class="w-14 h-14 bg-tangerine/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                  👩‍🏫
                </div>
                <span class="text-[10px] font-black text-tangerine uppercase tracking-widest bg-tangerine/5 px-3 py-1.5 rounded-lg border border-tangerine/10">
                  Staff
                </span>
              </div>
              <div>
                <p class="text-4xl font-black tracking-tighter mb-2">{{ data.data.statistics.staff.total_educators }}</p>
                <div class="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest uppercase">
                  <span class="w-1.5 h-1.5 bg-tangerine rounded-full"></span>
                  {{ data.data.statistics.staff.total_classes }} classes actives
                </div>
              </div>
            </div>
          </div>

          <!-- Attendance Stat -->
          <div class="group relative">
            <div class="absolute -inset-0.5 bg-gradient-to-r from-matcha to-green-400 rounded-[2.5rem] blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
            <div class="relative glass dark:bg-slate-800/40 p-8 rounded-[2.5rem] border-white/60 hover:border-matcha/50 transition-all flex flex-col gap-6">
              <div class="flex items-center justify-between">
                <div class="w-14 h-14 bg-matcha/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                  📊
                </div>
                <span class="text-[10px] font-black text-matcha uppercase tracking-widest bg-matcha/5 px-3 py-1.5 rounded-lg border border-matcha/10">
                  Présences
                </span>
              </div>
              <div>
                <p class="text-4xl font-black tracking-tighter mb-2">{{ data.data.statistics.attendance.today.rate }}%</p>
                <div class="flex items-center gap-2 text-matcha font-black text-[10px] uppercase tracking-widest">
                  {{ data.data.statistics.attendance.today.present }} présents / {{ data.data.statistics.attendance.today.absent }} absents
                </div>
              </div>
            </div>
          </div>

          <!-- Payments Stat -->
          <div class="group relative">
            <div class="absolute -inset-0.5 bg-gradient-to-r from-blush to-red-400 rounded-[2.5rem] blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
            <div class="relative glass dark:bg-slate-800/40 p-8 rounded-[2.5rem] border-white/60 hover:border-blush/50 transition-all flex flex-col gap-6">
              <div class="flex items-center justify-between">
                <div class="w-14 h-14 bg-blush/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                  💰
                </div>
                <span class="text-[10px] font-black text-blush uppercase tracking-widest bg-blush/5 px-3 py-1.5 rounded-lg border border-blush/10">
                  Finances
                </span>
              </div>
              <div>
                <p class="text-4xl font-black tracking-tighter mb-2">{{ data.data.statistics.payments.pending }}</p>
                <div class="flex items-center gap-2 text-blush font-black text-[10px] uppercase tracking-widest">
                  {{ data.data.statistics.payments.pending_amount }} DT en attente
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Insights Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Attendance Analytics Chart -->
          <div class="glass dark:bg-slate-800/40 p-10 rounded-[3rem] border-white/60 space-y-10">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-1.5 h-8 bg-sea rounded-full"></div>
                <h3 class="text-xl font-black uppercase tracking-tight">Tendance des Présences</h3>
              </div>
              <div class="flex gap-2">
                <div class="w-3 h-3 rounded-full bg-sea"></div>
                <div class="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
              </div>
            </div>
            
            <div class="h-64 flex items-end justify-between gap-6 px-4">
              @for (day of data.data.charts_data.attendance_trend; track day.date) {
                <div class="flex-1 flex flex-col items-center gap-4 group cursor-pointer">
                  <div class="w-full relative h-48 flex items-end">
                    <div [style.height.%]="day.rate" 
                         class="w-full bg-gradient-to-t from-sea to-blue-400 rounded-2xl group-hover:scale-105 transition-all duration-500 shadow-xl shadow-sea/10 relative">
                       <div class="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 glass bg-white/90 dark:bg-slate-700/90 rounded-xl text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-2 border border-white/40 shadow-xl text-sea">
                         {{ day.rate }}%
                       </div>
                    </div>
                  </div>
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100 dark:border-slate-700/50 pt-2 w-full text-center">
                    {{ day.date | date:'EEE' }}
                  </span>
                </div>
              }
            </div>
          </div>

          <!-- Upcoming Events Board -->
          <div class="glass dark:bg-slate-800/40 p-10 rounded-[3rem] border-white/60 space-y-8">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-1.5 h-8 bg-tangerine rounded-full"></div>
                <h3 class="text-xl font-black uppercase tracking-tight">Agenda & Événements</h3>
              </div>
              <button class="w-10 h-10 glass hover:bg-white rounded-xl flex items-center justify-center transition-all">
                <svg class="w-5 h-5 text-tangerine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              @for (event of data.data.upcoming_events; track event.id) {
                <div class="group p-6 glass hover:bg-white dark:hover:bg-slate-700/50 rounded-3xl border-white/40 hover:border-tangerine/30 transition-all flex items-center justify-between gap-6 cursor-pointer">
                  <div class="flex items-center gap-6">
                    <div class="w-16 h-16 bg-tangerine/10 rounded-2xl flex flex-col items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      <span class="text-2xl font-black text-tangerine leading-none">{{ event.date | date:'dd' }}</span>
                      <span class="text-[8px] font-black text-tangerine uppercase tracking-tighter">{{ event.date | date:'MMM' }}</span>
                    </div>
                    <div>
                      <h4 class="font-black text-slate-900 dark:text-white group-hover:text-tangerine transition-colors">{{ event.title }}</h4>
                      <p class="text-xs font-medium text-slate-400 mt-1 flex items-center gap-2">
                         <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                         </svg>
                         {{ event.time }}
                      </p>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="block text-[10px] font-black text-tangerine uppercase tracking-widest bg-tangerine/5 px-3 py-1.5 rounded-lg border border-tangerine/10">
                      {{ event.participants_expected }} Prévus
                    </span>
                  </div>
                </div>
              } @empty {
                <div class="flex flex-col items-center justify-center py-20 text-center opacity-30">
                  <div class="text-6xl mb-4">📅</div>
                  <p class="text-sm font-black uppercase tracking-widest italic">Aucun événement à venir</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Recent Activities Feed -->
        <div class="glass dark:bg-slate-800/40 p-10 rounded-[3rem] border-white/60 space-y-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-1.5 h-8 bg-blush rounded-full"></div>
              <h3 class="text-xl font-black uppercase tracking-tight">Activités Récentes</h3>
            </div>
            <a routerLink="/admin/inscriptions" 
               class="px-6 py-2 glass hover:bg-white dark:hover:bg-slate-700/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blush transition-all flex items-center gap-3">
              Voir tout l'historique
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          <div class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr>
                  <th class="px-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Activité / Description</th>
                  <th class="px-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Catégorie</th>
                  <th class="px-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Heure</th>
                  <th class="px-8 pb-4 text-right"></th>
                </tr>
              </thead>
              <tbody>
                @for (activity of data.data.recent_activities; track activity.id) {
                  <tr class="group cursor-pointer">
                    <td class="px-8 py-6 glass bg-white/40 dark:bg-slate-800/20 rounded-l-[2.5rem] border-y border-l border-white/60 group-hover:bg-white dark:group-hover:bg-slate-700/50 transition-all">
                      <div class="flex items-center gap-6">
                        <div class="w-14 h-14 bg-gradient-to-br transition-all duration-500 group-hover:scale-110 shadow-lg text-white rounded-2xl flex items-center justify-center text-xl"
                             [class]="activity.type === 'Paiement' ? 'from-matcha to-emerald-600 shadow-matcha/20' : activity.type === 'Inscription' ? 'from-sea to-blue-600 shadow-sea/20' : 'from-blush to-purple-600 shadow-blush/20'">
                          <i [class]="'fas fa-' + activity.icon"></i>
                        </div>
                        <div>
                          <p class="font-black text-slate-900 dark:text-white group-hover:text-blush transition-colors text-lg leading-tight mb-1">{{ activity.title }}</p>
                          <p class="text-xs font-semibold text-slate-400">{{ activity.description }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-8 py-6 glass bg-white/40 dark:bg-slate-800/20 border-y border-white/60 group-hover:bg-white dark:group-hover:bg-slate-700/50 transition-all">
                      <span class="px-3 py-1.5 rounded-lg text-[9px] font-black text-slate-500 bg-slate-100 dark:bg-slate-700/50 uppercase tracking-widest border border-slate-200 dark:border-slate-600">
                        {{ activity.type }}
                      </span>
                    </td>
                    <td class="px-8 py-6 glass bg-white/40 dark:bg-slate-800/20 border-y border-white/60 group-hover:bg-white dark:group-hover:bg-slate-700/50 transition-all">
                      <div class="flex flex-col">
                        <span class="text-xs font-black text-slate-700 dark:text-slate-200">{{ activity.timestamp | date:'shortDate' }}</span>
                        <span class="text-[10px] font-bold text-slate-400">{{ activity.timestamp | date:'HH:mm' }}</span>
                      </div>
                    </td>
                    <td class="px-8 py-6 glass bg-white/40 dark:bg-slate-800/20 rounded-r-[2.5rem] border-y border-r border-white/60 group-hover:bg-white dark:group-hover:bg-slate-700/50 transition-all text-right">
                      <button class="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-300 group-hover:text-blush transition-all transform group-hover:scale-110 group-hover:rotate-12">
                         <svg class="w-5 h-5 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                         </svg>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>

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