import { Component, OnInit } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { QrService } from '../../servicio/qr.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-qr',
  standalone: true,
  imports: [QRCodeComponent,CommonModule], // Importa el componente QRCodeComponent
  providers: [QrService], // Opcional si no está en providedIn: 'root'
  templateUrl: './qr.component.html',
  styleUrls: ['./qr.component.css']
})

export class QrComponent implements OnInit {
  contactos: any[] = [];

  constructor(private qrService: QrService) {}

  ngOnInit() {
    this.qrService.getAllContacts().subscribe({
      next: (data) => {
        this.contactos = data;
      },
      error: (err) => console.error('Error al obtener contactos:', err),
    });
  }


  getJsonString(contacto: any): string {
    return JSON.stringify(contacto, null, 2);
  }
  
}
