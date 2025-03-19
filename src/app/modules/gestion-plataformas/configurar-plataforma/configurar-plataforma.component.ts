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

  constructor(
    private fb: FormBuilder,
    private maestraService: MaestrasService,
    private _fuseConfirmationService: FuseConfirmationService,
    private _formBuilder: UntypedFormBuilder,
    public matDialogRef: MatDialogRef<RegistroComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.FormRegistro = this.fb.group({

    });
  }

  ngOnInit() {
    console.log(this.data.proyecto.idProyecto);
    this.title = this.data.title;
    this.isEdit = this.data.type == 'edit' ? true : false;
    console.log(this.isEdit);
    if (this.isEdit) {
      //this.cargarDatos(this.data.proyecto);
    }
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

      /*       actions: this._formBuilder.group({
          confirm: this._formBuilder.group({
              show: false,
              label: 'Remove',
              color: 'warn',
          }),
          cancel: this._formBuilder.group({
              show: true,
              label: 'Cancel',
          }),
      }), */
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

  save() { this.uploadFile() }
  cancelar() { this.matDialogRef.close() }
}
