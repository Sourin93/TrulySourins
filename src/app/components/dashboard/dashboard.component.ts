import { Component, inject, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../services/book.service';
import { BookCardComponent } from '../book-card/book-card.component';
import { Book, BookCategory, BookLanguage, BookGenre } from '../../models/book.model';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BookCardComponent, RouterLink, FormsModule],
  template: `
    <div class="dashboard container">
      <header class="header">
        <div class="header-left">
          <h1>{{ langService.t('dash.title') }}</h1>
          <p class="subtitle">{{ langService.t('dash.subtitle') }}</p>
        </div>

        <!-- Search Bar -->
        <div class="search-wrap">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clip-rule="evenodd" />
          </svg>
          <input
            class="search-input"
            type="text"
            placeholder="Search by title, author, genre, language…"
            [value]="searchQuery()"
            (input)="onSearch($any($event.target).value)"
          />
          <button class="clear-btn" *ngIf="searchQuery()" (click)="onSearch('')" title="Clear">&times;</button>
        </div>

        <a routerLink="/add" class="btn btn-primary">{{ langService.t('dash.addBook') }}</a>
      </header>

      <!-- Status Filter Tabs -->
      <div class="filters">
        <button
          *ngFor="let filter of statusFilters(); let i = index"
          class="filter-tab"
          [class.active]="activeStatus() === STATUS_VALUES[i]"
          (click)="setStatus(i)">
          {{ filter }}
        </button>
      </div>

      <!-- Advanced Filters Row -->
      <div class="adv-filters">
        <!-- Author -->
        <div class="filter-group">
          <label class="filter-label">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z"/></svg>
            {{ langService.t('dash.author') }}
          </label>
          <select class="filter-select" [ngModel]="authorFilter()" (ngModelChange)="setAuthor($event)">
            <option value="">{{ langService.t('dash.all') }}</option>
            <option *ngFor="let a of authors()" [value]="a">{{ a }}</option>
          </select>
        </div>

        <!-- Language -->
        <div class="filter-group">
          <label class="filter-label">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.198 0.955a.75.75 0 0 1 .605-.005l7 3a.75.75 0 0 1 0 1.386l-7 3a.75.75 0 0 1-.61-.008L.802 5.41A.75.75 0 0 1 .8 4.022l6.398-3.067Zm7.598 7.224a.75.75 0 0 1 .004 1.342l-7 3a.75.75 0 0 1-.604.001l-7-3A.75.75 0 0 1 .2 8.18l6.996 2.998 6.6-2.999Z" clip-rule="evenodd"/></svg>
            {{ langService.t('dash.language') }}
          </label>
          <select class="filter-select" [ngModel]="langFilter()" (ngModelChange)="setLang($event)">
            <option value="">{{ langService.t('dash.all') }}</option>
            <option *ngFor="let l of languages" [value]="l">{{ l }}</option>
          </select>
        </div>

        <!-- Genre -->
        <div class="filter-group">
          <label class="filter-label">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3Zm0 6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9Zm1 5a1 1 0 0 0 0 2h14a1 1 0 0 0 0-2H3Z"/></svg>
            {{ langService.t('dash.genre') }}
          </label>
          <select class="filter-select" [ngModel]="genreFilter()" (ngModelChange)="setGenre($event)">
            <option value="">{{ langService.t('dash.all') }}</option>
            <option *ngFor="let g of genres" [value]="g">{{ g }}</option>
          </select>
        </div>

        <!-- Category -->
        <div class="filter-group">
          <label class="filter-label">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.5 3A2.5 2.5 0 0 0 3 5.5v2.879a2.5 2.5 0 0 0 .732 1.767l6.5 6.5a2.5 2.5 0 0 0 3.536 0l2.878-2.878a2.5 2.5 0 0 0 0-3.536l-6.5-6.5A2.5 2.5 0 0 0 8.38 3H5.5ZM6 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"/></svg>
            {{ langService.t('dash.category') }}
          </label>
          <select class="filter-select" [ngModel]="catFilter()" (ngModelChange)="setCat($event)">
            <option value="">{{ langService.t('dash.all') }}</option>
            <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
          </select>
        </div>

        <!-- Page size selector -->
        <div class="filter-group page-size-group">
          <label class="filter-label">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm0 4a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm0 4a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Z"/></svg>
            {{ langService.t('dash.perPage') }}
          </label>
          <select class="filter-select" [ngModel]="pageSize()" (ngModelChange)="setPageSize(+$event)">
            <option [value]="6">6</option>
            <option [value]="9">9</option>
            <option [value]="12">12</option>
            <option [value]="24">24</option>
          </select>
        </div>

        <!-- Clear all -->
        <button class="clear-all-btn" *ngIf="hasActiveFilters()" (click)="clearAll()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/></svg>
          {{ langService.t('dash.clearFilters') }}
        </button>
      </div>

      <!-- Active filter badges + result count -->
      <div class="active-badges" *ngIf="hasActiveFilters() || filteredBooks().length > 0">
        <span class="badge" *ngIf="authorFilter()">
          {{ langService.t('dash.badgeAuthor') }}: {{ authorFilter() }}
          <button (click)="setAuthor('')">&times;</button>
        </span>
        <span class="badge" *ngIf="langFilter()">
          {{ langService.t('dash.badgeLang') }}: {{ langFilter() }}
          <button (click)="setLang('')">&times;</button>
        </span>
        <span class="badge" *ngIf="genreFilter()">
          {{ langService.t('dash.badgeGenre') }}: {{ genreFilter() }}
          <button (click)="setGenre('')">&times;</button>
        </span>
        <span class="badge" *ngIf="catFilter()">
          {{ langService.t('dash.badgeCat') }}: {{ catFilter() }}
          <button (click)="setCat('')">&times;</button>
        </span>
        <span class="results-count">
          {{ filteredBooks().length }} {{ filteredBooks().length !== 1 ? langService.t('dash.books') : langService.t('dash.book') }}
          <ng-container *ngIf="totalPages() > 1"> · {{ langService.t('dash.page') }} {{ currentPage() }} {{ langService.t('dash.of') }} {{ totalPages() }}</ng-container>
        </span>
      </div>

      <!-- Book Grid -->
      <div class="book-grid">
        <app-book-card
          *ngFor="let book of pagedBooks()"
          [book]="book"
          (statusChange)="onStatusChange(book.id, $event)"
          (onDelete)="onDelete(book.id)">
        </app-book-card>
      </div>

      <!-- Empty State -->
      <div *ngIf="filteredBooks().length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <p *ngIf="searchQuery() || hasActiveFilters()">{{ langService.t('dash.noMatchFilter') }}</p>
        <p *ngIf="!searchQuery() && !hasActiveFilters()">{{ langService.t('dash.noMatch') }}</p>
        <div class="empty-actions">
          <button *ngIf="hasActiveFilters() || searchQuery()" class="btn-ghost" (click)="clearAll(); onSearch('')">{{ langService.t('dash.clearAllFilters') }}</button>
          <a *ngIf="activeStatus() === 'All Books' && !searchQuery() && !hasActiveFilters()" routerLink="/add" class="link">{{ langService.t('dash.addFirst') }}</a>
        </div>
      </div>

      <!-- Pagination Controls -->
      <nav class="pagination" *ngIf="totalPages() > 1" aria-label="Pagination">
        <!-- Prev -->
        <button
          class="page-btn nav-btn"
          [disabled]="currentPage() === 1"
          (click)="goTo(currentPage() - 1)"
          title="Previous page">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/></svg>
        </button>

        <!-- Page numbers with ellipsis -->
        <ng-container *ngFor="let p of pageNumbers()">
          <span *ngIf="p === '…'" class="page-ellipsis">…</span>
          <button
            *ngIf="p !== '…'"
            class="page-btn"
            [class.active]="p === currentPage()"
            (click)="goTo(+p)">
            {{ p }}
          </button>
        </ng-container>

        <!-- Next -->
        <button
          class="page-btn nav-btn"
          [disabled]="currentPage() === totalPages()"
          (click)="goTo(currentPage() + 1)"
          title="Next page">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/></svg>
        </button>
      </nav>
    </div>
  `,
  styles: [`
    .header {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    .header-left { flex-shrink: 0; }
    h1 { margin: 0; font-size: 2rem; letter-spacing: -0.02em; }
    .subtitle { color: var(--text-muted); margin: 0.25rem 0 0; }

    /* Search */
    .search-wrap {
      flex: 1;
      min-width: 220px;
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 0.75rem;
      width: 16px;
      height: 16px;
      color: var(--text-muted);
      pointer-events: none;
    }
    .search-input {
      width: 100%;
      padding: 0.55rem 2.5rem 0.55rem 2.25rem;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      color: var(--text-main);
      font-size: 0.9rem;
      font-family: inherit;
      transition: border-color 0.2s, background 0.2s;
    }
    .search-input::placeholder { color: var(--text-muted); }
    .search-input:focus {
      outline: none;
      border-color: var(--primary);
      background: rgba(99,102,241,0.06);
    }
    .clear-btn {
      position: absolute;
      right: 0.6rem;
      background: transparent;
      color: var(--text-muted);
      font-size: 1.1rem;
      line-height: 1;
      padding: 0.1rem 0.3rem;
    }
    .clear-btn:hover { color: var(--text-main); }

    /* Status Filters */
    .filters {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;
    }
    .filter-tab {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--text-muted);
      padding: 0.5rem 1.25rem;
      border-radius: 100px;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.18s ease;
    }
    .filter-tab:hover { color: var(--text-main); border-color: rgba(255,255,255,0.2); }
    .filter-tab.active {
      background: var(--text-main);
      color: var(--bg-app);
      border-color: var(--text-main);
    }

    /* Advanced Filters */
    .adv-filters {
      display: flex;
      align-items: flex-end;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
      padding: 0.875rem 1rem;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px;
    }
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      flex: 1;
      min-width: 120px;
    }
    .page-size-group { max-width: 110px; flex: 0 0 auto; }
    .filter-label {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-muted);
    }
    .filter-label svg { width: 11px; height: 11px; }
    .filter-select {
      padding: 0.4rem 0.75rem;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      color: var(--text-main);
      font-size: 0.85rem;
      font-family: inherit;
      cursor: pointer;
      transition: border-color 0.18s;
    }
    .filter-select:focus { outline: none; border-color: var(--primary); }
    .filter-select option { background: #1e293b; color: #e2e8f0; }

    .clear-all-btn {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.4rem 0.9rem;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.25);
      border-radius: 8px;
      color: #f87171;
      font-size: 0.82rem;
      cursor: pointer;
      transition: all 0.18s;
      white-space: nowrap;
      align-self: flex-end;
    }
    .clear-all-btn svg { width: 13px; height: 13px; }
    .clear-all-btn:hover { background: rgba(239,68,68,0.2); color: #fca5a5; }

    /* Active Badges */
    .active-badges {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 1.25rem;
    }
    .badge {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.65rem;
      background: rgba(99,102,241,0.15);
      border: 1px solid rgba(99,102,241,0.3);
      border-radius: 100px;
      font-size: 0.78rem;
      color: #a5b4fc;
    }
    .badge button {
      background: transparent;
      color: #a5b4fc;
      font-size: 0.9rem;
      line-height: 1;
      padding: 0;
      margin: 0;
      cursor: pointer;
      opacity: 0.7;
    }
    .badge button:hover { opacity: 1; }
    .results-count {
      margin-left: auto;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    /* Book Grid */
    .book-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr));
      gap: 1.5rem;
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .header { gap: 0.75rem; margin-bottom: 1.5rem; }
      .search-wrap { min-width: 180px; }
      .adv-filters { gap: 0.5rem; padding: 0.75rem; }
      .filter-group { min-width: 45%; }
    }

    @media (max-width: 480px) {
      h1 { font-size: 1.6rem; }
      .header { flex-direction: column; align-items: stretch; }
      .header-left { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 0.5rem; }
      .search-wrap { flex: none; width: 100%; }
      .btn-primary { width: 100%; text-align: center; justify-content: center; }
      .filter-group, .page-size-group { min-width: 100%; }
      .clear-all-btn { width: 100%; justify-content: center; }
      .adv-filters { padding: 1rem 0.75rem; }
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 1rem;
      color: var(--text-muted);
    }
    .empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
    .empty-actions { display: flex; gap: 1rem; justify-content: center; margin-top: 0.75rem; }
    .btn-ghost {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.15);
      color: var(--text-muted);
      padding: 0.4rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.18s;
    }
    .btn-ghost:hover { color: var(--text-main); border-color: rgba(255,255,255,0.3); }
    .link { color: var(--primary); text-decoration: none; }
    .link:hover { text-decoration: underline; }

    /* ── Pagination ── */
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      margin-top: 2.5rem;
      flex-wrap: wrap;
    }

    .page-btn {
      min-width: 36px;
      height: 36px;
      padding: 0 0.5rem;
      border-radius: 8px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      color: var(--text-muted);
      font-size: 0.875rem;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.18s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .page-btn svg { width: 16px; height: 16px; }
    .page-btn:hover:not(:disabled):not(.active) {
      background: rgba(255,255,255,0.1);
      color: var(--text-main);
      border-color: rgba(255,255,255,0.2);
    }
    .page-btn.active {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
      font-weight: 700;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.25);
    }
    .page-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .nav-btn { padding: 0 0.6rem; }

    .page-ellipsis {
      color: var(--text-muted);
      padding: 0 0.25rem;
      font-size: 0.875rem;
      user-select: none;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private bookService = inject(BookService);
  langService = inject(LanguageService);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const status = params['status'];
      if (status && this.STATUS_VALUES.includes(status)) {
        this.activeStatus.set(status);
      }
    });
  }

  readonly STATUS_KEYS = ['dash.filterAll', 'dash.filterYetToRead', 'dash.filterReading', 'dash.filterCompleted', 'dash.filterLentOut', 'dash.filterBorrowed', 'dash.filterWishlist'];
  readonly STATUS_VALUES = ['All Books', 'Yet to Read', 'Reading', 'Completed', 'Lent Out', 'Borrowed', 'Wishlist'];

  statusFilters = computed(() => this.STATUS_KEYS.map(k => this.langService.t(k)));
  activeStatus = signal('All Books');
  searchQuery = signal('');
  authorFilter = signal<string>('');
  langFilter = signal<BookLanguage | ''>('');
  genreFilter = signal<BookGenre | ''>('');
  catFilter = signal<BookCategory | ''>('');

  /** Pagination state */
  currentPage = signal(1);
  pageSize = signal(6);

  languages: BookLanguage[] = ['English', 'Bengali', 'Hindi', 'Spanish', 'French', 'Arabic', 'Other'];
  genres: BookGenre[] = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Thriller', 'Romance',
    'Science Fiction', 'Fantasy', 'Horror', 'Biography', 'Self-Help',
    'History', "Children's", 'Young Adult', 'Comics', 'Other'
  ];
  categories: BookCategory[] = [
    'Novel', 'Short Stories', 'Long Stories', 'Poetry', 'Prose',
    'Documentary', 'Travel', 'Magazine', 'Other'
  ];

  authors = computed(() => {
    const allAuthors = this.bookService.books().map(b => b.author).filter(Boolean);
    return [...new Set(allAuthors)].sort((a, b) => a.localeCompare(b));
  });

  hasActiveFilters = computed(() =>
    !!this.authorFilter() || !!this.langFilter() || !!this.genreFilter() || !!this.catFilter()
  );

  /** All books matching the current filters — no pagination yet */
  filteredBooks = computed(() => {
    const status = this.activeStatus();
    const q = this.searchQuery().toLowerCase().trim();
    const authorFilter = this.authorFilter();
    const lang = this.langFilter();
    const genre = this.genreFilter();
    const cat = this.catFilter();

    let books = this.bookService.books();

    if (status !== 'All Books') books = books.filter(b => b.status === status);
    if (q) books = books.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      (b.language ?? '').toLowerCase().includes(q) ||
      (b.genre ?? '').toLowerCase().includes(q) ||
      (b.category ?? '').toLowerCase().includes(q) ||
      b.status.toLowerCase().includes(q) ||
      (b.borrowedBy ?? '').toLowerCase().includes(q) ||
      (b.borrowedFrom ?? '').toLowerCase().includes(q)
    );
    if (authorFilter) books = books.filter(b => b.author === authorFilter);
    if (lang) books = books.filter(b => b.language === lang);
    if (genre) books = books.filter(b => b.genre === genre);
    if (cat) books = books.filter(b => b.category === cat);
    return books;
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredBooks().length / this.pageSize()))
  );

  /** The slice shown on the current page */
  pagedBooks = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return this.filteredBooks().slice(start, start + size);
  });

  /**
   * Smart page-number list: always show first, last, current ±1,
   * and fill gaps with '…'.
   * e.g.  1  2  3  …  8  9  10   or   1  …  4  5  6  …  10
   */
  pageNumbers = computed<(number | '…')[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages = new Set<number>([1, total, current]);
    if (current > 1) pages.add(current - 1);
    if (current < total) pages.add(current + 1);

    const sorted = [...pages].sort((a, b) => a - b);
    const result: (number | '…')[] = [];
    let prev = 0;
    for (const p of sorted) {
      if (p - prev > 1) result.push('…');
      result.push(p);
      prev = p;
    }
    return result;
  });

  constructor() {
    // Reset to page 1 whenever any filter / search / page-size changes
    effect(() => {
      this.filteredBooks();  // track
      this.pageSize();       // track
      this.currentPage.set(1);
    }, { allowSignalWrites: true });
  }

  /* ── Actions that reset to page 1 ── */
  onSearch(q: string) { this.searchQuery.set(q); }
  setStatus(idx: number) { this.activeStatus.set(this.STATUS_VALUES[idx]); }
  setAuthor(v: string) { this.authorFilter.set(v); }
  setLang(v: BookLanguage | '') { this.langFilter.set(v); }
  setGenre(v: BookGenre | '') { this.genreFilter.set(v); }
  setCat(v: BookCategory | '') { this.catFilter.set(v); }
  setPageSize(n: number) { this.pageSize.set(n); }

  clearAll() {
    this.authorFilter.set('');
    this.langFilter.set('');
    this.genreFilter.set('');
    this.catFilter.set('');
  }

  goTo(page: number) {
    const clamped = Math.max(1, Math.min(page, this.totalPages()));
    this.currentPage.set(clamped);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onStatusChange(id: string, event: { status: Book['status']; borrowedBy?: string }) {
    this.bookService.updateStatus(id, event.status, event.borrowedBy);
  }

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(id);
    }
  }
}
