import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Solicitud {
  id?: string;
  nombre: string;
  telefono: string;
  claseSeleccionada: string;
  fecha: string;
  publicidad: boolean;
  usuarioId: string;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitudesService {
  private apiUrl = 'http://localhost:3000/api/solicitudes';

  constructor(private http: HttpClient) { }

  // Crear nueva solicitud
  crearSolicitud(solicitud: Solicitud): Observable<any> {
    return this.http.post(this.apiUrl, solicitud);
  }

  // Obtener todas las solicitudes
  obtenerSolicitudes(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(this.apiUrl);
  }

  // Obtener solicitudes por usuario
  obtenerSolicitudesPorUsuario(usuarioId: string): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  // Editar una solicitud
  editarSolicitud(id: string, solicitud: Solicitud): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, solicitud);
  }

  // Eliminar una solicitud
  eliminarSolicitud(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
