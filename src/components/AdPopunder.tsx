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
        
        // Configuración para que puedas probarlo AHORA: Cooldown de 0 minutos y 100% de probabilidad
        const COOLDOWN_MS = 0; 
        
        if (!lastPop || now - parseInt(lastPop) > COOLDOWN_MS) {
          // 100% de probabilidad temporalmente para que lo veas funcionar
          if (Math.random() < 1.0) {
            localStorage.setItem('vertyx_last_popunder', now.toString());
            
            // Enlace inteligente (SmartLink/Direct Link) de Adsterra
            const adUrl = 'https://www.effectivecpmnetwork.com/cpg0kewf1j?key=fdc3c2c8de84e6d47f73f305e7c41caf'; 
            
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
