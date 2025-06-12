import { Injectable } from '@angular/core';
import { Usuario } from './usuario';
import { CUENTA } from '../cuenta';

@Injectable({
  providedIn: 'root'
})
export class CuentasService {

  usuarios: Usuario[] = CUENTA;

  constructor() { }

  getUsuarios(): Usuario[] {
    return this.usuarios;
  }

  getUsuario(username: string): Usuario | undefined {
    return this.usuarios.find(usuario => usuario.username === username);
  }

  comprobarCredenciales(username: string, password: string): boolean {
    const usuario = this.getUsuario(username);
    if (usuario) {
      if (usuario.password === password) {
        return true;
      }
      return false;
    }else {
      return false;
    }
  }

}
