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
    <div *ngIf="visible()" 
         class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
         (click)="handleBackdropClick($event)">
      
      <div class="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden" 
           (click)="$event.stopPropagation()">
        
        <div class="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-white">Traiter l'inscription</h2>
          </div>
          <button (click)="close()" class="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          
          <div *ngIf="inscription() as insc" class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6">
            <h3 class="font-bold text-lg mb-3 text-gray-800">Candidat</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600">Enfant</p>
                <p class="font-semibold text-gray-800">{{ insc.enfant.prenom }} {{ insc.enfant.nom }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Parent</p>
                <p class="font-semibold text-gray-800">{{ insc.parent.prenom }} {{ insc.parent.nom }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Niveau souhaité</p>
                <p class="font-semibold text-indigo-600">{{ getNiveauLabel(insc.niveau_souhaite) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Année scolaire</p>
                <p class="font-semibold text-gray-800">{{ insc.annee_scolaire }}</p>
              </div>
            </div>
          </div>

          <div class="mb-6 flex gap-2 p-1 bg-gray-100 rounded-2xl">
            <button 
              type="button"
              *ngFor="let act of actions"
              [class.bg-white]="currentAction() === act.value"
              [class.shadow-md]="currentAction() === act.value"
              [ngClass]="currentAction() === act.value ? act.activeClass : 'text-gray-600'"
              (click)="selectAction(act.value)"
              [disabled]="submitting()"
              class="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:bg-white/50 cursor-pointer disabled:opacity-50">
              <div class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="act.icon"/>
                </svg>
                {{ act.label }}
              </div>
            </button>
          </div>

          <div class="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
            <strong>Action sélectionnée :</strong> 
            <span class="ml-2 px-3 py-1 bg-white rounded-full font-semibold">{{ getActionLabel() }}</span>
          </div>

          <form (ngSubmit)="handleSubmit()" class="space-y-6">
            
            <div *ngIf="currentAction() === 'accept'" class="space-y-6">
              
              <div *ngIf="loadingClasses()" class="flex items-center justify-center py-8">
                <svg class="animate-spin w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>

              <div *ngIf="!loadingClasses() && classesDisponibles().length === 0" class="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4">
                <div class="flex items-start gap-3">
                  <svg class="w-6 h-6 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  <div>
                    <p class="font-semibold text-orange-800">Aucune classe disponible</p>
                    <p class="text-sm text-orange-700 mt-1">Il n'y a actuellement aucune classe avec des places disponibles.</p>
                  </div>
                </div>
              </div>

              <div *ngIf="classesDisponibles().length > 0">
                <label class="block text-sm font-bold text-gray-700 mb-2">Classe <span class="text-red-500">*</span></label>
                <select [ngModel]="selectedClasseId()" (ngModelChange)="selectedClasseId.set($event)" name="classe_id" required
                  class="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                  <option value="">Sélectionner une classe...</option>
                  <option *ngFor="let classe of classesDisponibles()" [value]="classe.id">
                    {{ classe.nom }} - {{ classe.places_disponibles !== null ? classe.places_disponibles + ' place(s)' : 'Illimité' }} ({{ classe.taux_occupation }}% occupé)
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Frais d'inscription (DT)</label>
                  <input type="number" [(ngModel)]="fraisInscription" name="frais_inscription" min="0" step="0.01" placeholder="0.00"
                    class="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Frais mensuels (DT)</label>
                  <input type="number" [(ngModel)]="fraisMensuel" name="frais_mensuel" min="0" step="0.01" placeholder="0.00"
                    class="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                </div>
              </div>

              <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <p class="text-sm text-blue-800">
                  <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Le parent choisira sa méthode de paiement (espèces, carte, en ligne) lors du paiement.
                </p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Remarques de l'administration</label>
              <textarea [(ngModel)]="remarques" name="remarques" rows="4" placeholder="Commentaires optionnels..."
                class="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none">
              </textarea>
            </div>

          </form>
        </div>

        <div class="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
          <button (click)="close()" type="button"
            class="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all">
            Annuler
          </button>

          <button (click)="handleSubmit()" [disabled]="!canSubmit() || submitting()" [ngClass]="getSubmitButtonClass()"
            class="px-8 py-2.5 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <span *ngIf="!submitting()">{{ getSubmitButtonLabel() }}</span>
            <span *ngIf="submitting()" class="flex items-center gap-2">
              <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Traitement...
            </span>
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host { display: contents; }
    button { pointer-events: auto !important; cursor: pointer !important; }
    button:disabled { pointer-events: none !important; cursor: not-allowed !important; }
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
    { value: 'accept' as const, label: 'Accepter', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', activeClass: 'text-green-600' },
    { value: 'wait' as const, label: 'Liste d\'attente', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', activeClass: 'text-blue-600' },
    { value: 'reject' as const, label: 'Refuser', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', activeClass: 'text-red-600' }
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

  getActionLabel(): string {
    const labels = { accept: 'Accepter', wait: 'Liste d\'attente', reject: 'Refuser' };
    return labels[this.currentAction()];
  }

  getSubmitButtonLabel(): string {
    const labels = { accept: 'Accepter l\'inscription', wait: 'Mettre en attente', reject: 'Refuser l\'inscription' };
    return labels[this.currentAction()];
  }

  getSubmitButtonClass(): string {
    const classes = {
      accept: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
      wait: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
      reject: 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
    };
    return classes[this.currentAction()];
  }

  getNiveauLabel(niveau: string | number): string {
    return InscriptionAdminService.getNiveauLabelShort(niveau);
  }
}