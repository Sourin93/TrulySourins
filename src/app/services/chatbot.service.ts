import { Injectable, inject } from '@angular/core';
import { BookService } from './book.service';
import { Book } from '../models/book.model';
import { GoogleGenAI, Type } from '@google/genai';

export interface ChatMessage {
    role: 'user' | 'bot';
    text: string;
    timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {
    private bookService = inject(BookService);

    get hasApiKey(): boolean {
        return !!localStorage.getItem('gemini_api_key');
    }

    setApiKey(key: string) {
        localStorage.setItem('gemini_api_key', key.trim());
    }

    removeApiKey() {
        localStorage.removeItem('gemini_api_key');
    }

    /** Process a user message and return a bot reply */
    async getReply(input: string, chatHistory: ChatMessage[]): Promise<string> {
        const apiKey = localStorage.getItem('gemini_api_key');
        if (!apiKey) {
            return 'Please provide your Gemini API key to use the chat assistant.';
        }

        const ai = new GoogleGenAI({ apiKey });
        const books = this.bookService.books();

        let libraryContext = '';
        if (books.length === 0) {
            libraryContext = 'The user currently has no books in their library.';
        } else {
            libraryContext = books.map(b =>
                `Title: ${b.title}, Author: ${b.author || 'Unknown'}, Status: ${b.status}, Genre: ${b.genre || 'None'}, Category: ${b.category || 'None'}, Language: ${b.language || 'None'}`
                + (b.status === 'Lent Out' ? `, Lent To: ${b.borrowedBy || 'Unknown'}, Lent Date: ${b.lentDate || 'Unknown'}` : '')
                + (b.status === 'Borrowed' ? `, Borrowed From: ${b.borrowedFrom || 'Unknown'}` : '')
                + (b.feedback ? `, User's Thoughts/Feedback: ${b.feedback}` : '')
            ).join('\n');
        }

        const todayDate = new Date().toISOString().split('T')[0];
        const systemPrompt = `You are a helpful, enthusiastic, and knowledgeable library assistant for the application 'Truly Sourin's'.
Today's date is ${todayDate}.
Your job is to answer the user's questions about their book collection and help them manage it.
You can use the \`addBook\` tool to add a new book to the user's library when requested. Explain what you are doing in your response if you use a tool.
Before using the \`addBook\` tool, YOU MUST ensure you have all mandatory fields. Mandatory fields are title, author, and status.
If the status is "Lent Out", you MUST also ask the user for the name of the person it is lent to and the date.
If the status is "Borrowed", you MUST also ask the user for the name of the person it is borrowed from and the date.
If any of these mandatory fields are missing (or if the user did not provide them in their request), politely ask the user for the missing information and DO NOT call the \`addBook\` tool yet. If the user mentions "today" for any date, use ${todayDate}.
You can use the \`deleteBook\` tool to delete a  book from the user's library when requested. Explain what you are doing in your response if you use a tool.
Before using the \`deleteBook\` tool, YOU MUST ensure you have all mandatory fields. Mandatory fields are title, author. Also ask confirmation as Yes or No. If Yes then only delete the book.
You can use the \`updateBookStatus\` tool to update a book's reading status when requested. Explain what you are doing in your response if you use a tool.
Before using the \`updateBookStatus\` tool, YOU MUST ensure you have all mandatory fields. Mandatory fields are title, author, and newStatus. If changing status to "Lent Out", ask for the person it is lent to. If changing to "Borrowed", ask for the person borrowed from.
Use the following context representing the user's current library.
If the user asks about a particular book or how it is, consider their "User's Thoughts/Feedback" if available in the context.
If the user asks a question that is completely unrelated to books, reading, or their library, please politely decline to answer.
If the user asks for a recommendation, pick a book from their "Yet to Read" list, or if empty, recommend a famous general book.
Keep your answers brief, concise, and formatted clearly in Markdown. Do not hallucinate.

LIBRARY CONTEXT:
${libraryContext}`;

        // Format history for Gemini
        // We exclude the very first welcome message if it's the default one to save tokens, but here we just pass the last few
        const formattedHistory = chatHistory.slice(-10).map(msg => ({
            role: msg.role === 'bot' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                config: {
                    tools: [{
                        functionDeclarations: [{
                            name: 'addBook',
                            description: 'Add a new book to the user\'s library.',
                            parameters: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING, description: 'The title of the book.' },
                                    author: { type: Type.STRING, description: 'The author of the book.' },
                                    status: {
                                        type: Type.STRING,
                                        description: 'The reading status: "Yet to Read", "Reading", "Completed", "Lent Out", "Borrowed", or "Wishlist". Defaults to "Wishlist".'
                                    },
                                    category: { type: Type.STRING, description: 'The category, e.g., "Novel", "Science Fiction", "Other".' },
                                    language: { type: Type.STRING, description: 'The language, e.g., "English", "Bengali".' },
                                    genre: { type: Type.STRING, description: 'The genre, e.g., "Fiction", "Non-Fiction", "Mystery".' },
                                    borrowedBy: { type: Type.STRING, description: 'The name of the person it is lent to. Required if status is "Lent Out".' },
                                    borrowedFrom: { type: Type.STRING, description: 'The name of the person it is borrowed from. Required if status is "Borrowed".' },
                                    lentDate: { type: Type.STRING, description: 'The date it was lent or borrowed (e.g. YYYY-MM-DD). Required if status is "Lent Out" or "Borrowed".' }
                                },
                                required: ['title', 'author']
                            }
                        }, {
                            name: 'deleteBook',
                            description: 'Delete a book from the user\'s library.',
                            parameters: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING, description: 'The title of the book to delete.' },
                                    author: { type: Type.STRING, description: 'The author of the book to delete.' }
                                },
                                required: ['title', 'author']
                            }
                        }, {
                            name: 'updateBookStatus',
                            description: 'Update the reading status of a book in the user\'s library.',
                            parameters: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING, description: 'The title of the book.' },
                                    author: { type: Type.STRING, description: 'The author of the book.' },
                                    newStatus: {
                                        type: Type.STRING,
                                        description: 'The new reading status: "Yet to Read", "Reading", "Completed", "Lent Out", "Borrowed", or "Wishlist".'
                                    },
                                    personName: { type: Type.STRING, description: 'The name of the person it is lent to or borrowed from. Required if newStatus is "Lent Out" or "Borrowed".' }
                                },
                                required: ['title', 'author', 'newStatus']
                            }
                        }]
                    }],
                },
                contents: [
                    { role: 'user', parts: [{ text: systemPrompt }] },
                    ...formattedHistory,
                    { role: 'user', parts: [{ text: input }] }
                ]
            });

            if (response.functionCalls && response.functionCalls.length > 0) {
                const call = response.functionCalls[0];
                if (call.name === 'addBook') {
                    const args = call.args as any;
                    const newBook = {
                        title: args.title,
                        author: args.author,
                        status: args.status || 'Wishlist',
                        category: args.category || 'Other',
                        language: args.language || 'English',
                        genre: args.genre || 'Other',
                        borrowedBy: args.borrowedBy || undefined,
                        borrowedFrom: args.borrowedFrom || undefined,
                        lentDate: args.lentDate || undefined,
                    };
                    this.bookService.addBook(newBook as any);

                    // To keep things simple, return a confirmation directly instead of a second round-trip
                    return `I have successfully added **${newBook.title}** by ${newBook.author} to your library (Status: ${newBook.status}).`;
                } else if (call.name === 'deleteBook') {
                    const args = call.args as any;
                    const title = args.title;
                    const author = args.author;
                    const bookToDelete = this.bookService.books().find(b =>
                        b.title.toLowerCase() === title.toLowerCase() &&
                        (b.author?.toLowerCase() || 'unknown') === author.toLowerCase()
                    );

                    if (bookToDelete) {
                        this.bookService.deleteBook(bookToDelete.id);
                        return `I have successfully deleted **${bookToDelete.title}** by **${bookToDelete.author || 'Unknown'}** from your library.`;
                    } else {
                        return `I couldn't find a book titled **${title}** by **${author}** in your library. Please check the spelling and try again.`;
                    }
                } else if (call.name === 'updateBookStatus') {
                    const args = call.args as any;
                    const title = args.title;
                    const author = args.author;
                    const bookToUpdate = this.bookService.books().find(b =>
                        b.title.toLowerCase() === title.toLowerCase() &&
                        (b.author?.toLowerCase() || 'unknown') === author.toLowerCase()
                    );

                    if (bookToUpdate) {
                        this.bookService.updateStatus(bookToUpdate.id, args.newStatus, args.personName);
                        return `I have successfully updated the status of **${bookToUpdate.title}** to **${args.newStatus}**.`;
                    } else {
                        return `I couldn't find a book titled **${title}** by **${author}** in your library. Please check the spelling and try again.`;
                    }
                }
            }

            return response.text || "I'm sorry, I couldn't formulate a response.";
        } catch (error: any) {
            console.error("Gemini API Error:", error);
            if (error?.message?.includes('API key not valid') || error?.status === 400 || error?.status === 403) {
                return "⚠️ There seems to be an issue with your API key. Please check it and try again.";
            }
            return "⚠️ I encountered an error while trying to think of a response. Please try again later.";
        }
    }
}
