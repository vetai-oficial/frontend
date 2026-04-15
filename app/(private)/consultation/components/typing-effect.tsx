'use client';

import { useEffect, useState } from 'react';

interface TypingEffectProps {
  text: string;
  onComplete?: () => void;
  onTick?: () => void;
}

export function TypingEffect({ text, onComplete, onTick }: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
        onTick?.();
      }, 20);
      return () => clearTimeout(timeout);
    } else if (onComplete && currentIndex === text.length) {
      onComplete();
    }
  }, [currentIndex, text, onComplete, onTick]);

  return <p className="text-sm whitespace-pre-wrap">{displayedText}</p>;
}
