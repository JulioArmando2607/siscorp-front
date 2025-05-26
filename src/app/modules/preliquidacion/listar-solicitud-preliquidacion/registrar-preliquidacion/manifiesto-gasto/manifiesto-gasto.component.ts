import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ExcelPreliquidacionService } from 'app/modules/maestras/excel.preliquidacion.service';
import { MaestrasService } from 'app/modules/maestras/maestras.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-manifiesto-gasto',
  imports: [
    ReactiveFormsModule, // <== Agregar esta línea
    CommonModule,
    MatTableModule, // <== Agregar la importación de MatTableModule
    MatSortModule,  // <== Agregar la importación de MatSortModule
    MatPaginatorModule, // <== Agregar la importación de MatPaginatorModule
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatDatepickerModule,
  ],
  templateUrl: './manifiesto-gasto.component.html',
  styleUrl: './manifiesto-gasto.component.scss'
})
export class ManifiestoGastoComponent {

  titulo: string
  filterForm: UntypedFormGroup;
  //dataSource: MatTableDataSource<any> = new MatTableDataSource();
  //  dataSource: any[] = []
  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  displayedColumns: string[] = ['nr', 'fecha', 'clase', 'nrDocumento', 'razonSocial', 'concepto', 'importe', 'observaciones', 'acciones'];
  footerColumns: string[] = ['totalLabel', 'totalValue'];
  idManifiestoGastoAvanceFinanciero: any = 0
  idManifiestoGastoAvanceFinancieroDetalle: number = 0
  idControlAvanceFinancieroProyecto: any = 0
  configForm: UntypedFormGroup;
  idPreliquidacion: any
  constructor(
    private maestraService: MaestrasService,
    public matDialogRef: MatDialogRef<ManifiestoGastoComponent>,
    private _formBuilder: UntypedFormBuilder,
    private _fuseConfirmationService: FuseConfirmationService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    console.log(data)
    this.titulo = this.data.proyecto.nombreControlAvanceFinanciero
    this.idPreliquidacion = this.data.idPreliquidacion//proyecto.nombreControlAvanceFinanciero
    this.idControlAvanceFinancieroProyecto = this.data.proyecto.idControlAvanceFinancieroProyecto
    this.listarManifiestoPreliquidacion(this.idControlAvanceFinancieroProyecto)
  }

  async ngOnInit() {
    this.filterForm = this.fb.group({
      fecha: ["", Validators.required],
      claseDocumento: ["", Validators.required],
      numeroDocumento: ["", Validators.required],
      razonSocial: ["", Validators.required],
      concepto: ["", Validators.required],
      importe: ["", Validators.required],
      observaciones: ["", Validators.required]
    });
  }


  async setRegistrarManifiestoG() {
    const datosFormulario = this.filterForm.getRawValue();
    const datosCompletos = {
      ...datosFormulario, ...this.data.proyecto,
      codigoUnicoCmpr: this.data.proyecto.codigoUnico,
      idAvanceFinanciero: this.data.proyecto.idAvanceFinanciero,
      idManifiestoGastoAvanceFinanciero: this.idManifiestoGastoAvanceFinanciero,
      idManifiestoGastoAvanceFinancieroDetalle: this.idManifiestoGastoAvanceFinancieroDetalle,
      idPreliquidacion: this.idPreliquidacion, idProyecto: this.data.idProyecto
    };
    console.log(datosCompletos)
    const oRespL = await lastValueFrom(
      this.maestraService.RegManifiestoGastoAvanceFinanciero(
        datosCompletos
      )
    );
    this.idManifiestoGastoAvanceFinanciero = oRespL.data.response.idManifiestoGastoAvanceFinanciero
    this.getTablaManifiestoGasto()
  }

  async getTablaManifiestoGasto() {
    const datos = {
      idManifiestoGastoAvanceFinanciero: this.idManifiestoGastoAvanceFinanciero,
      codigoUnicoCmpr: this.data.proyecto.codigoUnico
    };
    const oRespL = await lastValueFrom(
      this.maestraService.listarManifiestoGastoAvanceFinanciero(
        datos
      )
    );
    // this.dataSource = oRespL.data
    this.dataSource = new MatTableDataSource(oRespL.data);

    this.limpiar()
    //getIdManifiestoGastoAvanceFinanciero
  }

  limpiar() {
    this.filterForm.reset()
    this.idManifiestoGastoAvanceFinanciero = this.idManifiestoGastoAvanceFinanciero
    this.idManifiestoGastoAvanceFinancieroDetalle = 0

  }
  salir() { this.matDialogRef.close() }

  getTotalCost() {
    return this.dataSource?.data
      .reduce((sum, row) => sum + (Number(row.importe) || 0), 0) || 0;

  }

  async eliminarRegistro(row) {
    const confirmado = await this.dataModal(522, 'Eliminar Registro', '¿Deseas eliminar este registro?', 'warning');
    if (confirmado) {
      const data = {
        idManifiestoGastoAvanceFinanciero: row.idManifiestoGastoAvanceFinanciero,
        idManifiestoGastoAvanceFinancieroDetalle: row.idManifiestoGastoAvanceFinancieroDetalle
      }
      const response = await this.maestraService.setEliminarRegManifiestoGasto(data).toPromise();
      if (response) {
        this.getTablaManifiestoGasto()
      }
    }

  }

  editar(row) {
    console.log(row)
    this.idManifiestoGastoAvanceFinanciero = row.idManifiestoGastoAvanceFinanciero
    this.idManifiestoGastoAvanceFinancieroDetalle = row.idManifiestoGastoAvanceFinancieroDetalle

    this.filterForm.get("fecha").setValue(row.fecha);
    this.filterForm.get("claseDocumento").setValue(row.claseDocumento);
    this.filterForm.get("numeroDocumento").setValue(row.numeroDocumento);
    this.filterForm.get("razonSocial").setValue(row.razonSocial);
    this.filterForm.get("concepto").setValue(row.concepto);
    this.filterForm.get("importe").setValue(row.importe);
    this.filterForm.get("observaciones").setValue(row.observaciones);

  }

  validarManifiesto() {

  }

  async listarManifiestoPreliquidacion(idControlAvanceFinancieroProyecto) {
    const data = {
      idPreliquidacion: this.idPreliquidacion,
      codigoUnicoCmpr: this.data.proyecto.codigoUnico,
      idAvanceFinanciero: this.data.proyecto.idAvanceFinanciero
      //idControlAvanceFinancieroProyecto: idControlAvanceFinancieroProyecto
    }
    const oRespL = await lastValueFrom(
      this.maestraService.listarManifiestoPreliquidacion(
        data
      )
    );
    if (oRespL.data.length > 0) {
      this.idManifiestoGastoAvanceFinanciero = oRespL.data[0].idManifiestoGastoAvanceFinanciero
      await this.getTablaManifiestoGasto()
    }
    console.log(this.idManifiestoGastoAvanceFinanciero)
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  dataModal(codigo: number, title: string, message: string, type: 'success' | 'warning' | 'error' | 'approve' | 'reject'): Promise<boolean> {
    return new Promise((resolve) => {
      let confirmLabel = 'Aceptar';
      let confirmColor = 'primary';
      let iconName = 'heroicons_outline:check-circle';
      let iconColor = 'primary';

      // Definir el comportamiento según el tipo de modal
      switch (type) {
        case 'success':
          confirmLabel = 'Aceptar';
          confirmColor = 'primary';
          iconName = 'heroicons_outline:check-circle';
          iconColor = 'primary';
          break;

        case 'warning':
          confirmLabel = 'Entendido';
          confirmColor = 'warn';
          iconName = 'heroicons_outline:exclamation-triangle';
          iconColor = 'warn';
          break;

        case 'error':
          confirmLabel = 'Eliminar';
          confirmColor = 'warn';
          iconName = 'heroicons_outline:x-circle';
          iconColor = 'warn';
          break;

        case 'approve':
          confirmLabel = 'Aprobar';
          confirmColor = 'primary';
          iconName = 'heroicons_outline:check';
          iconColor = 'success';
          break;

        case 'reject':
          confirmLabel = 'Desaprobar';
          confirmColor = 'warn';
          iconName = 'heroicons_outline:x-circle';
          iconColor = 'warn';
          break;
      }

      const actions = {
        cancel: this._formBuilder.group({
          show: true,
          label: 'Cancelar',
        }),
        confirm: this._formBuilder.group({
          show: true,
          label: confirmLabel,
          color: confirmColor,
        }),
      };

      this.configForm = this._formBuilder.group({
        title: title,
        message: message,
        icon: this._formBuilder.group({
          show: true,
          name: iconName,
          color: iconColor,
        }),
        actions: this._formBuilder.group(actions),
        dismissible: true,
      });

      // Abrir el diálogo y esperar la respuesta del usuario
      const dialogRef = this._fuseConfirmationService.open(this.configForm.value);

      dialogRef.afterClosed().subscribe((result) => {
        resolve(result === 'confirmed'); // Retorna true si el usuario confirma
      });
    });
  }

}
