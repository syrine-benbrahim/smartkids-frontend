import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClassesApiService, ClasseListItem } from '../../../services/classes-api.service';

@Component({
	selector: 'app-classes-list',
	standalone: true,
	imports: [CommonModule, FormsModule],
	template: `
	<div class="p-6 space-y-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<button class="rounded-full bg-primary-500/90 hover:bg-primary-600 text-white p-2" (click)="back()" aria-label="Retour">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
						<path fill-rule="evenodd" d="M15.75 4.5a.75.75 0 0 1 0 1.5H7.56l4.22 4.22a.75.75 0 1 1-1.06 1.06L5.47 6.53a1.5 1.5 0 0 1 0-2.12l5.25-5.25 0 0-3.22 3.22H15.75Z" clip-rule="evenodd" />
					</svg>
				</button>
				<h2 class="text-xl font-bold">Classes</h2>
			</div>
			<div class="flex gap-2">
				<button class="btn-primary" (click)="create()">Nouvelle classe</button>
			</div>
		</div>

		<div class="flex items-center gap-2 flex-wrap">
			<input class="input max-w-sm" placeholder="Rechercher (nom/niveau)" [(ngModel)]="search" (ngModelChange)="reload()" />
			<select class="input w-32" [(ngModel)]="niveauFilter" (change)="reload()">
				<option value="">Tous niveaux</option>
				<option value="Maternelle">Maternelle</option>
				<option value="CP">CP</option>
				<option value="CE1">CE1</option>
				<option value="CE2">CE2</option>
				<option value="CM1">CM1</option>
				<option value="CM2">CM2</option>
			</select>
			<select class="input w-28" [(ngModel)]="perPage" (change)="reload()">
				<option [ngValue]="10">10</option>
				<option [ngValue]="15">15</option>
				<option [ngValue]="25">25</option>
			</select>
		</div>

		<div class="overflow-x-auto">
			<table class="min-w-full text-sm">
				<thead>
					<tr class="text-left border-b">
						<th class="px-3 py-2">Nom</th>
						<th class="px-3 py-2">Niveau</th>
						<th class="px-3 py-2">Capacité</th>
						<th class="px-3 py-2">Enfants</th>
						<th class="px-3 py-2">Éducateurs</th>
						<th class="px-3 py-2">Occupation</th>
						<th class="px-3 py-2">Statut</th>
						<th class="px-3 py-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr *ngFor="let c of items()" class="border-t hover:bg-gray-50">
						<td class="px-3 py-2 font-medium">{{ c.nom }}</td>
						<td class="px-3 py-2">{{ c.niveau }}</td>
						<td class="px-3 py-2">{{ c.capacite_max }}</td>
						<td class="px-3 py-2">
							<span class="font-medium">{{ c.nombre_enfants }}</span>
							<span class="text-gray-500">/{{ c.capacite_max }}</span>
						</td>
						<td class="px-3 py-2">{{ c.nombre_educateurs || 0 }}</td>
						<td class="px-3 py-2">
							<div class="flex items-center gap-2">
								<div class="w-16 bg-gray-200 rounded-full h-2">
									<div 
										class="h-2 rounded-full transition-all"
										[class]="getTauxOccupationClass(c.taux_occupation)"
										[style.width.%]="c.taux_occupation">
									</div>
								</div>
								<span class="text-xs">{{ c.taux_occupation }}%</span>
							</div>
						</td>
						<td class="px-3 py-2">
							<span 
								class="px-2 py-1 text-xs font-medium rounded-full"
								[class]="getStatutClass(c)">
								{{ getStatutLabel(c) }}
							</span>
						</td>
						<td class="px-3 py-2 space-x-2">
							<button class="text-blue-600 hover:text-blue-800 text-sm" (click)="view(c.id)">Voir</button>
							<button class="text-green-600 hover:text-green-800 text-sm" (click)="edit(c.id)">Modifier</button>
							<button class="text-red-600 hover:text-red-800 text-sm" (click)="remove(c.id, c.nom, c.nombre_enfants)">Supprimer</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<div *ngIf="items().length === 0" class="text-center py-8 text-gray-500">
			Aucune classe trouvée
		</div>

		<div class="flex items-center justify-between">
			<div class="text-sm text-gray-700">
				{{ items().length }} classe(s) affichée(s)
			</div>
			<div class="flex items-center gap-2">
				<button class="btn-secondary" [disabled]="page()<=1" (click)="prev()">Précédent</button>
				<span class="text-sm">Page {{ page() }}</span>
				<button class="btn-secondary" [disabled]="items().length < perPage" (click)="next()">Suivant</button>
			</div>
		</div>
	</div>
	`,
	styles: [`
		.btn-primary {
			@apply bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors;
		}
		.btn-secondary {
			@apply bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50;
		}
		.input {
			@apply border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
		}
	`]
})
export class ClassesListComponent {
	private api = inject(ClassesApiService);
	private router = inject(Router);

	search = '';
	niveauFilter = '';
	perPage = 15;
	page = signal(1);
	items = signal<ClasseListItem[]>([]);

	ngOnInit() {
		this.reload();
	}

	reload() {
		const params: any = {
			page: this.page(),
			per_page: this.perPage
		};

		if (this.search) params.search = this.search;
		if (this.niveauFilter) params.niveau = this.niveauFilter;

		this.api.list(params).subscribe(r => {
			this.items.set(r.data?.data ?? []);
		});
	}

	next() {
		this.page.update(p => p + 1);
		this.reload();
	}

	prev() {
		this.page.update(p => Math.max(1, p - 1));
		this.reload();
	}

	view(id: number) {
		this.router.navigate(['/admin/classes', id]);
	}

	edit(id: number) {
		this.router.navigate(['/admin/classes', id, 'edit']);
	}

	create() {
		this.router.navigate(['/admin/classes/create']);
	}

	remove(id: number, nom: string, nombreEnfants: number) {
		if (nombreEnfants > 0) {
			alert(`Impossible de supprimer la classe "${nom}". Elle contient ${nombreEnfants} enfant(s) inscrit(s).`);
			return;
		}

		if (!confirm(`Supprimer la classe "${nom}" ?`)) return;

		this.api.delete(id).subscribe(() => {
			this.reload();
		});
	}

	back() {
		this.router.navigate(['/admin']);
	}

	getTauxOccupationClass(taux: number): string {
		if (taux >= 100) return 'bg-red-500';
		if (taux >= 90) return 'bg-orange-500';
		if (taux >= 70) return 'bg-yellow-500';
		return 'bg-green-500';
	}

	getStatutClass(classe: ClasseListItem): string {
		if (classe.est_complete) return 'bg-red-100 text-red-800';
		if (classe.taux_occupation >= 90) return 'bg-orange-100 text-orange-800';
		if (classe.taux_occupation >= 70) return 'bg-yellow-100 text-yellow-800';
		if (classe.nombre_enfants === 0) return 'bg-gray-100 text-gray-800';
		return 'bg-green-100 text-green-800';
	}

	getStatutLabel(classe: ClasseListItem): string {
		if (classe.est_complete) return 'Complète';
		if (classe.taux_occupation >= 90) return 'Presque pleine';
		if (classe.taux_occupation >= 70) return 'Bien remplie';
		if (classe.nombre_enfants === 0) return 'Vide';
		return 'Disponible';
	}
}