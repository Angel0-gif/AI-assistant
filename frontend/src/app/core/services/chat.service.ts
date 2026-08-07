import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatResponse, Conversation } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private base = `${environment.apiUrl}/assistant`;

  constructor(private http: HttpClient) {}

  send(message: string, conversationId: number | null): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.base}/chat/`, {
      message,
      conversation_id: conversationId,
    });
  }

  listConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.base}/conversations/`);
  }

  getConversation(id: number): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.base}/conversations/${id}/`);
  }

  deleteConversation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/conversations/${id}/`);
  }
}
