import { Routes, RouterModule } from '@angular/router';
import { RegistroComponent } from './registro/registro.component';
import { GestionPlataformasComponent } from './gestion-plataformas.component';

export default [
    {
        path     : '',
        component: GestionPlataformasComponent,
    },
] as Routes;
