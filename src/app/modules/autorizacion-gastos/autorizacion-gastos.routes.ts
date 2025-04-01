import { Routes, RouterModule } from '@angular/router';
import { AutorizacionGastosComponent } from './autorizacion-gastos.component';
import { RegistrarAutorizacionGastoComponent } from './registrar-autorizacion-gasto/registrar-autorizacion-gasto.component';
import { ListarSolicitudAutorizacionGastoComponent } from './listar-solicitud-autorizacion-gasto/listar-solicitud-autorizacion-gasto.component';
import { EditarAutorizacionGastoComponent } from './editar-autorizacion-gasto/editar-autorizacion-gasto.component';
import { RegistarAutorizacionGastoTablaComponent } from './registar-autorizacion-gasto-tabla/registar-autorizacion-gasto-tabla.component';
import { EditarAutorizacionGastoTablaComponent } from './editar-autorizacion-gasto-tabla/editar-autorizacion-gasto-tabla.component';

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
    {
        path: 'registar-autorizacion-gasto-tabla/:id',
        component: RegistarAutorizacionGastoTablaComponent,
    },
    
    {
        path: 'editar-autorizacion-gasto/:id/:ag',
        component: EditarAutorizacionGastoComponent,
    },
    {
        path: 'editar-autorizacion-gasto-tabla/:id/:ag',
        component: EditarAutorizacionGastoTablaComponent,
    },
] as Routes;
