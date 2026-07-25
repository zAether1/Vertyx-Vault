'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Loader de introducción del template original ("Amazon Prime Style Loader").
 * Réplica fiel: glow + logo animado por CSS (template-inline.css), sonido de
 * viento generado con Web Audio API sincronizado con la rotación del logo,
 * intento de reproducción del audio de marca, auto-click y fade-out a los 3.5s.
 */
export default function IntroLoader() {
  const loaderRef = useRef<HTMLDivElement>(null);
  const [removed, setRemoved] = useState(false);
  const audioActivatedRef = useRef(false);

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    function playWindSound() {
      try {
        const AudioContextCtor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const audioContext = new AudioContextCtor();

        // Duración del viento = tiempo de rotación del logo (25% de 3.2s)
        const windDuration = 3.2 * 0.25;
        const bufferSize = audioContext.sampleRate * windDuration;
        const buffer = audioContext.createBuffer(
          1,
          bufferSize,
          audioContext.sampleRate,
        );
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.3;
        }

        const source = audioContext.createBufferSource();
        source.buffer = buffer;

        const lowpass = audioContext.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(800, audioContext.currentTime);
        lowpass.Q.setValueAtTime(0.5, audioContext.currentTime);

        const highpass = audioContext.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.setValueAtTime(100, audioContext.currentTime);
        highpass.Q.setValueAtTime(0.3, audioContext.currentTime);

        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          0.15,
          audioContext.currentTime + 0.1,
        );
        gainNode.gain.linearRampToValueAtTime(
          0.15,
          audioContext.currentTime + windDuration * 0.7,
        );
        gainNode.gain.linearRampToValueAtTime(
          0,
          audioContext.currentTime + windDuration,
        );

        source.connect(highpass);
        highpass.connect(lowpass);
        lowpass.connect(gainNode);
        gainNode.connect(audioContext.destination);

        source.start(audioContext.currentTime);
        source.stop(audioContext.currentTime + windDuration);

        setTimeout(() => {
          void audioContext.close();
        }, (windDuration + 0.5) * 1000);
      } catch {
        // Fallback silencioso si Web Audio API no está disponible
      }
    }

    function playCustomAudio() {
      if (audioActivatedRef.current) return;
      audioActivatedRef.current = true;

      try {
        const audio = new Audio();
        audio.volume = 0.8;
        audio.preload = 'auto';

        const audioFormats = [
          'https://cinehax.com/wp-content/themes/cinehax/assets/audio/cinehax_sound.ogg',
          'https://cinehax.com/wp-content/themes/cinehax/assets/audio/cinehax_sound.webm',
          'https://cinehax.com/wp-content/themes/cinehax/assets/audio/cinehax_sound.wav',
          'https://cinehax.com/wp-content/themes/cinehax/assets/audio/cinehax_sound.mp3',
        ];
        let currentFormatIndex = 0;

        function tryNextFormat() {
          if (currentFormatIndex >= audioFormats.length) {
            audioActivatedRef.current = false;
            return;
          }
          audio.src = audioFormats[currentFormatIndex];
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                // Fade out del audio
                setTimeout(() => {
                  if (audio.volume > 0) {
                    const fadeOut = setInterval(() => {
                      if (audio.volume > 0.1) {
                        audio.volume = Math.max(0, audio.volume - 0.1);
                      } else {
                        audio.volume = 0;
                        audio.pause();
                        clearInterval(fadeOut);
                      }
                    }, 100);
                  }
                }, 2800);
              })
              .catch(() => {
                currentFormatIndex++;
                tryNextFormat();
              });
          }
        }

        audio.addEventListener('error', () => {
          currentFormatIndex++;
          tryNextFormat();
        });

        tryNextFormat();
      } catch {
        audioActivatedRef.current = false;
      }
    }

    function handleLoaderClick(event: Event) {
      if (loader && loader.contains(event.target as Node)) {
        event.stopPropagation();
        playCustomAudio();
        setTimeout(() => {
          playWindSound();
        }, 200);
        const hint = loader.querySelector<HTMLElement>('.audio-hint');
        if (hint) {
          hint.style.opacity = '0';
          setTimeout(() => hint.remove(), 300);
        }
      }
    }

    loader.addEventListener('click', handleLoaderClick);
    loader.addEventListener('touchstart', handleLoaderClick, { passive: true });
    loader.addEventListener('mousedown', handleLoaderClick);

    // Auto-clicks del original
    const t1 = setTimeout(() => loader.click(), 100);
    const t2 = setTimeout(() => {
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        button: 0,
        clientX: loader.offsetWidth / 2,
        clientY: loader.offsetHeight / 2,
      });
      loader.dispatchEvent(clickEvent);
    }, 300);

    // Fade-out a los 3.5s y remoción a los 600ms
    const t3 = setTimeout(() => {
      loader.classList.add('fade-out');
      setTimeout(() => setRemoved(true), 600);
    }, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      loader.removeEventListener('click', handleLoaderClick);
      loader.removeEventListener('touchstart', handleLoaderClick);
      loader.removeEventListener('mousedown', handleLoaderClick);
    };
  }, []);

  if (removed) return null;

  return (
    <div className="prime-loader" id="primeLoader" ref={loaderRef} style={{ cursor: 'pointer' }}>
      <div className="logo-container" style={{ cursor: 'pointer' }}>
        {/* Subtle Glow Effect */}
        <div className="glow-effect"></div>

        {/* Main Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo_oficial.svg"
          alt="CineHax"
          className="main-logo"
          style={{
            cursor: 'pointer',
            background: 'none',
            backgroundColor: 'transparent',
          }}
        />

        {/* Fade Overlay */}
        <div className="fade-overlay"></div>
      </div>
    </div>
  );
}
