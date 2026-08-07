import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ChatService } from '../../core/services/chat.service';
import { Message } from '../../core/models/models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, IonicModule],
  templateUrl: './chat.page.html',
})
export class ChatPage {
  @ViewChild('scrollArea') scrollArea?: ElementRef;

  messages = signal<Message[]>([]);
  draft = '';
  sending = signal(false);
  conversationId: number | null = null;

  constructor(private chatService: ChatService) {}

  send() {
    const text = this.draft.trim();
    if (!text || this.sending()) return;

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    this.messages.update((list) => [...list, userMsg]);
    this.draft = '';
    this.sending.set(true);
    this.scrollToBottom();

    this.chatService.send(text, this.conversationId).subscribe({
      next: (res) => {
        this.conversationId = res.conversation_id;
        this.messages.update((list) => [
          ...list,
          { id: Date.now() + 1, role: 'assistant', content: res.reply, created_at: res.created_at },
        ]);
        this.sending.set(false);
        this.scrollToBottom();
      },
      error: () => {
        this.messages.update((list) => [
          ...list,
          {
            id: Date.now() + 1,
            role: 'assistant',
            content: "Désolé, je n'ai pas pu répondre — vérifie ta connexion ou réessaie.",
            created_at: new Date().toISOString(),
          },
        ]);
        this.sending.set(false);
      },
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      this.scrollArea?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  }
}
