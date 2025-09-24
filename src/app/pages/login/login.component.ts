import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <!-- Magical Background -->
  <div class="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 relative overflow-hidden">
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <!-- Floating shapes -->
      <div class="absolute top-20 left-10 w-32 h-32 bg-yellow-300 rounded-full opacity-20 animate-pulse"></div>
      <div class="absolute top-40 right-20 w-24 h-24 bg-blue-300 rounded-full opacity-30 animate-bounce" style="animation-delay: 1s;"></div>
      <div class="absolute bottom-40 left-1/4 w-40 h-40 bg-green-300 rounded-full opacity-15 animate-ping" style="animation-delay: 2s;"></div>
      <div class="absolute bottom-20 right-1/3 w-28 h-28 bg-orange-300 rounded-full opacity-25 animate-pulse" style="animation-delay: 0.5s;"></div>
      
      <!-- Stars -->
      <div class="absolute top-32 left-1/3 w-6 h-6 text-white opacity-40 animate-twinkle">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"/>
        </svg>
      </div>
      <div class="absolute top-60 right-1/4 w-4 h-4 text-white opacity-30 animate-twinkle" style="animation-delay: 1.5s;">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"/>
        </svg>
      </div>
      <div class="absolute bottom-60 left-1/2 w-5 h-5 text-white opacity-35 animate-twinkle" style="animation-delay: 2.5s;">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"/>
        </svg>
      </div>
    </div>

    <div class="relative z-10 min-h-screen flex items-center justify-center p-4">
      <!-- Main Login Card -->
      <div class="w-full max-w-md">
        <!-- Welcome Section -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl mb-4 transform hover:scale-110 transition-transform duration-300">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <span class="text-white text-2xl font-black">SK</span>
            </div>
          </div>
          <h1 class="text-4xl font-black text-white mb-2 drop-shadow-lg">SmartKids</h1>
          <p class="text-white/90 text-lg font-semibold drop-shadow-md">Jardin d'enfants intelligent</p>
        </div>

        <!-- Login Form Card -->
        <div class="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <div class="mb-6">
            <h2 class="text-2xl font-black text-gray-800 text-center mb-2">Connexion</h2>
            <p class="text-gray-600 text-center font-medium">Accédez à votre espace personnel</p>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Email Field -->
            <div class="space-y-2">
              <label class="block text-sm font-bold text-gray-700 mb-2">Adresse email</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <input
                  class="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 bg-gray-50 focus:bg-white transition-all duration-200 font-medium placeholder-gray-400"
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  placeholder="votre.email@exemple.com"
                  required
                />
              </div>
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <label class="block text-sm font-bold text-gray-700 mb-2">Mot de passe</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input
                  class="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 bg-gray-50 focus:bg-white transition-all duration-200 font-medium placeholder-gray-400"
                  type="password"
                  [(ngModel)]="password"
                  name="password"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <!-- Error Message -->
            <div *ngIf="error()" class="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </div>
                <p class="text-red-700 font-semibold">{{ error() }}</p>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              class="group relative w-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-4 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              [disabled]="loading()"
              type="submit"
            >
              <div class="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" [class.hidden]="loading()"></div>
              <div class="relative flex items-center justify-center gap-3">
                <div *ngIf="loading()" class="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <svg *ngIf="!loading()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                </svg>
                <span>{{ loading() ? 'Connexion en cours...' : 'Se connecter' }}</span>
              </div>
            </button>
          </form>

          <!-- Register Link -->
          <div class="mt-8 text-center">
            <p class="text-gray-600 font-medium">Pas encore de compte ?</p>
            <a 
              routerLink="/register" 
              class="inline-flex items-center gap-2 mt-2 text-purple-600 hover:text-purple-700 font-bold text-lg transition-colors duration-200"
            >
              <span>Créer un compte</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Fun Footer -->
        <div class="text-center mt-8">
          <div class="flex justify-center items-center gap-4 text-white/80">
            <div class="text-2xl animate-bounce">🎨</div>
            <p class="font-semibold">Créé avec amour pour nos petits génies</p>
            <div class="text-2xl animate-bounce" style="animation-delay: 0.5s;">🌟</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Animations CSS -->
    <style>
      @keyframes twinkle {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }
      .animate-twinkle {
        animation: twinkle 3s ease-in-out infinite;
      }
    </style>
  </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  private auth = inject(AuthService);
  private router = inject(Router);

  onSubmit() {
    this.error.set(null);
    this.loading.set(true);
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        const role = res.user.role;
        if (role === 'admin') this.router.navigate(['/admin']);
        else if (role === 'educateur') this.router.navigate(['/educateur']);
        else this.router.navigate(['/parent']);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Connexion échouée');
        this.loading.set(false);
      }
    });
  }
}