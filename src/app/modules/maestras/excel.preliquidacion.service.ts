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

  export26(response: any): void {
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
    let prueba = [
      {
        nombreRecurso: "Cemento",
        unidad: "bolsa",
        cantidadAsignado: 100,
        montoAsignado: 1500,
        cantidadUtilizadoAcumulado: 60,
        montoUtilizadoAcumulado: 900,
        cantidad: 20,
        precio: 15,
        precioCantidad: 300, // cantidad * precio (20 * 15)
        cantidadRestante: 20,
        montoRestante: 300
      },
      {
        nombreRecurso: "Arena",
        unidad: "m3",
        cantidadAsignado: 50,
        montoAsignado: 1000,
        cantidadUtilizadoAcumulado: 30,
        montoUtilizadoAcumulado: 600,
        cantidad: 10,
        precio: 20,
        precioCantidad: 200, // cantidad * precio (10 * 20)
        cantidadRestante: 10,
        montoRestante: 200
      }
    ];

    //  response.response.
    prueba.forEach((item: any, index: number) => {
      worksheetData.push([
        index + 1, item.nombreRecurso,
        item.unidad,
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

    worksheetData.push(["", "COSTO DIRECTO AVANCE FISICO %", "", "", "", totalMontoAsignado, "", "", totalMontoAcumulado, "", totalCUSolicitado, totalParcialCotizado, "", totalPrecioMontoActual, "", totalSaldo, response.total]);
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
    response = {
      "data": {
        "codResultado": 200,
        "msgResultado": "",
        "total": null,
        "response": {
          "rubro": [
            {
              "item": "1.1",
              "gastoAutorizadoActual": 12,
              "gastoEfectuadoAcumulado": "5.0000",
              "nombreRubro": "Materiales",
              "precioUnitario": 4,
              "cantidad": 3,
              "valorFinanciado": "3860.9200",
              "gastoEfectuadoPorcentaje": "0.129502",
              "gastoAutorizadoPorcentaje": "0.310806"
            }
          ],
          "listaAutorizacionesGasto": [
            {
              "item": 1,
              "cantidadRecursos": 1,
              "codigoAutorizacionGasto": 1309,
              "idAutorizacionGasto": 1309,
              "cantidadRestante": null,
              "cidEstado": "001",
              "nombreEstado": "REGISTRADO",
              "total": 1,
              "cantidadAsignado": null,
              "idEstado": 1,
              "idProyecto": 7110,
              "observacion": null,
              "montoParcial": 1,
              "fechaRegistro": "2025-05-18",
              "montoAcumuladoR": 0,
              "saldoAntesDeAG": 0
            },
            {
              "item": 2,
              "cantidadRecursos": 1,
              "codigoAutorizacionGasto": 1310,
              "idAutorizacionGasto": 1310,
              "cantidadRestante": null,
              "cidEstado": "002",
              "nombreEstado": "SOLICITADO A SUPERVISOR",
              "total": 1,
              "cantidadAsignado": null,
              "idEstado": 3,
              "idProyecto": 7110,
              "observacion": "Solicitar Autorización de Gasto desde el Residente",
              "montoParcial": 1,
              "fechaRegistro": "2025-05-18",
              "montoAcumuladoR": 0,
              "saldoAntesDeAG": 0
            },
            {
              "item": 3,
              "cantidadRecursos": 1,
              "codigoAutorizacionGasto": 1311,
              "idAutorizacionGasto": 1311,
              "cantidadRestante": null,
              "cidEstado": "002",
              "nombreEstado": "SOLICITADO A SUPERVISOR",
              "total": 1,
              "cantidadAsignado": null,
              "idEstado": 3,
              "idProyecto": 7110,
              "observacion": "Solicitar Autorización de Gasto desde el Residente",
              "montoParcial": 1,
              "fechaRegistro": "2025-05-18",
              "montoAcumuladoR": 0,
              "saldoAntesDeAG": 0
            },
            {
              "item": 4,
              "cantidadRecursos": 1,
              "codigoAutorizacionGasto": 1312,
              "idAutorizacionGasto": 1312,
              "cantidadRestante": null,
              "cidEstado": "002",
              "nombreEstado": "SOLICITADO A SUPERVISOR",
              "total": 2,
              "cantidadAsignado": null,
              "idEstado": 3,
              "idProyecto": 7110,
              "observacion": "Solicitar Autorización de Gasto desde el Residente",
              "montoParcial": 2,
              "fechaRegistro": "2025-05-18",
              "montoAcumuladoR": 0,
              "saldoAntesDeAG": 0
            },
            {
              "item": 5,
              "cantidadRecursos": 1,
              "codigoAutorizacionGasto": 1313,
              "idAutorizacionGasto": 1313,
              "cantidadRestante": null,
              "cidEstado": "002",
              "nombreEstado": "SOLICITADO A SUPERVISOR",
              "total": 12,
              "cantidadAsignado": null,
              "idEstado": 3,
              "idProyecto": 7110,
              "observacion": "Solicitar Autorización de Gasto desde el Residente",
              "montoParcial": 12,
              "fechaRegistro": "2025-05-19",
              "montoAcumuladoR": 0,
              "saldoAntesDeAG": 0
            }
          ],
          "listamontosValorFinanciadoAG": [
            {
              "porcentaje": null,
              "idAutorizacionGasto": null,
              "idControlMonitoreo": 46,
              "observaciones": null,
              "monto": 12,
              "actual": "0.00",
              "acumulado": 0,
              "porcentajeActual": 0,
              "porcentajeAcumulado": 0,
              "idProyecto": null,
              "restante": "12.00",
              "idControlMonitoreoProyecto": 329,
              "cidControlMonitoreo": "001",
              "nombreMontoRubroAdicionales": "MONTO DE CONVENIO"
            },
            {
              "porcentaje": null,
              "idAutorizacionGasto": null,
              "idControlMonitoreo": 47,
              "observaciones": null,
              "monto": 12,
              "actual": "0.00",
              "acumulado": 0,
              "porcentajeActual": 0,
              "porcentajeAcumulado": 0,
              "idProyecto": null,
              "restante": "12.00",
              "idControlMonitoreoProyecto": 330,
              "cidControlMonitoreo": "002",
              "nombreMontoRubroAdicionales": "MONTO AMPLIACIÓN PRESUPUESTAL"
            },
            {
              "porcentaje": null,
              "idAutorizacionGasto": null,
              "idControlMonitoreo": 48,
              "observaciones": null,
              "monto": 12,
              "actual": "0.00",
              "acumulado": 0,
              "porcentajeActual": 0,
              "porcentajeAcumulado": 0,
              "idProyecto": null,
              "restante": "12.00",
              "idControlMonitoreoProyecto": 331,
              "cidControlMonitoreo": "003",
              "nombreMontoRubroAdicionales": "MONTO TOTAL FINANCIADO"
            },
            {
              "porcentaje": null,
              "idAutorizacionGasto": null,
              "idControlMonitoreo": 49,
              "observaciones": null,
              "monto": 12,
              "actual": "0.00",
              "acumulado": 0,
              "porcentajeActual": 0,
              "porcentajeAcumulado": 0,
              "idProyecto": null,
              "restante": "-211.00",
              "idControlMonitoreoProyecto": 332,
              "cidControlMonitoreo": "004",
              "nombreMontoRubroAdicionales": "GASTOS GENERALES"
            },
            {
              "porcentaje": null,
              "idAutorizacionGasto": null,
              "idControlMonitoreo": 50,
              "observaciones": null,
              "monto": 12,
              "actual": "0.00",
              "acumulado": 0,
              "porcentajeActual": 0,
              "porcentajeAcumulado": 0,
              "idProyecto": null,
              "restante": "-2320.00",
              "idControlMonitoreoProyecto": 333,
              "cidControlMonitoreo": "005",
              "nombreMontoRubroAdicionales": "GASTOS DE RESIDENTE"
            },
            {
              "porcentaje": null,
              "idAutorizacionGasto": null,
              "idControlMonitoreo": 51,
              "observaciones": null,
              "monto": 12,
              "actual": "2.00",
              "acumulado": 3,
              "porcentajeActual": 16.67,
              "porcentajeAcumulado": 12.5,
              "idProyecto": null,
              "restante": "7.00",
              "idControlMonitoreoProyecto": 334,
              "cidControlMonitoreo": "006",
              "nombreMontoRubroAdicionales": "COSTOS FINANCIERO"
            },
            {
              "porcentaje": null,
              "idAutorizacionGasto": null,
              "idControlMonitoreo": 52,
              "observaciones": null,
              "monto": 12,
              "actual": "0.00",
              "acumulado": 0,
              "porcentajeActual": 0,
              "porcentajeAcumulado": 0,
              "idProyecto": null,
              "restante": "12.00",
              "idControlMonitoreoProyecto": 335,
              "cidControlMonitoreo": "007",
              "nombreMontoRubroAdicionales": "GASTOS DE N.E."
            },
            {
              "porcentaje": null,
              "idAutorizacionGasto": null,
              "idControlMonitoreo": 53,
              "observaciones": null,
              "monto": 222,
              "actual": "0.00",
              "acumulado": 0,
              "porcentajeActual": 0,
              "porcentajeAcumulado": 0,
              "idProyecto": null,
              "restante": "222.00",
              "idControlMonitoreoProyecto": 336,
              "cidControlMonitoreo": "008",
              "nombreMontoRubroAdicionales": "INTERESES"
            },
            {
              "porcentaje": null,
              "idAutorizacionGasto": null,
              "idControlMonitoreo": 54,
              "observaciones": null,
              "monto": 2,
              "actual": "0.00",
              "acumulado": 0,
              "porcentajeActual": 0,
              "porcentajeAcumulado": 0,
              "idProyecto": null,
              "restante": "2.00",
              "idControlMonitoreoProyecto": 337,
              "cidControlMonitoreo": "009",
              "nombreMontoRubroAdicionales": "GASTOS DE SUPERVISION"
            }
          ],
          "total": null,
          "nroAutorizacionGasto": 5,
          "totalEnLetras": null
        },
        "objeto": null,
        "aerror": null
      }
    }

    console.log(Session.identity.name)
    const v001 = response.data.response.listamontosValorFinanciadoAG.find(item => item.cidControlMonitoreo === "001");

    // console.log(response.data.response.listamontosValorFinanciadoAG.);

    console.log(v001);

    const v002 = response.data.response.listamontosValorFinanciadoAG.find(item => item.cidControlMonitoreo === "002");
    const v003 = response.data.response.listamontosValorFinanciadoAG.find(item => item.cidControlMonitoreo === "003");
    const v004 = response.data.response.listamontosValorFinanciadoAG.find(item => item.cidControlMonitoreo === "004");
    const v005 = response.data.response.listamontosValorFinanciadoAG.find(item => item.cidControlMonitoreo === "005");
    const v006 = response.data.response.listamontosValorFinanciadoAG.find(item => item.cidControlMonitoreo === "006");
    const v007 = response.data.response.listamontosValorFinanciadoAG.find(item => item.cidControlMonitoreo === "007");
    const v008 = response.data.response.listamontosValorFinanciadoAG.find(item => item.cidControlMonitoreo === "008");
    const v009 = response.data.response.listamontosValorFinanciadoAG.find(item => item.cidControlMonitoreo === "009");


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
    worksheetData.push(["", "", "MONTO DE CONVENIO", "", "", `S/. ${v001.monto}`, "", "", "Entidad"]);
    worksheetData.push(["", "", "MONTO AMPLIACIÓN PRESUPUESTAL", "", "", `S/. ${v002.monto}`, "", "", ""]);
    worksheetData.push(["", "", "MONTO TOTAL FINANCIADO", "", "", `S/. ${v003.monto}`, "", "", ""]);
    worksheetData.push(["", "", "", "", "", "", "", "", "Número de Cuenta de Ahorros:"]);


    // ---------- CUADRO DE PRE ----------
    worksheetData.push(["DESEMBOLSO", "FECHA", "COMPROBANTE DE PAGO", "IMPORTE", "NTERESES", "MONTO TOTAL", "", "", ""]);
    const primeraTablaCominenza = worksheetData.length;

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
    const primeraTablaTermina = worksheetData.length;




    worksheetData.push(["", "", "", "Total Autorizado (S/.)", totalMontoAcumulado, ""]);
    worksheetData.push([]);
    const startEncabezado = worksheetData.length;

    console.log(startEncabezado)


    // ---------- ENCABEZADO TABLA PRINCIPAL ----------
    worksheetData.push([
      "ITEM", "RUBROS", "VALOR FINANCIADO (S/.)",
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
    response.data.response.rubro.forEach((rubro: any) => {
      costoDirecto += +rubro.valorFinanciado; // suma convertido a número
      cdgastoAutorizadoActual += +rubro.gastoAutorizadoActual; // suma convertido a número
      gastoAutorizadoPorcentaje += +rubro.gastoAutorizadoPorcentaje; // suma convertido a número //Qquiero q sea dicivdo por la cantidad del arregle
      gastoEfectuadoAcumulado += +rubro.gastoEfectuadoAcumulado;
      gastoEfectuadoPorcentaje += +rubro.gastoEfectuadoPorcentaje;
    });

    // 2. Agrega fila resumen
    worksheetData.push([
      "1.0", "COSTO DIRECTO", costoDirecto, cdgastoAutorizadoActual, (gastoAutorizadoPorcentaje) / response.data.response.rubro.length, gastoEfectuadoAcumulado, (gastoEfectuadoPorcentaje) / response.data.response.rubro.length, ""
    ]);


    response.data.response.rubro.forEach((rubro: any) => {
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
      "2.0", "GASTOS GENERALES", v004.monto, v004.actual, v004.porcentajeActual, v004.acumulado, v004.porcentajeAcumulado, ""
    ]);
    worksheetData.push([
      "3.0", "GASTOS DE RESIDENTE", v005.monto, v005.actual, v005.porcentajeActual, v005.acumulado, v005.porcentajeAcumulado, ""
    ]);
    worksheetData.push([
      "4.0", "COSTOS FINANCIEROS", v006.monto, v006.actual, v006.porcentajeActual, v006.acumulado, v006.porcentajeAcumulado, ""
    ]);

    worksheetData.push([
      "5.0", "GASTOS DE N.E.", v007.monto, v007.actual, v007.porcentajeActual, v007.acumulado, v007.porcentajeAcumulado, ""
    ]);

    worksheetData.push([
      "6.0", "INTERESES", v008.monto, v008.actual, v008.porcentajeActual, v008.acumulado, v008.porcentajeAcumulado, ""
    ]);

    let subtotalInversion1 = this.toNumber(costoDirecto) + this.toNumber(v004.monto) + this.toNumber(v005.monto) + this.toNumber(v006.monto) + this.toNumber(v007.monto) + this.toNumber(v008.monto);
    let subtotalInversion2 = this.toNumber(cdgastoAutorizadoActual) + this.toNumber(v004.actual) + this.toNumber(v005.actual) + this.toNumber(v006.actual) + this.toNumber(v007.actual) + this.toNumber(v008.actual);
    let subtotalInversion3 = this.toNumber(gastoAutorizadoPorcentaje) + this.toNumber(v004.porcentajeActual) + this.toNumber(v005.porcentajeActual) + this.toNumber(v006.porcentajeActual) + this.toNumber(v007.porcentajeActual) + this.toNumber(v008.porcentajeActual);
    let subtotalInversion4 = this.toNumber(gastoEfectuadoAcumulado) + this.toNumber(v004.acumulado) + this.toNumber(v005.acumulado) + this.toNumber(v006.acumulado) + this.toNumber(v007.acumulado) + this.toNumber(v008.acumulado);
    let subtotalInversion5 = this.toNumber(gastoEfectuadoPorcentaje) + this.toNumber(v004.porcentajeAcumulado) + this.toNumber(v005.porcentajeAcumulado) + this.toNumber(v006.porcentajeAcumulado) + this.toNumber(v007.porcentajeAcumulado) + this.toNumber(v008.porcentajeAcumulado);

    worksheetData.push([
      "SUB TOTAL INVERSION", "", subtotalInversion1, subtotalInversion2, subtotalInversion3, subtotalInversion4, subtotalInversion5, ""
    ]);

    worksheetData.push([
      "7.0", "GASTOS DE", v009.monto, v009.actual, v009.porcentajeActual, v009.acumulado, v009.porcentajeAcumulado, ""
    ]);
    worksheetData.push([
      "8", "GASTOS DE SUPERVISION", v009.monto, v009.actual, v009.porcentajeActual, v009.acumulado, v009.porcentajeAcumulado, ""
    ]);

    worksheetData.push([
      "TOTAL INVERSION", "", subtotalInversion1 + v009.monto, subtotalInversion2 + v009.actual, subtotalInversion3 + v009.porcentajeActual, subtotalInversion4 + v009.acumulado, subtotalInversion5 + v009.porcentajeAcumulado, ""
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

      { s: { r: worksheetData.length - 17, c: 0 }, e: { r: worksheetData.length - 17, c: 1 } },
      // { s: { r: worksheetData.length - 15, c: 0 }, e: { r: worksheetData.length - 15, c: 1 } },
      { s: { r: worksheetData.length - 14, c: 0 }, e: { r: worksheetData.length - 14, c: 1 } },
      { s: { r: worksheetData.length - 13, c: 0 }, e: { r: worksheetData.length - 13, c: 1 } },
      { s: { r: worksheetData.length - 12, c: 0 }, e: { r: worksheetData.length - 12, c: 7 } },
      { s: { r: worksheetData.length - 10, c: 0 }, e: { r: worksheetData.length - 9, c: 7 } },
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
    worksheetData.push(["ANEXO N° 29: MANIFIESTO DE GASTO","", "", "", "", ]);
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

    let totalMontoAsignado = 0;
    let totalMontoAcumulado = 0;
    let totalCUSolicitado = 0;
    let totalParcialCotizado = 0;
    let totalPrecioMontoActual = 0
    let totalSaldo = 0
    // DATOS DE INSUMOS
    const safeDivide = (numerador: number, denominador: number): number =>
      denominador && denominador !== 0 ? numerador / denominador : 0;
    let prueba = [
      {
        nombreRecurso: "Cemento",
        unidad: "bolsa",
        cantidadAsignado: 100,
        montoAsignado: 1500,
        cantidadUtilizadoAcumulado: 60,
        montoUtilizadoAcumulado: 900,
        cantidad: 20,
        precio: 15,
      },
      {
        nombreRecurso: "Arena",
        unidad: "m3",
        cantidadAsignado: 50,
        montoAsignado: 1000,
        cantidadUtilizadoAcumulado: 30,
        montoUtilizadoAcumulado: 600,
        cantidad: 10,
        precio: 20,

      }
    ];

    //  response.response.
    prueba.forEach((item: any, index: number) => {
      worksheetData.push([
        index + 1,
        item.nombreRecurso,
        item.unidad,
        item.cantidadAsignado,
        safeDivide(item.montoAsignado, item.cantidadAsignado),
        item.montoAsignado,
        item.cantidadUtilizadoAcumulado,
        safeDivide(item.montoUtilizadoAcumulado, item.cantidadUtilizadoAcumulado),

      ]);
      totalMontoAsignado += item.montoAsignado;
      totalMontoAcumulado += item.montoUtilizadoAcumulado;
      totalCUSolicitado += item.precio;
      totalParcialCotizado += item.cantidad * item.precio;
      totalPrecioMontoActual += item.precioCantidad + item.montoUtilizadoAcumulado;
      totalSaldo += item.montoRestante;
    });

    worksheetData.push(["", "", "", "", "", "TOTAL:", "", ""]);
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
      //ANEXO N° 26: VALORIZACIÓN DEL AVANCE DE OBRA

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

      //{ s: { r: 12, c: 7 }, e: { r: 13, c: 7} },
 
      { s: { r: totalRowIndex - 1, c: 0 }, e: { r: totalRowIndex - 1, c: 1 } },
      { s: { r: totalRowIndex - 2, c: 0 }, e: { r: totalRowIndex - 2, c: 1 } },

      
      { s: { r: totalRowIndex - 1, c: 2 }, e: { r: totalRowIndex - 1, c: 3 } },
      { s: { r: totalRowIndex - 2, c: 2 }, e: { r: totalRowIndex - 2, c: 3 } },

      { s: { r: totalRowIndex - 1, c: 4 }, e: { r: totalRowIndex - 1, c: 5 } },
      { s: { r: totalRowIndex - 2, c: 4 }, e: { r: totalRowIndex - 2, c: 5 } },

      { s: { r: totalRowIndex - 1, c: 6 }, e: { r: totalRowIndex - 1, c: 7 } },
      { s: { r: totalRowIndex - 2, c: 6 }, e: { r: totalRowIndex - 2, c: 7 } },

      { s: { r: totalRowIndex - 7, c: 0 }, e: { r: totalRowIndex - 7, c: 7 } },
   //   { s: { r: totalRowIndex - 5, c: 0 }, e: { r: totalRowIndex - 4, c: 7 } },

      //{ s: { r: totalRowIndex - 1, c: 2 }, e: { r: totalRowIndex - 1, c: 1 } },
     // { s: { r: totalRowIndex - 1, c:  }, e: { r: totalRowIndex - 1, c: 1 } },
     // { s: { r: totalRowIndex - 1, c: 0 }, e: { r: totalRowIndex - 1, c: 1 } },

      //{ s: { r: 12, c: 6 }, e: { r: 12, c: 6} },

      // { s: { r: 12, c: 5 }, e: { r: 13, c: 5} },

      /*  { s: { r: 1, c: 4 }, e: { r: 1, c: 11 } },
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
        //PRESUPESTO //
        { s: { r: 15, c: 2 }, e: { r: 16, c: 5 } },
        //PARTIDAS //
        { s: { r: 15, c: 0 }, e: { r: 17, c: 0 } },
        //DESCRIPCION //
        { s: { r: 15, c: 1 }, e: { r: 17, c: 1 } },
        //AVANCES//
        { s: { r: 15, c: 6 }, e: { r: 15, c: 12 } },
        //ANTERIOR //
        { s: { r: 16, c: 6 }, e: { r: 16, c: 7 } },
        //ACTUAL //
        { s: { r: 16, c: 8 }, e: { r: 16, c: 9 } },
        //ACUMULADO //
        { s: { r: 16, c: 10 }, e: { r: 16, c: 12 } },
        //SALDO //
        { s: { r: 15, c: 13 }, e: { r: 16, c: 15 } },
        { s: { r: totalRowIndex - 2, c: 1 }, e: { r: totalRowIndex - 2, c: 4 } },
        { s: { r: totalRowIndex - 1, c: 1 }, e: { r: totalRowIndex - 1, c: 4 } },
        { s: { r: totalRowIndex - 2, c: 6 }, e: { r: totalRowIndex - 2, c: 8 } },
        { s: { r: totalRowIndex - 1, c: 6 }, e: { r: totalRowIndex - 1, c: 8 } },
        { s: { r: totalRowIndex - 2, c: 11 }, e: { r: totalRowIndex - 2, c: 13 } },
        { s: { r: totalRowIndex - 1, c: 11 }, e: { r: totalRowIndex - 1, c: 13 } }*/
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