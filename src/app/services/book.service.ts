import { Injectable, signal, effect, computed } from '@angular/core';
import { Book } from '../models/book.model';

@Injectable({
    providedIn: 'root'
})
export class BookService {
    private readonly STORAGE_KEY = 'book-keeper-data';

    // Primary state signal
    books = signal<Book[]>([]);

    // Computed signals for filtered lists
    wantToReadBooks = computed(() => this.books().filter(b => b.status === 'Yet to Read'));
    readingBooks = computed(() => this.books().filter(b => b.status === 'Reading'));
    completedBooks = computed(() => this.books().filter(b => b.status === 'Completed'));
    lentBooks = computed(() => this.books().filter(b => b.status === 'Lent Out'));
    borrowedBooks = computed(() => this.books().filter(b => b.status === 'Borrowed'));
    wishlistBooks = computed(() => this.books().filter(b => b.status === 'Wishlist'));

    constructor() {
        this.loadBooks();

        // Automatically sync to local storage whenever books change
        effect(() => {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.books()));
        });
    }

    private loadBooks() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                this.books.set(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse books from local storage', e);
                this.books.set([]);
            }
        }
    }

    addBook(book: Omit<Book, 'id' | 'addedDate'>) {
        const newBook: Book = {
            ...book,
            id: crypto.randomUUID(),
            addedDate: Date.now()
        };
        this.books.update(books => [newBook, ...books]);
    }

    updateStatus(id: string, status: Book['status'], personName?: string) {
        this.books.update(books =>
            books.map(b => b.id === id ? {
                ...b,
                status,
                // If Lent Out, personName is the borrower. If Borrowed, personName is the owner.
                borrowedBy: status === 'Lent Out' ? personName : undefined,
                borrowedFrom: status === 'Borrowed' ? personName : undefined,
                // Record the date when it was lent or borrowed
                lentDate: (status === 'Lent Out' || status === 'Borrowed') ? b.lentDate : undefined
            } : b)
        );
    }
    deleteBook(id: string) {
        this.books.update(books => books.filter(b => b.id !== id));
    }

    updateBook(id: string, data: Omit<Book, 'id' | 'addedDate'>) {
        this.books.update(books =>
            books.map(b => b.id === id ? { ...b, ...data } : b)
        );
    }
}
