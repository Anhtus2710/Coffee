import { useCallback, useRef } from 'react';

export function useNotificationSound() {
  const audioRef = useRef(null);

  const play = useCallback(() => {
    try {
      // Web Audio API — tạo tiếng "ting" nhẹ
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
      oscillator.frequency.setValueAtTime(1108, ctx.currentTime + 0.08); // C#6

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);

      audioRef.current = ctx;
    } catch (e) {
      // Audio not supported
    }
  }, []);

  return { play };
}
