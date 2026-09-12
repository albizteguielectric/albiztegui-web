import Link from 'next/link'

export const metadata = {
  title: 'Términos y Condiciones | Albiztegui Electric',
  description: 'Consulta las condiciones de venta, cotizaciones y entregas de Albiztegui Electric.',
}

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-12">
        
        <Link href="/" className="text-orange-500 hover:text-orange-600 font-bold text-sm flex items-center gap-1 mb-6">
          &larr; Volver al Inicio
        </Link>

        <h1 className="text-3xl sm:text-4xl font-black text-blue-900 tracking-tight mb-2">
          Términos y Condiciones
        </h1>
        <p className="text-xs text-gray-400 mb-8 uppercase tracking-wider font-semibold">
          Última actualización: Septiembre 2026
        </p>

        <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-extrabold text-blue-900 mb-2">
              1. Naturaleza del Sitio Web
            </h2>
            <p>
              Este sitio web actúa como catálogo interactivo de productos e infraestructura de Albiztegui Electric. Las imágenes, tablas de especificaciones y fichas técnicas son de carácter informativo para facilitar la selección de materiales eléctricos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-blue-900 mb-2">
              2. Vigencia de Cotizaciones y Precios
            </h2>
            <p className="mb-2">Debido a la volatilidad de materias primas (como cobre, aluminio y acero):</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Los precios y existencias mostrados o cotizados tienen una vigencia estándar de 15 días naturales a partir de su emisión, salvo especificación en la cotización.</li>
              <li>Nos reservamos el derecho de ajustar precios en volúmenes de adquisición previa confirmación con el cliente.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-blue-900 mb-2">
              3. Garantías y Devoluciones
            </h2>
            <p>
              Todos los equipos de Media Tensión, transformadores, aparatos de protección y líneas Lucek/Eaton cuentan con garantía directa de fabricante contra defectos de fabricación. Las devoluciones de material requieren la presentación de la nota o factura original y que el empaque se encuentre en condiciones óptimas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-blue-900 mb-2">
              4. Entregas y Envíos
            </h2>
            <p>
              Las entregas en mostrador se realizan dentro de nuestro horario comercial. Para proyectos de electrificación o entregas a obra, las condiciones de flete y descarga se pactan de manera individual al formalizar el pedido.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Albiztegui Electric / Casa Eléctrica &copy; 2026. Todos los derechos reservados.
          </p>
        </div>

      </div>
    </div>
  )
}