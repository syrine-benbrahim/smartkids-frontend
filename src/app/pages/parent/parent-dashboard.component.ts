import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
	selector: 'app-parent-dashboard',
	standalone: true,
	imports: [CommonModule],
	template: `
	<div class="p-6">
		<h2 class="text-2xl font-bold mb-4">Tableau de bord · Parent</h2>
		<div class="space-x-3">
			<button class="btn-primary" (click)="logout()">Se déconnecter</button>
		</div>
	</div>
	`
})
export class ParentDashboardComponent {
	private auth = inject(AuthService);
	private router = inject(Router);
	logout(){ this.auth.logout().subscribe(() => this.router.navigate(['/login'])); }
}



