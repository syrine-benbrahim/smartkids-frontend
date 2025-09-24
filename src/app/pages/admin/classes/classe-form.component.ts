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
	<div class="p-6 max-w-2xl mx-auto">
		<div class="flex items-center gap-3 mb-6">
			<button class="rounded-full bg-primary-500/90 hover:bg-primary-600 text-white p-2" (click)="back()" aria-label="Retour">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
					<path fill-rule="evenodd" d="M15.75 4.5a.75.75 0 0 1 0 1.5H7.56l4.22 4.22a.75.75 0 1 1-1.06 1.06L5.47 6.53a1.5 1.5 0 0 1 0-2.12l5.25-5.25 0 0-3.22 3.22H15.75Z" clip-rule="evenodd" />
				</svg>
			</button>
			<h2 class="text-2xl font-bold">{{ isEdit() ? 'Modifier la classe' : 'Nouvelle classe' }}</h2>
		</div>

		<div class="bg-white rounded-lg shadow-sm border p-6">
			<form (ngSubmit)="submit()" #form="ngForm" class="space-y-6">
				<!-- Nom -->
				<div>
					<label for="nom" class="block text-sm font-medium text-gray-700 mb-1">
						Nom de la classe *
					</label>
					<input
						id="nom"
						name="nom"
						type="text"
						class="input w-full"
						[(ngModel)]="formData.nom"
						#nomField="ngModel"
						required
						maxlength="255"
						(blur)="checkNomDisponibilite()"
						placeholder="Ex: CP-A, CE1 Rouge, etc.">
					
					<div *ngIf="nomField.invalid && nomField.touched" class="text-red-600 text-sm mt-1">
						<div *ngIf="nomField.errors?.['required']">Le nom est obligatoire</div>
						<div *ngIf="nomField.errors?.['maxlength']">Le nom ne peut pas dépasser 255 caractères</div>
					</div>
					
					<div *ngIf="nomStatus().message" class="text-sm mt-1"
						[class]="nomStatus().available ? 'text-green-600' : 'text-red-600'">
						{{ nomStatus().message }}
					</div>
				</div>

				<!-- Niveau -->
				<div>
					<label for="niveau" class="block text-sm font-medium text-gray-700 mb-1">
						Niveau *
					</label>
					<select
						id="niveau"
						name="niveau"
						class="input w-full"
						[(ngModel)]="formData.niveau"
						#niveauField="ngModel"
						required>
						<option value="">Sélectionnez un niveau</option>
						<option [value]="1">1 - Petite Section</option>
						<option [value]="2">2 - Moyenne Section</option>
						<option [value]="3">3 - Grande Section</option>
						<option [value]="4">4 - CP</option>
						<option [value]="5">5 - CE1</option>
						<option [value]="6">6 - CE2</option>
						<option [value]="7">7 - CM1</option>
						<option [value]="8">8 - CM2</option>
					</select>
					
					<div *ngIf="niveauField.invalid && niveauField.touched" class="text-red-600 text-sm mt-1">
						<div *ngIf="niveauField.errors?.['required']">Le niveau est obligatoire</div>
					</div>
				</div>

				<!-- Capacité maximale -->
				<div>
					<label for="capacite" class="block text-sm font-medium text-gray-700 mb-1">
						Capacité maximale *
					</label>
					<input
						id="capacite"
						name="capacite"
						type="number"
						class="input w-full"
						[(ngModel)]="formData.capacite_max"
						#capaciteField="ngModel"
						required
						min="1"
						max="50"
						placeholder="Ex: 25">
					
					<div *ngIf="capaciteField.invalid && capaciteField.touched" class="text-red-600 text-sm mt-1">
						<div *ngIf="capaciteField.errors?.['required']">La capacité maximale est obligatoire</div>
						<div *ngIf="capaciteField.errors?.['min']">La capacité doit être d'au moins 1</div>
						<div *ngIf="capaciteField.errors?.['max']">La capacité ne peut pas dépasser 50</div>
					</div>
					
					<p class="text-sm text-gray-500 mt-1">Nombre maximum d'enfants dans cette classe (entre 1 et 50)</p>
				</div>

				<!-- Description -->
				<div>
					<label for="description" class="block text-sm font-medium text-gray-700 mb-1">
						Description
					</label>
					<textarea
						id="description"
						name="description"
						class="input w-full"
						[(ngModel)]="formData.description"
						#descriptionField="ngModel"
						rows="4"
						maxlength="1000"
						placeholder="Description optionnelle de la classe, objectifs pédagogiques, particularités..."></textarea>
					
					<div *ngIf="descriptionField.errors?.['maxlength']" class="text-red-600 text-sm mt-1">
						La description ne peut pas dépasser 1000 caractères
					</div>
					
					<p class="text-sm text-gray-500 mt-1">
						{{ (formData.description || '').length }}/1000 caractères
					</p>
				</div>

				<!-- Résumé de prévisualisation -->
				<div *ngIf="formData.nom || formData.niveau || formData.capacite_max" 
					class="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<h3 class="font-medium text-blue-900 mb-2">Aperçu</h3>
					<div class="text-sm text-blue-800 space-y-1">
						<div *ngIf="formData.nom"><strong>Nom :</strong> {{ formData.nom }}</div>
						<div *ngIf="formData.niveau"><strong>Niveau :</strong> {{ getNiveauLabel(formData.niveau) }}</div>
						<div *ngIf="formData.capacite_max"><strong>Capacité :</strong> {{ formData.capacite_max }} enfants</div>
						<div *ngIf="formData.description"><strong>Description :</strong> {{ formData.description | slice:0:100 }}{{ formData.description && formData.description.length > 100 ? '...' : '' }}</div>
					</div>
				</div>

				<!-- Messages d'erreur API -->
				<div *ngIf="errors().length > 0" class="bg-red-50 border border-red-200 rounded-lg p-4">
					<div class="flex items-start">
						<svg class="w-5 h-5 text-red-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
						</svg>
						<div>
							<h3 class="text-sm font-medium text-red-800">Erreurs de validation :</h3>
							<ul class="mt-1 text-sm text-red-700 list-disc list-inside">
								<li *ngFor="let error of errors()">{{ error }}</li>
							</ul>
						</div>
					</div>
				</div>

				<!-- Boutons d'action -->
				<div class="flex items-center gap-3 pt-4 border-t">
					<button
						type="submit"
						class="btn-primary"
						[disabled]="form.invalid || loading() || (formData.nom && !nomStatus().available)">
						<span *ngIf="loading()">
							<svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
						</span>
						{{ loading() ? 'Enregistrement...' : (isEdit() ? 'Mettre à jour' : 'Créer la classe') }}
					</button>
					
					<button type="button" class="btn-secondary" (click)="back()">
						Annuler
					</button>
					
					<button 
						type="button" 
						class="btn-outline" 
						(click)="resetForm()"
						*ngIf="!isEdit()">
						Réinitialiser
					</button>
				</div>
			</form>
		</div>

		<!-- Aide contextuelle -->
		<div class="mt-6 bg-gray-50 rounded-lg p-4">
			<h3 class="font-medium text-gray-900 mb-2">💡 Conseils</h3>
			<ul class="text-sm text-gray-600 space-y-1">
				<li>• Choisissez un nom descriptif et unique pour la classe</li>
				<li>• La capacité recommandée varie selon le niveau : 15-20 pour la maternelle, 20-25 pour l'élémentaire</li>
				<li>• Une description claire aide les éducateurs et les parents à comprendre les spécificités de la classe</li>
				<li *ngIf="isEdit()">• Vous ne pouvez pas réduire la capacité en dessous du nombre d'enfants actuellement inscrits</li>
			</ul>
		</div>
	</div>
	`,
	styles: [`
		.btn-primary {
			@apply bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center;
		}
		.btn-secondary {
			@apply bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors;
		}
		.btn-outline {
			@apply border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors;
		}
		.input {
			@apply border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors;
		}
		.input:invalid {
			@apply border-red-300 focus:ring-red-500 focus:border-red-500;
		}
	`]
})
export class ClasseFormComponent {
	private api = inject(ClassesApiService);
	private route = inject(ActivatedRoute);
	private router = inject(Router);

	loading = signal(false);
	errors = signal<string[]>([]);
	nomStatus = signal<{ available: boolean; message: string }>({ available: true, message: '' });

	formData: ClasseFormData = {
		nom: '',
		niveau: '', // Will be converted to number when submitting
		capacite_max: 25,
		description: ''
	};

	isEdit = signal(false);
	classeId: number | null = null;

	// Helper method to get niveau label for display
	getNiveauLabel(niveau: any): string {
		const niveauLabels: { [key: string]: string } = {
			'1': 'Petite Section',
			'2': 'Moyenne Section', 
			'3': 'Grande Section',
			'4': 'CP',
			'5': 'CE1',
			'6': 'CE2',
			'7': 'CM1',
			'8': 'CM2'
		};
		return niveauLabels[niveau?.toString()] || niveau;
	}

	ngOnInit() {
		// Déterminer si on est en mode édition
		const id = this.route.snapshot.paramMap.get('id');
		const isEditRoute = this.route.snapshot.url.some(segment => segment.path === 'edit');

		if (id && isEditRoute) {
			this.isEdit.set(true);
			this.classeId = Number(id);
			this.loadClasse(this.classeId);
		}
	}

	loadClasse(id: number) {
		this.loading.set(true);
		this.api.get(id).subscribe({
			next: (response) => {
				if (response.success) {
					this.formData = {
						nom: response.data.nom,
						niveau: response.data.niveau?.toString() || '', // Convert to string for form
						capacite_max: response.data.capacite_max,
						description: response.data.description || ''
					};
				}
				this.loading.set(false);
			},
			error: (error) => {
				console.error('Erreur lors du chargement de la classe:', error);
				this.errors.set(['Impossible de charger les données de la classe']);
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
			next: (response) => {
				this.nomStatus.set({
					available: response.available,
					message: response.message
				});
			},
			error: (error) => {
				console.error('Erreur lors de la vérification du nom:', error);
			}
		});
	}

	submit() {
		if (!this.formData.nom || !this.formData.niveau || !this.formData.capacite_max) {
			return;
		}

		this.loading.set(true);
		this.errors.set([]);

		// Convert niveau to integer before sending
		const submitData = {
			...this.formData,
			niveau: typeof this.formData.niveau === 'string' 
				? parseInt(this.formData.niveau, 10) 
				: this.formData.niveau
		};

		const operation = this.isEdit() && this.classeId 
			? this.api.update(this.classeId, submitData)
			: this.api.create(submitData);

		operation.subscribe({
			next: (response) => {
				if (response.success) {
					this.router.navigate(['/admin/classes', response.data.id]);
				} else {
					this.handleErrors(response);
				}
				this.loading.set(false);
			},
			error: (error) => {
				console.error('Erreur lors de la soumission:', error);
				this.handleErrors(error.error);
				this.loading.set(false);
			}
		});
	}

	private handleErrors(errorResponse: any) {
		const errors: string[] = [];
		
		if (errorResponse?.message) {
			errors.push(errorResponse.message);
		}

		if (errorResponse?.errors) {
			Object.values(errorResponse.errors).forEach((fieldErrors: any) => {
				if (Array.isArray(fieldErrors)) {
					errors.push(...fieldErrors);
				} else if (typeof fieldErrors === 'string') {
					errors.push(fieldErrors);
				}
			});
		}

		if (errors.length === 0) {
			errors.push('Une erreur inattendue s\'est produite');
		}

		this.errors.set(errors);
	}

	resetForm() {
		this.formData = {
			nom: '',
			niveau: '',
			capacite_max: 25,
			description: ''
		};
		this.errors.set([]);
		this.nomStatus.set({ available: true, message: '' });
	}

	back() {
		if (this.isEdit() && this.classeId) {
			this.router.navigate(['/admin/classes', this.classeId]);
		} else {
			this.router.navigate(['/admin/classes']);
		}
	}
}