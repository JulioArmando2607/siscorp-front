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
        this._setupTokenRefreshTimer(token); // ← Activar temporizador
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
            })
        );
    }

    signInUsingToken(): Observable<any> {
        return this._httpClient.post(`${API_URL}/api/auth/refresh`, {
            refreshToken: this.refreshToken,
        }).pipe(
            catchError(() => of(false)),
            switchMap((response: any) => {
                if (response.data?.accessToken) {
                    this.accessToken = response.data.accessToken;
                    this.refreshToken = response.data.refreshToken;
                }

                this._authenticated = true;
                this._userService.user = response.user;

                return of(true);
            })
        );
    }

    signOut(): Observable<any> {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userSesion');
        this._authenticated = false;
        this._clearTokenRefreshTimer(); // ← Detener temporizador

        return of(true);
    }

    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    unlockSession(credentials: { email: string; password: string }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    check(): Observable<boolean> {
        if (this._authenticated) {
            return of(true);
        }

        const token = this.accessToken;

        if (!token || AuthUtils.isTokenExpired(token)) {
            return of(false);
        }

        const expiresIn = AuthUtils.getTokenExpiration(token) - Date.now() / 1000;

        if (expiresIn < 180) {
            return this._refreshToken().pipe(
                switchMap((refreshed) => refreshed ? this.signInUsingToken() : of(false))
            );
        }

        return this.signInUsingToken();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _refreshToken(): Observable<boolean> {
        return this._httpClient.post(`${API_URL}/api/auth/refresh`, {
            refreshToken: this.refreshToken
        }).pipe(
            switchMap((response: any) => {
                if (response.data?.accessToken) {
                    this.accessToken = response.data.accessToken;
                    this.refreshToken = response.data.refreshToken;
                    return of(true);
                }
                return of(false);
            }),
            catchError(() => of(false))
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
            const refreshTime = expirationTime - currentTime - (2 * 60 * 1000); // 2 min antes

            if (refreshTime > 30000) {
                this._tokenRefreshTimer = timer(refreshTime).subscribe(() => {
                    this._refreshToken().subscribe();
                });
            } else if (refreshTime > 0) {
                setTimeout(() => {
                    this._refreshToken().subscribe();
                }, 1000);
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
