// src/app/components/parent/parent-activites-disponibles.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  ParentActivitesApiService,
  ActiviteDisponible,
  PaiementActivite,
  ApiResponse
} from '../../../services/parent-activites-api.service';

@Component({
  selector: 'app-parent-activites-disponibles',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './parent-activites-disponibles.component.html',
  styles: [`
    .card {
      @apply bg-white rounded-3xl shadow-lg border border-gray-200 p-6;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ParentActivitesDisponiblesComponent implements OnInit {
  private api = inject(ParentActivitesApiService);

  // UI signals
  loading = signal(true);
  activites = signal<ActiviteDisponible[]>([]);
  meta = signal<any | null>(null);
  enfants = signal<any[]>([]);
  paiementsEnAttente = signal<PaiementActivite[]>([]);
  selectedActivite = signal<ActiviteDisponible | null>(null);
  selectedEnfantId = '';
  selectedPaymentMethod = 'cash';
  remarques = '';
  submitting = signal(false);
  showPaymentsModalFlag = signal(false);
  processingPayment = signal<number | null>(null);

  // Filters UI
  searchTerm = '';
  selectedType = '';
  dateFilter = '';
  onlyWithPlaces = false;
  includePast = false;

  // Payment methods
  paymentMethods = [
    { value: 'cash', label: 'Espèces', icon: '💵' },
    { value: 'carte', label: 'Carte', icon: '💳' },
    { value: 'en_ligne', label: 'En ligne', icon: '🌐' }
  ];

  ngOnInit() {
    this.loadActivites();
    this.loadEnfants();
    this.loadPaiementsEnAttente();
  }

  /**
   * Load activities using the ParentActivitesApiService.
   * Sends the exact params expected by the controller:
   * - per_page, search, type, date_debut, places_disponibles, include_past
   */
  private loadActivites() {
    this.loading.set(true);
    this.activites.set([]);
    this.meta.set(null);

    const filters: any = {
      per_page: 50,
      include_past: this.includePast,
    };

    if (this.searchTerm) filters.search = this.searchTerm;
    if (this.selectedType) filters.type = this.selectedType;
    if (this.dateFilter) filters.date_debut = this.dateFilter;
    if (this.onlyWithPlaces) filters.places_disponibles = true;

    this.api.getActivitesDisponibles(filters).subscribe({
      next: (response: ApiResponse<ActiviteDisponible[] | any>) => {
        // Debug
        console.debug('Activités response:', response);

        if (!response.success) {
          // backend returned success=false with optional message
          console.warn('API success=false', response);
          this.activites.set([]);
          this.meta.set(response.meta ?? null);
          this.loading.set(false);
          return;
        }

        // The controller may return:
        // - { success:true, data: [ ... ], meta: { ... } }
        // - OR (older style) { success:true, data: { data: [...], meta: {...} } }
        const payload = response.data as any;

        if (Array.isArray(payload)) {
          // direct array
          this.activites.set(payload);
          this.meta.set(response.meta ?? null);
        } else if (payload && Array.isArray(payload.data)) {
          // paginated envelope
          this.activites.set(payload.data as ActiviteDisponible[]);
          this.meta.set(payload.meta ?? response.meta ?? null);
        } else if (payload && Array.isArray(payload.items)) {
          // defensive: sometimes backend uses 'items'
          this.activites.set(payload.items as ActiviteDisponible[]);
          this.meta.set(payload.meta ?? response.meta ?? null);
        } else {
          // unknown shape: try to coerce if possible
          console.warn('Unexpected data shape from API', payload);
          this.activites.set([]);
          this.meta.set(response.meta ?? null);
        }

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading activites:', err);
        // try to show a meaningful message from Laravel debug payload if present
        if (err?.error && typeof err.error === 'object') {
          console.debug('Server error body:', err.error);
          const msg = err.error.message ?? err.error.exception?.message ?? 'Erreur serveur';
          alert('Erreur lors du chargement des activités : ' + msg);
        } else {
          alert('Erreur lors du chargement des activités (serveur).');
        }
        this.activites.set([]);
        this.meta.set(null);
        this.loading.set(false);
      }
    });
  }

  private loadEnfants() {
    this.api.getEnfants().subscribe({
      next: (response) => {
        console.debug('Enfants response:', response);
        if (response.success && response.data) {
          this.enfants.set(response.data);
        } else {
          this.enfants.set([]);
        }
      },
      error: (err) => {
        console.error('Error loading enfants:', err);
        this.enfants.set([]);
      }
    });
  }

  private loadPaiementsEnAttente() {
    this.api.getPaiementsEnAttente().subscribe({
      next: (response) => {
        console.debug('Paiements response:', response);
        if (response.success && response.data) {
          this.paiementsEnAttente.set(response.data);
        } else {
          this.paiementsEnAttente.set([]);
        }
      },
      error: (err) => {
        console.error('Error loading paiements:', err);
        this.paiementsEnAttente.set([]);
      }
    });
  }

  // Called by UI filter controls
  applyFilters() {
    this.loadActivites();
  }

  selectActivite(activite: ActiviteDisponible) {
    this.selectedActivite.set(activite);
    this.selectedEnfantId = '';
    this.remarques = '';
    this.selectedPaymentMethod = 'cash';
  }

  closeModal() {
    this.selectedActivite.set(null);
  }

  showPaymentsModal() {
    this.showPaymentsModalFlag.set(true);
  }

  closePaymentsModal() {
    this.showPaymentsModalFlag.set(false);
  }

  submitInscription() {
    const chosen = this.selectedActivite();
    if (!this.selectedEnfantId || !chosen) {
      alert('Veuillez sélectionner un enfant et une activité');
      return;
    }

    this.submitting.set(true);

    const data: any = {
      enfant_id: parseInt(this.selectedEnfantId, 10),
      remarques: this.remarques || undefined
    };

    if (chosen.prix && chosen.prix > 0) {
      data.methode_paiement = this.selectedPaymentMethod;
    }

    this.api.participerActivite(chosen.id, data).subscribe({
      next: (response) => {
        console.debug('Participer response:', response);
        if (response.success) {
          const paiement = response.data?.paiement;
          if (paiement) {
            alert('Inscription enregistrée — un paiement est en attente.');
            this.loadPaiementsEnAttente();
          } else {
            alert('Inscription réussie !');
            // refresh available activities to update participants_count / places
            this.loadActivites();
          }
          this.closeModal();
        } else {
          alert('Erreur : ' + (response.message ?? 'Impossible d\'effectuer l\'inscription'));
        }
        this.submitting.set(false);
      },
      error: (err) => {
        console.error('Erreur inscription:', err);
        const msg = err?.error?.message ?? err?.error?.exception?.message ?? 'Erreur serveur';
        alert('Erreur lors de l\'inscription: ' + msg);
        this.submitting.set(false);
      }
    });
  }

  payPaiement(paiement: PaiementActivite) {
    if (!confirm(`Confirmer le paiement de ${paiement.montant_total} ?`)) return;
    this.processingPayment.set(paiement.id);

    this.api.simulatePayment(paiement.id, {
      action: 'paye',
      methode_paiement: 'carte',
      montant: paiement.montant_total,
      reference_transaction: 'REF-' + Date.now()
    }).subscribe({
      next: (response) => {
        console.debug('simulatePayment response:', response);
        if (response.success) {
          alert('Paiement confirmé !');
          this.loadPaiementsEnAttente();
          this.loadActivites();
        } else {
          alert('Erreur: ' + (response.message ?? 'Impossible de confirmer le paiement'));
        }
        this.processingPayment.set(null);
      },
      error: (err) => {
        console.error('Erreur paiement:', err);
        alert('Erreur lors du paiement: ' + (err?.error?.message ?? 'Erreur serveur'));
        this.processingPayment.set(null);
      }
    });
  }

  cancelPaiement(paiement: PaiementActivite) {
    if (!confirm('Annuler ce paiement ? L\'inscription sera également annulée.')) return;
    this.processingPayment.set(paiement.id);

    this.api.simulatePayment(paiement.id, {
      action: 'annule',
      remarques: 'Annulé par le parent'
    }).subscribe({
      next: (response) => {
        console.debug('cancelPayment response:', response);
        if (response.success) {
          alert('Paiement annulé.');
          this.loadPaiementsEnAttente();
          this.loadActivites();
        } else {
          alert('Erreur: ' + (response.message ?? 'Impossible d\'annuler'));
        }
        this.processingPayment.set(null);
      },
      error: (err) => {
        console.error('Erreur annulation:', err);
        alert('Erreur lors de l\'annulation: ' + (err?.error?.message ?? 'Erreur serveur'));
        this.processingPayment.set(null);
      }
    });
  }

  // Helpers
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  calculateAge(dateNaissance: string): number {
    const birth = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'sport': return 'bg-red-100 text-red-800';
      case 'art': return 'bg-purple-100 text-purple-800';
      case 'musique': return 'bg-blue-100 text-blue-800';
      case 'science': return 'bg-green-100 text-green-800';
      case 'lecture': return 'bg-yellow-100 text-yellow-800';
      case 'sortie': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'sport': return 'Sport';
      case 'art': return 'Art';
      case 'musique': return 'Musique';
      case 'science': return 'Science';
      case 'lecture': return 'Lecture';
      case 'sortie': return 'Sortie';
      default: return type;
    }
  }

  getEducateursNames(educateurs: any[]): string {
    if (!educateurs || educateurs.length === 0) return 'Non assigné';
    return educateurs.map(e => `${e.user?.prenom || ''} ${e.user?.nom || ''}`).join(', ');
  }

  trackByActivite(index: number, activite: ActiviteDisponible): number {
    return activite.id;
  }
}
