/** Pie de página de Vertyx Vault. */
export default function Footer() {
  return (
    <footer className="text-[#eee9f4] pt-4 pb-20 md:pb-12">
      <div className="border-t border-[#b9a9ca]/12 max-w-5xl mx-auto pt-6 md:pt-10 text-center px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/vertyx-vault-logo.png" alt="Vertyx Vault" className="mx-auto h-16 w-auto max-w-44 object-contain opacity-90" />
        <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-[#eee9f4]/50">Esta página no almacena ningún archivo en sus servidores. Todo el contenido es proporcionado por terceros independientes no afiliados a Vertyx Vault.</p>
        <p className="mt-4 text-[.68rem] font-medium uppercase tracking-[.16em] text-[#b9a9ca]/60">© 2026 Vertyx Vault. Todos los derechos reservados.</p>
        <p className="mt-2 text-xs text-[#eee9f4]/45">Built by <a href="https://zaether.netlify.app/" target="_blank" rel="noreferrer" className="font-semibold text-[#c9a8f0] transition-colors hover:text-[#eee9f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a8f0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0b12]">_zAether</a></p>
      </div>
    </footer>
  );
}
