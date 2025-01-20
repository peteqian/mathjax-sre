declare module 'speech-rule-engine' {
  interface SREOptions {
    locale?: string;
    domain?: 'mathspeak' | 'clearspeak' | 'sre';
    style?: 'default' | 'brief' | 'sbrief';
    speech?: 'deep' | 'shallow';
    json?: string;
    rate?: number;
    markup?: number | string;
  }

  export function setupEngine(options: SREOptions): void;
  export function engineReady(): Promise<void>;
  export function toSpeech(mathml: string): string;
  export function toEnriched(mathml: string): string;
}
