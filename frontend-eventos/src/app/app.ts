import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { EventService } from './services/event.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  logs: any[] = [];
  nuevoNombre: string = '';
  nuevoGenero: string = 'Masculino';

  constructor(
    private eventService: EventService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {
    console.log('🟢 AppComponent creado');
  }

  ngOnInit() {
    console.log('🟢 Iniciando suscripción...');
    
    this.eventService.onDbUpdate().subscribe({
      next: (data) => {
        console.log('🔥 DATO RECIBIDO:', data);
        this.logs = [data, ...this.logs];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error:', err);
      }
    });
  }

  // Agregar nuevo amigo desde la web
  agregarAmigo() {
    if (!this.nuevoNombre.trim()) {
      alert('Escribe un nombre');
      return;
    }
    
    console.log('📝 Agregando:', this.nuevoNombre, this.nuevoGenero);
    
    this.http.post('http://localhost:3000/insert', {
      name: this.nuevoNombre,
      gender: this.nuevoGenero
    }).subscribe({
      next: (res: any) => {
        console.log('✅ Agregado:', res);
        this.nuevoNombre = '';
        alert('✅ Amigo agregado correctamente');
      },
      error: (err) => {
        console.error('❌ Error:', err);
        alert('❌ Error: ' + err.error?.error || err.message);
      }
    });
  }

  // Alternar entre Raúl y Rigoberto
  alternarNombre() {
    console.log('🔄 Alternando nombres...');
    
    this.http.get('http://localhost:3000/toggle').subscribe({
      next: (res: any) => {
        console.log('✅ Alternado:', res);
      },
      error: (err) => {
        console.error('❌ Error:', err);
      }
    });
  }

  limpiarLogs() {
    this.logs = [];
    this.cdr.detectChanges();
  }
}