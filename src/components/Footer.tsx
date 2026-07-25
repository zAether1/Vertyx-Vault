/** Pie de página de Vertyx Vault. */
export default function Footer() {
  return (
    <footer className="text-[#eee9f4] pt-4 pb-20 md:pb-12">
      <div className="border-t border-[#b9a9ca]/12 max-w-5xl mx-auto pt-6 md:pt-10 text-center px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Vertyx-Vault-2.png" alt="Vertyx Vault" className="mx-auto h-16 w-auto max-w-44 object-contain opacity-90" />
        <p className="text-[#eee9f4]/45 text-xs mt-2">Descubre, organiza y vuelve a tus historias favoritas.</p>
      </div>
    </footer>
  );
}
