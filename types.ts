
export interface Zekr {
  id: string;
  name: string;
  currentCount: number;
  lifetime: number;
  target: number;
  isFixed: boolean;
}

export type Screen = 'HOME' | 'COUNTER';

export interface AppState {
  azkar: Zekr[];
  activeZekrId: string | null;
  isDarkMode: boolean;
}
