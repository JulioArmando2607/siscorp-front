import { Routes, RouterModule } from '@angular/router';
import { PreliquidacionComponent } from './preliquidacion.component';
import { ListarSolicitudPreliquidacionComponent } from './listar-solicitud-preliquidacion/listar-solicitud-preliquidacion.component';
import { RegistrarPreliquidacionComponent } from './listar-solicitud-preliquidacion/registrar-preliquidacion/registrar-preliquidacion.component';

export default [
    {
        path: '',
        component: PreliquidacionComponent,
    },

    {
        path: 'listar-solicitud-preliquidacion/:idProyecto',
        component: ListarSolicitudPreliquidacionComponent,
    },
    {
        path: 'registrar-preliquidacion/:idProyecto',
        component: RegistrarPreliquidacionComponent,
    }

    
] as Routes;
