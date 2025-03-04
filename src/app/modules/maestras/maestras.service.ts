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

  getDepartamentos(): Observable<any> {
    return this.http.get(`${this.getUrlMaestras()}departamentos`, { headers: Headers() });
  }
  getProvincias(departamentoUbigeo): Observable<any> {
    return this.http.get(`${this.getUrlMaestras()}provincias/${departamentoUbigeo}`, { headers: Headers() });
  }
  getDistrito(provinciaUbigeo): Observable<any> {
    return this.http.get(`${this.getUrlMaestras()}distritos/${provinciaUbigeo}`, { headers: Headers() });
  }
  getCentrosPoblados(distritoUbigeo): Observable<any> {
    return this.http.get(`${this.getUrlMaestras()}centros-poblados/${distritoUbigeo}`, { headers: Headers() });
  }

  getFiltrarProyectos(rawValue, pageIndex , pageSize): Observable<any> {
    return this.http.post(`${this.getUrlPlataforma()}plataformas?page=${pageIndex}&size=${pageSize}&sort=idProyecto,asc`,rawValue, { headers: Headers() });
  }
  listarPlataformasExcel(rawValue): Observable<any>{
    return this.http.post(`${this.getUrlPlataforma()}proyectos-excel`,rawValue, { headers: Headers() });
  }

  getCrearPlataformas(rawValue): Observable<any> {
    return this.http.post(`${this.getUrlPlataforma()}crearProyecto`,rawValue, { headers: Headers() });
  }

  getEditaPlataformas(rawValue): Observable<any> {
    return this.http.post(`${this.getUrlPlataforma()}editarProyecto`,rawValue, { headers: Headers() });
  }

  getEliminar(idProyecto): Observable<any> {
    return this.http.get(`${this.getUrlPlataforma()}eliminar-proyecto/${idProyecto}`, { headers: Headers() });
  }

  getLerrExcel(formData : FormData): Observable<any> {
    return this.http.post(`${this.getUrlPlataforma()}leer`,formData, { headers: Headers(false) });
  }

  getDetalleCentrosPoblados(ubigeo): Observable<any> {
    return this.http.get(`${this.getUrlMaestras()}detalle-cpp/${ubigeo}`, { headers: Headers() });
  }

  getEstados(): Observable<any> {
    return this.http.get(`${this.getUrlMaestras()}estado-plataforma`, { headers: Headers() });
  }
 
}

export function Headers(isJson = true): HttpHeaders {
  let headers = new HttpHeaders({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  const token = Session?.identity?.token;

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (isJson) {
    headers = headers.set('Content-Type', 'application/json');
  }

  return headers;
}
