import { Injectable, signal } from '@angular/core';

export type Lang = 'en' | 'bn';

const TRANSLATIONS: Record<string, Record<Lang, string>> = {
    // ── Navbar ──────────────────────────────────────────────────────────
    'nav.library': { en: 'Library', bn: 'লাইব্রেরি' },
    'nav.addBook': { en: 'Add Book', bn: 'বই যোগ করুন' },
    'nav.statistics': { en: 'Statistics', bn: 'পরিসংখ্যান' },
    'nav.manual': { en: 'Manual', bn: 'ম্যানুয়াল' },
    'nav.export': { en: 'Export', bn: 'এক্সপোর্ট' },
    'nav.import': { en: 'Import', bn: 'ইম্পোর্ট' },
    'nav.reading': { en: 'reading', bn: 'পড়ছি' },
    'nav.lent': { en: 'lent', bn: 'ধার দেওয়া' },
    'nav.overdueLent': { en: 'Overdue Lent Books', bn: 'মেয়াদোত্তীর্ণ ধার দেওয়া বই' },
    'nav.clearAll': { en: 'Clear all', bn: 'সব মুছুন' },
    'nav.lentTo': { en: 'Lent to', bn: 'ধার দেওয়া হয়েছে' },
    'nav.monthsAgo': { en: 'months ago', bn: 'মাস আগে' },
    'nav.since': { en: 'Since', bn: 'থেকে' },

    // ── Dashboard ────────────────────────────────────────────────────────
    'dash.title': { en: 'My Library', bn: 'আমার লাইব্রেরি' },
    'dash.subtitle': { en: 'Track your reading journey', bn: 'আপনার পাঠ যাত্রা ট্র্যাক করুন' },
    'dash.addBook': { en: '+ Add Book', bn: '+ বই যোগ করুন' },
    'dash.author': { en: 'Author', bn: 'লেখক' },
    'dash.language': { en: 'Language', bn: 'ভাষা' },
    'dash.genre': { en: 'Genre', bn: 'ধরন' },
    'dash.category': { en: 'Category', bn: 'বিভাগ' },
    'dash.perPage': { en: 'Per page', bn: 'প্রতি পাতায়' },
    'dash.clearFilters': { en: 'Clear filters', bn: 'ফিল্টার মুছুন' },
    'dash.all': { en: 'All', bn: 'সব' },
    'dash.filterAll': { en: 'All Books', bn: 'সব বই' },
    'dash.filterYetToRead': { en: 'Yet to Read', bn: 'পড়া হয়নি' },
    'dash.filterReading': { en: 'Reading', bn: 'পড়ছি' },
    'dash.filterCompleted': { en: 'Completed', bn: 'শেষ হয়েছে' },
    'dash.filterLentOut': { en: 'Lent Out', bn: 'ধার দেওয়া' },
    'dash.filterBorrowed': { en: 'Borrowed', bn: 'ধার নেওয়া' },
    'dash.filterWishlist': { en: 'Wishlist', bn: 'ইচ্ছা তালিকা' },
    'dash.badgeAuthor': { en: 'Author', bn: 'লেখক' },
    'dash.badgeLang': { en: 'Language', bn: 'ভাষা' },
    'dash.badgeGenre': { en: 'Genre', bn: 'ধরন' },
    'dash.badgeCat': { en: 'Category', bn: 'বিভাগ' },
    'dash.book': { en: 'book', bn: 'টি বই' },
    'dash.books': { en: 'books', bn: 'টি বই' },
    'dash.page': { en: 'page', bn: 'পাতা' },
    'dash.of': { en: 'of', bn: 'এর থেকে' },
    'dash.noMatchFilter': { en: 'No books match your current search or filters.', bn: 'আপনার অনুসন্ধান বা ফিল্টারের সাথে কোনো বই মেলেনি।' },
    'dash.noMatch': { en: 'No books found in this category.', bn: 'এই বিভাগে কোনো বই পাওয়া যায়নি।' },
    'dash.clearAllFilters': { en: 'Clear all filters', bn: 'সব ফিল্টার মুছুন' },
    'dash.addFirst': { en: 'Add your first book →', bn: 'প্রথম বই যোগ করুন →' },

    // ── Book Card ────────────────────────────────────────────────────────
    'card.by': { en: 'by', bn: 'লেখক:' },
    'card.borrowedBy': { en: 'Borrowed by', bn: 'ধার নিয়েছেন' },
    'card.borrowedFrom': { en: 'Borrowed from', bn: 'ধার নেওয়া হয়েছে' },
    'card.since': { en: 'Since', bn: 'থেকে' },
    'card.overdue6': { en: '⚠️ 6+ months!', bn: '⚠️ ৬+ মাস!' },
    'card.overdue3': { en: '⏰ 3+ months', bn: '⏰ ৩+ মাস' },
    'card.myThoughts': { en: 'My Thoughts', bn: 'আমার মতামত' },
    'card.optYetToRead': { en: 'Yet to Read', bn: 'পড়া হয়নি' },
    'card.optReading': { en: 'Reading', bn: 'পড়ছি' },
    'card.optCompleted': { en: 'Completed', bn: 'শেষ হয়েছে' },
    'card.optLentOut': { en: 'Lent Out', bn: 'ধার দেওয়া' },
    'card.optBorrowed': { en: 'Borrowed 📥', bn: 'ধার নেওয়া 📥' },
    'card.optWishlist': { en: 'Wishlist 🛒', bn: 'ইচ্ছা তালিকা 🛒' },

    // ── Stats ────────────────────────────────────────────────────────────
    'stats.title': { en: 'Reading Statistics', bn: 'পাঠ পরিসংখ্যান' },
    'stats.subtitle': { en: 'A snapshot of your library', bn: 'আপনার লাইব্রেরির সারসংক্ষেপ' },
    'stats.backBtn': { en: 'Back to Library', bn: 'লাইব্রেরিতে ফিরুন' },
    'stats.noBooks': { en: 'No books yet.', bn: 'এখনো কোনো বই নেই।' },
    'stats.addFirst': { en: 'Add your first book →', bn: 'প্রথম বই যোগ করুন →' },
    'stats.inLibrary': { en: 'In Library', bn: 'মোট বই' },
    'stats.completed': { en: 'Completed', bn: 'শেষ হয়েছে' },
    'stats.reading': { en: 'Reading', bn: 'পড়ছি' },
    'stats.yetToRead': { en: 'Yet to Read', bn: 'পড়া হয়নি' },
    'stats.lentOut': { en: 'Lent Out', bn: 'ধার দেওয়া' },
    'stats.borrowed': { en: 'Borrowed', bn: 'ধার নেওয়া' },
    'stats.byAuthor': { en: 'By Author', bn: 'লেখক অনুযায়ী' },
    'stats.byLanguage': { en: 'By Language', bn: 'ভাষা অনুযায়ী' },
    'stats.author': { en: 'author', bn: 'জন লেখক' },
    'stats.authors': { en: 'authors', bn: 'জন লেখক' },
    'stats.language': { en: 'language', bn: 'টি ভাষা' },
    'stats.languages': { en: 'languages', bn: 'টি ভাষা' },
    'stats.mostBooks': { en: 'Most books', bn: 'সর্বাধিক বই' },
    'stats.inYourLibrary': { en: 'in your library', bn: 'আপনার লাইব্রেরিতে' },
    'stats.mostCommon': { en: 'Most common', bn: 'সর্বাধিক প্রচলিত' },

    // ── Add / Edit Book ──────────────────────────────────────────────────
    'form.addTitle': { en: 'Add a New Book', bn: 'নতুন বই যোগ করুন' },
    'form.editTitle': { en: 'Edit Book', bn: 'বই সম্পাদনা করুন' },
    'form.notFound': { en: 'Book not found.', bn: 'বইটি খুঁজে পাওয়া যায়নি।' },
    'form.backToLib': { en: 'Back to Library', bn: 'লাইব্রেরিতে ফিরুন' },
    'form.titleField': { en: 'Title', bn: 'শিরোনাম' },
    'form.authorField': { en: 'Author', bn: 'লেখক' },
    'form.categoryField': { en: 'Category', bn: 'বিভাগ' },
    'form.languageField': { en: 'Language', bn: 'ভাষা' },
    'form.genreField': { en: 'Genre', bn: 'ধরন' },
    'form.statusField': { en: 'Status', bn: 'অবস্থা' },
    'form.dateLent': { en: 'Date Lent', bn: 'ধার দেওয়ার তারিখ' },
    'form.dateBorrowed': { en: 'Date Borrowed', bn: 'ধার নেওয়ার তারিখ' },
    'form.date': { en: 'Date', bn: 'তারিখ' },
    'form.lentTo': { en: 'Lent to', bn: 'যাকে ধার দেওয়া হয়েছে' },
    'form.borrowedFrom': { en: 'Borrowed from', bn: 'যার কাছ থেকে ধার নেওয়া হয়েছে' },
    'form.myThoughts': { en: 'My Thoughts', bn: 'আমার মতামত' },
    'form.coverImage': { en: 'Cover Image', bn: 'প্রচ্ছদ চিত্র' },
    'form.optional': { en: 'optional', bn: 'ঐচ্ছিক' },
    'form.optMaxSize': { en: 'optional · max 200 KB', bn: 'ঐচ্ছিক · সর্বোচ্চ ২০০ KB' },
    'form.changeImage': { en: 'Change image', bn: 'ছবি পরিবর্তন করুন' },
    'form.clickUpload': { en: 'Click to upload', bn: 'আপলোড করতে ক্লিক করুন' },
    'form.cancel': { en: 'Cancel', bn: 'বাতিল' },
    'form.addBookBtn': { en: 'Add Book', bn: 'বই যোগ করুন' },
    'form.saveChanges': { en: 'Save Changes', bn: 'পরিবর্তন সংরক্ষণ করুন' },
    'form.errTitle': { en: 'Title is required', bn: 'শিরোনাম প্রয়োজন' },
    'form.errAuthor': { en: 'Author is required', bn: 'লেখকের নাম প্রয়োজন' },
    'form.errDate': { en: 'Date is required', bn: 'তারিখ প্রয়োজন' },
    'form.errName': { en: 'Please enter a name', bn: 'একটি নাম লিখুন' },
    'form.errRequired': { en: '⚠️ Please fill in all required fields before submitting.', bn: '⚠️ জমা দেওয়ার আগে সমস্ত প্রয়োজনীয় ক্ষেত্র পূরণ করুন।' },
    'form.optYetToRead': { en: 'Yet to Read', bn: 'পড়া হয়নি' },
    'form.optReading': { en: 'Reading', bn: 'পড়ছি' },
    'form.optCompleted': { en: 'Completed', bn: 'শেষ হয়েছে' },
    'form.optLentOut': { en: 'Lent Out', bn: 'ধার দেওয়া' },
    'form.optBorrowed': { en: 'Borrowed 📥', bn: 'ধার নেওয়া 📥' },
    'form.optWishlist': { en: 'Wishlist 🛒', bn: 'ইচ্ছা তালিকা 🛒' },
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
    lang = signal<Lang>('en');

    toggle() {
        this.lang.update(l => l === 'en' ? 'bn' : 'en');
    }

    /** Return the translated string for `key` in the current language. */
    t(key: string): string {
        return TRANSLATIONS[key]?.[this.lang()] ?? key;
    }

    get isBengali(): boolean {
        return this.lang() === 'bn';
    }
}
