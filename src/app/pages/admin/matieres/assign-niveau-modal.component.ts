import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminMatieresApiService } from '../../../services/admin-matieres-api.service';

@Component({
    selector: 'app-assign-niveau-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './assign-niveau-modal.component.html'
})
export class AssignNiveauModalComponent {
    @Input() matiereId!: number;
    @Input() matiereNom!: string;
    @Output() closed = new EventEmitter<void>();
    @Output() assigned = new EventEmitter<void>();

    private fb = inject(FormBuilder);
    private api = inject(AdminMatieresApiService);

    form = this.fb.group({
        niveau: ['', Validators.required],
        heures_par_semaine: [2, [Validators.min(1)]],
        objectifs_specifiques: ['']
    });

    loading = false;
    successMessage = '';
    errorMessage = '';

    submit() {
        if (this.form.invalid) return;
        this.loading = true;
        this.successMessage = '';
        this.errorMessage = '';

        const payload = {
            niveau: this.form.value.niveau!,
            heures_par_semaine: this.form.value.heures_par_semaine!,
            objectifs_specifiques: this.form.value.objectifs_specifiques!
        };

        this.api.assignToNiveau(this.matiereId, payload).subscribe({
            next: (res) => {
                this.loading = false;
                if (res.success) {
                    this.successMessage = res.message || 'Affectation réussie';
                    setTimeout(() => this.assigned.emit(), 1500);
                } else {
                    this.errorMessage = res.message || 'Erreur lors de l\'affectation';
                }
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = err.error?.message || 'Erreur inconnue';
            }
        });
    }

    close() { this.closed.emit(); }
}
