import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminMatieresApiService } from '../../../services/admin-matieres-api.service';

@Component({
  selector: 'app-matieres-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './matieres-modal.component.html'
})
export class MatieresModalComponent {
  private api = inject(AdminMatieresApiService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  niveaux = ['Petite Section', 'Moyenne Section', 'Grande Section'];

  form = this.fb.group({
    nom: ['', Validators.required],
    code: ['', Validators.required],
    description: [''],
    niveau: ['', Validators.required],
    coefficient: [1, [Validators.required, Validators.min(1)]],
    couleur: ['#3b82f6', Validators.required],
    actif: [true]
  });

  isEdit = signal(false);
  matiereId: number | null = null;
  loading = signal(false);
  photoPreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.matiereId = +id;
      this.loadMatiere(this.matiereId);
    }
  }

  loadMatiere(id: number) {
    this.api.get(id).subscribe(res => {
      if (res.data) {
        const m = res.data;
        this.form.patchValue({
          nom: m.nom,
          code: m.code,
          description: m.description,
          niveau: m.niveau,
          coefficient: m.coefficient,
          couleur: m.couleur,
          actif: m.actif
        });
        if (m.photo) this.photoPreview = m.photo;
      }
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.photoPreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  submit() {
    if (this.form.invalid) {
      console.log('Form invalid:', this.form.errors);
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          console.log(`${key} errors:`, control.errors);
        }
      });
      return;
    }
    
    this.loading.set(true);

    // If there's a photo, use FormData, otherwise use JSON
    if (this.selectedFile) {
      const formData = new FormData();
      const formValue = this.form.value;
      
      formData.append('nom', formValue.nom || '');
      formData.append('code', formValue.code || '');
      formData.append('niveau', formValue.niveau || '');
      formData.append('coefficient', (formValue.coefficient || 1).toString());
      formData.append('couleur', formValue.couleur || '#3b82f6');
      formData.append('actif', formValue.actif ? '1' : '0');
      
      if (formValue.description && formValue.description.trim()) {
        formData.append('description', formValue.description);
      }
      
      formData.append('photo', this.selectedFile);
      
      console.log('Sending FormData with photo');
      this.sendRequest(formData);
    } else {
      // Send as JSON when no photo
      const jsonPayload = {
        nom: this.form.value.nom,
        code: this.form.value.code,
        description: this.form.value.description || null,
        niveau: this.form.value.niveau,
        coefficient: this.form.value.coefficient,
        couleur: this.form.value.couleur,
        actif: this.form.value.actif ? true : false
      };
      
      console.log('Sending JSON:', jsonPayload);
      this.sendRequest(jsonPayload);
    }
  }

  private sendRequest(data: FormData | any) {
    const req = this.isEdit() && this.matiereId
      ? this.api.update(this.matiereId, data)
      : this.api.create(data);

    req.subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.router.navigate(['/admin/matieres']);
        } else {
          alert(res.message || 'Erreur lors de l\'enregistrement');
        }
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Erreur complète:', err);
        
        // Display validation errors if available
        if (err.error?.errors) {
          const errors = Object.entries(err.error.errors)
            .map(([field, msgs]: [string, any]) => `${field}: ${msgs.join(', ')}`)
            .join('\n');
          alert(`Erreurs de validation:\n${errors}`);
        } else {
          alert(err.error?.message || 'Erreur inconnue');
        }
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/matieres']);
  }
}