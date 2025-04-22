import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MaestrasService } from 'app/modules/maestras/maestras.service';
import { RegistroComponent } from '../registro/registro.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-agregar-gastos-adicionales',
  templateUrl: './agregar-gastos-adicionales.component.html',
  styleUrl: './agregar-gastos-adicionales.component.scss',
  standalone: true,
  imports: [
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatOptionModule,
    TextFieldModule,
    CommonModule,
    MatTableModule, // ✅ Add this line

  ],
})
export class AgregarGastosAdicionalesComponent {

  displayedColumns2 = [
    'recurso', 'valor_financiado'
  ];

  rubrosAdicionales: any[] = [];
  constructor(
    private fb: FormBuilder,
    private maestraService: MaestrasService,
    private _fuseConfirmationService: FuseConfirmationService,
    private _formBuilder: UntypedFormBuilder,
    public matDialogRef: MatDialogRef<RegistroComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    //GASTOS DE RESIDENTE
    this.rubrosAdicionales = [
      { rubro: "MONTO DE CONVENIO", cidCodigo: "001" },
      { rubro: "MONTO AMPLIACIÓN PRESUPUESTAL", cidCodigo: "002" },
      { rubro: "MONTO TOTAL FINANCIADO", cidCodigo: "003" },
      { rubro: "GASTOS GENERALES", cidCodigo: "004" },
      { rubro: "GASTOS DE RESIDENTE", cidCodigo: "005" },
      { rubro: "COSTOS FINANCIEROS u OTROS (*)", cidCodigo: "006" },
      { rubro: "GASTOS DE N.E.", cidCodigo: "007" },
      { rubro: "INTERESES", cidCodigo: "008" },
      {
        rubro: "GASTOS DE SUPERVISION", cidCodigo: "009"
      }];
  }
  salir() { }
  cancelar() { }
  save() { }
}
