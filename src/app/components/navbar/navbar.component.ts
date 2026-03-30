import { Component, inject, signal, computed, HostListener, ViewChild, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookService } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';
import { ExcelService } from '../../services/excel.service';
import { ManualService } from '../../services/manual.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-inner">
        <!-- Brand -->
        <a routerLink="/" class="brand">
          <div class="brand-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
            </svg>
          </div>
          <span class="brand-name">Truly Sourin's</span>
        </a>

        <!-- Nav Links -->
        <div class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" /><path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" /></svg>
            <span>{{ langService.t('nav.library') }}</span>
          </a>
          <a routerLink="/add" routerLinkActive="active" class="nav-link">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" /></svg>
            <span>{{ langService.t('nav.addBook') }}</span>
          </a>
          <a routerLink="/stats" routerLinkActive="active" class="nav-link">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 3 0v-13A1.5 1.5 0 0 0 15.5 2ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9a1.5 1.5 0 0 0 3 0v-9A1.5 1.5 0 0 0 9.5 6ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5a1.5 1.5 0 0 0 3 0v-5A1.5 1.5 0 0 0 3.5 10Z"/></svg>
            <span>{{ langService.t('nav.statistics') }}</span>
          </a>
        </div>

        <!-- Right-side action strip -->
        <div class="action-strip">

          <!-- Tool group: Manual, Export, Import -->
          <div class="tool-group">
            <!-- Hidden file input -->
            <input
              #fileInput
              type="file"
              accept=".xlsx"
              style="display:none"
              (change)="onFileSelected($event)"
            />

            <button class="tool-btn manual-btn" (click)="downloadManual()" aria-label="Download manual">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0-6a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clip-rule="evenodd" />
              </svg>
              <span class="tool-label">{{ langService.t('nav.manual') }}</span>
            </button>

            <div class="tool-divider"></div>

            <button class="tool-btn export-btn" (click)="exportBooks()" aria-label="Export to Excel">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 2a.75.75 0 0 1 .75.75v8.69l2.97-2.97a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.53a.75.75 0 1 1 1.06-1.06L9.25 11.44V2.75A.75.75 0 0 1 10 2ZM3.5 14.75a.75.75 0 0 0-1.5 0v.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-.5a.75.75 0 0 0-1.5 0v.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-.5Z" clip-rule="evenodd"/>
              </svg>
              <span class="tool-label">{{ langService.t('nav.export') }}</span>
            </button>

            <button class="tool-btn import-btn" (click)="triggerImport()" aria-label="Import from Excel">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a.75.75 0 0 1-.75-.75V8.56L6.28 11.53a.75.75 0 1 1-1.06-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06l-2.97-2.97v8.69A.75.75 0 0 1 10 18ZM3.5 5.25A2.75 2.75 0 0 1 6.25 2.5h7.5A2.75 2.75 0 0 1 16.5 5.25v.5a.75.75 0 0 1-1.5 0v-.5c0-.69-.56-1.25-1.25-1.25h-7.5C5.56 4 5 4.56 5 5.25v.5a.75.75 0 0 1-1.5 0v-.5Z" clip-rule="evenodd"/>
              </svg>
              <span class="tool-label">{{ langService.t('nav.import') }}</span>
            </button>
          </div>

          <!-- Divider -->
          <div class="strip-sep"></div>

          <!-- Stats Pills -->
          <div class="nav-stats">
            <div class="stat-pill-wrapper">
              <div class="stat-pill">
                <span class="stat-dot reading-dot"></span>
                <span>{{ bookService.readingBooks().length }} {{ langService.t('nav.reading') }}</span>
              </div>
              <div class="stat-dropdown" *ngIf="bookService.readingBooks().length > 0">
                <div class="stat-dropdown-title">{{ langService.t('nav.reading') }}</div>
                <ul class="stat-dropdown-list">
                  <li class="stat-dropdown-item" *ngFor="let b of bookService.readingBooks().slice(0, 5)">
                    {{ b.title }}
                  </li>
                </ul>
                <a routerLink="/" [queryParams]="{status: 'Reading'}" class="stat-dropdown-more" *ngIf="bookService.readingBooks().length > 5">
                  More...
                </a>
              </div>
            </div>
            
            <div class="stat-pill-wrapper" *ngIf="bookService.lentBooks().length > 0">
              <div class="stat-pill lent">
                <span class="stat-dot lent-dot"></span>
                <span>{{ bookService.lentBooks().length }} {{ langService.t('nav.lent') }}</span>
              </div>
              <div class="stat-dropdown">
                <div class="stat-dropdown-title">{{ langService.t('nav.lent') }}</div>
                <ul class="stat-dropdown-list">
                  <li class="stat-dropdown-item" *ngFor="let b of bookService.lentBooks().slice(0, 5)">
                    {{ b.title }}
                  </li>
                </ul>
                <a routerLink="/" [queryParams]="{status: 'Lent Out'}" class="stat-dropdown-more" *ngIf="bookService.lentBooks().length > 5">
                  More...
                </a>
              </div>
            </div>
          </div>

          <!-- Divider (only when bell is shown) -->
          <div class="strip-sep" *ngIf="visibleAlerts().length > 0"></div>

          <!-- Notification Bell -->
          <div class="notif-wrap" *ngIf="visibleAlerts().length > 0">
            <button
              class="tool-btn bell-btn"
              [class.has-red]="hasRed()"
              (click)="togglePanel($event)"
              aria-label="Notifications">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.297-1.206A6.994 6.994 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z" clip-rule="evenodd" />
              </svg>
              <span class="bell-badge">{{ visibleAlerts().length }}</span>
            </button>

            <!-- Dropdown panel -->
            <div class="notif-panel" *ngIf="panelOpen()" (click)="$event.stopPropagation()">
              <div class="notif-header">
                <span class="notif-title">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"/></svg>
                  {{ langService.t('nav.overdueLent') }}
                </span>
                <button class="clear-all" (click)="clearAll()">{{ langService.t('nav.clearAll') }}</button>
              </div>

              <ul class="notif-list">
                <li
                  *ngFor="let a of visibleAlerts()"
                  class="notif-item"
                  [class.severity-red]="a.severity === 'red'"
                  [class.severity-orange]="a.severity === 'orange'">
                  <div class="notif-sev-dot" [class.red]="a.severity === 'red'" [class.orange]="a.severity === 'orange'"></div>
                  <div class="notif-body">
                    <div class="notif-book-title">{{ a.title }}</div>
                    <div class="notif-meta">
                      {{ langService.t('nav.lentTo') }} <strong>{{ a.borrowedBy }}</strong>
                      &nbsp;·&nbsp;
                      <span [class.text-red]="a.severity === 'red'" [class.text-orange]="a.severity === 'orange'">
                        {{ a.months }} {{ langService.t('nav.monthsAgo') }}
                      </span>
                    </div>
                    <div class="notif-since">{{ langService.t('nav.since') }} {{ a.since }}</div>
                  </div>
                  <button class="dismiss-btn" (click)="dismiss(a.id)" title="Dismiss">×</button>
                </li>
              </ul>
            </div>
          </div>

          <!-- Divider -->
          <div class="strip-sep"></div>

          <!-- Language Toggle -->
          <button class="lang-toggle" (click)="langService.toggle()" [title]="langService.isBengali ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'">
            <span [class.active-lang]="!langService.isBengali">EN</span>
            <span class="lang-sep">|</span>
            <span [class.active-lang]="langService.isBengali">বাং</span>
          </button>

          <!-- Divider -->
          <div class="strip-sep"></div>

          <!-- Logout -->
          <button class="tool-btn logout-btn" (click)="logout()" aria-label="Lock library">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Zm13.03 4.97-1.72-1.72a.75.75 0 0 0-1.06 1.06l.47.47H8a.75.75 0 0 0 0 1.5h5.72l-.47.47a.75.75 0 1 0 1.06 1.06l1.72-1.72a.75.75 0 0 0 0-1.06Z" clip-rule="evenodd"/>
            </svg>
          </button>

        </div><!-- /action-strip -->

        <!-- Import toast -->
        <div class="import-toast" *ngIf="toastMsg()">
          {{ toastMsg() }}
        </div>

      </div>
    </nav>
  `,
  styles: [`
    /* ── Navbar Shell ── */
    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(15, 23, 42, 0.80);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }

    .nav-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1.5rem;
      height: 60px;
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    /* ── Brand ── */
    .brand {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      text-decoration: none;
      color: var(--text-main);
      flex-shrink: 0;
    }
    .brand-icon {
      width: 34px;
      height: 34px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      color: white;
    }
    .brand-name {
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      background: linear-gradient(90deg, #e2e8f0, #a5b4fc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* ── Nav Links ── */
    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.15rem;
      flex: 1;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.42rem 0.85rem;
      border-radius: 8px;
      text-decoration: none;
      color: var(--text-muted);
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.18s ease;
      white-space: nowrap;
    }
    .nav-link svg { width: 15px; height: 15px; }
    .nav-link:hover {
      color: var(--text-main);
      background: rgba(255,255,255,0.06);
    }
    .nav-link.active {
      color: var(--text-main);
      background: rgba(99, 102, 241, 0.14);
    }

    /* ── Right Action Strip ── */
    .action-strip {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    /* Vertical separator between groups */
    .strip-sep {
      width: 1px;
      height: 22px;
      background: rgba(255,255,255,0.1);
      flex-shrink: 0;
    }

    /* ── Tool Group (Manual, Export, Import) ── */
    .tool-group {
      display: flex;
      align-items: center;
      gap: 0;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 10px;
      position: relative; /* needed so tooltips don't get clipped */
    }
    /* Round the outer edges of first/last button in the group */
    .tool-group .tool-btn:first-child { border-radius: 9px 0 0 9px; }
    .tool-group .tool-btn:last-child  { border-radius: 0 9px 9px 0; }

    /* Thin inner divider between buttons inside tool-group */
    .tool-divider {
      width: 1px;
      height: 20px;
      background: rgba(255,255,255,0.08);
      flex-shrink: 0;
    }

    /* ── Base icon button (shared by all action buttons) ── */
    .tool-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.3rem;
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      transition: color 0.18s ease, background 0.18s ease;
      flex-shrink: 0;
    }
    .tool-btn svg { width: 16px; height: 16px; }
    .tool-btn:hover { color: var(--text-main); background: rgba(255,255,255,0.08); }

    /* Floating label that appears on hover */
    .tool-label {
      position: absolute;
      top: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.12);
      color: #e2e8f0;
      font-size: 0.72rem;
      font-weight: 500;
      padding: 0.25rem 0.55rem;
      border-radius: 6px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
      z-index: 300;
    }
    .tool-btn:hover .tool-label { opacity: 1; }

    /* Per-button colour accents */
    .manual-btn:hover { color: #a5b4fc; background: rgba(99,102,241,0.12); }
    .export-btn:hover { color: #86efac; background: rgba(34,197,94,0.1); }
    .import-btn:hover { color: #7dd3fc; background: rgba(56,189,248,0.1); }

    /* Bell button quirks (badge + shake) */
    .bell-btn { border-radius: 9px; }
    .bell-btn svg { width: 18px; height: 18px; }
    .bell-btn.has-red {
      animation: bell-shake 3s ease-in-out infinite;
      color: #f87171;
    }
    @keyframes bell-shake {
      0%, 85%, 100% { transform: rotate(0deg); }
      88%            { transform: rotate(-12deg); }
      91%            { transform: rotate(12deg); }
      94%            { transform: rotate(-8deg); }
      97%            { transform: rotate(8deg); }
    }

    .bell-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 17px;
      height: 17px;
      padding: 0 3px;
      border-radius: 100px;
      background: #ef4444;
      color: #fff;
      font-size: 0.65rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(15,23,42,0.9);
    }

    /* Logout */
    .logout-btn { border-radius: 9px; }
    .logout-btn:hover { color: #f87171; background: rgba(239,68,68,0.1); }

    /* ── Stats Pills ── */
    .nav-stats {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .stat-pill-wrapper {
      position: relative;
    }
    .stat-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%) translateY(-6px) scale(0.97);
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 0.75rem;
      min-width: 180px;
      box-shadow: 0 12px 24px rgba(0,0,0,0.4);
      opacity: 0;
      pointer-events: none;
      transition: all 0.2s ease;
      z-index: 200;
    }
    .stat-pill-wrapper:hover .stat-dropdown {
      opacity: 1;
      pointer-events: auto;
      transform: translateX(-50%) translateY(0) scale(1);
    }
    .stat-dropdown-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 0.4rem;
      padding-bottom: 0.4rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      text-align: center;
    }
    .stat-dropdown-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .stat-dropdown-item {
      font-size: 0.85rem;
      color: var(--text-main);
      padding: 0.35rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 220px;
    }
    .stat-dropdown-more {
      display: block;
      margin-top: 0.4rem;
      padding-top: 0.4rem;
      border-top: 1px solid rgba(255,255,255,0.08);
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--primary);
      text-align: center;
      text-decoration: none;
      transition: color 0.15s;
    }
    .stat-dropdown-more:hover {
      color: #a5b4fc;
    }

    .stat-pill {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.65rem;
      border-radius: 100px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      font-size: 0.76rem;
      color: var(--text-muted);
      white-space: nowrap;
    }
    .stat-pill.lent {
      border-color: rgba(168, 85, 247, 0.3);
      background: rgba(168, 85, 247, 0.08);
      color: #d8b4fe;
    }
    .stat-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .reading-dot { background: var(--status-reading); }
    .lent-dot    { background: var(--status-lent); }

    /* ── Notification dropdown ── */
    .notif-wrap { position: relative; }

    .notif-panel {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: 330px;
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 14px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      overflow: hidden;
      animation: panel-in 0.18s ease;
      z-index: 200;
    }
    @keyframes panel-in {
      from { opacity: 0; transform: translateY(-6px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)    scale(1); }
    }

    .notif-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.85rem 1rem 0.7rem;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .notif-title {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--text-muted);
    }
    .notif-title svg { width: 13px; height: 13px; color: #f59e0b; }

    .clear-all {
      font-size: 0.76rem;
      color: #818cf8;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      transition: all 0.15s;
    }
    .clear-all:hover { background: rgba(99,102,241,0.15); color: #a5b4fc; }

    .notif-list {
      list-style: none;
      margin: 0;
      padding: 0.4rem 0;
      max-height: 340px;
      overflow-y: auto;
    }
    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      padding: 0.65rem 1rem;
      border-left: 3px solid transparent;
      transition: background 0.15s;
      position: relative;
    }
    .notif-item:hover { background: rgba(255,255,255,0.04); }
    .notif-item.severity-red    { border-left-color: #ef4444; background: rgba(239,68,68,0.04); }
    .notif-item.severity-orange { border-left-color: #f97316; background: rgba(249,115,22,0.04); }

    /* Coloured dot replacing the emoji */
    .notif-sev-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 0.35rem;
    }
    .notif-sev-dot.red    { background: #ef4444; }
    .notif-sev-dot.orange { background: #f97316; }

    .notif-body { flex: 1; min-width: 0; }
    .notif-book-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .notif-meta { font-size: 0.76rem; color: var(--text-muted); margin-top: 0.12rem; }
    .notif-since { font-size: 0.7rem; color: var(--text-muted); opacity: 0.6; margin-top: 0.08rem; }

    .text-red    { color: #f87171; font-weight: 600; }
    .text-orange { color: #fdba74; font-weight: 600; }

    .dismiss-btn {
      flex-shrink: 0;
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 1.1rem;
      line-height: 1;
      padding: 0.1rem 0.3rem;
      border-radius: 4px;
      cursor: pointer;
      opacity: 0.5;
      transition: opacity 0.15s, color 0.15s;
    }
    .dismiss-btn:hover { opacity: 1; color: var(--text-main); }

    /* ── Toast ── */
    .import-toast {
      position: fixed;
      bottom: 1.5rem;
      left: 50%;
      transform: translateX(-50%);
      background: #1e293b;
      border: 1px solid rgba(99,102,241,0.4);
      color: #a5b4fc;
      padding: 0.55rem 1.2rem;
      border-radius: 100px;
      font-size: 0.85rem;
      font-weight: 500;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      z-index: 9999;
      animation: toast-in 0.2s ease;
      white-space: nowrap;
    }
    @keyframes toast-in {
      from { opacity: 0; transform: translateX(-50%) translateY(8px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }

    /* ── Language Toggle ── */
    .lang-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      padding: 0.25rem 0.65rem;
      border-radius: 100px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.12);
      color: var(--text-muted);
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.18s ease;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .lang-toggle:hover {
      background: rgba(165,180,252,0.1);
      border-color: rgba(165,180,252,0.3);
      color: var(--text-main);
    }
    .lang-sep { opacity: 0.35; margin: 0 0.1rem; }
    .active-lang {
      color: #a5b4fc;
      font-weight: 800;
    }

    /* ── Responsive ── */
    @media (max-width: 800px) {
      .nav-inner { gap: 0.75rem; padding: 0 1rem; }
      .brand-name { display: none; }
      .nav-stats  { display: none; }
      .tool-label { display: none; }
      .notif-panel { width: calc(100vw - 2rem); right: -1rem; }
    }
    @media (max-width: 580px) {
      .nav-link span { display: none; }
      .nav-link { padding: 0.42rem 0.6rem; }
      .tool-btn { width: 32px; height: 32px; }
      .strip-sep { display: none; }
      .nav-inner { justify-content: space-between; gap: 0.25rem; padding: 0 0.5rem; }
    }
    @media (max-width: 480px) {
      .manual-btn, .export-btn { display: none; }
      .tool-divider:nth-child(2), .tool-divider:nth-child(4) { display: none; }
      .tool-group .import-btn { border-radius: 9px; }
      .lang-toggle { padding: 0.2rem 0.4rem; font-size: 0.7rem; }
    }
  `]
})
export class NavbarComponent {
  bookService = inject(BookService);
  langService = inject(LanguageService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private excelService = inject(ExcelService);
  private manualService = inject(ManualService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  panelOpen = signal(false);
  toastMsg = signal<string | null>(null);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  /** IDs dismissed this session — resets on every app load */
  dismissed = signal<Set<string>>(new Set());

  private get now() { return Date.now(); }

  private monthsLent(lentDate: string): number {
    return (this.now - new Date(lentDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  }

  /** All overdue alerts — recalculated reactively from live book data */
  allAlerts = computed(() =>
    this.bookService.lentBooks()
      .filter(b => b.lentDate && this.monthsLent(b.lentDate) >= 3)
      .map(b => {
        const months = this.monthsLent(b.lentDate!);
        return {
          id: b.id,
          title: b.title,
          borrowedBy: b.borrowedBy ?? '—',
          months: Math.floor(months),
          since: new Date(b.lentDate!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          severity: months >= 6 ? 'red' : 'orange'
        };
      })
      .sort((a, b) => b.months - a.months)   // most overdue first
  );

  /** Alerts not yet dismissed this session */
  visibleAlerts = computed(() => {
    const d = this.dismissed();
    return this.allAlerts().filter(a => !d.has(a.id));
  });

  hasRed = computed(() => this.visibleAlerts().some(a => a.severity === 'red'));

  togglePanel(e: Event) {
    e.stopPropagation();
    this.panelOpen.update(v => !v);
  }

  dismiss(id: string) {
    this.dismissed.update(s => new Set([...s, id]));
    if (this.visibleAlerts().length === 0) this.panelOpen.set(false);
  }

  clearAll() {
    const allIds = this.allAlerts().map(a => a.id);
    this.dismissed.set(new Set(allIds));
    this.panelOpen.set(false);
  }

  /** Close panel when clicking anywhere outside */
  @HostListener('document:click')
  onDocClick() { this.panelOpen.set(false); }

  logout() { this.authService.logout(this.router); }

  downloadManual() { this.manualService.download(); }

  // ── Excel ────────────────────────────────────────────────────────────────

  exportBooks() {
    const books = this.bookService.books();
    if (books.length === 0) {
      this.showToast('📭 No books to export');
      return;
    }
    this.excelService.export(books);
    this.showToast(`📥 ${books.length} book${books.length !== 1 ? 's' : ''} exported`);
  }

  triggerImport() {
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const confirmed = confirm(
      'Importing will REPLACE all current books with the data from the Excel file.\n\nContinue?'
    );
    if (!confirmed) return;

    try {
      const { books, skippedMessages } = await this.excelService.import(file);
      this.bookService.books.set(books);

      const skippedCount = skippedMessages.length;
      const msg = `✅ ${books.length} book${books.length !== 1 ? 's' : ''} imported` +
        (skippedCount > 0 ? ` · ${skippedCount} row${skippedCount !== 1 ? 's' : ''} skipped` : '');
      this.showToast(msg);

      if (skippedCount > 0) {
        alert(`The following rows were skipped:\n\n${skippedMessages.join('\n')}`);
      }
    } catch {
      this.showToast('❌ Failed to read the Excel file');
    }
  }

  private showToast(msg: string) {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMsg.set(msg);
    this.toastTimer = setTimeout(() => this.toastMsg.set(null), 3500);
  }
}
