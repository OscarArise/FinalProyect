// src/app/qr.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class QrService {
  private apiUrl = 'http://localhost:3000/api/qr'; // Ajustar según la URL

  constructor(private http: HttpClient) {}

  // Obtener todos los contactos
  getAllContacts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Obtener contactos por usuario
  getContactsByUser(usuarioId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }
}
