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

  getFiltrarProyectos(rawValue): Observable<any> {
    return this.http.post(`${this.getUrlPlataforma()}plataformas?page=0&size=10&sort=idPlataforma,desc`,rawValue, { headers: Headers() });
  }

  getCrearPlataformas(rawValue): Observable<any> {
    return this.http.post(`${this.getUrlPlataforma()}crearPlataformas`,rawValue, { headers: Headers() });
  }
  
  getDetalleCentrosPoblados(ubigeo): Observable<any> {
    return this.http.get(`${this.getUrlMaestras()}detalle-cpp/${ubigeo}`, { headers: Headers() });
  }

  getEstados(): Observable<any> {
    return this.http.get(`${this.getUrlMaestras()}estado-plataforma`, { headers: Headers() });
  }
}

export function Headers(isJson = true): HttpHeaders {
  let headers = new HttpHeaders();

  if (isJson) {
    headers = headers.set('Content-Type', 'application/json');
  }

  headers = headers.set('Authorization', `Bearer ${Session.identity.token}`);

  return headers;
}