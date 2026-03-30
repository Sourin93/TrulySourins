export type BookCategory = 'Novel' | 'Short Stories' | 'Long Stories' | 'Poetry' | 'Prose' | 'Documentary' | 'Travel' | 'Magazine' | 'Other';
export type BookLanguage = 'English' | 'Bengali' | 'Hindi' | 'Spanish' | 'French' | 'Arabic' | 'Other';
export type BookGenre = 'Fiction' | 'Non-Fiction' | 'Mystery' | 'Thriller' | 'Romance' | 'Science Fiction' | 'Fantasy' | 'Horror' | 'Biography' | 'Self-Help' | 'History' | "Children's" | 'Young Adult' | 'Comics' | 'Other';

export interface Book {
  id: string;
  title: string;
  author: string;
  status: 'Yet to Read' | 'Reading' | 'Completed' | 'Lent Out' | 'Borrowed' | 'Wishlist';
  category?: BookCategory;
  language?: BookLanguage;
  genre?: BookGenre;
  borrowedBy?: string;     // For Lent Out
  borrowedFrom?: string;   // For Borrowed
  lentDate?: string;
  coverUrl?: string;
  feedback?: string;
  addedDate: number;
}

