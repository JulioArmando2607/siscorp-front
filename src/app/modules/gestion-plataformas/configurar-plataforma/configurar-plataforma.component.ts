import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MaestrasService } from 'app/modules/maestras/maestras.service';
import { RegistroComponent } from '../registro/registro.component';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-configurar-plataforma',
  templateUrl: './configurar-plataforma.component.html',
  styleUrl: './configurar-plataforma.component.scss',
  standalone: true,
  imports: [
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatOptionModule,
    TextFieldModule,
    CommonModule,
  ],
})
export class ConfigurarPlataformaComponent {
  FormRegistro: UntypedFormGroup;
  isMasivo: boolean = false;
  selectedFile: File | null = null; // Para almacenar el archivo seleccionado
  estados: any[];
  centrosPoblados: any[];
  distritos: any[];
  provincias: any[];
  departamentos: any[];
  proyectos: any[];
  configForm: UntypedFormGroup;
  title: any = '';
  isEdit: boolean = false;

  selectedPartidasFile: File | null = null;
  selectedPreciosFile: File | null = null;
  residenteNombre: string = ''
  SupervisorNombre: string = ''
  idRol: any;
  idUsuario: any;
  idProyecto: any;
  idUsuarioSupervisor: any;
  idRolSupervisor: any;
  idUsuarioResidente: any;
  idRolResidente: any;
  constructor(
    private fb: FormBuilder,
    private maestraService: MaestrasService,
    private _fuseConfirmationService: FuseConfirmationService,
    private _formBuilder: UntypedFormBuilder,
    public matDialogRef: MatDialogRef<RegistroComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.FormRegistro = this.fb.group({
      dniSupervisor: "",
      dniResidente: ""
    });
  }

  ngOnInit() {
    console.log(this.data.proyecto.idProyecto);
    this.idProyecto = this.data.proyecto.idProyecto
    this.title = this.data.title;
    this.isEdit = this.data.type == 'edit' ? true : false;
    console.log(this.isEdit);
    if (this.isEdit) {
      //this.cargarDatos(this.data.proyecto);
    }
    this.listarUsuarios()
  }

  async validarDniResidente() {
    this.residenteNombre = "";
    const dniSupervisor = this.FormRegistro.get("dniSupervisor")?.value;
    const dniResidente = this.FormRegistro.get("dniResidente")?.value;

    if (!dniResidente || dniSupervisor === dniResidente) {
      this.mostrarError("El DNI no puede ser el mismo que el del supervisor ni estar vacío");
      return;
    }

    try {
      const oRespL = await lastValueFrom(this.maestraService.getConsultaUsuarioDni(dniResidente));

      if (!oRespL?.data || oRespL.data.length === 0) {
        this.mostrarError("El DNI no está registrado en nuestras bases de datos.");
        return;
      }

      this.idRolResidente = oRespL.data[0]?.idRol
      this.idUsuarioResidente = oRespL.data[0]?.idUsuario
      this.residenteNombre = `Residente: ${oRespL.data[0]?.empleado || "No disponible"}`;
    } catch (error) {
      console.error("Error en la consulta del DNI:", error);
      this.mostrarError("Ocurrió un error al validar el DNI del residente. Intente nuevamente.");
    }
  }


  async eliminarResidente() {
    console.log("eliminar supervisor", this.idUsuarioSupervisor);
    const data ={
      idUsuario: this.idUsuarioResidente,
      idProyecto: this.idProyecto,
    }
    const oRespL = await lastValueFrom(this.maestraService.eliminarUsuarioProyecto(data));
    if (oRespL) {
      this.FormRegistro.get("dniResidente").setValue("");
      this.residenteNombre = "";  
    } 
  }

  async eliminarSupervisor() {
    console.log("eliminar supervisor", this.idUsuarioSupervisor);
    const data ={
      idUsuario: this.idUsuarioSupervisor,
      idProyecto: this.idProyecto,
    }
    const oRespL = await lastValueFrom(this.maestraService.eliminarUsuarioProyecto(data));
    if (oRespL) {
      this.FormRegistro.get("dniSupervisor").setValue("");
      this.SupervisorNombre = "";  
    }
 
  }

  async validarDniSupervisor() {
    this.SupervisorNombre = "";
    const dniResidente = this.FormRegistro.get("dniResidente")?.value;
    const dniSupervisor = this.FormRegistro.get("dniSupervisor")?.value;

    if (!dniSupervisor || dniResidente === dniSupervisor) {
      this.mostrarError(
        "El DNI no puede ser el mismo que el del residente ni estar vacío"
      );
      return;
    }

    try {
      const oRespL = await lastValueFrom(this.maestraService.getConsultaUsuarioDni(dniSupervisor));

      if (!oRespL?.data || oRespL.data.length === 0) {
        this.mostrarError(
          "El DNI no está registrado en nuestras bases de datos. Favor de enviar un correo al administrador"
        );
        return;
      }

      this.idRolSupervisor = oRespL.data[0]?.idRol
      this.idUsuarioSupervisor = oRespL.data[0]?.idUsuario

      this.SupervisorNombre = `Supervisor: ${oRespL.data[0]?.empleado || "No disponible"}`;
    } catch (error) {
      console.error("Error en la consulta del DNI:", error);
      this.mostrarError("Ocurrió un error al validar el DNI del supervisor. Intente nuevamente.");
    }
  }

  private mostrarError(mensaje: string) {
    this.dataModal(300, 'Error!', mensaje);
    this.FormRegistro.get("dniSupervisor")?.setValue("");
    this.SupervisorNombre = "";
  }

  onFileSelected(event: Event, tipo: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      if (tipo === 'partidas') {
        this.selectedPartidasFile = input.files[0];
      } else if (tipo === 'precios') {
        this.selectedPreciosFile = input.files[0];
      }
    }
  }

  removeFile(tipo: string): void {
    if (tipo === 'partidas') {
      this.selectedPartidasFile = null;
    } else if (tipo === 'precios') {
      this.selectedPreciosFile = null;
    }
  }


  async uploadFile() {
    if (!this.selectedPartidasFile || !this.selectedPreciosFile) {
      console.error('Se deben seleccionar ambos archivos.');
      return;
    }

    const formData = new FormData();
    //SI QUIERO PASARLE EL ID DEL PROYECTO?

    formData.append('idProyecto', this.data.proyecto.idProyecto);
    formData.append('partidas', this.selectedPartidasFile);
    formData.append('precios', this.selectedPreciosFile);

    try {
      console.log('Enviando archivos:', this.selectedPartidasFile.name, this.selectedPreciosFile.name);

      // Llamar al servicio correctamente con ambos archivos
      const oRespL = await lastValueFrom(
        this.maestraService.getEnviarPartidasExcel(formData)
      );

      console.log('Respuesta del servidor:', oRespL);

      console.log(oRespL.data.codResultado);
      if (oRespL.data.codResultado == 200) {
        this.dataModal(
          oRespL.data.codResultado,
          'Exito!',
          oRespL.data.msgResultado
        );
        this.matDialogRef.close('success'); // Enviar un resultado al modal padre

      } else if (oRespL.data.codResultado == 400) {
        this.dataModal(
          oRespL.data.codResultado,
          'Error!',
          oRespL.data.msgResultado
        );
      } else {
        this.dataModal(
          oRespL.data.codResultado,
          'Error!',
          oRespL.data.msgResultado
        );
      }
      // return response;

    } catch (error) {
      console.error('Error al subir los archivos:', error);
      return null;
    }
  }

  dataModal(codigo, title, message) {
    const actions =
      codigo === 200
        ? {
          cancel: this._formBuilder.group({
            show: false,
            label: 'Cancelar',
          }),
          confirm: this._formBuilder.group({
            show: false,
            label: 'Remove',
            color: 'warn',
          }),
        }
        : {
          cancel: this._formBuilder.group({
            show: true,
            label: 'Cancelar',
          }),
          confirm: this._formBuilder.group({
            show: false,
            label: 'Remove',
            color: 'warn',
          }),
        };

    this.configForm = this._formBuilder.group({
      title: title,
      message: message,
      icon: this._formBuilder.group({
        show: true,
        name:
          codigo === 200
            ? 'heroicons_outline:check-circle'
            : 'heroicons_outline:exclamation-triangle',
        color: codigo === 200 ? 'primary' : 'warn',
      }),
      actions: this._formBuilder.group(actions),
      dismissible: true,
    });
    this.openConfirmationDialog(codigo);
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

  async save() {
    const data = [
      {
        idUsuario: this.idUsuarioResidente, // Obtenido del input después de validación
        idRol: this.idRolResidente, // Rol del residente
        idProyecto: this.idProyecto // Proyecto seleccionado
      },
      {
        idUsuario: this.idUsuarioSupervisor, // Obtenido del input después de validación
        idRol: this.idRolSupervisor, // Rol del supervisor
        idProyecto: this.idProyecto
      }
    ];
    const oRespL = await lastValueFrom(this.maestraService.registrarResidenteSupervisor(data));
    console.log(oRespL)
    if (oRespL) {
      this.dataModal(oRespL.data.codResultado, 'Exit!', oRespL.data.msgResultado);
      this.matDialogRef.close('success'); // Enviar un resultado al modal padre
    }

  }

  async listarUsuarios() {
    try {
      const oRespL = await lastValueFrom(this.maestraService.listarUsuarioProyecto(this.idProyecto));
      console.log(oRespL);

      if (oRespL && oRespL.data) {
        // Filtrar Residente
        const residente = oRespL.data.find(user => user.rolDescripcion === "UPS-RESIDENTE-PROYECTO");
        console.log(residente)
        if (residente) {
          this.idUsuarioResidente = residente.idUsuario;
          this.idRolResidente = residente.idRol;
          this.residenteNombre = `Residente: ${residente.empleado || "No disponible"}`;
          this.FormRegistro.get("dniResidente").setValue(residente.numeroDocumento);
        }

        // Filtrar Supervisor
        const supervisor = oRespL.data.find(user => user.rolDescripcion === "UPS-SUPERVISOR-PROYECTO");
        if (supervisor) {
          this.idUsuarioSupervisor = supervisor.idUsuario;
          this.idRolSupervisor = supervisor.idRol;
          this.SupervisorNombre = `Supervisor: ${supervisor.empleado || "No disponible"}`;
          this.FormRegistro.get("dniSupervisor").setValue(supervisor.numeroDocumento);
        } 
      }
    } catch (error) {
      console.error("Error al listar usuarios:", error);
    }
  }

  cancelar() { this.matDialogRef.close() }
 

}
