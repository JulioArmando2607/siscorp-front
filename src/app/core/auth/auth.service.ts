import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment.prod';
import { catchError, Observable, of, switchMap, throwError, timer, Subscription } from 'rxjs';

const API_URL = `${environment.apiurl}`;

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);
    private _tokenRefreshTimer: Subscription | null = null;

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
        this._setupTokenRefreshTimer(token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    set refreshToken(token: string) {
        localStorage.setItem('refreshToken', token);
    }

    get refreshToken(): string {
        return localStorage.getItem('refreshToken') ?? '';
    }

    /**
     * Get remaining time in seconds for current token
     */
    get tokenTimeRemaining(): number {
        const token = this.accessToken;
        if (!token) return 0;
        
        try {
            const expirationTime = AuthUtils.getTokenExpiration(token);
            const currentTime = Date.now() / 1000;
            return Math.max(0, expirationTime - currentTime);
        } catch {
            return 0;
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    signIn(credentials: { username: string; password: string }): Observable<any> {
        if (this._authenticated) {
            return throwError(() => new Error('El usuario ya ha iniciado sesión.'));
        }

        return this._httpClient.post(`${API_URL}/public/auth/login`, credentials).pipe(
            switchMap((response: any) => {
                this.accessToken = response.data.accessToken;
                this.refreshToken = response.data.refreshToken;
                this._authenticated = true;

                const user = AuthUtils._decodeToken(this.accessToken);
                this._userService.user = user;

                return of(response);
            }),
            catchError((error) => {
                this._authenticated = false;
                return throwError(() => error);
            })
        );
    }

    signInUsingToken(): Observable<any> {
        // Este método debería validar el token actual, no hacer refresh
        if (!this.accessToken) {
            return of(false);
        }

        // Si el token está expirado, usar refresh
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return this._refreshToken().pipe(
                switchMap((refreshed) => {
                    if (refreshed) {
                        this._authenticated = true;
                        const user = AuthUtils._decodeToken(this.accessToken);
                        this._userService.user = user;
                        return of(true);
                    }
                    return of(false);
                })
            );
        }

        // Token válido, solo actualizar estado
        this._authenticated = true;
        const user = AuthUtils._decodeToken(this.accessToken);
        this._userService.user = user;
        return of(true);
    }

    signOut(): Observable<any> {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userSesion');
        this._authenticated = false;
        this._clearTokenRefreshTimer();

        return of(true);
    }

    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    unlockSession(credentials: { email: string; password: string }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Force token refresh manually
     */
    forceRefreshToken(): Observable<boolean> {
        return this._refreshToken();
    }

    check(): Observable<boolean> {
        // CORREGIDO: Siempre verificar el token primero
        const token = this.accessToken;

        // No hay token
        if (!token) {
            this._authenticated = false;
            return of(false);
        }

        // Token expirado - intentar refresh
        if (AuthUtils.isTokenExpired(token)) {
            return this._refreshToken().pipe(
                switchMap((refreshed) => {
                    if (refreshed) {
                        this._authenticated = true;
                        const user = AuthUtils._decodeToken(this.accessToken);
                        this._userService.user = user;
                        return of(true);
                    } else {
                        this._authenticated = false;
                        this.signOut().subscribe(); // Limpiar tokens inválidos
                        return of(false);
                    }
                })
            );
        }

        // Token válido - verificar si está por vencer pronto
        const expiresIn = AuthUtils.getTokenExpiration(token) - Date.now() / 1000;
        
        if (expiresIn < 120) { // Menos de 2 minutos para token de 15 min
            return this._refreshToken().pipe(
                switchMap((refreshed) => {
                    if (refreshed) {
                        this._authenticated = true;
                        const user = AuthUtils._decodeToken(this.accessToken);
                        this._userService.user = user;
                        return of(true);
                    } else {
                        // Si no se pudo refrescar, pero el token actual sigue válido
                        this._authenticated = true;
                        const user = AuthUtils._decodeToken(this.accessToken);
                        this._userService.user = user;
                        return of(true);
                    }
                })
            );
        }

        // Token válido y no próximo a vencer
        if (!this._authenticated) {
            this._authenticated = true;
            const user = AuthUtils._decodeToken(this.accessToken);
            this._userService.user = user;
        }
        
        return of(true);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _refreshToken(): Observable<boolean> {
        // Verificar que existe refresh token
        if (!this.refreshToken) {
            console.warn('No refresh token available');
            return of(false);
        }

        console.debug('Refreshing token...');
        return this._httpClient.post(`${API_URL}/api/auth/refresh`, {
            refreshToken: this.refreshToken
        }).pipe(
            switchMap((response: any) => {
                if (response?.data?.accessToken) {
                    console.debug('Token refreshed successfully');
                    this.accessToken = response.data.accessToken;
                    
                    // Actualizar refresh token si viene en la respuesta
                    if (response.data.refreshToken) {
                        this.refreshToken = response.data.refreshToken;
                    }
                    
                    return of(true);
                }
                console.warn('Invalid refresh response');
                return of(false);
            }),
            catchError((error) => {
                console.error('Error al refrescar token:', error);
                // Si falla el refresh, limpiar tokens
                this.signOut().subscribe();
                return of(false);
            })
        );
    }

    private _setupTokenRefreshTimer(token: string): void {
        this._clearTokenRefreshTimer();

        if (!token || AuthUtils.isTokenExpired(token)) {
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000;
            const currentTime = Date.now();
            
            // Para tokens de 15 min: refresh 1.5 min antes de expirar
            const refreshTime = expirationTime - currentTime - (90 * 1000); // 1.5 min antes (para token de 15 min)

            console.debug(`Token expires in: ${Math.round((expirationTime - currentTime) / 1000 / 60)} minutes`);
            console.debug(`Will refresh in: ${Math.round(refreshTime / 1000)} seconds`);

            if (refreshTime > 10000) { // Al menos 10 segundos
                this._tokenRefreshTimer = timer(refreshTime).subscribe(() => {
                    this._refreshToken().pipe(
                        catchError(() => {
                            // Si falla el refresh automático, cerrar sesión
                            this.signOut().subscribe();
                            return of(false);
                        })
                    ).subscribe();
                });
            } else if (refreshTime > 0) {
                // Token expira muy pronto, refresh inmediato
                setTimeout(() => {
                    this._refreshToken().pipe(
                        catchError(() => {
                            this.signOut().subscribe();
                            return of(false);
                        })
                    ).subscribe();
                }, 1000);
            } else {
                // Token ya expirado, hacer refresh inmediatamente
                this._refreshToken().pipe(
                    catchError(() => {
                        this.signOut().subscribe();
                        return of(false);
                    })
                ).subscribe();
            }
        } catch (error) {
            console.error('Error al configurar el temporizador de token:', error);
            this.signOut().subscribe();
        }
    }

    private _clearTokenRefreshTimer(): void {
        if (this._tokenRefreshTimer) {
            this._tokenRefreshTimer.unsubscribe();
            this._tokenRefreshTimer = null;
        }
    }
}