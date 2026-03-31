import {
  Component, inject, signal, ViewChild, ElementRef, AfterViewChecked, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatMessage } from '../../services/chatbot.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- ── Floating Action Button ── -->
    <button
      id="chatbot-fab"
      class="chatbot-fab"
      [class.open]="isOpen()"
      (click)="toggleChat()"
      aria-label="Open chat assistant"
      title="Library Assistant">
      <!-- Bot icon -->
      <svg *ngIf="!isOpen()" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
        <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
      </svg>
      <!-- Close icon when open -->
      <svg *ngIf="isOpen()" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
      </svg>
      <!-- Pulse ring when closed -->
      <span *ngIf="!isOpen()" class="fab-pulse"></span>
    </button>

    <!-- ── Chat Window ── -->
    <div class="chat-window" [class.visible]="isOpen()" role="dialog" aria-label="Chat Assistant">

      <!-- Header -->
      <div class="chat-header">
        <div class="chat-header-left">
          <div class="bot-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
              <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
            </svg>
          </div>
          <div>
            <div class="chat-title">Library Assistant</div>
            <div class="chat-status">
              <span class="status-dot"></span>
              {{ isTyping() ? 'Thinking…' : 'Online' }}
            </div>
          </div>
        </div>
        <div class="chat-header-right">
          <!-- Mode Toggle -->
          <div class="mode-toggle" (click)="toggleMode()" title="Toggle Offline/AI Mode">
            <span class="mode-label" [class.active]="!chatbot.isOfflineMode()">🤖</span>
            <div class="mode-track" [class.offline]="chatbot.isOfflineMode()">
              <div class="mode-thumb"></div>
            </div>
            <span class="mode-label" [class.active]="chatbot.isOfflineMode()">📴</span>
          </div>

          <!-- Voice Toggle -->
          <button class="chat-action-btn" (click)="toggleTTS()" [class.muted]="!ttsEnabled()" aria-label="Toggle Text-to-Speech" [title]="ttsEnabled() ? 'Voice responses ON' : 'Voice responses OFF'">
            <svg *ngIf="ttsEnabled()" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.457 2.458a.75.75 0 0 0-1.12-.647L5.594 4H3.75A2.25 2.25 0 0 0 1.5 6.25v2.5a2.25 2.25 0 0 0 2.25 2.25h1.844l3.743 2.189a.75.75 0 0 0 1.12-.648v-10Zm3.791 2.029a.75.75 0 0 1 1.06 0 5.488 5.488 0 0 1 1.642 3.903c0 1.517-.611 2.895-1.597 3.899a.75.75 0 0 1-1.06-1.06 3.987 3.987 0 0 0 1.157-2.839c0-1.1-.45-2.096-1.176-2.813a.75.75 0 0 1-.026-1.09ZM15.02 1.258a.75.75 0 0 1 1.06 0 8.484 8.484 0 0 1 2.42 5.922c0 2.36-.962 4.5-2.518 6.042a.75.75 0 0 1-1.06-1.06 6.984 6.984 0 0 0 2.078-4.982c0-1.928-.782-3.676-2.046-4.94a.75.75 0 0 1 .066-1.082Z" />
            </svg>
            <svg *ngIf="!ttsEnabled()" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10.457 2.458a.75.75 0 0 0-1.12-.647L5.594 4H3.75A2.25 2.25 0 0 0 1.5 6.25v2.5a2.25 2.25 0 0 0 2.25 2.25h1.844l3.743 2.189a.75.75 0 0 0 1.12-.648v-10ZM15.28 7.22a.75.75 0 0 0-1.06 1.06L15.44 9.5l-1.22 1.22a.75.75 0 1 0 1.06 1.06l1.22-1.22 1.22 1.22a.75.75 0 0 0 1.06-1.06l-1.22-1.22 1.22-1.22a.75.75 0 0 0-1.06-1.06l-1.22 1.22-1.22-1.22Z" clip-rule="evenodd" />
            </svg>
          </button>
          <!-- Clear history -->
          <button class="chat-clear-btn" (click)="clearHistory()" aria-label="Clear chat history" title="Clear chat">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 3.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd"/>
            </svg>
          </button>
          <!-- Close -->
          <button class="chat-close" (click)="toggleChat()" aria-label="Close chat">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- API Key Setup -->
      <div class="api-key-setup" *ngIf="!chatbot.hasApiKey && !chatbot.isOfflineMode()">
        <div class="api-key-header">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clip-rule="evenodd" />
          </svg>
          <h3>Welcome to AI Chat</h3>
        </div>
        <p>Enter your Google Gemini API key to get started.</p>
        <input 
          type="password" 
          placeholder="AIzaSy..." 
          [(ngModel)]="apiKeyInput"
          [disabled]="isSavingKey"
        />
        <button [disabled]="!apiKeyInput.trim() || isSavingKey" (click)="saveApiKey()">
          {{ isSavingKey ? 'Saving...' : 'Save Key' }}
        </button>
        <a href="https://aistudio.google.com/app/apikey" target="_blank" class="help-link">Get an API key</a>
      </div>

      <ng-container *ngIf="chatbot.hasApiKey || chatbot.isOfflineMode()">
        <!-- Messages -->
        <div class="chat-messages" #messageContainer>
          <div *ngFor="let msg of messages()" class="msg-row" [class.user-row]="msg.role === 'user'">
            <!-- Bot avatar for bot messages -->
            <div *ngIf="msg.role === 'bot'" class="msg-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
                <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
              </svg>
            </div>

            <div class="msg-bubble" [class.user-bubble]="msg.role === 'user'" [class.bot-bubble]="msg.role === 'bot'">
              <span [innerHTML]="formatText(msg.text)"></span>
            </div>
          </div>

          <!-- Typing indicator -->
          <div *ngIf="isTyping()" class="msg-row">
            <div class="msg-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
                <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
              </svg>
            </div>
            <div class="msg-bubble bot-bubble typing-bubble">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>

        <!-- Quick chips -->
        <div class="quick-chips" *ngIf="messages().length <= 1">
          <button class="chip" *ngFor="let chip of quickChips" (click)="sendChip(chip)">{{ chip }}</button>
        </div>

        <!-- Input Bar -->
        <div class="chat-input-bar">
          <button
            class="mic-btn"
            [class.listening]="isListening()"
            (click)="toggleVoiceInput()"
            title="Voice typing"
            aria-label="Voice typing">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 4a3 3 0 0 1 6 0v6a3 3 0 1 1-6 0V4Z" />
              <path d="M5.5 9.643a.75.75 0 0 0-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-1.5v-1.546A6.001 6.001 0 0 0 16 10v-.357a.75.75 0 0 0-1.5 0V10a4.5 4.5 0 0 1-9 0v-.357Z" />
            </svg>
          </button>
          <input
            id="chatbot-input"
            #inputEl
            class="chat-input"
            type="text"
            placeholder="Ask about your library…"
            [(ngModel)]="userInput"
            (keydown.enter)="sendMessage()"
            [disabled]="isTyping()"
            autocomplete="off"
          />
          <button
            class="send-btn"
            (click)="sendMessage()"
            [disabled]="!userInput.trim() || isTyping()"
            aria-label="Send message">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3.105 2.289a.75.75 0 0 0-.826.95l1.903 6.308a.75.75 0 0 0 .709.505h4.109a.75.75 0 0 1 0 1.5H4.891a.75.75 0 0 0-.709.505l-1.903 6.308a.75.75 0 0 0 .826.95 28.896 28.896 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.289Z"/>
            </svg>
          </button>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    /* ── FAB ────────────────────────────────────────────────────────────── */
    .chatbot-fab {
      position: fixed;
      bottom: 1.75rem;
      right: 1.75rem;
      z-index: 1000;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border: none;
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 24px rgba(99, 102, 241, 0.5), 0 2px 8px rgba(0,0,0,0.3);
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }
    .chatbot-fab svg { width: 22px; height: 22px; }
    .chatbot-fab:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 32px rgba(99, 102, 241, 0.65), 0 2px 8px rgba(0,0,0,0.3);
    }
    .chatbot-fab.open {
      background: linear-gradient(135deg, #475569, #334155);
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    }

    /* Pulse ring */
    .fab-pulse {
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px solid rgba(99, 102, 241, 0.55);
      animation: fab-ring 2.4s ease-out infinite;
      pointer-events: none;
    }
    @keyframes fab-ring {
      0%   { transform: scale(1);   opacity: 0.7; }
      70%  { transform: scale(1.6); opacity: 0; }
      100% { transform: scale(1.6); opacity: 0; }
    }

    /* ── Chat Window ─────────────────────────────────────────────────────── */
    .chat-window {
      position: fixed;
      bottom: 5.75rem;
      right: 1.75rem;
      z-index: 999;
      width: 380px;
      max-width: calc(100vw - 2rem);
      height: 530px;
      max-height: calc(100vh - 8rem);
      background: rgba(15, 23, 42, 0.96);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
      transform: translateY(16px) scale(0.97);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), opacity 0.2s ease;
      overflow: hidden;
    }
    .chat-window.visible {
      transform: translateY(0) scale(1);
      opacity: 1;
      pointer-events: all;
    }

    /* ── Header ────────────────────────────────────────────────────────── */
    .chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1rem 0.875rem;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1));
      flex-shrink: 0;
    }
    .chat-header-left {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }
    .bot-avatar {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }
    .bot-avatar svg { width: 18px; height: 18px; }
    .chat-title {
      font-size: 0.92rem;
      font-weight: 700;
      color: #e2e8f0;
      letter-spacing: -0.01em;
    }
    .chat-status {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.72rem;
      color: var(--text-muted, #94a3b8);
      margin-top: 0.1rem;
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #34d399;
      animation: pulse-dot 2s ease-in-out infinite;
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }
    .chat-header-right {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .chat-close, .chat-clear-btn, .chat-action-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .chat-close svg, .chat-clear-btn svg, .chat-action-btn svg { width: 14px; height: 14px; }
    .chat-close:hover { background: rgba(239,68,68,0.15); color: #f87171; border-color: rgba(239,68,68,0.3); }
    .chat-clear-btn:hover { background: rgba(245,158,11,0.15); color: #fbbf24; border-color: rgba(245,158,11,0.3); }
    .chat-action-btn:hover { background: rgba(52,211,153,0.15); color: #34d399; border-color: rgba(52,211,153,0.3); }
    .chat-action-btn.muted { color: #f87171; }

    /* ── Mode Toggle ── */
    .mode-toggle {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      cursor: pointer;
      margin-right: 0.25rem;
      background: rgba(0,0,0,0.15);
      padding: 0.25rem;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .mode-label {
      font-size: 0.8rem;
      opacity: 0.4;
      transition: opacity 0.2s;
    }
    .mode-label.active { opacity: 1; }
    .mode-track {
      width: 28px;
      height: 14px;
      background: #8b5cf6;
      border-radius: 100px;
      position: relative;
      transition: background 0.3s;
    }
    .mode-track.offline { background: #64748b; }
    .mode-thumb {
      width: 10px;
      height: 10px;
      background: #fff;
      border-radius: 50%;
      position: absolute;
      top: 2px;
      left: 2px;
      transition: transform 0.3s cubic-bezier(.4,0,.2,1);
    }
    .mode-track.offline .mode-thumb { transform: translateX(14px); }

    /* ── API Key Setup ── */
    .api-key-setup {
      display: flex;
      flex-direction: column;
      flex: 1;
      padding: 2rem 1.5rem;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .api-key-setup .api-key-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      color: #e2e8f0;
    }
    .api-key-setup .api-key-header svg {
      width: 24px;
      height: 24px;
      color: #8b5cf6;
    }
    .api-key-setup h3 {
      font-size: 1.2rem;
      margin: 0;
    }
    .api-key-setup p {
      color: #94a3b8;
      font-size: 0.875rem;
      margin-top: 0;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }
    .api-key-setup input {
      width: 100%;
      padding: 0.75rem 1rem;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(99,102,241,0.4);
      border-radius: 12px;
      color: #fff;
      font-size: 0.95rem;
      margin-bottom: 1rem;
      transition: border-color 0.2s, background 0.2s;
    }
    .api-key-setup input:focus {
      outline: none;
      border-color: #8b5cf6;
      background: rgba(99,102,241,0.1);
    }
    .api-key-setup button {
      width: 100%;
      padding: 0.75rem 1rem;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(99,102,241,0.3);
      transition: transform 0.15s, opacity 0.15s;
    }
    .api-key-setup button:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(99,102,241,0.4);
    }
    .api-key-setup button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .api-key-setup .help-link {
      margin-top: 1rem;
      color: #818cf8;
      font-size: 0.8rem;
      text-decoration: none;
    }
    .api-key-setup .help-link:hover {
      text-decoration: underline;
    }

    /* ── Messages ─────────────────────────────────────────────────────── */
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.1) transparent;
    }
    .chat-messages::-webkit-scrollbar { width: 4px; }
    .chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

    .msg-row {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
    }
    .user-row { flex-direction: row-reverse; }

    .msg-avatar {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }
    .msg-avatar svg { width: 14px; height: 14px; }

    .msg-bubble {
      max-width: 82%;
      padding: 0.6rem 0.85rem;
      border-radius: 16px;
      font-size: 0.875rem;
      line-height: 1.55;
      word-break: break-word;
      white-space: pre-wrap;
    }
    .bot-bubble {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
      color: #e2e8f0;
      border-bottom-left-radius: 4px;
    }
    .user-bubble {
      background: linear-gradient(135deg, rgba(99,102,241,0.8), rgba(139,92,246,0.7));
      color: #fff;
      border-bottom-right-radius: 4px;
      box-shadow: 0 2px 12px rgba(99,102,241,0.3);
    }

    /* Typing indicator */
    .typing-bubble {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0.65rem 0.9rem;
    }
    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #a5b4fc;
      animation: typing-bounce 1.2s ease-in-out infinite;
    }
    .dot:nth-child(1) { animation-delay: 0s; }
    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typing-bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30%            { transform: translateY(-5px); opacity: 1; }
    }

    /* ── Quick Chips ──────────────────────────────────────────────────── */
    .quick-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      padding: 0 1rem 0.75rem;
      flex-shrink: 0;
    }
    .chip {
      padding: 0.3rem 0.75rem;
      border-radius: 100px;
      border: 1px solid rgba(99,102,241,0.35);
      background: rgba(99,102,241,0.1);
      color: #a5b4fc;
      font-size: 0.78rem;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .chip:hover { background: rgba(99,102,241,0.25); border-color: rgba(99,102,241,0.6); color: #c7d2fe; }

    /* ── Input Bar ───────────────────────────────────────────────────── */
    .chat-input-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 0.875rem;
      border-top: 1px solid rgba(255,255,255,0.07);
      background: rgba(0,0,0,0.2);
      flex-shrink: 0;
    }
    .chat-input {
      flex: 1;
      padding: 0.5rem 0.875rem;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      color: #e2e8f0;
      font-size: 0.875rem;
      font-family: inherit;
      transition: border-color 0.18s, background 0.18s;
      min-width: 0;
    }
    .chat-input::placeholder { color: #64748b; }
    .chat-input:focus {
      outline: none;
      border-color: rgba(99,102,241,0.5);
      background: rgba(99,102,241,0.08);
    }
    .chat-input:disabled { opacity: 0.5; cursor: not-allowed; }

    .mic-btn {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s;
    }
    .mic-btn svg { width: 16px; height: 16px; }
    .mic-btn:hover { color: #fff; background: rgba(255,255,255,0.12); }
    .mic-btn.listening {
      background: rgba(239,68,68,0.15);
      border-color: rgba(239,68,68,0.4);
      color: #f87171;
      animation: mic-pulse 1.5s infinite;
    }
    @keyframes mic-pulse {
      0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
      70% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
      100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
    }

    .send-btn {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border: none;
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: opacity 0.15s, transform 0.15s;
      box-shadow: 0 2px 8px rgba(99,102,241,0.4);
    }
    .send-btn svg { width: 16px; height: 16px; }
    .send-btn:hover:not(:disabled) { opacity: 0.9; transform: scale(1.05); }
    .send-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

    /* Bold text inside messages */
    :host ::ng-deep .msg-bubble strong { color: #c7d2fe; font-weight: 700; }
    :host ::ng-deep .user-bubble strong { color: #fff; }
    :host ::ng-deep .msg-bubble em { opacity: 0.7; font-style: italic; }

    @media (max-width: 480px) {
      .chat-window { right: 0.75rem; left: 0.75rem; width: auto; bottom: 5.25rem; }
      .chatbot-fab { right: 1.25rem; bottom: 1.25rem; }
    }
  `]
})
export class ChatbotComponent implements AfterViewChecked, OnInit {
  chatbot = inject(ChatbotService);
  private langService = inject(LanguageService);

  isOpen = signal(false);
  isTyping = signal(false);
  isListening = signal(false);
  messages = signal<ChatMessage[]>([]);
  userInput = '';
  apiKeyInput = '';
  isSavingKey = false;
  ttsEnabled = signal(true); // Voice output built-in toggle

  private recognition: any = null;
  private voiceTimer: any = null;

  quickChips = ['📚 Library stats', '📖 What am I reading?', '💡 Recommend something', '⏰ Overdue loans'];

  @ViewChild('messageContainer') private msgContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('inputEl') private inputEl!: ElementRef<HTMLInputElement>;

  private shouldScroll = false;

  ngOnInit() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        // Prefer final, but fallback to interim to show typed text in real time
        if (finalTranscript || interimTranscript) {
          this.userInput = finalTranscript || interimTranscript;
        }
      };

      this.recognition.onend = () => {
        this.isListening.set(false);
        // Auto-send after a 2-second gap when the user stops speaking
        if (this.userInput.trim() && !this.isTyping()) {
          this.voiceTimer = setTimeout(() => {
            if (this.userInput.trim() && !this.isTyping()) {
              this.sendMessage();
            }
          }, 2000);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        this.isListening.set(false);
      };
    }
  }

  toggleVoiceInput() {
    if (!this.recognition) {
      alert("Your browser does not support Voice Dictation. Try modern Chrome or Safari.");
      return;
    }

    if (this.isListening()) {
      this.recognition.stop();
      this.isListening.set(false);
      if (this.voiceTimer) clearTimeout(this.voiceTimer);
    } else {
      // Configure language based on current toggle state
      this.recognition.lang = this.langService.isBengali ? 'bn-IN' : 'en-US';
      this.userInput = ''; // clear input before listening
      this.recognition.start();
      this.isListening.set(true);
      setTimeout(() => this.inputEl?.nativeElement.focus(), 50);
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  toggleChat() {
    this.isOpen.update(v => !v);

    // Cancel speech when closing
    if (!this.isOpen() && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (this.isOpen() && this.messages().length === 0) {
      if (this.chatbot.isOfflineMode()) {
        this.pushBotMessage(`📴 **Offline Mode** active. I can instantly answer simple questions about your library like:\n\n_"How many books do I have?"_\n_"What am I reading?"_`);
      } else {
        this.pushBotMessage(`Hi! 👋 I'm your **Library Assistant** (Powered by Gemini AI). I can tell you about your books, reading stats, overdue loans, and give you recommendations.\n\nTry asking: _"What am I reading?"_ or _"Recommend something"_`);
      }
    }
    if (this.isOpen()) {
      setTimeout(() => this.inputEl?.nativeElement.focus(), 300);
    }
  }

  clearHistory() {
    this.messages.set([]);
    this.isTyping.set(false);

    if (confirm('Do you also want to remove your Gemini API Key from this browser?')) {
      this.chatbot.removeApiKey();
    }

    if (this.chatbot.hasApiKey || this.chatbot.isOfflineMode()) {
      if (this.chatbot.isOfflineMode()) {
        this.pushBotMessage(`📴 **Offline Mode** active. I can instantly answer simple questions about your library like:\n\n_"How many books do I have?"_\n_"What am I reading?"_`);
      } else {
        this.pushBotMessage(`Hi! 👋 I'm your **Library Assistant** (Powered by Gemini AI). I can tell you about your books, reading stats, overdue loans, and give you recommendations.\n\nTry asking: _"What am I reading?"_ or _"Recommend something"_`);
      }
      setTimeout(() => this.inputEl?.nativeElement.focus(), 50);
    }
  }

  toggleMode() {
    this.chatbot.isOfflineMode.set(!this.chatbot.isOfflineMode());
    this.messages.set([]);
    this.isTyping.set(false);

    if (this.chatbot.isOfflineMode()) {
      this.pushBotMessage(`📴 **Offline Mode** activated. I can answer simple rule-based questions about your library right now without an API key.\n\nTry asking: _"How many books do I have?"_`);
    } else {
      if (this.chatbot.hasApiKey) {
        this.pushBotMessage(`🤖 **AI Mode** activated. I'm connected to Google Gemini!\n\nTry asking: _"Recommend a fiction book"_`);
      }
    }
    setTimeout(() => this.inputEl?.nativeElement.focus(), 50);
  }

  saveApiKey() {
    const key = this.apiKeyInput.trim();
    if (!key) return;
    this.isSavingKey = true;
    setTimeout(() => {
      this.chatbot.setApiKey(key);
      this.isSavingKey = false;
      this.toggleChat(); // Close and reopen to trigger welcome message
      setTimeout(() => this.toggleChat(), 100);
    }, 500);
  }

  sendChip(chip: string) {
    // Strip emoji prefix for the actual query
    const text = chip.replace(/^[^\s]+\s/, '');
    this.userInput = text;
    this.sendMessage();
  }

  sendMessage() {
    if (this.isListening()) {
      this.recognition?.stop();
    }
    if (this.voiceTimer) {
      clearTimeout(this.voiceTimer);
    }

    const text = this.userInput.trim();
    if (!text || this.isTyping()) return;

    this.pushUserMessage(text);
    this.userInput = '';
    this.isTyping.set(true);
    this.shouldScroll = true;

    this.chatbot.getReply(text, this.messages()).then(reply => {
      this.isTyping.set(false);
      this.pushBotMessage(reply);
    });
  }

  private pushUserMessage(text: string) {
    this.messages.update(msgs => [...msgs, { role: 'user', text, timestamp: new Date() }]);
    this.shouldScroll = true;
  }

  private pushBotMessage(text: string) {
    this.messages.update(msgs => [...msgs, { role: 'bot', text, timestamp: new Date() }]);
    this.shouldScroll = true;
    this.speakResponse(text);
  }

  toggleTTS() {
    this.ttsEnabled.update(v => !v);
    if (!this.ttsEnabled() && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Stop talking if muted while speaking
    }
  }

  private speakResponse(text: string) {
    if (!this.ttsEnabled() || !window.speechSynthesis) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Quick sanitize to remove markdown (bold, italic, bullets, emojis) for nicer voice output
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/_/g, '')
      .replace(/#+\s/g, '')
      .replace(/-\s/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // remove markdown links, keep text
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = this.langService.isBengali ? 'bn-IN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  }

  private scrollToBottom() {
    try {
      const el = this.msgContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch { /* ignore */ }
  }

  /** Convert **bold** and _italic_ markdown to HTML for display */
  formatText(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.+?)_/g, '<em>$1</em>');
  }
}
