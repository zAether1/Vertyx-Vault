'use client';

import Link from 'next/link';
import { SearchIcon } from '@/components/icons';
import { MOBILE_SUGGESTIONS } from '@/data/navigation';

export default function SearchCta() {
  return (
    <section className="vault-search-cta">
      <div className="vault-search-cta__content">
        <span className="vault-search-cta__eyebrow">
          <SearchIcon className="text-[#c9a8f0]" />
          Buscar en todo Vertyx Vault
        </span>
        <h2 className="vault-search-cta__title">Encuentra tu próxima película o serie al instante</h2>
        <p className="vault-search-cta__description">
          Explora el catálogo completo con una búsqueda rápida, filtrada y optimizada para una experiencia fluida en todos tus dispositivos.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {MOBILE_SUGGESTIONS.slice(0, 4).map((suggestion) => (
            <Link
              key={suggestion.title}
              href={`/explore?q=${encodeURIComponent(suggestion.title)}`}
              className="vault-filter inline-flex items-center justify-center"
              aria-label={`Buscar ${suggestion.title}`}
            >
              {suggestion.title}
            </Link>
          ))}
        </div>
        <div className="vault-search-cta__actions">
          <Link href="/explore" className="vault-action">
            Ir al catálogo
          </Link>
          <span className="vault-search-cta__hint">Consejo: prueba con títulos, géneros o etiquetas.</span>
        </div>
      </div>
      <div className="vault-search-cta__art" aria-hidden="true">
        <div className="vault-search-cta__badge">🔎</div>
      </div>
    </section>
  );
}
