/*import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface PaymentInfo {
  id: number;
  montant: number;
  type: string;
  statut: string;
  date_echeance: string;
  inscription: {
    id: number;
    enfant: {
      nom: string;
      prenom: string;
    };
  };
}

@Component({
  selector: 'app-parent-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div class="max-w-2xl mx-auto">
        
        <div *ngIf="loading()" class="bg-white rounded-3xl shadow-xl p-12 text-center">
          <svg class="animate-spin w-12 h-12 text-indigo-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-4 text-gray-600">Chargement...</p>
        </div>

        <div *ngIf="!loading() && error()" class="bg-white rounded-3xl shadow-xl p-12 text-center">
          <svg class="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h2 class="text-2xl font-bold text-gray-800 mt-4">Erreur</h2>
          <p class="text-gray-600 mt-2">{{ error() }}</p>
        </div>

        <div *ngIf="!loading() && !error() && paymentInfo()" class="bg-white rounded-3xl shadow-xl overflow-hidden">
          
          <div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
            <h1 class="text-3xl font-bold text-white">Paiement de l'inscription</h1>
            <p class="text-indigo-100 mt-2">Finalisez votre inscription en effectuant le paiement</p>
          </div>

          <div class="p-8">
            
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8">
              <h3 class="font-bold text-lg mb-4">Détails de l'inscription</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-600">Enfant</p>
                  <p class="font-semibold">{{ paymentInfo()!.inscription.enfant.prenom }} {{ paymentInfo()!.inscription.enfant.nom }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Montant à payer</p>
                  <p class="font-bold text-2xl text-indigo-600">{{ paymentInfo()!.montant }} DT</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Date limite</p>
                  <p class="font-semibold text-orange-600">{{ formatDate(paymentInfo()!.date_echeance) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Statut</p>
                  <span class="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                    {{ paymentInfo()!.statut }}
                  </span>
                </div>
              </div>
            </div>

            <form (ngSubmit)="handlePayment()" class="space-y-6">
              
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-3">Choisissez votre méthode de paiement <span class="text-red-500">*</span></label>
                <div class="grid grid-cols-3 gap-4">
                  <button type="button" *ngFor="let method of paymentMethods"
                    [class.border-indigo-500]="selectedMethod() === method.value"
                    [class.bg-indigo-50]="selectedMethod() === method.value"
                    (click)="selectMethod(method.value)"
                    class="p-6 border-2 border-gray-300 rounded-xl hover:border-indigo-300 transition-all">
                    <div class="flex flex-col items-center gap-3">
                      <svg class="w-8 h-8" [class.text-indigo-600]="selectedMethod() === method.value" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="method.icon"/>
                      </svg>
                      <span class="font-semibold" [class.text-indigo-600]="selectedMethod() === method.value">{{ method.label }}</span>
                    </div>
                  </button>
                </div>
              </div>

              <div *ngIf="selectedMethod()">
                <label class="block text-sm font-bold text-gray-700 mb-2">Référence de transaction (optionnel)</label>
                <input type="text" [(ngModel)]="reference" name="reference" placeholder="Ex: REF-12345"
                  class="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Remarques (optionnel)</label>
                <textarea [(ngModel)]="remarques" name="remarques" rows="3" placeholder="Ajoutez des remarques si nécessaire..."
                  class="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none">
                </textarea>
              </div>

              <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                <p class="text-sm text-green-800">
                  <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Après confirmation du paiement, votre compte parent sera créé et vous recevrez vos identifiants par email.
                </p>
              </div>

              <button type="submit" [disabled]="!selectedMethod() || submitting()"
                class="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <span *ngIf="!submitting()">Confirmer le paiement</span>
                <span *ngIf="submitting()" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Traitement en cours...
                </span>
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  `
})
export class ParentPaymentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  loading = signal(true);
  error = signal<string | null>(null);
  paymentInfo = signal<PaymentInfo | null>(null);
  selectedMethod = signal<string | null>(null);
  submitting = signal(false);
  
  reference = '';
  remarques = '';

  paymentMethods = [
    { value: 'cash', label: 'Espèces', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    { value: 'carte', label: 'Carte bancaire', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { value: 'en_ligne', label: 'Paiement en ligne', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' }
  ];

  ngOnInit() {
    const paymentId = this.route.snapshot.paramMap.get('id');
    if (!paymentId) {
      this.error.set('ID de paiement manquant');
      this.loading.set(false);
      return;
    }

    // Load payment info (you'll need to create this endpoint)
    this.http.get<any>(`${environment.apiUrl}/paiements/${paymentId}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.paymentInfo.set(response.data);
        } else {
          this.error.set(response.message || 'Erreur lors du chargement');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur de connexion au serveur');
        this.loading.set(false);
      }
    });
  }

  selectMethod(method: string) {
    this.selectedMethod.set(method);
  }

  handlePayment() {
    if (!this.selectedMethod() || this.submitting()) return;

    const paymentId = this.route.snapshot.paramMap.get('id');
    if (!paymentId) return;

    this.submitting.set(true);

    const payload = {
      action: 'paye',
      methode_paiement: this.selectedMethod(),
      reference_transaction: this.reference || undefined,
      remarques: this.remarques || undefined
    };

    this.http.post<any>(`${environment.apiUrl}/paiements/${paymentId}/simulate`, payload).subscribe({
      next: (response) => {
        this.submitting.set(false);
        if (response.success) {
          alert('Paiement confirmé ! Vous allez recevoir vos identifiants par email.');
          this.router.navigate(['/payment-success']);
        } else {
          alert('Erreur : ' + response.message);
        }
      },
      error: (err) => {
        this.submitting.set(false);
        alert('Erreur : ' + (err.error?.message || 'Erreur inconnue'));
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }
}

function inject(service: any) {
  // Angular inject function
  return new service();
} */