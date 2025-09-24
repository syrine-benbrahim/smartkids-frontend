import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EducateursApiService, EducateurListItem } from '../../../services/educateurs-api.service';

@Component({
  selector: 'app-educateur-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4 sm:p-6" *ngIf="item() as e">
    <!-- Magical background decorations -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-20 left-10 w-32 h-32 bg-yellow-200 rounded-full opacity-20 animate-pulse"></div>
      <div class="absolute top-40 right-20 w-24 h-24 bg-pink-200 rounded-full opacity-30 animate-bounce" style="animation-delay: 1s;"></div>
      <div class="absolute bottom-40 left-1/4 w-16 h-16 bg-blue-200 rounded-full opacity-25 animate-ping" style="animation-delay: 2s;"></div>
      <div class="absolute bottom-20 right-1/3 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-pulse" style="animation-delay: 0.5s;"></div>
    </div>

    <div class="relative max-w-4xl mx-auto">
      <!-- Hero Header -->
      <div class="relative mb-12">
        <!-- Floating sparkles -->
        <div class="absolute -top-6 -left-6 w-8 h-8 bg-yellow-300 rounded-full opacity-60 animate-bounce"></div>
        <div class="absolute -top-2 right-12 w-6 h-6 bg-pink-300 rounded-full opacity-50 animate-pulse" style="animation-delay: 0.7s;"></div>
        <div class="absolute top-4 right-2 w-4 h-4 bg-blue-300 rounded-full opacity-40 animate-ping" style="animation-delay: 1.2s;"></div>

        <div class="card relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-2xl border-0">
          <!-- Background pattern -->
          <div class="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div class="absolute top-0 right-0 w-64 h-64 opacity-10">
            <svg class="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"/>
            </svg>
          </div>

          <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8">
            <!-- Profile Section -->
            <div class="flex items-center gap-6">
              <!-- Large 3D Avatar -->
              <div class="relative">
                <div class="w-28 h-28 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-2xl border-4 border-white/20 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  {{ getInitials(e.name) }}
                </div>
                <!-- Status indicator -->
                <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                  <div class="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>

              <div>
                <h1 class="text-4xl font-black mb-2 tracking-tight">{{ e.name }}</h1>
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-3 h-3 bg-yellow-300 rounded-full animate-pulse"></div>
                  <p class="text-xl font-semibold text-white/90">Éducateur professionnel</p>
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
                <div class="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <svg class="relative w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                <span class="relative">Modifier</span>
              </button>

              <button
                class="group relative overflow-hidden bg-white/10 hover:bg-white/20 backdrop-blur border-2 border-white/20 hover:border-white/40 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                (click)="back()"
              >
                <div class="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <svg class="relative w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                <span class="relative">Retour</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Information Cards Grid -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- Personal Info Card -->
        <div class="col-span-full lg:col-span-2">
          <div class="card relative overflow-hidden bg-gradient-to-br from-white via-purple-50 to-pink-50 border-2 border-purple-100 shadow-xl p-8">
            <!-- Decorative elements -->
            <div class="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20"></div>
            <div class="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-30"></div>
            
            <div class="relative">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <h3 class="text-2xl font-black text-gray-800">Informations personnelles</h3>
              </div>

              <div class="space-y-4">
                <!-- Name -->
                <div class="flex items-center gap-4 p-4 bg-white/60 backdrop-blur rounded-2xl border border-purple-100">
                  <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-gray-600 uppercase tracking-wide">Nom complet</p>
                    <p class="text-lg font-black text-gray-800">{{ e.name }}</p>
                  </div>
                </div>

                <!-- Email -->
                <div class="flex items-center gap-4 p-4 bg-white/60 backdrop-blur rounded-2xl border border-purple-100">
                  <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-gray-600 uppercase tracking-wide">Adresse email</p>
                    <p class="text-lg font-black text-gray-800">{{ e.email }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Professional Info Card -->
        <div class="space-y-6">
          <!-- Diploma Card -->
          <div class="card relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-cyan-50 border-2 border-blue-100 shadow-xl p-6">
            <div class="absolute top-3 right-3 w-12 h-12 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-20"></div>
            
            <div class="relative">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </div>
                <h3 class="text-lg font-black text-gray-800">Diplôme</h3>
              </div>
              <p class="text-xl font-bold text-gray-700 bg-white/60 backdrop-blur rounded-xl p-3 border border-blue-100">
                {{ e.diplome || 'Non spécifié' }}
              </p>
            </div>
          </div>

          <!-- Hire Date Card -->
          <div class="card relative overflow-hidden bg-gradient-to-br from-white via-emerald-50 to-green-50 border-2 border-emerald-100 shadow-xl p-6">
            <div class="absolute top-3 right-3 w-12 h-12 bg-gradient-to-br from-emerald-200 to-green-200 rounded-full opacity-20"></div>
            
            <div class="relative">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <h3 class="text-lg font-black text-gray-800">Embauché le</h3>
              </div>
              <p class="text-xl font-bold text-gray-700 bg-white/60 backdrop-blur rounded-xl p-3 border border-emerald-100">
                {{ e.date_embauche | date:'longDate' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Salary Card (if available) -->
        <div *ngIf="e.salaire !== undefined" class="col-span-full">
          <div class="card relative overflow-hidden bg-gradient-to-br from-white via-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-xl p-8">
            <!-- Money decoration -->
            <div class="absolute top-4 right-4 w-16 h-16 opacity-10">
              <svg class="w-full h-full text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19A2 2 0 0 0 5 21H11V19H5V3H13V9H21Z"/>
              </svg>
            </div>
            
            <div class="relative flex items-center gap-6">
              <div class="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-bold text-yellow-700 uppercase tracking-wide mb-1">Salaire mensuel</p>
                <p class="text-4xl font-black text-gray-800">{{ e.salaire | currency:'TND':'symbol':'1.2-2' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fun Stats Section -->
      <div class="mt-12 card bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-2xl border-0 p-8">
        <div class="relative">
          <div class="absolute top-0 right-0 w-32 h-32 opacity-10">
            <svg class="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
            </svg>
          </div>
          
          <div class="relative">
            <h3 class="text-2xl font-black mb-6">Statistiques de l'éducateur 📊</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="text-center">
                <div class="text-4xl font-black mb-2">🌟</div>
                <p class="text-sm font-semibold opacity-90">Éducateur actif</p>
              </div>
              <div class="text-center">
                <div class="text-4xl font-black mb-2">👨‍🏫</div>
                <p class="text-sm font-semibold opacity-90">Professionnel qualifié</p>
              </div>
              <div class="text-center">
                <div class="text-4xl font-black mb-2">🎓</div>
                <p class="text-sm font-semibold opacity-90">Formation certifiée</p>
              </div>
            </div>
          </div>
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
    this.router.navigate(['/admin']);
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