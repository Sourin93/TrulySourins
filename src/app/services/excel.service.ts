import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Book, BookCategory, BookLanguage, BookGenre } from '../models/book.model';

const VALID_STATUSES: Book['status'][] = ['Yet to Read', 'Reading', 'Completed', 'Lent Out', 'Wishlist'];
const VALID_GENRES: BookGenre[] = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Thriller', 'Romance',
    'Science Fiction', 'Fantasy', 'Horror', 'Biography', 'Self-Help',
    'History', "Children's", 'Young Adult', 'Comics', 'Other'
];
const VALID_CATEGORIES: BookCategory[] = [
    'Novel', 'Short Stories', 'Long Stories', 'Poetry', 'Prose',
    'Documentary', 'Travel', 'Magazine', 'Other'
];
const VALID_LANGUAGES: BookLanguage[] = [
    'English', 'Bengali', 'Hindi', 'Spanish', 'French', 'Arabic', 'Other'
];

@Injectable({ providedIn: 'root' })
export class ExcelService {
    // ── Export ──────────────────────────────────────────────────────────────────

    export(books: Book[]): void {
        const rows = books.map(b => ({
            'Title': b.title,
            'Author': b.author,
            'Status': b.status,
            'Genre': b.genre ?? '',
            'Category': b.category ?? '',
            'Language': b.language ?? '',
            'Borrowed By': b.borrowedBy ?? '',
            'Lent Date': b.lentDate ?? '',
            'Cover URL': b.coverUrl ?? '',
            'Feedback': b.feedback ?? '',
            'Added Date': b.addedDate
                ? new Date(b.addedDate).toISOString()
                : new Date().toISOString(),
        }));

        const ws = XLSX.utils.json_to_sheet(rows);

        // Widen columns for readability
        ws['!cols'] = [
            { wch: 40 }, // Title
            { wch: 25 }, // Author
            { wch: 15 }, // Status
            { wch: 18 }, // Genre
            { wch: 18 }, // Category
            { wch: 12 }, // Language
            { wch: 20 }, // Borrowed By
            { wch: 20 }, // Lent Date
            { wch: 40 }, // Cover URL
            { wch: 50 }, // Feedback
            { wch: 25 }, // Added Date
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Books');

        const today = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `books-${today}.xlsx`);
    }

    // ── Import ──────────────────────────────────────────────────────────────────

    import(file: File): Promise<{ books: Book[]; skipped: number }> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target!.result as ArrayBuffer);
                    const wb = XLSX.read(data, { type: 'array' });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });

                    const books: Book[] = [];
                    let skipped = 0;

                    for (const row of rows) {
                        const title = (row['Title'] ?? '').trim();
                        const author = (row['Author'] ?? '').trim();
                        const status = (row['Status'] ?? '').trim() as Book['status'];

                        // Required fields
                        if (!title || !author || !VALID_STATUSES.includes(status)) {
                            skipped++;
                            continue;
                        }

                        const genre = row['Genre'] as BookGenre | undefined;
                        const category = row['Category'] as BookCategory | undefined;
                        const language = row['Language'] as BookLanguage | undefined;

                        const addedRaw = row['Added Date'];
                        const addedDate = addedRaw ? new Date(addedRaw).getTime() : Date.now();

                        books.push({
                            id: crypto.randomUUID(),
                            title,
                            author,
                            status,
                            genre: genre && VALID_GENRES.includes(genre) ? genre : undefined,
                            category: category && VALID_CATEGORIES.includes(category) ? category : undefined,
                            language: language && VALID_LANGUAGES.includes(language) ? language : undefined,
                            borrowedBy: row['Borrowed By']?.trim() || undefined,
                            lentDate: row['Lent Date']?.trim() || undefined,
                            coverUrl: row['Cover URL']?.trim() || undefined,
                            feedback: row['Feedback']?.trim() || undefined,
                            addedDate: isNaN(addedDate) ? Date.now() : addedDate,
                        });
                    }

                    resolve({ books, skipped });
                } catch (err) {
                    reject(err);
                }
            };

            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(file);
        });
    }
}
