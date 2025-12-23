import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { PresenceService } from '../../services/presence.service';
import { ChatWidgetComponent } from '../../shared/chat-widget/chat-widget.component';

@Component({
  selector: 'app-educateur-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ChatWidgetComponent],
  template: `
<div class="min-h-screen p-4 sm:p-8 space-y-10 animate-fade-in text-slate-800 dark:text-slate-100">
  <!-- Hero Section -->
  <div class="relative group">
    <div class="absolute -inset-1 bg-gradient-to-r from-tangerine via-blush to-sea rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
    <div class="relative flex flex-col lg:flex-row items-center justify-between gap-8 p-10 card-fancy overflow-hidden">
      <!-- Decorative background elements -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-tangerine/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-64 h-64 bg-sea/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
      
      <div class="flex items-center gap-8 relative z-10">
        <div class="w-24 h-24 bg-gradient-to-br from-tangerine to-blush rounded-[2rem] flex items-center justify-center shadow-2xl shadow-tangerine/30 transform group-hover:rotate-6 transition-transform">
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <div>
          <h1 class="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white tracking-tight mb-3">
            Espace Éducateur <span class="inline-block animate-bounce">🍎</span>
          </h1>
          <p class="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-lg">
            Gérez vos classes et communiquez avec les parents en toute simplicité.
          </p>
        </div>
      </div>

      <div class="flex gap-4 relative z-10">
        <div class="px-6 py-4 glass dark:bg-slate-800/40 rounded-3xl text-center border-white/40">
          <div class="text-2xl font-black text-tangerine">{{ classes().length }}</div>
          <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Classes</div>
        </div>
        <div class="px-6 py-4 glass dark:bg-slate-800/40 rounded-3xl text-center border-white/40">
          <div class="text-2xl font-black text-sea">100%</div>
          <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Activité</div>
        </div>
      </div>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
    <!-- Left Column: Actions & Stats -->
    <div class="lg:col-span-5 space-y-10">
      <!-- Quick Navigation -->
      <div class="grid grid-cols-2 gap-6">
        <button 
          (click)="navigateTo('/educateur/presences-jour')"
          class="group p-8 glass dark:bg-slate-800/40 rounded-[2.5rem] border-white/40 hover:bg-tangerine/5 dark:hover:bg-tangerine/10 transition-all text-center space-y-4"
        >
          <div class="w-16 h-16 bg-tangerine/10 text-tangerine rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="font-black text-slate-800 dark:text-white text-sm uppercase tracking-wider">Présences</div>
        </button>

        <button 
          (click)="navigateTo('/chat')"
          class="group p-8 glass dark:bg-slate-800/40 rounded-[2.5rem] border-white/40 hover:bg-sea/5 dark:hover:bg-sea/10 transition-all text-center space-y-4"
        >
          <div class="w-16 h-16 bg-sea/10 text-sea rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <div class="font-black text-slate-800 dark:text-white text-sm uppercase tracking-wider">Messages</div>
        </button>

        <button 
          (click)="navigateTo('/educateur/emploi/semaine')"
          class="group p-8 glass dark:bg-slate-800/40 rounded-[2.5rem] border-white/40 hover:bg-blush/5 dark:hover:bg-blush/10 transition-all text-center space-y-4"
        >
          <div class="w-16 h-16 bg-blush/10 text-blush rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <div class="font-black text-slate-800 dark:text-white text-sm uppercase tracking-wider">Emploi</div>
        </button>

        <button 
          (click)="navigateTo('/educateur/statistiques')"
          class="group p-8 glass dark:bg-slate-800/40 rounded-[2.5rem] border-white/40 hover:bg-matcha/5 dark:hover:bg-matcha/10 transition-all text-center space-y-4"
        >
          <div class="w-16 h-16 bg-matcha/10 text-matcha rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div class="font-black text-slate-800 dark:text-white text-sm uppercase tracking-wider">Stats</div>
        </button>
      </div>

      <!-- Chat Widget Embedded -->
      <div class="card-fancy p-2 overflow-hidden bg-slate-100/30 dark:bg-slate-800/20 border-white/20">
        <app-chat-widget></app-chat-widget>
      </div>
    </div>

    <!-- Right Column: Classes List -->
    <div class="lg:col-span-7 space-y-6">
      <div class="flex items-center justify-between mb-4 px-4">
        <h2 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
          <span class="w-2 h-8 bg-tangerine rounded-full"></span>
          Vos Classes Assignées
        </h2>
        <span class="px-4 py-2 glass dark:bg-slate-800/60 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest border-white/40">
          {{ classes().length }} total
        </span>
      </div>

      <div *ngIf="loading()" class="flex justify-center p-20">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-t-tangerine border-slate-200"></div>
      </div>

      <div *ngIf="error()" class="p-8 glass bg-blush/5 border-blush/20 rounded-[2.5rem] flex items-center gap-4 text-blush">
        <div class="w-12 h-12 bg-blush/10 rounded-2xl flex items-center justify-center text-2xl">⚠️</div>
        <div class="font-bold">{{ error() }}</div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
        <div *ngFor="let classe of classes()" 
             class="group relative"
             (click)="navigateTo('/educateur/classes/' + classe.id + '/presences')">
          <div class="absolute -inset-0.5 bg-gradient-to-r from-tangerine/50 to-blush/50 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
          <div class="relative p-8 glass dark:bg-slate-800/40 rounded-[2.5rem] border-white/60 hover:border-white/80 transition-all cursor-pointer">
            <div class="flex items-start justify-between">
              <div>
                <div class="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-tangerine/10 group-hover:text-tangerine transition-all">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <h3 class="text-xl font-black text-slate-800 dark:text-white mb-1 group-hover:text-tangerine transition-colors">
                  {{ classe.nom }}
                </h3>
                <p class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ classe.niveau }}</p>
                
                <div class="flex items-center gap-4 mt-6">
                  <div class="flex -space-x-2">
                    <div *ngFor="let i of [1,2,3]" class="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">👤</div>
                  </div>
                  <span class="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {{ classe.nombre_enfants }} élèves
                  </span>
                </div>
              </div>
              
              <div class="w-10 h-10 glass dark:bg-slate-700 rounded-xl flex items-center justify-center transform group-hover:translate-x-2 transition-transform">
                <svg class="w-5 h-5 text-tangerine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading() && classes().length === 0" class="text-center py-20 card-fancy border-dashed border-2 border-white/20">
         <div class="text-4xl mb-4">📭</div>
         <p class="text-lg font-bold text-slate-500">Aucune classe assignée pour le moment.</p>
      </div>
    </div>
  </div>
</div>
  `
})
export class EducateurDashboardComponent implements OnInit {
  private router = inject(Router);
  private presenceService = inject(PresenceService);

  classes = signal<any[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadClasses();
  }

  private loadClasses() {
    this.loading.set(true);
    this.error.set(null);

    this.presenceService.getClassesEducateur().subscribe({
      next: (response) => {
        this.classes.set(response.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement classes:', err);
        this.error.set('Impossible de charger vos classes');
        this.loading.set(false);
      }
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
