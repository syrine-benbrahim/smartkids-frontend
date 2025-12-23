import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClassesApiService, ClasseFormData } from '../../../services/classes-api.service';

@Component({
  selector: 'app-classe-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="space-y-6">
    
    <!-- Header -->
    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-3xl p-6 shadow-xl border-4 border-purple-200">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" *ngIf="isEdit()"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" *ngIf="!isEdit()"/>
          </svg>
        </div>
        <div>
          <h2 class="text-3xl font-black text-white">{{ isEdit() ? 'Edit Class' : 'New Class' }} {{ isEdit() ? '✏️' : '➕' }}</h2>
          <p class="text-white/80 text-sm font-medium">{{ isEdit() ? 'Update class information' : 'Add a new class to your school' }}</p>
        </div>
      </div>
      <button
        class="bg-white/20 hover:bg-white/30 backdrop-blur border-2 border-white/30 hover:border-white/50 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
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
    <div class="bg-white rounded-3xl shadow-sm border-4 border-purple-100 p-8">
      <form (ngSubmit)="submit()" #form="ngForm" class="space-y-8">
        
        <!-- Basic Information Section -->
        <div class="space-y-5">
          <div class="flex items-center gap-3 pb-3 border-b-2 border-purple-100">
            <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-md">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h3 class="text-lg font-black text-gray-800">Basic Information</h3>
          </div>

          <!-- Class Name -->
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
              <div class="w-2 h-2 bg-purple-400 rounded-full"></div>
              Class Name <span class="text-red-500">*</span>
            </label>
            <input
              class="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 bg-white transition-all placeholder-gray-400 font-medium text-sm"
              [(ngModel)]="formData.nom"
              name="nom"
              #nomField="ngModel"
              required
              maxlength="255"
              (blur)="checkNomDisponibilite()"
              placeholder="e.g., CP-A, CE1 Red, etc."
            />
            
            <div *ngIf="nomField.invalid && nomField.touched" class="text-red-600 text-sm font-medium">
              <div *ngIf="nomField.errors?.['required']">Class name is required</div>
              <div *ngIf="nomField.errors?.['maxlength']">Name cannot exceed 255 characters</div>
            </div>

            <div *ngIf="nomStatus().message" class="flex items-center gap-2 text-sm font-medium mt-2"
              [class]="nomStatus().available ? 'text-green-600' : 'text-red-600'">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path *ngIf="nomStatus().available" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                <path *ngIf="!nomStatus().available" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              {{ nomStatus().message }}
            </div>
          </div>

          <!-- Level -->
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
              <div class="w-2 h-2 bg-pink-400 rounded-full"></div>
              Level <span class="text-red-500">*</span>
            </label>
            <select
              class="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 bg-white transition-all font-medium text-sm"
              [(ngModel)]="formData.niveau"
              name="niveau"
              #niveauField="ngModel"
              required>
              <option value="">Select a level</option>
              <option value="1">1 - Petite Section</option>
              <option value="2">2 - Moyenne Section</option>
              <option value="3">3 - Grande Section</option>
              <option value="4">4 - CP</option>
              <option value="5">5 - CE1</option>
              <option value="6">6 - CE2</option>
              <option value="7">7 - CM1</option>
              <option value="8">8 - CM2</option>
            </select>

            <div *ngIf="niveauField.invalid && niveauField.touched" class="text-red-600 text-sm font-medium">
              <div *ngIf="niveauField.errors?.['required']">Level is required</div>
            </div>
          </div>

          <!-- Capacity -->
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
              <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
              Maximum Capacity <span class="text-red-500">*</span>
            </label>
            <input
              class="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 bg-white transition-all placeholder-gray-400 font-medium text-sm"
              type="number"
              [(ngModel)]="formData.capacite_max"
              name="capacite"
              #capaciteField="ngModel"
              required
              min="1"
              max="50"
              placeholder="e.g., 25"
            />

            <div *ngIf="capaciteField.invalid && capaciteField.touched" class="text-red-600 text-sm font-medium">
              <div *ngIf="capaciteField.errors?.['required']">Capacity is required</div>
              <div *ngIf="capaciteField.errors?.['min']">Capacity must be at least 1</div>
              <div *ngIf="capaciteField.errors?.['max']">Capacity cannot exceed 50</div>
            </div>

            <p class="text-sm text-gray-500 font-medium">Maximum number of students (between 1 and 50)</p>
          </div>

          <!-- Description -->
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-bold text-gray-700">
              <div class="w-2 h-2 bg-indigo-400 rounded-full"></div>
              Description (Optional)
            </label>
            <textarea
              class="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 bg-white transition-all placeholder-gray-400 font-medium text-sm"
              [(ngModel)]="formData.description"
              name="description"
              #descriptionField="ngModel"
              rows="4"
              maxlength="1000"
              placeholder="Optional description, educational objectives, special features..."></textarea>

            <div *ngIf="descriptionField.errors?.['maxlength']" class="text-red-600 text-sm font-medium">
              Description cannot exceed 1000 characters
            </div>

            <p class="text-sm text-gray-500 font-medium">
              {{ (formData.description || '').length }}/1000 characters
            </p>
          </div>
        </div>

        <!-- Preview Card -->
        <div *ngIf="formData.nom || formData.niveau || formData.capacite_max" 
          class="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </div>
            <h3 class="font-black text-purple-900">Preview</h3>
          </div>
          <div class="text-sm font-medium text-purple-800 space-y-2">
            <div *ngIf="formData.nom" class="flex items-start gap-2">
              <span class="font-black min-w-[100px]">Name:</span>
              <span>{{ formData.nom }}</span>
            </div>
            <div *ngIf="formData.niveau" class="flex items-start gap-2">
              <span class="font-black min-w-[100px]">Level:</span>
              <span>{{ getNiveauLabel(formData.niveau) }}</span>
            </div>
            <div *ngIf="formData.capacite_max" class="flex items-start gap-2">
              <span class="font-black min-w-[100px]">Capacity:</span>
              <span>{{ formData.capacite_max }} students</span>
            </div>
            <div *ngIf="formData.description" class="flex items-start gap-2">
              <span class="font-black min-w-[100px]">Description:</span>
              <span>{{ formData.description | slice:0:100 }}{{ formData.description && formData.description.length > 100 ? '...' : '' }}</span>
            </div>
          </div>
        </div>

        <!-- Error Messages -->
        <div *ngIf="errors().length > 0" class="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-black text-red-800 mb-2">Validation Errors:</h3>
              <ul class="text-sm text-red-700 font-medium space-y-1">
                <li *ngFor="let error of errors()" class="flex items-start gap-2">
                  <span class="text-red-500">•</span>
                  <span>{{ error }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t-2 border-gray-200">
          <button
            class="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
            type="submit"
            [disabled]="form.invalid || loading() || (formData.nom && !nomStatus().available)">
            <svg *ngIf="loading()" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg *ngIf="!loading()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
            {{ loading() ? 'Saving...' : (isEdit() ? 'Update Class' : 'Create Class') }}
          </button>

          <button 
            type="button" 
            class="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            (click)="back()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Cancel
          </button>

          <button 
            *ngIf="!isEdit()"
            type="button" 
            class="flex-1 border-2 border-purple-300 hover:bg-purple-50 text-purple-700 px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            (click)="resetForm()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Reset
          </button>
        </div>
      </form>
    </div>

    <!-- Tips Card -->
    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl p-6 border-2 border-blue-200">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
        </div>
        <h3 class="font-black text-blue-900">💡 Helpful Tips</h3>
      </div>
      <ul class="text-sm text-blue-800 font-medium space-y-2">
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-0.5">•</span>
          <span>Choose a descriptive and unique name for the class</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-0.5">•</span>
          <span>Recommended capacity varies by level: 15-20 for kindergarten, 20-25 for elementary</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-0.5">•</span>
          <span>A clear description helps educators and parents understand the class specifics</span>
        </li>
        <li *ngIf="isEdit()" class="flex items-start gap-2">
          <span class="text-blue-500 mt-0.5">•</span>
          <span>You cannot reduce capacity below the current number of enrolled students</span>
        </li>
      </ul>
    </div>
  </div>
  `
})
export class ClasseFormComponent {
  private api = inject(ClassesApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  errors = signal<string[]>([]);
  nomStatus = signal<{ available: boolean; message: string }>({ available: true, message: '' });

  formData: Omit<ClasseFormData, 'niveau'> & { niveau: string } = {
    nom: '',
    niveau: '',
    capacite_max: 25,
    description: ''
  };

  isEdit = signal(false);
  classeId: number | null = null;

  getNiveauLabel(niveau: string | number): string {
    const labels: { [key: string]: string } = {
      '1': 'Petite Section', '2': 'Moyenne Section', '3': 'Grande Section',
      '4': 'CP', '5': 'CE1', '6': 'CE2', '7': 'CM1', '8': 'CM2'
    };
    return labels[niveau.toString()] || niveau.toString();
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const isEditRoute = this.route.snapshot.url.some(s => s.path === 'edit');

    if (id && isEditRoute) {
      this.isEdit.set(true);
      this.classeId = Number(id);
      this.loadClasse(this.classeId);
    }
  }

  loadClasse(id: number) {
    this.loading.set(true);
    this.api.get(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.formData = {
            nom: res.data.nom,
            niveau: res.data.niveau?.toString() || '',
            capacite_max: res.data.capacite_max,
            description: res.data.description || ''
          };
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errors.set(['Unable to load class data']);
        this.loading.set(false);
      }
    });
  }

  checkNomDisponibilite() {
    if (!this.formData.nom || this.formData.nom.length < 2) {
      this.nomStatus.set({ available: true, message: '' });
      return;
    }

    this.api.checkNomDisponibilite(this.formData.nom, this.classeId || undefined).subscribe({
      next: res => this.nomStatus.set({ available: res.available, message: res.message }),
      error: err => console.error(err)
    });
  }

  submit() {
    if (!this.formData.nom || !this.formData.niveau || !this.formData.capacite_max) return;

    this.loading.set(true);
    this.errors.set([]);

    const submitData: ClasseFormData = {
      ...this.formData,
      niveau: parseInt(this.formData.niveau, 10)
    };

    if (isNaN(submitData.niveau)) {
      this.errors.set(['Invalid level selected']);
      this.loading.set(false);
      return;
    }

    const operation = this.isEdit() && this.classeId
      ? this.api.update(this.classeId, submitData)
      : this.api.create(submitData);

    operation.subscribe({
      next: res => {
        if (res.success) this.router.navigate(['/admin/classes', res.data.id]);
        else this.handleErrors(res);
        this.loading.set(false);
      },
      error: err => {
        console.error(err);
        this.handleErrors(err.error);
        this.loading.set(false);
      }
    });
  }

  private handleErrors(err: any) {
    const errors: string[] = [];

    if (err?.message) errors.push(err.message);

    if (err?.errors) {
      Object.values(err.errors).forEach((fieldErrors: unknown) => {
        if (Array.isArray(fieldErrors)) {
          errors.push(...(fieldErrors as string[]));
        } else if (typeof fieldErrors === 'string') {
          errors.push(fieldErrors);
        } else {
          errors.push(String(fieldErrors));
        }
      });
    }

    if (errors.length === 0) {
      errors.push('An unexpected error occurred');
    }

    this.errors.set(errors);
  }

  resetForm() {
    this.formData = { nom: '', niveau: '', capacite_max: 25, description: '' };
    this.errors.set([]);
    this.nomStatus.set({ available: true, message: '' });
  }

  back() {
    if (this.isEdit() && this.classeId) this.router.navigate(['/admin/classes', this.classeId]);
    else this.router.navigate(['/admin/classes']);
  }
}