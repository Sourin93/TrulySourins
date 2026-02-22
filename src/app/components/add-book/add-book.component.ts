import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { Router } from '@angular/router';
import { BookCategory, BookLanguage, BookGenre } from '../../models/book.model';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="add-book-container">
      <h2>Add a New Book</h2>
        <!-- Generic submit-error banner -->
        <div class="form-error-banner" *ngIf="submitted && bookForm.invalid">
          ⚠️ Please fill in all required fields before submitting.
        </div>

        <form [formGroup]="bookForm" (ngSubmit)="onSubmit()">

        <div class="form-row">
          <div class="form-group">
            <label for="title">Title <span class="req">*</span></label>
            <input id="title" type="text" formControlName="title" placeholder="e.g. The Hobbit">
            <div class="error" *ngIf="bookForm.get('title')?.touched && bookForm.get('title')?.invalid">
              Title is required
            </div>
          </div>

          <div class="form-group">
            <label for="author">Author <span class="req">*</span></label>
            <input id="author" type="text" formControlName="author" placeholder="e.g. J.R.R. Tolkien">
            <div class="error" *ngIf="bookForm.get('author')?.touched && bookForm.get('author')?.invalid">
              Author is required
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="category">Category <span class="optional">(optional)</span></label>
            <select id="category" formControlName="category">
              <option value="">— Select category —</option>
              <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="language">Language <span class="optional">(optional)</span></label>
            <select id="language" formControlName="language">
              <option value="">— Select language —</option>
              <option *ngFor="let l of languages" [value]="l">{{ l }}</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="genre">Genre <span class="optional">(optional)</span></label>
            <select id="genre" formControlName="genre">
              <option value="">— Select genre —</option>
              <option *ngFor="let g of genres" [value]="g">{{ g }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="status">Status</label>
            <select id="status" formControlName="status">
              <option value="Yet to Read">Yet to Read</option>
              <option value="Reading">Reading</option>
              <option value="Completed">Completed</option>
              <option value="Lent Out">Lent Out</option>
              <option value="Wishlist">Wishlist 🛒</option>
            </select>
          </div>

          <!-- Date field -->
          <div class="form-group">
            <label for="lentDate">
              {{ isLentOut ? 'Date Lent' : 'Date' }}
              <span class="optional" *ngIf="!isLentOut">(optional)</span>
            </label>
            <input id="lentDate" type="date" formControlName="lentDate">
            <div class="error" *ngIf="bookForm.get('lentDate')?.touched && bookForm.get('lentDate')?.invalid">
              Date is required for lent books
            </div>
          </div>
        </div>

        <!-- Borrower name — shown only when Lent Out -->
        <div class="form-group" *ngIf="isLentOut">
          <label for="borrowedBy">Borrowed by <span class="req">*</span></label>
          <input id="borrowedBy" type="text" formControlName="borrowedBy" placeholder="Enter the person's name">
          <div class="error" *ngIf="bookForm.get('borrowedBy')?.touched && bookForm.get('borrowedBy')?.invalid">
            Please enter the borrower's name
          </div>
        </div>

        <!-- Feedback — shown for Reading or Completed -->
        <div class="form-group feedback-group" *ngIf="showFeedback">
          <label for="feedback">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3.505 2.365A41.369 41.369 0 0 1 9 2c1.863 0 3.697.124 5.495.365 1.247.167 2.005 1.32 2.005 2.366V9.25c0 1.046-.76 2.2-2.009 2.366A41.215 41.215 0 0 1 9 12c-1.863 0-3.697-.124-5.495-.365C2.254 11.45 1.5 10.296 1.5 9.25V4.731c0-1.047.757-2.199 2.005-2.366ZM14 15.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5Zm-9 0a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm0 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5Z"/></svg>
            My Thoughts
            <span class="optional">(optional)</span>
          </label>
          <textarea
            id="feedback"
            formControlName="feedback"
            placeholder="How was the book? Any highlights or special mentions…"
            rows="3"></textarea>
        </div>

        <!-- Cover Image Upload -->
        <div class="form-group cover-group">
          <label>Cover Image <span class="optional">(optional · max 200 KB)</span></label>
          <div class="cover-upload-row">
            <!-- Preview -->
            <div class="cover-preview" *ngIf="coverPreview">
              <img [src]="coverPreview" alt="Cover preview" class="cover-thumb">
              <button type="button" class="remove-cover" (click)="removeCover()" title="Remove cover">×</button>
            </div>
            <!-- Drop zone / file trigger -->
            <label class="upload-zone" [class.has-preview]="!!coverPreview">
              <input type="file" accept="image/*" (change)="onCoverFile($event)" class="file-input">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909-.48-.480a.75.75 0 0 0-1.06 0L6.53 15H3.25a.75.75 0 0 1-.75-.75V11.06Zm0-1.56l2.22-2.22a.75.75 0 0 1 1.06 0l1.908 1.908 1.483-1.482a.75.75 0 0 1 1.06 0l4.019 4.019V5.25a.75.75 0 0 0-.75-.75H3.25a.75.75 0 0 0-.75.75v4.06ZM12 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" clip-rule="evenodd"/></svg>
              <span>{{ coverPreview ? 'Change image' : 'Click to upload' }}</span>
            </label>
          </div>
          <div class="error" *ngIf="coverError">{{ coverError }}</div>
        </div>

        <div class="actions">
          <button type="button" class="btn" (click)="onCancel()">Cancel</button>
          <button type="submit" class="btn btn-primary">Add Book</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .add-book-container {
      max-width: 620px;
      margin: 2rem auto;
      background: var(--bg-card);
      padding: 2rem;
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
      border: 1px solid rgba(255,255,255,0.06);
    }
    h2 { margin-top: 0; margin-bottom: 1.75rem; text-align: center; font-size: 1.4rem; }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    @media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }

    .form-group { margin-bottom: 1.1rem; }
    label {
      display: block;
      margin-bottom: 0.4rem;
      font-weight: 500;
      font-size: 0.875rem;
    }
    .req { color: #f87171; }
    .optional { font-weight: 400; color: var(--text-muted); font-size: 0.78rem; }

    input, select, textarea {
      width: 100%;
      padding: 0.65rem 0.8rem;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(0,0,0,0.2);
      color: var(--text-main);
      font-size: 0.9rem;
      font-family: inherit;
      transition: border-color 0.2s;
    }
    textarea { resize: vertical; min-height: 80px; line-height: 1.5; }
    input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
    }
    select option { background: #1e293b; }
    .error { color: #f87171; font-size: 0.78rem; margin-top: 0.25rem; }
    .form-error-banner {
      margin-bottom: 1.25rem;
      padding: 0.65rem 1rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      color: #f87171;
      font-size: 0.875rem;
    }
    /* Cover upload */
    .cover-group { margin-bottom: 1.25rem; }
    .cover-upload-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .cover-preview { position: relative; flex-shrink: 0; }
    .cover-thumb { width: 72px; height: 96px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(255,255,255,0.12); display: block; }
    .remove-cover {
      position: absolute; top: -6px; right: -6px;
      width: 20px; height: 20px;
      background: #ef4444; color: #fff;
      border-radius: 50%; border: none;
      font-size: 1rem; line-height: 1; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    }
    .upload-zone {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 0.4rem;
      padding: 0.75rem 1.25rem;
      border: 1.5px dashed rgba(255,255,255,0.18);
      border-radius: 10px;
      cursor: pointer;
      color: var(--text-muted);
      font-size: 0.8rem;
      transition: border-color 0.2s, background 0.2s;
      flex: 1;
      min-width: 140px;
      text-align: center;
    }
    .upload-zone svg { width: 22px; height: 22px; opacity: 0.5; }
    .upload-zone:hover { border-color: var(--primary); background: rgba(99,102,241,0.06); color: var(--text-main); }
    .file-input { display: none; }
    .actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
    .feedback-group label {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .feedback-group label svg { width: 14px; height: 14px; color: #a5b4fc; }
  `]
})
export class AddBookComponent {
  submitted = false;
  coverPreview: string | null = null;
  coverError: string | null = null;
  private fb = inject(FormBuilder);
  private bookService = inject(BookService);
  private router = inject(Router);

  categories: BookCategory[] = ['Novel', 'Short Stories', 'Long Stories', 'Poetry', 'Prose', 'Documentary', 'Travel', 'Magazine', 'Other'];
  languages: BookLanguage[] = ['English', 'Bengali', 'Hindi', 'Spanish', 'French', 'Arabic', 'Other'];
  genres: BookGenre[] = ['Fiction', 'Non-Fiction', 'Mystery', 'Thriller', 'Romance', 'Science Fiction', 'Fantasy', 'Horror', 'Biography', 'Self-Help', 'History', "Children's", 'Young Adult', 'Comics', 'Other'];

  bookForm = this.fb.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    status: ['Yet to Read', Validators.required],
    category: [''],
    language: [''],
    genre: [''],
    borrowedBy: [''],
    lentDate: [''],
    feedback: ['']
  });

  get showFeedback(): boolean {
    const s = this.bookForm.get('status')?.value;
    return s === 'Reading' || s === 'Completed';
  }

  get isLentOut(): boolean {
    return this.bookForm.get('status')?.value === 'Lent Out';
  }

  constructor() {
    this.bookForm.get('status')?.valueChanges.subscribe(status => {
      const borrowedByCtrl = this.bookForm.get('borrowedBy');
      const lentDateCtrl = this.bookForm.get('lentDate');
      if (status === 'Lent Out') {
        borrowedByCtrl?.setValidators(Validators.required);
        lentDateCtrl?.setValidators(Validators.required);
      } else {
        borrowedByCtrl?.clearValidators();
        lentDateCtrl?.clearValidators();
      }
      borrowedByCtrl?.updateValueAndValidity();
      lentDateCtrl?.updateValueAndValidity();
    });
  }

  onSubmit() {
    this.submitted = true;
    this.bookForm.markAllAsTouched();
    if (this.bookForm.valid) {
      const { title, author, status, category, language, genre, borrowedBy, lentDate, feedback } = this.bookForm.value;
      this.bookService.addBook({
        title: title!,
        author: author!,
        status: status as any,
        category: (category || undefined) as BookCategory | undefined,
        language: (language || undefined) as BookLanguage | undefined,
        genre: (genre || undefined) as BookGenre | undefined,
        borrowedBy: status === 'Lent Out' ? (borrowedBy ?? undefined) : undefined,
        lentDate: lentDate || undefined,
        feedback: (feedback && this.showFeedback) ? feedback : undefined,
        coverUrl: this.coverPreview ?? undefined
      });
      this.router.navigate(['/']);
    }
  }

  onCoverFile(event: Event) {
    this.coverError = null;
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 200 * 1024) {
      this.coverError = 'Image must be under 200 KB. Please choose a smaller file.';
      (event.target as HTMLInputElement).value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { this.coverPreview = reader.result as string; };
    reader.readAsDataURL(file);
  }

  removeCover() {
    this.coverPreview = null;
    this.coverError = null;
  }

  onCancel() {
    this.router.navigate(['/']);
  }
}
