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
<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-green-100">
    <div class="flex items-center gap-4">
      <div class="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
        <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" *ngIf="isEdit()"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" *ngIf="!isEdit()"/>
        </svg>
      </div>
      <div>
        <h2 class="text-2xl font-black text-gray-800">{{ isEdit() ? 'Edit' : 'New' }} Teacher {{ isEdit() ? '✏️' : '➕' }}</h2>
        <p class="text-sm text-gray-600 font-medium">{{ isEdit() ? 'Update teacher information' : 'Add a new team member' }}</p>
      </div>
    </div>
    <button
      class="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 text-sm"
      type="button"
      (click)="back()"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
      </svg>
      Back
    </button>
  </div>

  <!-- Form Card -->
  <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-200 p-8">
    <form (ngSubmit)="submit()" #formRef="ngForm" class="space-y-8">
      
      <!-- Personal Information Section -->
      <div class="space-y-5">
        <div class="flex items-center gap-3 pb-3 border-b-2 border-purple-100">
          <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-md">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <h3 class="text-lg font-black text-gray-800">Personal Information</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Name Field -->
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
              <div class="w-2 h-2 bg-purple-400 rounded-full"></div>
              Full Name <span class="text-red-500">*</span>
            </label>
            <input
              class="w-full px-4 py-2.5 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 bg-white transition-all placeholder-gray-400 font-medium text-sm"
              [(ngModel)]="form.name"
              name="name"
              required
              placeholder="e.g., Marie Dupont"
            />
          </div>

          <!-- Email Field -->
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
              <div class="w-2 h-2 bg-pink-400 rounded-full"></div>
              Email Address <span class="text-red-500">*</span>
            </label>
            <input
              class="w-full px-4 py-2.5 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 bg-white transition-all placeholder-gray-400 font-medium text-sm"
              type="email"
              [(ngModel)]="form.email"
              name="email"
              required
              placeholder="marie.dupont@school.com"
            />
          </div>

          <!-- Telephone Field -->
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
              <div class="w-2 h-2 bg-green-400 rounded-full"></div>
              Phone Number
            </label>
            <input
              class="w-full px-4 py-2.5 rounded-xl border-2 border-green-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 bg-white transition-all placeholder-gray-400 font-medium text-sm"
              type="tel"
              [(ngModel)]="form.telephone"
              name="telephone"
              placeholder="e.g., +33 6 12 34 56 78"
            />
          </div>

          <!-- Photo URL Field -->
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
              <div class="w-2 h-2 bg-indigo-400 rounded-full"></div>
              Photo URL
            </label>
            <input
              class="w-full px-4 py-2.5 rounded-xl border-2 border-indigo-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 bg-white transition-all placeholder-gray-400 font-medium text-sm"
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
            Degree / Diploma <span class="text-red-500">*</span>
          </label>
          <input
            class="w-full px-4 py-2.5 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 bg-white transition-all placeholder-gray-400 font-medium text-sm"
            [(ngModel)]="form.diplome"
            name="diplome"
            required
            placeholder="e.g., Bachelor's in Early Childhood Education"
          />
        </div>

        <!-- Password Info for New Teachers -->
        <div *ngIf="!isEdit()" class="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-blue-800 font-bold mb-1 text-sm">🔐 Automatic Password</p>
              <p class="text-blue-700 text-xs">
                A secure password will be automatically generated and emailed to the teacher. They must change it on first login.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Professional Information Section -->
      <div class="space-y-5">
        <div class="flex items-center gap-3 pb-3 border-b-2 border-green-100">
          <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-md">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"/>
            </svg>
          </div>
          <h3 class="text-lg font-black text-gray-800">Professional Information</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Hire Date Field -->
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
              <div class="w-2 h-2 bg-green-400 rounded-full"></div>
              Hire Date <span class="text-red-500">*</span>
            </label>
            <input
              class="w-full px-4 py-2.5 rounded-xl border-2 border-green-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 bg-white transition-all font-medium text-sm"
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
              Salary (€) <span class="text-red-500">*</span>
            </label>
            <input
              class="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 bg-white transition-all placeholder-gray-400 font-medium text-sm"
              type="number"
              step="0.01"
              min="0"
              [(ngModel)]="form.salaire"
              name="salaire"
              required
              placeholder="e.g., 2500.00"
            />
          </div>
        </div>
      </div>

      <!-- Generated Password Display -->
      <div *ngIf="generatedPassword()" class="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-green-800 font-black text-base mb-2">✅ Teacher Created Successfully!</p>
            <p class="text-green-700 font-medium mb-3 text-sm">Generated password (email sent):</p>
            <div class="flex items-center gap-3 bg-white p-4 rounded-lg border-2 border-green-300">
              <code class="flex-1 text-base font-mono font-bold text-gray-800 break-all">{{ generatedPassword() }}</code>
              <button
                type="button"
                (click)="copyPassword()"
                class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-all hover:scale-105 text-sm whitespace-nowrap"
              >
                📋 Copy
              </button>
            </div>
            <p class="text-green-600 text-xs mt-3 font-medium">
              ⚠️ Make sure to communicate this password. They must change it on first login.
            </p>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="error()" class="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
          <p class="text-red-700 font-bold text-sm">{{ error() }}</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t-2 border-gray-200">
        <button
          class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
          type="submit"
          [disabled]="!formRef.form.valid || generatedPassword()"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
          </svg>
          {{ isEdit() ? 'Save Changes' : 'Create Teacher' }}
        </button>

        <button
          class="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
          type="button"
          (click)="cancel()"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          {{ generatedPassword() ? 'Back to List' : 'Cancel' }}
        </button>
      </div>
    </form>
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
        console.error('Error loading teacher:', e);
        this.error.set('Error loading data');
      }
    });
  }

  submit() {
    this.error.set(null);

    if (!this.form.name.trim()) {
      this.error.set('Name is required');
      return;
    }

    if (!this.form.email.trim()) {
      this.error.set('Email is required');
      return;
    }

    if (!this.form.diplome.trim()) {
      this.error.set('Degree is required');
      return;
    }

    if (!this.form.date_embauche) {
      this.error.set('Hire date is required');
      return;
    }

    if (!this.form.salaire || this.form.salaire <= 0) {
      this.error.set('Salary must be greater than 0');
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
        this.error.set(e?.error?.message || 'Update error');
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
        if (response.generated_password) {
          this.generatedPassword.set(response.generated_password);
        }
      },
      error: (e) => {
        console.error('Create error:', e);
        this.error.set(e?.error?.message || 'Creation error');
      }
    });
  }

  copyPassword() {
    const password = this.generatedPassword();
    if (password) {
      navigator.clipboard.writeText(password).then(() => {
        alert('Password copied to clipboard!');
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