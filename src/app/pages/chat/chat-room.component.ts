// src/app/pages/chat/chat-room.component.ts
import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService, ChatMessage, ChatParticipant } from '../../services/chat.service';
import { Subject, takeUntil, interval } from 'rxjs';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <!-- Header -->
      <div class="bg-white shadow-lg border-b border-gray-200 p-4">
        <div class="max-w-4xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button 
              class="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              (click)="goBack()"
            >
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            
            <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M7 21h2m3 0h2M7 3h2m3 0h2"/>
              </svg>
            </div>
            
            <div>
              <h1 class="text-xl font-bold text-gray-800">{{ roomTitle || 'Discussion de Classe' }}</h1>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <span>{{ participants.length }} participants</span>
                <span class="text-gray-400">•</span>
                <span class="text-green-600 font-medium">En ligne</span>
              </div>
            </div>
          </div>

          <button 
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
            (click)="toggleParticipants()"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
            </svg>
            Participants
          </button>
        </div>
      </div>

      <div class="max-w-4xl mx-auto flex h-[calc(100vh-80px)]">
        <!-- Main Chat Area -->
        <div class="flex-1 flex flex-col">
          <!-- Messages Container -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4" #messagesContainer>
            
            <!-- Loading Messages -->
            <div *ngIf="loadingMessages" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>

            <!-- Messages List -->
            <div *ngFor="let message of messages; trackBy: trackByMessageId" class="flex items-start gap-3">
              
              <!-- Avatar -->
              <div class="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-xs font-bold text-white">{{ getInitials(message.user.name) }}</span>
              </div>

              <!-- Message Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-semibold text-gray-900 text-sm">{{ message.user.name }}</span>
                  <span class="text-xs text-gray-500">{{ formatTime(message.created_at) }}</span>
                </div>

                <!-- Text Message -->
                <div *ngIf="message.type === 'text' && message.body" 
                     class="bg-white rounded-2xl rounded-tl-md p-3 shadow-sm border border-gray-200 max-w-md">
                  <p class="text-gray-800 whitespace-pre-wrap">{{ message.body }}</p>
                </div>
                
                <!-- Debug: Afficher le message brut temporairement -->
                <div *ngIf="message.type === 'text' && !message.body" class="bg-red-50 rounded-2xl p-3 text-xs text-red-600">
                  Debug - Message vide: {{ message | json }}
                </div>

                <!-- Image Message -->
                <div *ngIf="message.type === 'image'" class="max-w-sm">
                  <div *ngIf="message.body" class="bg-white rounded-2xl rounded-tl-md p-3 shadow-sm border border-gray-200 mb-2">
                    <p class="text-gray-800">{{ message.body }}</p>
                  </div>
                  <div class="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                    <img [src]="message.attachment_url" [alt]="message.body || 'Image'" 
                         class="w-full h-auto cursor-pointer hover:opacity-95 transition-opacity"
                         (click)="openImageModal(message.attachment_url!)">
                  </div>
                </div>

                <!-- File Message -->
                <div *ngIf="message.type === 'file'" 
                     class="bg-white rounded-2xl rounded-tl-md p-3 shadow-sm border border-gray-200 max-w-md">
                  <div *ngIf="message.body" class="mb-2">
                    <p class="text-gray-800">{{ message.body }}</p>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-blue-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                    </svg>
                    <a [href]="message.attachment_url" target="_blank" class="font-medium hover:underline">
                      Télécharger le fichier
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="!loadingMessages && messages.length === 0" class="text-center py-12">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
              <p class="text-gray-500">Aucun message pour le moment</p>
              <p class="text-sm text-gray-400 mt-1">Commencez la discussion!</p>
            </div>
          </div>

          <!-- Message Input -->
          <div class="p-4 bg-white border-t border-gray-200">
            <div class="flex items-end gap-3">
              <!-- File Upload -->
              <input type="file" #fileInput (change)="onFileSelected($event)" class="hidden" accept="image/*,.pdf,.doc,.docx">
              <button 
                class="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
                (click)="fileInput.click()"
                [disabled]="sendingMessage"
              >
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                </svg>
              </button>

              <!-- Message Input -->
              <div class="flex-1 relative">
                <textarea 
                  [(ngModel)]="messageText"
                  (keydown)="onKeyDown($event)"
                  placeholder="Tapez votre message..."
                  class="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="1"
                  [disabled]="sendingMessage"
                ></textarea>
                
                <!-- Selected File Preview -->
                <div *ngIf="selectedFile" class="absolute -top-16 left-0 right-0 bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                      </svg>
                      <span class="text-sm font-medium text-blue-800">{{ selectedFile.name }}</span>
                    </div>
                    <button (click)="clearSelectedFile()" class="text-blue-600 hover:text-blue-800">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Send Button -->
              <button 
                class="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-xl flex items-center justify-center transition-colors"
                (click)="sendMessage()"
                [disabled]="sendingMessage || (!messageText.trim() && !selectedFile)"
              >
                <div *ngIf="sendingMessage" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <svg *ngIf="!sendingMessage" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Participants Sidebar -->
        <div *ngIf="showParticipants" class="w-64 bg-white border-l border-gray-200 p-4">
          <h3 class="font-bold text-gray-800 mb-4">Participants ({{ participants.length }})</h3>
          
          <div class="space-y-2">
            <div *ngFor="let participant of participants" class="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
              <div class="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                <span class="text-xs font-bold text-white">{{ getInitials(participant.name) }}</span>
              </div>
              <div>
                <div class="font-medium text-gray-800 text-sm">{{ participant.name }}</div>
                <div class="text-xs text-gray-500 capitalize">{{ participant.role }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Image Modal -->
      <div *ngIf="imageModalUrl" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
           (click)="closeImageModal()">
        <div class="relative max-w-4xl max-h-full">
          <img [src]="imageModalUrl" class="max-w-full max-h-full object-contain rounded-lg">
          <button 
            class="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-colors"
            (click)="closeImageModal()"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ChatRoomComponent implements OnInit, OnDestroy, AfterViewChecked {
  private chatService = inject(ChatService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  roomId!: number;
  roomTitle = '';
  messages: ChatMessage[] = [];
  participants: ChatParticipant[] = [];
  messageText = '';
  selectedFile: File | null = null;
  
  loadingMessages = true;
  sendingMessage = false;
  showParticipants = false;
  imageModalUrl: string | null = null;
  
  private shouldScrollToBottom = true;
  private lastMessageCount = 0;

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.roomId = +params['id'];
      this.loadRoomData();
      this.startPolling();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom && this.messages.length !== this.lastMessageCount) {
      this.scrollToBottom();
      this.lastMessageCount = this.messages.length;
      this.shouldScrollToBottom = false;
    }
  }

  loadRoomData() {
    this.loadMessages();
    this.loadParticipants();
    this.markAsRead();
  }

  loadMessages() {
    this.chatService.getMessages(this.roomId).subscribe({
      next: (response) => {
        if (response.success) {
          this.messages = response.data;
          this.shouldScrollToBottom = true;
        }
        this.loadingMessages = false;
      },
      error: (err) => {
        console.error('Error loading messages:', err);
        this.loadingMessages = false;
      }
    });
  }

  loadParticipants() {
    this.chatService.getParticipants(this.roomId).subscribe({
      next: (response) => {
        if (response.success) {
          this.participants = response.data;
        }
      },
      error: (err) => {
        console.error('Error loading participants:', err);
      }
    });
  }

sendMessage() {
  if ((!this.messageText.trim() && !this.selectedFile) || this.sendingMessage) {
    return;
  }

  console.log('=== DEBUG ENVOI MESSAGE ===');
  console.log('Message à envoyer:', this.messageText);
  console.log('Room ID:', this.roomId);
  console.log('File:', this.selectedFile);

  this.sendingMessage = true;

  this.chatService.sendMessage(this.roomId, this.messageText.trim(), this.selectedFile || undefined).subscribe({
    next: (response) => {
      console.log('=== REPONSE BACKEND ===');
      console.log('Response complète:', response);
      
      if (response.success) {
        console.log('Message reçu:', response.data);
        this.messages.push(response.data);
        this.messageText = '';
        this.selectedFile = null;
        this.shouldScrollToBottom = true;
        this.markAsRead();
      }
      this.sendingMessage = false;
    },
    error: (err) => {
      console.error('=== ERREUR ENVOI ===');
      console.error('Erreur détaillée:', err);
      this.sendingMessage = false;
    }
  });
}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (8MB max selon le backend)
      if (file.size > 8 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Taille maximale: 8MB');
        return;
      }
      this.selectedFile = file;
    }
  }

  clearSelectedFile() {
    this.selectedFile = null;
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  markAsRead() {
    this.chatService.markAsRead(this.roomId).subscribe({
      next: () => {
        // Marqué comme lu
      },
      error: (err) => {
        console.error('Error marking as read:', err);
      }
    });
  }

  startPolling() {
    // Polling toutes les 3 secondes pour nouveaux messages
    interval(3000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.refreshMessages();
      });
  }

  refreshMessages() {
    // Charger les nouveaux messages sans loader
    this.chatService.getMessages(this.roomId).subscribe({
      next: (response) => {
        if (response.success && response.data.length > this.messages.length) {
          const newMessages = response.data.slice(this.messages.length);
          this.messages.push(...newMessages);
          this.shouldScrollToBottom = true;
          this.markAsRead();
        }
      },
      error: (err) => {
        // Ignorer les erreurs de polling silencieusement
      }
    });
  }

  scrollToBottom() {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  toggleParticipants() {
    this.showParticipants = !this.showParticipants;
  }

  openImageModal(url: string) {
    this.imageModalUrl = url;
  }

  closeImageModal() {
    this.imageModalUrl = null;
  }

  goBack() {
    this.router.navigate(['/chat']);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  trackByMessageId(index: number, message: ChatMessage): number {
    return message.id;
  }
}