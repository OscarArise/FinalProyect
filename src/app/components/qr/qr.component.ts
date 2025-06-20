import { Component} from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { QrService } from '../../servicio/qr.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-qr',
  standalone: true,
  imports: [QRCodeComponent,CommonModule,FormsModule],
  providers: [QrService], // Opcional si no está en providedIn: 'root'
  templateUrl: './qr.component.html',
  styleUrls: ['./qr.component.css']
})

export class QrComponent{
  contactos: any[] = [];
  usuarioId: string = ''; // Para capturar el ID del input
  contacto: any = null;   // Almacena el contacto obtenido

  constructor(private qrService: QrService) {}

buscar() {
    if (this.usuarioId.trim()) {
      this.qrService.getContactById(this.usuarioId).subscribe({
        next: (data) => {
          this.contacto = data;
        },
        error: (err) => {
          console.error('Error al obtener contacto:', err);
          this.contacto = null;
        }
      });
    }
  }


  getJsonString(contacto: any): string {
    return JSON.stringify(contacto, null, 2);
  }



  
}
