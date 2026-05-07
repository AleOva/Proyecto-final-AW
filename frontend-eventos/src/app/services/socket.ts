import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private eventSource: EventSource | null = null;

  constructor() {
    console.log('🔌 Conectando a SSE...');
    this.connect();
  }

  private connect() {
    this.eventSource = new EventSource('http://localhost:3000/events');
    
    this.eventSource.onopen = () => {
      console.log('✅ Conectado a SSE');
    };
    
    this.eventSource.onerror = (error) => {
      console.error('❌ Error SSE:', error);
    };
  }

  onDbUpdate(): Observable<any> {
    return new Observable(observer => {
      if (!this.eventSource) return;
      
      this.eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('📡 Evento recibido:', data);
        observer.next(data);
      };
    });
  }
}