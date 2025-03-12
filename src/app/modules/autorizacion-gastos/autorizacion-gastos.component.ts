import { CommonModule } from '@angular/common';
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
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { lastValueFrom } from 'rxjs';
import { MaestrasService } from '../maestras/maestras.service';
import { ExcelService } from '../maestras/excel.service';

@Component({
  selector: 'app-autorizacion-gastos',
  standalone: true, // Declarar como componente standalone
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './autorizacion-gastos.component.html',
  styleUrl: './autorizacion-gastos.component.scss',
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
  ],
})

export class AutorizacionGastosComponent {
  async descargarExcelProyecto() {
    const roresp = await lastValueFrom(this.maestraService.listarPlataformasExcel(this.filterForm.getRawValue(),
    ))

    console.log(roresp)
    this.excelService.exportToExcel(roresp.data, "DATOS GENERALES");
  }
  displayedColumns: string[] = ['item', 'cui', 'ubigeoCp', 'departamento', 'provincia', 'distrito', 'centroPoblado', 'tambo', 'estado', 'acciones'];
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

  constructor(
    private cdr: ChangeDetectorRef,
    private _fuseConfirmationService: FuseConfirmationService,
    private _matDialog: MatDialog,
    private maestraService: MaestrasService,
    private fb: FormBuilder,
    private _formBuilder: UntypedFormBuilder,
    private excelService: ExcelService
    //private _notesService: NotesService
  ) {
    this.filterForm = this.fb.group({
      cui: [''],
      ubigeoCp: [''],
      ubigeo_distrito: [''],
      departamento: [0], // Número en lugar de string si idDepartamento es numérico
      provincia: [0],
      distrito: [0],
      centroPoblado: [0],
      plataforma: [""],
      numeroConvenio: [""],
      estado: [0],
      //  masivo: [false], // 👈 Checkbox agregado con valor por defecto
      //  archivo: [null] // Campo para el archivo

    });
    //this.getFiltrarProyectos()
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.getDepartamentos()
    this.getFiltrarProyectos(true)
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
  /*
    agregarProyecto(note) {   
      const dialogRef = this._matDialog.open(RegistroComponent, {
        autoFocus: false,
        disableClose: false,
        data: {
          note: cloneDeep(note),
            title: "REGISTRAR PROYECTO",
          type:'create'
        },
      });
      // Acción cuando se cierra el modal
      dialogRef.afterClosed().subscribe((result) => {
        console.log("Diálogo cerrado con resultado:", result);
        // Aquí puedes hacer lo que necesites después del cierre
        if (result === 'success') {
          this.getFiltrarProyectos(); // Ejemplo: Llamar a una función de actualización
        }
      });
    }
     */
  descargarProyectos() { }

  /*  openNoteDialog(note): void {
      this._matDialog.open(RegistroComponent, {
        autoFocus: false,
        data: {
          note: cloneDeep(note),
        },
      });
  
      this._matDialog.afterAllClosed().subscribe((result) => {
        
        console.log(result);
      });
    } */

  /*   openNoteDialog(note): void {
      const dialogRef = this._matDialog.open(RegistroComponent, {
        autoFocus: false,
        disableClose: false,
        data: {
          note: cloneDeep(note),
        },
      });
  
      // Acción cuando se cierra el modal
      dialogRef.afterClosed().subscribe((result) => {
        console.log("Diálogo cerrado con resultado:", result);
  
        // Aquí puedes hacer lo que necesites después del cierre
        if (result === 'success') {
          this.getFiltrarProyectos(); // Ejemplo: Llamar a una función de actualización
        }
      });
    } */

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

  // Variables de paginación
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0; // Página actual
  /*
  async getFiltrarProyectos() {
    try {
        const oRespL = await lastValueFrom(this.maestraService.getFiltrarProyectos(this.filterForm.getRawValue(), this.pageIndex, this.pageSize));
  
        if (oRespL?.data?.content) {
            this.proyectos = oRespL.data.content;
            this.totalElements = oRespL.data.totalElements;
            
            this.dataSource = new MatTableDataSource(this.proyectos);
          //  this.dataSource.paginator = this.paginator; // 🔥 Conectar paginador
             this.dataSource.sort = this.sort; // 🔥 Habilitar ordenación
            this.dataSource._updateChangeSubscription(); // 🔥 Refrescar tabla
  
            this.cdr.detectChanges(); // 🔥 Asegurar actualización de la UI
        }
    } catch (error) {
        console.error('Error al obtener proyectos:', error);
    }
  }
  */

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


}

