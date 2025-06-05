import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Session } from 'app/core/auth/Session';
import { environment } from 'environments/environment.prod';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MaestrasService {

  constructor(public http: HttpClient) { }

  getUrlMaestras() {
    return environment.apiurl + '/api/maestras/';
  }

  getUrlPlataforma() {
    return environment.apiurl + '/api/plataforma/';
  }

  getUrlPartidas() {
    return environment.apiurl + '/api/partidas/';
  }

  getUrlAutorizacionGasto() {
    return environment.apiurl + '/api/autorizacion-gasto/';
  }

  getUrlPreliquidacion() {
    return environment.apiurl + '/api/preliquidacion/';
  }

  getDepartamentos(): Observable<any> {
    return this.http.get(`${this.getUrlMaestras()}departamentos`);
  }
  getProvincias(departamentoUbigeo): Observable<any> {
    return this.http.get(`${this.getUrlMaestras()}provincias/${departamentoUbigeo}`);
  }
  getDistrito(provinciaUbigeo): Observable<any> {
    return this.http.get(`${this.getUrlMaestras()}distritos/${provinciaUbigeo}`);
  }
  getCentrosPoblados(distritoUbigeo): Observable<any> {
    return this.http.get(`${this.getUrlMaestras()}centros-poblados/${distritoUbigeo}`);
  }

  getFiltrarProyectos(rawValue, pageIndex, pageSize): Observable<any> {
    return this.http.post(`${this.getUrlPlataforma()}plataformas?page=${pageIndex}&size=${pageSize}&sort=idProyecto,asc`, rawValue);
  }

  listarPlataformasExcel(rawValue): Observable<any> {
    return this.http.post(`${this.getUrlPlataforma()}proyectos-excel`, rawValue);
  }

  verProyecto(rawValue): Observable<any> {
    return this.http.post(`${this.getUrlPlataforma()}ver-proyectos`, rawValue);
  }

  getCrearPlataformas(rawValue): Observable<any> {
    return this.http.post(`${this.getUrlPlataforma()}crearProyecto`, rawValue);
  }

  getEditaPlataformas(rawValue): Observable<any> {
    return this.http.post(`${this.getUrlPlataforma()}editarProyecto`, rawValue);
  }

  getEliminar(idProyecto): Observable<any> {
    return this.http.get(`${this.getUrlPlataforma()}eliminar-proyecto/${idProyecto}`);
  }

  getLerrExcel(formData: FormData): Observable<any> {
    return this.http.post(`${this.getUrlPlataforma()}leer`, formData, { headers: Headers(false) });
  }

  getDetalleCentrosPoblados(ubigeo): Observable<any> {
    return this.http.get(`${this.getUrlMaestras()}detalle-cpp/${ubigeo}`);
  }

  getEstados(): Observable<any> {
    return this.http.get(`${this.getUrlMaestras()}estado-plataforma`);
  }

  getEnviarPartidasExcel(formData: FormData): Observable<any> {
    return this.http.post(`${this.getUrlPartidas()}leer-excel`, formData, { headers: Headers(false) });
  }

  getPartidas(idProyecto): Observable<any> {
    return this.http.get(`${this.getUrlMaestras()}partidas-proyecto/${idProyecto}`);
  }

  getRecursosxPartidas(idProyecto): Observable<any> {
    return this.http.get(`${this.getUrlMaestras()}recursos-partida/${idProyecto}`);
  }

  setRegistrarAutorizacionGasto(formData): Observable<any> {
    return this.http.post(`${this.getUrlAutorizacionGasto()}registrar-autorizacion-gasto`, formData);
  }
  setRegistrarAutorizacionGastoTabla(formData): Observable<any> {
    return this.http.post(`${this.getUrlAutorizacionGasto()}registrar-autorizacion-gasto-tabla`, formData);
  }

  setRegistrarAGadicional(formData): Observable<any> {
    return this.http.post(`${this.getUrlAutorizacionGasto()}registrar-ag-adicional`, formData);
  }
  setEditarAutorizacionGasto(formData): Observable<any> {
    return this.http.post(`${this.getUrlAutorizacionGasto()}editar-autorizacion-gasto`, formData);
  }
  setEliminarAutorizacionGastoRecurso(formData): Observable<any> {
    return this.http.post(`${this.getUrlAutorizacionGasto()}eliminar-autorizacion-gasto-recurso`, formData);
  }
  getlistarRecursosAturorizacionGasto(rawValue): Observable<any> {
    return this.http.post(`${this.getUrlAutorizacionGasto()}listar-recursos-aturorizacion-gasto`, rawValue);
  }
  getListarAutorizacionGasto(rawValue, pageIndex, pageSize): Observable<any> {
    return this.http.post(`${this.getUrlAutorizacionGasto()}listar-autorizacion-gasto?page=${pageIndex}&size=${pageSize}&sort=idAutorizacionGasto,desc`, rawValue);
  }


  getAutorizacionGasto(rawValue): Observable<any> {
    return this.http.post(`${this.getUrlAutorizacionGasto()}dato-autorizacion-gasto`, rawValue);
  }

  getConsultaUsuarioDni(dni): Observable<any> {
    return this.http.get(`${this.getUrlMaestras()}consulta-usuario-dni/${dni}`);
  }

  registrarResidenteSupervisor(data): Observable<any> {
    return this.http.post(`${this.getUrlPlataforma()}registrar-residente-supervisor`, data);
  }
  eliminarUsuarioProyecto(data): Observable<any> {
    return this.http.post(`${this.getUrlPlataforma()}eliminar-usuario-proyecto`, data);
  }

  setEliminarAutorizacionGasto(data): Observable<any> {
    return this.http.post(`${this.getUrlAutorizacionGasto()}eliminar-autorizacion-gasto`, data);
  }

  listarUsuarioProyecto(idProyecto): Observable<any> {
    return this.http.get(`${this.getUrlPlataforma()}listar-usuario-proyecto/${idProyecto}`);
  }

  solicitarAutorizacionGastoResidente(data): Observable<any> {
    return this.http.post(`${this.getUrlAutorizacionGasto()}solicitar-autorizacion-gasto-residente`, data, { headers: Headers(false) });
    //return this.http.post(`${this.getUrlAutorizacionGasto()}solicitar-autorizacion-gasto-residente`, data);
  }

  solicitarAutorizacionGasto(data): Observable<any> {
    return this.http.post(`${this.getUrlAutorizacionGasto()}solicitar-autorizacion-gasto`, data, { headers: Headers(false) });
  }

  getEstadosAutorizacion(): Observable<any> {
    return this.http.get(`${this.getUrlMaestras()}estado-autorizacion`);
  }
  listaRecursosAutorizacionGastoProyecto(data): Observable<any> {
    return this.http.post(`${this.getUrlAutorizacionGasto()}lista-recursos-autorizacion-gasto-proyecto`, data);
  }
  listaRecursosAutorizacionGastoProyectoAnalisis(data): Observable<any> {
    return this.http.post(`${this.getUrlAutorizacionGasto()}anexo24-autorizacion-gasto`, data);
  }
  anexo25AutorizacionGasto(data): Observable<any> {
    return this.http.post(`${this.getUrlAutorizacionGasto()}anexo25-autorizacion-gasto`, data);
  }
  anexo23AutorizacionGasto(data): Observable<any> {
    return this.http.post(`${this.getUrlAutorizacionGasto()}anexo23-autorizacion-gasto`, data);
  }
  getRubrosAdicionales(idProyecto): Observable<any> {
    return this.http.get(`${this.getUrlPlataforma()}control-monitoreo-proyecto/${idProyecto}`);
  }

  crearRubrosProyecto(data): Observable<any> {
    return this.http.post(`${this.getUrlPlataforma()}crear-monitoreo-proyecto`, data);
  }
  getRubrosAdicionalesAG(data): Observable<any> {
    return this.http.post(`${this.getUrlAutorizacionGasto()}control-monitoreo-proyecto-ag`, data);
  }

  getArchivosAutorizacionGasto(data): Observable<any> {
    return this.http.post(`${this.getUrlAutorizacionGasto()}archivos-autorizacion-gasto`, data);
  }

  descargarArchivo(data): Observable<any> {
    const url = `${this.getUrlAutorizacionGasto()}descargarArchivoSeleccionado`;
    return this.http.post(url, data, { responseType: 'blob' });
  }

  getMmostrarEstadoActualAutorizaciongasto(data): Observable<any> {
    return this.http.post(`${this.getUrlAutorizacionGasto()}mostrar-estado-actual-autorizaciongasto`, data);
  }

  listaPartidadPreliquidacion(data): Observable<any> {
    return this.http.post(`${this.getUrlPreliquidacion()}partidas`, data);
  }

  listaAnalisisPartidadPreliquidacion(data): Observable<any> {
    return this.http.post(`${this.getUrlPreliquidacion()}analisar-preliquidacion`, data);
  }


  setRegistrarAvanceObra(formData): Observable<any> {
    return this.http.post(`${this.getUrlPreliquidacion()}registrar-avance-obra`, formData);
  }

  listarAvanceFinancieroAsignado(data): Observable<any> {
    return this.http.post(`${this.getUrlPreliquidacion()}listar-avance-financiero-asignado`, data);
  }

  ListarAvanceFinancieroAsignadoReporte(data): Observable<any> {
    return this.http.post(`${this.getUrlPreliquidacion()}listar-avance-financiero-asignado-reporte`, data);
  }

  RegManifiestoGastoAvanceFinanciero(data): Observable<any> {
    return this.http.post(`${this.getUrlPreliquidacion()}registrar-manifiesto-gasto-avance-financiero`, data);
  }

  listarManifiestoGastoAvanceFinanciero(data): Observable<any> {
    return this.http.post(`${this.getUrlPreliquidacion()}listar-manifiesto-gasto-avance-financiero`, data);
  }

  setEliminarRegManifiestoGasto(data): Observable<any> {
    return this.http.post(`${this.getUrlPreliquidacion()}eliminar-manifiesto-gasto`, data);
  }
  listarManifiestoPreliquidacion(data): Observable<any> {
    return this.http.post(`${this.getUrlPreliquidacion()}listar-manifiesto-preliquidacion`, data);
  }

  getListarPreliquidacion(rawValue, pageIndex, pageSize): Observable<any> {
    return this.http.post(`${this.getUrlPreliquidacion()}listar-preliquidacion?page=${pageIndex}&size=${pageSize}&sort=id_preliquidacion,desc`, rawValue);
  }
  optnerValorizacionAvanceObra(rawvalue): Observable<any> {
    return this.http.post(`${this.getUrlPreliquidacion()}optner-valorizacion-avance-obra`, rawvalue);
  }

  eliminarPreliquidacion(data): Observable<any> {
    return this.http.post(`${this.getUrlPreliquidacion()}eliminar-preliquidacion`, data);
  }

  guardarArchivosPreliquidacion(data): Observable<any> {
    return this.http.post(`${this.getUrlPreliquidacion()}guardar-archivos-preliquidacion`, data, { headers: Headers(false) });
  }

  listarArchivosPreliquidacion(data): Observable<any> {
    return this.http.post(`${this.getUrlPreliquidacion()}listar-archivos-preliquidacion`, data);
  }
  eliminarArchivoPreliquidacion(data): Observable<any> {
    return this.http.post(`${this.getUrlPreliquidacion()}eliminar-archivo-preliquidacion`, data);
  }

  partidasExcel(idProyecto): Observable<any> {
    return this.http.get(`${this.getUrlPartidas()}partidas-excel/${idProyecto}`);
  }

  partidasExcelRecursos(idProyecto): Observable<any> {
    return this.http.get(`${this.getUrlPartidas()}partidas-excel-recursos/${idProyecto}`);
  }
  eliminarArchivoAg(data): Observable<any> {
    return this.http.post(`${this.getUrlAutorizacionGasto()}eliminar-archivo-ag`, data);
  }


}

export function Headers(isJson = true): HttpHeaders {
  let headers = new HttpHeaders({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  /*  const token = Session?.identity?.token;
  
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } */

  if (isJson) {
    headers = headers.set('Content-Type', 'application/json');
  }

  return headers;
}
