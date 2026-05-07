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
      // Intentar reconectar después de 5 segundos si hay error
      setTimeout(() => {
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          console.log('🔄 Reintentando conexión...');
          this.connect();
        }
      }, 5000);
    };
  }

  onDbUpdate(): Observable<any> {
    return new Observable(observer => {
      if (!this.eventSource) {
        observer.error('No hay conexión SSE');
        return;
      }
      
      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Filtrar: Solo enviar cambios REALES (INSERT y UPDATE)
          // No enviar el mensaje de bienvenida (type: 'connected')
          if (data.type !== 'connected') {
            console.log('📡 Evento recibido del backend:', data);
            observer.next(data);
          } else {
            console.log('🔵 Conexión establecida (ignorando mensaje de bienvenida)');
          }
        } catch (error) {
          console.error('❌ Error al parsear evento:', error);
        }
      };
      
      // Limpiar al desuscribirse
      return () => {
        console.log('🔌 Cerrando conexión SSE');
        if (this.eventSource) {
          this.eventSource.close();
        }
      };
    });
  }
}