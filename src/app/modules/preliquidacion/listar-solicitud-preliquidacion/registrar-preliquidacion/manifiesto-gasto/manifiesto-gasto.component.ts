import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-manifiesto-gasto',
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
  templateUrl: './manifiesto-gasto.component.html',
  styleUrl: './manifiesto-gasto.component.scss'
})
export class ManifiestoGastoComponent {

  titulo:string
  filterForm: UntypedFormGroup;
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  displayedColumns: string[] = ['nr', 'fecha', 'clase', 'nrDocumento', 'razonSocial', 'concepto', 'importe','observaciones', 'acciones'];
  footerColumns: string[] = ['totalLabel', 'totalValue'];

  constructor(
/*    private cdr: ChangeDetectorRef,
    private _fuseConfirmationService: FuseConfirmationService,
    private _matDialog: MatDialog,
    private maestraService: MaestrasService, */
    private fb: FormBuilder,
/*    private _formBuilder: UntypedFormBuilder,
    private excelService: ExcelService,
    private route: ActivatedRoute,
    private _router: Router,
    private location: Location */
    //private _notesService: NotesService
  ) {

  }

  async ngOnInit() {
    this.filterForm = this.fb.group({
      fecha:["", Validators.required],
      clase:["", Validators.required],
      numero:["", Validators.required],
      razonSocial:["", Validators.required],
      concepto:["", Validators.required],
      importe:["", Validators.required],
      observaciones:["", Validators.required] 
    });
  }

  salir(){}
  setRegistrarAutorizacionGasto(){}
  limpiar(){}
  getTotalCost(){}
}
