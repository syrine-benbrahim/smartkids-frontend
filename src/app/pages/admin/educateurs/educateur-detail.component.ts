import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EducateursApiService, EducateurListItem } from '../../../services/educateurs-api.service';

@Component({
  selector: 'app-educateur-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="space-y-6" *ngIf="item() as e">
    
    <!-- Hero Header Card -->
    <div class="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl p-8 shadow-xl border-4 border-green-200 relative overflow-hidden">
      <!-- Background decoration -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <!-- Profile Section -->
        <div class="flex items-center gap-6">
          <!-- Large Avatar -->
          <div class="relative">
            <div class="w-28 h-28 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-2xl border-4 border-white/30 transform hover:rotate-3 transition-transform duration-300">
              {{ getInitials(e.name) }}
            </div>
            <!-- Status indicator -->
            <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
              <div class="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>

          <div>
            <h1 class="text-4xl font-black text-white mb-2 tracking-tight">{{ e.name }}</h1>
            <div class="flex items-center gap-3 mb-3">
              <div class="w-3 h-3 bg-yellow-300 rounded-full animate-pulse"></div>
              <p class="text-xl font-semibold text-white/90">Professional Educator</p>
            </div>
            <div class="flex items-center gap-2 text-white/80">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span class="font-medium">{{ e.email }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            class="group relative overflow-hidden bg-white/20 hover:bg-white/30 backdrop-blur border-2 border-white/30 hover:border-white/50 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            (click)="edit()"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            <span>Edit</span>
          </button>

          <button
            class="group relative overflow-hidden bg-white/10 hover:bg-white/20 backdrop-blur border-2 border-white/20 hover:border-white/40 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            (click)="back()"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            <span>Back</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Information Cards Grid -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      
      <!-- Personal Info Card -->
      <div class="col-span-full lg:col-span-2">
        <div class="bg-white rounded-3xl p-8 shadow-sm border-4 border-green-100 hover:shadow-xl transition-shadow">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-black text-gray-800">Personal Information</h3>
          </div>

          <div class="space-y-4">
            <!-- Name -->
            <div class="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-100">
              <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-bold text-gray-600 uppercase tracking-wide">Full Name</p>
                <p class="text-lg font-black text-gray-800">{{ e.name }}</p>
              </div>
            </div>

            <!-- Email -->
            <div class="flex items-center gap-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl border-2 border-teal-100">
              <div class="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-bold text-gray-600 uppercase tracking-wide">Email Address</p>
                <p class="text-lg font-black text-gray-800">{{ e.email }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Professional Info Cards -->
      <div class="space-y-6">
        <!-- Diploma Card -->
        <div class="bg-white rounded-3xl p-6 shadow-sm border-4 border-blue-100 hover:shadow-xl transition-shadow">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <h3 class="text-lg font-black text-gray-800">Degree</h3>
          </div>
          <p class="text-xl font-bold text-gray-700 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3 border-2 border-blue-100">
            {{ e.diplome || 'Not specified' }}
          </p>
        </div>

        <!-- Hire Date Card -->
        <div class="bg-white rounded-3xl p-6 shadow-sm border-4 border-emerald-100 hover:shadow-xl transition-shadow">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 class="text-lg font-black text-gray-800">Hired On</h3>
          </div>
          <p class="text-xl font-bold text-gray-700 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-3 border-2 border-emerald-100">
            {{ e.date_embauche | date:'longDate' }}
          </p>
        </div>
      </div>

      <!-- Salary Card (if available) -->
      <div *ngIf="e.salaire !== undefined" class="col-span-full">
        <div class="bg-white rounded-3xl p-8 shadow-sm border-4 border-yellow-200 hover:shadow-xl transition-shadow">
          <div class="flex items-center gap-6">
            <div class="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-bold text-yellow-700 uppercase tracking-wide mb-1">Monthly Salary</p>
              <p class="text-4xl font-black text-gray-800">{{ e.salaire | currency:'TND':'symbol':'1.2-2' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl p-8 shadow-xl border-4 border-green-200">
      <h3 class="text-2xl font-black text-white mb-6">Educator Statistics 📊</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white/20 backdrop-blur rounded-2xl p-6 text-center border-2 border-white/30">
          <div class="text-4xl font-black mb-2">🌟</div>
          <p class="text-sm font-semibold text-white/90">Active Educator</p>
        </div>
        <div class="bg-white/20 backdrop-blur rounded-2xl p-6 text-center border-2 border-white/30">
          <div class="text-4xl font-black mb-2">👨‍🏫</div>
          <p class="text-sm font-semibold text-white/90">Qualified Professional</p>
        </div>
        <div class="bg-white/20 backdrop-blur rounded-2xl p-6 text-center border-2 border-white/30">
          <div class="text-4xl font-black mb-2">🎓</div>
          <p class="text-sm font-semibold text-white/90">Certified Training</p>
        </div>
      </div>
    </div>
  </div>
  `
})
export class EducateurDetailComponent {
  private api = inject(EducateursApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  item = signal<EducateurListItem | null>(null);

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.api.get(id).subscribe((res: any) => {
      const educ = res.data ?? res;

      // Flatten user object into top-level properties
      const flattened: EducateurListItem = {
        ...educ,
        name: educ.user?.name ?? '',
        email: educ.user?.email ?? ''
      };

      this.item.set(flattened);
    });
  }

  edit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.router.navigate(['/admin/educateurs', id, 'edit']);
  }

  back() {
    this.router.navigate(['/admin/educateurs']);
  }

  // Helper method for initials
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}