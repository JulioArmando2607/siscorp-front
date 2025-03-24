import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-observar-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h1 mat-dialog-title>{{ data.title }}</h1>
    <div mat-dialog-content>
      <p>{{ data.message }}</p>
      <mat-form-field appearance="fill" style="width: 100%;">
        <mat-label>Motivo de observación</mat-label>
        <textarea matInput [(ngModel)]="comentario" rows="4"></textarea>
      </mat-form-field>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-button (click)="onConfirm()" color="primary" [disabled]="!comentario.trim()">Observar</button>
    </div>
  `
})
export class ObservarDialogComponent {
  comentario: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ObservarDialogComponent>
  ) {}

  onConfirm() {
    this.dialogRef.close(this.comentario);
  }

  onCancel() {
    this.dialogRef.close();
  }
}