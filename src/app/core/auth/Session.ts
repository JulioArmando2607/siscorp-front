//import { User } from "@core/interfaces/user.interface";

import { User } from "../interfaces/user.interface";


export class Session {
    public static get identity(): User {
        if (!Session.exist()) return { id: null, name: null, token: null, rol: null };

        return JSON.parse(localStorage.getItem('session'));
    }

    public static exist(): boolean {
        return localStorage.getItem('session') !== null;
    }

    /**
     * INICIAR SESSION
     */
    public static start(session) {
        localStorage.setItem('session', JSON.stringify(session));
    }

    /**
     * CERRAR SESSION
     */
    public static stop() {
        localStorage.removeItem('session');
    }
}