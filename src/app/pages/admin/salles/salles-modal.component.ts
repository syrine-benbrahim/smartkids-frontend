import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminSallesApiService, Salle } from '../../../services/admin-salles-api.service';

@Component({
    selector: 'app-salles-modal',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './salles-modal.component.html'
})
export class SallesModalComponent {
    @Input() salle?: Salle; // undefined for create or if passed from parent
    @Output() saved = new EventEmitter<void>();

    private fb = inject(FormBuilder);
    private api = inject(AdminSallesApiService);
    public router = inject(Router);
    private route = inject(ActivatedRoute);

    form: FormGroup = this.fb.group({
        code: ['', Validators.required],
        nom: ['', Validators.required],
        capacite: [1, [Validators.required, Validators.min(1)]],
        is_active: [true]
    });

    id: number | null = null;

    ngOnInit() {
        // If passed via Input, use it
        if (this.salle) {
            this.patchForm(this.salle);
        } else {
            // Otherwise check route params
            const routeId = this.route.snapshot.paramMap.get('id');
            if (routeId) {
                this.id = +routeId;
                this.api.get(this.id).subscribe(res => {
                    if (res.data) {
                        this.salle = res.data;
                        this.patchForm(res.data);
                    }
                });
            }
        }
    }

    private patchForm(salle: Salle) {
        this.form.patchValue({
            code: salle.code,
            nom: salle.nom,
            capacite: salle.capacite,
            is_active: salle.is_active
        });
    }

    submit() {
        if (this.form.invalid) return;
        const payload = this.form.value;
        const targetId = this.salle?.id || this.id;

        const request = targetId
            ? this.api.update(targetId, payload)
            : this.api.create(payload);

        request.subscribe(() => {
            this.saved.emit();
            this.router.navigate(['/admin/salles']);
        });
    }

    cancel() {
        this.router.navigate(['../'], { relativeTo: this.router.routerState.root.firstChild });
    }
}
