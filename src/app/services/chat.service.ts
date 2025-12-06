// src/app/services/chat.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface ChatRoom {
  id: number;
  classe: { id: number; nom: string; niveau: string };
  messages_count: number;
}

export interface ChatMessage {
  id: number;
  user_id: number;
  body: string | null;
  type: 'text' | 'image' | 'file';
  attachment_path?: string | null;
  attachment_url?: string | null;
  created_at: string;
  user: { id: number; name: string };
}

export interface ChatParticipant {
  id: number;
  name: string;
  role: 'educateur' | 'parent';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://127.0.0.1:8000/api/chat';

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  // ✅ MÉTHODE CORRIGÉE - Envoyer message avec ou sans fichier
  sendMessage(roomId: number, body: string, attachment?: File): Observable<ApiResponse<ChatMessage>> {
    console.log('🚀 sendMessage called', { roomId, body, hasFile: !!attachment });

    if (attachment) {
      // ✅ Cas 1 : Avec fichier → FormData
      const formData = new FormData();
      
      // Important : n'ajoutez le body que s'il n'est pas vide
      if (body && body.trim()) {
        formData.append('body', body.trim());
      }
      
      formData.append('attachment', attachment, attachment.name);
      
      // Log détaillé
      console.log('📤 Envoi avec fichier:', {
        fileName: attachment.name,
        fileSize: attachment.size,
        fileType: attachment.type,
        body: body || '(vide)',
      });

      // Debug FormData
      formData.forEach((value, key) => {
        console.log(`  FormData[${key}]:`, value instanceof File ? `File(${value.name})` : value);
      });

      // ⚠️ IMPORTANT : Ne PAS définir Content-Type manuellement
      // Le navigateur le fait automatiquement avec la boundary pour multipart/form-data
      return this.http.post<ApiResponse<ChatMessage>>(
        `${this.API_URL}/rooms/${roomId}/messages`,
        formData
        // Pas de headers !
      ).pipe(
        tap(response => console.log('📥 Réponse backend (avec fichier):', response))
      );

    } else {
      // ✅ Cas 2 : Sans fichier → JSON standard
      const payload = {
        body: body.trim(),
        type: 'text'
      };

      console.log('📤 Envoi JSON:', payload);

      return this.http.post<ApiResponse<ChatMessage>>(
        `${this.API_URL}/rooms/${roomId}/messages`,
        payload,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          })
        }
      ).pipe(
        tap(response => console.log('📥 Réponse backend (JSON):', response))
      );
    }
  }

  // --- Autres méthodes inchangées ---
  getMyRooms(): Observable<ApiResponse<ChatRoom[]>> {
    return this.http.get<ApiResponse<ChatRoom[]>>(`${this.API_URL}/rooms`);
  }

  getMessages(roomId: number, limit: number = 30, before?: string): Observable<ApiResponse<ChatMessage[]>> {
    let params = new HttpParams().set('limit', limit.toString());
    if (before) params = params.set('before', before);
    return this.http.get<ApiResponse<ChatMessage[]>>(
      `${this.API_URL}/rooms/${roomId}/messages`, 
      { params }
    );
  }

  getParticipants(roomId: number): Observable<ApiResponse<ChatParticipant[]>> {
    return this.http.get<ApiResponse<ChatParticipant[]>>(
      `${this.API_URL}/rooms/${roomId}/participants`
    );
  }

  markAsRead(roomId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.API_URL}/rooms/${roomId}/read`, 
      {}
    );
  }

  updateMessages(messages: ChatMessage[]) { 
    this.messagesSubject.next(messages); 
  }
  
  addMessage(message: ChatMessage) { 
    this.messagesSubject.next([...this.messagesSubject.value, message]); 
  }
  
  clearMessages() { 
    this.messagesSubject.next([]); 
  }
}