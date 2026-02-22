import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({ providedIn: 'root' })
export class ManualService {

    download(): void {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const W = doc.internal.pageSize.getWidth();
        const H = doc.internal.pageSize.getHeight();
        const margin = 18;
        const contentW = W - margin * 2;
        let y = 0;

        // ── helpers ────────────────────────────────────────────────────────────────
        const newPage = () => {
            doc.addPage();
            y = margin;
            drawPageBorder();
            drawFooter(doc.internal.pages.length - 1);
        };

        const ensureSpace = (needed: number) => {
            if (y + needed > H - 18) newPage();
        };

        const drawPageBorder = () => {
            doc.setDrawColor(99, 102, 241);
            doc.setLineWidth(0.4);
            doc.rect(8, 8, W - 16, H - 16);
        };

        const drawFooter = (pageNum: number) => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(140, 140, 160);
            doc.text("Truly Sourin's -- User Manual", margin, H - 10);
            doc.text(`Page ${pageNum}`, W - margin, H - 10, { align: 'right' });
        };

        const sectionHeader = (title: string, number: string) => {
            ensureSpace(16);
            doc.setFillColor(99, 102, 241);
            doc.rect(margin, y, 3, 9, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            doc.setTextColor(30, 30, 50);
            doc.text(`${number}. ${title}`, margin + 6, y + 6.5);
            y += 13;
            doc.setDrawColor(220, 220, 235);
            doc.setLineWidth(0.3);
            doc.line(margin, y, W - margin, y);
            y += 5;
        };

        const subHeader = (title: string) => {
            ensureSpace(10);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(60, 60, 100);
            doc.text(title, margin, y);
            y += 5;
        };

        const body = (text: string, indent = 0) => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);
            doc.setTextColor(55, 55, 70);
            const lines = doc.splitTextToSize(text, contentW - indent);
            ensureSpace(lines.length * 5 + 2);
            doc.text(lines, margin + indent, y);
            y += lines.length * 5 + 1;
        };

        const bullet = (text: string, indent = 4) => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);
            doc.setTextColor(55, 55, 70);
            const lines = doc.splitTextToSize(text, contentW - indent - 4);
            ensureSpace(lines.length * 5 + 1);
            doc.setFillColor(99, 102, 241);
            doc.circle(margin + indent + 1, y - 1.5, 1, 'F');
            doc.text(lines, margin + indent + 4, y);
            y += lines.length * 5 + 1;
        };

        const gap = (mm = 4) => { y += mm; };

        // ══════════════════════════════════════════════════════════════════════════
        // COVER PAGE
        // ══════════════════════════════════════════════════════════════════════════
        drawPageBorder();
        drawFooter(1);

        doc.setFillColor(30, 27, 75);
        doc.rect(0, 0, W, 90, 'F');

        doc.setFillColor(99, 102, 241);
        doc.roundedRect(W / 2 - 14, 18, 28, 28, 5, 5, 'F');

        // Book icon drawn with rectangles (no emoji)
        doc.setFillColor(255, 255, 255);
        doc.rect(W / 2 - 6, 23, 8, 13, 'F');
        doc.rect(W / 2 - 7, 22, 1.5, 15, 'F');
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.5);
        doc.line(W / 2 - 5.5, 25, W / 2 + 1, 25);
        doc.line(W / 2 - 5.5, 27.5, W / 2 + 1, 27.5);
        doc.line(W / 2 - 5.5, 30, W / 2 + 1, 30);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(26);
        doc.setTextColor(255, 255, 255);
        doc.text("Truly Sourin's", W / 2, 58, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(13);
        doc.setTextColor(165, 180, 252);
        doc.text('Personal Library Manager', W / 2, 68, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text('User Instruction Manual', W / 2, 77, { align: 'center' });

        y = 100;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 120);
        doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, W / 2, y, { align: 'center' });
        y += 10;

        // Table of contents box
        doc.setFillColor(245, 245, 252);
        doc.roundedRect(margin, y, contentW, 108, 4, 4, 'F');
        doc.setDrawColor(200, 200, 230);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, y, contentW, 108, 4, 4, 'S');

        y += 7;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 30, 60);
        doc.text('Table of Contents', margin + 6, y);
        y += 7;

        const toc = [
            ['1.', 'Getting Started & Login'],
            ['2.', 'My Library -- The Dashboard'],
            ['3.', 'Search, Filtering & Pagination'],
            ['4.', 'Adding a New Book'],
            ['5.', 'Book Statuses Explained'],
            ['6.', 'Lend Tracking & Overdue Alerts'],
            ['7.', 'Editing & Deleting Books'],
            ['8.', 'Excel Import & Export'],
            ['9.', 'Statistics Page'],
            ['10.', 'Tips & Quick Reference'],
        ];

        toc.forEach(([num, title]) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(99, 102, 241);
            doc.text(num, margin + 6, y);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50, 50, 70);
            doc.text(title, margin + 14, y);
            y += 8;
        });

        // ══════════════════════════════════════════════════════════════════════════
        // PAGE 2
        // ══════════════════════════════════════════════════════════════════════════
        newPage();

        // ── Section 1 ─────────────────────────────────────────────────────────────
        sectionHeader('Getting Started & Login', '1');
        body("Truly Sourin's is a private, personal book-tracking app secured with a PIN login. Your library data is stored locally in your browser (localStorage) and is never sent to any server.");
        gap();
        subHeader('How to log in');
        bullet('Navigate to the app URL. You will be redirected to the login screen automatically.');
        bullet('Enter your PIN in the input field and press Enter or click "Unlock".');
        bullet('Once authenticated, you are taken directly to your Library (dashboard).');
        bullet('To log out, click the lock icon button at the far right of the navbar.');
        gap();

        // ── Section 2 ─────────────────────────────────────────────────────────────
        sectionHeader('My Library -- The Dashboard', '2');
        body('The dashboard is your main view. It displays all your books as cards in a responsive grid. The page header shows "My Library" with a subtitle "Track your reading journey".');
        gap();
        subHeader('Book Cards');
        bullet('Each card shows the book cover (if set), title, author, status badge, and metadata (genre, language, category).');
        bullet('Cards for "Lent Out" books show the borrower name and the lent date.');
        bullet('Cards for "Reading" or "Completed" books show your personal thoughts/feedback if entered.');
        gap();
        subHeader('Navbar Stats Pills');
        bullet('The navbar shows a live count of books currently being read and books currently lent out.');

        // ── Section 3 ─────────────────────────────────────────────────────────────
        sectionHeader('Search, Filtering & Pagination', '3');
        subHeader('Search Bar');
        body('The search bar in the header filters books in real-time across: Title, Author, Genre, Language, Category, Status, and Borrower name. Click the X button to clear the search.');
        gap();
        subHeader('Status Tabs');
        body('The row of pill-shaped tabs below the header filters by reading status. Available tabs:');
        bullet('All Books -- shows all books regardless of status');
        bullet('Yet to Read -- books queued in your reading list');
        bullet('Reading -- books currently being read');
        bullet('Completed -- books you have finished');
        bullet('Lent Out -- books borrowed by someone else');
        bullet('Wishlist -- books you want to acquire');
        gap();
        subHeader('Advanced Filters');
        body('The filter row lets you narrow down by:');
        bullet('Language -- filter by the book\'s language (English, Bengali, Hindi, Spanish, French, Arabic, Other)');
        bullet('Genre -- filter by literary genre (Fiction, Non-Fiction, Mystery, Thriller, etc.)');
        bullet('Category -- filter by format (Novel, Short Stories, Poetry, etc.)');
        bullet('Per Page -- choose how many books appear per page: 6, 9, 12, or 24');
        body('Active filters appear as removable badge chips. Click X on a badge or "Clear filters" to reset.');
        gap();
        subHeader('Pagination');
        body('When there are more books than the "Per Page" limit, pagination controls appear at the bottom. The current page and total are shown. Click a page number or use the arrow buttons to navigate.');

        // ══════════════════════════════════════════════════════════════════════════
        // PAGE 3
        // ══════════════════════════════════════════════════════════════════════════
        newPage();

        // ── Section 4 ─────────────────────────────────────────────────────────────
        sectionHeader('Adding a New Book', '4');
        body('Click "+ Add Book" in the dashboard header or the "Add Book" nav link. This opens a form with the following fields:');
        gap();

        const fields: [string, string, boolean][] = [
            ['Title', 'The book\'s full title.', true],
            ['Author', 'The author\'s name.', true],
            ['Category', 'Book format -- Novel, Short Stories, Poetry, etc. (optional)', false],
            ['Language', 'Language the book is written in (optional)', false],
            ['Genre', 'Literary genre -- Fiction, Non-Fiction, Mystery, etc. (optional)', false],
            ['Status', 'Reading status -- defaults to "Yet to Read"', true],
            ['Date / Date Lent', 'A date field; required when status is "Lent Out"', false],
            ['Borrowed By', 'Borrower\'s name -- appears and is required when status is "Lent Out"', false],
            ['My Thoughts', 'Personal feedback/notes -- shown only for Reading or Completed books (optional)', false],
            ['Cover Image', 'Upload a cover photo (max 200 KB). Stored as Base64 in the browser.', false],
        ];

        fields.forEach(([name, desc, req]) => {
            ensureSpace(8);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9.5);
            doc.setTextColor(99, 102, 241);
            doc.text(name + (req ? ' *' : ''), margin + 4, y);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(55, 55, 70);
            const lines = doc.splitTextToSize(desc, contentW - 8);
            doc.text(lines, margin + 4, y + 5);
            y += lines.length * 5 + 7;
        });

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(130, 130, 150);
        doc.text('* Required field', margin, y);
        y += 8;

        body('After filling in the details, click "Add Book" to save, or "Cancel" to go back without saving.');

        // ── Section 5 ─────────────────────────────────────────────────────────────
        sectionHeader('Book Statuses Explained', '5');
        body('Each book has one of five statuses that you can change at any time from its card:');
        gap();

        const statuses: [string, string, [number, number, number]][] = [
            ['Yet to Read', 'The book is in your reading queue but not started yet.', [100, 116, 139]],
            ['Reading', 'You are currently reading this book. You can add ongoing thoughts.', [99, 102, 241]],
            ['Completed', 'You have finished reading. You can store your final review/thoughts.', [34, 197, 94]],
            ['Lent Out', "The book has been lent to someone. Records the borrower's name and lent date. Triggers overdue alerts after 3 months.", [168, 85, 247]],
            ['Wishlist', 'A book you want to acquire. Useful for tracking future purchases.', [245, 158, 11]],
        ];

        statuses.forEach(([label, desc, color]) => {
            ensureSpace(20);
            doc.setFillColor(color[0], color[1], color[2]);
            doc.setDrawColor(color[0], color[1], color[2]);
            const descLines = doc.splitTextToSize(desc, contentW - 8);
            const boxH = 8 + descLines.length * 5;
            doc.roundedRect(margin, y, contentW, boxH, 3, 3, 'FD');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9.5);
            doc.setTextColor(255, 255, 255);
            doc.text(label, margin + 4, y + 5.5);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.text(descLines, margin + 4, y + 11);
            y += boxH + 4;
        });

        // ══════════════════════════════════════════════════════════════════════════
        // PAGE 4
        // ══════════════════════════════════════════════════════════════════════════
        newPage();

        // ── Section 6 ─────────────────────────────────────────────────────────────
        sectionHeader('Lend Tracking & Overdue Alerts', '6');
        body('When a book\'s status is set to "Lent Out", the app records the borrower name and lent date. The notification bell icon in the navbar shows a count badge for overdue books.');
        gap();
        subHeader('Severity Levels');
        bullet('Orange alert -- book has been lent for 3 to 6 months.');
        bullet('Red alert -- book has been lent for over 6 months. The bell also shakes as an extra warning.');
        gap();
        subHeader('Notification Panel');
        body('Click the bell icon to open the notification dropdown. Each item shows:');
        bullet('Book title and borrower\'s name');
        bullet('How many months ago the book was lent');
        bullet('The exact date the book was lent');
        gap();
        body('You can dismiss individual alerts (X) or clear all at once. Dismissed alerts reset when you reload the app.');

        // ── Section 7 ─────────────────────────────────────────────────────────────
        sectionHeader('Editing & Deleting Books', '7');
        subHeader('Editing a Book');
        bullet('On any book card, click the Edit button (pencil icon).');
        bullet('You are taken to the Edit Book page, which is pre-filled with all existing data.');
        bullet('Update any field and click "Save" to apply changes, or "Cancel" to discard.');
        bullet('You can also update just the status directly from the card\'s quick-action buttons.');
        gap();
        subHeader('Changing Status Directly from a Card');
        bullet('Each book card has quick-action status buttons at the bottom.');
        bullet('For "Lent Out", a popup dialog asks for the borrower\'s name and lent date.');
        gap();
        subHeader('Deleting a Book');
        bullet('On a book card, click the Delete button (trash icon).');
        bullet('A confirmation dialog appears -- click OK to permanently delete, or Cancel to keep the book.');
        body('Note: Deletion is irreversible unless you have an Excel backup.');

        // ── Section 8 ─────────────────────────────────────────────────────────────
        sectionHeader('Excel Import & Export', '8');
        body('The navbar contains Export and Import buttons for backing up and restoring your library as an Excel spreadsheet (.xlsx).');
        gap();
        subHeader('Export');
        bullet('Click the "Export" button in the navbar.');
        bullet('A file named "books.xlsx" is downloaded immediately with all your books.');
        bullet('Each row is one book, with columns for Title, Author, Status, Category, Language, Genre, Borrower, Lent Date, Thoughts, Cover URL, and Added Date.');
        gap();
        subHeader('Import');
        bullet('Click the "Import" button in the navbar and select an .xlsx file.');
        bullet('WARNING: importing REPLACES your entire current library with the data from the file.');
        bullet('A confirmation dialog appears before import proceeds.');
        bullet('Invalid rows are skipped automatically; a toast message shows how many books were imported and how many rows were skipped.');
        gap();

        // Warning box (no emoji)
        doc.setFillColor(255, 245, 200);
        doc.setDrawColor(245, 158, 11);
        doc.setLineWidth(0.4);
        doc.roundedRect(margin, y, contentW, 12, 3, 3, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(120, 80, 0);
        doc.text('Tip: Export your library regularly as a backup before importing from a file.', margin + 4, y + 7.5);
        y += 16;

        // ── Section 9 ─────────────────────────────────────────────────────────────
        sectionHeader('Statistics Page', '9');
        body('Navigate to "Statistics" via the navbar link. It provides a comprehensive overview of your entire library:');
        gap();
        bullet('Total books, total authors, books read this year, and books currently being read.');
        bullet('Reading Pace -- estimated average time to finish a book.');
        bullet('Status Distribution -- a visual breakdown of how many books are in each status.');
        bullet('Language Breakdown -- bar chart showing books per language (top languages + others).');
        bullet('Genre Breakdown -- bar chart showing books by literary genre.');
        bullet('Category Breakdown -- bar chart by category type (Novel, Poetry, etc.).');
        bullet('Author Breakdown -- sorted list of all authors with their book counts, highlighting your most-read author.');

        // ── Section 10 ────────────────────────────────────────────────────────────
        sectionHeader('Tips & Quick Reference', '10');
        subHeader('General Tips');
        bullet('All data is stored in your browser. Do NOT clear site data/localStorage or you will lose your library.');
        bullet('Export to Excel regularly to keep a backup you can restore later.');
        bullet('Book cover images are stored inline -- keep them under 200 KB.');
        bullet('The search bar is the fastest way to find a book -- it searches all fields simultaneously.');
        gap();
        subHeader('Common Workflows');
        bullet('Start reading a new book: Add Book, then set status to "Reading".');
        bullet('Lend a book: open the card, click "Lent Out", enter the borrower\'s name and date.');
        bullet('Book returned: open the book, change status back to "Completed" or "Yet to Read".');
        bullet('View overdue loans: click the bell icon in the navbar.');
        bullet('Transfer library to a new device: Export on old device, Import on new device.');
        gap();
        subHeader('Data Privacy');
        body("Truly Sourin's is a fully client-side app. No data ever leaves your browser. The app uses no analytics, telemetry, or external services.");
        gap(8);

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(140, 140, 160);
        doc.text('Happy reading!', W / 2, y, { align: 'center' });

        // ── Save ────────────────────────────────────────────────────────────────────
        doc.save('Truly-Sourins-Manual.pdf');
    }
}
