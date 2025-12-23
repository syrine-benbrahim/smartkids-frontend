import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    darkMode = signal<boolean>(this.getInitialTheme());

    constructor() {
        this.applyTheme();
    }

    toggleTheme() {
        this.darkMode.set(!this.darkMode());
        this.applyTheme();
        localStorage.setItem('sk_dark_mode', String(this.darkMode()));
    }

    private getInitialTheme(): boolean {
        const stored = localStorage.getItem('sk_dark_mode');
        if (stored !== null) return stored === 'true';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    private applyTheme() {
        if (this.darkMode()) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }
}
