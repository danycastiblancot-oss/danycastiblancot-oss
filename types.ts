
export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface Verse {
  number: number;
  text: string;
}

export interface ChapterMetadata {
  book_name: string;
  chapter_number: number;
  author: string;
  estimated_date: string;
  target_audience: string;
  historical_setting: string;
  theological_theme: string;
  reading_guidance: string; 
  detailed_explanation: string;
  key_quotes?: string[];
  purpose: string;
  category_group: string;
  speaker_voice: string;
  chronological_order: string;
}

export interface ChapterResponse {
  metadata: ChapterMetadata;
  verses: Verse[];
}

export interface BibleBook {
  name: string;
  chapters: number;
  category: 'law' | 'history' | 'poetry' | 'prophets_major' | 'prophets_minor' | 'gospels' | 'church_history' | 'letters' | 'prophecy';
}

export interface ReadingPlanItem {
  order: number;
  book: string;
  chapters: number[];
  reason: string;
}

export interface SearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  relevance: string; 
}

export interface MoodResult {
  verseReference: string;
  text: string;
  explanation: string;
}

export interface DailyDevotional {
  verseReference: string;
  verseText: string;
  reflection: string;
  prayer: string;
  application: string;
}

export interface Highlight {
  id: string;
  start: number;
  end: number;
  color: string;
  text: string;
}

export interface ReadingGoal {
  id: string;
  label: string;
  days: number;
  chaptersPerDay: number;
  description: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface UserStats {
  points: number;
  streak: number;
  completedDays: string[]; // ISO Dates
  rank: string;
  unlockedBadges: string[]; // Badge IDs
  currentPlanId?: string;
  xpToNextLevel: number;
}

export interface ReadingProgress {
  userId: string;
  book: string;
  chapter: number;
  completedAt: any; // Firestore Timestamp
}

export interface SavedNote {
  id?: string;
  userId: string;
  reference: string;
  title?: string;
  text?: string;
  content: string;
  category?: 'devocional' | 'estudio' | 'teologia' | 'oracion' | 'general';
  color?: string;
  tags?: string[];
  createdAt: any; // Firestore Timestamp or ISO string
  updatedAt?: any;
}

export interface GitHubIntegrationState {
  connected: boolean;
  username?: string;
  avatarUrl?: string;
  token?: string;
  repo?: string;
  lastSync?: string;
  gistUrl?: string;
}

// Interface for Quiz Questions used in StudyLesson
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

// Interface for AI-generated Bible study lessons
export interface StudyLesson {
  topic: string;
  title: string;
  content: string;
  keyVerses: string[];
  quiz: QuizQuestion[];
}

// Interface for cross-references in Bible study
export interface CrossReference {
  verse: string;
  text: string;
}

export interface CharacterBiography {
  name: string;
  role: string;
  period: string;
  key_events: string[];
  significance: string;
  detailed_bio: string;
  related_verses: string[];
}

// Interfaces for Deep Exegesis and AI Theology
export interface OriginalLanguageWord {
  originalWord: string; // Hebrew or Greek script
  transliteration: string;
  strongsNumber: string;
  meaning: string;
  theologicalContext: string;
}

export interface ExegeticalDeepDive {
  passage: string;
  historicalContext: string;
  originalLanguageInsights: OriginalLanguageWord[];
  christocentricConnection: string;
  theologicalDoctrines: string[];
  practicalApplication: string[];
}

export interface HomileticalOutlinePoint {
  romanNumeral: string;
  title: string;
  biblicalSupport: string;
  explanation: string;
  illustration: string;
}

export interface HomileticalOutline {
  theme: string;
  mainText: string;
  title: string;
  centralProposition: string;
  introduction: string;
  points: HomileticalOutlinePoint[];
  conclusion: string;
  closingPrayer: string;
}

export interface DiagramNode {
  id: string;
  label: string;
  description: string;
  scriptureReference: string;
  category: string;
  color?: string;
}

export interface DiagramConnection {
  fromId: string;
  toId: string;
  relationshipLabel: string;
}

export interface TheologicalDiagram {
  title: string;
  description: string;
  centralTheme: string;
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  summaryConclusion: string;
}
