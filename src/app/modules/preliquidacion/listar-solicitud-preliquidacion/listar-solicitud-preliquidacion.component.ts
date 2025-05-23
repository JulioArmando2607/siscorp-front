import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ExcelService } from 'app/modules/maestras/excel.service';
import { MaestrasService } from 'app/modules/maestras/maestras.service';
import { BehaviorSubject, lastValueFrom, map, Observable, startWith, switchMap } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Session } from 'app/core/auth/Session';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ObservarDialogComponent } from 'app/modules/autorizacion-gastos/observar-dialog/observar-dialog.component';
import { ExcelPreliquidacionService } from 'app/modules/maestras/excel.preliquidacion.service';


@Component({
  selector: 'app-listar-solicitud-preliquidacion',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './listar-solicitud-preliquidacion.component.html',
  styleUrl: './listar-solicitud-preliquidacion.component.scss',
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
    MatTooltipModule,
    MatDatepickerModule
  ],
})
export class ListarSolicitudPreliquidacionComponent {
  recursos: any;
  recursosSubject: any;
  Sess
  isAdministrador: boolean;

  displayedColumns: string[] = [
    'item',
    /*'item',*///'cag',
    'fechaRegistro',
    //'cantidadRecursos', 
    //'total',
    'estado', 'acciones'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  filterForm: UntypedFormGroup;
  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  estados: any[]
  centrosPoblados: any[]
  distritos: any[]
  provincias: any[]
  departamentos: any[] = []
  proyectos: any[]
  configForm: UntypedFormGroup;
  id: string | null = null;
  titulo: string;

  partidas: any[] = []
  partidasFiltradas!: Observable<any[]>; // Observable para filtrar en memoria
  recursosFiltradas!: Observable<any[]>; // Observable para filtrar en memoria
  partidasSubject = new BehaviorSubject<any[]>([]); // Para manejar el filtrado en memoria

  // Variables de paginación
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0; // Página actual
  isSupervisor: boolean = false
  isResidente: boolean = false
  isPEP: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private _fuseConfirmationService: FuseConfirmationService,
    private _matDialog: MatDialog,
    private maestraService: MaestrasService,
    private fb: FormBuilder,
    private _formBuilder: UntypedFormBuilder,
    private excelService: ExcelPreliquidacionService,
    private route: ActivatedRoute,
    private _router: Router,
    private location: Location, private dialog: MatDialog
    //private _notesService: NotesService
  ) {


    //this.getFiltrarProyectos()
  }

  async ngOnInit() {

    this.filterForm = this.fb.group({
      codigo: [''],
      estado: [''],
      fecha: [""],
      idEstado: ['']
    });

    this.id = this.route.snapshot.paramMap.get('idProyecto'); // Obtiene el ID de la URL
    this.verProyecto(this.id)
    this.getPartidas(this.id);

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.validarusuario()
    this.getEstados()
    this.filterForm.reset()
    this.getFiltrarProyectos(true)
  }

  async eliminarProyecto(proyecto: any) {
    const confirmado = await this.dataModal(522, 'Eliminar proyecto', 'Deseas eliminar este proyecto?', 'warning');

    if (confirmado) {
      console.log('Eliminando proyecto:', proyecto);
      const oRespL = await lastValueFrom(this.maestraService.getEliminar(proyecto.idProyecto));

      if (oRespL) {
        this.getFiltrarProyectos();
      }
    } else {
      console.log('Eliminación cancelada.');
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


  descargarSolicitudes() { }

  // Método para obtener partidas UNA SOLA VEZ desde la API
  async getPartidas(id) {
    try {
      const response = await this.maestraService.getPartidas(id).toPromise();
      this.partidas = response.data || [];
      this.partidasSubject.next(this.partidas); // Guardamos los datos en el Subject
    } catch (error) {
      console.error('Error al cargar partidas:', error);
      this.partidas = [];
      this.partidasSubject.next([]);
    }
  }


  filtrar() {
    const filtros = this.filterForm.getRawValue();
    console.log('Valores del formulario:', filtros);
  }

  limpiar() {
    this.filterForm.reset()
    this.getFiltrarProyectos()
  }


  buscarDetalleCentroPoblado(event) {
    console.log("aqui esty")
    const valor = event.target.value.trim();
    if (valor.length > 2) { // Opcional: Para evitar búsquedas con pocos caracteres
      console.log('Buscando:', valor);
      //  this.buscarValor(valor);
    }


  }

  async getFiltrarProyectos(resetPage: boolean = false) {
    try {
      if (resetPage) {
        this.pageIndex = 0; // 🔥 Reinicia la página al filtrar
      }
      const data = {
        idProyecto: this.id,
        idEstado: this.filterForm.get("estado").value,
        fecha: this.filterForm.get("fecha").value,
        // codigo: this.filterForm.get("codigo").value
      }
      const oRespL = await lastValueFrom(
        this.maestraService.getListarPreliquidacion(
          data,
          this.pageIndex,
          this.pageSize
        )
      );

      if (oRespL?.data?.content) {
        this.proyectos = oRespL.data.content;
        this.totalElements = oRespL.data.totalElements;

        this.dataSource = new MatTableDataSource(this.proyectos);
        this.dataSource.sort = this.sort; // 🔥 Habilitar ordenación
        this.dataSource._updateChangeSubscription(); // 🔥 Refrescar tabla

        this.cdr.detectChanges(); // 🔥 Asegurar actualización de la UI
      }
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
    }
  }

  onPaginateChange(event: PageEvent) {
    console.log(event.pageIndex)
    this.pageIndex = event.pageIndex;  // Actualizar página actual
    this.pageSize = event.pageSize;    // Actualizar tamaño de página
    this.getFiltrarProyectos();        // Recargar datos con nueva paginación
  }

  openConfirmationDialog(codigo): void {
    // Open the dialog and save the reference of it
    const dialogRef = this._fuseConfirmationService.open(
      this.configForm.value
    );
    if (codigo == 200) {
      setTimeout(() => {
        dialogRef.close();
      }, 1000);
    }
  }

  registrarSolicitudPreliquidacion() {
    console.log(this.id)
    localStorage.removeItem('idPreliquidacion');
    localStorage.removeItem('idValorizacionAvanceObra');
    sessionStorage.removeItem('avanceFinancieroCargado');

    this._router.navigate(['preliquidacion/registrar-preliquidacion/', this.id]);
  }

  filtrarPartidas(value: any): any[] {
    const filterValue = (typeof value === 'string') ? value.toLowerCase() : '';
    return this.partidas.filter(partida =>
      partida.descripcionPartida.toLowerCase().includes(filterValue)
    );
  }

  filtrarRecursos(value: string): any[] {
    const filterValue = value ? value.toLowerCase() : '';
    return this.recursos.filter(recurso =>
      recurso.nombreRecurso.toLowerCase().includes(filterValue)
    );
  }

  editar(row) {
    console.log(row)
    this._router.navigate(['preliquidacion/editar-preliquidacion/', this.id, row.idPreliquidacion

    ]);
  }

  /*  async descargarAutorizacion(row) {
      try {
  
        const data = {
          idAutorizacionGasto: row.idAutorizacionGasto,
          idProyecto: this.id
        }
        const oRespL = await lastValueFrom(
          this.maestraService.getlistarRecursosAturorizacionGasto(
            data
          )
        );
  
        console.log(oRespL)
        if (oRespL?.data) {
          this.proyectos = oRespL.data;
          this.excelService.exportToExcelAutorizaciondeGasto(oRespL.data, "AUTORIZACION DE GASTO - " + this.titulo);
  
          this.dataSource._updateChangeSubscription(); // 🔥 Refrescar tabla
  
          this.cdr.detectChanges(); // 🔥 Asegurar actualización de la UI
        }
      } catch (error) {
        console.error('Error al obtener proyectos:', error);
      }
    }
   */
  async verProyecto(id) {
    const data = { idProyecto: id }
    const roresp = await lastValueFrom(this.maestraService.verProyecto(data))
    console.log(roresp)

    if (roresp) {
      this.titulo = "PROYECTO TAMBO " + roresp.data[0].tambo
      console.log(this.titulo)
    }
  }

  async eliminarPreliquidacion(row) {
    const confirmado = await this.dataModal(522, 'Eliminar Solicitud de Preliquidacion', 'Deseas eliminar esta solicitud?', 'warning');
    if (confirmado) {
      const data = {
        idPreliquidacion: row.idPreliquidacion
      }

      const response = await this.maestraService.eliminarPreliquidacion(data).toPromise();
      console.log(response);
      //this.partidas = response.data || [];
      if (response) {
        this.getFiltrarProyectos()
      }
    }

    console.log(row)
  }

  validarTipoUser() {
    if (this.id) {

    };
  }

  async solicitarAutorizacion(row) {
    const confirmado = await this.dataModal(600, 'Solicitar Autorización de Gasto', '¿Deseas solicitar la autorización de gasto?', 'approve');
    if (confirmado) {
      const data = {
        idAutorizacionGasto: row.idAutorizacionGasto,
        cidEstadoAG: "002",
        observacion: "Solicitar Autorización de Gasto desde el Residente"
      }
      const response = await this.maestraService.solicitarAutorizacionGastoResidente(data).toPromise();
      if (response) {
        this.getFiltrarProyectos()
      }
    }
  }
  salir() {
    this.location.back(); // Vuelve a la página anterior
  }

  async observarAutorizacionGasto(row) {
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
        idAutorizacionGasto: row.idAutorizacionGasto,
        cidEstadoAG: "003",
        observacion: comentario
      };

      const response = await this.maestraService.solicitarAutorizacionGastoResidente(data).toPromise();

      if (response) {
        this.getFiltrarProyectos();
      }
    }
  }

  async aprobarSupervisor(row) {
    const confirmado = await this.dataModal(600, 'Aprobar Autorización de Gasto', '¿Deseas aprobar la autorización de gasto?', 'approve');
    if (confirmado) {
      const data = {
        idAutorizacionGasto: row.idAutorizacionGasto,
        cidEstadoAG: "004",
        observacion: "Aprobado desde el Supervisor"
      }
      const response = await this.maestraService.solicitarAutorizacionGasto(data).toPromise();
      if (response) {
        this.getFiltrarProyectos()
      }
    }
  }
  validarusuario() {
    // Reiniciamos todos los roles
    this.isAdministrador = false;
    this.isSupervisor = false;
    this.isResidente = false;

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
      this.isAdministrador = true;
    }
  }


  async getEstados() {

    const response = await this.maestraService.getEstadosAutorizacion().toPromise();
    if (response) {
      this.estados = response.data.response
    }


  }
  /*
    analizarAutorizacionGasto(row) {
      this._router.navigate(['autorizacion-gastos/analizar-autorizacion-gasto', this.id, row.idAutorizacionGasto]);
    } 
      
    editar(row) {
      console.log(row)
      this._router.navigate(['preliquidacion/editar-preliquidacion/', this.id, row.idPreliquidacion
  
      ]);
    }*/


  analizarPreliquidacion(row) {
    this._router.navigate(['preliquidacion/analisar-preliquidacion/', this.id, row.idPreliquidacion]);
  }

  async export26(row) {
    try {
      const { idProyecto, idPreliquidacion } = row;

      const { data: valorizacion } = await lastValueFrom(
        this.maestraService.optnerValorizacionAvanceObra({ idProyecto, idPreliquidacion })
      );

      const { data: analisis } = await lastValueFrom(
        this.maestraService.listaAnalisisPartidadPreliquidacion({
          idProyecto,
          idPreliquidacion,
          idValorizacionObra: valorizacion?.idValorizacionAvanceObra
        })
      );
      console.log(analisis)
      this.excelService.export26(analisis || []);
    } catch (e) {
      console.error("Error exportando:", e);
    }
  }

  /* const data = {
          // idAutorizacionGasto: this.idAutorizacionGasto,
          idPreliquidacion: this.idPreliquidacion,
          idValorizacionObra: this.idValorizacionAvanceObra,
          idProyecto: this.idProyecto
        }
        let oRespL: any
        if(this.isResidente){
            oRespL = await lastValueFrom(
            this.maestraService.listaPartidadPreliquidacion(
              data
            )
          );
        } else {
          oRespL = await lastValueFrom(
            this.maestraService.listaAnalisisPartidadPreliquidacion(
              data
            )
          ); */
  async export28(row) {
    try {
      const data = {
        idPreliquidacion: row.idPreliquidacion,
        idProyecto: row.idProyecto
      }
      const oRespL = await lastValueFrom(
        this.maestraService.listarAvanceFinancieroAsignado(
          data
        )
      );
      console.log(oRespL.data)
      this.excelService.exportAnexo28(oRespL.data)
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
    }

  }
  async descargarExcelProyecto() {
    /*  const roresp = await lastValueFrom(this.maestraService.listarPlataformasExcel(this.filterForm.getRawValue(),
    ))

    console.log(roresp)
    this.excelService.exportToExcel(roresp.data, "DATOS GENERALES");*/
  }





}

