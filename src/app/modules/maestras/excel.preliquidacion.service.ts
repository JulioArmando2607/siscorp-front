import { Injectable } from "@angular/core";
import { Session } from "app/core/auth/Session";
//import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx-js-style';


@Injectable({
  providedIn: 'root',
})

export class ExcelPreliquidacionService {
  constructor() { }

  export26(analisis: any): void {
    const worksheetData: any[][] = [];
    // CABECERA
    worksheetData.push([]); // fila vacía para mejor centrado
    worksheetData.push(["", "", "", "", "ANEXO N° 26: VALORIZACIÓN DEL AVANCE DE OBRA"]);
    worksheetData.push([]);
    worksheetData.push(["", "", "", "", "VALORIZACIÓN DEL AVANCE DE OBRA N: ................."]);
    worksheetData.push([]);
    worksheetData.push(["", "", "", "", "", "", "", "AL..../..../....", '']);
    worksheetData.push([]);
    worksheetData.push(["CONVENIO N°", '', '', '', '', '', '', '', 'CUI', '', '', 'CORRESPONDIENTE AL MES DE', '', '', '', '', '', '']);
    worksheetData.push(["", '', '', '', '', '', '', '', '', '', '', 'FECHA DE PRESENTACIÓN', '', '', '', '', '', '', '']);
    worksheetData.push(["PROYECTO", '', '', '', '', '', '', '', '', '', '', 'FECHA DE PRESENTACIÓN', '', '', '', '', '', '', '']);
    worksheetData.push(["", '', '', '', '', '', '', '', '', '', '', 'MONTO FINANCIADO', '', '', '', '', '', '', '']);
    worksheetData.push(["", '', '', '', '', '', '', '', '', '', '', 'PLAZO DE EJECUCIÓN', '', '', '', '', '', '', '']);
    worksheetData.push(["", '', '', '', '', '', '', '', '', '', '', 'FECHA DE TERMINO PREVISTA', '', '', '', '', '', '', '']);
    worksheetData.push([]);
    worksheetData.push([]);

    // ENCABEZADO COMPLETO
    worksheetData.push([
      "PARTIDAS", "DESCRIPCIÓN", "PRESUPUESTO", "", "", "", "AVANCES",
      "", "", "", "", "", "",
      "SALDO", "", "",
    ]);

    worksheetData.push([
      "", "", "", "", "", "", "ANTERIOR",
      "", "ACTUAL", "", "ACUMULADO", "", "",
      "", "", ""
    ]);


    worksheetData.push([
      "", "",
      "UND.", "MET", "P.UNIT", "PRESU",
      "MET", "VAL",
      "MET", "VAL",
      "MET", "VAL", "%",
      "MET", "VAL", "%"
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

    analisis.forEach((item: any, index: number) => {
      /*PRESUPUESTO				AVANCES							SALDO		
				ANTERIOR		ACTUAL		ACUMULADO					
UND.	MET	P.UNIT	PRESU	MET	VAL	MET	VAL	MET	VAL	%	MET	VAL	%
 */
      worksheetData.push([
        item.codigo,
        item.descripcion,
        item.unidad,//UND.
        item.cantidad, //MET
        item.costoUnitario,//P.UNIT 
        item.precioParcial, //PRESU

        item.metradoAnterior, 
        item.valorAnterior,

        item.metrado, 
        item.totalCalculadoActual,

        item.metradoAcumulado, 
        item.acumulado, 

        item.porcentajeAcumulado,

        ((+item.cantidad) - ((+item.metradoAcumulado ))),
        ((+item.precioParcial) - ((+item.acumulado))),
        0
        /* */
      ]);

    });

    worksheetData.push(["", "COSTO DIRECTO AVANCE FISICO %", "", "", "", totalMontoAsignado, "", "", totalMontoAcumulado, "", totalCUSolicitado, totalParcialCotizado, "", totalPrecioMontoActual, "", totalSaldo]);
    worksheetData.push([]);
    worksheetData.push([]);
    worksheetData.push([]);
    worksheetData.push(["", "_____________________________________", "", "", "", "", "_________________________", "", "", "", "", "_________________________", "", "", "", ""]);
    worksheetData.push(["", "V°B° PROFESIONAL EN EJECUCION DE PROYECTOS (PEP)", "", "", "", "", "ELABORADO POR: RESIDENTE", "", "", "", "", "APROBADO POR: SUPERVISOR", "", "", "", "", "", ""]);
    const totalRowIndex = worksheetData.length;
    console.log(totalRowIndex)
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(worksheetData);

    worksheet['!merges'] = [
      //ANEXO N° 26: VALORIZACIÓN DEL AVANCE DE OBRA
      { s: { r: 1, c: 4 }, e: { r: 1, c: 11 } },
      //VALORIZACIÓN DEL AVANCE DE OBRA N: .................
      { s: { r: 3, c: 4 }, e: { r: 3, c: 11 } },
      //AL..../..../....
      { s: { r: 5, c: 7 }, e: { r: 5, c: 11 } },
      //CONVENIO N°
      { s: { r: 7, c: 1 }, e: { r: 7, c: 7 } },
      //PROYECTO
      { s: { r: 9, c: 1 }, e: { r: 9, c: 9 } },
      ////CORRESPONDIENTE AL MES DE
      { s: { r: 7, c: 11 }, e: { r: 7, c: 13 } },
      { s: { r: 8, c: 11 }, e: { r: 8, c: 13 } },
      { s: { r: 9, c: 11 }, e: { r: 9, c: 13 } },
      { s: { r: 10, c: 11 }, e: { r: 10, c: 13 } },
      { s: { r: 11, c: 11 }, e: { r: 11, c: 13 } },
      { s: { r: 12, c: 11 }, e: { r: 12, c: 13 } },
      ////CORRESPONDIENTE AL MES DE
      { s: { r: 7, c: 14 }, e: { r: 7, c: 16 } },
      { s: { r: 8, c: 14 }, e: { r: 8, c: 16 } },
      { s: { r: 9, c: 14 }, e: { r: 9, c: 16 } },
      { s: { r: 10, c: 14 }, e: { r: 10, c: 16 } },
      { s: { r: 11, c: 14 }, e: { r: 11, c: 16 } },
      { s: { r: 12, c: 14 }, e: { r: 12, c: 16 } },
      /**PRESUPESTO */
      { s: { r: 15, c: 2 }, e: { r: 16, c: 5 } },
      /**PARTIDAS */
      { s: { r: 15, c: 0 }, e: { r: 17, c: 0 } },
      /**DESCRIPCION */
      { s: { r: 15, c: 1 }, e: { r: 17, c: 1 } },
      /**AVANCES*/
      { s: { r: 15, c: 6 }, e: { r: 15, c: 12 } },
      /**ANTERIOR */
      { s: { r: 16, c: 6 }, e: { r: 16, c: 7 } },
      /**ACTUAL */
      { s: { r: 16, c: 8 }, e: { r: 16, c: 9 } },
      /**ACUMULADO */
      { s: { r: 16, c: 10 }, e: { r: 16, c: 12 } },
      /**SALDO */
      { s: { r: 15, c: 13 }, e: { r: 16, c: 15 } },
      { s: { r: totalRowIndex - 2, c: 1 }, e: { r: totalRowIndex - 2, c: 4 } },
      { s: { r: totalRowIndex - 1, c: 1 }, e: { r: totalRowIndex - 1, c: 4 } },
      { s: { r: totalRowIndex - 2, c: 6 }, e: { r: totalRowIndex - 2, c: 8 } },
      { s: { r: totalRowIndex - 1, c: 6 }, e: { r: totalRowIndex - 1, c: 8 } },
      { s: { r: totalRowIndex - 2, c: 11 }, e: { r: totalRowIndex - 2, c: 13 } },
      { s: { r: totalRowIndex - 1, c: 11 }, e: { r: totalRowIndex - 1, c: 13 } }
    ];

    const range = XLSX.utils.decode_range(worksheet['!ref']!);

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellRef];
        if (!cell) continue;

        const isTitle = R === 1;
        const borderedCells = new Set([
          "R7C0", // CONVENIO N°
          "R7C1", // TEXTO CONVENIO N°
          "R7C2", // TEXTO CONVENIO N°
          "R7C3", // TEXTO CONVENIO N°
          "R7C4", // TEXTO CONVENIO N°
          "R7C5", // TEXTO CONVENIO N°
          "R7C6", // TEXTO CONVENIO N° 
          "R7C7", // TEXTO CONVENIO N° 

          "R7C9", // CUI

          "R7C14", // CUI
          "R7C15", // CUI
          "R7C16", // CUI

          "R8C14", // CUI
          "R8C15", // CUI
          "R8C16", // CUI

          "R9C14", // CUI
          "R9C15", // CUI
          "R9C16", // CUI

          "R10C14", // CUI
          "R10C15", // CUI
          "R10C16", // CUI

          "R11C14", // CUI
          "R11C15", // CUI
          "R11C16", // CUI

          "R12C14", // CUI
          "R12C15", // CUI
          "R12C16", // CUI

          "R9C0",  // PROYECTO
          "R9C1", // TEXTO CONVENIO N°
          "R9C2", // TEXTO CONVENIO N°
          "R9C3", // TEXTO CONVENIO N°
          "R9C4", // TEXTO CONVENIO N°
          "R9C5", // TEXTO CONVENIO N°
          "R9C6", // TEXTO CONVENIO N° 
          "R9C7", // TEXTO CONVENIO N° 
          "R9C8", // TEXTO CONVENIO N° 
          "R9C9", // TEXTO CONVENIO N° 
        ]);
        const isBorderedCell = (R: number, C: number): boolean =>
          borderedCells.has(`R${R}C${C}`);
        const tablaInicio = 15;     // Cabecera tabla (fila 16 visual)
        const cabeFin = 17;         // Última fila de cabecera
        const tablaFin = worksheetData.length - 5;  // Última fila de datos, ajusta según corresponda
        const cabeceraTabla = R >= tablaInicio && R <= cabeFin;
        const cuerpoTabla = R > cabeFin && R <= tablaFin;
        const isLeftAlignedCell = (R: number, C: number): boolean => {
          return C === 11 && R >= 7 && R <= 12;
        };

        cell.s = {
          font: {
            name: 'Arial',
            sz: isTitle ? 14 : 10,
            bold: cabeceraTabla
          },
          alignment: {
            vertical: 'center',
            horizontal: isLeftAlignedCell(R, C) ? 'left' : 'center',
            wrapText: true
          },

          fill: cabeceraTabla
            ? { fgColor: { rgb: "B7CDE4" } } // azul claro para cabecera
            : cuerpoTabla
              ? { fgColor: { rgb: "FFFFFF" } } // blanco para cuerpo tabla
              : undefined,
          border: (cabeceraTabla || cuerpoTabla || isBorderedCell(R, C)) ? {
            top: { style: "thin", color: { auto: 1 } },
            bottom: { style: "thin", color: { auto: 1 } },
            left: { style: "thin", color: { auto: 1 } },
            right: { style: "thin", color: { auto: 1 } }
          } : {}
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
    saveAs(blob, 'ANEXO N° 26: VALORIZACIÓN DEL AVANCE DE OBRA.xlsx');
  }

  toNumber(value: any): number {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }
  exportAnexo28(response): void {

    console.log(Session.identity.name)
    /*     const v001 = response.data.response.listamontosValorFinanciadoAG.find(item => item.cidControlMonitoreo === "001"); 
        const v002 = response.data.response.listamontosValorFinanciadoAG.find(item => item.cidControlMonitoreo === "002");
        const v003 = response.data.response.listamontosValorFinanciadoAG.find(item => item.cidControlMonitoreo === "003");
        const v004 = response.data.response.listamontosValorFinanciadoAG.find(item => item.cidControlMonitoreo === "004");
        const v005 = response.data.response.listamontosValorFinanciadoAG.find(item => item.cidControlMonitoreo === "005");
        const v006 = response.data.response.listamontosValorFinanciadoAG.find(item => item.cidControlMonitoreo === "006");
        const v007 = response.data.response.listamontosValorFinanciadoAG.find(item => item.cidControlMonitoreo === "007");
        const v008 = response.data.response.listamontosValorFinanciadoAG.find(item => item.cidControlMonitoreo === "008");
        const v009 = response.data.response.listamontosValorFinanciadoAG.find(item => item.cidControlMonitoreo === "009");
     */

    const worksheetData: any[][] = [];
    // ---------- TÍTULO PRINCIPAL ----------
    worksheetData.push([]);
    worksheetData.push(["", "", "", "ANEXO N° 28: RESUMEN DEL ESTADO FINANCIERO"]);
    worksheetData.push([""]);
    worksheetData.push([""]);
    worksheetData.push([""]);
    // ---------- DATOS DEL PROYECTO ----------
    worksheetData.push(["PROYECTO", "", "", "", "", "", "", "", ""]); // 10 columnas
    worksheetData.push(["NÚMERO CONVENIO", "", "", "", "", "", "", "", ""]);
    worksheetData.push(["CORRESPONDE AL MES", "", "", "", "", "", "", "", ""]);
    worksheetData.push(["FECHA DE PRESENTACIÓN", "", "", "", "", "", "", "", ""]);

    worksheetData.push(["", "", "", "", "", ""]);
    worksheetData.push([""]);
    worksheetData.push(["", "", "MONTO DE CONVENIO", "", "", `S/. 0`, "", "", "Entidad"]);
    worksheetData.push(["", "", "MONTO AMPLIACIÓN PRESUPUESTAL", "", "", `S/. 0`, "", "", ""]);
    worksheetData.push(["", "", "MONTO TOTAL FINANCIADO", "", "", `S/. 0`, "", "", ""]);
    worksheetData.push(["", "", "", "", "", "", "", "", "Número de Cuenta de Ahorros:"]);

    /*    worksheetData.push(["", "", "MONTO DE CONVENIO", "", "", `S/. ${v001.monto}`, "", "", "Entidad"]);
    worksheetData.push(["", "", "MONTO AMPLIACIÓN PRESUPUESTAL", "", "", `S/. ${v002.monto}`, "", "", ""]);
    worksheetData.push(["", "", "MONTO TOTAL FINANCIADO", "", "", `S/. ${v003.monto}`, "", "", ""]);
    worksheetData.push(["", "", "", "", "", "", "", "", "Número de Cuenta de Ahorros:"]); */

    // ---------- CUADRO DE PRE ----------
    worksheetData.push(["DESEMBOLSO", "FECHA", "COMPROBANTE DE PAGO", "IMPORTE", "NTERESES", "MONTO TOTAL", "", "", ""]);
    const primeraTablaCominenza = worksheetData.length;

    /*   let totalMontoAcumulado = 0;
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
       }); */
    const primeraTablaTermina = worksheetData.length;

    //worksheetData.push(["", "", "", "Total Autorizado (S/.)", totalMontoAcumulado, ""]);
    worksheetData.push(["", ""]);

    worksheetData.push([]);
    const startEncabezado = worksheetData.length;

    console.log(startEncabezado)

    // ---------- ENCABEZADO TABLA PRINCIPAL ----------
    worksheetData.push([
      "ITEM", "RUBRO", "VALOR FINANCIADO (S/.)",
      "GASTOS EFECTUADOS\n(según documentos aprobatorios)", "",
      "GASTOS EFECTUADOS ACUMULADOS", "",
      "OBSERVACIONES"
    ]);

    worksheetData.push([
      "", "", "",
      "MES ACTUAL (S/)", "EJECUCION (%)",
      "ACUMULADO (S/)", "EJECUCION (%)",
      ""
    ]);
    let costoDirecto = 0;
    let cdgastoAutorizadoActual = 0;    // 1. Calcula el total
    let gastoAutorizadoPorcentaje = 0;    // 1. Calcula el total
    let gastoEfectuadoAcumulado = 0;    // 1. Calcula el total
    let gastoEfectuadoPorcentaje = 0;
    /*    response.data.response.rubro.forEach((rubro: any) => {
          costoDirecto += +rubro.valorFinanciado; // suma convertido a número
          cdgastoAutorizadoActual += +rubro.gastoAutorizadoActual; // suma convertido a número
          gastoAutorizadoPorcentaje += +rubro.gastoAutorizadoPorcentaje; // suma convertido a número //Qquiero q sea dicivdo por la cantidad del arregle
          gastoEfectuadoAcumulado += +rubro.gastoEfectuadoAcumulado;
          gastoEfectuadoPorcentaje += +rubro.gastoEfectuadoPorcentaje;
        }); */

    // 2. Agrega fila resumen

    /*{
        "codigo": "1",
        "idPreliquidacion": null,
        "idControlAvanceFinancieroProyecto": null,
        "acumulado": 0,
        "nombreControlAvanceFinanciero": "COSTO DIRECTO",
        "porcentajeAcumulado": null,
        "idControlAvanceFinanciero": 55,
        "montoAsignado": null,
        "avanceActual": 0,
        "ejecucionPorcentaje": null,
        "cidControlAvanceFinanciero": "001"
    } */

    response.forEach((rubro: any) => {
      worksheetData.push([
        rubro.codigo,
        rubro.nombreControlAvanceFinanciero,
        rubro.montoAsignado,
        rubro.avanceActual,
        rubro.ejecucionPorcentaje,
        rubro.acumulado,
        rubro.porcentajeAcumulado,
        "",
      ]);
    });
    worksheetData.push([
      "TOTAL INVERSION", "", "", "", "", "", "", ""
    ]);
 
    // ---------- NOTAS Y FIRMAS ----------
    worksheetData.push(["(*) ESPECIFICAR:", "", "", "", "", "", "", ""]);
    worksheetData.push([]);
    worksheetData.push([]);
    worksheetData.push(['Los que abajo suscribimos, CERTIFICAMOS que hemos verificado, en los documentos presentados por el N.E. y Residente, que los montos consignados en el presente informe, han' +
      'sido cancelados durante el proceso de ejecución del Proyecto, con arreglo a los términos y condiciones del Convenio de Cooperación suscrito con EL PROGRAMA.']);
    worksheetData.push([]);
    worksheetData.push([]);
    worksheetData.push([]);
    worksheetData.push([]);
    worksheetData.push([]);
    worksheetData.push([]);
    worksheetData.push(["", "________________", "", "________________", "", "________________", "", "________________"]);

    worksheetData.push(["", "PRESIDENTE DEL N.E", "", "TESORERO DEL N.E", "", "RESIDENTE", "", "APROBADO POR SUPERVISOR"]);
    worksheetData.push(["", "DNI", "", "DNI", "", "DNI", "", "DNI"]);

    // ---------- CONVERSIÓN Y ESTILO ----------
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(worksheetData);


    worksheet['!cols'] = Array(11).fill({ wch: 18 });
    console.log(worksheetData.length)
    worksheet['!merges'] = [
      { s: { r: 1, c: 3 }, e: { r: 1, c: 9 } },//ANEXO N° 25: CONTROL Y MONITOREO DEL MOVIMIENTO FINANCIERO						
      { s: { r: 3, c: 0 }, e: { r: 3, c: 9 } },//CONTROL Y MONITOREO DEL MOVIMIENTO FINANCIERO DEL NE
      { s: { r: 4, c: 0 }, e: { r: 4, c: 9 } },//(El presente formato debe ser presentado por el Profesional en Ejecución de Proyectos en cada Autorización de Gasto)

      { s: { r: 5, c: 2 }, e: { r: 5, c: 8 } },//proyecto
      { s: { r: 6, c: 2 }, e: { r: 6, c: 8 } },//.NÚMERO CONVENIO
      { s: { r: 7, c: 2 }, e: { r: 7, c: 8 } },//.CORRESPONDE AL MES
      { s: { r: 8, c: 2 }, e: { r: 8, c: 8 } },//.FECHA DE PRESENTACIÓN

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

      { s: { r: worksheetData.length - 10, c: 0 }, e: { r: worksheetData.length - 9, c: 7 } } 
 /*     { s: { r: worksheetData.length - 17, c: 0 }, e: { r: worksheetData.length - 17, c: 1 } },
      // { s: { r: worksheetData.length - 15, c: 0 }, e: { r: worksheetData.length - 15, c: 1 } },
      { s: { r: worksheetData.length - 14, c: 0 }, e: { r: worksheetData.length - 14, c: 1 } },
      { s: { r: worksheetData.length - 13, c: 0 }, e: { r: worksheetData.length - 13, c: 1 } },
      { s: { r: worksheetData.length - 12, c: 0 }, e: { r: worksheetData.length - 12, c: 7 } },
      { s: { r: worksheetData.length - 10, c: 0 }, e: { r: worksheetData.length - 9, c: 7 } }, */
      //{ s: { r: worksheetData.length - 9, c: 0 }, e: { r: worksheetData.length - 9, c: 7 } },

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
          "6-2", "6-3", "6-4", "6-5", "6-6", "6-7", "6-8", "6-9",
          "7-2", "7-3", "7-4", "7-5", "7-6", "7-7", "7-8", "7-9",
          "8-2", "8-3", "8-4", "8-5", "8-6", "8-7", "8-8", "8-9",
          "10-2",
          "12-8",
          "15-0", "15-1", "15-2", "15-3", "15-4", "15-5", "15-8", //
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


    for (let r = primeraTablaCominenza - 1; r < primeraTablaTermina; r++) {
      for (let c = 0; c <= 5; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        const cell = worksheet[cellAddress];
        if (!cell) continue;
        if (!cell.s) cell.s = {};
        cell.s.border = {
          top: { style: "thin", color: { auto: 1 } },
          bottom: { style: "thin", color: { auto: 1 } },
          left: { style: "thin", color: { auto: 1 } },
          right: { style: "thin", color: { auto: 1 } }
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

    saveAs(blob, 'ANEXO N° 28: RESUMEN DEL ESTADO FINANCIERO.xlsx');
  }

  exporManiefiestoGasto(response: any): void {
    const worksheetData: any[][] = [];
    // CABECERA
    worksheetData.push([]); // fila vacía para mejor centrado
    worksheetData.push(["ANEXO N° 29: MANIFIESTO DE GASTO", "", "", "", "",]);
    worksheetData.push([]);
    worksheetData.push([]);
    worksheetData.push(["PROYECTO", '', '', '', '', '', '', '', '', '', '']);
    worksheetData.push(["NÚMERO CONVENIO", '', '', '', '', '', '', '', '', '', '']);
    worksheetData.push(["CORRESPONDIENTE AL MES", '', '', '', '', '', '', '', '', '', '']);
    worksheetData.push(["FECHA DE PRESENTACIÓN", '', '', '', '', '', '', '', '', '', '']);
    worksheetData.push([]);
    worksheetData.push(["RUBRO *(del Estado Finaciero)", '', '', '', '', '', '', '', '', '', '']);
    worksheetData.push([]);
    worksheetData.push([]);

    // ENCABEZADO COMPLETO
    worksheetData.push([
      "N°()", "DOCUMENTO", "", "", "DETALLE", "", "IMPORTE", "OBSERVACIONES"]);

    worksheetData.push([
      "", "FECHA", "CLASE(***)", "N°", "RAZON SOCIAL O NOMBRE", "CONCEPTO", "", ""
    ]);

    let totalImporte = 0; 
    // DATOS DE INSUMOS
    const safeDivide = (numerador: number, denominador: number): number =>
      denominador && denominador !== 0 ? numerador / denominador : 0;
   
    //  response.response.
    response.forEach((item: any, index: number) => {
      worksheetData.push([
        index + 1,
        item.fecha,
        item.claseDocumento,
        item.numeroDocumento,
        item.razonSocial,
        item.concepto,
        item.importe,
        item.observaciones 
      ]);
      totalImporte += (+item.importe) 
    });

    worksheetData.push(["", "", "", "", "", "TOTAL:", totalImporte, ""]);
    worksheetData.push([]);

    worksheetData.push(["Por el presente, los abajo firmantes declaramos bajo juramento que los gastos aquí detallados, están previstos en el Presupuesto Aprobado del componente(s) del Objeto del Convenio y han sido utilizados, en su integridad, en la ejecución de la obra."]);
    worksheetData.push([]);
    worksheetData.push(["Las copias de las facturas, comprobantes, recibos, planillas, etc., que acrediten los gastos efectuados, deberán permanecer en poder del TESORERO del Núcleo Ejecutor"]);
    worksheetData.push([]);
    worksheetData.push([]);
    worksheetData.push([]);

    worksheetData.push(["_________________________", "", "_________________________", "", "_________________________", "", "_________________________", "", "", "", "",]);
    worksheetData.push(["Presidente del N .E", "", "Tesorero del N .E", "", "Elaborado po r: R esidente", "", "Revisado por: Supervisor", "", "", "", "", "", "",]);
    const totalRowIndex = worksheetData.length;
    console.log(totalRowIndex)
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(worksheetData);

    worksheet['!merges'] = [
      { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: 2 } },
      { s: { r: 5, c: 0 }, e: { r: 5, c: 2 } },
      { s: { r: 6, c: 0 }, e: { r: 6, c: 2 } },
      { s: { r: 7, c: 0 }, e: { r: 7, c: 2 } },
      { s: { r: 9, c: 0 }, e: { r: 9, c: 2 } },
      { s: { r: 4, c: 3 }, e: { r: 4, c: 7 } },
      { s: { r: 5, c: 3 }, e: { r: 5, c: 7 } },
      { s: { r: 6, c: 3 }, e: { r: 6, c: 7 } },
      { s: { r: 7, c: 3 }, e: { r: 7, c: 7 } },
      { s: { r: 9, c: 3 }, e: { r: 9, c: 7 } },
      { s: { r: 12, c: 0 }, e: { r: 13, c: 0 } },
      { s: { r: 12, c: 1 }, e: { r: 12, c: 3 } },
      { s: { r: 12, c: 4 }, e: { r: 12, c: 5 } },
      { s: { r: 12, c: 6 }, e: { r: 13, c: 6 } },
      { s: { r: 12, c: 7 }, e: { r: 13, c: 7 } },
      { s: { r: totalRowIndex - 1, c: 0 }, e: { r: totalRowIndex - 1, c: 1 } },
      { s: { r: totalRowIndex - 2, c: 0 }, e: { r: totalRowIndex - 2, c: 1 } },
      { s: { r: totalRowIndex - 1, c: 2 }, e: { r: totalRowIndex - 1, c: 3 } },
      { s: { r: totalRowIndex - 2, c: 2 }, e: { r: totalRowIndex - 2, c: 3 } },
      { s: { r: totalRowIndex - 1, c: 4 }, e: { r: totalRowIndex - 1, c: 5 } },
      { s: { r: totalRowIndex - 2, c: 4 }, e: { r: totalRowIndex - 2, c: 5 } },
      { s: { r: totalRowIndex - 1, c: 6 }, e: { r: totalRowIndex - 1, c: 7 } },
      { s: { r: totalRowIndex - 2, c: 6 }, e: { r: totalRowIndex - 2, c: 7 } },
      { s: { r: totalRowIndex - 6, c: 0 }, e: { r: totalRowIndex - 5, c: 7 } },
      { s: { r: totalRowIndex - 8, c: 0 }, e: { r: totalRowIndex - 7, c: 7 } }
    ];

    const range = XLSX.utils.decode_range(worksheet['!ref']!);

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellRef];
        if (!cell) continue;

        const isTitle = R === 1;
        const borderedCells = new Set([

          "R4C3", //
          "R4C4", //
          "R4C5", //
          "R4C6", //
          "R4C7", // 

          "R5C3", //
          "R5C4", //
          "R5C5", //
          "R5C6", //
          "R5C7", // 

          "R6C3", //
          "R6C4", //
          "R6C5", //
          "R6C6", //
          "R6C7", // 

          "R7C3", //
          "R7C4", //
          "R7C5", //
          "R7C6", //
          "R7C7", // 

          "R9C3", //
          "R9C4", //
          "R9C5", //
          "R9C6", //
          "R9C7", //

          "R10C14", // CUI
          "R10C15", // CUI
          "R10C16", // CUI

          "R11C14", // CUI
          "R11C15", // CUI
          "R11C16", // CUI

          "R12C14", // CUI
          "R12C15", // CUI
          "R12C16", // CUI

        ]);
        const isBorderedCell = (R: number, C: number): boolean =>
          borderedCells.has(`R${R}C${C}`);
        const tablaInicio = 11;     // Cabecera tabla (fila 16 visual)
        const cabeFin = 13;         // Última fila de cabecera
        const tablaFin = worksheetData.length - 3;  // Última fila de datos, ajusta según corresponda
        const cabeceraTabla = R >= tablaInicio && R <= cabeFin;
        const cuerpoTabla = R > cabeFin && R <= tablaFin;
        const isLeftAlignedCell = (R: number, C: number): boolean => {
          return C === 11 && R >= 7 && R <= 12;
        };

        cell.s = {
          font: {
            name: 'Arial',
            sz: isTitle ? 14 : 10,
            bold: cabeceraTabla
          },
          alignment: {
            vertical: 'center',
            horizontal: isLeftAlignedCell(R, C) ? 'left' : 'center',
            wrapText: true
          },

          fill: cabeceraTabla
            ? { fgColor: { rgb: "B7CDE4" } } // azul claro para cabecera
            : cuerpoTabla
              ? { fgColor: { rgb: "FFFFFF" } } // blanco para cuerpo tabla
              : undefined,
          border: (cabeceraTabla || cuerpoTabla || isBorderedCell(R, C)) ? {
            top: { style: "thin", color: { auto: 1 } },
            bottom: { style: "thin", color: { auto: 1 } },
            left: { style: "thin", color: { auto: 1 } },
            right: { style: "thin", color: { auto: 1 } }
          } : {}
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
    saveAs(blob, 'ANEXO N° 29: MANIFIESTO DE GASTO.xlsx');
  }

}