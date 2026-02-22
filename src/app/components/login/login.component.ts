import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="login-page">
      <!-- Background blobs -->
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>

      <div class="login-card">
        <!-- Logo -->
        <div class="logo-wrap">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
            </svg>
          </div>
          <h1 class="brand">Truly Sourin's</h1>
          <p class="tagline">Your personal reading universe 📚</p>
        </div>

        <!-- Form -->
        <form class="form" (ngSubmit)="submit()" #f="ngForm">
          <div class="field">
            <label for="pin">Enter your PIN</label>
            <div class="pin-wrap">
              <svg class="pin-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clip-rule="evenodd" />
              </svg>
              <input
                id="pin"
                name="pin"
                [type]="showPin() ? 'text' : 'password'"
                inputmode="numeric"
                placeholder="••••"
                [(ngModel)]="pin"
                required
                autocomplete="current-password"
                [class.shake]="shaking()"
                (animationend)="shaking.set(false)"
              />
              <button type="button" class="toggle-btn" (click)="showPin.set(!showPin())" tabindex="-1">
                <svg *ngIf="!showPin()" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/><path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.185A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clip-rule="evenodd"/></svg>
                <svg *ngIf="showPin()" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z" clip-rule="evenodd"/><path d="M10.748 13.93l2.523 2.523a10.055 10.055 0 0 1-5.27 0l2.747-2.523ZM10 3c-.975 0-1.926.14-2.83.402l1.153 1.153A6.002 6.002 0 0 1 16 10c0 .734-.13 1.437-.368 2.09l2.064 2.065A10.044 10.044 0 0 0 20 10a1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 10 3Z"/></svg>
              </button>
            </div>
            <div class="error-msg" [class.visible]="error()">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"/></svg>
              Incorrect PIN. Please try again.
            </div>
          </div>

          <button type="submit" class="submit-btn" [disabled]="!pin">
            <span *ngIf="!loading()">Unlock Library</span>
            <span *ngIf="loading()" class="spinner"></span>
          </button>
        </form>
      </div>
    </div>
  `,
    styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-app, #0f172a);
      position: relative;
      overflow: hidden;
      padding: 1rem;
    }

    /* Decorative blobs */
    .blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
      opacity: 0.18;
      pointer-events: none;
    }
    .blob-1 {
      width: 500px; height: 500px;
      background: #6366f1;
      top: -120px; left: -120px;
      animation: float 8s ease-in-out infinite;
    }
    .blob-2 {
      width: 400px; height: 400px;
      background: #a855f7;
      bottom: -100px; right: -100px;
      animation: float 10s ease-in-out infinite reverse;
    }
    .blob-3 {
      width: 300px; height: 300px;
      background: #06b6d4;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      animation: float 12s ease-in-out infinite 2s;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0) scale(1); }
      50%       { transform: translateY(-30px) scale(1.05); }
    }

    /* Card */
    .login-card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 420px;
      background: rgba(30, 41, 59, 0.85);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 2.5rem 2rem;
      box-shadow: 0 32px 64px rgba(0,0,0,0.5);
      backdrop-filter: blur(24px);
      animation: card-in 0.4s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes card-in {
      from { opacity: 0; transform: translateY(30px) scale(0.96); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Logo */
    .logo-wrap {
      text-align: center;
      margin-bottom: 2rem;
    }
    .logo-icon {
      width: 56px; height: 56px;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 0.9rem;
      padding: 12px;
      color: white;
      box-shadow: 0 8px 24px rgba(99,102,241,0.35);
    }
    .logo-icon svg { width: 100%; height: 100%; }
    .brand {
      margin: 0 0 0.35rem;
      font-size: 1.6rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      background: linear-gradient(90deg, #e2e8f0, #a5b4fc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .tagline {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-muted, #64748b);
    }

    /* Form */
    .form { display: flex; flex-direction: column; gap: 1.25rem; }

    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    label {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-muted, #94a3b8);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .pin-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .pin-icon {
      position: absolute;
      left: 0.85rem;
      width: 17px; height: 17px;
      color: #64748b;
      pointer-events: none;
    }
    input {
      width: 100%;
      padding: 0.75rem 3rem 0.75rem 2.6rem;
      background: rgba(0,0,0,0.25);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      color: var(--text-main, #e2e8f0);
      font-size: 1.1rem;
      font-family: inherit;
      letter-spacing: 0.2em;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    input::placeholder { letter-spacing: 0.15em; }
    input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.2);
    }
    input.shake {
      animation: shake 0.45s ease;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-8px); }
      40%       { transform: translateX(8px); }
      60%       { transform: translateX(-6px); }
      80%       { transform: translateX(6px); }
    }
    .toggle-btn {
      position: absolute;
      right: 0.75rem;
      background: transparent;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 0.2rem;
      display: flex;
    }
    .toggle-btn svg { width: 18px; height: 18px; }
    .toggle-btn:hover { color: #94a3b8; }

    .error-msg {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      color: #f87171;
      opacity: 0;
      transform: translateY(-4px);
      transition: opacity 0.2s, transform 0.2s;
      pointer-events: none;
    }
    .error-msg svg { width: 13px; height: 13px; flex-shrink: 0; }
    .error-msg.visible { opacity: 1; transform: translateY(0); }

    .submit-btn {
      width: 100%;
      padding: 0.85rem;
      border-radius: 12px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border: none;
      color: #fff;
      font-size: 1rem;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      transition: opacity 0.18s, transform 0.18s, box-shadow 0.18s;
      box-shadow: 0 4px 20px rgba(99,102,241,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 48px;
    }
    .submit-btn:hover:not(:disabled) {
      opacity: 0.92;
      transform: translateY(-1px);
      box-shadow: 0 8px 28px rgba(99,102,241,0.5);
    }
    .submit-btn:active:not(:disabled) { transform: translateY(0); }
    .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }

    .spinner {
      width: 20px; height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoginComponent {
    private auth = inject(AuthService);
    private router = inject(Router);

    pin = '';
    showPin = signal(false);
    error = signal(false);
    loading = signal(false);
    shaking = signal(false);

    submit() {
        if (!this.pin) return;
        this.loading.set(true);
        this.error.set(false);

        // Tiny artificial delay so the spinner is visible
        setTimeout(() => {
            const ok = this.auth.login(this.pin);
            this.loading.set(false);
            if (ok) {
                this.router.navigate(['/']);
            } else {
                this.error.set(true);
                this.shaking.set(true);
                this.pin = '';
            }
        }, 400);
    }
}
