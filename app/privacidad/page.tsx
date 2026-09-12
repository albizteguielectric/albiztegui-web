import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidad | Albiztegui Electric',
  description: 'Conoce cómo protegemos y gestionamos tus datos personales en Albiztegui Electric.',
}

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-12">
        
        <Link href="/" className="text-orange-500 hover:text-orange-600 font-bold text-sm flex items-center gap-1 mb-6">
          &larr; Volver al Inicio
        </Link>

        <h1 className="text-3xl sm:text-4xl font-black text-blue-900 tracking-tight mb-2">
          Política de Privacidad
        </h1>
        <p className="text-xs text-gray-400 mb-8 uppercase tracking-wider font-semibold">
          Última actualización: Septiembre 2026
        </p>

        <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-extrabold text-blue-900 mb-2">
              1. Identidad y Responsable del Tratamiento
            </h2>
            <p>
              Albiztegui Electric (Casa Eléctrica), con domicilio en Nuevo Casas Grandes, Chihuahua, es responsable del tratamiento y protección de sus datos personales. Esta política describe cómo recopilamos, usamos y resguardamos la información enviada a través de nuestros formularios y canales directos de atención como WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-blue-900 mb-2">
              2. Datos Personales que Recopilamos
            </h2>
            <p className="mb-2">Recopilamos únicamente la información necesaria para procesar cotizaciones y consultas comerciales:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nombre completo y/o razón social.</li>
              <li>Número de teléfono o contacto de WhatsApp.</li>
              <li>Correo electrónico.</li>
              <li>Dirección de entrega o datos de facturación (en caso de requerirlo).</li>
              <li>Especificaciones del proyecto o lista de materiales solicitados.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-blue-900 mb-2">
              3. Finalidad del Uso de los Datos
            </h2>
            <p className="mb-2">Sus datos son utilizados exclusivamente para las siguientes finalidades primarias:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Elaboración y envío de cotizaciones personalizadas de equipo y material eléctrico.</li>
              <li>Atención a dudas técnicas sobre productos de Media Tensión, Electrónica y Placas.</li>
              <li>Coordinación de entregas y seguimiento de pedidos.</li>
              <li>Emisión de facturas fiscales.</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              *No vendemos, rentamos ni compartimos sus datos personales con terceros con fines publicitarios.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-blue-900 mb-2">
              4. Canales de Atención Directa (WhatsApp)
            </h2>
            <p>
              Al hacer clic en nuestros enlaces de contacto de WhatsApp, la interacción se rige bajo los términos de privacidad de Meta Platforms, Inc. Las listas de productos solicitadas a través de este medio se almacenan en nuestras herramientas de atención para dar continuidad a sus proyectos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-blue-900 mb-2">
              5. Derechos ARCO y Contacto
            </h2>
            <p>
              Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales en cualquier momento. Para ejercer estos derechos, puede comunicarse directamente a nuestro correo electrónico de atención a clientes o acudir a nuestras instalaciones.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            ¿Tienes dudas sobre el manejo de tus datos? <Link href="/contacto" className="text-orange-500 font-bold hover:underline">Contáctanos aquí</Link>
          </p>
        </div>

      </div>
    </div>
  )
}