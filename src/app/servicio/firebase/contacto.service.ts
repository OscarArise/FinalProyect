import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Contacto {
  id?: string;
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
  usuarioId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactoService {
  private apiUrl = 'http://localhost:3000/api/contactos';

  constructor(private http: HttpClient) { }

  // Crear nuevo contacto
  crearContacto(contacto: Contacto): Observable<any> {
    return this.http.post(this.apiUrl, contacto);
  }

  // Obtener todos los contactos
  obtenerContactos(): Observable<Contacto[]> {
    return this.http.get<Contacto[]>(this.apiUrl);
  }

  // Obtener contactos por usuario
  obtenerContactosPorUsuario(usuarioId: string): Observable<Contacto[]> {
    return this.http.get<Contacto[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  // Editar un contacto
  editarContacto(id: string, contacto: Contacto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, contacto);
  }

  // Eliminar un contacto
  eliminarContacto(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
