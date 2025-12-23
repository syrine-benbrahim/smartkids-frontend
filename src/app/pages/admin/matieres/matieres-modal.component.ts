import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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

    form = this.fb.group({
        nom: ['', Validators.required],
        code: ['', Validators.required],
        description: [''],
        niveau: ['', Validators.required],
        coefficient: [1, [Validators.required, Validators.min(1)]],
        couleur: ['#3b82f6', Validators.required],
        actif: [true],
        photo: [null as File | null] // handled manually
    });

    isEdit = signal(false);
    matiereId: number | null = null;
    loading = signal(false);
    photoPreview: string | ArrayBuffer | null = null;

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
            this.form.patchValue({ photo: file });
            const reader = new FileReader();
            reader.onload = e => this.photoPreview = reader.result;
            reader.readAsDataURL(file);
        }
    }

    submit() {
        if (this.form.invalid) return;
        this.loading.set(true);

        const formData = new FormData();
        Object.entries(this.form.value).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, value as any);
            }
        });
        // Explicitly handle boolean for FormData
        formData.set('actif', this.form.get('actif')?.value ? '1' : '0');

        const req = this.isEdit() && this.matiereId
            ? this.api.update(this.matiereId, formData)
            : this.api.create(formData);

        req.subscribe({
            next: (res) => {
                this.loading.set(false);
                if (res.success) {
                    this.router.navigate(['/admin/matieres']);
                } else {
                    alert(res.message || 'Error occurred');
                }
            },
            error: (err) => {
                this.loading.set(false);
                console.error(err);
                alert(err.error?.message || 'Error occurred');
            }
        });
    }

    cancel() {
        this.router.navigate(['/admin/matieres']);
    }
}
