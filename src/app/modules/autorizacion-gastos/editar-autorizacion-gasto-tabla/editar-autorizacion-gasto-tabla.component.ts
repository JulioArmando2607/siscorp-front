import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ExcelService } from 'app/modules/maestras/excel.service';
import { MaestrasService } from 'app/modules/maestras/maestras.service';
import { BehaviorSubject, lastValueFrom, map, Observable, startWith, switchMap } from 'rxjs';
@Component({
  selector: 'app-editar-autorizacion-gasto-tabla',
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
  templateUrl: './editar-autorizacion-gasto-tabla.component.html',
  styleUrl: './editar-autorizacion-gasto-tabla.component.scss'
})
export class EditarAutorizacionGastoTablaComponent {

  idPartidaSeleccionada: any;
  idRecursoSeleccionado: any;
  idAutorizacionGasto: any = null;
  isEditar: boolean;
  idAutorizacionGastoRecurso: any;
  idHistorialPrecio: any;
  autorizacionGasto: any;
  async descargarExcelProyecto() {
    const roresp = await lastValueFrom(this.maestraService.listarPlataformasExcel(this.filterForm.getRawValue(),
    ))

    console.log(roresp)
    this.excelService.exportToExcel(roresp.data, "DATOS GENERALES");
  }
  displayedColumns = [
    'recurso', 'und', 'monto_total_asignada', 'cantidad_total_asignada',
    'parcial_segun_cotizacion', 'cantidad_solicitada',
    'monto_restante', 'cantidad_restante', 'precio_unitario', 'cantidad',
    'total_calculado', 'monto_utilizado', //'cantidad_utilizado', 
    'porcentaje', 'acciones'
  ];

  footerColumns: string[] = ['totalLabel'];//, 'totalValue' 

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  filterForm: UntypedFormGroup;
  dataSource: MatTableDataSource<any>;
 
  proyectos: any[]
  configForm: UntypedFormGroup;
  id: string | null = null;
  titulo: string;

  partidas: any[] = []
  partidasFiltradas!: Observable<any[]>; // Observable para filtrar en memoria
  recursosFiltradas!: Observable<any[]>; // Observable para filtrar en memoria
  partidasSubject = new BehaviorSubject<any[]>([]); // Para manejar el filtrado en memoria
  recursos: any;
  recursosSubject: any;
  // Variables de paginación
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0; // Página actual
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
    private location: Location
    //private _notesService: NotesService
  ) {

  }
  async ngOnInit() {
    this.filterForm = this.fb.group({

      estado: [0],

      partidaControl: ["", Validators.required],  // ✅ Campo obligatorio
      recursoControl: ["", Validators.required],  // ✅ Campo obligatorio
      cantidad: ["", [Validators.required, Validators.min(1)]],  // ✅ Mayor a 0
      precio: ["", [Validators.required, Validators.min(0.01)]]  // ✅ Mayor a 0.01
    });


    this.id = this.route.snapshot.paramMap.get('id'); // Obtiene el ID de la URL
    this.verProyecto(this.id)
    this.idAutorizacionGasto = this.route.snapshot.paramMap.get('ag'); // Obtiene el ID de la URL

    this.getFiltraRecursosAturorizacionGasto(true)

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

  filtrar() {
    const filtros = this.filterForm.getRawValue();
    console.log('Valores del formulario:', filtros);
  }

  limpiar() {
    this.filterForm.reset()
  }
   
  async getFiltraRecursosAturorizacionGasto(mantenerFiltro: boolean = true) {
    try {
      const currentFilter = mantenerFiltro ? this.dataSource?.filter : '';
      const data = {
        idAutorizacionGasto: this.idAutorizacionGasto,
        idProyecto: this.id
      }
      const oRespL = await lastValueFrom(
        this.maestraService.listaRecursosAutorizacionGastoProyecto(
          data
        )
      );

      console.log(oRespL)
      if (oRespL?.data) {
        this.proyectos = oRespL.data.response;
        this.totalElements = oRespL.data.length;
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
      this.idPartidaSeleccionada = selectedPartida.idPartida
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
      this.idRecursoSeleccionado = selectedRecurso.idRecurso
      this.filterForm.patchValue({ recursoControl: selectedRecurso.nombreRecurso });
    }
    console.log('Partida seleccionada:', selectedRecurso);
  }

  async setRegistrarAutorizacionGasto(row) {
    const data = {
      idProyecto: this.id,
      idAutorizacionGasto: this.idAutorizacionGasto,
      idRecurso: row.idRecurso,
      cantidad: row.cantidad,
      precio: row.precio,
      precioCantidad: row.total,
      idAutorizacionGastoRecurso: row.idAutorizacionGastoRecurso,
      idHistorialPrecio: row.idHistorialPrecio,
      montoRestante: row.montoAsignado - (row.montoUtilizado + row.total),
      cantidadRestante: row.cantidadAsignado - (row.cantidadRestante + row.cantidad)
    }

    const response = await this.maestraService.setRegistrarAutorizacionGastoTabla(data).toPromise();
    this.idAutorizacionGasto = response.data.response
    console.log(response.data.response);
    if (response) {
      this.getFiltraRecursosAturorizacionGasto(true)
    }

  }

  validarRecursoSeleccionado(): boolean {
    return this.proyectos.some(proyecto => proyecto.idRecurso === this.idRecursoSeleccionado);
  }
 

  editar(row) {
    this.idAutorizacionGastoRecurso = row.idAutorizacionGastoRecurso
    console.log(row.idAutorizacionGastoRecurso)
    this.isEditar = true
    this.idPartidaSeleccionada = row.idPartida
    this.idRecursoSeleccionado = row.idRecurso
    this.idHistorialPrecio = row.idHistorialPrecio
    this.idAutorizacionGasto = row.idAutorizacionGasto,

      this.filterForm.get("cantidad").setValue(row.cantidad)
    this.filterForm.get("precio").setValue(row.precio)
    this.filterForm.get("partidaControl").setValue(row.descripcionPartida)
    this.onPartidaSelected({ option: { value: this.idPartidaSeleccionada } })
    this.filterForm.get("recursoControl").setValue(row.nombreRecurso)
    this.onRecursoSelected({ option: { value: this.idRecursoSeleccionado } })
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
        this.getFiltraRecursosAturorizacionGasto()
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
        observacion: "Solicitar Autorización de Gasto desde el Residente"
      }
      const response = await this.maestraService.solicitarAutorizacionGastoResidente(data).toPromise();
      if (response) {
        this.salir()
        // this.get()
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
    const row = this.dataSource.filteredData[index]; // <- CAMBIADO AQUÍ

    console.log(row);
    row.total = (row.cantidad || 0) * (row.precio || 0);
    this.dataSource._updateChangeSubscription(); 
    this.guardarActulizar(row);
    
  }

  guardarActulizar(data) {
    console.log(data)
    this.setRegistrarAutorizacionGasto(data)
  }

  getColor(estado: string): string {
    switch (estado.toUpperCase()) {
      case 'VERDE': return '#d4edda';
      case 'AMARILLO': return '#fff3cd';
      case 'ROJO': return '#f8d7da';
      case 'GRIS': return '#e2e3e5';
      default: return 'transparent';
    }
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

}