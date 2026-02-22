import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Book } from '../../models/book.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="card" [ngClass]="[statusClass(book.status), lentAgeClass()]">
      <div class="card-header">
        <div class="status-badge">{{ book.status }}</div>
        <div class="card-actions-top">
          <button class="icon-btn edit-btn" (click)="onEditClick()" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.695 14.763l-1.262 3.154a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.885L17.5 5.5a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.885 1.343Z" />
            </svg>
          </button>
          <button class="icon-btn delete-btn" (click)="onDelete.emit(book.id)" title="Delete">&times;</button>
        </div>
      </div>

      <!-- Cover image -->
      <div class="cover-area" *ngIf="book.coverUrl">
        <img [src]="book.coverUrl" [alt]="book.title + ' cover'" class="cover-img">
      </div>

      <div class="card-content">
        <h3 class="title">{{ book.title }}</h3>
        <p class="author">by {{ book.author }}</p>

        <!-- Category / Language / Genre chips -->
        <div class="meta-chips" *ngIf="book.category || book.language || book.genre">
          <span class="chip chip-category" *ngIf="book.category">{{ book.category }}</span>
          <span class="chip chip-language" *ngIf="book.language">{{ book.language }}</span>
          <span class="chip chip-genre" *ngIf="book.genre">{{ book.genre }}</span>
        </div>

        <!-- Borrower info banner -->
        <div class="borrower-info" *ngIf="book.status === 'Lent Out' && book.borrowedBy">
          <span class="borrower-icon">👤</span>
          <div class="borrower-details">
            <span>Borrowed by <strong>{{ book.borrowedBy }}</strong></span>
            <span class="borrow-date" *ngIf="book.lentDate">
              Since {{ book.lentDate | date:'mediumDate' }}
              <span class="overdue-tag" *ngIf="lentAgeClass() === 'warn-red'">⚠️ 6+ months!</span>
              <span class="overdue-tag amber" *ngIf="lentAgeClass() === 'warn-amber'">⏰ 3+ months</span>
            </span>
          </div>
        </div>

        <!-- Date for non-lent books (optional) -->
        <div class="book-date" *ngIf="book.status !== 'Lent Out' && book.lentDate">
          <span class="date-icon">📅</span> {{ book.lentDate | date:'mediumDate' }}
        </div>

        <!-- Feedback / My Thoughts -->
        <div class="feedback-block" *ngIf="book.feedback && (book.status === 'Reading' || book.status === 'Completed')">
          <div class="feedback-header">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 0 0 1.28.53l3.58-3.58A6.667 6.667 0 0 0 10.096 14h.404c2.236 0 4.43-.18 6.57-.524 1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.202 41.202 0 0 0 10 2Z" clip-rule="evenodd"/></svg>
            My Thoughts
          </div>
          <p class="feedback-text">{{ book.feedback }}</p>
        </div>
      </div>

      <div class="card-actions">
        <select [value]="book.status" (change)="onStatusChangeHelper($event)">
          <option value="Yet to Read">Yet to Read</option>
          <option value="Reading">Reading</option>
          <option value="Completed">Completed</option>
          <option value="Lent Out">Lent Out</option>
          <option value="Wishlist">Wishlist 🛒</option>
        </select>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border-radius: var(--radius);
      padding: 1.5rem;
      box-shadow: var(--shadow-lg);
      transition: transform 0.2s, box-shadow 0.2s;
      border: 1px solid transparent;
      border-top-width: 3px;
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--bg-card);
    }

    .card:hover {
      transform: translateY(-4px);
    }

    /* Cover art */
    .cover-area {
      margin: 0 -1.5rem 1rem -1.5rem;
      overflow: hidden;
      height: 160px;
    }
    .cover-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* Status-based backgrounds and top border */
    .card.want-to-read {
      background: linear-gradient(160deg, rgba(59,130,246,0.08) 0%, var(--bg-card) 50%);
      border-color: rgba(59,130,246,0.5);
    }
    .card.reading {
      background: linear-gradient(160deg, rgba(245,158,11,0.1) 0%, var(--bg-card) 50%);
      border-color: rgba(245,158,11,0.55);
    }
    .card.completed {
      background: linear-gradient(160deg, rgba(16,185,129,0.09) 0%, var(--bg-card) 50%);
      border-color: rgba(16,185,129,0.5);
    }
    .card.lent-out {
      background: linear-gradient(160deg, rgba(168,85,247,0.1) 0%, var(--bg-card) 50%);
      border-color: rgba(168,85,247,0.5);
    }
    .card.wishlist {
      background: linear-gradient(160deg, rgba(236,72,153,0.1) 0%, var(--bg-card) 50%);
      border-color: rgba(236,72,153,0.5);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .status-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.75rem;
      border-radius: 100px;
      font-weight: 600;
      background: rgba(255,255,255,0.1);
    }

    .card.want-to-read .status-badge { color: var(--status-want); background: rgba(59, 130, 246, 0.1); }
    .card.reading .status-badge { color: var(--status-reading); background: rgba(245, 158, 11, 0.1); }
    .card.completed .status-badge { color: var(--status-completed); background: rgba(16, 185, 129, 0.1); }
    .card.lent-out .status-badge { color: var(--status-lent); background: rgba(168, 85, 247, 0.1); }
    .card.wishlist .status-badge { color: #f472b6; background: rgba(236, 72, 153, 0.12); }

    /* Age-based warning glow for lent books */
    /* warn-amber = 3+ months: uses orange (#f97316) — distinct from Reading amber */
    .card.warn-amber {
      border-color: rgba(249, 115, 22, 0.6);
      box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.25), var(--shadow-lg);
    }
    .card.warn-amber .borrower-info {
      background: rgba(249, 115, 22, 0.12);
      border-color: rgba(249, 115, 22, 0.4);
      color: #fdba74;
    }

    .card.warn-red {
      border-color: rgba(239, 68, 68, 0.6);
      box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.25), var(--shadow-lg);
      animation: pulse-red 2.5s ease-in-out infinite;
    }
    .card.warn-red .borrower-info {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.35);
      color: #fca5a5;
    }

    @keyframes pulse-red {
      0%, 100% { box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.25), var(--shadow-lg); }
      50% { box-shadow: 0 0 12px 2px rgba(239, 68, 68, 0.4), var(--shadow-lg); }
    }

    .overdue-tag {
      display: inline-block;
      margin-left: 0.4rem;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      background: rgba(239, 68, 68, 0.2);
      color: #fca5a5;
    }
    /* 3-month overdue tag — orange, not amber */
    .overdue-tag.amber {
      background: rgba(249, 115, 22, 0.2);
      color: #fdba74;
    }

    .title {
      font-size: 1.15rem;
      margin: 0 0 0.25rem;
      line-height: 1.3;
    }

    .author {
      color: var(--text-muted);
      font-size: 0.875rem;
      margin: 0 0 0.6rem;
    }

    .meta-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-bottom: 0.25rem;
    }

    .chip {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 100px;
      letter-spacing: 0.01em;
    }

    .chip-category {
      background: rgba(20, 184, 166, 0.12);
      color: #5eead4;
      border: 1px solid rgba(20, 184, 166, 0.2);
    }

    .chip-language {
      background: rgba(56, 189, 248, 0.12);
      color: #7dd3fc;
      border: 1px solid rgba(56, 189, 248, 0.2);
    }

    .chip-genre {
      background: rgba(244, 114, 182, 0.12);
      color: #f9a8d4;
      border: 1px solid rgba(244, 114, 182, 0.2);
    }

    .borrower-info {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-top: 0.75rem;
      padding: 0.5rem 0.75rem;
      background: rgba(168, 85, 247, 0.12);
      border: 1px solid rgba(168, 85, 247, 0.25);
      border-radius: 8px;
      font-size: 0.85rem;
      color: #d8b4fe;
    }

    .borrower-details {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .borrow-date {
      font-size: 0.78rem;
      opacity: 0.75;
    }

    .borrower-icon { font-size: 1rem; margin-top: 0.1rem; }

    .book-date {
      margin-top: 0.6rem;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    /* Feedback block */
    .feedback-block {
      margin-top: 0.85rem;
      padding: 0.6rem 0.75rem;
      background: rgba(165, 180, 252, 0.07);
      border: 1px solid rgba(165, 180, 252, 0.15);
      border-radius: 8px;
      border-left: 3px solid rgba(165, 180, 252, 0.4);
    }
    .feedback-header {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #a5b4fc;
      margin-bottom: 0.4rem;
    }
    .feedback-header svg { width: 12px; height: 12px; flex-shrink: 0; }
    .feedback-text {
      margin: 0;
      font-size: 0.82rem;
      color: var(--text-muted);
      line-height: 1.55;
      font-style: italic;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-content {
      flex-grow: 1;
      margin-bottom: 1.5rem;
    }

    .card-actions select {
      width: 100%;
      padding: 0.5rem;
      border-radius: 6px;
      background: rgba(0,0,0,0.2);
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--text-main);
      cursor: pointer;
      font-family: inherit;
    }
    .card-actions select option {
      background: #1e293b;
      color: #e2e8f0;
    }

    .card-actions-top {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .icon-btn {
      background: transparent;
      color: var(--text-muted);
      padding: 0.3rem;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s, background 0.15s;
    }

    .icon-btn svg { width: 14px; height: 14px; }

    .edit-btn:hover {
      color: #818cf8;
      background: rgba(99,102,241,0.1);
    }

    .delete-btn {
      background: transparent;
      color: var(--text-muted);
      font-size: 1.4rem;
      line-height: 0.7;
      padding: 0.2rem 0.35rem;
      border-radius: 6px;
    }
    .delete-btn:hover {
      color: #ef4444;
      background: rgba(239,68,68,0.1);
    }
  `]
})
export class BookCardComponent {
  @Input({ required: true }) book!: Book;
  @Output() statusChange = new EventEmitter<{ status: Book['status']; borrowedBy?: string }>();
  @Output() onDelete = new EventEmitter<string>();

  private router = inject(Router);

  onEditClick() {
    this.router.navigate(['/edit', this.book.id]);
  }

  statusClass(status: string): string {
    return status.toLowerCase().replace(/ /g, '-');
  }

  lentAgeClass(): string {
    if (this.book.status !== 'Lent Out' || !this.book.lentDate) return '';
    const lent = new Date(this.book.lentDate).getTime();
    const now = Date.now();
    const months = (now - lent) / (1000 * 60 * 60 * 24 * 30.44);
    if (months >= 6) return 'warn-red';
    if (months >= 3) return 'warn-amber';
    return '';
  }

  onStatusChangeHelper(event: Event) {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as Book['status'];

    if (newStatus === 'Lent Out') {
      const name = prompt('Who borrowed this book?');
      if (name && name.trim()) {
        this.statusChange.emit({ status: newStatus, borrowedBy: name.trim() });
      } else {
        // Revert the select if user cancelled
        select.value = this.book.status;
      }
    } else {
      this.statusChange.emit({ status: newStatus });
    }
  }
}
