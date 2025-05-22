import { ChangeDetectorRef, Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
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
import { ArchivosService } from 'app/modules/maestras/archivos.service';
import { PreliquidacionService } from 'app/modules/maestras/preliquidacion.service';
import { Session } from 'app/core/auth/Session';
import { ExcelPreliquidacionService } from 'app/modules/maestras/excel.preliquidacion.service';

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

  displayedColumnsEstadoFinaciero = [
    'codigo', 'nombreControlAvanceFinanciero', 'montoAsignado', 'mesActual', 'ejecucionActual', 'acciones'
  ];
  dataSource = new MatTableDataSource<any>();
  dataSourceEstadoFinaciero = new MatTableDataSource<any>();

  titulo: ''
  filterForm: FormGroup;
  selectedFiles: { idArchivo: number, name: string, file?: File, path?: string, server?: boolean }[] = [];

  idProyecto: string;
  totalElements: any;
  // En la definición:
  //idValorizacionObra: string | number = 0;
  idValorizacionAvanceObra: string | number = 0;
  idPreliquidacion: string | number = 0;
  cidEstadoPreliquidacion: string = ""

  isAdministrador: boolean;
  isSupervisor: boolean = false
  isResidente: boolean = false
  isPEP: boolean = false;
  nombreEstadoPreliquidacion: any;
  constructor(
    private maestraService: MaestrasService,
    private cdr: ChangeDetectorRef,
    private _matDialog: MatDialog,
    private excelService: ExcelPreliquidacionService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private location: Location,
    private archivoService: ArchivosService,
    private preliquidacionService: PreliquidacionService

  ) {


    this.idProyecto = this.route.snapshot.paramMap.get('idProyecto'); // Obtiene el ID de la URL
    this.idPreliquidacion = this.route.snapshot.paramMap.get('idPreliquidacion') ?? '0';
    this.inicioproyecto()

  }

  async inicioproyecto(){
  await  this.validarusuario()
    
    this.mostarEstadoActualPreliquidacion()

   
    if (this.idPreliquidacion != "0") {
      setTimeout(() => {
        this.optnerValorizacionAvanceObra()
      }, 1500);
    } else {
      this.getFiltraPartidasPreliquidacion()
    }

    this.filterForm = this.fb.group({
      archivo: [[], [Validators.required, Validators.minLength(3)]]
    });
    // || this.isPEP || this.isSupervisor
  }
  async optnerValorizacionAvanceObra() {
    const data = {
      idProyecto: this.idProyecto,
      idPreliquidacion: this.idPreliquidacion,
    }
    const oRespL = await lastValueFrom(
      this.maestraService.optnerValorizacionAvanceObra(
        data
      )

    );
    if (oRespL) {
      this.idValorizacionAvanceObra = oRespL.data.idValorizacionAvanceObra
      this.idPreliquidacion = oRespL.data.idPreliquidacion
      localStorage.setItem('idValorizacionAvanceObra', oRespL.data.idValorizacionAvanceObra);
      localStorage.setItem('idPreliquidacion', oRespL.data.idPreliquidacion);
      localStorage.setItem('idProyecto', oRespL.data.idProyecto);

      this.getFiltraPartidasPreliquidacion()
      console.log(oRespL)
      this.listarArchivosPreliquidacion()
      this.mostarEstadoActualPreliquidacion()
    }
  }

  async mostarEstadoActualPreliquidacion() {
    const data = {
    ///  idProyecto: this.idProyecto,
      idPreliquidacion: this.idPreliquidacion,
    }
    const oRespL = await lastValueFrom(
      this.preliquidacionService.mostarEstadoActualPreliquidacion(
        data
      )
    );
    if (oRespL) {
      this.cidEstadoPreliquidacion = oRespL.data.response.cidEstado
      this.nombreEstadoPreliquidacion = oRespL.data.response.nombreEstado
      console.log(oRespL)

    }
  }


  ngOnInit() {
    console.log(this.idProyecto)
  }

  aplicarFiltro(event: Event) {
    const filtroValor = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filtroValor.trim().toLowerCase();
  }


  calcularTotalCalculado(): number {
    return this.dataSourceEstadoFinaciero?.data
      .reduce((sum, row) => sum + (Number(row.total) || 0), 0) || 0;
  }
  async getFiltraPartidasPreliquidacion(mantenerFiltro: boolean = true) {
    this.idPreliquidacion = localStorage.getItem('idPreliquidacion') ?? '0';
    this.idValorizacionAvanceObra = localStorage.getItem('idValorizacionAvanceObra') ?? '0';
    this.mostarEstadoActualPreliquidacion()

    try {
      const currentFilter = mantenerFiltro ? this.dataSource?.filter : '';
      const data = {
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
        );
      }
    
      console.log(oRespL.data)
      //   this.dataSource = oRespL.data ;
      this.dataSource = new MatTableDataSource(oRespL.data);

      if (this.idPreliquidacion != "0") {
        this.getListarAvanceFinancieroAsignado()
  
      }



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
    console.log(row)
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
    console.log(idProyecto, idPartida, idSubPartida, metrado, valor, totalCalculado)
    // Obtener valores de localStorage (como string) o usar '0' si son null
    this.idValorizacionAvanceObra = localStorage.getItem('idValorizacionAvanceObra') ?? '0';
    this.idPreliquidacion = localStorage.getItem('idPreliquidacion') ?? '0';

    const data = {
      idProyecto,
      idPartida,
      idSubPartida,
      metrado,
      valor,
      totalCalculado,
      idValorizacionObra: this.idValorizacionAvanceObra,
      idPreliquidacion: this.idPreliquidacion,
    };
    console.log(data)
    const response = await this.maestraService.setRegistrarAvanceObra(data).toPromise();

    // Actualizar localStorage y propiedades con los nuevos valores
    const { idValorizacionObra, idPreliquidacion } = response.data.response;
    localStorage.setItem('idValorizacionAvanceObra', idValorizacionObra);
    localStorage.setItem('idPreliquidacion', idPreliquidacion);
    this.idValorizacionAvanceObra = idValorizacionObra;
    this.idPreliquidacion = idPreliquidacion;
    this.getListarAvanceFinancieroAsignado()
    this.mostarEstadoActualPreliquidacion()

  }

  async getListarAvanceFinancieroAsignado(mantenerFiltro: boolean = true) {
    // const idAutorizacionGasto = localStorage.getItem('idAutorizacionGasto');
    try {
      //   const currentFilter = mantenerFiltro ? this.dataSource?.filter : '';
      const data = {
        
        idPreliquidacion: this.idPreliquidacion,
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

  agregarManiefiestoGastos(data) {
    this.idValorizacionAvanceObra = localStorage.getItem('idValorizacionAvanceObra') ?? '0';
    this.idPreliquidacion = localStorage.getItem('idPreliquidacion') ?? '0';

    console.log('Ver detalles de: ', data);
    const dialogRef = this._matDialog.open(ManifiestoGastoComponent, {
      autoFocus: false,
      width: '90%',
      //  height: '90%', // opcional
      data: {
        proyecto: data,
        idPreliquidacion: this.idPreliquidacion,
        title: "",
        type: 'create'
      },

    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log("Diálogo cerrado con resultado:", result);
      this.getListarAvanceFinancieroAsignado()
      if (result === 'success') {
        //  this.getFiltrarProyectos(); // Ejemplo: Llamar a una función de actualización
      }
    });
  }

  async onFileSelected(event: any): Promise<void> {
    const files: FileList = event.target.files;
    const newFiles = Array.from(files);

    // Agregar nuevos archivos evitando duplicados por nombre
    newFiles.forEach(newFile => {
      const exists = this.selectedFiles.some(f => f.name === newFile.name && !f.server);
      if (!exists) {
        this.selectedFiles.push({
          name: newFile.name,
          file: newFile,
          server: false,
          idArchivo: 0
        });
      }
    });

    // Actualiza el formulario si es necesario
    this.filterForm.patchValue({ archivo: this.selectedFiles });
    this.filterForm.get('archivo')?.updateValueAndValidity();

    const detalle = {
      idPreliquidacion: this.idPreliquidacion,
    };

    console.log('Detalle:', detalle);

    const formData = new FormData();
    formData.append(
      'detalle',
      new Blob([JSON.stringify(detalle)], { type: 'application/json' })
    );

    // Adjunta solo los archivos nuevos
    this.selectedFiles.forEach(fileObj => {
      if (!fileObj.server && fileObj.file) {
        formData.append('archivos', fileObj.file); // "archivos" debe coincidir con backend
      }
    });

    try {
      const response = await this.maestraService.guardarArchivosPreliquidacion(formData).toPromise();
      console.log('Respuesta:', response);

      // Opcional: actualizar lista desde servidor
      await this.listarArchivosPreliquidacion();
    } catch (error) {
      console.error('Error al subir archivos:', error);
    }

    // Limpiar el input por si el usuario sube el mismo archivo otra vez
    event.target.value = null;
  }

  async listarArchivosPreliquidacion() {
    this.selectedFiles = []
    const data = {
      idPreliquidacion: this.idPreliquidacion
    };
    const response = await this.maestraService.listarArchivosPreliquidacion(data).toPromise();

    if (response?.data.response) {
      const archivosDesdeServidor = response.data.response.map(archivo => ({
        name: archivo.txtNombre,
        size: archivo.numSize,
        server: true,
        path: archivo.txtPath,
        idArchivo: archivo.idArchivo
      }));

      // Puedes combinar con los archivos nuevos si es necesario
      this.selectedFiles = [...this.selectedFiles, ...archivosDesdeServidor];
    }
  }

  async removeFile(index: number): Promise<void> {
    const file = this.selectedFiles[index];
    console.log(file)
    // Si es un archivo del servidor, llama al backend para eliminarlo
    if (file.server && file.path) {
      try {
        const confirmDelete = confirm(`¿Deseas eliminar el archivo "${file.name}" del servidor?`);
        if (!confirmDelete) return;

        const data = {
          idPreliquidacion: this.idPreliquidacion,
          nombreArchivo: file.name,
          path: file.path,
          idArchivo: file.idArchivo
        };

        const resp = await this.maestraService.eliminarArchivoPreliquidacion(data).toPromise();

        console.log('Archivo eliminado del servidor:', resp);
      } catch (error) {
        console.error('Error al eliminar archivo del servidor:', error);
        return; // Detiene eliminación local si falla en backend
      }
    }

    // Eliminar del array local
    this.selectedFiles.splice(index, 1);

    // Actualizar el form
    this.filterForm.patchValue({ archivo: this.selectedFiles });
    if (this.selectedFiles.length < 3) {
      this.filterForm.get('archivo')?.setErrors({ minFiles: true });
    } else {
      this.filterForm.get('archivo')?.setErrors(null);
    }
    this.filterForm.get('archivo')?.updateValueAndValidity();
  }

  salir() {
    localStorage.removeItem('idValorizacionAvanceObra');
    localStorage.removeItem('idPreliquidacion');
    this.location.back(); // Vuelve a la página anterior
  }

  async descargarArchivo(index: number): Promise<void> {
    const file = this.selectedFiles[index];

    if (!file?.server || !file.path) {
      console.warn('Archivo inválido o no proviene del servidor');
      return;
    }

    const archivoPayload = {
      idPreliquidacion: this.idPreliquidacion,
      idArchivo: file.idArchivo,
      txtNombre: file.name,
      txtPath: file.path
    };

    try {
      await this.archivoService.descargar(archivoPayload);
    } catch (error) {
      console.error('Error al descargar archivo del servidor:', error);
    }
  }

  async solicitarPreliquidacionResidente() {
    const confirmDelete = confirm(`¿Deseas solicitar al supervisor?`);
    if (!confirmDelete) return;
    const data = {
      idPreliquidacion: this.idPreliquidacion,
      cidEstado: "002"
    };
    console.log(data)
    try {

      await this.preliquidacionService.cambiarEstadoPreliquidacion(data).toPromise();// this.preliquidacionService.(archivoPayload);
      this.mostarEstadoActualPreliquidacion()

    } catch (error) {
      console.error('Error al solicitar:', error);
    }
  }
  async solicitarPreliquidacionSupervisor(){
    const confirmDelete = confirm(`¿Deseas solicitar al supervisor?`);
    if (!confirmDelete) return;
    const data = {
      idPreliquidacion: this.idPreliquidacion,
      cidEstado: "004"
    };
    console.log(data)
    try {

      await this.preliquidacionService.cambiarEstadoPreliquidacion(data).toPromise();// this.preliquidacionService.(archivoPayload);
      this.mostarEstadoActualPreliquidacion()

    } catch (error) {
      console.error('Error al solicitar:', error);
    }
  }

  async observar(){
    const confirmDelete = confirm(`¿Deseas observar Preliquidacion?`);
    if (!confirmDelete) return;
    const data = {
      idPreliquidacion: this.idPreliquidacion,
      cidEstado: "003"
    };
    console.log(data)
    try {

      await this.preliquidacionService.cambiarEstadoPreliquidacion(data).toPromise();// this.preliquidacionService.(archivoPayload);
      this.mostarEstadoActualPreliquidacion()

    } catch (error) {
      console.error('Error al solicitar:', error);
    }
  }
  async solicitarPep(){
    const confirmDelete = confirm(`¿Deseas solicitar al PEP?`);
    if (!confirmDelete) return;
    const data = {
      idPreliquidacion: this.idPreliquidacion,
      cidEstado: "004"
    };
    console.log(data)
    try {

      await this.preliquidacionService.cambiarEstadoPreliquidacion(data).toPromise();// this.preliquidacionService.(archivoPayload);
      this.mostarEstadoActualPreliquidacion()

    } catch (error) {
      console.error('Error al solicitar:', error);
    }
  }
  async aprobadoPep(){
    const confirmDelete = confirm(`¿Deseas aprobar solicitud?`);
    if (!confirmDelete) return;
    const data = {
      idPreliquidacion: this.idPreliquidacion,
      cidEstado: "005"
    };
    console.log(data)
    try {

      await this.preliquidacionService.cambiarEstadoPreliquidacion(data).toPromise();// this.preliquidacionService.(archivoPayload);
      this.mostarEstadoActualPreliquidacion()

    } catch (error) {
      console.error('Error al solicitar:', error);
    }
  }

  async exporManiefiestoGasto(row) {
    const data = {
      idAutorizacionGasto: row.idAutorizacionGasto,
      idProyecto: row.idProyecto
    }
   /* const response = await this.maestraService.anexo23AutorizacionGasto(data).toPromise();
    const dataExcel = {
      row: row,
      response: response.data.response
    } */
   let prueba =[]
    this.excelService.exporManiefiestoGasto(prueba)

  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
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

}
