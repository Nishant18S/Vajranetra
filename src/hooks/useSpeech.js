import { useCallback, useEffect, useRef, useState } from 'react';

const MUTE_KEY = 'vn:speech-muted';

export function useSpeech() {
  const [supported, setSupported] = useState(false);
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const utteranceRef = useRef(null);

  useEffect(() => {
    setSupported(
      typeof window !== 'undefined' && 'speechSynthesis' in window
    );
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    } catch {}
  }, [muted]);

  const speak = useCallback(
    (text) => {
      if (!supported || muted || !text) return;
      try {
        window.speechSynthesis.cancel();
        const u = new window.SpeechSynthesisUtterance(text);
        u.rate = 0.95;
        u.pitch = 1.0;
        u.volume = 1.0;
        u.lang = 'en-IN';

        // Prefer an Indian English voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferred =
          voices.find((v) => v.lang === 'en-IN') ||
          voices.find((v) => v.lang === 'en-GB') ||
          voices.find((v) => v.lang === 'en-US');
        if (preferred) u.voice = preferred;

        utteranceRef.current = u;
        window.speechSynthesis.speak(u);
      } catch {
        // Silent — speech is a nice-to-have, never a blocker
      }
    },
    [supported, muted]
  );

  const stop = useCallback(() => {
    if (!supported) return;
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }, [supported]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      if (next) stop();
      return next;
    });
  }, [stop]);

  return { supported, muted, speak, stop, toggleMute };
}