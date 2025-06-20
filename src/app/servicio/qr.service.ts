// src/app/servicio/qr.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class QrService {
  private apiUrl = 'http://localhost:3000/api/qr'; // Base URL

  constructor(private http: HttpClient) {}

  // Obtener contacto por ID
  getContactById(usuarioId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${usuarioId}`);
  }
}
