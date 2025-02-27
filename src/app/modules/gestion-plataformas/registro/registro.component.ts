import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
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
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-registro',
    templateUrl: './registro.component.html',
    styleUrls: ['./registro.component.css'],
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
export class RegistroComponent implements OnInit {
    FormRegistro: UntypedFormGroup;
    //departamentos: string[] = ['Lima', 'Arequipa', 'Cusco'];
    //provincias: string[] = ['Provincia 1', 'Provincia 2', 'Provincia 3'];
    //distritos: string[] = ['Distrito 1', 'Distrito 2', 'Distrito 3'];
    //centrosPoblados: string[] = ['CP 1', 'CP 2', 'CP 3'];
    //  estados: string[] = ['Activo', 'Inactivo'];
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
    constructor(
        private fb: FormBuilder,
        private maestraService: MaestrasService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        public matDialogRef: MatDialogRef<RegistroComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any
    ) {
        this.FormRegistro = this.fb.group({
            cui: ['', Validators.required],
            ubigeoCp: [''],
            ubigeo_distrito: [''],
            departamento: ['', Validators.required],
            provincia: [''],
            distrito: [''],
            centroPoblado: [''],
            tambo: [''],
            convenio: [''],
            estado: ['', Validators.required],
            masivo: [false], // 👈 Checkbox agregado con valor por defecto
            archivo: [null], // Campo para el archivo
            longX: [''],
            latY: [''],
            idProyecto: [''],
        });

        this.getDepartamentos();
        this.getEstados();
    }

    ngOnInit() {
        console.log(this.data);
        this.title = this.data.title;
        this.isEdit = this.data.type == 'edit' ? true : false;
        console.log(this.isEdit);
        if (this.isEdit) {
            this.cargarDatos(this.data.proyecto);
        }
    }
    cargarDatos(proyecto) {
        this.FormRegistro.get('cui').setValue(proyecto.cui);
        this.FormRegistro.get('ubigeoCp').setValue(proyecto.ubigeoCp);

        console.log('Buscando:', proyecto.ubigeoCp);
        this.getDetalleCentrosPoblados(proyecto.ubigeoCp);
        this.FormRegistro.get('ubigeoCp').setValue(proyecto.ubigeoCp);
        this.FormRegistro.get('tambo').setValue(proyecto.tambo);
        this.FormRegistro.get('convenio').setValue(proyecto.convenio);
        this.FormRegistro.get('estado').setValue(+proyecto.idEstado);
        this.FormRegistro.get('latY').setValue(proyecto.latitud);
        this.FormRegistro.get('longX').setValue(proyecto.longitud);
        this.FormRegistro.get('idProyecto').setValue(proyecto.idProyecto);
    }
    async save() {
        const data = this.FormRegistro.getRawValue();
        console.log('Valores del formulario:', data);
        let oRespL;
        if (this.isEdit) {
            oRespL = await lastValueFrom(
                this.maestraService.getEditaPlataformas(data)
            );
        } else {
            if (this.isMasivo) {
                console.log(this.selectedFile);
                oRespL = await this.uploadFile();
                
            } else {
                oRespL = await lastValueFrom(
                    this.maestraService.getCrearPlataformas(data)
                );
            }
        }

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
    }

    async uploadFile() {
        if (!this.selectedFile) {
            console.error('No se ha seleccionado ningún archivo.');
            return;
        }

        const formData = new FormData();
        formData.append('file', this.selectedFile);
        console.log(formData);
        const oRespL = await lastValueFrom(
            this.maestraService.getLerrExcel(formData)
        );
        console.log(oRespL);
        return oRespL;
    }

    isMasivoSelect() {
        if (this.FormRegistro.value.masivo) {
            console.log('Se agregará masivo:', this.FormRegistro.value);
            this.isMasivo = true;
            // Hacer que el archivo sea obligatorio si "Masivo" está activado
            this.FormRegistro.get('archivo')?.setValidators([
                Validators.required,
            ]);
        } else {
            console.log('Se agregará individual:', this.FormRegistro.value);
            this.isMasivo = false;
            // Eliminar la validación si "Masivo" está desactivado
            this.FormRegistro.get('archivo')?.clearValidators();
        }
        this.FormRegistro.get('archivo')?.updateValueAndValidity();
    }
    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            console.log('Archivo adjuntado:', file.name);

            // Deshabilitar requeridos en otros campos
            this.FormRegistro.get('cui')?.clearValidators();
            this.FormRegistro.get('departamento')?.clearValidators();
            this.FormRegistro.get('estado')?.clearValidators();

            // Hacer que el archivo sea obligatorio
            this.FormRegistro.get('archivo')?.setValidators([
                Validators.required,
            ]);

            // Guardar el archivo en el formulario
            this.FormRegistro.patchValue({ archivo: file });
            this.FormRegistro.get('archivo')?.updateValueAndValidity();
        }
        // Actualizar las validaciones para que tomen efecto
        Object.keys(this.FormRegistro.controls).forEach((field) => {
            this.FormRegistro.get(field)?.updateValueAndValidity();
        });
    }

    // Función para eliminar el archivo seleccionado
    removeFile() {
        this.selectedFile = null;

        console.log('Archivo eliminado');
        // this.FormRegistro.get('archivo')?.setValidators([Validators.required]);

        this.FormRegistro.get('cui')?.setValidators([Validators.required]);
        this.FormRegistro.get('departamento')?.setValidators([
            Validators.required,
        ]);
        this.FormRegistro.get('estado')?.setValidators([Validators.required]);

        // Actualizar las validaciones para que tomen efecto
        Object.keys(this.FormRegistro.controls).forEach((field) => {
            this.FormRegistro.get(field)?.updateValueAndValidity();
        });
    }

    async getDepartamentos() {
        this.departamentos = [];
        const oRespL = await lastValueFrom(
            this.maestraService.getDepartamentos()
        );
        this.departamentos = oRespL.data;
    }

    async getProvincia(departamentoUbigeo) {
        this.provincias = [];
        this.distritos = [];
        this.centrosPoblados = [];
        const oRespL = await lastValueFrom(
            this.maestraService.getProvincias(departamentoUbigeo)
        );
        this.provincias = oRespL.data;
    }
    async getDistrito(provinciaUbigeo) {
        this.distritos = [];
        this.centrosPoblados = [];
        const oRespL = await lastValueFrom(
            this.maestraService.getDistrito(provinciaUbigeo)
        );
        this.distritos = oRespL.data;
    }
    async getCentrosPoblados(distritoUbigeo) {
        this.centrosPoblados = [];
        const oRespL = await lastValueFrom(
            this.maestraService.getCentrosPoblados(distritoUbigeo)
        );
        this.centrosPoblados = oRespL.data;
    }

    async getEstados() {
        this.estados = [];
        const oRespL = await lastValueFrom(this.maestraService.getEstados());
        this.estados = oRespL.data;
    }

    async getDetalleCentrosPoblados(ubigeo) {
        /// this.centrosPoblados = []
        const oRespL = await lastValueFrom(
            this.maestraService.getDetalleCentrosPoblados(ubigeo)
        );
        console.log(oRespL.data);

        var response = oRespL.data[0];
        this.FormRegistro.get('departamento').setValue(
            response.departamentoUbigeo
        );
        this.onDepartamentoChange({ value: response.departamentoUbigeo });
        this.FormRegistro.get('provincia').setValue(response.provinciaUbigeo);
        this.onProvinciaChange({ value: response.provinciaUbigeo });
        this.FormRegistro.get('distrito').setValue(response.distritoUbigeo);
        this.onDistritoChange({ value: response.distritoUbigeo });
        this.FormRegistro.get('centroPoblado').setValue(
            response.centroPobladoUbigeo
        );

        // this.centrosPoblados = oRespL.data
    }

    onDepartamentoChange(event) {
        console.log(event.value);
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
    onBuscar(event: any) {
        const valor = event.target.value.trim();
        if (valor.length > 9) {
            // Evita búsquedas con pocas letras
            console.log('Buscando:', valor);
            this.getDetalleCentrosPoblados(valor);
            this.reset();
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
    cancelar() {
        this.matDialogRef.close('cancelled'); // Envía un estado al cerrar
    }
    reset() {
        if (!this.isEdit) {
            this.FormRegistro.get('estado').setValue('');
            this.FormRegistro.get('longX').setValue('');
            this.FormRegistro.get('latY').setValue('');
            this.FormRegistro.get('tambo').setValue('');
            this.FormRegistro.get('convenio').setValue('');
        }
    }
}
