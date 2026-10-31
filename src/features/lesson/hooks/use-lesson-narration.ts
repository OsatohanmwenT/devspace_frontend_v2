"use client";

import { useCallback, useEffect, useEffectEvent, useState, useSyncExternalStore } from "react";
import type { ArticleContent } from "~/types/lesson";
import {
  articleToSpeech,
  articleToSpeechPersonality,
  readAutoPlay,
  readPersonality,
  readRate,
  readVoiceName,
  saveAutoPlay,
  savePersonality,
  saveRate,
  saveVoiceName,
  speechSupported,
} from "../lib/narration";

// The browser loads its voices late and may change them, so they are read
// through a store rather than once.
const NO_VOICES: SpeechSynthesisVoice[] = [];
let cachedVoices = NO_VOICES;

function subscribeVoices(onChange: () => void) {
  if (!speechSupported()) return () => undefined;
  window.speechSynthesis.addEventListener("voiceschanged", onChange);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", onChange);
}

function voicesSnapshot() {
  if (!speechSupported()) return NO_VOICES;
  const english = window.speechSynthesis.getVoices().filter((voice) => voice.lang.startsWith("en"));
  if (english.length !== cachedVoices.length || english.some((voice, index) => voice !== cachedVoices[index])) cachedVoices = english;
  return cachedVoices;
}

const useVoices = () => useSyncExternalStore(subscribeVoices, voicesSnapshot, () => NO_VOICES);

// On/off state for Devy's commentary, owned by the lesson screen so the
// narration and the spoken quiz lines agree on it.
export function useNarrationPersonality() {
  const [personality, setPersonality] = useState(readPersonality);
  const change = useCallback((next: boolean) => {
    setPersonality(next);
    savePersonality(next);
  }, []);
  return { personality, changePersonality: change };
}

type Options = { personality: boolean; onStart: () => void; onEnd: () => void };

// Wraps speech synthesis for one article: play and stop, a saved speed and
// voice, and an "Audio" mode that narrates each article as it opens, which
// together make a hands-free way through the lesson.
export function useLessonNarration(article: ArticleContent, { personality, onStart, onEnd }: Options) {
  const supported = speechSupported();
  const voices = useVoices();
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(readRate);
  const [voiceName, setVoiceName] = useState(readVoiceName);
  const [autoPlay, setAutoPlay] = useState(readAutoPlay);
  const activeVoice = voices.find((voice) => voice.name === voiceName) ?? voices.find((voice) => voice.default) ?? voices[0];

  const speak = (nextRate: number, voice: SpeechSynthesisVoice | undefined) => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    onStart();
    const utterance = new SpeechSynthesisUtterance(personality ? articleToSpeechPersonality(article) : articleToSpeech(article));
    utterance.rate = nextRate;
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      setSpeaking(false);
      onEnd();
    };
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const stop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  // Moving to another step stops the one being left, then, in Audio mode,
  // starts reading the new one.
  const autoStart = useEffectEvent(() => {
    if (autoPlay) speak(rate, activeVoice);
  });
  useEffect(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const timer = window.setTimeout(autoStart, 0);
    return () => {
      window.clearTimeout(timer);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  return {
    supported,
    speaking,
    voices,
    rate,
    activeVoice,
    autoPlay,
    toggle: () => (speaking ? stop() : speak(rate, activeVoice)),
    changeRate: (next: number) => {
      setRate(next);
      saveRate(next);
      if (speaking) speak(next, activeVoice);
    },
    changeVoice: (name: string) => {
      setVoiceName(name);
      saveVoiceName(name);
      if (speaking) speak(rate, voices.find((voice) => voice.name === name));
    },
    changeAutoPlay: (next: boolean) => {
      setAutoPlay(next);
      saveAutoPlay(next);
      if (next && !speaking) speak(rate, activeVoice);
      if (!next && speaking) stop();
    },
  };
}
