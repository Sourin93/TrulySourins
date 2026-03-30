import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookService } from '../../services/book.service';
import { LanguageService } from '../../services/language.service';

interface StatItem {
  label: string;
  count: number;
  color: string;
  glow: string;
  emoji: string;
  desc: string;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="stats-page container">
      <header class="page-header">
        <div>
          <h1>{{ langService.t('stats.title') }}</h1>
          <p class="subtitle">{{ langService.t('stats.subtitle') }}</p>
        </div>
        <a routerLink="/" class="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/>
          </svg>
          {{ langService.t('stats.backBtn') }}
        </a>
      </header>

      <!-- Empty state -->
      <div class="empty" *ngIf="total() === 0">
        <div class="empty-icon">📚</div>
        <p>{{ langService.t('stats.noBooks') }} <a routerLink="/add">{{ langService.t('stats.addFirst') }}</a></p>
      </div>

      <ng-container *ngIf="total() > 0">

        <!-- Donut Chart + Legend -->
        <div class="chart-card">
          <div class="donut-wrap">
            <svg viewBox="0 0 200 200" class="donut-svg">
              <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="28"/>
              <ng-container *ngFor="let seg of segments()">
                <circle
                  cx="100" cy="100" r="80"
                  fill="none"
                  [attr.stroke]="seg.color"
                  stroke-width="28"
                  [attr.stroke-dasharray]="seg.dash"
                  [attr.stroke-dashoffset]="seg.offset"
                  stroke-linecap="round"
                  class="donut-seg"
                />
              </ng-container>
              <!-- Centre text -->
              <text x="100" y="95" text-anchor="middle" class="centre-num">{{ total() }}</text>
              <text x="100" y="114" text-anchor="middle" class="centre-label">{{ langService.t('stats.inLibrary') }}</text>
            </svg>
          </div>

          <div class="legend">
            <div class="legend-item" *ngFor="let s of stats()">
              <span class="legend-dot" [style.background]="s.color" [style.box-shadow]="'0 0 8px ' + s.glow"></span>
              <span class="legend-label">{{ s.label }}</span>
              <span class="legend-count" [style.color]="s.color">{{ s.count }}</span>
              <span class="legend-pct">{{ pct(s.count) }}%</span>
            </div>
          </div>
        </div>

        

        <!-- Author Breakdown -->
        <div class="hbar-card" *ngIf="authorStats().length > 0">
          <div class="section-header">
            <h3 class="section-title">{{ langService.t('stats.byAuthor') }}</h3>
            <span class="author-count-pill">{{ authorStats().length }} {{ authorStats().length !== 1 ? langService.t('stats.authors') : langService.t('stats.author') }}</span>
          </div>

          <!-- Top author callout -->
          <div class="top-author-card" *ngIf="topAuthor()">
            <span class="top-crown">👑</span>
            <div class="top-author-info">
              <span class="top-author-name">{{ topAuthor()!.author }}</span>
              <span class="top-author-sub">{{ langService.t('stats.mostBooks') }} — {{ topAuthor()!.count }} {{ langService.t('stats.inYourLibrary') }}</span>
            </div>
            <span class="top-author-count">{{ topAuthor()!.count }}</span>
          </div>

          <div class="hbar-list author-list">
            <div class="hbar-row" *ngFor="let a of authorStats(); let i = index">
              <span class="hbar-label author-label" [title]="a.author">{{ a.author }}</span>
              <div class="hbar-track">
                <div
                  class="hbar-fill"
                  [style.width]="authorPct(a.count) + '%'"
                  [style.background]="i === 0 ? '#f472b6' : '#818cf8'"
                  [style.box-shadow]="i === 0 ? '0 0 10px rgba(244,114,182,0.4)' : 'none'"
                ></div>
              </div>
              <span class="hbar-val" [style.color]="i === 0 ? '#f472b6' : '#818cf8'">{{ a.count }}</span>
            </div>
          </div>
        </div>

        <!-- Language Breakdown -->
        <div class="hbar-card" *ngIf="languageStats().length > 0">
          <div class="section-header">
            <h3 class="section-title">{{ langService.t('stats.byLanguage') }}</h3>
            <span class="author-count-pill" style="background: rgba(20,184,166,0.12); border-color: rgba(20,184,166,0.25); color: #5eead4;">
              {{ languageStats().length }} {{ languageStats().length !== 1 ? langService.t('stats.languages') : langService.t('stats.language') }}
            </span>
          </div>

          <!-- Top language callout -->
          <div class="top-author-card" *ngIf="topLanguage()" style="background: rgba(245,158,11,0.08); border-color: rgba(245,158,11,0.2);">
            <span class="top-crown">🌐</span>
            <div class="top-author-info">
              <span class="top-author-name" style="color: #fbbf24;">{{ topLanguage()!.language }}</span>
              <span class="top-author-sub">{{ langService.t('stats.mostCommon') }} — {{ topLanguage()!.count }} {{ langService.t('stats.inYourLibrary') }}</span>
            </div>
            <span class="top-author-count" style="color: #f59e0b;">{{ topLanguage()!.count }}</span>
          </div>

          <div class="hbar-list author-list">
            <div class="hbar-row" *ngFor="let l of languageStats(); let i = index">
              <span class="hbar-label author-label" [title]="l.language">{{ l.language }}</span>
              <div class="hbar-track">
                <div
                  class="hbar-fill"
                  [style.width]="languagePct(l.count) + '%'"
                  [style.background]="i === 0 ? '#f59e0b' : '#14b8a6'"
                  [style.box-shadow]="i === 0 ? '0 0 10px rgba(245,158,11,0.4)' : 'none'"
                ></div>
              </div>
              <span class="hbar-val" [style.color]="i === 0 ? '#f59e0b' : '#14b8a6'">{{ l.count }}</span>
            </div>
          </div>
        </div>

      </ng-container>
    </div>
  `,
  styles: [`
    .stats-page { padding-bottom: 3rem; }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    h1 { margin: 0; font-size: 2rem; letter-spacing: -0.02em; }
    .subtitle { color: var(--text-muted); margin: 0.25rem 0 0; }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 1rem;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 8px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.18s;
    }
    .back-btn svg { width: 16px; height: 16px; }
    .back-btn:hover { color: var(--text-main); border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.04); }

    /* ── Empty ── */
    .empty { text-align: center; padding: 5rem 1rem; color: var(--text-muted); }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
    .empty a { color: var(--primary); text-decoration: none; }
    .empty a:hover { text-decoration: underline; }

    /* ── Chart Card ── */
    .chart-card {
      display: flex;
      align-items: center;
      gap: 3rem;
      flex-wrap: wrap;
      background: var(--bg-card);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 20px;
      padding: 2rem 2.5rem;
      margin-bottom: 1.5rem;
      box-shadow: var(--shadow-lg);
    }

    .donut-wrap { flex-shrink: 0; width: 200px; height: 200px; }
    .donut-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .donut-seg { transition: stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1); }

    .centre-num {
      font-size: 2rem;
      font-weight: 800;
      fill: var(--text-main);
      transform: rotate(90deg);
      transform-origin: center;
    }
    .centre-label {
      font-size: 0.7rem;
      fill: var(--text-muted);
      font-weight: 500;
      transform: rotate(90deg);
      transform-origin: center;
    }

    .legend { flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 0.75rem; }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .legend-label { flex: 1; font-size: 0.9rem; color: var(--text-muted); }
    .legend-count { font-size: 1rem; font-weight: 700; }
    .legend-pct { font-size: 0.78rem; color: var(--text-muted); min-width: 36px; text-align: right; }

    /* ── Stat Cards ── */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: var(--shadow-lg);
      transition: transform 0.18s, box-shadow 0.18s;
    }
    .stat-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.35);
    }
    .card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
    .card-emoji { font-size: 1.5rem; }
    .card-count { font-size: 2.25rem; font-weight: 800; }
    .card-label { font-size: 0.95rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.25rem; }
    .card-desc { font-size: 0.78rem; color: var(--text-muted); margin-bottom: 1rem; }

    .card-bar-track { height: 4px; background: rgba(255,255,255,0.07); border-radius: 100px; overflow: hidden; margin-bottom: 0.4rem; }
    .card-bar-fill { height: 100%; border-radius: 100px; transition: width 0.6s cubic-bezier(.4,0,.2,1); }
    .card-pct { font-size: 0.75rem; font-weight: 600; }

    /* ── Horizontal Bar Chart ── */
    .hbar-card {
      background: var(--bg-card);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 20px;
      padding: 1.75rem 2rem;
      box-shadow: var(--shadow-lg);
      margin-bottom: 1.5rem;
    }
    .section-title {
      margin: 0 0 1.5rem;
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .hbar-list { display: flex; flex-direction: column; gap: 1.1rem; }
    .hbar-row { display: flex; align-items: center; gap: 1rem; }
    .hbar-label { width: 130px; font-size: 0.875rem; color: var(--text-muted); flex-shrink: 0; }
    .hbar-track { flex: 1; height: 10px; background: rgba(255,255,255,0.06); border-radius: 100px; overflow: hidden; }
    .hbar-fill { height: 100%; border-radius: 100px; transition: width 0.6s cubic-bezier(.4,0,.2,1); min-width: 4px; }
    .hbar-val { width: 28px; text-align: right; font-size: 0.875rem; font-weight: 700; flex-shrink: 0; }

    @media (max-width: 600px) {
      .chart-card { flex-direction: column; align-items: center; padding: 1.5rem 1rem; gap: 1.5rem; text-align: center; }
      .legend { width: 100%; align-items: center; }
      .legend-item { justify-content: center; width: 100%; max-width: 250px; }
      .hbar-label { width: 100px; font-size: 0.8rem; }
      .donut-wrap { width: 150px; height: 150px; }
      h1 { font-size: 1.6rem; }
      .empty-icon { font-size: 2.5rem; }
    }
    @media (max-width: 400px) {
      .top-author-card { flex-direction: column; text-align: center; gap: 0.5rem; }
    }
    /* Author section */
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
    .section-header .section-title { margin: 0; }
    .author-count-pill {
      font-size: 0.75rem; font-weight: 600;
      padding: 0.2rem 0.65rem;
      background: rgba(129,140,248,0.12);
      border: 1px solid rgba(129,140,248,0.25);
      border-radius: 100px;
      color: #a5b4fc;
    }
    .top-author-card {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: rgba(244,114,182,0.08);
      border: 1px solid rgba(244,114,182,0.2);
      border-radius: 12px;
      margin-bottom: 1.25rem;
    }
    .top-crown { font-size: 1.25rem; flex-shrink: 0; }
    .top-author-info { flex: 1; min-width: 0; }
    .top-author-name { display: block; font-weight: 700; font-size: 0.95rem; color: #f9a8d4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .top-author-sub { font-size: 0.75rem; color: var(--text-muted); }
    .top-author-count { font-size: 1.5rem; font-weight: 800; color: #f472b6; flex-shrink: 0; }
    .author-list { max-height: 320px; overflow-y: auto; padding-right: 0.25rem; }
    .author-label { width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  `]
})
export class StatsComponent {
  private bookService = inject(BookService);
  langService = inject(LanguageService);

  total = computed(() =>
    this.bookService.books().filter(b => b.status !== 'Wishlist').length
  );

  /** Books grouped by author, sorted by count desc */
  authorStats = computed(() => {
    const map = new Map<string, number>();
    for (const b of this.bookService.books()) {
      map.set(b.author, (map.get(b.author) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([author, count]) => ({ author, count }))
      .sort((a, b) => b.count - a.count);
  });

  topAuthor = computed(() => this.authorStats()[0] ?? null);

  /** Max count among authors — used to scale the author bars */
  private maxAuthorCount = computed(() => this.authorStats()[0]?.count ?? 1);

  authorPct(count: number): number {
    return Math.round((count / this.maxAuthorCount()) * 100);
  }

  /** Books grouped by language, sorted by count desc */
  languageStats = computed(() => {
    const map = new Map<string, number>();
    for (const b of this.bookService.books()) {
      const lang = b.language || 'Unknown';
      map.set(lang, (map.get(lang) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count);
  });

  topLanguage = computed(() => this.languageStats()[0] ?? null);

  private maxLanguageCount = computed(() => this.languageStats()[0]?.count ?? 1);

  languagePct(count: number): number {
    return Math.round((count / this.maxLanguageCount()) * 100);
  }

  stats = computed<StatItem[]>(() => [
    {
      label: this.langService.t('stats.completed'),
      count: this.bookService.completedBooks().length,
      color: '#34d399', glow: 'rgba(52,211,153,0.4)', emoji: '✅',
      desc: 'Books you have finished reading'
    },
    {
      label: this.langService.t('stats.reading'),
      count: this.bookService.readingBooks().length,
      color: '#60a5fa', glow: 'rgba(96,165,250,0.4)', emoji: '📖',
      desc: 'Currently in progress'
    },
    {
      label: this.langService.t('stats.yetToRead'),
      count: this.bookService.wantToReadBooks().length,
      color: '#a78bfa', glow: 'rgba(167,139,250,0.4)', emoji: '🔖',
      desc: 'On your reading wishlist'
    },
    {
      label: this.langService.t('stats.lentOut'),
      count: this.bookService.lentBooks().length,
      color: '#fb923c', glow: 'rgba(251,146,60,0.4)', emoji: '🤝',
      desc: 'Shared with others'
    },
    {
      label: this.langService.t('stats.borrowed'),
      count: this.bookService.borrowedBooks().length,
      color: '#2dd4bf', glow: 'rgba(45,212,191,0.4)', emoji: '📥',
      desc: 'Borrowed from friends'
    }
  ]);

  pct(count: number): number {
    const t = this.total();
    if (!t) return 0;
    return Math.round((count / t) * 100);
  }

  /** Build donut segments (stroke-dasharray / dashoffset) */
  segments = computed(() => {
    const circumference = 2 * Math.PI * 80; // r=80
    const items = this.stats();
    const t = this.total() || 1;
    let cumulative = 0;

    return items.map(s => {
      const ratio = s.count / t;
      const dash = `${ratio * circumference} ${circumference}`;
      const offset = -cumulative * circumference;
      cumulative += ratio;
      return { ...s, dash, offset };
    });
  });
}
