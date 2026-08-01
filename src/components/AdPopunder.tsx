'use client';

import { useEffect } from 'react';

export default function AdPopunder() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Find if an anchor tag (link) or a button was clicked
      const target = e.target as HTMLElement;
      const clickable = target.closest('a, button, .vault-title-card');
      
      if (clickable) {
        // Obtenemos el tiempo del último popunder mostrado
        const lastPop = localStorage.getItem('vertyx_last_popunder');
        const now = Date.now();
        
        // Configuración: Cooldown de 30 minutos (1800000 ms) para que no sea molesto
        const COOLDOWN_MS = 1800000; 
        
        if (!lastPop || now - parseInt(lastPop) > COOLDOWN_MS) {
          // 25% de probabilidad de que se abra el anuncio, para que no sea intrusivo
          if (Math.random() < 0.25) {
            localStorage.setItem('vertyx_last_popunder', now.toString());
            
            // TODO: Reemplaza esta URL con el enlace de tu red de anuncios (CPA, PopAds, etc.)
            const adUrl = 'https://example.com/tu-anuncio-aqui'; 
            
            // Abre el anuncio en una nueva pestaña
            window.open(adUrl, '_blank');
          }
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}
