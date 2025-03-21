import { Injectable } from "@angular/core";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root',
})

export class ExcelService {
  constructor() { }

  exportToExcel(data: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    saveAs(dataBlob, `${fileName}.xlsx`);
  }

  exportToExcelAutorizaciondeGasto(data: any[], fileName: string): void {
    // Filtrar y transformar los datos con un índice secuencial
    const filteredData = data.map((item, index) => ({
      ITEM: index + 1,
      PARTIDA: item.descripcionPartida,
      INSUMO: item.nombreRecurso,
      UNIDAD: item.unidad,
      CANTIDAD: item.cantidad,
      'PRECIO UNITARIO': item.precio,
      'IMPORTE': item.precioCantidad
    }));

    // Calcular sumas totales
    const totalCantidad = filteredData.reduce((sum, row) => sum + (row.CANTIDAD || 0), 0);
    const totalPrecioUnitario = filteredData.reduce((sum, row) => sum + (row['PRECIO UNITARIO'] || 0), 0);
    const totalImporte = filteredData.reduce((sum, row) => sum + (row.IMPORTE || 0), 0);

    // Agregar fila de totales al final
    const totalRow = {
      ITEM: null as any,  // Se asigna null con "as any" para evitar conflicto de tipos
      PARTIDA: 'TOTAL',
      INSUMO: '',
      UNIDAD: '',
      CANTIDAD: totalCantidad,
      'PRECIO UNITARIO': totalPrecioUnitario,
      'IMPORTE': totalImporte
    };

    filteredData.push(totalRow);

    // Convertir a hoja de Excel
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

    // Generar y descargar el archivo Excel
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    saveAs(dataBlob, `${fileName}.xlsx`);
  }


}