import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  private auth = inject(AuthService);
  private router = inject(Router);

  onSubmit() {
    this.error.set(null);
    this.loading.set(true);
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        const role = res.user.role;
        if (role === 'admin') this.router.navigate(['/admin']);
        else if (role === 'educateur') this.router.navigate(['/educateur']);
        else this.router.navigate(['/parent']);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Connexion échouée');
        this.loading.set(false);
      }
    });
  }
}