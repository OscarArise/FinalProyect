// src/app/services/solicitudes.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SolicitudesService {
  private apiUrl = 'https://nodedeploy-x272.onrender.com/api/solicitudes'; // Ajusta según tu API

  constructor(private http: HttpClient) {}

  getAllSolicitudes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
