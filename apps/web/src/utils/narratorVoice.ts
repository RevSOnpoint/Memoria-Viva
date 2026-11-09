export interface NarratorVoiceConfig {
  lang?: string;
  fallback_langs?: string[];
  rate?: number;
  pitch?: number;
  volume?: number;
  engine?: string;
  profile?: string;
  profile_label?: string;
  style?: string;
  preferred_voice_names?: string[];
  persona?: string;
}

export interface VoicePreference {
  voiceURI: string;
  rate: number;
}

export interface SpeakNarratorOptions {
  config?: NarratorVoiceConfig | null;
  preferredVoiceURI?: string;
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

const STORAGE_KEY = 'memoria-viva.voice.preference';

export function loadVoicePreference(): VoicePreference | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return {
      voiceURI: typeof parsed.voiceURI === 'string' ? parsed.voiceURI : '',
      rate:
        typeof parsed.rate === 'number' && Number.isFinite(parsed.rate)
          ? parsed.rate
          : 0
    };
  } catch {
    return null;
  }
}

export function saveVoicePreference(preference: VoicePreference): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preference));
  } catch {
    return;
  }
}

export function getSpanishVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  return window.speechSynthesis
    .getVoices()
    .filter(voice => voice.lang.toLowerCase().startsWith('es'));
}

export function loadSpanishVoices(timeoutMs = 1400): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([]);
  }

  const available = getSpanishVoices();
  if (available.length > 0) return Promise.resolve(available);

  return new Promise(resolve => {
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      window.speechSynthesis.removeEventListener('voiceschanged', finish);
      resolve(getSpanishVoices());
    };

    window.speechSynthesis.addEventListener('voiceschanged', finish);
    window.setTimeout(finish, timeoutMs);
  });
}

function languageScore(voiceLang: string, config?: NarratorVoiceConfig | null): number {
  const lang = (voiceLang || '').toLowerCase();
  const preferred = [
    config?.lang,
    ...(config?.fallback_langs || []),
    'es-cr',
    'es-419',
    'es-us',
    'es-mx',
    'es-es'
  ]
    .filter(Boolean)
    .map(item => String(item).toLowerCase());

  let score = -1;
  preferred.forEach((item, index) => {
    if (lang === item) score = Math.max(score, 100 - index);
  });

  if (score >= 0) return score;
  if (lang.startsWith('es')) return 20;
  return 0;
}

export function pickBestSpanishVoice(
  voices: SpeechSynthesisVoice[],
  config?: NarratorVoiceConfig | null,
  preferredVoiceURI?: string
): SpeechSynthesisVoice | null {
  const spanishVoices = voices.filter(voice => voice.lang.toLowerCase().startsWith('es'));
  if (spanishVoices.length === 0) return null;

  if (preferredVoiceURI) {
    const selected = spanishVoices.find(voice => voice.voiceURI === preferredVoiceURI);
    if (selected) return selected;
  }

  const preferredNames = (config?.preferred_voice_names || []).map(name => name.toLowerCase());

  const ranked = spanishVoices.map(voice => {
    let score = languageScore(voice.lang, config);
    const name = voice.name.toLowerCase();

    preferredNames.forEach((preferredName, index) => {
      if (name.includes(preferredName)) score += 30 - index;
    });

    if (voice.localService) score += 8;
    if (voice.default) score += 4;

    return { voice, score };
  });

  ranked.sort((a, b) => b.score - a.score);
  return ranked[0].voice;
}

export function cleanNarration(text: string): string {
  return text
    .replace(/\[Aporte[^\]]*\]/gi, '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function splitNarration(text: string, maxLength = 220): string[] {
  const cleaned = cleanNarration(text);
  if (!cleaned) return [];
  if (cleaned.length <= maxLength) return [cleaned];

  const sentences = cleaned.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) || [cleaned];
  const chunks: string[] = [];
  let current = '';

  sentences.forEach(sentence => {
    const next = `${current} ${sentence}`.trim();
    if (next.length > maxLength && current) {
      chunks.push(current);
      current = sentence.trim();
    } else {
      current = next;
    }
  });

  if (current) chunks.push(current);
  return chunks;
}

export function speakNarrator(text: string, options: SpeakNarratorOptions = {}): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;

  const synth = window.speechSynthesis;
  synth.cancel();

  const chunks = splitNarration(text);
  if (chunks.length === 0) return false;

  const voices = getSpanishVoices();
  const voice = pickBestSpanishVoice(voices, options.config, options.preferredVoiceURI);
  const rate = options.rate ?? options.config?.rate ?? 0.88;
  const pitch = options.config?.pitch ?? 1;
  const volume = options.config?.volume ?? 0.95;

  chunks.forEach((chunk, index) => {
    const utterance = new SpeechSynthesisUtterance(chunk);

    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || options.config?.lang || 'es-CR';
    utterance.rate = Math.min(1.2, Math.max(0.6, rate));
    utterance.pitch = Math.min(1.4, Math.max(0.6, pitch));
    utterance.volume = Math.min(1, Math.max(0.4, volume));

    if (index === 0) utterance.onstart = () => options.onStart?.();
    utterance.onerror = () => options.onError?.();
    if (index === chunks.length - 1) utterance.onend = () => options.onEnd?.();

    synth.speak(utterance);
  });

  return true;
}

export function cancelNarration(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
