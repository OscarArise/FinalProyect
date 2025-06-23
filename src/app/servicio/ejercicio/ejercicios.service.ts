import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EjerciciosService {

  private apiUrl = 'https://api.api-ninjas.com/v1/exercises?muscle=triceps'; 
  private apiKey = '';  //cambiar a una clave api valida para hacer las pruebas
  //se deja apiKey vacia para no gastar consumo de la api y no exponer la clave api en el repositorio publico

  constructor(private http: HttpClient) { }

  /*getEjercicios(): Observable<any[]> {
    const headers = new HttpHeaders({
      'X-Api-Key': this.apiKey,
    });
    return this.http.get<any[]>(this.apiUrl, { headers }).pipe(take(1));
  }*/

  getEjercicios(): Observable<any[]> {
    
    return this.http.get<any[]>('https://ejercicios9349032.free.beeceptor.com').pipe(take(1));
  }
  //https://ejercicios238934297.free.beeceptor.com 
  //https://ejercicios9349032.free.beeceptor.com
}
