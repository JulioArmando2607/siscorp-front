import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
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
import { ObservarDialogComponent } from '../observar-dialog/observar-dialog.component';
import { MatDatepickerModule } from '@angular/material/datepicker';


@Component({
  selector: 'app-listar-solicitud-autorizacion-gasto',
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
  standalone: true, // Declarar como componente standalone
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './listar-solicitud-autorizacion-gasto.component.html',
  styleUrl: './listar-solicitud-autorizacion-gasto.component.scss'
})
export class ListarSolicitudAutorizacionGastoComponent {
  recursos: any;
  recursosSubject: any;
  Sess
  async descargarExcelProyecto() {
    const roresp = await lastValueFrom(this.maestraService.listarPlataformasExcel(this.filterForm.getRawValue(),
    ))

    console.log(roresp)
    this.excelService.exportToExcel(roresp.data, "DATOS GENERALES");
  }
  displayedColumns: string[] = ['item', 'cag', 'fechaRegistro', 'cantidadRecursos','total', 'estado', 'acciones'];
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
  isSupervisor: boolean = true
  isResidente: boolean = true

  constructor(
    private cdr: ChangeDetectorRef,
    private _fuseConfirmationService: FuseConfirmationService,
    private _matDialog: MatDialog,
    private maestraService: MaestrasService,
    private fb: FormBuilder,
    private _formBuilder: UntypedFormBuilder,
    private excelService: ExcelService,
    private route: ActivatedRoute,
    private _router: Router,
    private location: Location,private dialog: MatDialog
    //private _notesService: NotesService
  ) {


    //this.getFiltrarProyectos()
  }

  async ngOnInit() {

    this.filterForm = this.fb.group({
      cantidad: [''],
      precio: [''],
      estado: [0],
      partidaControl: [""],
      recursoControl: [""]
    });

    this.id = this.route.snapshot.paramMap.get('id'); // Obtiene el ID de la URL
    this.verProyecto(this.id)
    this.getPartidas(this.id);

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;


    // 🔥 Monitorear el input de partidas y actualizar el filtrado en tiempo real
    this.filterForm.controls['partidaControl'].valueChanges.pipe(
      startWith(''),
      map(value => {
        if (!value) {
          // Si el usuario borra el input, mostramos todas las partidas de nuevo
          return this.partidas;
        }
        return this.filtrarPartidas(value);
      })
    ).subscribe(filtered => this.partidasFiltradas = new BehaviorSubject(filtered));

    // 🔥 Monitorear el input de recursos y actualizar el filtrado en tiempo real
    this.filterForm.controls['recursoControl'].valueChanges.pipe(
      startWith(''),
      map(value => {
        if (!value) {
          // Si el usuario borra el input, mostramos todos los recursos de nuevo
          return this.recursos;
        }
        return this.filtrarRecursos(value);
      })
    ).subscribe(filtered => this.recursosFiltradas = new BehaviorSubject(filtered));

    this.getFiltrarProyectos(true)
    this.validarusuario()
    this.getEstados()
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

  // Obtener recursos según la partida seleccionada
  async getRecursos(idPartida: number) {
    try {
      const response = await this.maestraService.getRecursosxPartidas(idPartida).toPromise();
      this.recursos = response.data || [];

      // 🔥 Reactivamos el filtrado en tiempo real
      this.filterForm.controls['recursoControl'].valueChanges.pipe(
        startWith(''),
        map(value => this.filtrarRecursos(value || ''))
      ).subscribe(filtered => this.recursosFiltradas = new BehaviorSubject(filtered));

    } catch (error) {
      console.error('Error al cargar recursos:', error);
      this.recursos = [];
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
        idProyecto: this.id
      }
      const oRespL = await lastValueFrom(
        this.maestraService.getListarAutorizacionGasto(
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

  registrarSolicitudAutorizacionGasto() {
    this._router.navigate(['autorizacion-gastos/registrar-autorizacion-gasto/', this.id]);
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



  onPartidaSelected(event: any) {
    const selectedPartida = this.partidas.find(partida => partida.idPartida === event.option.value);

    if (selectedPartida) {
      this.filterForm.patchValue({ partidaControl: selectedPartida.descripcionPartida });

      // 🔥 Llamamos a `getRecursos()` para traer los recursos de la partida
      this.getRecursos(selectedPartida.idPartida);
    } else {
      // Si el usuario borra el campo, restablecemos los filtros
      this.partidasFiltradas = new BehaviorSubject(this.partidas);
      this.recursosFiltradas = new BehaviorSubject([]);
    }

    console.log('Partida seleccionada:', selectedPartida);
  }


  onRecursoSelected(event: any) {
    const selectedRecurso = this.recursos.find(recursos => recursos.idRecurso === event.option.value);
    if (selectedRecurso) {
      this.filterForm.patchValue({ recursoControl: selectedRecurso.nombreRecurso });
    }
    console.log('Partida seleccionada:', selectedRecurso);
  }

  editar(row) {
    console.log(row)
    this._router.navigate(['autorizacion-gastos/editar-autorizacion-gasto/', this.id, row.idAutorizacionGasto]);
  }

 

 /* 
  async getFiltraRecursosAturorizacionGasto(resetPage: boolean = false) {
    try {

      const data = {
        idAutorizacionGasto: this.idAutorizacionGasto,
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
        this.totalElements = oRespL.data.length;

        this.dataSource = new MatTableDataSource(this.proyectos);
        this.dataSource.sort = this.sort; // 🔥 Habilitar ordenación
        this.dataSource._updateChangeSubscription(); // 🔥 Refrescar tabla

        this.cdr.detectChanges(); // 🔥 Asegurar actualización de la UI
      }
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
    }
  } */
  async descargarAutorizacion(row) { 
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
        this.excelService.exportToExcelAutorizaciondeGasto(oRespL.data, "AUTORIZACION DE GASTO - "+this.titulo);

        this.dataSource._updateChangeSubscription(); // 🔥 Refrescar tabla

        this.cdr.detectChanges(); // 🔥 Asegurar actualización de la UI
      }
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
    }
   }

  async verProyecto(id) {
    const data = { idProyecto: id }
    const roresp = await lastValueFrom(this.maestraService.verProyecto(data))
    console.log(roresp)

    if (roresp) {
      this.titulo = "PROYECTO TAMBO:" + roresp.data[0].tambo
      console.log(this.titulo)
    }
  }

  async eliminarAutorizacion(row) {
    const confirmado = await this.dataModal(522, 'Eliminar Solicitud de Autorizacion de Gasto', 'Deseas eliminar esta solicitud?', 'warning');
    if (confirmado) {
      const data = {
        idAutorizacionGasto: row.idAutorizacionGasto
      }

      const response = await this.maestraService.setEliminarAutorizacionGasto(data).toPromise();
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

  async solicitarAutorizacion(row){
    const confirmado = await this.dataModal(600, 'Solicitar Autorización de Gasto', '¿Deseas solicitar la autorización de gasto?', 'approve');
    if (confirmado) {
      const data = {
        idAutorizacionGasto: row.idAutorizacionGasto,
        cidEstadoAG: "002",
        observacion:"Solicitar Autorización de Gasto desde el Residente"
      }    
      const response = await this.maestraService.solicitarAutorizacionGastoResidente(data).toPromise();     
      if (response) {
        this.getFiltrarProyectos()
      }
    } 
   }
   salir(){
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
        observacion:"Aprobado desde el Supervisor"
      } 
      const response = await this.maestraService.solicitarAutorizacionGastoResidente(data).toPromise();     
      if (response) {
        this.getFiltrarProyectos()
      }
    } 
  }

    validarusuario(){
      if(Session.identity.rol=='UPS-RESIDENTE-PROYECTO' ){
        this.isSupervisor= false;
        this.isResidente = true

      }
     // this.isBotonesGestion= false;

      if (Session.identity.rol=='UPS-SUPERVISOR-PROYECTO' ) {
        this.isResidente = false
        this.isSupervisor = true

      }

      if (
        Session.identity.rol !== 'UPS-RESIDENTE-PROYECTO' &&
        Session.identity.rol !== 'UPS-SUPERVISOR-PROYECTO'
      ) {
        this.isSupervisor = false;
        this.isResidente = false;
      }

    } 

    async getEstados(){

      const response = await this.maestraService.getEstadosAutorizacion().toPromise();     
      if (response) {
        this.estados = response.data.response
      }

      
    }
   
}

