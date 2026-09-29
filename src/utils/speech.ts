export class AudioEngine {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static voices: SpeechSynthesisVoice[] = [];
  private static isInitialized = false;

  private static initVoices() {
    if (!this.synth || this.isInitialized) return;
    this.voices = this.synth.getVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        if (this.synth) {
          this.voices = this.synth.getVoices();
        }
      };
    }
    this.isInitialized = true;
  }

  static speak(
    text: string,
    options: {
      rate?: number;
      lang?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    } = {}
  ): void {
    if (!this.synth) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      options.onError?.();
      return;
    }

    this.initVoices();
    this.synth.cancel(); // Stop any currently playing audio

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 0.95;
    utterance.pitch = 1.0;

    // Pick best English voice
    const targetLang = options.lang || 'en-US';
    utterance.lang = targetLang;

    if (this.voices.length > 0) {
      const preferred = this.voices.find(
        (v) => (v.lang === targetLang || v.lang.startsWith('en')) && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Premium'))
      ) || this.voices.find((v) => v.lang.startsWith('en'));

      if (preferred) {
        utterance.voice = preferred;
      }
    }

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      options.onEnd?.();
    };

    utterance.onerror = () => {
      options.onError?.();
    };

    this.synth.speak(utterance);
  }

  static stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  static isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}
