import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-registrar-preliquidacion',
  standalone: true,
  imports: [MatTabsModule, MatCardModule, MatButtonToggleModule],
  templateUrl: './registrar-preliquidacion.component.html',
  styleUrls: ['./registrar-preliquidacion.component.scss']
})
export class RegistrarPreliquidacionComponent {}
