import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminMatieresApiService, Matiere } from '../../../../services/admin-matieres-api.service';

@Component({
    selector: 'app-matieres-par-niveau',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './matieres-par-niveau.component.html'
})
export class MatieresParNiveauComponent {
    private api = inject(AdminMatieresApiService);
    private fb = inject(FormBuilder);

    // FIXED: Use database-compatible niveau values
    niveaux = [
        { id: 'Petite Section', label: 'Petite Section (PS)', shortCode: 'PS' },
        { id: 'Moyenne Section', label: 'Moyenne Section (MS)', shortCode: 'MS' },
        { id: 'Grande Section', label: 'Grande Section (GS)', shortCode: 'GS' }
    ];

    selectedNiveau = signal<string>('Petite Section');
    matieres = signal<Matiere[]>([]);
    loading = signal<boolean>(false);
    submitting = signal<boolean>(false);
    errorMessage = signal<string>('');

    form = this.fb.group({
        nom: ['', Validators.required],
        description: ['']
    });

    ngOnInit() {
        this.loadMatieres();
    }

    onNiveauChange() {
        this.loadMatieres();
    }

    loadMatieres() {
        this.loading.set(true);
        this.errorMessage.set('');
        
        // Filter by 'niveau' parameter using correct format
        this.api.list({ niveau: this.selectedNiveau(), per_page: 100 }).subscribe({
            next: (res) => {
                this.matieres.set(res.data?.data || []);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading matieres:', err);
                this.errorMessage.set('Erreur lors du chargement des matières');
                this.loading.set(false);
            }
        });
    }

    submit() {
        if (this.form.invalid) {
            this.errorMessage.set('Veuillez remplir tous les champs obligatoires');
            return;
        }

        const nom = this.form.value.nom?.trim();
        if (!nom) {
            this.errorMessage.set('Le nom de la matière est requis');
            return;
        }

        // Verification: Check if subject already exists for this level (Client-side)
        const exists = this.matieres().some(m => 
            m.nom.toLowerCase() === nom.toLowerCase()
        );
        
        if (exists) {
            this.errorMessage.set(`La matière "${nom}" existe déjà pour le niveau sélectionné.`);
            return;
        }

        this.submitting.set(true);
        this.errorMessage.set('');
        
        const formData = new FormData();
        formData.append('nom', nom);
        formData.append('description', this.form.value.description || '');
        formData.append('niveau', this.selectedNiveau()); // Now sends "Petite Section" instead of "petite_section"
        formData.append('actif', '1');
        
        // Generate code from subject name (first 4 chars, uppercase)
        const code = nom.toUpperCase().replace(/\s+/g, '').substring(0, 4);
        formData.append('code', code);
        
        formData.append('coefficient', '1');
        formData.append('couleur', '#3b82f6'); // Default color

        this.api.create(formData).subscribe({
            next: (res) => {
                this.submitting.set(false);
                if (res.success) {
                    this.form.reset();
                    this.loadMatieres(); // Reload list
                    this.errorMessage.set('');
                    
                    // Optional: Show success message
                    console.log('Matière créée avec succès');
                } else {
                    this.errorMessage.set(res.message || 'Erreur lors de la création');
                }
            },
            error: (err) => {
                this.submitting.set(false);
                const message = err.error?.message || 'Erreur technique lors de la création';
                this.errorMessage.set(message);
                console.error('Error creating matiere:', err);
            }
        });
    }

    deleteMatiere(id: number) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) {
            return;
        }

        this.api.delete(id).subscribe({
            next: (res) => {
                if (res.success) {
                    this.loadMatieres();
                }
            },
            error: (err) => {
                this.errorMessage.set('Erreur lors de la suppression');
                console.error('Error deleting matiere:', err);
            }
        });
    }
}