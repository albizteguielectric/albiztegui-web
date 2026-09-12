import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-md w-full text-center bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-200">
        
        {/* Número 404 */}
        <div className="inline-block bg-orange-100 text-orange-600 font-black text-6xl px-6 py-3 rounded-2xl mb-6">
          404
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 tracking-tight mb-2">
          Página No Encontrada
        </h1>
        
        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          La ruta que intentas visitar no existe o fue movida dentro del catálogo.
        </p>

        {/* Botones de navegación */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="w-full sm:w-auto bg-blue-900 hover:bg-blue-950 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm shadow-md"
          >
            Ir al Inicio
          </Link>
          <Link
            href="/contacto"
            className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-blue-900 font-bold px-6 py-3 rounded-xl transition-all text-sm"
          >
            Contactar Asesor
          </Link>
        </div>

      </div>
    </div>
  )
}