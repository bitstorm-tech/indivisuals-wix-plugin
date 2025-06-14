import { useEffect, useRef } from 'react';

interface SoundEffects {
  playSelect: () => void;
  playUpload: () => void;
  playMagic: () => void;
  playComplete: () => void;
}

export function useWizardSounds(): SoundEffects {
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();

    return () => {
      audioContext.current?.close();
    };
  }, []);

  const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!audioContext.current) return;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration);

    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + duration);
  };

  const playSelect = () => {
    playTone(523.25, 0.1); // C5
    setTimeout(() => playTone(659.25, 0.1), 50); // E5
    setTimeout(() => playTone(783.99, 0.15), 100); // G5
  };

  const playUpload = () => {
    playTone(440, 0.1); // A4
    setTimeout(() => playTone(554.37, 0.1), 100); // C#5
    setTimeout(() => playTone(659.25, 0.2), 200); // E5
  };

  const playMagic = () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        playTone(440 + i * 100, 0.1, 'triangle');
      }, i * 100);
    }
  };

  const playComplete = () => {
    const notes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5]; // C5 D5 E5 G5 A5 C6
    notes.forEach((note, index) => {
      setTimeout(() => playTone(note, 0.2), index * 100);
    });
  };

  return {
    playSelect,
    playUpload,
    playMagic,
    playComplete,
  };
}
