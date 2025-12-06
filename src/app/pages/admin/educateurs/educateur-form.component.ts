import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EducateursApiService } from '../../../services/educateurs-api.service';

@Component({
  selector: 'app-educateur-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4 sm:p-6">
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="relative mb-8">
      <div class="absolute -top-4 -left-4 w-16 h-16 bg-yellow-300 rounded-full opacity-60 animate-bounce"></div>
      <div class="absolute -top-2 right-10 w-12 h-12 bg-pink-300 rounded-full opacity-60 animate-bounce" style="animation-delay: 0.5s;"></div>

      <div class="card relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10"></div>
        <div class="relative flex flex-col lg:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-400 rounded-2xl flex items-center justify-center shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" *ngIf="isEdit()"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" *ngIf="!isEdit()"/>
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-black text-gray-800 tracking-tight">
                {{ isEdit() ? 'Modifier' : 'Nouvel' }} Éducateur
                <span class="text-2xl">{{ isEdit() ? '✏️' : '➕' }}</span>
              </h1>
              <p class="text-gray-600 font-medium">
                {{ isEdit() ? 'Mettre à jour les informations' : 'Ajouter un nouveau membre à l\'équipe' }}
              </p>
            </div>
          </div>
          <button
            class="btn-primary bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-purple-200 hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            type="button"
            (click)="back()"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Retour
          </button>
        </div>
      </div>
    </div>

    <!-- Form Card -->
    <div class="relative">
      <div class="card relative overflow-hidden bg-white/95 backdrop-blur border border-white/60 shadow-2xl">
        <div class="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-blue-50/80"></div>
        <div class="relative p-8">
          <form (ngSubmit)="submit()" #formRef="ngForm" class="space-y-6">
            <!-- Personal Information Section -->
            <div class="space-y-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-800">Informations personnelles</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Name Field -->
                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <div class="w-2 h-2 bg-purple-400 rounded-full"></div>
                    Nom complet <span class="text-red-500">*</span>
                  </label>
                  <input
                    class="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 bg-white/90 backdrop-blur placeholder-gray-400 font-medium transition-all duration-200"
                    [(ngModel)]="form.name"
                    name="name"
                    required
                    placeholder="Ex: Marie Dupont"
                  />
                </div>

                <!-- Email Field -->
                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <div class="w-2 h-2 bg-pink-400 rounded-full"></div>
                    Adresse email <span class="text-red-500">*</span>
                  </label>
                  <input
                    class="w-full px-4 py-3 rounded-2xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 bg-white/90 backdrop-blur placeholder-gray-400 font-medium transition-all duration-200"
                    type="email"
                    [(ngModel)]="form.email"
                    name="email"
                    required
                    placeholder="marie.dupont@jardin.com"
                  />
                </div>

                <!-- Telephone Field -->
                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    Téléphone
                  </label>
                  <input
                    class="w-full px-4 py-3 rounded-2xl border-2 border-green-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 bg-white/90 backdrop-blur placeholder-gray-400 font-medium transition-all duration-200"
                    type="tel"
                    [(ngModel)]="form.telephone"
                    name="telephone"
                    placeholder="Ex: +33 6 12 34 56 78"
                  />
                </div>

                <!-- Photo URL Field -->
                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <div class="w-2 h-2 bg-indigo-400 rounded-full"></div>
                    URL Photo
                  </label>
                  <input
                    class="w-full px-4 py-3 rounded-2xl border-2 border-indigo-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 bg-white/90 backdrop-blur placeholder-gray-400 font-medium transition-all duration-200"
                    type="url"
                    [(ngModel)]="form.photo"
                    name="photo"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>

              <!-- Diploma Field -->
              <div class="space-y-2">
                <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Diplôme <span class="text-red-500">*</span>
                </label>
                <input
                  class="w-full px-4 py-3 rounded-2xl border-2 border-blue-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 bg-white/90 backdrop-blur placeholder-gray-400 font-medium transition-all duration-200"
                  [(ngModel)]="form.diplome"
                  name="diplome"
                  required
                  placeholder="Ex: CAP Petite Enfance"
                />
              </div>

              <!-- Info message for password -->
              <div *ngIf="!isEdit()" class="p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                <div class="flex items-start gap-3">
                  <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-blue-800 font-bold mb-1">🔐 Mot de passe automatique</p>
                    <p class="text-blue-700 text-sm">
                      Un mot de passe sécurisé sera automatiquement généré et envoyé par email à l'éducateur. 
                      Il devra le changer lors de sa première connexion.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Professional Information Section -->
            <div class="space-y-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"/>
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-800">Informations professionnelles</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Hire Date Field -->
                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    Date d'embauche <span class="text-red-500">*</span>
                  </label>
                  <input
                    class="w-full px-4 py-3 rounded-2xl border-2 border-green-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 bg-white/90 backdrop-blur placeholder-gray-400 font-medium transition-all duration-200"
                    type="date"
                    [(ngModel)]="form.date_embauche"
                    name="date_embauche"
                    required
                  />
                </div>

                <!-- Salary Field -->
                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <div class="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    Salaire (€) <span class="text-red-500">*</span>
                  </label>
                  <input
                    class="w-full px-4 py-3 rounded-2xl border-2 border-yellow-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 bg-white/90 backdrop-blur placeholder-gray-400 font-medium transition-all duration-200"
                    type="number"
                    step="0.01"
                    min="0"
                    [(ngModel)]="form.salaire"
                    name="salaire"
                    required
                    placeholder="Ex: 2500.00"
                  />
                </div>
              </div>
            </div>

            <!-- Generated Password Display (after creation) -->
            <div *ngIf="generatedPassword()" class="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-green-800 font-bold text-lg mb-2">✅ Éducateur créé avec succès!</p>
                  <p class="text-green-700 mb-3">Mot de passe généré (un email a été envoyé) :</p>
                  <div class="flex items-center gap-3 bg-white p-4 rounded-xl border-2 border-green-300">
                    <code class="flex-1 text-lg font-mono font-bold text-gray-800">{{ generatedPassword() }}</code>
                    <button
                      type="button"
                      (click)="copyPassword()"
                      class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-colors"
                    >
                      📋 Copier
                    </button>
                  </div>
                  <p class="text-green-600 text-sm mt-3">
                    ⚠️ Assurez-vous de communiquer ce mot de passe à l'éducateur. Il devra le changer lors de sa première connexion.
                  </p>
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div *ngIf="error()" class="p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </div>
                <p class="text-red-700 font-medium">{{ error() }}</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                class="flex-1 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-green-200 hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                type="submit"
                [disabled]="!formRef.form.valid || generatedPassword()"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                {{ isEdit() ? 'Enregistrer les modifications' : 'Créer l\'éducateur' }}
              </button>

              <button
                class="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-gray-200 hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
                type="button"
                (click)="cancel()"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                {{ generatedPassword() ? 'Retour à la liste' : 'Annuler' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
  `
})
export class EducateurFormComponent {
  private api = inject(EducateursApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: number | null = null;
  isEdit = signal(false);
  error = signal<string | null>(null);
  generatedPassword = signal<string | null>(null);

  form: any = {
    name: '',
    email: '',
    diplome: '',
    date_embauche: '',
    salaire: 0,
    telephone: '',
    photo: ''
  };

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      this.isEdit.set(true);
      this.loadEducateur();
    }
  }

  private loadEducateur() {
    if (!this.id) return;
    
    this.api.get(this.id).subscribe({
      next: (res: any) => {
        const d = res.data ?? res;
        this.form = {
          name: d.user?.name || d.name || '',
          email: d.user?.email || d.email || '',
          diplome: d.diplome || '',
          date_embauche: d.date_embauche ? d.date_embauche.substring(0, 10) : '',
          salaire: d.salaire ? Number(d.salaire) : 0,
          telephone: d.telephone || '',
          photo: d.photo || ''
        };
      },
      error: (e) => {
        console.error('Error loading educateur:', e);
        this.error.set('Erreur lors du chargement des données');
      }
    });
  }

  submit() {
    this.error.set(null);

    if (!this.form.name.trim()) {
      this.error.set('Le nom est obligatoire');
      return;
    }

    if (!this.form.email.trim()) {
      this.error.set('L\'email est obligatoire');
      return;
    }

    if (!this.form.diplome.trim()) {
      this.error.set('Le diplôme est obligatoire');
      return;
    }

    if (!this.form.date_embauche) {
      this.error.set('La date d\'embauche est obligatoire');
      return;
    }

    if (!this.form.salaire || this.form.salaire <= 0) {
      this.error.set('Le salaire doit être supérieur à 0');
      return;
    }

    if (this.isEdit()) {
      this.updateEducateur();
    } else {
      this.createEducateur();
    }
  }

  private updateEducateur() {
    const { name, email, diplome, date_embauche, salaire, telephone, photo } = this.form;
    
    const payload: any = {
      diplome: diplome.trim(),
      date_embauche,
      salaire: Number(salaire),
      telephone: telephone?.trim() || null,
      photo: photo?.trim() || null,
      user: {
        name: name.trim(),
        email: email.trim()
      }
    };

    this.api.update(this.id!, payload).subscribe({
      next: () => {
        this.router.navigate(['/admin/educateurs']);
      },
      error: (e) => {
        console.error('Update error:', e);
        this.error.set(e?.error?.message || 'Erreur de mise à jour');
      }
    });
  }

  private createEducateur() {
    const { name, email, diplome, date_embauche, salaire, telephone, photo } = this.form;
    
    const payload = {
      diplome: diplome.trim(),
      date_embauche,
      salaire: Number(salaire),
      telephone: telephone?.trim() || undefined,
      photo: photo?.trim() || undefined,
      user: {
        name: name.trim(),
        email: email.trim()
      }
    };

    this.api.create(payload).subscribe({
      next: (response) => {
        // Afficher le mot de passe généré
        if (response.generated_password) {
          this.generatedPassword.set(response.generated_password);
        }
      },
      error: (e) => {
        console.error('Create error:', e);
        this.error.set(e?.error?.message || 'Erreur de création');
      }
    });
  }

  copyPassword() {
    const password = this.generatedPassword();
    if (password) {
      navigator.clipboard.writeText(password).then(() => {
        alert('Mot de passe copié dans le presse-papiers!');
      });
    }
  }

  cancel() {
    this.router.navigate(['/admin/educateurs']);
  }

  back() {
    this.router.navigate(['/admin']);
  }
}