/**
 * Paper Escape - Synthesized Original Soundtrack & Tactile Audio System
 * Powered by Web Audio API (zero external mp3/asset dependencies, fully standalone)
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private musicVolume: number = 0.45;
  private sfxVolume: number = 0.65;
  private isPlaying: boolean = false;
  private currentChapter: number = 1;
  private musicTimer: number | null = null;
  private currentNoteIndex: number = 0;

  // Musical scales (MIDI frequencies)
  private scales = {
    // Chapters 1-3: Warm peaceful felt tones (Cmaj9 / Amin7)
    gentle: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25],
    // Chapters 4-6: Contemplative D Dorian
    contemplative: [293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 587.33, 659.25],
    // Chapters 7-9: Focus & Rhythmic
    focus: [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    // Chapter 10: Rich Resolution
    culmination: [261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 783.99],
    // 101+ Infinite: Dreamlike ambient
    infinite: [220.00, 277.18, 329.63, 369.99, 440.00, 554.37, 659.25]
  };

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolumes(music: number, sfx: number, muted: boolean) {
    this.musicVolume = music;
    this.sfxVolume = sfx;
    this.isMuted = muted;

    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 1;
    }
    if (this.musicGain) {
      this.musicGain.gain.value = music;
    }
    if (this.sfxGain) {
      this.sfxGain.gain.value = sfx;
    }
  }

  public startMusic(chapter: number = 1) {
    this.initContext();
    this.currentChapter = chapter;
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.scheduleNextNote();
  }

  public setChapter(chapter: number) {
    this.currentChapter = chapter;
  }

  public stopMusic() {
    this.isPlaying = false;
    if (this.musicTimer) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private scheduleNextNote() {
    if (!this.isPlaying || !this.ctx || !this.musicGain) return;

    let scale = this.scales.gentle;
    if (this.currentChapter >= 4 && this.currentChapter <= 6) {
      scale = this.scales.contemplative;
    } else if (this.currentChapter >= 7 && this.currentChapter <= 9) {
      scale = this.scales.focus;
    } else if (this.currentChapter === 10) {
      scale = this.scales.culmination;
    } else if (this.currentChapter > 10) {
      scale = this.scales.infinite;
    }

    // Pick note with gentle pseudo-melodic drift
    const note = scale[this.currentNoteIndex % scale.length];
    if (Math.random() > 0.3) {
      this.playFeltNote(note, 2.5);
      // Occasionally play a soft harmonic 5th or octave below
      if (Math.random() > 0.6) {
        this.playFeltNote(note * 0.5, 3.2, 0.4);
      }
    }

    // Step index
    const jumps = [1, -1, 2, -2, 3];
    const jump = jumps[Math.floor(Math.random() * jumps.length)];
    this.currentNoteIndex = Math.max(0, Math.min(scale.length - 1, this.currentNoteIndex + jump));

    // Natural breathing pause between notes: 1.2s to 2.4s
    const delay = 1200 + Math.random() * 1200;
    this.musicTimer = window.setTimeout(() => {
      this.scheduleNextNote();
    }, delay);
  }

  // Synthesize a soft felt-piano / Rhodes-like acoustic timbre
  private playFeltNote(freq: number, duration: number = 2.0, ampScale: number = 1.0) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const noteGain = this.ctx.createGain();

    // Warm triangle + sine blend with lowpass filter
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 1.002, now); // slight detune for warmth

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + duration);

    // Felt piano envelope: quick soft attack, mellow sustain, gentle decay
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.linearRampToValueAtTime(0.08 * ampScale, now + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.musicGain);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + duration + 0.05);
    osc2.stop(now + duration + 0.05);
  }

  // Tactile sound effect: pencil drawing scratch
  public playPencilScratch() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.05; // 50ms scratch
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2400 + Math.random() * 800;
    filter.Q.value = 2.5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  // Tactile sound effect: eraser rubbing
  public playEraserRub() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.6;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.linearRampToValueAtTime(400, now + 0.08);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  // Player jump: light, springy paper jump
  public playJump() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Player land
  public playLand() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Collect key or trigger button
  public playKeyCollect() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.07, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.28);
    });
  }

  // Door opening / unlock sound
  public playDoorOpen() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(260, now + 0.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 450;

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  // Spring / trampoline bounce
  public playSpring() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.18);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Level complete chime
  public playLevelComplete() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.08, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.5);
    });
  }

  // Button click / UI tap
  public playClick() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const sound = new SoundManager();
