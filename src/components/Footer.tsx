/** Footer del template original. */
export default function Footer() {
  return (
    <footer
      className="text-white pt-0 pb-12 md:pb-12 transition-colors duration-500"
      style={{ backgroundColor: 'rgb(0, 8, 20)' }}
    >
      <div className="border-t border-white/10 max-w-5xl mx-auto pt-6 md:pt-10 text-center">
        <p className="text-gray-400 text-xs md:text-sm">
          © 2020 - 2026 CINE HAX. Reservados todos los derechos.
        </p>
        <p className="text-gray-500 text-xs mt-1 md:mt-2 mb-16 md:mb-0">
          Este sitio no almacena ningún archivo en su servidor. Todo el contenido
          es proporcionado por terceros no afiliados.
        </p>
      </div>
    </footer>
  );
}
