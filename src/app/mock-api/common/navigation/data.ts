/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';
import { Session } from 'app/core/auth/Session';
////

// Reiniciamos todos los roles
let isAdministrador = false;
let isSupervisor = false;
let isResidente = false;
let isPEP = false;

// Validar Residente
if (Session.identity.rol == 'UPS-RESIDENTE-PROYECTO') {
    isResidente = true;
}
// Validar Supervisor
else if (Session.identity.rol == 'UPS-SUPERVISOR-PROYECTO') {
    isSupervisor = true;
}

else if (Session.identity.rol == 'UPS-PEP-PROYECTO') {
    isPEP = true;
}
// Si no es ninguno de los anteriores, es Administrador (o cualquier otro rol general)
else {
    isAdministrador = true;
}


export const defaultNavigation: FuseNavigationItem[] = [

/*    {
        id: 'example',
        title: 'Gestión de Proyectos de los Tambos',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/gestion-plataformas' 
    },
    {
        id: 'autorizacionGasto',
        title: 'Autorización de gasto',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/autorizacion-gastos'
    },
    {
        id: 'autorizacionGasto',
        title: 'Preliquidacion',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/preliquidacion'
    } */
];


// Objeto exclusivo para administradores
const adminItem: FuseNavigationItem = {
        id: 'example',
        title: 'Gestión de Proyectos de los Tambos',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/gestion-plataformas' 
};

const preliquidacion: FuseNavigationItem = {
    id: 'preliquidacion',
    title: 'Preliquidacion',
    type: 'basic',
    icon: 'heroicons_outline:chart-pie',
    link: '/preliquidacion'
};

const autorizacionGasto: FuseNavigationItem = {
    id: 'autorizacionGasto',
    title: 'Autorización de gasto',
    type: 'basic',
    icon: 'heroicons_outline:chart-pie',
    link: '/autorizacion-gastos'
};

// Agregar o quitar item según rol
if (isResidente  || isSupervisor || isPEP ) {
    defaultNavigation.push(preliquidacion);
    defaultNavigation.push(autorizacionGasto);
/*|| isSupervisor */
} else {
    defaultNavigation.push(adminItem);
    defaultNavigation.push(preliquidacion);
    defaultNavigation.push(autorizacionGasto);
     /*  // Asegurar que no esté presente si no es admin (por si se reutiliza el array)
    const index = defaultNavigation.findIndex(item => item.id === adminItem.id);
    if (index !== -1) {
        defaultNavigation.splice(index, 1);
    } */
}

/*export const autorizaciondeGastotNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Aotorización de gasto',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/gestion-plataformas'
    }
]; */
export const compactNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
        // 🚨 Clave personalizada para permisos
        onlyAdmin: true
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example'
    }
];
/* export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
]; */

export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Exassmple',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example'
    }
];
