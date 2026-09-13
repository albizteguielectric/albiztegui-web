import type { Metadata } from 'next'
import './globals.css'
import Header from '../components/Header'
import Chatbot from '../components/Chatbot'
import Link from 'next/link'

export const metadata: Metadata = {
  title: {
    default: 'Albiztegui Electric | Suministros Eléctricos y Media Tensión',
    template: '%s | Albiztegui Electric',
  },
  description:
    'Catálogo especializado de material eléctrico residencial, comercial e industrial. Placas, iluminación, media tensión, transformadores secos y electrónica.',
  keywords: [
    'Albiztegui Electric',
    'Casa Eléctrica',
    'material eléctrico',
    'media tensión',
    'placas y apagadores',
    'Lucek',
    'Eaton',
    'Leviton',
    'transformadores secos',
    'herrajes CFE',
    'Nuevo Casas Grandes',
  ],
  authors: [{ name: 'Albiztegui Electric' }],
  creator: 'Albiztegui Electric',

  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://albizteguielectric.com',
    siteName: 'Albiztegui Electric',
    title: 'Albiztegui Electric | Catálogo de Suministros Eléctricos',
    description:
      'Explora nuestro catálogo completo de media tensión, herrajes CFE, líneas Lucek/Eaton y soluciones de electrónica.',
    images: [
      {
        url: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/fondo-WEB.jpg',
        width: 1200,
        height: 630,
        alt: 'Albiztegui Electric - Catálogo Especializado',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Albiztegui Electric | Suministros Eléctricos',
    description:
      'Catálogo completo de material eléctrico residencial e industrial.',
    images: [
      'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/fondo-WEB.jpg',
    ],
  },

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 antialiased flex flex-col min-h-screen relative">
        
        {/* Encabezado / Navbar */}
        <Header />

        {/* Contenido Principal */}
        <main className="flex-grow">{children}</main>

        {/* Chatbot flotante web directo */}
        <Chatbot />

        {/* Botón Flotante Múltiple de WhatsApp (Compatible con móvil y web sin JS adicional) */}
        <div className="fixed bottom-24 right-6 z-40">
          <details className="relative group flex flex-col items-end [&_summary::-webkit-details-marker]:hidden">
            
            {/* Opciones de contacto */}
            <div className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2 animate-fadeIn">
              <a 
                href="https://wa.me/526361109087" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-600 hover:scale-105 transition-all whitespace-nowrap text-sm font-bold text-center block"
              >
                Jesús Álvarez
              </a>
              <a 
                href="https://wa.me/526361090873" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-600 hover:scale-105 transition-all whitespace-nowrap text-sm font-bold text-center block"
              >
                Gildardo Bonilla
              </a>
            </div>

            {/* Botón Principal Disparador */}
            <summary 
              className="flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#20ba5a] transition-all hover:scale-110 cursor-pointer border-2 border-white list-none outline-none select-none"
              aria-label="Opciones de WhatsApp"
            >
              <svg 
                className="w-8 h-8 fill-white" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.999 1.597-1.151 4.2 4.305-1.13 1.589 1.001zm9.344-5.247c-.225-.113-1.327-.655-1.533-.73-.205-.075-.354-.112-.504.112-.149.224-.58.73-.711.879-.13.149-.261.168-.486.056-1.53-.765-2.541-1.376-3.508-2.75-.13-.186.145-.173.473-.83.056-.112.028-.21-.014-.298-.042-.089-.504-1.216-.69-1.666-.182-.439-.367-.379-.504-.386-.13-.007-.28-.007-.429-.007-.149 0-.392.056-.597.28-.205.224-.784.767-.784 1.87 0 1.103.803 2.17 0.915 2.32.112.149 1.58 2.413 3.828 3.383 1.523.657 2.103.567 2.477.486.436-.094 1.327-.542 1.513-1.066.186-.523.186-.972.13-.1066-.056-.094-.205-.15-.43-.262z"/>
              </svg>
            </summary>
          </details>
        </div>

        {/* Footer Minimalista Institucional */}
        <footer className="bg-blue-950 text-gray-400 py-6 border-t-4 border-orange-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Derechos reservados */}
            <p className="text-sm font-medium tracking-wide text-center sm:text-left">
              &copy; Albiztegui Electric | 2026
            </p>

            {/* Enlaces Legales */}
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-300">
              <Link 
                href="/privacidad" 
                className="hover:text-orange-400 transition-colors"
              >
                Política de Privacidad
              </Link>
              <span className="text-orange-500">•</span>
              <Link 
                href="/terminos" 
                className="hover:text-orange-400 transition-colors"
              >
                Términos y Condiciones
              </Link>
            </div>

          </div>
        </footer>

      </body>
    </html>
  )
}