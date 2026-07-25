'use client';

import { useEffect, useState } from 'react';

/** Breve apertura de marca, sin audio ni recursos de terceros. */
export default function IntroLoader() {
  const [exiting, setExiting] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setExiting(true), 950);
    const removeTimer = window.setTimeout(() => setRemoved(true), 1280);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (removed) return null;

  return (
    <div
      className={`vault-loader ${exiting ? 'vault-loader--exit' : ''}`}
      role="status"
      aria-label="Cargando Vertyx Vault"
    >
      <div className="vault-loader__core" aria-hidden="true">
        <span className="vault-loader__wordmark vault-wordmark">
          <strong>VERTYX</strong><span>+</span>
        </span>
      </div>
    </div>
  );
}
