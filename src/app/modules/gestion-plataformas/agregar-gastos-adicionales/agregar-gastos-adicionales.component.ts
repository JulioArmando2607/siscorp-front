import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
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
  idProyecto: any;
  configForm: UntypedFormGroup;

  constructor(
    private fb: FormBuilder,
    private maestraService: MaestrasService,
    private _fuseConfirmationService: FuseConfirmationService,
    private _formBuilder: UntypedFormBuilder,
    public matDialogRef: MatDialogRef<RegistroComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    console.log(data.proyecto.idProyecto);
    this.idProyecto = data.proyecto.idProyecto;
    this.cargarRubrosAdicionales()
  }
  cargarRubrosAdicionales() {
    this.maestraService.getRubrosAdicionales(this.idProyecto).subscribe((res: any) => {
      this.rubrosAdicionales = res.data;
    });
  }
  salir() { }
  cancelar() { this.matDialogRef.close(); }
  save() {
    console.log(this.rubrosAdicionales)

    this.maestraService.crearRubrosProyecto(this.rubrosAdicionales).subscribe((res: any) => {
      console.log(res);
    this.dataModal(res.data.codResultado,'CONTROL Y MONITOREO DEL MOVIMIENTO FINANCIERO',res.data.msgResultado
    )
      this.cargarRubrosAdicionales()
      
      //  this.rubrosAdicionales = res.data;
    });

    /*crear-monitoreo-proyecto */
  }

  dataModal(codigo: number, title: string, message: string): void {
    const isSuccess = codigo === 200;
  
    const cancelAction = this._formBuilder.group({
      show: !isSuccess,
      label: 'Cancelar',
    });
  
    const confirmAction = this._formBuilder.group({
      show: false,
      label: 'Remove',
      color: 'warn',
    });
  
    const icon = this._formBuilder.group({
      show: true,
      name: isSuccess
        ? 'heroicons_outline:check-circle'
        : 'heroicons_outline:exclamation-triangle',
      color: isSuccess ? 'primary' : 'warn',
    });
  
    const actions = {
      cancel: cancelAction,
      confirm: confirmAction,
    };
  
    this.configForm = this._formBuilder.group({
      title,
      message,
      icon,
      actions: this._formBuilder.group(actions),
      dismissible: true,
    });
  
    this.openConfirmationDialog(codigo);
  }
  
  openConfirmationDialog(codigo: number): void {
    const dialogRef = this._fuseConfirmationService.open(this.configForm.value);
  
    if (codigo === 200) {
      setTimeout(() => {
        dialogRef.close();
      }, 1000);
    }
  }
  
  
}
