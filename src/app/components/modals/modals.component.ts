import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.css']
})
export class ModalsComponent {
  mensaje?: string;
  btn='Aceptar';
  
  constructor(public dialogRef: MatDialogRef<ModalsComponent>, @Inject(MAT_DIALOG_DATA) public data: any){
    this.mensaje=data.mensaje;
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
