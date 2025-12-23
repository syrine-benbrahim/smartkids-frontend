import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { ParentPresencesApiService, EnfantWithStats } from './presences-parent.service';
import { AuthService } from '../core/auth.service';

@Injectable({
    providedIn: 'root'
})
export class ChildStateService {
    private api = inject(ParentPresencesApiService);
    private auth = inject(AuthService);

    // Signals
    private _children = signal<EnfantWithStats[]>([]);
    private _selectedChildId = signal<number | null>(null);
    private _loading = signal<boolean>(false);

    // Computed public signals
    readonly children = this._children.asReadonly();
    readonly loading = this._loading.asReadonly();

    readonly selectedChild = computed(() => {
        const id = this._selectedChildId();
        if (!id) return null;
        return this._children().find(c => c.id === id) || null;
    });

    private readonly STORAGE_KEY = 'sk_selected_child_id';

    constructor() {
        // Automatically load children if the user is a parent and authenticated
        // We can also trigger this manually from AppComponent or Layout if preferred
        if (this.auth.getRole() === 'parent') {
            this.loadChildren();
        }

        // Effect to persist selection
        effect(() => {
            const currentId = this._selectedChildId();
            if (currentId) {
                localStorage.setItem(this.STORAGE_KEY, currentId.toString());
            }
        });
    }

    loadChildren() {
        if (this.auth.getRole() !== 'parent') return;

        this._loading.set(true);
        this.api.getEnfants().subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    this._children.set(response.data);
                    this.initSelection();
                }
                this._loading.set(false);
            },
            error: (err) => {
                console.error('Error loading children for state:', err);
                this._loading.set(false);
            }
        });
    }

    private initSelection() {
        const children = this._children();
        if (children.length === 0) {
            this._selectedChildId.set(null);
            return;
        }

        // 1. Try to recover from localStorage
        const storedId = localStorage.getItem(this.STORAGE_KEY);
        if (storedId) {
            const found = children.find(c => c.id === Number(storedId));
            if (found) {
                this._selectedChildId.set(found.id);
                return;
            }
        }

        // 2. Default to first child
        this._selectedChildId.set(children[0].id);
    }

    selectChild(childId: number) {
        this._selectedChildId.set(childId);
    }

    clear() {
        this._children.set([]);
        this._selectedChildId.set(null);
        localStorage.removeItem(this.STORAGE_KEY);
    }
}
