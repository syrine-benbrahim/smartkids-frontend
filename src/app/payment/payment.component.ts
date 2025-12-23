import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpContext } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BYPASS_AUTH_REDIRECT } from '../core/auth.interceptor';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Finaliser l'inscription
        </h2>
      </div>
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <!-- LOADING -->
        <div *ngIf="loading()" class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <p class="text-gray-500">Chargement des détails du paiement...</p>
        </div>
        <!-- ERROR -->
        <div *ngIf="error()" class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p class="text-sm text-red-700">{{ error() }}</p>
        </div>
        <!-- FORM -->
        <div *ngIf="quote() && !success()" class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div class="mb-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Détails de la scolarité</h3>
            <div class="mt-2 text-sm text-gray-500">
              <p>Mois: {{ quote().periodes_couvertes.join(', ') }}</p>
            </div>
            <div class="mt-4 bg-gray-50 p-4 rounded-md flex justify-between items-center">
              <span class="font-bold text-gray-700">Montant à payer :</span>
              <span class="text-2xl font-bold text-green-600">{{ quote().montant_du }} TND</span>
            </div>
          </div>
          <div class="space-y-4">
            <button (click)="confirmPayment('carte')" [disabled]="processing()"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
              <span *ngIf="processing()">Traitement...</span>
              <span *ngIf="!processing()">Payer par Carte Bancaire</span>
            </button>
            
            <button (click)="confirmPayment('cash')" [disabled]="processing()"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Payer en Espèces (au bureau)
            </button>
          </div>
        </div>
        <!-- SUCCESS -->
        <div *ngIf="success()" class="bg-green-50 border-l-4 border-green-400 p-4">
          <h3 class="text-lg font-medium text-green-800">Paiement confirmé !</h3>
          <p class="mt-2 text-sm text-green-700">
            L'inscription est finalisée. Vous allez recevoir un email avec vos identifiants.
          </p>
          <button (click)="goToLogin()" class="mt-4 text-sm font-medium text-green-800 hover:text-green-900">
            Aller à la connexion &rarr;
          </button>
        </div>
      </div>
    </div>
  `
})
export class PaymentComponent implements OnInit {
  token = signal('');
  loading = signal(true);
  error = signal<string | null>(null);
  quote = signal<any>(null);
  processing = signal(false);
  success = signal(false);

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
    this.token.set(this.route.snapshot.paramMap.get('token') || '');
    if (this.token()) {
      this.loadQuote();
    } else {
      this.error.set('Lien invalide.');
      this.loading.set(false);
    }
  }

  loadQuote() {
    this.http.get(`${environment.apiUrl}/public/payments/${this.token()}/quote`, {
      context: new HttpContext().set(BYPASS_AUTH_REDIRECT, true)
    })
      .subscribe({
        next: (data: any) => {
          this.quote.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erreur lors du chargement du devis.');
          this.loading.set(false);
        }
      });
  }

  confirmPayment(method: string) {
    this.processing.set(true);
    this.http.post(`${environment.apiUrl}/public/payments/${this.token()}/confirm`,
      { methode: method },
      { context: new HttpContext().set(BYPASS_AUTH_REDIRECT, true) }
    )
      .subscribe({
        next: () => {
          this.success.set(true);
          this.processing.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erreur lors du paiement.');
          this.processing.set(false);
        }
      });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
