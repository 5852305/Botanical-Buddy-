export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface AnalysisResult {
  plantName: string;
  scientificName?: string;
  careInstructions: string;
  confidence: string;
}

export enum AppMode {
  CHAT = 'CHAT',
  ANALYZE = 'ANALYZE',
  GARDEN = 'GARDEN'
}

export interface PlantLog {
  id: string;
  date: string; // ISO string for storage stability
  type: 'water' | 'fertilize' | 'note';
  content?: string;
}

export interface PlantReminder {
  enabled: boolean;
  frequencyDays: number;
  lastWateredDate?: string; // ISO string
  reminderTime: string; // "09:00"
}

export interface GardenPlant {
  id: string;
  name: string;
  nickname?: string;
  image?: string; // base64
  addedDate: string; // ISO string
  careInfo: string; // Markdown
  logs: PlantLog[];
  reminder: PlantReminder;
}
