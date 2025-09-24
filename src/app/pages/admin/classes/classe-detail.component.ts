import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ClassesApiService, ClasseDetail } from '../../../services/classes-api.service';

@Component({
	selector: 'app-classe-detail',
	standalone: true,
	imports: [CommonModule],
	template: `...`, // keep your template as-is
	styles: [`
		.btn-primary {
			@apply bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors;
		}
		.btn-secondary {
			@apply bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors;
		}
	`]
})
export class ClasseDetailComponent {
	private api = inject(ClassesApiService);
	private route = inject(ActivatedRoute);
	private router = inject(Router);

	classe = signal<ClasseDetail | null>(null);

	ngOnInit() {
		const id = Number(this.route.snapshot.paramMap.get('id'));
		if (id) {
			this.api.get(id).subscribe(response => {
				if (response.success) {
					this.classe.set(response.data);
				}
			});
		}
	}

	edit() {
		const id = this.classe()?.id;
		if (id) {
			this.router.navigate(['/admin/classes', id, 'edit']);
		}
	}

	duplicate() {
		const id = this.classe()?.id;
		if (id && confirm('Dupliquer cette classe ?')) {
			this.api.duplicate(id).subscribe(response => {
				if (response.success) {
					this.router.navigate(['/admin/classes', response.data.id]);
				}
			});
		}
	}

	back() {
		this.router.navigate(['/admin/classes']);
	}

	formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('fr-FR');
	}

	getAge(birthDate: string): number {
		const today = new Date();
		const birth = new Date(birthDate);
		let age = today.getFullYear() - birth.getFullYear();
		const monthDiff = today.getMonth() - birth.getMonth();
		
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
			age--;
		}
		
		return age;
	}

	getTauxOccupationClass(taux: number): string {
		if (taux >= 100) return 'bg-red-500';
		if (taux >= 90) return 'bg-orange-500';
		if (taux >= 70) return 'bg-yellow-500';
		if (taux >= 40) return 'bg-green-500';
		return 'bg-gray-400';
	}

	getStatutClass(): string {
		const c = this.classe();
		if (!c) return 'bg-gray-300 text-gray-700';
		if (c.taux_occupation >= 100) return 'bg-red-100 text-red-800';
		if (c.taux_occupation >= 90) return 'bg-orange-100 text-orange-800';
		if (c.taux_occupation >= 70) return 'bg-yellow-100 text-yellow-800';
		return 'bg-green-100 text-green-800';
	}

	getStatutLabel(): string {
		const c = this.classe();
		if (!c) return 'Inconnu';
		if (c.taux_occupation >= 100) return 'Complet';
		if (c.taux_occupation >= 90) return 'Presque complet';
		if (c.taux_occupation >= 70) return 'Très occupé';
		return 'Disponible';
	}
}
