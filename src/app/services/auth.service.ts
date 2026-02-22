import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly SESSION_KEY = 'ts-auth';
    /** Default PIN — user can't change it in the UI; just edit this constant */
    private readonly PIN = '1234';

    private _loggedIn = signal(this.checkSession());

    readonly loggedIn = this._loggedIn.asReadonly();

    private checkSession(): boolean {
        return sessionStorage.getItem(this.SESSION_KEY) === 'true';
    }

    login(pin: string): boolean {
        if (pin === this.PIN) {
            sessionStorage.setItem(this.SESSION_KEY, 'true');
            this._loggedIn.set(true);
            return true;
        }
        return false;
    }

    logout(router: Router) {
        sessionStorage.removeItem(this.SESSION_KEY);
        this._loggedIn.set(false);
        router.navigate(['/login']);
    }
}
