import { ChangeDetectorRef, Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ActivatedRoute } from '@angular/router';
import { ExcelService } from 'app/modules/maestras/excel.service';
import { lastValueFrom } from 'rxjs';
import { MaestrasService } from 'app/modules/maestras/maestras.service';
import { ManifiestoGastoComponent } from './manifiesto-gasto/manifiesto-gasto.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-registrar-preliquidacion',
  standalone: true,
  imports: [MatTabsModule, MatCardModule, MatButtonToggleModule,
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
    MatDatepickerModule,
    FormsModule
  ],
  templateUrl: './registrar-preliquidacion.component.html',
  styleUrls: ['./registrar-preliquidacion.component.scss']
})
export class RegistrarPreliquidacionComponent {

  displayedColumns = [
    'codigo', 'descripcion', 'unidad', 'cantidad', 'costo_unitario',
    'precio_parcial', 'metrado_anterior', 'valor_anterior', 'metrado', 'valor',
    'total_calculado',
    'porcentaje', 'acciones'
  ];

  
  displayedColumnsEstadoFinaciero= [
    'codigo', 'nombreControlAvanceFinanciero', 'montoAsignado', /*'cantidad', 'costo_unitario',
    'precio_parcial', 'metrado_anterior', 'valor_anterior', 'metrado', 'valor',
    'total_calculado',
    'porcentaje', */ 'acciones'
  ];
  // dataSource: MatTableDataSource<any>;
  dataSource = new MatTableDataSource<any>();
  dataSourceEstadoFinaciero = new MatTableDataSource<any>();

  titulo: ''
  selectedFiles: File[] = [];
  idProyecto: string;
  totalElements: any;
  // En la definición:
  idValorizacionObra: string | number;
  idPreliquidacion: string | number;

  constructor(
    private maestraService: MaestrasService,
    private cdr: ChangeDetectorRef,
    private _matDialog: MatDialog,

    /*  
       private _fuseConfirmationService: FuseConfirmationService,
       private _matDialog: MatDialog,
       private maestraService: MaestrasService,
       private fb: FormBuilder,
       private _formBuilder: UntypedFormBuilder, */
    private excelService: ExcelService,
    private route: ActivatedRoute,
    /*    private _router: Router,
        private location: Location */
    //private _notesService: NotesService
  ) {
    console.log("aqio toy")
  }

  ngOnInit() {
    console.log("aqio toy")
    this.idProyecto = this.route.snapshot.paramMap.get('idProyecto'); // Obtiene el ID de la URL
    console.log(this.idProyecto)
    this.getFiltraPartidasPreliquidacion()
    this.getListarAvanceFinancieroAsignado()
  }

  salir() { }

  aplicarFiltro(event: Event) {
    const filtroValor = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filtroValor.trim().toLowerCase();
  }
  onFileSelected(event) { }
  solicitarAutorizacion() { }
  calcularTotalCalculado(): number {
    return this.dataSource?.data
      .reduce((sum, row) => sum + (Number(row.total) || 0), 0) || 0;
  }
  async getFiltraPartidasPreliquidacion(mantenerFiltro: boolean = true) {
    // const idAutorizacionGasto = localStorage.getItem('idAutorizacionGasto');
    const idPreliquidacion = 0;
    try {
      const currentFilter = mantenerFiltro ? this.dataSource?.filter : '';
      const data = {
        // idAutorizacionGasto: this.idAutorizacionGasto,
        idPreliquidacion: idPreliquidacion,
        idProyecto: this.idProyecto
      }
      const oRespL = await lastValueFrom(
        this.maestraService.listaPartidadPreliquidacion(
          data
        )
      );
      console.log(oRespL.data)
      //   this.dataSource = oRespL.data ;
      this.dataSource = new MatTableDataSource(oRespL.data);


    } catch (error) {
      console.error('Error al obtener proyectos:', error);
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

  recalcularTotalmontos(row) {

    const metrado = Number(row.metrado);
    const valor = Number(row.valor);
    const parcial = Number(row.precioParcial);

    if (!isNaN(metrado) && !isNaN(valor) && valor > 0) {
      row.totalCalculadoActual = metrado * valor;

      if (!isNaN(row.totalCalculadoActual) && !isNaN(parcial) && parcial > 0) {
        row.porcentajeUso = (row.totalCalculadoActual / parcial) * 100;

        this.guardar(this.idProyecto, row.idPartida, row.idSubPartida, metrado, valor, row.totalCalculadoActual)

      }

    } else {
      row.totalCalculadoActual = 0;
    }
  }
  async guardar(idProyecto, idPartida, idSubPartida, metrado, valor, totalCalculado) {
    // Obtener valores de localStorage (como string) o usar '0' si son null
    this.idValorizacionObra = localStorage.getItem('idValorizacionObra') ?? '0';
    this.idPreliquidacion = localStorage.getItem('idPreliquidacion') ?? '0';

    const data = {
      idProyecto,
      idPartida,
      idSubPartida,
      metrado,
      valor,
      totalCalculado,
      idValorizacionObra: this.idValorizacionObra,
      idPreliquidacion: this.idPreliquidacion,
    };

    const response = await this.maestraService.setRegistrarAvanceObra(data).toPromise();

    // Actualizar localStorage y propiedades con los nuevos valores
    const { idValorizacionObra, idPreliquidacion } = response.data.response;
    localStorage.setItem('idValorizacionObra', idValorizacionObra);
    localStorage.setItem('idPreliquidacion', idPreliquidacion);
    this.idValorizacionObra = idValorizacionObra;
    this.idPreliquidacion = idPreliquidacion;

  }

  async getListarAvanceFinancieroAsignado(mantenerFiltro: boolean = true) {
    // const idAutorizacionGasto = localStorage.getItem('idAutorizacionGasto');
    const idPreliquidacion = 0;
    try {
   //   const currentFilter = mantenerFiltro ? this.dataSource?.filter : '';
      const data = {
        idPreliquidacion: idPreliquidacion,
        idProyecto: this.idProyecto
      }
      const oRespL = await lastValueFrom(
        this.maestraService.listarAvanceFinancieroAsignado(
          data
        )
      );
      console.log(oRespL.data)
      this.dataSourceEstadoFinaciero = new MatTableDataSource(oRespL.data);
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
    }
  }

  agregarManiefiestoGastos(data){
    console.log('Ver detalles de: ',data);
     const dialogRef = this._matDialog.open(ManifiestoGastoComponent, {
      autoFocus: false,
      width: '90%',
    //  height: '90%', // opcional
      data: {
        proyecto: data,
        title: "",
        type: 'create'
      },

    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log("Diálogo cerrado con resultado:", result);

      if (result === 'success') {
      //  this.getFiltrarProyectos(); // Ejemplo: Llamar a una función de actualización
      }
    });
  }


}
