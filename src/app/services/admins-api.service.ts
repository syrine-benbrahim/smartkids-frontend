import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AdminsApiService {
	private http = inject(HttpClient);
	private baseUrl = 'http://127.0.0.1:8000/api/admin/users';

	createAdmin(payload: { name: string; email: string; password: string }) {
		// expects a backend endpoint to create an admin user
		return this.http.post(`${this.baseUrl}`, { ...payload, role: 'admin' });
	}
}




