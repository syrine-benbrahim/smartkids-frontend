import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UserRole } from '../../core/auth.service';

@Component({
	selector: 'app-register',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './register.component.html'
})
export class RegisterComponent {
	name = '';
	email = '';
	password = '';
	password_confirmation = '';
	role: UserRole = 'parent';
	loading = signal(false);
	error = signal<string | null>(null);

	private auth = inject(AuthService);
	private router = inject(Router);

	onSubmit() {
		this.error.set(null);
		this.loading.set(true);
		this.auth
			.register({
				name: this.name,
				email: this.email,
				password: this.password,
				password_confirmation: this.password_confirmation,
				role: this.role
			})
			.subscribe({
				next: (res) => {
					const role = res.user.role;
					if (role === 'admin') this.router.navigate(['/admin']);
					else if (role === 'educateur') this.router.navigate(['/educateur']);
					else this.router.navigate(['/parent']);
					this.loading.set(false);
				},
				error: (err) => {
					this.error.set(err?.error?.message || 'Inscription échouée');
					this.loading.set(false);
				}
			});
	}
}



