import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Session } from 'app/core/auth/Session';
import { environment } from 'environments/environment.prod';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PreliquidacionService {

  constructor(public http: HttpClient) { }

  getUrlPreliquidacion() {
    return environment.apiurl + '/api/preliquidacion/';
  }

  cambiarEstadoPreliquidacion(data): Observable<any> {
    return this.http.post(`${this.getUrlPreliquidacion()}cambiar-estado-preliquidacion`, data);
  }

  mostarEstadoActualPreliquidacion(data): Observable<any> {
    return this.http.post(`${this.getUrlPreliquidacion()}mostar-estado-actual-preliquidacion`, data);
  }

}
