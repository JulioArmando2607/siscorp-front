import { Injectable } from "@angular/core";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({
    providedIn: 'root',
  })

  export class ExcelService {
    constructor() {}
  
    exportToExcel(data: any[], fileName: string): void {
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
  
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const dataBlob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  
      saveAs(dataBlob, `${fileName}.xlsx`);
    }
  }