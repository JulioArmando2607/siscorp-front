import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
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

@Component({
  selector: 'app-registrar-autorizacion-gasto',
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
    MatAutocompleteModule
  ],
  standalone: true, // Declarar como componente standalone
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './registrar-autorizacion-gasto.component.html',
  styleUrl: './registrar-autorizacion-gasto.component.scss'
})
export class RegistrarAutorizacionGastoComponent {
  async descargarExcelProyecto() {
    const roresp = await lastValueFrom(this.maestraService.listarPlataformasExcel(this.filterForm.getRawValue(),
    ))

    console.log(roresp)
    this.excelService.exportToExcel(roresp.data, "DATOS GENERALES");
  }
  displayedColumns: string[] = ['item', 'centroPoblado', 'proyecto', 'recurso', 'und', 'cantidad', 'precio_unitario'];
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
    private route: ActivatedRoute
    //private _notesService: NotesService
  ) {
   
   }
  async ngOnInit() {
    this.filterForm = this.fb.group({
      cantidad: [''],
      precio: [''],
      estado: [0],
      partidaControl: [""],
      recursoControl: [""]
    });

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.getFiltrarProyectos(true)

    this.id = this.route.snapshot.paramMap.get('id'); // Obtiene el ID de la URL
    this.titulo = "PROYECTO TAMBO: NAYAP"

    this.getPartidas(this.id);

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
  async eliminarProyecto(proyecto: any) {
    const confirmado = await this.dataModal(522, 'Eliminar proyecto', 'Deseas eliminar este proyecto?');

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

  dataModal(codigo, title, message): Promise<boolean> {
    return new Promise((resolve) => {
      const actions = {
        cancel: this._formBuilder.group({
          show: true,
          label: 'Cancelar',
        }),
        confirm: this._formBuilder.group({
          show: true,
          label: 'Eliminar',
          color: 'warn',
        }),
      };

      this.configForm = this._formBuilder.group({
        title: title,
        message: message,
        icon: this._formBuilder.group({
          show: true,
          name: codigo === 200 ? 'heroicons_outline:check-circle' : 'heroicons_outline:exclamation-triangle',
          color: codigo === 200 ? 'primary' : 'warn',
        }),
        actions: this._formBuilder.group(actions),
        dismissible: true,
      });

      // Abrir el diálogo y esperar la respuesta del usuario
      const dialogRef = this._fuseConfirmationService.open(this.configForm.value);

      dialogRef.afterClosed().subscribe((result) => {
        resolve(result === 'confirmed'); // Si el usuario confirma, retorna true; si cancela, retorna false
      });
    });
  }

  descargarProyectos() { }

  async getDepartamentos() {
    this.departamentos = []
    const oRespL = await lastValueFrom(
      this.maestraService.getDepartamentos()
    );
    this.departamentos = oRespL.data
  }

  async getProvincia(departamentoUbigeo) {
    this.provincias = []
    this.distritos = []
    this.centrosPoblados = []
    const oRespL = await lastValueFrom(
      this.maestraService.getProvincias(departamentoUbigeo)
    );
    this.provincias = oRespL.data
  }
  async getDistrito(provinciaUbigeo) {
    this.distritos = []
    this.centrosPoblados = []
    const oRespL = await lastValueFrom(
      this.maestraService.getDistrito(provinciaUbigeo)
    );
    this.distritos = oRespL.data
  }
  async getCentrosPoblados(distritoUbigeo) {
    this.centrosPoblados = []
    const oRespL = await lastValueFrom(
      this.maestraService.getCentrosPoblados(distritoUbigeo)
    );
    this.centrosPoblados = oRespL.data
  }

  filtrar() {
    const filtros = this.filterForm.getRawValue();
    console.log('Valores del formulario:', filtros);
  }

  limpiar() {
    this.filterForm.reset()
    //this.getFiltrarProyectos()
  }
 
  onDepartamentoChange(event) {
    const departamentoSeleccionado = event.value;
    this.getProvincia(departamentoSeleccionado);
  }
  onProvinciaChange(event) {
    const provinciaSeleccionado = event.value;
    this.getDistrito(provinciaSeleccionado);
  }
  onDistritoChange(event) {
    const distritoSeleccionado = event.value;
    this.getCentrosPoblados(distritoSeleccionado);
  }




  async getFiltrarProyectos(resetPage: boolean = false) {
    try {
      if (resetPage) {
        this.pageIndex = 0; // 🔥 Reinicia la página al filtrar
      }

      const oRespL = await lastValueFrom(
        this.maestraService.getFiltrarProyectos(
          this.filterForm.getRawValue(),
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

}

