// src/app/pages/chat/chat-rooms-list.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChatService, ChatRoom } from '../../services/chat.service';

@Component({
  selector: 'app-chat-rooms-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div class="max-w-4xl mx-auto">
        
        <!-- Header -->
        <div class="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 mb-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-800">Discussions de Classes</h1>
              <p class="text-gray-600">Communiquer avec les éducateurs et parents</p>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
          <div class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span class="ml-3 text-gray-600">Chargement des discussions...</span>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && rooms.length === 0" class="bg-white rounded-3xl shadow-lg border border-gray-200 p-12 text-center">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Aucune discussion disponible</h3>
          <p class="text-gray-500">Vous n'avez accès à aucune discussion de classe pour le moment.</p>
        </div>

        <!-- Rooms List -->
        <div *ngIf="!loading && rooms.length > 0" class="space-y-4">
          <div 
            *ngFor="let room of rooms; trackBy: trackByRoomId"
            class="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
            (click)="openChat(room)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <!-- Classe Icon -->
                <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M7 21h2m3 0h2M7 3h2m3 0h2"/>
                  </svg>
                </div>
                
                <div class="min-w-0 flex-1">
                  <h3 class="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {{ room.classe.nom }}
                  </h3>
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <span class="bg-gray-100 px-2 py-1 rounded-lg font-medium">
                      {{ room.classe.niveau }}
                    </span>
                    <span class="text-gray-400">•</span>
                    <span>{{ room.messages_count }} messages</span>
                  </div>
                </div>
              </div>

              <!-- Action Icon -->
              <div class="flex items-center gap-3">
                <!-- Messages Count Badge -->
                <div *ngIf="room.messages_count > 0" 
                     class="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                  {{ room.messages_count }}
                </div>
                
                <!-- Arrow Icon -->
                <div class="w-8 h-8 bg-gray-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors">
                  <svg class="w-4 h-4 text-gray-500 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-3xl p-6 mt-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h4 class="text-red-800 font-semibold">Erreur de chargement</h4>
              <p class="text-red-600 text-sm">{{ error }}</p>
            </div>
          </div>
          <button 
            class="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold transition-colors"
            (click)="loadRooms()"
          >
            Réessayer
          </button>
        </div>
      </div>
    </div>
  `
})
export class ChatRoomsListComponent implements OnInit {
  private chatService = inject(ChatService);
  private router = inject(Router);

  rooms: ChatRoom[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.loading = true;
    this.error = null;

    this.chatService.getMyRooms().subscribe({
      next: (response) => {
        if (response.success) {
          this.rooms = response.data;
        } else {
          this.error = 'Erreur lors du chargement des discussions';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Impossible de charger les discussions. Vérifiez votre connexion.';
        this.loading = false;
        console.error('Error loading rooms:', err);
      }
    });
  }

  openChat(room: ChatRoom) {
    this.router.navigate(['/chat', room.id]);
  }

  trackByRoomId(index: number, room: ChatRoom): number {
    return room.id;
  }
}