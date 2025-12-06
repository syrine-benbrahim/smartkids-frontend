// src/app/shared/chat-widget/chat-widget.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChatService, ChatRoom } from '../../services/chat.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800">Discussions</h3>
            <p class="text-sm text-gray-600">{{ rooms.length }} classe{{ rooms.length > 1 ? 's' : '' }}</p>
          </div>
        </div>
        
        <button 
          class="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"
          (click)="openAllChats()"
        >
          Tout voir
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span class="ml-2 text-sm text-gray-600">Chargement...</span>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && rooms.length === 0" class="text-center py-6">
        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
        </div>
        <p class="text-sm text-gray-500">Aucune discussion disponible</p>
      </div>

      <!-- Rooms List (Max 3 for widget) -->
      <div *ngIf="!loading && rooms.length > 0" class="space-y-3">
        <div 
          *ngFor="let room of rooms.slice(0, 3); trackBy: trackByRoomId"
          class="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors group"
          (click)="openChat(room)"
        >
          <!-- Class Icon -->
          <div class="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M7 21h2m3 0h2M7 3h2m3 0h2"/>
            </svg>
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h4 class="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                {{ room.classe.nom }}
              </h4>
              <!-- Message Count Badge -->
              <span *ngIf="room.messages_count > 0" 
                    class="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full ml-2 flex-shrink-0">
                {{ room.messages_count }}
              </span>
            </div>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                {{ room.classe.niveau }}
              </span>
              <span class="text-xs text-gray-400">{{ room.messages_count }} message{{ room.messages_count > 1 ? 's' : '' }}</span>
            </div>
          </div>
          
          <!-- Arrow Icon -->
          <div class="opacity-0 group-hover:opacity-100 transition-opacity">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </div>

        <!-- Show more indicator if there are more rooms -->
        <div *ngIf="rooms.length > 3" class="text-center pt-2">
          <button 
            class="text-xs text-gray-500 hover:text-gray-700 font-medium"
            (click)="openAllChats()"
          >
            et {{ rooms.length - 3 }} autre{{ rooms.length - 3 > 1 ? 's' : '' }}...
          </button>
        </div>
      </div>

      <!-- Quick Action -->
      <div *ngIf="!loading && rooms.length > 0" class="mt-4 pt-4 border-t border-gray-100">
        <button 
          class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
          (click)="openAllChats()"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          Ouvrir les discussions
        </button>
      </div>
    </div>
  `
})
export class ChatWidgetComponent implements OnInit {
  private chatService = inject(ChatService);
  private router = inject(Router);

  rooms: ChatRoom[] = [];
  loading = true;

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.loading = true;
    
    this.chatService.getMyRooms().subscribe({
      next: (response) => {
        if (response.success) {
          this.rooms = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading rooms for widget:', err);
        this.loading = false;
      }
    });
  }

  openChat(room: ChatRoom) {
    this.router.navigate(['/chat', room.id]);
  }

  openAllChats() {
    this.router.navigate(['/chat']);
  }

  trackByRoomId(index: number, room: ChatRoom): number {
    return room.id;
  }
}