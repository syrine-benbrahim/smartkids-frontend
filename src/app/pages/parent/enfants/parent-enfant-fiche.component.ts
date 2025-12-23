import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EnfantFicheService, FicheEnfant } from '../../../services/enfant-fiche.service';

@Component({
  selector: 'app-parent-enfant-fiche',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-4 sm:p-8 space-y-12 animate-fade-in text-slate-800 dark:text-slate-100">
      
      <!-- Premium Header & Navigation -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div class="flex items-center gap-6">
          <button (click)="goBack()" 
                  class="w-12 h-12 glass dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 hover:text-sea hover:scale-110 transition-all border-white/40 border">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 class="text-3xl sm:text-4xl font-black tracking-tight mb-2">Profil Élève</h1>
            <div class="flex items-center gap-3">
              <div class="w-1.5 h-1.5 bg-sea rounded-full animate-pulse"></div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]" *ngIf="fiche()">
                Dossier académique : {{ fiche()!.prenom }} {{ fiche()!.nom }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4">
           <button (click)="router.navigate(['/parent/enfants', enfantId(), 'presences'])"
                   class="px-6 py-4 glass dark:bg-slate-800/60 rounded-2xl font-black text-[10px] uppercase tracking-widest text-sea hover:bg-white transition-all border-white/40 border flex items-center gap-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              Présences
           </button>
           <button (click)="router.navigate(['/parent/emploi'])"
                   class="px-6 py-4 glass dark:bg-slate-800/60 rounded-2xl font-black text-[10px] uppercase tracking-widest text-tangerine hover:bg-white transition-all border-white/40 border flex items-center gap-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Emploi
           </button>
        </div>
      </div>

      <!-- Loading Tracker -->
      <div *ngIf="loading()" class="flex flex-col justify-center items-center py-24 animate-pulse">
        <div class="w-16 h-16 border-4 border-t-sea border-slate-200 rounded-full animate-spin mb-4"></div>
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ouverture du dossier sécurisé...</span>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="p-10 card-fancy border-blush/20 text-center space-y-6">
        <div class="text-5xl">⚠️</div>
        <h3 class="text-2xl font-black uppercase tracking-tight text-blush">Erreur de Dossier</h3>
        <p class="text-slate-500 font-medium">{{ error() }}</p>
        <button (click)="loadFiche()" class="px-8 py-4 bg-blush text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Réessayer</button>
      </div>

      <!-- Main Fiche Content -->
      <div *ngIf="!loading() && !error() && fiche()" class="space-y-12">
        
        <!-- Section 1: Hero Identity -->
        <div class="relative group">
          <div class="absolute -inset-1 bg-gradient-to-r from-sea via-tangerine to-sea rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          <div class="relative card-fancy p-10 overflow-hidden flex flex-col lg:flex-row items-center gap-10">
            <!-- Background Halo -->
            <div class="absolute top-0 right-0 w-96 h-96 bg-sea/5 rounded-full blur-3xl -mr-48 -mt-48 group-hover:bg-sea/10 transition-colors"></div>

            <!-- Avatar Logic -->
            <div class="relative flex-shrink-0 group/avatar">
              <div class="w-48 h-48 rounded-[2.5rem] bg-white dark:bg-slate-700 p-1.5 shadow-2xl relative z-10 overflow-hidden">
                <img *ngIf="fiche()!.photo" [src]="fiche()!.photo" class="w-full h-full object-cover rounded-[2rem]">
                <div *ngIf="!fiche()!.photo" [class]="getAvatarClass(fiche()!.sexe)" class="w-full h-full rounded-[2rem] flex items-center justify-center text-5xl font-black text-white">
                  {{ getInitials(fiche()!.nom_complet) }}
                </div>
              </div>
              <label class="absolute bottom-[-10px] right-[-10px] w-14 h-14 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-xl hover:scale-110 transition-all z-20 group-hover/avatar:bg-sea">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <input type="file" (change)="onPhotoSelect($event)" class="hidden">
              </label>
            </div>

            <!-- Core Identity -->
            <div class="flex-1 space-y-6 text-center lg:text-left relative z-10">
              <div class="space-y-2">
                <h2 class="text-4xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  {{ fiche()!.nom_complet }}
                </h2>
                <div class="flex flex-wrap justify-center lg:justify-start items-center gap-4">
                  <span class="px-5 py-2 bg-sea/10 text-sea rounded-xl text-xs font-black uppercase tracking-widest border border-sea/20">
                    {{ fiche()!.age }} Ans
                  </span>
                  <span class="px-5 py-2 bg-tangerine/10 text-tangerine rounded-xl text-xs font-black uppercase tracking-widest border border-tangerine/20">
                    {{ fiche()!.sexe === 'M' || fiche()!.sexe === 'garçon' ? 'Garçon' : 'Fille' }}
                  </span>
                  <span class="px-5 py-2 bg-slate-100 dark:bg-slate-700/50 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200 dark:border-slate-600">
                    📅 {{ formatDate(fiche()!.date_naissance) }}
                  </span>
                </div>
              </div>

              <!-- Academy Badge -->
              <div *ngIf="fiche()!.classe" class="inline-flex items-center gap-6 p-6 glass dark:bg-slate-800/80 rounded-[2rem] border-white/40 shadow-xl group/badge hover:bg-white transition-all">
                <div class="w-14 h-14 bg-gradient-to-br from-sea to-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg transform group-hover/badge:scale-110 transition-transform">🎓</div>
                <div class="text-left">
                  <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Classe Actuelle</p>
                  <p class="text-lg font-black text-slate-900 dark:text-white">{{ fiche()!.classe?.nom }} <span class="text-sea ml-2 text-sm">• {{ fiche()!.classe?.niveau }}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: KPIs Dashboard -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Presence Level -->
          <div class="group relative card-fancy p-8 hover:translate-y-[-5px] transition-all border-white/40 overflow-hidden">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-matcha/5 rounded-full blur-2xl group-hover:bg-matcha/10 transition-colors"></div>
            <div class="flex flex-col h-full justify-between gap-6">
              <div class="flex justify-between items-start">
                 <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assiduité Globale</p>
                 <span [class]="getTauxClass(fiche()!.statistiques_presence.taux_presence)" class="text-2xl font-black leading-none">{{ fiche()!.statistiques_presence.taux_presence }}%</span>
              </div>
              <div class="h-2.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                <div [class]="getProgressClass(fiche()!.statistiques_presence.taux_presence)"
                     [style.width.%]="fiche()!.statistiques_presence.taux_presence"
                     class="h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(var(--color-matcha),0.3)]"></div>
              </div>
            </div>
          </div>

          <!-- Academic Performance -->
          <div class="group relative card-fancy p-8 hover:translate-y-[-5px] transition-all border-white/40 overflow-hidden">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-sea/5 rounded-full blur-2xl group-hover:bg-sea/10 transition-colors"></div>
            <div class="flex flex-col h-full justify-between gap-6">
              <div class="flex justify-between items-start">
                 <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance Moyenne</p>
                 <span [class]="getMoyenneClass(fiche()!.moyennes.moyenne_generale)" class="text-2xl font-black leading-none">{{ fiche()!.moyennes.moyenne_generale || 'N/A' }}</span>
              </div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Sur {{ fiche()!.moyennes.annee_scolaire }}</p>
            </div>
          </div>

          <!-- Activities Stats -->
          <div class="group relative card-fancy p-8 hover:translate-y-[-5px] transition-all border-white/40 overflow-hidden">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-tangerine/5 rounded-full blur-2xl group-hover:bg-tangerine/10 transition-colors"></div>
            <div class="flex flex-col h-full justify-between gap-6">
              <div class="flex justify-between items-start">
                 <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Engagement Activités</p>
                 <span class="text-2xl font-black text-tangerine leading-none">{{ fiche()!.statistiques_activites.total_activites }}</span>
              </div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">{{ fiche()!.statistiques_activites.taux_participation }}% Participation</p>
            </div>
          </div>

          <!-- Monthly Snapshot -->
          <div class="group relative card-fancy p-8 hover:translate-y-[-5px] transition-all border-white/40 overflow-hidden">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-blush/5 rounded-full blur-2xl group-hover:bg-blush/10 transition-colors"></div>
            <div class="flex flex-col h-full justify-between gap-6">
              <div class="flex justify-between items-start">
                 <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Focus : Mois Actuel</p>
                 <span class="text-2xl font-black text-blush leading-none">{{ fiche()!.statistiques_presence.mois_en_cours.presents }}/{{ fiche()!.statistiques_presence.mois_en_cours.total }}</span>
              </div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">{{ fiche()!.statistiques_presence.mois_en_cours.taux }}% Présence</p>
            </div>
          </div>
        </div>

        <!-- Section 3: Dual Column - Presence vs Activities -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
           <!-- Presence List -->
           <div class="space-y-8">
              <div class="flex items-center gap-4">
                <div class="w-1.5 h-6 bg-matcha rounded-full"></div>
                <h2 class="text-xl font-black uppercase tracking-widest">Historique Présences</h2>
              </div>
              <div class="space-y-4">
                 <div *ngFor="let presence of fiche()!.presences_recentes" 
                      class="group card-fancy p-6 border-white/40 flex items-center justify-between hover:translate-x-2 transition-all">
                    <div class="flex items-center gap-5">
                       <div [class]="presence.statut === 'present' ? 'bg-matcha/20 text-matcha' : 'bg-blush/20 text-blush'" 
                            class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                         {{ presence.statut === 'present' ? '✅' : '❌' }}
                       </div>
                       <div>
                          <p class="font-black text-slate-900 dark:text-white">{{ formatDate(presence.date) }}</p>
                          <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{{ presence.educateur }}</p>
                       </div>
                    </div>
                    <span [class]="presence.statut === 'present' ? 'bg-matcha/10 text-matcha border-matcha/20' : 'bg-blush/10 text-blush border-blush/20'"
                          class="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border">
                       {{ presence.statut === 'present' ? 'Confirmé' : 'Absent' }}
                    </span>
                 </div>
                 <div *ngIf="fiche()!.presences_recentes.length === 0" class="p-12 text-center card-fancy border-dashed border-2 opacity-40">
                    <p class="font-black text-xs text-slate-400 uppercase tracking-widest">Aucune donnée temporelle</p>
                 </div>
              </div>
           </div>

           <!-- Activities Snapshot -->
           <div class="space-y-8">
              <div class="flex items-center gap-4">
                <div class="w-1.5 h-6 bg-tangerine rounded-full"></div>
                <h2 class="text-xl font-black uppercase tracking-widest">Parcours Extra-Scolaire</h2>
              </div>
              <div class="space-y-4">
                 <div *ngFor="let activite of fiche()!.activites_recentes" 
                      class="group card-fancy p-6 border-white/40 hover:translate-x-2 transition-all bg-gradient-to-r from-white to-orange-50/10 dark:from-slate-800/40 dark:to-slate-700/20">
                    <div class="flex justify-between items-start mb-4">
                       <div>
                          <h4 class="font-black text-lg text-slate-900 dark:text-white group-hover:text-tangerine transition-colors">{{ activite.titre }}</h4>
                          <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 line-clamp-1 truncate max-w-[200px]">📅 {{ formatDate(activite.date_activite) }}</p>
                       </div>
                       <span class="px-3 py-1 bg-tangerine/10 text-tangerine rounded-lg text-[9px] font-black uppercase tracking-widest border border-tangerine/20">{{ activite.type }}</span>
                    </div>
                    <div class="flex justify-end">
                       <span [class]="activite.statut === 'present' ? 'text-matcha' : 'text-slate-400'" class="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                         <div [class]="activite.statut === 'present' ? 'bg-matcha' : 'bg-slate-300'" class="w-1.5 h-1.5 rounded-full"></div>
                         {{ activite.statut === 'present' ? 'Participation Validée' : (activite.statut || 'Planifiée') }}
                       </span>
                    </div>
                 </div>
                 <div *ngIf="fiche()!.activites_recentes.length === 0" class="p-12 text-center card-fancy border-dashed border-2 opacity-40">
                    <p class="font-black text-xs text-slate-400 uppercase tracking-widest">Calendrier créatif vide</p>
                 </div>
              </div>
           </div>
        </div>

        <!-- Section 4: Grades Grid -->
        <div class="space-y-8">
           <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div class="flex items-center gap-4">
                <div class="w-1.5 h-6 bg-sea rounded-full"></div>
                <h2 class="text-xl font-black uppercase tracking-widest">Cahier de Notes</h2>
              </div>
              <div class="flex bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl">
                 <div *ngFor="let t of [1,2,3]; let i = index" class="px-6 py-2 text-[10px] font-black uppercase tracking-widest">
                    <span class="text-slate-400 mr-2">T{{t}}:</span>
                    <span [class]="getMoyenneClass(getTrimestreMoyenne(t))">{{ getTrimestreMoyenne(t) || '-' }}</span>
                 </div>
              </div>
           </div>

           <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div *ngFor="let note of fiche()!.notes_recentes" class="group relative card-fancy p-8 hover:translate-y-[-4px] transition-all border-white/40">
                 <div class="flex justify-between items-start mb-6">
                    <div class="p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl group-hover:bg-sea/10 transition-colors">
                       <span class="text-2xl">📝</span>
                    </div>
                    <div class="text-right">
                       <p [class]="getMoyenneClass(note.note)" class="text-4xl font-black leading-none">{{ note.note }}</p>
                       <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-50">/ 20</p>
                    </div>
                 </div>
                 <div class="space-y-4">
                    <div>
                       <h3 class="text-xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-sea transition-all">{{ note.matiere }}</h3>
                       <div class="flex items-center gap-3 mt-1">
                          <span class="text-[9px] font-black text-sea uppercase tracking-widest">{{ note.type_evaluation }}</span>
                          <span class="text-slate-300">•</span>
                          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Trimestre {{ note.trimestre }}</span>
                       </div>
                    </div>
                    <div class="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
                       <div class="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          <span>👨‍🏫 {{ note.educateur }}</span>
                          <span>•</span>
                          <span>📅 {{ formatDate(note.date_evaluation) }}</span>
                       </div>
                       <p *ngIf="note.commentaire" class="text-xs font-medium italic text-slate-500 line-clamp-2">"{{ note.commentaire }}"</p>
                    </div>
                 </div>
              </div>
              <div *ngIf="fiche()!.notes_recentes.length === 0" class="col-span-full p-20 text-center card-fancy border-dashed border-2 opacity-40">
                 <h3 class="font-black text-xs uppercase tracking-[0.3em]">En attente d'évaluations</h3>
              </div>
           </div>
        </div>

        <!-- Section 5: Info Blocks (Medical & Educators) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
           <!-- Medical Status -->
           <div class="lg:col-span-2 space-y-8">
              <div class="flex items-center gap-4 text-blush">
                <div class="w-1.5 h-6 bg-blush rounded-full"></div>
                <h2 class="text-xl font-black uppercase tracking-widest">Informations Vitales</h2>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div *ngIf="fiche()!.infos_medicales.allergies" class="card-fancy p-8 border-blush/20 bg-blush/5 group hover:bg-white transition-all">
                    <h3 class="text-[10px] font-black text-blush uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                       <span class="animate-pulse">⚠️</span> Allergies Critiques
                    </h3>
                    <p class="text-slate-700 dark:text-slate-300 font-bold leading-relaxed">{{ fiche()!.infos_medicales.allergies }}</p>
                 </div>
                 <div *ngIf="fiche()!.infos_medicales.remarques_medicales" class="card-fancy p-8 border-tangerine/20 bg-tangerine/5 group hover:bg-white transition-all">
                    <h3 class="text-[10px] font-black text-tangerine uppercase tracking-[0.2em] mb-4">🏥 Observations Médicales</h3>
                    <p class="text-slate-700 dark:text-slate-300 font-bold leading-relaxed">{{ fiche()!.infos_medicales.remarques_medicales }}</p>
                 </div>
                 <div *ngIf="!fiche()!.infos_medicales.allergies && !fiche()!.infos_medicales.remarques_medicales" class="col-span-full p-12 card-fancy border-dashed border-2 opacity-40 text-center">
                    <p class="font-black text-[9px] uppercase tracking-widest">Dossier médical sans alertes</p>
                 </div>
              </div>
           </div>

           <!-- Academic Team -->
           <div class="space-y-8">
              <div class="flex items-center gap-4 text-slate-900 dark:text-white">
                <div class="w-1.5 h-6 bg-slate-900 dark:bg-slate-100 rounded-full"></div>
                <h2 class="text-xl font-black uppercase tracking-widest">Équipe Pédagogique</h2>
              </div>
              <div class="space-y-4">
                 <div *ngFor="let educ of fiche()!.classe?.educateurs" class="card-fancy p-5 border-white/40 flex items-center gap-4 group/educ hover:bg-slate-900 hover:text-white transition-all">
                    <div class="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-lg font-black text-slate-500 group-hover/educ:bg-white/10 group-hover/educ:text-white transition-colors flex-shrink-0 shadow-inner">
                       {{ getInitials(educ.nom_complet) }}
                    </div>
                    <div class="min-w-0">
                       <h4 class="font-black truncate">{{ educ.nom_complet }}</h4>
                       <p class="text-[8px] font-black uppercase tracking-widest opacity-50">Référent de classe</p>
                       <div class="flex items-center gap-3 mt-2">
                          <a *ngIf="educ.email" [href]="'mailto:' + educ.email" class="p-1.5 hover:bg-white/20 rounded-lg transition-colors"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></a>
                          <a *ngIf="educ.telephone" [href]="'tel:' + educ.telephone" class="p-1.5 hover:bg-white/20 rounded-lg transition-colors"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg></a>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <!-- Section 6: Parents List -->
        <div class="space-y-8 pt-12 border-t dark:border-slate-700/50">
           <div class="flex items-center gap-4">
              <div class="w-1.5 h-6 bg-butter rounded-full"></div>
              <h2 class="text-xl font-black uppercase tracking-widest">Cercle Familial & Tuteurs</h2>
           </div>
           <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div *ngFor="let parent of fiche()!.parents" class="card-fancy p-8 border-white/60 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/30 dark:from-slate-800/40 dark:to-slate-900/40 group hover:translate-y-[-5px] transition-all">
                 <div class="flex items-center gap-6 mb-8">
                    <div class="w-16 h-16 bg-white dark:bg-slate-700 rounded-3xl flex items-center justify-center text-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 group-hover:rotate-6 transition-transform">👤</div>
                    <div class="min-w-0">
                       <h3 class="text-xl font-black truncate text-slate-900 dark:text-white">{{ parent.nom_complet }}</h3>
                       <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{{ parent.profession || 'Dossier Parent' }}</p>
                    </div>
                 </div>
                 <div class="space-y-3">
                    <div class="flex items-center gap-4 p-4 bg-white/60 dark:bg-slate-700/60 rounded-2xl border border-white/40">
                       <svg class="w-4 h-4 text-sea" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                       <span class="text-xs font-bold truncate">{{ parent.email }}</span>
                    </div>
                    <div class="flex items-center gap-4 p-4 bg-white/60 dark:bg-slate-700/60 rounded-2xl border border-white/40">
                       <svg class="w-4 h-4 text-matcha" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                       <span class="text-xs font-bold">{{ parent.telephone }}</span>
                    </div>
                 </div>
              </div>
           </div>
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
export class ParentEnfantFicheComponent implements OnInit {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private ficheService = inject(EnfantFicheService);

  fiche = signal<FicheEnfant | null>(null);
  enfantId = signal<number>(0);
  loading = signal(false);
  error = signal<string | null>(null);
  uploadingPhoto = signal(false);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = parseInt(params['id']);
      this.enfantId.set(id);
      this.loadFiche();
    });
  }

  loadFiche() {
    this.loading.set(true);
    this.error.set(null);
    this.ficheService.getFicheEnfant(this.enfantId()).subscribe({
      next: (response) => {
        if (response.success) {
          this.fiche.set(response.data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement de la fiche académique.');
        this.loading.set(false);
      }
    });
  }

  onPhotoSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) return alert('Fichier invalide : Image requise.');
    if (file.size > 2 * 1024 * 1024) return alert('Image trop volumineuse (max 2MB).');

    this.uploadingPhoto.set(true);
    this.ficheService.uploadPhoto(this.enfantId(), file).subscribe({
      next: (response) => {
        if (response.success && this.fiche()) {
          this.fiche.set({ ...this.fiche()!, photo: response.data.photo_url });
        }
        this.uploadingPhoto.set(false);
      },
      error: () => this.uploadingPhoto.set(false)
    });
  }

  goBack() { this.router.navigate(['/parent/enfants']); }
  getInitials(name: string): string { return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(); }
  getAvatarClass(sexe: string): string { return (sexe === 'M' || sexe === 'garçon') ? 'bg-gradient-to-br from-sea to-blue-600' : 'bg-gradient-to-br from-blush to-purple-600'; }
  getTauxClass(taux: number): string { return this.ficheService.getTauxPresenceClass(taux); }
  getProgressClass(taux: number): string { return this.ficheService.getProgressBarClass(taux); }
  getTrimestreMoyenne(t: number): number | null {
    const f = this.fiche();
    if (!f || !f.moyennes) return null;
    const key = `trimestre_${t}` as keyof typeof f.moyennes;
    return f.moyennes[key] as number | null;
  }

  getMoyenneClass(moyenne: any): string {
    if (!moyenne) return 'text-slate-300';
    return this.ficheService.getMentionColor(Number(moyenne));
  }
  formatDate(dateString: string): string { return this.ficheService.formatDate(dateString); }
}