import { Injectable } from "@angular/core";
//import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx-js-style';


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

exportGastoAutorizacion(response: any): void {
  const worksheetData: any[][] = [];

  // ---------------- CABECERA PRINCIPAL ----------------
  worksheetData.push(["ANEXO N° 23:\nAUTORIZACIÓN DE GASTO"]);
  worksheetData.push([]);
  worksheetData.push(["N° CONVENIO COOPERACIÓN", "", "", "FECHA:", "", "", "N°:"]);
  worksheetData.push(["MONTO DE CONVENIO: S/.", "", "", "SALDO DISPONIBLE (S/.)", "", "", "ANTES DE LA PRESENTE AUTORIZACIÓN"]);
  worksheetData.push(["MONTO ACUMULADO DE AUTORIZACIONES ANTERIORES (S/.)", ""]);
  worksheetData.push([]);
  worksheetData.push(["DETALLE DEL GASTO"]);

  // ---------------- ENCABEZADO DE TABLA ----------------
  worksheetData.push([
    "N°",
    "INSUMO O SERVICIO",
    "UNIDAD",
    "CANTIDAD",
    "PRECIO UNIT. S/.",
    "IMPORTE S/.",
    "RAZÓN SOCIAL O NOMBRE DEL PROVEEDOR",
    "INDICAR FORMA DE PAGO"
  ]);

  // ---------------- FILAS DINÁMICAS ----------------
  response.detalle.forEach((item: any, index: number) => {
    worksheetData.push([
      index + 1,
      item.insumo,
      item.unidad,
      item.cantidad,
      item.precioUnitario,
      item.importe,
      item.razonSocial,
      item.formaPago
    ]);
  });

  const totalRowIndex = worksheetData.length;
  worksheetData.push([]);
  worksheetData.push(["MONTO TOTAL DE ESTA AUTORIZACIÓN", "", "", "", "", response.total]);
  worksheetData.push(["SON:", response.totalEnLetras]);
  worksheetData.push(["(en letras)", ""]);
  worksheetData.push([]);
  worksheetData.push(["SALDO DESPUÉS DE ESTA AUTORIZACIÓN: S/.", ""]);
  worksheetData.push([]);
  worksheetData.push(["PRESIDENTE DEL N.E", "TESORERO DEL N.E", "SECRETARIO N.E (OPCIONAL)"]);
  worksheetData.push(["", "", ""]);
  worksheetData.push(["FISCAL N.E (OPCIONAL)", "RESIDENTE", "APROBACIÓN DEL SUPERVISOR"]);
  worksheetData.push(["", "", ""]);
  worksheetData.push([]);
  worksheetData.push(["El Presidente y/o Tesorero y/o Residente, según sus obligaciones, son responsables de presentar los comprobantes de pago..."]);
  worksheetData.push(["Los montos indicados en la Autorización de Gasto deberán ser compatibles con las cotizaciones previamente realizadas."]);
  worksheetData.push(["El Supervisor es responsable por la revisión, evaluación y conformidad de la presente autorización de gasto."]);

  // ---------------- CONVERTIR A HOJA ----------------
  const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // ---------------- ANCHO DE COLUMNAS ----------------
  worksheet['!cols'] = [
    { wch: 5 },   // N°
    { wch: 40 },  // INSUMO
    { wch: 10 },  // UNIDAD
    { wch: 10 },  // CANTIDAD
    { wch: 15 },  // PRECIO
    { wch: 15 },  // IMPORTE
    { wch: 30 },  // RAZÓN SOCIAL
    { wch: 25 },  // FORMA DE PAGO
  ];

  // ---------------- CELDAS FUSIONADAS ----------------
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    //{ s: { r: 2, c: 0 }, e: { r: 2, c: 2 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } },
//    { s: { r: 2, c: 3 }, e: { r: 2, c: 5 } },
    { s: { r: 3, c: 3 }, e: { r: 3, c: 4 } }, // Fusiona D y E (índice 3 y 4)

    { s: { r: 2, c: 6 }, e: { r: 2, c: 7 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } },
    { s: { r: 3, c: 3 }, e: { r: 3, c: 5 } },
    { s: { r: 3, c: 6 }, e: { r: 3, c: 7 } },
    { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } },
    { s: { r: 6, c: 0 }, e: { r: 6, c: 7 } },
    { s: { r: totalRowIndex + 1, c: 0 }, e: { r: totalRowIndex + 1, c: 4 } },
    { s: { r: totalRowIndex + 2, c: 0 }, e: { r: totalRowIndex + 4, c: 7 } },
    { s: { r: totalRowIndex + 5, c: 0 }, e: { r: totalRowIndex + 5, c: 7 } },
  ];

  // ---------------- APLICAR ESTILOS ----------------
  const range = XLSX.utils.decode_range(worksheet['!ref']!);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = worksheet[cellRef];
      if (!cell) continue;

      const isHeader = R === 7;
      const isTitle = R === 0;

      cell.s = {
        border: {
          top: { style: "thin", color: { auto: 1 } },
          bottom: { style: "thin", color: { auto: 1 } },
          left: { style: "thin", color: { auto: 1 } },
          right: { style: "thin", color: { auto: 1 } },
        },
        alignment: {
          vertical: "center",
          horizontal: isTitle ? "center" : "left",
          wrapText: true,
        },
        font: {
          name: "Arial",
          sz: isTitle ? 14 : 10,
          bold: isHeader || isTitle
        },
        fill: isHeader
          ? { fgColor: { rgb: "BDD7EE" } }
          : undefined
      };
    }
  }

  // ---------------- GENERAR Y DESCARGAR ----------------
  const workbook: XLSX.WorkBook = {
    Sheets: { 'Autorización de Gasto': worksheet },
    SheetNames: ['Autorización de Gasto']
  };

  const excelBuffer: any = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
    cellStyles: true
  });

  const blob: Blob = new Blob([excelBuffer], {
    type: 'application/octet-stream'
  });

  saveAs(blob, 'Autorizacion_Gasto.xlsx');
}

}