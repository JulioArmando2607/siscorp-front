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
    const fechaOriginal = response.row.fechaRegistro;
    const fecha = new Date(fechaOriginal);

    // Formato: DD/MM/YYYY
    const fechaFormateada = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;

    const worksheetData: any[][] = [];

    // ---------------- CABECERA PRINCIPAL ----------------
    worksheetData.push(["ANEXO N° 23: AUTORIZACIÓN DE GASTO"]);
    worksheetData.push([`N°: ${response.response.total}`]);
    //worksheetData.push([]);
    worksheetData.push(["N° CONVENIO COOPERACIÓN", "", "", `FECHA: ${fechaFormateada}`, "", "", ""]);
    worksheetData.push(["MONTO DE CONVENIO: S/.", "", "", "SALDO DISPONIBLE (S/.)", "", "", "ANTES DE LA PRESENTE AUTORIZACIÓN"]);
    worksheetData.push(["MONTO ACUMULADO DE AUTORIZACIONES ANTERIORES (S/.)", ""]);
    worksheetData.push([]);
    worksheetData.push(["DETALLE DEL GASTO"]);

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

    response.response.detalle.forEach((item: any, index: number) => {
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

    worksheetData.push([
      "MONTO TOTAL DE ESTA AUTORIZACIÓN", "", "", "", "", `S/. ${response.response.total}`, "", ""
    ]);
    worksheetData.push([
      `Son ${response.response.totalEnLetras}`, "", "", "", "", "SALDO DESPUÉS DE ESTA AUTORIZACIÓN:", "", ""
    ]);
    worksheetData.push([
      "(en letras)", "", "", "", "", "S/.", "-", ""
    ]);

    worksheetData.push([]);
    worksheetData.push([]);
    worksheetData.push([]);
    worksheetData.push([]);


    const firmasRow = worksheetData.length;

    worksheetData.push(["PRESIDENTE DEL N.E", "TESORERO DEL N.E", "SECRETARIO N.E (OPCIONAL)", ""]);
    worksheetData.push([]);
    worksheetData.push([]);
    worksheetData.push(["FISCAL N.E (OPCIONAL)", "RESIDENTE", "APROBACIÓN DEL SUPERVISOR", ""]);

    worksheetData.push([]);
    worksheetData.push([]);

    const notasInicioRow = worksheetData.length;

    worksheetData.push(["El Presidente y/o Tesorero y/o Residente, según sus obligaciones, son responsables de presentar los comprobantes de pago...", "", "", "", "", "", "", ""]);
    worksheetData.push(["Los montos indicados en la Autorización de Gasto deberán ser compatibles con las cotizaciones previamente realizadas.", "", "", "", "", "", "", ""]);
    worksheetData.push(["El Supervisor es responsable por la revisión, evaluación y conformidad de la presente autorización de gasto.", "", "", "", "", "", "", ""]);

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(worksheetData);

    worksheet['!cols'] = [
      { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 },
      { wch: 10 }, { wch: 10 }, { wch: 30 }, { wch: 25 }
    ];

    worksheet['!merges'] = [
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }, //N°

      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } },
      { s: { r: 2, c: 6 }, e: { r: 2, c: 7 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } },
      { s: { r: 3, c: 3 }, e: { r: 3, c: 4 } },
      { s: { r: 3, c: 6 }, e: { r: 3, c: 7 } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } },
      { s: { r: 6, c: 0 }, e: { r: 6, c: 7 } },
      { s: { r: totalRowIndex, c: 0 }, e: { r: totalRowIndex, c: 4 } },
      { s: { r: totalRowIndex + 1, c: 0 }, e: { r: totalRowIndex + 1, c: 3 } },
      { s: { r: totalRowIndex + 1, c: 5 }, e: { r: totalRowIndex + 1, c: 5 } },
      { s: { r: totalRowIndex + 2, c: 0 }, e: { r: totalRowIndex + 2, c: 4 } },
      { s: { r: notasInicioRow, c: 0 }, e: { r: notasInicioRow, c: 7 } },
      { s: { r: notasInicioRow + 1, c: 0 }, e: { r: notasInicioRow + 1, c: 7 } },
      { s: { r: notasInicioRow + 2, c: 0 }, e: { r: notasInicioRow + 2, c: 7 } }
    ];

    const range = XLSX.utils.decode_range(worksheet['!ref']!);

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellRef];
        if (!cell) continue;

        const isTitle = R === 0;
        const isNmr = R === 1;
        const isHeader = R === 7;
        const isTotalRow = R >= totalRowIndex && R <= totalRowIndex + 2;
        const isNotaFinal = R >= notasInicioRow;
        // const isFirmaLabelRow = R === firmasRow;
        // const isFirmaLabelRow = R === firmasRow + 3;
        const isFirmaLineRow = (R === firmasRow + 1 || R === firmasRow + 3);

        const isFirmaLabelRow = R === firmasRow || R === firmasRow + 3;

        let border: any = {};

        /*     if (isFirmaLineRow && [0, 1, 2, 6].includes(C)) {
               border = {
                 bottom: { style: "thin", color: { auto: 1 } }
               };
             } */

        if (isNotaFinal) {
          border = {};
        }

        cell.s = {
          border,
          alignment: {
            vertical: "center",
            horizontal: isTitle || isNmr || isHeader || isTotalRow || isFirmaLabelRow || isNotaFinal || isFirmaLineRow ? "center" : "left",
            wrapText: true,
          },
          font: {
            name: "Arial",
            sz: isTitle ? 14 : 10,
            bold: isTitle || isHeader || isTotalRow || isFirmaLabelRow,
          },
          fill: (isHeader || isTotalRow) ? { fgColor: { rgb: "BDD7EE" } } : undefined,
        };
      }
    }

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

    saveAs(blob, 'ANEXO N° 23 AUTORIZACIÓN DE GASTO.xlsx');
  }

  exportControlAutorizaciones(response: any): void {
    const worksheetData: any[][] = [];

    // CABECERA
    worksheetData.push([]); // fila vacía para mejor centrado
    worksheetData.push(["", "", "", "", "ANEXO N° 24: CONTROL DE AUTORIZACIONES PARA ADQUISICIÓN DE INSUMOS"]);
    worksheetData.push([]);
    worksheetData.push(["PROYECTO", '']);
    worksheetData.push(["CONVENIO N°", '']);
    worksheetData.push(["FECHA DE ELABORACIÓN", '']);
    worksheetData.push([]);

    // ENCABEZADO COMPLETO
    worksheetData.push([
      "", "", "", "DATOS SEGÚN EXP. TEC. APROBADO", "", "",
      "ACUMULADO DE AUTORIZACIONES", "", "",
      "SOLICITUD DE AUTORIZ. N° ... ACTUAL", "", "",
      "ACUMULADO ACTUAL", "",
      "SALDO", ""
    ]);

    worksheetData.push([
      "ITEM", "INSUMOS", "UND.",
      "CANT. TOTAL DEL EXP. TEC.", "C.U. S/.", "PARC. S/.",
      "CANT. SOLIC.", "C.U. COTIZADO", "PARC. S/.",
      "CANT. SOLIC.", "C.U.", "PARC. S/",
      "CANT. SOLIC.", "PARC. S/",// "C.U.",
      "CANT.", "PARC. S/"
    ]);

    let totalMontoAsignado = 0;
    let totalMontoAcumulado = 0;
    let totalCUSolicitado = 0;
    let totalParcialCotizado = 0;
    let totalPrecioMontoActual = 0
    let totalSaldo = 0
    // DATOS DE INSUMOS
    const safeDivide = (numerador: number, denominador: number): number =>
      denominador && denominador !== 0 ? numerador / denominador : 0;

    response.response.forEach((item: any, index: number) => {
      worksheetData.push([
        index + 1, item.nombreRecurso, item.unidad,
        item.cantidadAsignado,
        //item.montoAsignado/item.cantidadAsignado, 
        safeDivide(item.montoAsignado, item.cantidadAsignado),

        item.montoAsignado,
        item.cantidadUtilizadoAcumulado,
        safeDivide(item.montoUtilizadoAcumulado, item.cantidadUtilizadoAcumulado),
        //item.montoUtilizadoAcumulado/item.cantidadUtilizadoAcumulado, 
        item.montoUtilizadoAcumulado,

        item.cantidad, item.precio, item.cantidad * item.precio,
        item.cantidad + item.cantidadUtilizadoAcumulado, item.precioCantidad + item.montoUtilizadoAcumulado,
        item.cantidadRestante, item.montoRestante
      ]);
      totalMontoAsignado += item.montoAsignado;
      totalMontoAcumulado += item.montoUtilizadoAcumulado;
      totalCUSolicitado += item.precio;
      totalParcialCotizado += item.cantidad * item.precio;
      totalPrecioMontoActual += item.precioCantidad + item.montoUtilizadoAcumulado;
      totalSaldo += item.montoRestante;
    });

    worksheetData.push(["", "", "", "", "", totalMontoAsignado, "", "", totalMontoAcumulado, "", totalCUSolicitado, totalParcialCotizado, "", totalPrecioMontoActual, "", totalSaldo, response.total]);

    // NOTAS
    worksheetData.push([]);
    worksheetData.push(["(*)", "Este formato Contiene como anexos los siguientes cuadros"]);
    worksheetData.push(["12-A1", "Desagregado de Fierros"]);
    worksheetData.push(["12-A2", "Desagregado de Madera"]);
    worksheetData.push(["12-A3", "Desagregado de Herramientas"]);
    worksheetData.push(["12-A4", "Desagregado Otros insumos"]);

    // FIRMA
    worksheetData.push([]);
    worksheetData.push([]);
    worksheetData.push(["", "", "", "", "", "FIRMA Y SELLO - SUPERVISOR (RESPONSABLE DE LA ELABORACIÓN)", "", "", "", "", "", "", "", "", "", ""]);

    // Convert to worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(worksheetData);

    worksheet['!cols'] = Array(17).fill({ wch: 15 });

    worksheet['!merges'] = [
      { s: { r: 1, c: 4 }, e: { r: 1, c: 11 } },
      { s: { r: 7, c: 3 }, e: { r: 7, c: 5 } },
      { s: { r: 7, c: 6 }, e: { r: 7, c: 8 } },
      { s: { r: 7, c: 9 }, e: { r: 7, c: 11 } },
      { s: { r: 7, c: 12 }, e: { r: 7, c: 13 } },
      { s: { r: 7, c: 14 }, e: { r: 7, c: 15 } },

      // 👇 Este merge abarca F y G para la firma
      { s: { r: worksheetData.length - 1, c: 5 }, e: { r: worksheetData.length - 1, c: 6 } },
      { s: { r: worksheetData.length - 2, c: 5 }, e: { r: worksheetData.length - 2, c: 6 } }
    ];

    const range = XLSX.utils.decode_range(worksheet['!ref']!);
    const firmaRow = worksheetData.length - 1; // es la última fila
    const tituloRow = 1; // es la última fila

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellRef];
        if (!cell) continue;

        const isTitle = R === 1;
        const isHeader1 = R === 7;
        const isHeader2 = R === 8;
        const isFirma = R === firmaRow;
        const isTitulo = R === tituloRow;


        const isTotal = worksheetData[R]?.[C]?.toString().includes("TOTAL") || R === worksheetData.length - 9;

        let fillColor;
        if (isHeader1) fillColor = "B7CDE4"; // encabezado grande
        if (isHeader2 && C >= 3 && C <= 5) fillColor = "A9C4DB"; // EXP TÉC
        if (isHeader2 && C >= 6 && C <= 8) fillColor = "B4D9F7"; // AUT
        if (isHeader2 && C >= 9 && C <= 11) fillColor = "7EA9E1"; // SOLICITUD
        if (isHeader2 && C >= 12 && C <= 13) fillColor = "DDEAD1"; // ACUM
        if (isHeader2 && C >= 14 && C <= 16) fillColor = "B7E3F7"; // SALDO

        if (R === 8 && C <= 2) fillColor = "B7CDE4"; // columna inicial (ITEM - INSUMOS - UND)

        cell.s = {
          font: {
            name: 'Arial',
            sz: isTitle ? 14 : 10,
            bold: isTitle || isHeader1 || isHeader2 || isTotal,
          },
          alignment: {
            vertical: 'center',
            horizontal: 'center',
            wrapText: true
          },
          fill: fillColor ? { fgColor: { rgb: fillColor } } : undefined,

          border: (isTitulo || isFirma) ? {} : {
            top: { style: "thin", color: { auto: 1 } },
            bottom: { style: "thin", color: { auto: 1 } },
            left: { style: "thin", color: { auto: 1 } },
            right: { style: "thin", color: { auto: 1 } }
          }
        };
      }
    }

    const workbook: XLSX.WorkBook = {
      Sheets: { 'Control de Autorizaciones': worksheet },
      SheetNames: ['Control de Autorizaciones']
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true
    });

    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/octet-stream'
    });

    saveAs(blob, 'ANEXO N° 24 CONTROL DE AUTORIZACIONES PARA ADQUISICIÓN DE INSUMOS.xlsx');
  }

  exportAnexo25(response): void {
    console.log(response.data.response.listamontosValorFinanciadoAG)
    const v001 = response.data.response.listamontosValorFinanciadoAG.find(item => item.cidControlMonitoreo === "001");
    const v002 = response.data.response.listamontosValorFinanciadoAG.find(item => item.cidControlMonitoreo === "002");
    const v003 = response.data.response.listamontosValorFinanciadoAG.find(item => item.cidControlMonitoreo === "003");


    console.log(v001);

    const worksheetData: any[][] = [];
    // ---------- TÍTULO PRINCIPAL ----------
    worksheetData.push([]);
    worksheetData.push(["", "", "", "ANEXO N° 25: CONTROL Y MONITOREO DEL MOVIMIENTO FINANCIERO"]);
    worksheetData.push([""]);
    worksheetData.push(["CONTROL Y MONITOREO DEL MOVIMIENTO FINANCIERO DEL NE"]);
    worksheetData.push(["(El presente formato debe ser presentado por el Profesional en Ejecución de Proyectos en cada Autorización de Gasto)"]);
    // ---------- DATOS DEL PROYECTO ----------
    worksheetData.push(["PROYECTO", "", "", "", "", "", "", "", ""]); // 10 columnas
    worksheetData.push(["NÚMERO CONVENIO", "", "", "", "", ""]);
    worksheetData.push(["CORRESPONDE AL MES", "", "", "AUTORIZACIÓN Nº", "", "", ""]);
    worksheetData.push(["ELABORADO POR EL PEP (NOMBRE)", "", "", "", "", ""]);
    worksheetData.push(["FECHA DE PRESENTACIÓN", "", "", "", "", ""]);
    worksheetData.push([""]);
    worksheetData.push(["", "", "MONTO DE CONVENIO", "", "", `S/. ${v001.monto}`, ""]);
    worksheetData.push(["", "", "MONTO AMPLIACIÓN PRESUPUESTAL", "", "", `S/. ${v002.monto}`, "", "", "Entidad"]);
    worksheetData.push(["", "", "MONTO TOTAL FINANCIADO", "", "", `S/. ${v003.monto}`, "", "", ""]);
    // ---------- CUADRO DE AUTORIZACIONES ----------
    worksheetData.push(["", "AUTORIZACIÓN", "FECHA", "MONTO PARCIAL (S/.)", "MONTO ACUMULADO (S/.)", "SALDO ANTES DE ESTA AUTORIZACIÓN"]);
    let totalMontoAcumulado = 0;
    response.data.response.listaAutorizacionesGasto.forEach(rubro => {
      worksheetData.push([
        "",
        rubro.item,
        rubro.fechaRegistro,
        rubro.montoParcial,
        rubro.montoAcumuladoR,
        rubro.saldoAntesDeAG
      ]);
      totalMontoAcumulado += rubro.montoAcumuladoR;//`FECHA: ${fechaFormateada}`
    });

    worksheetData.push(["", "", "", "Total Autorizado (S/.)", totalMontoAcumulado, ""]);
    worksheetData.push([]);
    const startEncabezado = worksheetData.length;

    console.log(startEncabezado)


    // ---------- ENCABEZADO TABLA PRINCIPAL ----------
    worksheetData.push([
      "ITEM", "RUBROS (Según Expediente Técnico)", "VALOR FINANCIADO (S/.)",
      "GASTOS AUTORIZADOS\n(Según Formato 06)", "",
      "GASTOS EFECTUADOS ACUMULADOS\n(Según última Pre liquidación) (1)", "",
      "PRONUNCIAMIENTO U OBSERVACIONES DEL PEP UPS-PNPAIS"
    ]);

    worksheetData.push([
      "", "", "",
      "ACTUAL (S/)", "(%)",
      "ACUMULADO (S/)", "(%)",
      ""
    ]);

    response.data.response.rubro.forEach((rubro: any, index: number) => {
      worksheetData.push([
        rubro.item,
        rubro.nombreRubro,
        rubro.valorFinanciado,
        rubro.gastoAutorizadoActual,
        rubro.gastoAutorizadoPorcentaje,
        rubro.gastoEfectuadoAcumulado,
        rubro.gastoEfectuadoPorcentaje,
        "",
      ]);

    });

    worksheetData.push([
      "SUB TOTAL INVERSION", "", 1909814.13, "", "", 1910298.08, 100.02, ""
    ]);

    worksheetData.push([
      "7.0", "GASTOS DE SUPERVISION", 50561.79, 208.41, 0.41, 49936.94, 98.76, ""
    ]);

    worksheetData.push([
      "TOTAL INVERSION - MONTO DESEMBOLSADO (autorizado)", "", 1960375.92, 16900.62, 0.86, 1960235.02, 99.99, ""
    ]);

    worksheetData.push([
      "MONTO DEVUELTO A LA CUENTA BANCARIA", "", "", "", "", 25.99, "", ""
    ]);

    worksheetData.push([
      "TOTAL INVERSION - MONTO DESEMBOLSADO (retirado)", "", 1960375.92, 16900.62, 0.86, 1960209.03, 99.99, ""
    ]);

    // ---------- NOTAS Y FIRMAS ----------
    worksheetData.push(["Comentario del PEP: ...", "", "", "", "", "", "", ""]);
    worksheetData.push([]);
    worksheetData.push([]);
    worksheetData.push(["(1) Deberá contener los montos rendidos según la última Pre liquidación presentada más las autorizaciones pendientes de rendir"]);
    worksheetData.push([]);
    worksheetData.push([]);
    worksheetData.push([]);
    worksheetData.push([]);
    worksheetData.push([]);
    worksheetData.push([]);

    worksheetData.push(["", "", "", "Vo.Bo. PROFESIONAL EN GERENCIA DE PROYECTOS", "", "", "", "CONFORMIDAD PROFESIONAL EN EJECUCIÓN DE PROYECTOS"]);
    worksheetData.push(["", "", "", "Fecha:", "", "", "", "Fecha:"]);

    // ---------- CONVERSIÓN Y ESTILO ----------
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(worksheetData);

    worksheet['!cols'] = Array(11).fill({ wch: 18 });
    console.log(worksheetData.length)
    worksheet['!merges'] = [
      { s: { r: 1, c: 3 }, e: { r: 1, c: 9 } },//ANEXO N° 25: CONTROL Y MONITOREO DEL MOVIMIENTO FINANCIERO						
      { s: { r: 3, c: 0 }, e: { r: 3, c: 9 } },//CONTROL Y MONITOREO DEL MOVIMIENTO FINANCIERO DEL NE
      { s: { r: 4, c: 0 }, e: { r: 4, c: 9 } },//(El presente formato debe ser presentado por el Profesional en Ejecución de Proyectos en cada Autorización de Gasto)
      { s: { r: 5, c: 2 }, e: { r: 5, c: 8 } },//proyecto
      { s: { r: 8, c: 2 }, e: { r: 8, c: 4 } },//
      { s: { r: 6, c: 0 }, e: { r: 6, c: 1 } },//
      { s: { r: 7, c: 0 }, e: { r: 7, c: 1 } },//
      { s: { r: 8, c: 0 }, e: { r: 8, c: 1 } },//
      { s: { r: 9, c: 0 }, e: { r: 9, c: 1 } },//
      { s: { r: 11, c: 2 }, e: { r: 11, c: 3 } },//MONTO
      { s: { r: 12, c: 2 }, e: { r: 12, c: 3 } },//MONTO
      { s: { r: 13, c: 2 }, e: { r: 13, c: 3 } },//MONTO

      { s: { r: startEncabezado, c: 3 }, e: { r: startEncabezado, c: 4 } },
      { s: { r: startEncabezado, c: 5 }, e: { r: startEncabezado, c: 6 } },
      { s: { r: startEncabezado, c: 0 }, e: { r: startEncabezado + 1, c: 0 } },
      { s: { r: startEncabezado, c: 1 }, e: { r: startEncabezado + 1, c: 1 } },
      { s: { r: startEncabezado, c: 2 }, e: { r: startEncabezado + 1, c: 2 } },

      { s: { r: worksheetData.length - 17, c: 0 }, e: { r: worksheetData.length - 17, c: 1 } },
      { s: { r: worksheetData.length - 15, c: 0 }, e: { r: worksheetData.length - 15, c: 1 } },
      { s: { r: worksheetData.length - 14, c: 0 }, e: { r: worksheetData.length - 14, c: 1 } },
      { s: { r: worksheetData.length - 13, c: 0 }, e: { r: worksheetData.length - 13, c: 1 } },
      { s: { r: worksheetData.length - 12, c: 0 }, e: { r: worksheetData.length - 12, c: 7 } },

    ];

    const range = XLSX.utils.decode_range(worksheet['!ref']!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellRef];
        if (!cell) continue;

        const isTitle = R === 1;

        //  const isHeader = R === 20 || R === 21;
        const isHeader = R === startEncabezado || R === startEncabezado + 1;

        const celdasConBorde = new Set([
          "5-2", "5-3", "5-4", "5-5", "5-6", "5-7", "5-8", "5-9",
          "6-2",
          "7-2", "7-4",
          "8-2", "8-3", "8-4",
          "9-2",
          "10-2",
          "13-8",
          "16-8",
          "14-1", "14-2", "14-3", "14-4", "14-5",
          /*  "15-1", "15-2", "15-3", "15-4", "15-5",*/
          /* "16-1", "16-2", "16-3", "16-4", "16-5",
           "17-1", "17-2", "17-3", "17-4", "17-5",
           "18-3", "18-4", "18-5",
           "20-0", "20-1", "20-2", "20-3", "20-4", "20-5", "20-6", "20-7", "20-8", "20-9",
           "21-0", "21-1", "21-2", "21-3", "21-4", "21-5", "21-6", "21-7", "21-8", "21-9",*/

        ]);

        const tieneBorde = (fila: number, col: number) => {
          const esEncabezado = fila === startEncabezado || fila === startEncabezado + 1;
          const esParteInterna = fila >= startEncabezado + 2 && fila < worksheetData.length - 13;
          const esTotales = fila === worksheetData.length - 13 || fila === worksheetData.length - 12;

          return (
            celdasConBorde.has(`${fila}-${col}`) ||
            esEncabezado ||
            esParteInterna ||
            esTotales
          );
        };


        cell.s = {
          font: {
            name: 'Arial',
            sz: isTitle ? 14 : 10,
            bold: isTitle || isHeader
          },
          alignment: {
            vertical: 'left',
            horizontal: 'left',
            wrapText: true
          },
          border: tieneBorde(R, C)
            ? {
              top: { style: "thin", color: { auto: 1 } },
              bottom: { style: "thin", color: { auto: 1 } },
              left: { style: "thin", color: { auto: 1 } },
              right: { style: "thin", color: { auto: 1 } }
            }
            : {},
          fill: isHeader ? { fgColor: { rgb: 'BDD7EE' } } : undefined
        };
      }
    }

    const workbook: XLSX.WorkBook = {
      Sheets: { 'Anexo 25': worksheet },
      SheetNames: ['Anexo 25']
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true
    });

    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/octet-stream'
    });

    saveAs(blob, 'ANEXO N° 25 CONTROL Y MONITOREO DEL MOVIMIENTO FINANCIERO.xlsx');
  }

}