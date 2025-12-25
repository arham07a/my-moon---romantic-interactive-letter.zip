
export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  duration: string;
  spotifyUrl?: string;
}

export interface MemoryCard {
  id: string;
  frontText: string;
  backText: string;
  imageUrl: string;
}

export interface AppContent {
  senderName: string;
  recipientName: string;
  accentColor: string; // New field for customizable color
  welcomeTitle: string;
  welcomeSubtitle: string;
  letterTitle: string;
  letterContent: string;
  playlistTitle: string;
  songs: Song[];
  cardsTitle: string;
  memoryCards: MemoryCard[];
  finalTitle: string;
  finalContent: string;
  closingNote: string;
  quizConfig?: QuizConfig;
}

export enum AppStage {
  WELCOME = 'WELCOME',
  LETTER = 'LETTER',
  PLAYLIST = 'PLAYLIST',
  PUZZLE = 'PUZZLE',
  QUIZ = 'QUIZ',
  CARDS = 'CARDS',
  FINAL = 'FINAL',
  SEALED = 'SEALED'
}

export type Theme = 'light' | 'dark';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

export interface PuzzleConfig {
  gridSize: 3 | 4 | 5;
  image: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export interface QuizConfig {
  title: string;
  questions: QuizQuestion[];
  successMessage: string;
}
