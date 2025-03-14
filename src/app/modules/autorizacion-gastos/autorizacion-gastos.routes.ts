import { Routes, RouterModule } from '@angular/router';
import { AutorizacionGastosComponent } from './autorizacion-gastos.component';
import { RegistrarAutorizacionGastoComponent } from './registrar-autorizacion-gasto/registrar-autorizacion-gasto.component';
import { ListarSolicitudAutorizacionGastoComponent } from './listar-solicitud-autorizacion-gasto/listar-solicitud-autorizacion-gasto.component';

export default [
    {
        path     : '',
        component: AutorizacionGastosComponent,
    },
    {
        path: 'listar-solicitud-autorizacion-gasto/:id',
        component:ListarSolicitudAutorizacionGastoComponent,
    },
    {
        path: 'registrar-autorizacion-gasto/:id',
        component: RegistrarAutorizacionGastoComponent,
    },
] as Routes;
