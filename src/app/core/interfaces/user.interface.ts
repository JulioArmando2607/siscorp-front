export interface User {
    /** ID DEL USUARIO LOGEADO */
    id: number;
    /** NOMBRE EMPLEADO DEL USUARIO LOGEADO */
    name: string;
    /** TOKEN DE SESSION DEL USUARIO */
    token: string;
    /** ROL DE SESSION DEL USUARIO */
    rol: number;
}