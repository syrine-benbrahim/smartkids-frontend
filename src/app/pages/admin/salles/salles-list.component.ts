import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminSallesApiService, Salle } from '../../../services/admin-salles-api.service';

@Component({
    selector: 'app-salles-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './salles-list.component.html'
})
export class SallesListComponent {
    private api = inject(AdminSallesApiService);
    private router = inject(Router);

    search = '';
    statutFilter = '';
    perPage = 15;
    page = signal(1);
    items = signal<Salle[]>([]);

    ngOnInit() {
        this.reload();
    }

    reload() {
        const params: any = {
            page: this.page(),
            per_page: this.perPage
        };
        if (this.search) params.search = this.search;
        if (this.statutFilter) params.is_active = this.statutFilter;
        this.api.list(params).subscribe(r => {
            this.items.set(r.data?.data ?? []);
        });
    }

    next() { this.page.update(p => p + 1); this.reload(); }
    prev() { this.page.update(p => Math.max(1, p - 1)); this.reload(); }

    view(id: number) { this.router.navigate(['/admin/salles', id]); }
    edit(id: number) { this.router.navigate(['/admin/salles', id, 'edit']); }
    create() { this.router.navigate(['/admin/salles/create']); }

    remove(id: number, nom: string) {
        if (!confirm(`Delete salle "${nom}"?`)) return;
        this.api.delete(id).subscribe(() => this.reload());
    }

    back() { this.router.navigate(['/admin']); }
}
