import { Component, Input, Output, EventEmitter, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  InscriptionAdminService,
  Inscription, 
  ClasseDisponible, 
  InscriptionDecision
} from '../../../services/inscription-admin.service';

@Component({
  selector: 'app-inscription-accept-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (visible()) {
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" 
           (click)="handleBackdropClick($event)">
        
        <div class="glass bg-white/90 dark:bg-slate-800/90 rounded-[3rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border-white/60" 
             (click)="$event.stopPropagation()">
          
          <!-- Header -->
          <div class="relative px-8 py-6 bg-gradient-to-r from-sea via-indigo-600 to-purple-600 overflow-hidden">
            <div class="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div class="relative flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <h2 class="text-xl font-black text-white">Traiter l'inscription</h2>
                  <p class="text-white/70 text-xs font-bold">Dossier #{{ inscription()?.id }}</p>
                </div>
              </div>
              <button (click)="close()" class="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl text-white flex items-center justify-center transition-all group">
                <svg class="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="p-8 overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar space-y-6">
            
            <!-- Candidat Info -->
            @if (inscription(); as insc) {
              <div class="glass bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-100/50 dark:border-indigo-800/50">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Enfant</p>
                    <p class="font-black text-slate-800 dark:text-white">{{ insc.enfant.prenom }} {{ insc.enfant.nom }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Parent</p>
                    <p class="font-black text-slate-800 dark:text-white">{{ insc.parent.prenom }} {{ insc.parent.nom }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Niveau</p>
                    <p class="font-black text-sea">{{ getNiveauLabel(insc.niveau_souhaite) }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Année</p>
                    <p class="font-black text-slate-800 dark:text-white">{{ insc.annee_scolaire }}</p>
                  </div>
                </div>
              </div>
            }

            <!-- Action Selector -->
            <div class="flex gap-2 p-2 glass bg-slate-50/50 dark:bg-slate-700/20 rounded-2xl">
              @for (act of actions; track act.value) {
                <button type="button"
                        (click)="selectAction(act.value)"
                        [disabled]="submitting()"
                        class="flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 disabled:opacity-50"
                        [class.bg-white]="currentAction() === act.value"
                        [class.dark:bg-slate-700]="currentAction() === act.value"
                        [class.shadow-lg]="currentAction() === act.value"
                        [ngClass]="currentAction() === act.value ? act.activeClass : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'">
                  <div class="flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" [attr.d]="act.icon"/>
                    </svg>
                    {{ act.label }}
                  </div>
                </button>
              }
            </div>

            <!-- Accept Form -->
            @if (currentAction() === 'accept') {
              <div class="space-y-5">
                
                @if (loadingClasses()) {
                  <div class="flex items-center justify-center py-12">
                    <svg class="animate-spin w-10 h-10 text-sea" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                }

                @if (!loadingClasses() && classesDisponibles().length === 0) {
                  <div class="glass bg-tangerine/5 border-2 border-tangerine/20 rounded-2xl p-5">
                    <div class="flex items-start gap-3">
                      <svg class="w-6 h-6 text-tangerine flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                      </svg>
                      <div>
                        <p class="font-black text-slate-800 dark:text-white text-sm">Aucune classe disponible</p>
                        <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">Pas de places actuellement.</p>
                      </div>
                    </div>
                  </div>
                }

                @if (classesDisponibles().length > 0) {
                  <div>
                    <label class="block px-2 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Classe <span class="text-blush">*</span>
                    </label>
                    <select [ngModel]="selectedClasseId()" (ngModelChange)="selectedClasseId.set($event)" name="classe_id" required
                            class="w-full px-5 py-3 glass bg-white/60 dark:bg-slate-700/40 border-2 border-white/60 focus:border-sea/50 rounded-xl text-sm font-bold outline-none transition-all">
                      <option value="">Sélectionner...</option>
                      @for (classe of classesDisponibles(); track classe.id) {
                        <option [value]="classe.id">
                          {{ classe.nom }} - {{ classe.places_disponibles !== null ? classe.places_disponibles + ' place(s)' : 'Illimité' }} ({{ classe.taux_occupation }}%)
                        </option>
                      }
                    </select>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block px-2 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Frais inscription (DT)</label>
                      <input type="number" [(ngModel)]="fraisInscription" name="frais_inscription" min="0" step="0.01" placeholder="0.00"
                             class="w-full px-5 py-3 glass bg-white/60 dark:bg-slate-700/40 border-2 border-white/60 focus:border-sea/50 rounded-xl text-sm font-bold outline-none transition-all">
                    </div>
                    <div>
                      <label class="block px-2 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Frais mensuels (DT)</label>
                      <input type="number" [(ngModel)]="fraisMensuel" name="frais_mensuel" min="0" step="0.01" placeholder="0.00"
                             class="w-full px-5 py-3 glass bg-white/60 dark:bg-slate-700/40 border-2 border-white/60 focus:border-sea/50 rounded-xl text-sm font-bold outline-none transition-all">
                    </div>
                  </div>

                  <div class="glass bg-sea/5 border-l-4 border-sea rounded-xl p-4">
                    <p class="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-start gap-2">
                      <svg class="w-4 h-4 text-sea flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Le parent choisira sa méthode de paiement lors du règlement.
                    </p>
                  </div>
                }
              </div>
            }

            <!-- Remarques -->
            <div>
              <label class="block px-2 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Remarques</label>
              <textarea [(ngModel)]="remarques" name="remarques" rows="3" placeholder="Commentaires optionnels..."
                        class="w-full px-5 py-3 glass bg-white/60 dark:bg-slate-700/40 border-2 border-white/60 focus:border-sea/50 rounded-xl text-sm font-medium outline-none transition-all resize-none">
              </textarea>
            </div>

          </div>

          <!-- Footer -->
          <div class="px-8 py-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <button (click)="close()" type="button"
                    class="px-6 py-3 glass hover:bg-white dark:hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              Annuler
            </button>

            <button (click)="handleSubmit()" [disabled]="!canSubmit() || submitting()"
                    [ngClass]="getSubmitButtonClass()"
                    class="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
              @if (!submitting()) {
                {{ getSubmitButtonLabel() }}
              } @else {
                <span class="flex items-center gap-2">
                  <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Traitement...
                </span>
              }
            </button>
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: contents; }
  `]
})
export class InscriptionAcceptModalComponent implements OnInit {
  private service = inject(InscriptionAdminService);

  @Input() set show(value: boolean) {
    this.visible.set(value);
    if (value && this.inscription()) {
      this.loadClassesDisponibles();
    }
  }
  
  @Input() set inscriptionData(value: Inscription | null) {
    this.inscription.set(value);
    if (value) {
      this.loadClassesDisponibles();
    }
  }

  @Output() closed = new EventEmitter<void>();
  @Output() success = new EventEmitter<any>();

  visible = signal(false);
  inscription = signal<Inscription | null>(null);
  classesDisponibles = signal<ClasseDisponible[]>([]);
  loadingClasses = signal(false);
  submitting = signal(false);
  currentAction = signal<'accept' | 'wait' | 'reject'>('accept');
  selectedClasseId = signal<string>('');
  
  fraisInscription: number | undefined;
  fraisMensuel: number | undefined;
  remarques = '';

  actions = [
    { 
      value: 'accept' as const, 
      label: 'Accepter', 
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', 
      activeClass: 'text-matcha shadow-matcha/20' 
    },
    { 
      value: 'wait' as const, 
      label: 'En attente', 
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', 
      activeClass: 'text-indigo-600 shadow-indigo-500/20' 
    },
    { 
      value: 'reject' as const, 
      label: 'Refuser', 
      icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', 
      activeClass: 'text-blush shadow-blush/20' 
    }
  ];

  canSubmit = computed(() => {
    if (this.submitting()) return false;
    if (this.currentAction() === 'accept') {
      const classeId = this.selectedClasseId();
      return classeId !== '' && classeId !== null && classeId !== undefined;
    }
    return true;
  });

  ngOnInit() {
    if (this.inscription() && this.visible()) {
      this.loadClassesDisponibles();
    }
  }

  loadClassesDisponibles() {
    const insc = this.inscription();
    if (!insc) return;

    this.loadingClasses.set(true);
    
    this.service.getClassesDisponibles(insc.niveau_souhaite, insc.annee_scolaire).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.classesDisponibles.set(response.data);
        } else {
          this.classesDisponibles.set([]);
        }
        this.loadingClasses.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement classes:', err);
        this.classesDisponibles.set([]);
        this.loadingClasses.set(false);
      }
    });
  }

  selectAction(action: 'accept' | 'wait' | 'reject') {
    this.currentAction.set(action);
    if (action !== 'accept') {
      this.selectedClasseId.set('');
    }
  }

  handleSubmit() {
    if (!this.canSubmit() || this.submitting()) return;

    const insc = this.inscription();
    if (!insc) return;

    this.submitting.set(true);

    const decision: InscriptionDecision = {
      action: this.currentAction(),
      remarques: this.remarques || undefined
    };

    if (this.currentAction() === 'accept') {
      const classeId = this.selectedClasseId() ? Number(this.selectedClasseId()) : undefined;
      
      if (!classeId) {
        alert('Veuillez sélectionner une classe');
        this.submitting.set(false);
        return;
      }
      
      decision.classe_id = classeId;
      decision.frais_inscription = this.fraisInscription;
      decision.frais_mensuel = this.fraisMensuel;
    }

    this.service.decideInscription(insc.id, decision).subscribe({
      next: (response) => {
        this.submitting.set(false);
        if (response.success) {
          this.success.emit(response.data);
          this.close();
          alert(response.message);
        }
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.submitting.set(false);
        alert('Erreur : ' + (err.error?.message || 'Erreur inconnue'));
      }
    });
  }

  handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget && !this.submitting()) {
      this.close();
    }
  }

  close() {
    if (this.submitting()) return;
    this.visible.set(false);
    this.resetForm();
    this.closed.emit();
  }

  resetForm() {
    this.currentAction.set('accept');
    this.selectedClasseId.set('');
    this.fraisInscription = undefined;
    this.fraisMensuel = undefined;
    this.remarques = '';
    this.classesDisponibles.set([]);
  }

  getSubmitButtonLabel(): string {
    const labels = { 
      accept: 'Accepter', 
      wait: 'En attente', 
      reject: 'Refuser' 
    };
    return labels[this.currentAction()];
  }

  getSubmitButtonClass(): string {
    const classes = {
      accept: 'bg-matcha text-white shadow-matcha/30',
      wait: 'bg-indigo-600 text-white shadow-indigo-500/30',
      reject: 'bg-blush text-white shadow-blush/30'
    };
    return classes[this.currentAction()];
  }

  getNiveauLabel(niveau: string | number): string {
    return InscriptionAdminService.getNiveauLabelShort(niveau);
  }
}