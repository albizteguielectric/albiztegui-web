'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// 1. Datos para la Guía Técnica de Iluminación
const tiposIluminacion = [
  {
    id: 'focos-led-std',
    nombre: 'Focos LED y Específicos',
    uso: 'Reemplazo directo de focos incandescencias en sockets tradicionales E26/E27 para ahorro energético.',
    norma: 'Tecnología LED Omnidireccional, alta eficiencia lumínica y temperatura ajustable (Cálida 3000K / Fría 6500K).',
    medidas: [
      { modelo: 'Focos LED Estándar (1W a 100W)', temperatura: 'Luz Cálida (3000K) / Luz Fría (6500K)', usoComun: 'Iluminación general en habitaciones y oficinas' },
      { modelo: 'Focos Decorativos / Vintage / Vela', temperatura: 'Cálida Ámbar / Filamento LED', usoComun: 'Lámparas decorativas, candiles y restaurantes' },
      { modelo: 'Focos Específicos (Refrigerador / Colores)', temperatura: 'Incandescente / Colores 40W', usoComun: 'Electrodomésticos y decoración festiva' }
    ]
  },
  {
    id: 'spots-empotrables',
    nombre: 'Spots y Iluminación Acentuada',
    uso: 'Embebidos o sobrepuestos en plafón, falso techo o losa para dirección de luz puntual o ambiental.',
    norma: 'Driver integrado de alto factor de potencia y compatibilidad con atenuadores (Dimeables).',
    medidas: [
      { modelo: 'Spots Empotrables (3W a 24W)', temperatura: 'Redondos / Cuadrados', usoComun: 'Plafón de tablaroca en pasillos y salas' },
      { modelo: 'Spots de Sobreponer (3W a 24W)', temperatura: 'Redondos / Cuadrados', usoComun: 'Losa directa sin necesidad de perforar' },
      { modelo: 'Bases y Canopeas para MR16 / GU10', temperatura: 'Dimeables / Sockets dirigibles', usoComun: 'Acentuación en cuadros, nichos y aparadores' }
    ]
  },
  {
    id: 'reflectores-exterior',
    nombre: 'Reflectores y Alumbrado Solar',
    uso: 'Iluminación de grandes áreas, fachadas, patios, banquetas y vialidades.',
    norma: 'Protección IP65/IP66 contra lluvia, sensores de movimiento fotosensibles e iluminación solar autónoma.',
    medidas: [
      { modelo: 'Reflectores LED (10W a 500W)', temperatura: 'Luz Blanca de Alto Flujo', usoComun: 'Jardines, fachadas, estadios y bodegas' },
      { modelo: 'Luminarias Suburbana y Pública', temperatura: 'Eléctrica / Panel Solar', usoComun: 'Alumbrado exterior y banquetas' },
      { modelo: 'Arbotantes Solares Decorativos', temperatura: 'Luz Cálida / RGB con Sensor', usoComun: 'Muros exteriores sin cableado eléctrico' }
    ]
  }
]

// 2. Sub-Pestañas de Categorías
const categoriasIluminacion = [
  { id: 'focos-varios', nombre: 'Focos LED y Especiales' },
  { id: 'spots-bases', nombre: 'Spots y Dirigibles' },
  { id: 'plafones-sobreponer', nombre: 'Plafones y Lámparas' },
  { id: 'arbotantes-muro', nombre: 'Arbotantes de Pared' },
  { id: 'reflectores-solares', nombre: 'Reflectores y Solar' }
]

// 3. Tarjetas Interactivas de Productos
const accesorios = [
  // --- CATEGORÍA 1: FOCOS ---
  {
    id: 1,
    categoriaId: 'focos-varios',
    nombre: 'Focos LED Omnidireccionales (1W a 100W)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/focos.jpg',
    descripcion: 'Focos de alta eficiencia LED con socket estándar E26. Disponibles en potencias desde focos luz de noche (1W) hasta alta potencia (100W).',
    medidas: '1W, 5W, 9W, 12W, 15W, 20W, 50W, 100W (E26)',
    material: 'Luz Cálida (3000K) y Luz Fría (6500K)'
  },
  {
    id: 2,
    categoriaId: 'focos-varios',
    nombre: 'Focos Vintage / Filamento y Vela',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/bintage.jpg',
    descripcion: 'Focos estéticos estilo Edison con filamento LED visible y tipo vela para candiles, arbotantes y ambientes cálidos.',
    medidas: 'Entradas E26 y E12 (Tipo Globo, Pera, Vela)',
    material: 'Luz Cálida Ámbar (2200K - 2700K)'
  },
  {
    id: 3,
    categoriaId: 'focos-varios',
    nombre: 'Focos Especiales (Refrigerador / Colores 40W)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/focos-colores.jpg',
    descripcion: 'Focos incandescendentes compactos para altas/bajas temperaturas (refrigeradores) y focos decorativos de colores (Rojo, Azul, Verde, Amarillo).',
    medidas: 'Rosca E26 y E12 / 15W a 40W Incandescente',
    material: 'Vidrio Reforzado / Colores Puros'
  },

  // --- CATEGORÍA 2: SPOTS ---
  {
    id: 4,
    categoriaId: 'spots-bases',
    nombre: 'Spots Empotrables (Redondos / Cuadrados)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/spot.jpg',
    descripcion: 'Luminarias ultrafinas para perforación en falso bote o tablaroca con pestañas de sujeción a presión.',
    medidas: '3W, 6W, 9W, 12W, 18W y 24W (Redondo / Cuadrado)',
    material: 'Luz Fría, Cálida y Modelos Dimeables'
  },
  {
    id: 5,
    categoriaId: 'spots-bases',
    nombre: 'Spots de Sobreponer (Redondos / Cuadrados)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/sobreponer.jpg',
    descripcion: 'Spot LED con base metálica para fijar directamente a la losa o muro sin necesidad de perforación.',
    medidas: '6W, 12W, 18W y 24W (Redondo / Cuadrado)',
    material: 'Chasis de Aluminio Blanco y Negro'
  },
  {
    id: 6,
    categoriaId: 'spots-bases',
    nombre: 'Bases y Sockets para MR16 / GUI10',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/mr16-gui10.jpg',
    descripcion: 'Luminarias dirigibles (Escarabajos/Canopeas) y sockets para focos dicroicos MR16 y GUI10 acentuados.',
    medidas: 'Sencillo, Doble y Triple dirigible',
    material: 'Soporte Metálico / Base Cerámica'
  },

  // --- CATEGORÍA 3: PLAFONES Y LÁMPARAS ---
  {
    id: 7,
    categoriaId: 'plafones-sobreponer',
    nombre: 'Plafones LED de Sobreponer (12W a 32W)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/plafones.jpg',
    descripcion: 'Lámparas de techo decorativas de gran difusor de luz uniforme, ideales para iluminación central en cocinas, salas y recámaras.',
    medidas: '12W, 18W, 24W y 32W (Diseños Modernos)',
    material: 'Acrílico Translucido / Marco de Aluminio'
  },
  {
    id: 8,
    categoriaId: 'plafones-sobreponer',
    nombre: 'Lámparas Lineales y Gabinetes LED',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/lamparas-lineales.png',
    descripcion: 'Luminarias alargadas tipo regleta o gabinete estanco para pasillos, comercios, talleres y cocheras.',
    medidas: 'Slim 18W, 36W y 72W (60cm y 120cm)',
    material: 'Luz Blanca Brillante (6500K)'
  },

  // --- CATEGORÍA 4: ARBOTANTES DE MURO ---
  {
    id: 9,
    categoriaId: 'arbotantes-muro',
    nombre: 'Arbotantes Muro Interior / Exterior',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/arbotante1.jpg',
    descripcion: 'Luminarias de pared decorativas con emisión de luz bidireccional (Up & Down), ideales para fachadas, pasillos y jardines.',
    medidas: 'Modelos con LED Integrado (6W - 12W) o Socket GUI10',
    material: 'Aluminio Estanco / Vidrio Templado (IP65)'
  },
  {
    id: 10,
    categoriaId: 'arbotantes-muro',
    nombre: 'Lámparas de Muro Residenciales',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/arbotante2.jpg',
    descripcion: 'Faroles decorativos y apliques de pared contemporáneos para iluminar accesos, terrazas y cabeceras.',
    medidas: 'Entradas E26 para foco LED intercambiable',
    material: 'Acero Inoxidable / Hierro / Policarbonato'
  },

  // --- CATEGORÍA 5: REFLECTORES Y SOLAR ---
  {
    id: 11,
    categoriaId: 'reflectores-solares',
    nombre: 'Reflectores LED de Alta Potencia',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/reflectores.jpg',
    descripcion: 'Reflectores extra planos de luz blanca intensa para exterior con carcasa de disipación de calor.',
    medidas: '10W, 30W, 50W, 100W, 200W, 300W y 500W',
    material: 'Cuerpo de Aluminio Fundido / IP66'
  },
  {
    id: 12,
    categoriaId: 'reflectores-solares',
    nombre: 'Luminarias Suburbana Eléctrica y Solar',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/suburbanas.jpg',
    descripcion: 'Lámparas tipo alumbrado público. Opción eléctrica directa y opción solar autónoma con panel, batería y fotocelda integrada.',
    medidas: '100W, 200W, 300W, 600W (Incluyen brazo de montaje)',
    material: 'Sensor de Movimiento / Control Remoto'
  },
  {
    id: 13,
    categoriaId: 'reflectores-solares',
    nombre: 'Arbotantes y Estacas Solares Decorativas',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/solares.jpg',
    descripcion: 'Luces solares decorativas para jardines, muros exteriores y senderos que cargan de día y encienden automáticamente de noche.',
    medidas: 'Estacas de piso y Arbotantes de pared sin cables',
    material: 'Luz Cálida y Luz RGB Multicolor (IP65)'
  }
]

export default function IluminacionPage() {
  const [tipoActivo, setTipoActivo] = useState(tiposIluminacion[0].id)
  const [catAccesorioActiva, setCatAccesorioActiva] = useState(categoriasIluminacion[0].id)
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({})

  const toggleFlip = (id: number) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const tipoSeleccionado = tiposIluminacion.find(t => t.id === tipoActivo) || tiposIluminacion[0]
  const accesoriosFiltrados = accesorios.filter(a => a.categoriaId === catAccesorioActiva)

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* ENCABEZADO */}
        <div className="mb-8">
          <Link href="/" className="text-orange-500 hover:text-orange-600 font-bold text-sm flex items-center gap-1 mb-2">
            &larr; Volver al Inicio
          </Link>
          <h1 className="text-3xl sm:text-5xl font-black text-blue-900 tracking-tight">
            Iluminación LED, Decorativa y Solar
          </h1>
          <p className="text-gray-600 text-base sm:text-lg mt-2">
            Focos, spots, plafones, arbotantes, reflectores industriales y tecnología de alumbrado solar.
          </p>
        </div>

        {/* MUESTRARIO DESTACADO */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 items-center">
          <div className="lg:col-span-5 bg-gray-50 rounded-2xl p-4 flex items-center justify-center border border-gray-200">
            <div className="relative w-full h-[320px] sm:h-[380px] flex items-center justify-center">
              <Image 
                src="https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/iluminacion.jpg"
                alt="Muestrario de Iluminación Eléctrica y Solar"
                fill={true}
                className="object-contain p-2"
                priority={true}
                unoptimized={true}
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Ahorro de Energía y Eficiencia
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900">
              Soluciones Luminosas Residenciales, Comerciales y Exteriores
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Disponemos de la más amplia variedad de tecnología LED. Desde focos domésticos y spots arquitectónicos empotrables hasta sistemas solares autónomos sin consumo de red eléctrica.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 text-sm mb-1">✓ Múltiples Temperaturas</h3>
                <p className="text-xs text-gray-600">Luz Fría (6500K), Luz Cálida (3000K), Dimeables y focos de color.</p>
              </div>
              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                <h3 className="font-bold text-blue-900 text-sm mb-1">✓ Tecnología Solar Autónoma</h3>
                <p className="text-xs text-gray-600">Reflectores y suburbana con panel solar y sensor de presencia.</p>
              </div>
            </div>
          </div>
        </div>

        {/* TABLA GUÍA TÉCNICA */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-10 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900">
              Guía de Selección de Iluminación
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Consulta las características de luz y aplicaciones recomendadas.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
            {tiposIluminacion.map((tipo) => (
              <button
                key={tipo.id}
                onClick={() => setTipoActivo(tipo.id)}
                className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm ${
                  tipoActivo === tipo.id 
                    ? 'bg-blue-900 text-white shadow-md scale-105' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tipo.nombre}
              </button>
            ))}
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-orange-500 uppercase tracking-wider block mb-1">Uso Recomendado</span>
                <p className="text-sm text-gray-800 font-medium">{tipoSeleccionado.uso}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block mb-1">Norma y Especificación</span>
                <p className="text-sm text-gray-800 font-medium">{tipoSeleccionado.norma}</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-blue-950 text-white text-xs uppercase">
                <tr>
                  <th className="py-3.5 px-4 font-extrabold">Modelo / Tipo</th>
                  <th className="py-3.5 px-4 font-extrabold">Tono de Luz / Características</th>
                  <th className="py-3.5 px-4 font-extrabold">Aplicación Típica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {tipoSeleccionado.medidas.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-900">{item.modelo}</td>
                    <td className="py-3.5 px-4 font-bold text-orange-600">{item.temperatura}</td>
                    <td className="py-3.5 px-4 text-gray-800">{item.usoComun}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TARJETAS INTERACTIVAS CON FORMATO PROPORCIONAL Y MAYOR ÁREA PARA IMAGEN */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Catálogo de Iluminación
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-blue-900 mt-3">
              Modelos y Accesorios Luminosos
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Haz clic sobre la tarjeta para consultar potencias, entradas y especificaciones de luz.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
            {categoriasIluminacion.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCatAccesorioActiva(cat.id)}
                className={`px-4 py-2.5 rounded-lg font-extrabold text-xs sm:text-sm transition-all ${
                  catAccesorioActiva === cat.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white text-blue-900 hover:bg-orange-100 border border-gray-200'
                }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {accesoriosFiltrados.map((item) => {
              const isFlipped = flippedCards[item.id] || false;
              return (
                <div 
                  key={item.id}
                  onClick={() => toggleFlip(item.id)}
                  className="h-[420px] w-full cursor-pointer [perspective:1000px] group"
                >
                  <div className={`relative h-full w-full rounded-2xl shadow-md transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                    
                    {/* FRENTE OPTIMIZADO PARA IMÁGENES 1024x1024 (1:1) */}
                    <div className="absolute inset-0 h-full w-full rounded-2xl bg-white p-4 border border-gray-200 [backface-visibility:hidden] flex flex-col items-center justify-between">
                      <div className="w-full aspect-square bg-gray-50 rounded-xl relative overflow-hidden border border-gray-100 flex items-center justify-center p-2">
                        <Image 
                          src={item.imagen} 
                          alt={item.nombre} 
                          fill={true} 
                          className="object-contain p-1" 
                          unoptimized={true}
                        />
                      </div>
                      <div className="text-center my-auto px-1">
                        <h3 className="text-base font-extrabold text-blue-900 group-hover:text-orange-500 transition-colors line-clamp-2">
                          {item.nombre}
                        </h3>
                        <p className="text-[11px] text-gray-500 mt-1">Haz clic para ver ficha 🔄</p>
                      </div>
                    </div>

                    {/* REVERSO */}
                    <div className="absolute inset-0 h-full w-full rounded-2xl bg-blue-950 p-6 text-white [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-between border-2 border-orange-500">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Ficha Técnica</span>
                          <span className="text-xs text-gray-400">🔄 Volver</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{item.nombre}</h3>
                        <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                          {item.descripcion}
                        </p>
                      </div>

                      <div className="border-t border-blue-900 pt-3 space-y-2">
                        <div>
                          <span className="text-[10px] uppercase text-gray-400 block">Potencias / Formatos:</span>
                          <span className="text-xs font-bold text-orange-400">{item.medidas}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-gray-400 block">Especificaciones de Luz:</span>
                          <span className="text-xs font-bold text-gray-200">{item.material}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* COTIZADOR */}
        <div className="bg-gradient-to-r from-blue-950 to-blue-900 rounded-3xl p-8 sm:p-12 text-center text-white border-b-8 border-orange-500">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">¿Necesitas proyectos de iluminación o alumbrado solar?</h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto mb-6">
            Cotizamos reflectores de alta potencia, alumbrado público suburbano y proyectos de iluminación comercial por volumen.
          </p>
          <Link 
            href="/contacto" 
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl text-sm"
          >
            Solicitar Cotización de Iluminación
          </Link>
        </div>

      </div>
    </div>
  )
}