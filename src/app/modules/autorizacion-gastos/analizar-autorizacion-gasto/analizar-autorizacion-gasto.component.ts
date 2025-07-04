import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Session } from 'app/core/auth/Session';
import { ArchivosService } from 'app/modules/maestras/archivos.service';
import { MaestrasService } from 'app/modules/maestras/maestras.service';
import { lastValueFrom } from 'rxjs';
import { ObservarDialogComponent } from '../observar-dialog/observar-dialog.component';

@Component({
  selector: 'app-analizar-autorizacion-gasto',
  standalone: true,
  imports: [
    //  ReactiveFormsModule, // <== Agregar esta línea
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
    FormsModule,
    MatTooltipModule
  ],
  templateUrl: './analizar-autorizacion-gasto.component.html',
  styleUrls: ['./analizar-autorizacion-gasto.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalizarAutorizacionGastoComponent {
  // Keep only used properties
  idAutorizacionGasto: any = null;
  isEditar: boolean;
  idAutorizacionGastoRecurso: any;
  idHistorialPrecio: any;
  isSupervisor: boolean = false;
  isResidente: boolean = false;
  isAdmin: boolean = false;
  isPEP: boolean = false;
  autorizacionGasto: any;
  dataSource: MatTableDataSource<any>;
  proyectos: any[]
  configForm: UntypedFormGroup;
  id: string | null = null;
  titulo: string;
  rubrosAdicionales: MatTableDataSource<any>;

  displayedColumns = [
    'recurso', 'und', 'monto_total_asignada', 'cantidad_total_asignada',
    'cantidad_solicitada', 'parcial_segun_cotizacion',
    'cantidad_restante', 'monto_restante', 'cantidad', 'precio_unitario',
    'total_calculado',
    // 'monto_utilizado', 
    'porcentaje', 'acciones'
  ];
  displayedColumns2 = [
    'recurso', 'valor_financiado', 'restante', 'actual', 'porcentaje_actual',
    'acumulado', 'acumulado_porcentaje',
    'acciones'
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  cidEstadoAutorizacionGasto: any;
  observacionAutorizacionGasto: any;
  estadoAutorizacionGasto: any;

  // Variables de paginación
  constructor(
    private cdr: ChangeDetectorRef,
    private _fuseConfirmationService: FuseConfirmationService,
    private maestraService: MaestrasService,
    private archivoService: ArchivosService,
    private _formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private location: Location,
    private dialog: MatDialog

  ) {
    this.validarusuario()
  }
  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id'); // ID del proyecto
    this.idAutorizacionGasto = this.route.snapshot.paramMap.get('ag'); // ID de autorización de gasto
    this.getMmostrarEstadoActualAutorizaciongasto(this.idAutorizacionGasto)
    this.cargarRubrosAdicionales()
    this.getArchivosAutorizacionGasto()

    this.verProyecto(this.id);
    this.getFiltraRecursosAturorizacionGasto(true);
  }


  async verProyecto(id) {
    const data = { idProyecto: id }
    const roresp = await lastValueFrom(this.maestraService.verProyecto(data))
    console.log(roresp)

    if (roresp) {
      this.titulo = "PROYECTO TAMBO: " + roresp.data[0].tambo
      console.log(this.titulo)
    }
  }

  async getFiltraRecursosAturorizacionGasto(mantenerFiltro: boolean = true) {
    this.getAutorizacionGastos()
    try {
      const currentFilter = mantenerFiltro ? this.dataSource?.filter : '';
      const data = {
        idAutorizacionGasto: this.idAutorizacionGasto,
        idProyecto: this.id
      }
      const oRespL = await lastValueFrom(
        this.maestraService.listaRecursosAutorizacionGastoProyectoAnalisis(
          data
        )
      );

      console.log(oRespL)
      if (oRespL?.data) {
        this.proyectos = oRespL.data.response;
        this.dataSource = new MatTableDataSource<any>(this.proyectos);
        console.log(this.dataSource)

        // Restore filter if needed
        if (mantenerFiltro && currentFilter) {
          this.dataSource.filter = currentFilter;
        }
        // Set up filter predicate if not already set
        if (!this.dataSource.filterPredicate) {
          this.dataSource.filterPredicate = (data: any, filter: string) => {
            return data.nombreRecurso?.toLowerCase().includes(filter.toLowerCase());
          };
        }
        this.cdr.detectChanges(); // 🔥 Asegurar actualización de la UI

      }
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
    }
  }


  async setRegistrarAutorizacionGasto(row) {
    const data = {
      idProyecto: this.id,
      idAutorizacionGasto: this.idAutorizacionGasto,//idAutorizaciongasto
      //idRecurso: row.idRecurso,
      codigoRecurso: row.codigoRecurso,
      cantidad: row.cantidadActual,
      precio: row.precioActual,
      precioCantidad: row.totalCalculadoActual,
      idAutorizacionGastoRecurso: row.idAutorizacionGastoRecurso,
      /// idHistorialPrecio: row.idHistorialPrecio,
      // montoRestante: row.montoRestante - row.total,
      // cantidadRestante: row.cantidadRestante - row.cantidad
    }

    const response = await this.maestraService.setRegistrarAutorizacionGastoTabla(data).toPromise();
    this.idAutorizacionGasto = response.data.response
    console.log(response.data.response);
    if (response) {
      this.getFiltraRecursosAturorizacionGasto(true);        // Recargar datos con nueva paginación

    }

  }

  editar(row) {
    this.idAutorizacionGastoRecurso = row.idAutorizacionGastoRecurso
    console.log(row.idAutorizacionGastoRecurso)
    this.isEditar = true
    this.idHistorialPrecio = row.idHistorialPrecio
    this.idAutorizacionGasto = row.idAutorizacionGasto
  }

  async eliminar(row) {
    console.log(row)

    const confirmado = await this.dataModal(522, 'Eliminar recurso', 'Deseas eliminar este recurso?', "warning");
    if (confirmado) {
      const data = {
        idAutorizacionGastoRecurso: row.idAutorizacionGastoRecurso
      }

      const response = await this.maestraService.setEliminarAutorizacionGastoRecurso(data).toPromise();
      console.log(response);
      if (response) {
        this.getFiltraRecursosAturorizacionGasto(true);        // Recargar datos con nueva paginación

      }
    }

    console.log(row)
  }
  salir() {
    this.location.back(); // Vuelve a la página anterior
  }

  async solicitarAutorizacion() {
    const confirmado = await this.dataModal(600, 'Solicitar Autorización de Gasto', '¿Deseas solicitar la autorización de gasto?', 'approve');
    if (confirmado) {
      const data = {
        idAutorizacionGasto: this.idAutorizacionGasto,
        cidEstadoAG: "002",
        observacion: "Solicitado Autorización de Gasto desde el Residente"
      }
      const response = await this.maestraService.solicitarAutorizacionGastoResidente(data).toPromise();
      if (response) {
        this.salir()
      }
    }
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


  recalcularTotal(index: number): void {
    const row = this.dataSource.filteredData[index];

    console.log(row);

    if (row.cantidadActual !== 0 && row.precioActual !== 0) {
      row.totalCalculadoActual = row.cantidadActual * row.precioActual;
      this.dataSource._updateChangeSubscription();
      this.guardarActulizar(row);
    }
  }

  guardarActulizar(data) {
    console.log(data)
    this.setRegistrarAutorizacionGasto(data)
  }

  getTextColor(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'VERDE':
        return '#155724';
      case 'AMARILLO':
        return '#856404';
      case 'ROJO':
        return '#721c24';
      case 'GRIS':
        return '#383d41';
      default:
        return '#000';
    }
  }

  aplicarFiltro(event: Event) {
    const filtroValor = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filtroValor.trim().toLowerCase();
  }


  async aprobarAutorizacion() {
    const confirmado = await this.mostrarDialogoConfirmacion();
    if (confirmado) {
      const data = {
        idAutorizacionGasto: this.idAutorizacionGasto,
        cidEstadoAG: "004", // Estado de aprobación
        observacion: "Autorización de gasto aprobada por el supervisor y solicitada al PEP."
      };

      const response = await lastValueFrom(
        this.maestraService.solicitarAutorizacionGasto(data)
      );

      if (response) {
        this.salir();
      }
    }
  }

  async aprobarAutorizacionAdmin() {
    const confirmado = await this.mostrarDialogoConfirmacion();
    if (confirmado) {
      const data = {
        idAutorizacionGasto: this.idAutorizacionGasto,
        cidEstadoAG: "005", // Estado de aprobación
        observacion: "Autorización de Gasto Aprobada"
      };

      const response = await lastValueFrom(
        this.maestraService.solicitarAutorizacionGasto(data)
      );

      if (response) {
        this.salir();
      }
    }
  }

  private async mostrarDialogoConfirmacion(): Promise<boolean> {
    const dialogRef = this._fuseConfirmationService.open({
      title: 'Aprobar Autorización de Gasto',
      message: '¿Está seguro de aprobar esta autorización de gasto?',
      icon: {
        show: true,
        name: 'heroicons_outline:check-circle',
        color: 'success'
      },
      actions: {
        confirm: {
          show: true,
          label: 'Aprobar',
          color: 'primary'
        },
        cancel: {
          show: true,
          label: 'Cancelar'
        }
      },
      dismissible: true
    });

    return await lastValueFrom(dialogRef.afterClosed())
      .then(result => result === 'confirmed');
  }
  calcularTotalCalculado(): number {
    return this.dataSource?.data
      .reduce((sum, row) => sum + (Number(row.total) || 0), 0) || 0;
  }

  calcularTotalMontoAsignado(): number {
    return this.dataSource?.data.reduce((sum, row) => sum + (Number(row.montoAsignado) || 0), 0) || 0;
  }

  calcularTotalCantidadAsignada(): number {
    return this.dataSource?.data.reduce((sum, row) => sum + (Number(row.cantidadAsignado) || 0), 0) || 0;
  }

  calcularTotalMontoRestante(): number {
    return this.dataSource?.data.reduce((sum, row) => sum + (Number(row.montoRestante) || 0), 0) || 0;
  }

  calcularTotalCantidadRestante(): number {
    return this.dataSource?.data.reduce((sum, row) => sum + (Number(row.cantidadRestante) || 0), 0) || 0;
  }


  calcularTotalMontoUtilizado(): number {
    return this.dataSource?.data.reduce((sum, row) => sum + (Number(row.montoUtilizado) || 0), 0) || 0;
  }


  validarusuario() {
    // Reiniciamos todos los roles
    this.isAdmin = false;
    this.isSupervisor = false;
    this.isResidente = false;
    this.isPEP = false
    // Validar Residente
    if (Session.identity.rol == 'UPS-RESIDENTE-PROYECTO') {
      this.isResidente = true;
    }

    // Validar Supervisor
    else if (Session.identity.rol == 'UPS-SUPERVISOR-PROYECTO') {
      this.isSupervisor = true;
    }

    else if (Session.identity.rol == 'UPS-PEP-PROYECTO') {
      this.isPEP = true;
    }

    // Si no es ninguno de los anteriores, es Administrador (o cualquier otro rol general)
    else {
      this.isAdmin = true;
    }
  }

  async getAutorizacionGastos() {
    const data = {
      idProyecto: this.id,
      idAutorizacionGasto: this.idAutorizacionGasto
    }
    const oRespL = await lastValueFrom(
      this.maestraService.getAutorizacionGasto(
        data
      )
    );
    console.log(oRespL.data[0])
    this.autorizacionGasto = oRespL.data[0];
    if (oRespL?.data?.content) {

    }
  }

  cargarRubrosAdicionales() {
    const data = {
      idProyecto: this.id,
      idAutorizacionGasto: this.idAutorizacionGasto
    };
    this.maestraService.getRubrosAdicionalesAG(data).subscribe((res: any) => {
      this.rubrosAdicionales = res.data.filter((item: any) =>
        item.cidControlMonitoreo !== "001" &&
        item.cidControlMonitoreo !== "002" &&
        item.cidControlMonitoreo !== "003"
      );
    });
  }

  selectedFiles: { name: string; extension: string }[] = [];

  getArchivosAutorizacionGasto() {
    const data = { idAutorizacionGasto: this.idAutorizacionGasto };

    this.maestraService.getArchivosAutorizacionGasto(data).subscribe((res: any) => {
      console.log(res)
      if (res?.data?.response?.length) {
        this.selectedFiles = res.data.response.map((archivo: any) => ({
          name: archivo.nombre,
          extension: archivo.extension,
          path: archivo.path,

        }));
      }
    });
  }


  async descargarArchivo(dt) {
    console.log(dt)
    const archivoPayload = {
      idPreliquidacion: 0,
      idArchivo: 0,
      txtNombre: dt.name,
      txtPath: dt.path
    };

    try {
      await this.archivoService.descargar(archivoPayload);
    } catch (error) {
      console.error('Error al descargar archivo del servidor:', error);
    }
  }


  async getMmostrarEstadoActualAutorizaciongasto(idAutorizacionGasto) {
    const data = {
      idAutorizacionGasto: idAutorizacionGasto
    }
    const oRespL = await lastValueFrom(
      this.maestraService.getMmostrarEstadoActualAutorizaciongasto(
        data
      )
    );
    if (oRespL) {
      this.cidEstadoAutorizacionGasto = oRespL.data.cidEstado
      this.observacionAutorizacionGasto = oRespL.data.observacion
      this.estadoAutorizacionGasto = oRespL.data.estado
    }
    console.log(oRespL)
  }



  async observar() {
    const confirmDelete = confirm(`¿Deseas observar Preliquidacion?`);
    if (!confirmDelete) return;

    this.observarAutorizacionGasto()

  }

  async observarAutorizacionGasto() {
    const dialogRef = this.dialog.open(ObservarDialogComponent, {
      width: '500px',
      data: {
        title: 'Observar Autorización de Gasto',
        message: 'Escriba el motivo de la observación.',
      },
    });

    const comentario = await dialogRef.afterClosed().toPromise();

    if (comentario) {
      const data = {
        idAutorizacionGasto: this.idAutorizacionGasto,
        cidEstadoAG: "003", // Estado de aprobación
        observacion: comentario
      };

      console.log(data)
      try {

        const response = await lastValueFrom(
          this.maestraService.solicitarAutorizacionGasto(data)
        );

        if (response) {
          this.salir();
        }
      } catch (error) {
        console.error('Error al solicitar:', error);
      }

 
    }
  }
}