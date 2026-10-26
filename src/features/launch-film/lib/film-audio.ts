"use client";

/**
 * Optional, fully synthesized sound design for the film (Web Audio API).
 * No files, no copyrighted audio, no autoplay: the AudioContext is created
 * only after an explicit user gesture ("Sound" button), and every method is
 * a no-op until then. The visual timeline never depends on audio.
 */
export class FilmAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private enabled = false;

  setEnabled(value: boolean) {
    this.enabled = value;
    if (value) this.ensure();
  }

  isEnabled() {
    return this.enabled;
  }

  /* Must be called from a user gesture (button click). */
  ensure() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  private blip(
    freq: number,
    duration: number,
    gain: number,
    type: OscillatorType
  ) {
    if (!this.enabled || !this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    env.gain.setValueAtTime(gain, now);
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(env).connect(this.master);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  click() {
    this.blip(1568, 0.05, 0.09, "triangle");
  }

  tick() {
    this.blip(880, 0.045, 0.06, "sine");
  }

  pluck() {
    this.blip(392, 0.16, 0.1, "sine");
  }

  /* Low, soft impact — the fragments assembling. */
  impact() {
    if (!this.enabled || !this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 320;
    osc.type = "sine";
    osc.frequency.setValueAtTime(92, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.3);
    env.gain.setValueAtTime(0.4, now);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
    osc.connect(env).connect(lp).connect(this.master);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  /* Warm three-note chord for the final wordmark. */
  chord() {
    if (!this.enabled || !this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1400;
    lp.connect(this.master);
    for (const freq of [220, 277.18, 329.63]) {
      const osc = this.ctx.createOscillator();
      const env = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(0.055, now + 0.35);
      env.gain.setValueAtTime(0.055, now + 0.9);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 1.9);
      osc.connect(env).connect(lp);
      osc.start(now);
      osc.stop(now + 2);
    }
  }

  play(kind: string) {
    switch (kind) {
      case "click":
        this.click();
        break;
      case "tick":
        this.tick();
        break;
      case "pluck":
        this.pluck();
        break;
      case "impact":
        this.impact();
        break;
      case "chord":
        this.chord();
        break;
    }
  }
}
