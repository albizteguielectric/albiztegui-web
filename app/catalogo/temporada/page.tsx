'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// 1. Datos para la Guía Técnica de Artículos de Temporada
const tiposTemporada = [
  {
    id: 'ventilacion-verano',
    nombre: 'Ventilación y Verano',
    uso: 'Manejo de flujo de aire y refrescamiento ambiental para temporadas de calor.',
    norma: 'Motores de bajo consumo energético, silenciosos y controles de velocidad integrados.',
    medidas: [
      { modelo: 'Ventiladores de Techo (Luz y Control)', capacidad: '36" a 56" (3, 4 y 5 aspas)', usoComun: 'Salas, comedores y recámaras' },
      { modelo: 'Ventiladores de Piso y Pedestal', capacidad: '16" a 20" (3 velocidades)', usoComun: 'Oficinas, talleres y uso doméstico portátil' },
      { modelo: 'Ventiladores de Torre Oscilantes', capacidad: '30" a 42" con temporizador', usoComun: 'Espacios reducidos y dormitorios' }
    ]
  },
  {
    id: 'calefaccion-invierno',
    nombre: 'Calefacción y Invierno',
    uso: 'Elevación de temperatura y confort térmico durante la época de frío.',
    norma: 'Sistemas de seguridad contra sobrecalentamiento y sensores de caída automática.',
    medidas: [
      { modelo: 'Calentones Eléctricos Cuarzo / Cerámicos', capacidad: '800W a 1500W (110V)', usoComun: 'Habitaciones pequeñas y medianas' },
      { modelo: 'Calefactores de Torre Oscilantes', capacidad: '1500W con termostato digital', usoComun: 'Salas y áreas de estar' },
      { modelo: 'Calentones Radiantes de Pared / Baño', capacidad: '600W a 1200W con estanqueidad', usoComun: 'Baños y pasillos' }
    ]
  },
  {
    id: 'navidad-festiva',
    nombre: 'Iluminación Navideña y Festiva',
    uso: 'Decoración luminosa interior y exterior para fin de año y eventos especiales.',
    norma: 'Tecnología LED de alta durabilidad, bajo calentamiento y conectores en serie aislados.',
    medidas: [
      { modelo: 'Series y Luces LED (Blanca / Cálida / Multicolor)', capacidad: '100 a 500 focos LED (10m a 50m)', usoComun: 'Árboles de navidad, fachadas y marcos' },
      { modelo: 'Mangueras Neón Flex y Luces de Cortina', capacidad: '10m a 25m (Protección IP65 exterior)', usoComun: 'Techos, balcones y contornos arquitectónicos' },
      { modelo: 'Proyectores y Estacas Solares / LED', capacidad: 'Efectos de figuras / Múltiples ritmos', usoComun: 'Jardines y muros exteriores' }
    ]
  },
  {
    id: 'lamparas-colgantes',
    nombre: 'Lámparas Colgantes y Decorativas',
    uso: 'Iluminación de acentuación, diseño de interiores y ambientación estilizada.',
    norma: 'Sockets estándar E26/E27 para focos Vintage Filamento o LED decorativo.',
    medidas: [
      { modelo: 'Lámparas Colgantes Industriales / Vintage', capacidad: '1 a 3 Caídas (Metal / Cable Tejido)', usoComun: 'Barras de cocina, comedores y restaurantes' },
      { modelo: 'Candelabros y Luminarias Modernas', capacidad: 'Diseños de Aro / Cristales LED', usoComun: 'Entradas principales y salas dobles alturas' },
      { modelo: 'Arbotantes Decorativos de Suspensión', capacidad: 'Bases dirigibles e interconectables', usoComun: 'Recámaras y muros de acento' }
    ]
  }
]

// 2. Sub-Pestañas de Categorías
const categoriasTemporada = [
  { id: 'ventilacion', nombre: 'Ventiladores de Techo y Piso' },
  { id: 'calefaccion', nombre: 'Calentones Eléctricos' },
  { id: 'luces-navidad', nombre: 'Luces Navideñas y Festivas' },
  { id: 'colgantes-techos', nombre: 'Lámparas Colgantes' }
]

// 3. Tarjetas Interactivas de Productos
const accesorios = [
  // --- CATEGORÍA 1: VENTILACIÓN ---
  {
    id: 1,
    categoriaId: 'ventilacion',
    nombre: 'Ventiladores de Techo con Luz y Control Remoto',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/ventilador-techo.jpg',
    descripcion: 'Ventiladores estéticos de techo con kit de iluminación LED integrado, múltiples velocidades y cambio de giro verano/invierno.',
    medidas: 'Diámetros de 42", 48" y 52" (3 y 5 aspas)',
    material: 'Motor de Cobre Silencioso / Aspas de Madera o ABS'
  },
  {
    id: 2,
    categoriaId: 'ventilacion',
    nombre: 'Ventiladores de Piso, Pedestal y Torre',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/ventilador-piso.jpg',
    descripcion: 'Unidades de ventilación portátiles de alta velocidad con oscilación amplia y rejillas de seguridad.',
    medidas: 'Pedestal 18" a 20" | Torre 36" y 42"',
    material: 'Estructura Metálica y Plástico Reforzado'
  },

  // --- CATEGORÍA 2: CALEFACCIÓN ---
  {
    id: 3,
    categoriaId: 'calefaccion',
    nombre: 'Calentones Eléctricos Cerámicos y de Cuarzo',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/calenton.jpg',
    descripcion: 'Calefactores de ambiente de encendido instantáneo con termostato regulable y selector de potencia.',
    medidas: '800W, 1200W y 1500W (120V~)',
    material: 'Gabinete con Protección Anti-Vuelco'
  },

  // --- CATEGORÍA 3: LUCES NAVIDEÑAS ---
  {
    id: 4,
    categoriaId: 'luces-navidad',
    nombre: 'Series y Luces LED Navideñas (Interior / Exterior)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/series-navideñas.jpg',
    descripcion: 'Guirnaldas de luces festivas de bajo consumo energético, alta intensidad luminosa y controlador de secuencias integradas.',
    medidas: '100, 200, 300 y 500 Luces LED (Luz Cálida, Blanca y Multicolor)',
    material: 'Cable Transparente / Verde Aislado IP44'
  },
  {
    id: 5,
    categoriaId: 'luces-navidad',
    nombre: 'Mangueras Neón Flex y Cortinas de Luz',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/manguera-cortina.jpg',
    descripcion: 'Mangueras flexibles de iluminación uniforme para contornos y cortinas luminosas para fachadas y eventos.',
    medidas: 'Mangueras 10m y 25m | Cortinas 3x3m',
    material: 'Silicona Flexible Estanca (IP65 Exterior)'
  },

  // --- CATEGORÍA 4: LÁMPARAS COLGANTES ---
  {
    id: 6,
    categoriaId: 'colgantes-techos',
    nombre: 'Lámparas Colgantes Industriales y Vintage',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/lampara.jpg',
    descripcion: 'Luminarias de suspensión decorativa para techos con acabado en negro mate, latón y combinaciones de metal y cristal.',
    medidas: 'Modelos de 1, 2 y 3 Caídas (Socket E26)',
    material: 'Aluminio Fundido / Cristal Templado / Cable Tejido'
  }
]

export default function TemporadaPage() {
  const [tipoActivo, setTipoActivo] = useState(tiposTemporada[0].id)
  const [catAccesorioActiva, setCatAccesorioActiva] = useState(categoriasTemporada[0].id)
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({})

  const toggleFlip = (id: number) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const tipoSeleccionado = tiposTemporada.find(t => t.id === tipoActivo) || tiposTemporada[0]
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
            Artículos de Temporada y Decoración
          </h1>
          <p className="text-gray-600 text-base sm:text-lg mt-2">
            Ventiladores de techo, calentones eléctricos, iluminación navideña y lámparas colgantes decorativas.
          </p>
        </div>

        {/* MUESTRARIO DESTACADO */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 items-center">
          <div className="lg:col-span-5 bg-gray-50 rounded-2xl p-4 flex items-center justify-center border border-gray-200">
            <div className="relative w-full h-[320px] sm:h-[380px] flex items-center justify-center">
              <Image 
                src="https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/temporada.jpg"
                alt="Muestrario de Artículos de Temporada"
                fill={true}
                className="object-contain p-2"
                priority={true}
                unoptimized={true}
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Confort y Ambientación Todo el Año
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900">
              Equipamiento Estacional y Diseño para el Hogar
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Mantenemos disponibilidad permanente de ventilación para el verano, calefacción limpia para la temporada invernal, iluminación festiva para fin de año y lámparas de diseño para remodelaciones.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 text-sm mb-1">✓ Climatización Eléctrica</h3>
                <p className="text-xs text-gray-600">Ventiladores de bajo consumo y calentones de seguridad.</p>
              </div>
              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                <h3 className="font-bold text-blue-900 text-sm mb-1">✓ Decoración e Iluminación</h3>
                <p className="text-xs text-gray-600">Luces festivas LED y lámparas colgantes estilo vintage.</p>
              </div>
            </div>
          </div>
        </div>

        {/* TABLA GUÍA TÉCNICA */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-10 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900">
              Guía de Productos de Temporada
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Consulta las especificaciones de cada línea según la época del año.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
            {tiposTemporada.map((tipo) => (
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
                <span className="text-xs font-bold text-orange-500 uppercase tracking-wider block mb-1">Aplicación Principal</span>
                <p className="text-sm text-gray-800 font-medium">{tipoSeleccionado.uso}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block mb-1">Características de Seguridad</span>
                <p className="text-sm text-gray-800 font-medium">{tipoSeleccionado.norma}</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-blue-950 text-white text-xs uppercase">
                <tr>
                  <th className="py-3.5 px-4 font-extrabold">Producto / Modelo</th>
                  <th className="py-3.5 px-4 font-extrabold">Capacidades / Formatos</th>
                  <th className="py-3.5 px-4 font-extrabold">Uso Recomendado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {tipoSeleccionado.medidas.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-900">{item.modelo}</td>
                    <td className="py-3.5 px-4 font-bold text-orange-600">{item.capacidad}</td>
                    <td className="py-3.5 px-4 text-gray-800">{item.usoComun}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TARJETAS INTERACTIVAS */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Catálogo Estacional
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-blue-900 mt-3">
              Modelos y Opciones Disponibles
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Haz clic sobre la tarjeta para consultar características, acabados y potencias.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
            {categoriasTemporada.map((cat) => (
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
                    
                    {/* FRENTE OPTIMIZADO PARA IMÁGENES 1024x1024 */}
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
                          <span className="text-[10px] uppercase text-gray-400 block">Capacidades / Medidas:</span>
                          <span className="text-xs font-bold text-orange-400">{item.medidas}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-gray-400 block">Materiales / Especificación:</span>
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
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">¿Buscas pedidos por volumen de luces navideñas o ventilación?</h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto mb-6">
            Ofrecemos atención a proyectos comerciales, contratos de iluminación festiva e importación directa para mayoristas.
          </p>
          <Link 
            href="/contacto" 
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl text-sm"
          >
            Solicitar Cotización de Temporada
          </Link>
        </div>

      </div>
    </div>
  )
}