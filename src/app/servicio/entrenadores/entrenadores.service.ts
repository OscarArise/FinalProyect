import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class EntrenadoresService {
  constructor(private http: HttpClient) {}

  obtenerEntrenadores() {
    return this.http.get<any[]>('/entrenadores.json');
  }
}
