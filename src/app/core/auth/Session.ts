//import { User } from "@core/interfaces/user.interface";

import { User } from "../user/user.types";

//import { User } from "../interfaces/user.interface";

/*const userSesion = localStorage.getItem('userSesion');
if (userSesion) {
  this.user = JSON.parse(userSesion);
} */
export class Session {
    public static get identity(): User {
        if (!Session.exist()) return {
            id: null,
            name: null,
            numeroDocumento: null,
            idEmpleado: null,
            idRol: null,
            rol: null,
            email: null,
            avatar: null,
            status: null
        };

        return JSON.parse(localStorage.getItem('userSesion'));
    }

    public static exist(): boolean {
        return localStorage.getItem('userSesion') !== null;
    }

    /**
     * INICIAR SESSION
     */
    public static start(session) {
        localStorage.setItem('userSesion', JSON.stringify(session));
    }

    /**
     * CERRAR SESSION
     */
    public static stop() {
        localStorage.removeItem('userSesion');
    }
}