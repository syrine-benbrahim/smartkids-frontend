import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminMatieresApiService, Matiere } from '../../../services/admin-matieres-api.service';
import { AssignNiveauModalComponent } from './assign-niveau-modal.component';

@Component({
    selector: 'app-matieres-list',
    standalone: true,
    imports: [CommonModule, FormsModule, AssignNiveauModalComponent],
    templateUrl: './matieres-list.component.html'
})
export class MatieresListComponent {
    private api = inject(AdminMatieresApiService);
    private router = inject(Router);

    search = '';
    statutFilter = '';
    perPage = 15;
    page = signal(1);
    items = signal<Matiere[]>([]);

    // Assign modal state
    selectedMatiereParams: { id: number; nom: string } | null = null;

    ngOnInit() {
        this.reload();
    }

    reload() {
        const params: any = {
            page: this.page(),
            per_page: this.perPage
        };
        if (this.search) params.search = this.search;
        if (this.statutFilter) params.actif = this.statutFilter;
        this.api.list(params).subscribe(r => {
            this.items.set(r.data?.data ?? []);
        });
    }

    next() { this.page.update(p => p + 1); this.reload(); }
    prev() { this.page.update(p => Math.max(1, p - 1)); this.reload(); }

    // view(id: number) { this.router.navigate(['/admin/matieres', id]); } // Not required by spec but good to have
    edit(id: number) { this.router.navigate(['/admin/matieres', id, 'edit']); }
    create() { this.router.navigate(['/admin/matieres/create']); }

    remove(id: number, nom: string) {
        if (!confirm(`Delete matiere "${nom}"?`)) return;
        this.api.delete(id).subscribe(() => this.reload());
    }

    openAssignModal(m: Matiere) {
        this.selectedMatiereParams = { id: m.id, nom: m.nom };
    }

    closeAssignModal() {
        this.selectedMatiereParams = null;
    }

    onAssigned() {
        this.closeAssignModal();
        // Maybe show toast?
    }
}
