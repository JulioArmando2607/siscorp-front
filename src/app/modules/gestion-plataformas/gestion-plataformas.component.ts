import { Component, ViewChild, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

// Importar módulos de Angular Material necesarios
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { cloneDeep } from 'lodash';
import { RegistroComponent } from './registro/registro.component';
import { lastValueFrom } from 'rxjs';
import { MaestrasService } from '../maestras/maestras.service';
import { FormBuilder, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { Platform } from '@angular/cdk/platform';

@Component({
  selector: 'gestion-plataformas',
  standalone: true, // Declarar como componente standalone
  templateUrl: './gestion-plataformas.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./gestion-plataformas.component.css'],
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
export class GestionPlataformasComponent implements OnInit {
  displayedColumns: string[] = ['cui','ubigeoCp', 'departamento', 'provincia', 'distrito', 'centroPoblado','tambo', 'estado', 'acciones'];
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
  constructor(

    private _matDialog: MatDialog,
    private maestraService: MaestrasService,
    private fb: FormBuilder
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
    this.getFiltrarProyectos()
  }


  editar(proyecto: any) {
    console.log('Ver detalles de:', proyecto);
    this._matDialog.open(RegistroComponent, {
      autoFocus: false,
      data: {
        note: cloneDeep(proyecto),
        title:"EDITAR PROYECTO",
        type:'edit'
      },
    });
  }

  eliminarProyecto(proyecto: any) {
    console.log('Eliminar proyecto:', proyecto);
  }
  agregarProyecto(note) {
    this._matDialog.open(RegistroComponent, {
      autoFocus: false,
      data: {
        note: cloneDeep(note),
        title: "REGISTRAR PROYECTO",
        type:'create'
      },
    });
  }
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

  openNoteDialog(note): void {
    const dialogRef = this._matDialog.open(RegistroComponent, {
      autoFocus: false,
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
  }

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

  async getFiltrarProyectos() {
    const filtros = this.filterForm.getRawValue();
    console.log("Filtros enviados:", filtros);

    try {
        const oRespL = await lastValueFrom(this.maestraService.getFiltrarProyectos(filtros));

        if (oRespL && oRespL.data && oRespL.data.content) {
            this.proyectos = oRespL.data.content;
            console.log("Datos recibidos:", this.proyectos);

            this.dataSource = new MatTableDataSource(this.proyectos);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;

            this.dataSource._updateChangeSubscription(); // 🔥 Forzar actualización
        } else {
            console.warn("No se encontraron proyectos.");
            this.dataSource = new MatTableDataSource([]);
            this.dataSource._updateChangeSubscription();
        }

        console.log("DataSource después de asignar:", this.dataSource);

    } catch (error) {
        console.error('Error al obtener proyectos:', error);
        this.dataSource = new MatTableDataSource([]);
        this.dataSource._updateChangeSubscription();
    }
}


}



// Datos de prueba
const PROYECTOS = [
  { cui: '123456', departamento: 'Lima', provincia: 'Lima', distrito: 'Miraflores', centroPoblado: 'CP1', estado: 'Aprobado' },
  { cui: '789012', departamento: 'Cusco', provincia: 'Urubamba', distrito: 'Ollantaytambo', centroPoblado: 'CP2', estado: 'Pendiente' }
];
