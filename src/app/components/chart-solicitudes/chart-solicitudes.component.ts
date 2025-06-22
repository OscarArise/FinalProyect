// src/app/components/chart-solicitudes/chart-solicitudes.component.ts
import { Component, OnInit } from '@angular/core';
import { SolicitudesService } from '../../servicio/solicitudes.service';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';

Chart.register(...registerables);

@Component({
  selector: 'app-chart-solicitudes',
  templateUrl: './chart-solicitudes.component.html',
  styleUrls: ['./chart-solicitudes.component.css'],
  imports: [CommonModule]
})
export class ChartSolicitudesComponent implements OnInit {
  chart: any;

  constructor(private solicitudService: SolicitudesService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.solicitudService.getAllSolicitudes().subscribe({
      next: (solicitudes) => {
        const claseCounts = this.contarClases(solicitudes);
        this.generarGrafica(claseCounts);
      },
      error: (err) => {
        console.error('Error al obtener solicitudes:', err);
      }
    });
  }

  contarClases(solicitudes: any[]): { label: string, count: number }[] {
    const counts: { [key: string]: number } = {};
    solicitudes.forEach((solicitud) => {
      counts[solicitud.claseSeleccionada] = (counts[solicitud.claseSeleccionada] || 0) + 1;
    });

    return Object.keys(counts).map(key => ({
      label: key,
      count: counts[key]
    }));
  }

  generarGrafica(datos: { label: string, count: number }[]) {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'bar', // Puedes usar 'pie', 'doughnut', etc.
      data: {
        labels: datos.map(d => d.label),
        datasets: [{
          label: 'Solicitudes por clase',
          data: datos.map(d => d.count),
          backgroundColor: '#C9B243',
          borderColor: '#222222',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}
