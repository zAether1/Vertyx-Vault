'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

/** Breve apertura de marca, sin audio ni recursos de terceros. */
export default function IntroLoader() {
  const [exiting, setExiting] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setExiting(true), 2250);
    const removeTimer = window.setTimeout(() => setRemoved(true), 2580);
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
      <div className="vault-loader__core vault-loader__core--logo" aria-hidden="true">
        <Image
          src="/vertyx-vault-logo.png"
          alt=""
          width={512}
          height={512}
          priority
          sizes="(max-width: 640px) 19rem, 25rem"
          className="vault-loader__logo"
        />
      </div>
    </div>
  );
}
